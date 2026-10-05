import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db, rateLimit } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  createSession,
  endSession,
  currentUser,
} from "@/lib/auth";
import { readJson, safeOrigin, errorResponse } from "@/lib/http";
const schema = z.object({
  action: z.enum(["login", "register", "logout"]),
  email: z.email().max(200).optional(),
  password: z
    .string()
    .min(10, "Пароль должен содержать минимум 10 символов")
    .max(128)
    .optional(),
  name: z.string().trim().min(2).max(100).optional(),
});
export async function GET() {
  return NextResponse.json(
    { user: await currentUser() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function POST(request: Request) {
  if (!safeOrigin(request))
    return NextResponse.json(
      { error: "Недопустимый источник запроса" },
      { status: 403 },
    );
  try {
    const input = schema.parse(await readJson(request));
    if (input.action === "logout") {
      await endSession();
      return NextResponse.json({ ok: true });
    }
    if (!input.email || !input.password)
      return NextResponse.json(
        { error: "Введите email и пароль" },
        { status: 400 },
      );
    const email = input.email.toLowerCase();
    if (!rateLimit("auth:" + email, 10, 900))
      return NextResponse.json(
        { error: "Слишком много попыток. Повторите через 15 минут." },
        { status: 429 },
      );
    if (input.action === "register") {
      if (!input.name)
        return NextResponse.json({ error: "Укажите имя" }, { status: 400 });
      if (db().prepare("SELECT id FROM users WHERE email=?").get(email))
        return NextResponse.json(
          {
            error:
              "Регистрация недоступна для этого email. Войдите в существующий аккаунт.",
          },
          { status: 409 },
        );
      const id = randomUUID();
      db()
        .prepare(
          "INSERT INTO users(id,email,name,password,created_at) VALUES(?,?,?,?,?)",
        )
        .run(
          id,
          email,
          input.name,
          hashPassword(input.password),
          new Date().toISOString(),
        );
      await createSession(id);
      return NextResponse.json({ ok: true, role: "customer" }, { status: 201 });
    }
    const user = db()
      .prepare("SELECT * FROM users WHERE email=?")
      .get(email) as { id: string; password: string; role: string } | undefined;
    // Equal-cost password derivation also runs for unknown accounts.
    const stored =
      user?.password || "00000000000000000000000000000000:" + "0".repeat(128);
    if (!verifyPassword(input.password, stored) || !user)
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 },
      );
    await createSession(user.id);
    return NextResponse.json({ ok: true, role: user.role });
  } catch (error) {
    return errorResponse(error);
  }
}

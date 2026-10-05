import { NextResponse } from "next/server";
import { randomUUID, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { leadSchema } from "@/lib/validation";
import { currentUser } from "@/lib/auth";
import { db, getCatalog, transaction, rateLimit } from "@/lib/db";
import { calculate } from "@/lib/calculator";
import { errorResponse, readJson, safeOrigin } from "@/lib/http";
import { sendConfirmation, crmEvent } from "@/lib/integrations";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!safeOrigin(request))
    return NextResponse.json(
      { error: "Недопустимый источник запроса" },
      { status: 403 },
    );
  try {
    const payload = leadSchema.parse(await readJson(request));
    if (!rateLimit("quote:" + payload.email, 5, 3600))
      return NextResponse.json(
        { error: "Слишком много заявок. Попробуйте позже." },
        { status: 429 },
      );
    const catalog = getCatalog();
    if (!catalog.services.some((s) => s.id === payload.configuration.service))
      return NextResponse.json(
        { error: "Выберите существующую услугу" },
        { status: 400 },
      );
    const estimate = calculate(payload.configuration, catalog.services);
    const user = await currentUser();
    const id = randomUUID();
    const token = (await cookies()).get("precision_upload")?.value || "";
    const capability = createHash("sha256").update(token).digest("hex");
    transaction(() => {
      for (const file of payload.photos) {
        const row = db()
          .prepare(
            "SELECT * FROM uploads WHERE id=? AND capability=? AND claimed=0",
          )
          .get(file, capability);
        if (!row || (row.user_id && row.user_id !== user?.id))
          throw new Error("INVALID_UPLOAD");
        db().prepare("UPDATE uploads SET claimed=1 WHERE id=?").run(file);
      }
      db()
        .prepare(
          "INSERT INTO leads(id,user_id,payload,created_at) VALUES(?,?,?,?)",
        )
        .run(
          id,
          user?.id || null,
          JSON.stringify({ ...payload, estimate, type: "quote" }),
          new Date().toISOString(),
        );
    });
    const emailSent = await sendConfirmation(
      payload.email,
      payload.name,
      id.slice(0, 8).toUpperCase(),
      "Запрос на расчёт проекта.",
    );
    await crmEvent({ id, type: "quote", ...payload, estimate, status: "NEW" });
    return NextResponse.json({ id, estimate, emailSent }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_UPLOAD")
      return NextResponse.json(
        {
          error:
            "Загрузите фотографии повторно. Они недоступны для этой заявки.",
        },
        { status: 400 },
      );
    return errorResponse(error);
  }
}

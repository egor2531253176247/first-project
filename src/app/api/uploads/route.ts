import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID, randomBytes, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { currentUser } from "@/lib/auth";
import { join } from "node:path";
import sharp from "sharp";
import { dataDirectory, rateLimit, db } from "@/lib/db";
import { safeOrigin, readForm } from "@/lib/http";
export async function POST(request: Request) {
  if (!safeOrigin(request))
    return NextResponse.json(
      { error: "Недопустимый источник" },
      { status: 403 },
    );
  if (Number(request.headers.get("content-length") || 0) > 30000000)
    return NextResponse.json(
      { error: "Фотографии слишком большие" },
      { status: 413 },
    );
  if (
    !rateLimit(
      "uploads:" +
        (request.headers.get("x-forwarded-for")?.split(",")[0] || "local"),
      30,
      3600,
    )
  )
    return NextResponse.json(
      { error: "Лимит загрузки. Попробуйте позже." },
      { status: 429 },
    );
  try {
    const form = await readForm(request, 30000000);
    const files = form.getAll("photos");
    if (!files.length || files.length > 5)
      return NextResponse.json(
        { error: "Выберите от 1 до 5 фотографий" },
        { status: 400 },
      );
    const directory = join(dataDirectory(), "uploads");
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const prepared: { id: string; buffer: Buffer }[] = [];
    for (const file of files) {
      if (
        !(file instanceof File) ||
        file.size > 5000000 ||
        !["image/jpeg", "image/png", "image/webp"].includes(file.type)
      )
        return NextResponse.json(
          { error: "JPG, PNG или WebP, не более 5 МБ на фото" },
          { status: 400 },
        );
      const buffer = Buffer.from(await file.arrayBuffer());
      const output = await sharp(buffer, { limitInputPixels: 24000000 })
        .rotate()
        .resize({
          width: 2000,
          height: 2000,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();
      prepared.push({ id: randomUUID() + ".webp", buffer: output });
    }
    const jar = await cookies();
    const user = await currentUser();
    const token =
      jar.get("precision_upload")?.value || randomBytes(32).toString("hex");
    const capability = createHash("sha256").update(token).digest("hex");
    for (const photo of prepared) {
      await writeFile(join(directory, photo.id), photo.buffer, { mode: 0o600 });
      db()
        .prepare(
          "INSERT INTO uploads(id,capability,user_id,created_at) VALUES(?,?,?,?)",
        )
        .run(photo.id, capability, user?.id || null, new Date().toISOString());
    }
    jar.set("precision_upload", token, {
      httpOnly: true,
      sameSite: "lax",
      secure:
        process.env.NODE_ENV === "production" &&
        process.env.STUDIO_COOKIE_SECURE !== "false",
      path: "/",
      maxAge: 86400,
    });
    return NextResponse.json(
      { files: prepared.map((x) => x.id) },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Не удалось обработать фото. Проверьте формат файла." },
      { status: 400 },
    );
  }
}

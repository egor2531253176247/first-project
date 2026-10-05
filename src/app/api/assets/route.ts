import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { currentUser } from "@/lib/auth";
import { dataDirectory } from "@/lib/db";
import { safeOrigin, readForm } from "@/lib/http";
export async function POST(request: Request) {
  const user = await currentUser();
  if (user?.role !== "admin" || !safeOrigin(request))
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  try {
    if (Number(request.headers.get("content-length") || 0) > 12000000)
      return NextResponse.json({ error: "Фото до 10 МБ" }, { status: 413 });
    const form = await readForm(request, 12000000);
    const file = form.get("image");
    if (
      !(file instanceof File) ||
      file.size > 10000000 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      return NextResponse.json(
        { error: "JPG, PNG или WebP до 10 МБ" },
        { status: 400 },
      );
    const buffer = await sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 40000000,
    })
      .rotate()
      .resize({
        width: 2000,
        height: 2000,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
    const folder = join(dataDirectory(), "assets");
    await mkdir(folder, { recursive: true, mode: 0o700 });
    const id = randomUUID() + ".webp";
    await writeFile(join(folder, id), buffer);
    return NextResponse.json({ src: "/api/assets/" + id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Не удалось обработать фото" },
      { status: 400 },
    );
  }
}

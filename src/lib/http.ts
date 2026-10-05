import { NextResponse } from "next/server";
import { ZodError } from "zod";
export function safeOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowed = new URL(process.env.STUDIO_URL || request.url).origin;
  return !origin || origin === allowed;
}
export function errorResponse(error: unknown) {
  if (error instanceof SyntaxError)
    return NextResponse.json(
      { error: "Некорректный формат запроса" },
      { status: 400 },
    );
  if (error instanceof Error && error.message === "Payload too large")
    return NextResponse.json(
      { error: "Запрос превышает допустимый размер" },
      { status: 413 },
    );
  if (error instanceof ZodError)
    return NextResponse.json(
      {
        error: error.issues[0]?.message || "Проверьте поля формы",
        fields: error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  return NextResponse.json(
    { error: "Не удалось выполнить запрос. Попробуйте позже." },
    { status: 500 },
  );
}
async function readBytes(request: Request, maxBytes: number) {
  if (Number(request.headers.get("content-length") || 0) > maxBytes)
    throw new Error("Payload too large");
  if (!request.body) return Buffer.alloc(0);
  const reader = request.body.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new Error("Payload too large");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
export async function readJson(request: Request) {
  return JSON.parse((await readBytes(request, 64000)).toString("utf8"));
}
export async function readForm(request: Request, maxBytes: number) {
  const bytes = await readBytes(request, maxBytes);
  return new Response(new Uint8Array(bytes), {
    headers: { "Content-Type": request.headers.get("content-type") || "" },
  }).formData();
}

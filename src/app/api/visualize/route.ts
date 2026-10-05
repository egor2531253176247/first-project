import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/db";
import { safeOrigin, readForm } from "@/lib/http";
import { colors } from "@/lib/catalog";
export async function GET() {
  return NextResponse.json({ available: !!process.env.STUDIO_AI_KEY });
}
export async function POST(request: Request) {
  if (!safeOrigin(request))
    return NextResponse.json(
      { error: "Недопустимый источник" },
      { status: 403 },
    );
  if (!process.env.STUDIO_AI_KEY)
    return NextResponse.json(
      {
        error:
          "AI-визуализация пока недоступна. Используйте цветовую концепцию в конфигураторе.",
      },
      { status: 503 },
    );
  const user = await currentUser();
  if (!user)
    return NextResponse.json(
      { error: "Войдите в кабинет для AI-визуализации." },
      { status: 401 },
    );
  if (!rateLimit("ai:" + user.id, 3, 86400))
    return NextResponse.json(
      { error: "Доступно три AI-концепции в сутки." },
      { status: 429 },
    );
  try {
    if (Number(request.headers.get("content-length") || 0) > 6000000)
      return NextResponse.json(
        { error: "Фото не более 5 МБ" },
        { status: 413 },
      );
    const input = await readForm(request, 6000000);
    const image = input.get("image");
    const color = colors.find((c) => c.id === input.get("color"));
    const finish = String(input.get("finish"));
    const style = String(input.get("style"));
    if (
      !(image instanceof File) ||
      image.size > 5000000 ||
      !["image/jpeg", "image/png", "image/webp"].includes(image.type) ||
      !color ||
      ![
        "Gloss",
        "Satin",
        "Matte",
        "Metallic",
        "Color shift",
        "Carbon",
      ].includes(finish) ||
      !["OEM+", "Track", "Minimal"].includes(style)
    )
      return NextResponse.json(
        { error: "Проверьте фото и параметры." },
        { status: 400 },
      );
    const form = new FormData();
    form.set("model", process.env.STUDIO_AI_MODEL || "gpt-image-1");
    form.set("image", image);
    form.set("size", "1024x1024");
    form.set("n", "1");
    form.set(
      "prompt",
      `Create a photorealistic automotive wrap concept. Preserve the uploaded car model, its exact proportions, wheels and scene. Change only painted body panels to ${color.name} (${color.hex}), ${finish} finish. Design style ${style}. Keep windows, lights and tires unchanged. No text. This is a visualization, not an exact color sample.`,
    );
    const response = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.STUDIO_AI_KEY}` },
      body: form,
      signal: AbortSignal.timeout(120000),
    });
    if (!response.ok)
      return NextResponse.json(
        {
          error:
            "AI-сервис не выполнил запрос. Проверьте подключение или повторите позже.",
        },
        { status: 502 },
      );
    const result = await response.json();
    const content = result.data?.[0]?.b64_json;
    if (!content)
      return NextResponse.json(
        { error: "Не получено изображение от AI-сервиса." },
        { status: 502 },
      );
    return NextResponse.json({ image: "data:image/png;base64," + content });
  } catch {
    return NextResponse.json(
      { error: "Не удалось создать концепцию. Повторите позже." },
      { status: 502 },
    );
  }
}

import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { currentUser } from "@/lib/auth";
import { db, transaction, getCatalog, rateLimit } from "@/lib/db";
import { bookingSchema } from "@/lib/validation";
import { validBookingDate, bookingTimes, calculate } from "@/lib/calculator";
import { readJson, safeOrigin, errorResponse } from "@/lib/http";
import { sendConfirmation, crmEvent } from "@/lib/integrations";
export async function GET(request: Request) {
  const date = new URL(request.url).searchParams.get("date") || "";
  if (!validBookingDate(date))
    return NextResponse.json({
      slots: [],
      error: "Выберите рабочий день со следующего дня, не далее 60 дней.",
    });
  const booked = db()
    .prepare("SELECT time FROM bookings WHERE date=? AND status!='CANCELLED'")
    .all(date)
    .map((x) => x.time);
  return NextResponse.json({
    slots: bookingTimes.filter((time) => !booked.includes(time)),
  });
}
export async function POST(request: Request) {
  if (!safeOrigin(request))
    return NextResponse.json(
      { error: "Недопустимый источник запроса" },
      { status: 403 },
    );
  try {
    const payload = bookingSchema.parse(await readJson(request));
    if (payload.photos.length)
      return NextResponse.json(
        { error: "Фото отправляются через форму расчёта проекта" },
        { status: 400 },
      );
    if (!validBookingDate(payload.date))
      return NextResponse.json(
        { error: "Выберите доступный рабочий день." },
        { status: 400 },
      );
    if (!rateLimit("booking:" + payload.email, 5, 3600))
      return NextResponse.json(
        { error: "Слишком много записей. Попробуйте позже." },
        { status: 429 },
      );
    const user = await currentUser();
    const id = randomUUID();
    const bookingId = randomUUID();
    const catalog = getCatalog();
    if (!catalog.services.some((s) => s.id === payload.configuration.service))
      return NextResponse.json(
        { error: "Выберите существующую услугу" },
        { status: 400 },
      );
    const estimate = calculate(payload.configuration, catalog.services);
    transaction(() => {
      const occupied = db()
        .prepare(
          "SELECT id FROM bookings WHERE date=? AND time=? AND status!='CANCELLED'",
        )
        .get(payload.date, payload.time);
      if (occupied) throw new Error("SLOT_TAKEN");
      db()
        .prepare(
          "INSERT INTO leads(id,user_id,payload,status,created_at) VALUES(?,?,?,'BOOKED',?)",
        )
        .run(
          id,
          user?.id || null,
          JSON.stringify({ ...payload, estimate, type: "booking" }),
          new Date().toISOString(),
        );
      db()
        .prepare("INSERT INTO bookings(id,lead_id,date,time) VALUES(?,?,?,?)")
        .run(bookingId, id, payload.date, payload.time);
    });
    const emailSent = await sendConfirmation(
      payload.email,
      payload.name,
      bookingId.slice(0, 8).toUpperCase(),
      `Визит: ${payload.date}, ${payload.time} (Москва, UTC+3).`,
    );
    await crmEvent({
      id,
      bookingId,
      type: "booking",
      ...payload,
      estimate,
      status: "BOOKED",
    });
    return NextResponse.json(
      { id, bookingId, emailSent, estimate },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "SLOT_TAKEN" ||
        error.message.includes("UNIQUE constraint"))
    )
      return NextResponse.json(
        { error: "Это время уже занято. Выберите другое." },
        { status: 409 },
      );
    return errorResponse(error);
  }
}

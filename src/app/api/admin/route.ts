import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { db, getCatalog, leadsFor, saveCatalog } from "@/lib/db";
import { catalogSchema } from "@/lib/validation";
import { leadStatuses, stages } from "@/lib/catalog";
import { readJson, safeOrigin, errorResponse } from "@/lib/http";
import { crmEvent } from "@/lib/integrations";
export async function GET() {
  const user = await currentUser();
  if (user?.role !== "admin")
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  return NextResponse.json(
    {
      catalog: getCatalog(),
      leads: leadsFor(),
      bookings: db().prepare("SELECT * FROM bookings ORDER BY date,time").all(),
      clients: db()
        .prepare("SELECT id,name,email,role,created_at FROM users")
        .all(),
      events: db()
        .prepare(
          "SELECT id,kind,status,created_at FROM events ORDER BY created_at DESC LIMIT 50",
        )
        .all(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
export async function PATCH(request: Request) {
  const user = await currentUser();
  if (user?.role !== "admin" || !safeOrigin(request))
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  try {
    const input = await readJson(request);
    if (input.action === "catalog") {
      const catalog = catalogSchema.parse(input.catalog);
      saveCatalog(catalog);
      return NextResponse.json({ ok: true });
    }
    if (input.action === "lead") {
      const patch = z
        .object({
          id: z.string().uuid(),
          status: z.enum(leadStatuses as [string, ...string[]]),
          stage: z.enum(stages as [string, ...string[]]),
          invoice: z.coerce.number().min(0).max(10000000),
          warranty: z.string().max(1000),
          recommendation: z.string().max(2000),
          documents: z
            .array(
              z.object({
                title: z.string().min(1).max(100),
                content: z.string().min(1).max(10000),
              }),
            )
            .max(10),
        })
        .parse(input);
      const row = db()
        .prepare("SELECT payload FROM leads WHERE id=?")
        .get(patch.id) as { payload: string } | undefined;
      if (!row)
        return NextResponse.json(
          { error: "Заявка не найдена" },
          { status: 404 },
        );
      const payload = {
        ...JSON.parse(row.payload),
        invoice: patch.invoice,
        warranty: patch.warranty,
        recommendation: patch.recommendation,
        documents: patch.documents,
      };
      db()
        .prepare("UPDATE leads SET payload=?,status=?,stage=? WHERE id=?")
        .run(JSON.stringify(payload), patch.status, patch.stage, patch.id);
      await crmEvent({
        id: patch.id,
        status: patch.status,
        stage: patch.stage,
      });
      return NextResponse.json({ ok: true });
    }
    if (input.action === "booking") {
      const patch = z
        .object({
          id: z.string().uuid(),
          status: z.enum(["BOOKED", "CONFIRMED", "CANCELLED", "COMPLETED"]),
        })
        .parse(input);
      const result = db()
        .prepare("UPDATE bookings SET status=? WHERE id=?")
        .run(patch.status, patch.id);
      if (!Number(result.changes))
        return NextResponse.json(
          { error: "Запись не найдена" },
          { status: 404 },
        );
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json(
      { error: "Неизвестная операция" },
      { status: 400 },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed: bookings")
    )
      return NextResponse.json(
        {
          error:
            "Это время уже занято другой записью. Сначала выберите свободный слот.",
        },
        { status: 409 },
      );
    return errorResponse(error);
  }
}

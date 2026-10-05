import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET() {
  try {
    db().prepare("SELECT 1").get();
    return NextResponse.json({ status: "ok", database: "ok" });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 503 });
  }
}

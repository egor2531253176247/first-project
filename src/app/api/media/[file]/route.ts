import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { currentUser } from "@/lib/auth";
import { dataDirectory, leadsFor } from "@/lib/db";
export async function GET(
  _: Request,
  context: { params: Promise<{ file: string }> },
) {
  const user = await currentUser();
  if (!user) return new NextResponse(null, { status: 401 });
  const { file } = await context.params;
  if (!/^[a-f0-9-]{36}\.webp$/.test(file))
    return new NextResponse(null, { status: 404 });
  const owned =
    user.role === "admin" ||
    leadsFor(user.id).some(
      (lead) =>
        Array.isArray(lead.payload.photos) &&
        lead.payload.photos.includes(file),
    );
  if (!owned) return new NextResponse(null, { status: 403 });
  try {
    return new NextResponse(
      await readFile(join(dataDirectory(), "uploads", file)),
      {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "private, no-store",
        },
      },
    );
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}

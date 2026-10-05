import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { dataDirectory } from "@/lib/db";
export async function GET(
  _: Request,
  context: { params: Promise<{ file: string }> },
) {
  const { file } = await context.params;
  if (!/^[a-f0-9-]{36}\.webp$/.test(file))
    return new NextResponse(null, { status: 404 });
  try {
    return new NextResponse(
      await readFile(join(dataDirectory(), "assets", file)),
      {
        headers: {
          "Content-Type": "image/webp",
          "Cache-Control": "public,max-age=31536000,immutable",
        },
      },
    );
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}

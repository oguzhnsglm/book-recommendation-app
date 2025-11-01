import { NextResponse } from "next/server";
import { runRecommend } from "@/lib/runPython";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const book = searchParams.get("book") || "";
  const top = searchParams.get("top") || "10";
  if (!book) return NextResponse.json({ error: "'book' gerekli" }, { status: 400 });
  try {
    const data = await runRecommend(["--book", book, "--top", String(top)]);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e?.message || e) }, { status: 500 });
  }
}


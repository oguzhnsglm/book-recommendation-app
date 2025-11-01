import { NextResponse } from "next/server";
import { runRecommend } from "@/lib/runPython";

export async function GET() {
  try {
    const data = await runRecommend(["--list-books"]);
    if (!Array.isArray(data)) return NextResponse.json([], { status: 200 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json([], { status: 200 });
  }
}


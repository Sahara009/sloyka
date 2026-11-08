import { NextResponse } from "next/server";
import { cdekConfigured, cdekPoints } from "@/lib/integrations/delivery";

/** Пункты выдачи СДЭК в городе: /api/delivery/points?city=44 (код города СДЭК) */
export async function GET(req: Request) {
  const code = Number(new URL(req.url).searchParams.get("city"));
  if (!Number.isInteger(code) || code <= 0) return NextResponse.json({ error: "Нет кода города" }, { status: 400 });
  if (!cdekConfigured()) return NextResponse.json({ points: [] });
  try {
    return NextResponse.json({ points: await cdekPoints(code) });
  } catch (e) {
    console.warn("[delivery] пункты:", e instanceof Error ? e.message : e);
    return NextResponse.json({ points: [], error: "СДЭК сейчас не отвечает" }, { status: 502 });
  }
}

import { NextResponse } from "next/server";
import { cdekCities, cdekConfigured } from "@/lib/integrations/delivery";

/** Подсказки городов СДЭК для корзины: /api/delivery/cities?q=Моск */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  if (!cdekConfigured()) return NextResponse.json({ cities: [], configured: false });
  try {
    return NextResponse.json({ cities: await cdekCities(q.slice(0, 60)), configured: true });
  } catch (e) {
    console.warn("[delivery] города:", e instanceof Error ? e.message : e);
    return NextResponse.json({ cities: [], configured: true, error: "СДЭК сейчас не отвечает" }, { status: 502 });
  }
}

import { NextResponse } from "next/server";
import { matchProduct } from "@/lib/search";
import { getProducts } from "@/lib/server/catalog";

/** Поиск по каталогу для строки поиска в шапке: GET /api/search?q=fleur */
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").slice(0, 80);
  if (q.trim().length < 2) return NextResponse.json({ items: [] });
  const items = (await getProducts())
    .filter((p) => matchProduct(p, q))
    .slice(0, 8)
    .map((p) => ({ slug: p.slug, name: p.name, short: p.short, price: p.price, image: p.image ?? null }));
  return NextResponse.json({ items });
}

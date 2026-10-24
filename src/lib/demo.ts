/*
 * Демо-режим для GitHub Pages (NEXT_PUBLIC_DEMO=1): сервера нет, поэтому поиск и расчёт доставки
 * считаются прямо в браузере, а заявки и заказы никуда не уходят — показываем «как это будет».
 */
import { products } from "@/data/products";
import { matchProduct } from "@/lib/search";
import { marketplaceRange, pack } from "@/lib/shipping";

export const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

export function demoSearch(q: string) {
  if (q.trim().length < 2) return [];
  return products
    .filter((p) => matchProduct(p, q))
    .slice(0, 8)
    .map((p) => ({ slug: p.slug, name: p.name, short: p.short, price: p.price, image: p.image ?? null }));
}

type Ref = { kind: string; slug?: string };

export function demoQuote(city: string, items: { qty: number; ref?: Ref }[]) {
  const withKind = items.map((i) => ({
    qty: i.qty,
    ref: i.ref as never,
    kind: i.ref?.kind === "product" ? products.find((p) => p.slug === i.ref?.slug)?.kind : undefined,
  }));
  const packing = pack(withKind);
  const ozon = marketplaceRange("ozon", city, packing);
  const wb = marketplaceRange("wb", city, packing);
  const r = (n: number) => Math.round((n * 1.3) / 10) * 10;
  return {
    zone: ozon.zone,
    weight: packing.weight,
    boxes: packing.boxes.map((b) => ({ id: b.box.id, name: b.box.name, size: `${b.box.length}×${b.box.width}×${b.box.height} см`, weight: b.weight })),
    options: [
      { method: "cdek-pvz", min: r(ozon.min), max: r(ozon.max), days: [ozon.days[0], ozon.days[1] + 1] as [number, number], approx: true },
      { method: "cdek-courier", min: r(ozon.min) + 250, max: r(ozon.max) + 400, days: [ozon.days[0], ozon.days[1] + 1] as [number, number], approx: true },
      { method: "ozon-pvz", min: ozon.min, max: ozon.max, days: ozon.days as [number, number], approx: true },
      { method: "wb-pvz", min: wb.min, max: wb.max, days: wb.days as [number, number], approx: true },
    ],
  };
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { cdekConfigured, cdekQuote, type DeliveryMethod } from "@/lib/integrations/delivery";
import { marketplaceRange, pack } from "@/lib/shipping";
import { getProduct } from "@/lib/server/catalog";
import { getShippingData } from "@/lib/server/shipping";

const schema = z.object({
  city: z.string().trim().min(2).max(120),
  items: z
    .array(
      z.object({
        qty: z.number().int().min(1).max(100),
        ref: z.discriminatedUnion("kind", [
          z.object({ kind: z.literal("product"), slug: z.string() }).passthrough(),
          z.object({ kind: z.literal("home"), podium: z.string(), legs: z.array(z.string()).max(2), extra: z.string().nullable().optional() }),
          z.object({ kind: z.literal("market"), base: z.string(), podiums: z.array(z.string()).max(8), crown: z.boolean() }),
        ]),
      }),
    )
    .min(1)
    .max(50),
});

export type QuoteOption = {
  method: DeliveryMethod;
  /** точная цена (СДЭК по API) */
  price?: number;
  /** или вилка «≈ от–до» */
  min?: number;
  max?: number;
  days: [number, number];
  approx: boolean;
};

/**
 * Примерная стоимость доставки для корзины.
 * 1) подбираем коробки по весу и габаритам; 2) СДЭК — по API (если есть ключи), иначе ориентир;
 * 3) Ozon и WB — вилка по зоне города от Санкт-Петербурга.
 */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Укажите город" }, { status: 400 });
  const { city, items } = parsed.data;

  const withKind = await Promise.all(
    items.map(async (i) => ({ qty: i.qty, ref: i.ref as never, kind: i.ref.kind === "product" ? (await getProduct(i.ref.slug))?.kind : undefined })),
  );
  const { boxes, zones } = await getShippingData();
  const packing = pack(withKind, boxes);
  const ozon = marketplaceRange("ozon", city, packing, zones);
  const wb = marketplaceRange("wb", city, packing, zones);

  const options: QuoteOption[] = [];
  let cdekExact = false;
  if (cdekConfigured()) {
    try {
      const q = await cdekQuote(city, packing);
      for (const o of q) options.push({ method: o.method, price: o.price, days: o.days, approx: false });
      cdekExact = q.length > 0;
    } catch (e) {
      console.warn("[delivery] СДЭК:", e instanceof Error ? e.message : e);
    }
  }
  if (!cdekExact) {
    // пока нет ключей — ориентир чуть выше Ozon
    const r = (n: number) => Math.round((n * 1.3) / 10) * 10;
    options.push({ method: "cdek-pvz", min: r(ozon.min), max: r(ozon.max), days: [ozon.days[0], ozon.days[1] + 1], approx: true });
    options.push({ method: "cdek-courier", min: r(ozon.min) + 250, max: r(ozon.max) + 400, days: [ozon.days[0], ozon.days[1] + 1], approx: true });
  }
  options.push({ method: "ozon-pvz", min: ozon.min, max: ozon.max, days: ozon.days, approx: true });
  options.push({ method: "wb-pvz", min: wb.min, max: wb.max, days: wb.days, approx: true });

  return NextResponse.json({
    zone: ozon.zone,
    weight: packing.weight,
    boxes: packing.boxes.map((b) => ({ id: b.box.id, name: b.box.name, size: `${b.box.length}×${b.box.width}×${b.box.height} см`, weight: b.weight })),
    options,
  });
}

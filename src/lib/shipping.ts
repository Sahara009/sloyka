/**
 * Упаковка заказа в коробки и примерная доставка Ozon / WB.
 * Работает и в браузере, и на сервере. Цифры берутся из src/data/shipping.ts (позже — из админки).
 */
import { boxes as defaultBoxes, kindPhysics, marketPodiumPhysics, partPhysics, productPhysics, zones, type Box, type DeliveryZone, type Physics, type Range } from "@/data/shipping";
import type { ItemRef } from "@/lib/pricing";

/** Какая доля объёма детали «nests» реально занимает место (она лежит внутри другой) */
const NEST_FACTOR = 0.25;
/** Коробку заполняем не плотнее этого — нужна пузырчатая плёнка */
const FILL = 0.7;

export type PackItem = { ref?: ItemRef; kind?: string; qty: number };
export type PackedBox = { box: Box; weight: number; volume: number };
export type Packing = { boxes: PackedBox[]; weight: number };

const vol = (p: { length: number; width: number; height: number }) => p.length * p.width * p.height;
const dims = (p: { length: number; width: number; height: number }) => [p.length, p.width, p.height].sort((a, b) => b - a);
const fits = (p: Physics, b: Box) => {
  const a = dims(p);
  const c = dims(b);
  return a[0] <= c[0] && a[1] <= c[1] && a[2] <= c[2];
};

/** Из чего физически состоит позиция корзины */
export function piecesOf(item: PackItem): Physics[] {
  const ref = item.ref;
  let one: Physics[] = [];
  if (ref?.kind === "home") {
    one = [ref.podium, ...ref.legs, ...(ref.extra ? [ref.extra] : [])].map((id) => partPhysics[id] ?? kindPhysics.part);
  } else if (ref?.kind === "market") {
    one = [partPhysics[ref.base] ?? kindPhysics.base, ...ref.podiums.map((id) => partPhysics[id] ?? marketPodiumPhysics), ...(ref.crown ? [partPhysics.crown] : [])];
  } else if (ref?.kind === "product") {
    one = [productPhysics[ref.slug] ?? kindPhysics[item.kind ?? ""] ?? kindPhysics.set];
  } else {
    one = [kindPhysics[item.kind ?? ""] ?? kindPhysics.set];
  }
  return Array.from({ length: Math.max(1, item.qty) }, () => one).flat();
}

/**
 * Подбор коробок: берём самую маленькую, куда влезают все детали; если не влезает в одну —
 * раскладываем по нескольким (крупные детали первыми). Админ потом может поменять коробку в заказе.
 */
export function pack(items: PackItem[], list: Box[] = defaultBoxes): Packing {
  const sorted = [...list].sort((a, b) => vol(a) - vol(b));
  const pieces = items.flatMap(piecesOf).sort((a, b) => vol(b) - vol(a));
  const used = (p: Physics) => vol(p) * (p.nests ? NEST_FACTOR : 1);

  const result: PackedBox[] = [];
  let rest = pieces;
  while (rest.length) {
    const volume = rest.reduce((s, p) => s + used(p), 0);
    const weight = rest.reduce((s, p) => s + p.weight, 0);
    const single = sorted.find((b) => rest.every((p) => fits(p, b)) && volume <= vol(b) * FILL && weight <= b.maxWeight);
    if (single) {
      result.push({ box: single, weight, volume });
      break;
    }
    // не влезло в одну — набиваем самую большую коробку и продолжаем с остатком
    const big = sorted[sorted.length - 1];
    let v = 0;
    let w = 0;
    const inBox: Physics[] = [];
    const left: Physics[] = [];
    for (const p of rest) {
      if (fits(p, big) && v + used(p) <= vol(big) * FILL && w + p.weight <= big.maxWeight) {
        inBox.push(p);
        v += used(p);
        w += p.weight;
      } else left.push(p);
    }
    if (!inBox.length) {
      // деталь больше любой коробки — отдельная упаковка, такое надо считать вручную
      const p = left.shift()!;
      result.push({ box: { id: "custom", name: "Нестандартная упаковка", length: p.length + 4, width: p.width + 4, height: p.height + 4, maxWeight: 30000 }, weight: p.weight, volume: vol(p) });
      rest = left;
      continue;
    }
    // последнюю коробку стараемся взять поменьше
    const smaller = sorted.find((b) => inBox.every((p) => fits(p, b)) && v <= vol(b) * FILL && w <= b.maxWeight) ?? big;
    result.push({ box: smaller, weight: w, volume: v });
    rest = left;
  }
  // вес коробки и наполнителя ≈ 10%
  for (const r of result) r.weight = Math.round(r.weight * 1.1 + 150);
  return { boxes: result, weight: result.reduce((s, b) => s + b.weight, 0) };
}

export function zoneFor(city: string, list: DeliveryZone[] = zones): DeliveryZone {
  const c = city.trim().toLowerCase().replace(/^г\.?\s*/, "");
  return list.find((z) => z.match.some((m) => c.startsWith(m) || c.includes(` ${m}`) || c.includes(m))) ?? list[list.length - 1];
}

/** Вилка Ozon / WB: сумма по коробкам */
export function marketplaceRange(service: "ozon" | "wb", city: string, packing: Packing, list?: DeliveryZone[]): { min: number; max: number; days: Range; zone: string } {
  const zone = zoneFor(city, list);
  const table = zone[service];
  let min = 0;
  let max = 0;
  for (const b of packing.boxes) {
    const r = table[b.box.id] ?? table.L;
    min += r[0];
    max += r[1];
  }
  return { min, max, days: zone.days, zone: zone.title };
}

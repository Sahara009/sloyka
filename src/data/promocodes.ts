import type { ItemRef } from "@/lib/pricing";

/*
 * Промокоды. Скидка — в рублях с каждой подходящей единицы товара, проверяется и на сервере.
 * Код сравнивается без учёта регистра и пробелов. ends — последний день действия (ГГГГ-ММ-ДД).
 *
 * NUTS.RND (заказчик, 08.11): −300 ₽ на акционный столик Fleur Nuts (2500 → 2200 ₽)
 * или на вкладыш Nuts (800 → 500 ₽). Без срока. Лимит: 1 раз на телефон / email (проверяет сервер по базе),
 * поэтому скидка — один раз на заказ: на самую дорогую подходящую позицию.
 */
export type PromoCode = {
  code: string;
  /** скидка с одной подходящей единицы, ₽ */
  amount: number;
  ends?: string;
  /** на что действует — человеческим языком, для подсказки в корзине */
  note: string;
  appliesTo: (ref: ItemRef) => boolean;
};

const isNuts = (ref: ItemRef) => ref.kind === "product" && (ref.slug === "fleur-nuts" || ref.slug === "extra-nuts");

export const promoCodes: PromoCode[] = [{ code: "NUTS.RND", amount: 300, note: "столик Fleur Nuts или вкладыш Nuts (один раз на телефон)", appliesTo: isNuts }];

const norm = (s: string) => s.trim().toUpperCase().replace(/\s+/g, "");

export function findPromoCode(input: string, now = new Date()): PromoCode | undefined {
  const c = norm(input);
  if (!c) return undefined;
  return promoCodes.find((p) => p.code && norm(p.code) === c && (!p.ends || now.getTime() <= new Date(`${p.ends}T23:59:59+03:00`).getTime()));
}

/** Применить промокод: уменьшает цену подходящих позиций, возвращает скидку */
export function applyPromoCode<T extends { ref?: ItemRef; price: number; qty: number }>(input: string, items: T[]): { items: T[]; discount: number; code?: PromoCode } {
  const code = findPromoCode(input);
  if (!code) return { items, discount: 0 };
  // одна скидка на заказ: на одну штуку самой дорогой подходящей позиции
  const idx = items.reduce((best, i, k) => (i.ref && code.appliesTo(i.ref) && (best < 0 || i.price > items[best].price) ? k : best), -1);
  if (idx < 0) return { items, discount: 0, code };
  const it = items[idx];
  const off = Math.min(code.amount, it.price);
  // позицию с несколькими штуками делим: одна со скидкой, остальные по обычной цене
  const out = items.flatMap((i, k) => (k !== idx ? [i] : i.qty > 1 ? [{ ...i, qty: 1, price: i.price - off }, { ...i, qty: i.qty - 1 }] : [{ ...i, price: i.price - off }]));
  return { items: out, discount: off, code };
}

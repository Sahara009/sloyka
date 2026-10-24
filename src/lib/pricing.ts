import { crown, homeExtras, legs, marketBases, marketPodiums, maxPodiums, podiums, stackableLegs } from "@/data/parts";
import { logoPrice, type Product } from "@/data/products";

/**
 * Что именно лежит в корзине — без цены. По этой «ссылке» сервер сам пересчитывает цену,
 * поэтому подменить стоимость в браузере не получится.
 */
export type ItemRef =
  | { kind: "product"; slug: string; option?: string; logo?: boolean }
  | { kind: "home"; podium: string; legs: string[]; extra?: string | null }
  | { kind: "market"; base: string; podiums: string[]; crown: boolean };

export class PriceError extends Error {}

/** Цена одного товара из каталога с учётом размера и логотипа */
export function productUnitPrice(p: Product, ref: Extract<ItemRef, { kind: "product" }>): number {
  if (p.price === null) throw new PriceError(`«${p.name}» — цена по запросу, оформите заявку`);
  const option = ref.option ? p.options?.find((o) => o.id === ref.option) : undefined;
  if (ref.option && !option) throw new PriceError(`У «${p.name}» нет размера ${ref.option}`);
  const base = option?.price ?? p.price;
  const logo = ref.logo && p.logoAddon && option ? logoPrice(option.label) : 0;
  return base + logo;
}

/** Цена сборки десертного столика из конструктора */
export function homeBuildPrice(ref: Extract<ItemRef, { kind: "home" }>): number {
  const podium = podiums.find((p) => p.id === ref.podium);
  if (!podium) throw new PriceError("Неизвестный подиум");
  if (ref.legs.length < 1 || ref.legs.length > 2) throw new PriceError("Нужна одна ножка или две ярусом");
  const legParts = ref.legs.map((id) => {
    const l = legs.find((x) => x.id === id);
    if (!l) throw new PriceError("Неизвестная ножка");
    return l;
  });
  if (legParts[1] && !stackableLegs.includes(legParts[1].id)) throw new PriceError("Этой ножкой нельзя сделать второй ярус");
  let total = podium.price + legParts.reduce((s, l) => s + l.price, 0);
  if (ref.extra) {
    const e = homeExtras.find((x) => x.id === ref.extra);
    if (!e || e.forPodium !== podium.id) throw new PriceError("Деталь не подходит к подиуму");
    if (e.requiresLeg && e.requiresLeg !== legParts[0].id) throw new PriceError(`${e.name} — только с ножкой ${e.requiresLeg}`);
    total += e.price;
  }
  return total;
}

/** Цена стенда Sloyka Market из конструктора */
export function marketBuildPrice(ref: Extract<ItemRef, { kind: "market" }>): number {
  const base = marketBases.find((b) => b.id === ref.base);
  if (!base) throw new PriceError("Неизвестная база");
  if (ref.podiums.length > maxPodiums(base)) throw new PriceError("Слишком много подиумов для этой базы");
  const sum = ref.podiums.reduce((s, id) => {
    const p = marketPodiums.find((x) => x.id === id);
    if (!p) throw new PriceError("Неизвестный подиум");
    return s + p.price;
  }, 0);
  return base.price + sum + (ref.crown ? crown.price : 0);
}

/** Общая точка входа. getProduct — откуда брать товар (статичные данные или база) */
export async function unitPrice(ref: ItemRef, getProduct: (slug: string) => Promise<Product | undefined>): Promise<number> {
  if (ref.kind === "home") return homeBuildPrice(ref);
  if (ref.kind === "market") return marketBuildPrice(ref);
  const p = await getProduct(ref.slug);
  if (!p) throw new PriceError("Товар не найден или снят с продажи");
  return productUnitPrice(p, ref);
}

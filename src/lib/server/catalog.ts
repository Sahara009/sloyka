import "server-only";
import type { Prisma } from "@prisma/client";
import { products as staticProducts, type Product } from "@/data/products";
import { db, hasDb } from "./db";

/*
 * Единая точка получения каталога.
 * CATALOG_SOURCE=db и подключённая база → товары из базы (их правят в админке).
 * Иначе → статичные данные из src/data/products.ts (как сейчас).
 */
const fromDb = hasDb && process.env.CATALOG_SOURCE === "db";

type Row = Prisma.ProductGetPayload<object>;

function toProduct(r: Row): Product {
  const extra = (r.extra ?? {}) as Pick<Product, "art" | "constructorPreset">;
  return {
    slug: r.slug,
    name: r.name,
    line: r.line as Product["line"],
    kind: r.kind as Product["kind"],
    price: r.price,
    short: r.short,
    description: r.description,
    specs: r.specs,
    image: r.image ?? undefined,
    gallery: r.gallery.length ? r.gallery : undefined,
    hit: r.hit,
    isNew: r.isNew,
    options: (r.options as Product["options"]) ?? undefined,
    variants: (r.variants as Product["variants"]) ?? undefined,
    colors: (r.colors as Product["colors"]) ?? undefined,
    logoAddon: r.logoAddon,
    art: extra.art,
    constructorPreset: extra.constructorPreset,
  };
}

/**
 * Правки из админки поверх товаров из файла: цена, «в продаже», «хит».
 * Хранятся в таблице Product по slug (создаются при первом сохранении в админке, seed не нужен).
 * Остальное (фото, слои, конструктор) всегда берётся из src/data/products.ts.
 */
type Override = { price: number | null; active: boolean; hit: boolean };
async function overrides(): Promise<Map<string, Override>> {
  if (!hasDb) return new Map();
  try {
    const rows = await db().product.findMany({ select: { slug: true, price: true, active: true, hit: true } });
    return new Map(rows.map((r) => [r.slug, { price: r.price, active: r.active, hit: r.hit }]));
  } catch (e) {
    console.warn("[catalog] правки из базы не прочитаны:", e instanceof Error ? e.message : e);
    return new Map();
  }
}
const applyOverride = (p: Product, o?: Override): Product =>
  o ? { ...p, price: o.price ?? p.price, hit: o.hit, hidden: p.hidden || !o.active } : p;

/** Товары для витрины; includeHidden — со скрытыми (админка, страницы по прямой ссылке) */
export async function getProducts(opts?: { includeHidden?: boolean }): Promise<Product[]> {
  if (!fromDb) {
    const ov = await overrides();
    const list = staticProducts.map((p) => applyOverride(p, ov.get(p.slug)));
    return opts?.includeHidden ? list : list.filter((p) => !p.hidden);
  }
  const rows = await db().product.findMany({ where: { active: true }, orderBy: [{ sort: "asc" }, { createdAt: "asc" }] });
  return rows.map(toProduct);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  if (!fromDb) {
    const p = staticProducts.find((x) => x.slug === slug);
    if (!p) return undefined;
    const o = (await overrides()).get(slug);
    // снят с продажи в админке — страницы и покупки нет
    if (o && !o.active) return undefined;
    return applyOverride(p, o);
  }
  const row = await db().product.findFirst({ where: { slug, active: true } });
  return row ? toProduct(row) : undefined;
}

export const catalogSource = fromDb ? "db" : "static";
/** Цены, наличие и «хит» можно править в админке, когда подключена база */
export const catalogEditable = hasDb;

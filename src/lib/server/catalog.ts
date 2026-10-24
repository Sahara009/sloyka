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

export async function getProducts(): Promise<Product[]> {
  if (!fromDb) return staticProducts;
  const rows = await db().product.findMany({ where: { active: true }, orderBy: [{ sort: "asc" }, { createdAt: "asc" }] });
  return rows.map(toProduct);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  if (!fromDb) return staticProducts.find((p) => p.slug === slug);
  const row = await db().product.findFirst({ where: { slug, active: true } });
  return row ? toProduct(row) : undefined;
}

export const catalogSource = fromDb ? "db" : "static";

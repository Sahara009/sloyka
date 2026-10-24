/**
 * Переносит каталог из src/data в базу. Запуск: npm run db:seed
 * Повторный запуск безопасен: записи обновляются по slug/id (upsert).
 */
import { PrismaClient, type Prisma } from "@prisma/client";
import { cases } from "../src/data/cases";
import { palette } from "../src/data/palette";
import { crown, homeExtras, legs, marketBases, marketPodiums, podiums } from "../src/data/parts";
import { products } from "../src/data/products";
import { boxes, partPhysics, zones } from "../src/data/shipping";
import { extraVisuals, legVisuals, marketBaseVisuals, podiumVisuals } from "../src/data/visuals";

const prisma = new PrismaClient();
const json = (v: unknown) => (v === undefined ? undefined : (v as Prisma.InputJsonValue));

async function main() {
  for (const [i, p] of products.entries()) {
    const data = {
      name: p.name,
      line: p.line,
      kind: p.kind,
      price: p.price,
      short: p.short,
      description: p.description,
      specs: p.specs,
      image: p.image ?? null,
      gallery: p.gallery ?? [],
      hit: !!p.hit,
      isNew: !!p.isNew,
      sort: i,
      options: json(p.options),
      variants: json(p.variants),
      colors: p.colors ?? null,
      logoAddon: !!p.logoAddon,
      extra: json({ art: p.art, constructorPreset: p.constructorPreset }),
    };
    await prisma.product.upsert({ where: { slug: p.slug }, create: { slug: p.slug, ...data }, update: data });
  }

  const parts: { id: string; group: string; name: string; price: number; meta?: unknown }[] = [
    ...podiums.map((p) => ({ id: p.id, group: "podium", name: p.name, price: p.price, meta: { note: p.note } })),
    ...legs.map((l) => ({ id: l.id, group: "leg", name: l.name, price: l.price, meta: { height: l.height, doubleSided: l.doubleSided } })),
    ...homeExtras.map((e) => ({ id: e.id, group: "extra", name: e.name, price: e.price, meta: { forPodium: e.forPodium, requiresLeg: e.requiresLeg } })),
    ...marketBases.map((b) => ({ id: b.id, group: "market-base", name: b.name, price: b.price, meta: { levels: b.levels, specs: b.specs } })),
    ...marketPodiums.map((p) => ({ id: p.id, group: "market-podium", name: p.name, price: p.price, meta: { group: p.group, specs: p.specs } })),
    { id: crown.id, group: "crown", name: crown.name, price: crown.price },
  ];
  for (const [i, p] of parts.entries()) {
    const v = podiumVisuals[p.id] ?? legVisuals[p.id] ?? extraVisuals[p.id] ?? marketBaseVisuals[p.id];
    const ph = partPhysics[p.id];
    const data = {
      group: p.group,
      name: p.name,
      price: p.price,
      sort: i,
      meta: json(p.meta),
      image: v?.base ?? null,
      stageWidth: v?.width ?? null,
      tuck: v?.tuck ?? null,
      weight: ph?.weight ?? null,
      length: ph?.length ?? null,
      width: ph?.width ?? null,
      height: ph?.height ?? null,
      nests: ph?.nests ?? false,
    };
    await prisma.part.upsert({ where: { id: p.id }, create: { id: p.id, ...data }, update: data });
  }

  let sort = 0;
  for (const g of palette) {
    for (const c of g.colors) {
      const data = { name: c.name, hex: c.hex, group: g.id, sort: sort++ };
      await prisma.color.upsert({ where: { id: c.id }, create: { id: c.id, ...data }, update: data });
    }
  }

  for (const [i, b] of boxes.entries()) {
    const data = { name: b.name, length: b.length, width: b.width, height: b.height, maxWeight: b.maxWeight, price: b.price ?? null, sort: i };
    await prisma.box.upsert({ where: { id: b.id }, create: { id: b.id, ...data }, update: data });
  }
  for (const [i, z] of zones.entries()) {
    const data = { title: z.title, match: z.match, daysMin: z.days[0], daysMax: z.days[1], ozon: z.ozon, wb: z.wb, sort: i };
    await prisma.deliveryZone.upsert({ where: { id: z.id }, create: { id: z.id, ...data }, update: data });
  }

  if ((await prisma.caseStudy.count()) === 0) {
    await prisma.caseStudy.createMany({ data: cases.map((c, i) => ({ ...c, id: undefined, logo: c.logo ?? null, client: c.client || null, sort: i })) });
  }

  console.log(`Готово: ${products.length} товаров, ${parts.length} деталей, ${sort} цветов`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

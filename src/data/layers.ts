import type { ColorZone, Product } from "./products";

/*
 * Рендеры-слои от заказчика (04.11): каждая деталь в белом, один кадр на товар, фон прозрачный.
 * Сайт кладёт слои друг на друга и перекрашивает каждый в выбранный цвет (components/ui/Tinted.tsx).
 * Файлы: public/products/layers/<папка>/<зона>.webp — готовит скрипт обработки (осветление, ключ по зелёному,
 * общий кадр, раскладка готовых сборок как в конструкторе).
 * order — порядок слоёв снизу вверх (что чем перекрывается).
 */

type Spec = {
  dir: string;
  zones: string[];
  order: string[];
  /** другие слои для размера (Muffin и Marble 28 и 30 см — своя форма; Penny — свой кадр на размер) */
  options?: Record<string, string>;
  /** какие зоны лежат в папках вариантов (по умолчанию — те же, что zones) */
  optionZones?: string[];
  /** превью для каталога, если своего фото нет */
  render?: string;
};

// шарики BonBon — под подиумом (выглядывают снизу из-под края), вкладыш — поверх
const legsFirst = ["leg", "leg2", "balls1", "balls2", "top", "insert"];
const fruit = ["top", "leg2", "leg", "attico"]; // фруктовница: чаша Cappottina внизу, Attico сверху

const set = (zones: string[], render = false): Omit<Spec, "dir"> => ({ zones, order: legsFirst, ...(render ? { render: "" } : {}) });

export const layerSpecs: Record<string, Spec> = {
  "classic-muffin": { dir: "muffin", zones: ["top", "leg"], order: ["leg", "top"], options: { "28": "muffin-lxl", "30": "muffin-lxl" } },
  "classic-marble": { dir: "marble", zones: ["top", "leg"], order: ["leg", "top"], options: { "28": "marble-lxl", "30": "marble-lxl" } },
  milano: { dir: "milano", zones: ["lid", "base"], order: ["base", "lid"] },
  "podium-milano": { dir: "milano-podium", zones: ["main"], order: ["main"] },
  rossi: { dir: "rossi", zones: ["lid", "base"], order: ["base", "lid"] },
  "podium-rossi": { dir: "rossi-podium", zones: ["main"], order: ["main"] },
  modular: { dir: "modular", zones: ["top", "leg-top", "leg-bottom", "base"], order: ["base", "leg-bottom", "leg-top", "top"] },
  "modular-plus": { dir: "modular-plus", zones: ["top", "leg-top", "leg-bottom", "base"], order: ["base", "leg-bottom", "leg-top", "top"] },
  "willy-wonka": { dir: "willy-wonka", zones: ["top", "leg"], order: ["leg", "top"], render: "/products/render/willy-wonka.webp" },
  "podium-i-stand": { dir: "podium-i-stand", zones: ["top", "leg"], order: ["leg", "top"] },
  "podium-i": { dir: "podium-i", zones: ["top"], order: ["top"] },
  "podium-fleur": { dir: "podium-fleur", zones: ["top"], order: ["top"] },
  "podium-bonbon": { dir: "podium-bonbon", zones: ["top", "balls1", "balls2"], order: ["balls1", "balls2", "top"] },
  "podium-cappottina": { dir: "podium-cappottina", zones: ["main"], order: ["main"] },
  "bonbon-balls": { dir: "bonbon-balls", zones: [], order: ["balls"], options: { "6": "balls-6", "12": "balls-12" } },
  // Penny и Minies (04.11): у каждого размера / формы свой кадр; шарики Minies — под подиумом
  penny: { dir: "penny-14", zones: [], optionZones: ["main"], order: ["main"], options: { "14": "penny-14", "16": "penny-16", "18": "penny-18" } },
  "penny-logo": { dir: "penny-logo-14", zones: [], optionZones: ["top"], order: ["top"], options: { "14": "penny-logo-14", "16": "penny-logo-16", "18": "penny-logo-18" } },
  minies: { dir: "minies-flower", zones: [], optionZones: ["top", "balls"], order: ["balls", "top"], options: { flower: "minies-flower", wave: "minies-wave", cookie: "minies-cookie" } },
  ...Object.fromEntries(["piccola", "pumpkin", "souffle", "muff", "grande"].map((l) => [`leg-${l}`, { dir: `leg-${l}`, zones: ["main"], order: ["main"] }])),
  ...Object.fromEntries(["nuts", "honey", "flower"].map((e) => [`extra-${e}`, { dir: `extra-${e}`, zones: ["main"], order: ["main"] }])),
  // Леон (04.11): ножки с логотипом-кругом и два подиума одного кадра
  "stand-leon": { dir: "stand-leon", zones: ["p1", "p2", "legs", "logo"], order: ["legs", "logo", "p1", "p2"], render: "" },
  // готовые сборки Sloyka Podium
  "fleur-stand": { dir: "fleur-stand", ...set(["top", "leg"]) },
  "fleur-bon": { dir: "fleur-bon", ...set(["top", "leg"], true) },
  "fleur-pumpkin": { dir: "fleur-pumpkin", ...set(["top", "leg"], true) },
  "fleur-nuts": { dir: "fleur-nuts", ...set(["top", "leg", "insert"]) },
  "fleur-moti": { dir: "fleur-moti", ...set(["top", "leg", "insert"], true) },
  "bonbon-stand": { dir: "bonbon-stand", ...set(["top", "leg", "balls1", "balls2"], true) },
  "bon-fleur": { dir: "bon-fleur", ...set(["top", "leg", "balls1", "balls2"], true) },
  "bonbon-pumpkin": { dir: "bonbon-pumpkin", ...set(["top", "leg", "balls1", "balls2"]) },
  "cappottina-piccola": { dir: "cappottina-piccola", ...set(["top", "leg"], true) },
  "cappottina-grande": { dir: "cappottina-grande", ...set(["top", "leg"], true) },
  "cappottina-torre": { dir: "cappottina-torre", ...set(["top", "leg", "leg2"], true) },
  "cappottina-palazzo": { dir: "cappottina-palazzo", zones: ["top", "leg", "attico"], order: fruit },
  "cappottina-dei-dolci": { dir: "cappottina-dei-dolci", zones: ["top", "leg", "leg2", "attico"], order: fruit },
};

const file = (dir: string, zone: string) => `/products/layers/${dir}/${zone}.webp`;

/** Прописать слои в зоны цвета товара (зоны без слоя — логотип, «вкладыш, если добавите» — просто не рисуются) */
export function withLayers(p: Product, zonesOf: (p: Product) => ColorZone[]): Product {
  const spec = layerSpecs[p.slug];
  if (!spec) return p;
  const rank = (id: string) => spec.order.indexOf(id);
  const zones = zonesOf(p).map((z) => ({
    ...z,
    ...(spec.zones.includes(z.id) ? { layer: file(spec.dir, z.id) } : {}),
    ...(rank(z.id) >= 0 ? { order: rank(z.id) } : {}),
  }));
  const options = p.options?.map((o) => {
    const alt = spec.options?.[o.id];
    if (!alt) return o;
    // у шариков своя картинка на количество, у столиков 28/30 — свой кадр со всеми зонами
    if (p.slug === "bonbon-balls") return { ...o, layers: { balls: file(spec.dir, alt) } };
    return { ...o, layers: Object.fromEntries((spec.optionZones ?? spec.zones).map((z) => [z, file(alt, z)])) };
  });
  const render = spec.render === "" ? `/products/render/${p.slug}.webp` : spec.render;
  return { ...p, zones: zones.length ? zones : p.zones, options, image: p.image ?? render };
}

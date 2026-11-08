/*
 * Доставка: коробки, вес и габариты изделий, зоны Ozon / WB.
 * Коробки — от заказчика (03.11), вес изделий — его таблица (08.11). Ещё черновик: габариты готовых товаров
 * (берутся по виду товара) и вилки цен Ozon/WB по зонам. Потом это переедет в админку (модели Box и DeliveryZone в prisma/schema.prisma).
 */

/** Откуда отправляем (заказчик, 27.10). Цена СДЭК считается по городу; адрес — для создания отправлений */
export const ORIGIN = { city: "Санкт-Петербург", cdekCityCode: 137, address: "пр-кт Луначарского, 62к1" };

/** Коробка: внутренние размеры, см; maxWeight — граммы */
export type Box = { id: string; name: string; length: number; width: number; height: number; maxWeight: number; price?: number };

/*
 * Коробки заказчика (27.10, подтверждены 03.11 — пока так, размеры можно поправить здесь в любой момент).
 * Сайт сам берёт самую маленькую, куда всё влезает; админ может поменять коробку в заказе.
 * Размеры поправить здесь, если поменяются. maxWeight — примерный предел (TODO: уточнить, если важно).
 */
export const boxes: Box[] = [
  { id: "10", name: "10×10×10 — одиночные органайзеры, мелочи", length: 10, width: 10, height: 10, maxWeight: 1500 },
  { id: "12", name: "12×12×12 — одиночные органайзеры, мелочи", length: 12, width: 12, height: 12, maxWeight: 2000 },
  { id: "30x5", name: "30×30×5 — маркет и прочее", length: 30, width: 30, height: 5, maxWeight: 5000 },
  { id: "20", name: "20×20×10 — маленькие столики, подиумы, маленькие заказы", length: 20, width: 20, height: 10, maxWeight: 5000 },
  { id: "30x10", name: "30×30×10 — маркет и прочее", length: 30, width: 30, height: 10, maxWeight: 8000 },
  { id: "32", name: "32×32×13 — большие столики 28–30 см", length: 32, width: 32, height: 13, maxWeight: 10000 },
  { id: "25", name: "25×25×20 — столики 20–24 см, BonBon, Fleur и прочие заказы", length: 25, width: 25, height: 20, maxWeight: 10000 },
  { id: "30", name: "30×30×20 — столик 25,5 см, Cappottina, большие наборы-солянки", length: 30, width: 30, height: 20, maxWeight: 15000 },
];

/**
 * Габариты одной детали/изделия в упаковке: см и граммы.
 * nests — деталь вкладывается внутрь другой (ножка в подиум, вкладыш в Fleur) и почти не занимает место.
 */
export type Physics = { length: number; width: number; height: number; weight: number; nests?: boolean };

/** Детали конструктора (id из src/data/parts.ts) */
export const partPhysics: Record<string, Physics> = {
  // подиумы Home
  bonbon: { length: 24.5, width: 24.5, height: 6, weight: 205 },
  fleur: { length: 24, width: 24, height: 7, weight: 160 },
  cappottina: { length: 28, width: 28, height: 9, weight: 232 },
  // ножки
  piccola: { length: 14, width: 14, height: 8, weight: 95, nests: true },
  pumpkin: { length: 15, width: 15, height: 8, weight: 115, nests: true },
  souffle: { length: 13, width: 13, height: 10, weight: 116, nests: true },
  muff: { length: 13, width: 13, height: 12, weight: 118, nests: true },
  grande: { length: 15, width: 15, height: 14, weight: 154 },
  // детали
  nuts: { length: 18, width: 18, height: 3, weight: 107, nests: true },
  flower: { length: 18, width: 18, height: 3, weight: 90, nests: true },
  honey: { length: 18, width: 18, height: 3, weight: 80, nests: true },
  attico: { length: 30, width: 30, height: 7, weight: 134 },
  // корона: стойки 70 + шапка-маркиза 135 + логотип 35 г
  crown: { length: 27, width: 10, height: 6, weight: 240 }, // едет разобранной, плоско
  // Market: базы едут в разобранном виде, плоско (коробки 30×30×5 и 30×30×10)
  florence: { length: 28, width: 14, height: 4, weight: 90 },
  paris: { length: 28, width: 21, height: 6, weight: 115 },
  babylon: { length: 28, width: 21, height: 7, weight: 103 },
};
/** Подиумы Market (вес — таблица заказчика 08.11; габариты по матрице + 1 см) */
const mp = (length: number, width: number, height: number, weight: number): Physics => ({ length: length + 1, width: width + 1, height: height + 1, weight });
Object.assign(partPhysics, {
  "cascade-1": mp(25, 8, 3, 105),
  "cascade-2": mp(25, 8, 4, 110),
  "cascade-3": mp(25, 8, 5, 115),
  "tribune-2": mp(25, 7, 9.5, 180),
  "tribune-3": mp(25, 7, 9.5, 205),
  amphitheatre: mp(25, 7, 9.5, 185),
  agora: mp(25, 7, 9.5, 150),
  // диадема 95 + вставки для пусетов 29 и для цепочек 62 г
  diadem: mp(25, 7, 1.5, 186),
  "marseille-21": mp(21, 8, 0.5, 42),
  "marseille-25": mp(25, 8, 0.5, 50),
  "marquise-21": mp(21, 7.5, 3.5, 54),
  "marquise-25": mp(25, 7.5, 3.5, 64),
  "loge-1": mp(25, 7, 1.5, 72),
  "loge-2": mp(25, 7, 1.5, 73),
  "loge-3": mp(25, 7, 1.5, 75),
  "patio-1": mp(25, 7, 2, 72),
  "patio-2": mp(25, 7, 2, 75),
  "patio-3": mp(25, 7, 2, 77),
} satisfies Record<string, Physics>);
/** Подиум Market по умолчанию, если нет своих цифр */
export const marketPodiumPhysics: Physics = { length: 25, width: 8, height: 4, weight: 250, nests: false };

/*
 * Правило заказчика (03.11): габариты в упаковке = габариты изделия + 1 см по каждой стороне
 * (Cappottina Podium 27 × 5 → 28 × 6). Вес — пришлют таблицей в конце; объёмный вес СДЭК обычно больше фактического.
 */
/** Готовые товары каталога: по slug, иначе по виду товара (kind) */
export const productPhysics: Record<string, Physics> = {};

/*
 * Вес готовых товаров, г — таблица заказчика (лист «Вес», 08.11). Ключ — slug или slug:размер.
 * Габариты берём по виду товара (kindPhysics). Готовые стойки Market считаются по деталям (база + подиумы + корона).
 */
const sizes = (slug: string, ids: (string | number)[], grams: number[]) => Object.fromEntries(ids.map((id, i) => [`${slug}:${id}`, grams[i]]));
const tableIds = [10, 12, 14, 16, 18, 20, 22, 24, 255, 28, 30];
export const productWeights: Record<string, number> = {
  ...sizes("classic-muffin", tableIds, [51, 73, 100, 133, 174, 222, 278, 344, 419, 406, 459]),
  ...sizes("classic-marble", tableIds, [56, 80, 109, 145, 188, 238, 296, 365, 441, 420, 475]),
  ...sizes("willy-wonka", [16, 22, 28], [115, 230, 380]),
  ...sizes("milano", [16, 24], [192, 449]),
  ...sizes("podium-milano", [16, 24], [67, 163]),
  ...sizes("rossi", [16, 24], [271, 688]),
  ...sizes("podium-rossi", [16, 24], [103, 265]),
  ...sizes("modular", [16, 22], [175, 368]),
  "modular-plus": 443,
  "podium-i": 372,
  "podium-i-stand": 618,
  ...sizes("penny", [14, 16, 18], [88.5, 112.5, 135]),
  ...sizes("penny-logo", [14, 16, 18], [88.5, 112.5, 135]),
  ...sizes("penny-set", ["set14", "set16", "set18", "combo"], [265.5, 337.5, 405, 336]),
  ...sizes("penny-logo-set", ["set14", "set16", "set18", "combo"], [265.5, 337.5, 405, 336]),
  // готовые столики
  "fleur-stand": 278,
  "bonbon-stand": 321,
  "bonbon-pumpkin": 320,
  "bon-fleur": 323,
  "fleur-bon": 276,
  "fleur-pumpkin": 275,
  "fleur-nuts": 385,
  "fleur-moti": 358,
  "cappottina-piccola": 327,
  "cappottina-grande": 386,
  "cappottina-torre": 481,
  "cappottina-palazzo": 520,
  "cappottina-dei-dolci": 615,
  // детали отдельно
  "podium-bonbon": 205,
  "podium-fleur": 160,
  "podium-cappottina": 232,
  "leg-piccola": 95,
  "leg-pumpkin": 115,
  "leg-souffle": 116,
  "leg-muff": 118,
  "leg-grande": 154,
  "extra-nuts": 107,
  "extra-flower": 90,
  "extra-honey": 80,
  "bonbon-balls:6": 15,
  "bonbon-balls:12": 30,
  // Market
  "base-florence": 90,
  "base-paris": 115,
  "base-babylon": 103,
  "stand-leon": 560,
  "wheel-carnival": 180,
};

/** Шкатулка Cachette в упаковке: 6 × 6 × 7 см + крышка до 3 см, + 1 см по сторонам (вес — пока примерно) */
Object.assign(productPhysics, Object.fromEntries(["baguette", "cafe", "columns", "circus"].map((id) => [`cachette-${id}`, { length: 7, width: 7, height: 11, weight: 120 }])));
export const kindPhysics: Record<string, Physics> = {
  set: { length: 24.5, width: 24.5, height: 18, weight: 900 },
  stand: { length: 24, width: 24, height: 18, weight: 1000 },
  part: { length: 15, width: 15, height: 12, weight: 220 },
  base: { length: 28, width: 21, height: 8, weight: 1000 },
  podium: { length: 18, width: 18, height: 6, weight: 300 },
  decor: { length: 10, width: 10, height: 8, weight: 120 },
};

/* ---------- Ozon / WB: вилки цен по зонам от Санкт-Петербурга ---------- */

export type Range = [number, number];
export type DeliveryZone = {
  id: string;
  title: string;
  /** города/регионы — сравниваем по началу слова, без регистра */
  match: string[];
  days: Range;
  /** цена за одну коробку S / M / L, ₽ от–до */
  ozon: Record<string, Range>;
  wb: Record<string, Range>;
};

export const zones: DeliveryZone[] = [
  {
    id: "spb",
    title: "Санкт-Петербург и область",
    match: ["санкт-петербург", "спб", "петербург", "ленинградская", "гатчина", "всеволожск", "колпино", "пушкин"],
    days: [1, 2],
    ozon: { S: [100, 200], M: [150, 300], L: [250, 450] },
    wb: { S: [90, 180], M: [140, 280], L: [240, 420] },
  },
  {
    id: "msk",
    title: "Москва и область",
    match: ["москва", "московская", "химки", "подольск", "балашиха", "мытищи", "люберцы", "королёв", "королев"],
    days: [2, 4],
    ozon: { S: [200, 350], M: [300, 500], L: [450, 750] },
    wb: { S: [180, 320], M: [280, 480], L: [420, 700] },
  },
  {
    id: "center",
    title: "Центр и Северо-Запад",
    match: ["нижний новгород", "казань", "ярославль", "тверь", "великий новгород", "псков", "мурманск", "архангельск", "вологда", "воронеж", "калининград"],
    days: [3, 6],
    ozon: { S: [250, 450], M: [350, 600], L: [550, 900] },
    wb: { S: [230, 420], M: [330, 560], L: [520, 850] },
  },
  {
    id: "russia",
    title: "Остальная Россия",
    match: [],
    days: [5, 12],
    ozon: { S: [350, 650], M: [500, 900], L: [800, 1400] },
    wb: { S: [330, 600], M: [480, 850], L: [750, 1300] },
  },
];

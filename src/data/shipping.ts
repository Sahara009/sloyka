/*
 * Доставка: коробки, вес и габариты изделий, зоны Ozon / WB.
 * ВСЕ ЦИФРЫ ЗДЕСЬ — ЧЕРНОВИК. Заказчик присылает реальные: размеры коробок, вес и габариты деталей,
 * вилки цен Ozon/WB по зонам. Потом это переедет в админку (модели Box и DeliveryZone в prisma/schema.prisma).
 */

/** Откуда отправляем */
export const ORIGIN = { city: "Санкт-Петербург", cdekCityCode: 137 };

/** Коробка: внутренние размеры, см; maxWeight — граммы */
export type Box = { id: string; name: string; length: number; width: number; height: number; maxWeight: number; price?: number };

export const boxes: Box[] = [
  { id: "S", name: "Коробка S", length: 30, width: 20, height: 15, maxWeight: 3000 },
  { id: "M", name: "Коробка M", length: 40, width: 30, height: 25, maxWeight: 7000 },
  { id: "L", name: "Коробка L", length: 60, width: 40, height: 40, maxWeight: 15000 },
];

/**
 * Габариты одной детали/изделия в упаковке: см и граммы.
 * nests — деталь вкладывается внутрь другой (ножка в подиум, вкладыш в Fleur) и почти не занимает место.
 */
export type Physics = { length: number; width: number; height: number; weight: number; nests?: boolean };

/** Детали конструктора (id из src/data/parts.ts) */
export const partPhysics: Record<string, Physics> = {
  // подиумы Home
  bonbon: { length: 28, width: 28, height: 6, weight: 450 },
  fleur: { length: 27, width: 27, height: 7, weight: 420 },
  cappottina: { length: 30, width: 30, height: 9, weight: 520 },
  // ножки
  piccola: { length: 14, width: 14, height: 8, weight: 160, nests: true },
  pumpkin: { length: 15, width: 15, height: 8, weight: 190, nests: true },
  souffle: { length: 13, width: 13, height: 10, weight: 200, nests: true },
  muff: { length: 13, width: 13, height: 12, weight: 220, nests: true },
  grande: { length: 15, width: 15, height: 14, weight: 300 },
  // детали
  nuts: { length: 18, width: 18, height: 3, weight: 120, nests: true },
  flower: { length: 18, width: 18, height: 3, weight: 110, nests: true },
  honey: { length: 18, width: 18, height: 3, weight: 100, nests: true },
  attico: { length: 30, width: 30, height: 7, weight: 380 },
  crown: { length: 22, width: 8, height: 14, weight: 150 },
  // Market: базы и подиумы
  florence: { length: 22, width: 22, height: 30, weight: 700 },
  paris: { length: 36, width: 26, height: 30, weight: 1100 },
  babylon: { length: 38, width: 30, height: 40, weight: 1400 },
};
/** Подиум Market по умолчанию, если нет своих цифр */
export const marketPodiumPhysics: Physics = { length: 25, width: 25, height: 4, weight: 250, nests: false };

/** Готовые товары каталога: по slug, иначе по виду товара (kind) */
export const productPhysics: Record<string, Physics> = {};
export const kindPhysics: Record<string, Physics> = {
  set: { length: 30, width: 30, height: 20, weight: 900 },
  stand: { length: 36, width: 30, height: 32, weight: 1300 },
  part: { length: 15, width: 15, height: 12, weight: 220 },
  base: { length: 30, width: 26, height: 30, weight: 1000 },
  podium: { length: 28, width: 28, height: 8, weight: 450 },
  decor: { length: 20, width: 15, height: 6, weight: 120 },
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

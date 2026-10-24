// Комплектующие для конструктора. Цены и правила — из сторис Sloyka.
// Когда появится бэкенд и админ-панель, эти данные переедут в базу.

/* ---------- Sloyka Home: десертные столики ---------- */

export type PodiumId = "bonbon" | "fleur" | "cappottina";
export type LegId = "piccola" | "pumpkin" | "souffle" | "muff" | "grande";
export type HomeExtraId = "nuts" | "flower" | "honey" | "attico";

export type HomePart<T extends string> = {
  id: T;
  name: string;
  price: number;
  note: string;
};

export const podiums: HomePart<PodiumId>[] = [
  { id: "bonbon", name: "Bonbon", price: 1500, note: "Игривый, лёгкий, с шариками по краю" },
  { id: "fleur", name: "Fleur", price: 1300, note: "Цветочный столик со сменными вкладышами" },
  { id: "cappottina", name: "Cappottina", price: 1700, note: "Элегантный, превращается во фруктовницу" },
];

export const legs: (HomePart<LegId> & { height: number; doubleSided: boolean })[] = [
  { id: "piccola", name: "Piccola", price: 700, height: 8, doubleSided: true, note: "8 см, двустороннее крепление" },
  { id: "pumpkin", name: "Pumpkin", price: 900, height: 8, doubleSided: true, note: "8 см, двустороннее крепление" },
  { id: "souffle", name: "Souffle", price: 1000, height: 10, doubleSided: false, note: "10 см" },
  { id: "muff", name: "Muff", price: 800, height: 12, doubleSided: false, note: "12 см" },
  { id: "grande", name: "Grande", price: 1300, height: 14, doubleSided: false, note: "14 см, совместима с Attico" },
];

export const homeExtras: (HomePart<HomeExtraId> & { forPodium: PodiumId; requiresLeg?: LegId })[] = [
  { id: "nuts", name: "Вкладыш Nuts", price: 800, forPodium: "fleur", note: "Для орешков" },
  { id: "flower", name: "Вкладыш Flower", price: 750, forPodium: "fleur", note: "Для шоколадных яиц, трюфелей, конфет" },
  { id: "honey", name: "Вкладыш Honey", price: 700, forPodium: "fleur", note: "Для макаронс, моти, десертов до 5 см" },
  {
    id: "attico",
    name: "Attico",
    price: 1000,
    forPodium: "cappottina",
    requiresLeg: "grande",
    note: "Дополнительный подиум — столик становится фруктовницей. Только с ножкой Grande",
  },
];

/** Ножки, которые можно ставить ярусом над основной (двустороннее крепление). */
export const stackableLegs: LegId[] = legs.filter((l) => l.doubleSided).map((l) => l.id);

/* ---------- Sloyka Market: стенды ---------- */

export type MarketBase = { id: string; name: string; price: number; levels: number; note: string; specs: string[] };
export type MarketPodium = { id: string; name: string; price: number; group: string; specs: string[] };

export const marketBases: MarketBase[] = [
  {
    id: "florence",
    name: "Флоренция",
    price: 600,
    levels: 2,
    note: "Двухуровневая база (без подиумов)",
    specs: ["Глубина 14 см", "Высота 7,5 и 14,5 см", "Комплект: 2 ножки"],
  },
  {
    id: "paris",
    name: "Париж",
    price: 1000,
    levels: 3,
    note: "Трёхуровневая база с вашим логотипом",
    specs: ["Глубина 21 см", "Высота 5,5 / 11 / 16,5 см", "Комплект: 2 ножки, 2 логотипа"],
  },
  {
    id: "babylon",
    name: "Вавилон",
    price: 900,
    levels: 3,
    note: "Трёхуровневая база (без подиумов)",
    specs: ["Глубина 21 см", "Высота 7,5 / 14,5 / 21,5 см", "Комплект: 2 ножки"],
  },
];

export const marketPodiums: MarketPodium[] = [
  { id: "cascade-1", name: "Каскад-1", price: 700, group: "Каскад", specs: ["25 × 8 см, высота 3 см"] },
  { id: "cascade-2", name: "Каскад-2", price: 700, group: "Каскад", specs: ["25 × 8 см, высота 4 см"] },
  { id: "cascade-3", name: "Каскад-3", price: 700, group: "Каскад", specs: ["25 × 8 см, высота 5 см"] },
  { id: "tribune-2", name: "Трибуна-2", price: 900, group: "Трибуна", specs: ["25 × 7 см, высота 9,5 см"] },
  { id: "tribune-3", name: "Трибуна-3", price: 1000, group: "Трибуна", specs: ["25 × 7 см, высота 9,5 см"] },
  { id: "amphitheatre", name: "Амфитеатр", price: 950, group: "Трибуна", specs: ["25 × 7 см, секция 6 × 3 × 2 см"] },
  { id: "agora", name: "Агора", price: 800, group: "Трибуна", specs: ["25 × 7 см, секция 4 × 3 × 1,5 см"] },
  { id: "diadem", name: "Диадема", price: 1250, group: "Диадема", specs: ["Подиум + вставка-крючки + вставка для пусетов"] },
  { id: "marseille-21", name: "Марсель-21", price: 400, group: "Марсель", specs: ["21 × 8 см"] },
  { id: "marseille-25", name: "Марсель-25", price: 500, group: "Марсель", specs: ["25 × 8 см"] },
  { id: "marquise-21", name: "Маркиза-21", price: 500, group: "Маркиза", specs: ["21 × 7,5 см"] },
  { id: "marquise-25", name: "Маркиза-25", price: 600, group: "Маркиза", specs: ["25 × 7,5 см"] },
  { id: "loge-1", name: "Ложе-1", price: 600, group: "Ложе", specs: ["25 × 7 см, 1 секция"] },
  { id: "loge-2", name: "Ложе-2", price: 600, group: "Ложе", specs: ["25 × 7 см, 2 секции"] },
  { id: "loge-3", name: "Ложе-3", price: 600, group: "Ложе", specs: ["25 × 7 см, 3 секции"] },
  { id: "patio-1", name: "Патио-1", price: 600, group: "Патио", specs: ["25 × 7 см, 1 секция"] },
  { id: "patio-2", name: "Патио-2", price: 600, group: "Патио", specs: ["25 × 7 см, 2 секции"] },
  { id: "patio-3", name: "Патио-3", price: 600, group: "Патио", specs: ["25 × 7 см, 3 секции"] },
];

export const crown = {
  id: "crown",
  name: "Корона",
  price: 1600,
  note: "Маркиза с подвесом для вывески, ставится на любую базу. Табличка 17 × 7 см в комплекте",
};

/** Максимум подиумов на базе: по одному на уровень + один на столе снизу (как в примерах сборок). */
export function maxPodiums(base: MarketBase): number {
  return base.levels + 1;
}

import {
  crown,
  homeExtras,
  legs,
  marketBases,
  marketPodiums,
  podiums,
  type HomeExtraId,
  type LegId,
  type PodiumId,
} from "./parts";

/*
 * Каталог Sloyka. Цены, размеры и составы — из сторис бренда (каталог, Sloyka Home, Sloyka Market, Waffle's).
 * Фото: /public/products — вырезаны со скринов сторис, /public/photos — интерьерные кадры.
 * Когда появятся бэкенд и админ-панель, эти данные переедут в базу.
 */

export type Line = "home" | "classic" | "design" | "market" | "decor" | "art" | "toppers";
export type Kind = "set" | "stand" | "part" | "base" | "podium" | "decor";

/** SVG-иллюстрация — запасной вариант, если нет фото, и превью в конструкторе (там меняется цвет) */
export type Art =
  | {
      type: "table";
      podium: PodiumId;
      legs: LegId[]; // снизу вверх: [основная, ярус]
      podiumColor: string; // id цвета из палитры
      legColor: string;
      extra?: HomeExtraId;
    }
  | { type: "stand"; levels: number; colors: string[]; crown?: boolean }
  | { type: "decor"; label: string; variant: "sign" | "tent" | "logo" | "crown" };

/** Размер со своей ценой: столики Classic, Milano, Rossi, Penny… */
export type SizeOption = { id: string; label: string; price: number; group?: string };

/** Вариант с готовым фото — цвет глазури у Waffle's */
export type Variant = { id: string; name: string; swatch: string; image?: string };

export type Product = {
  slug: string;
  name: string;
  line: Line;
  kind: Kind;
  /** Минимальная цена. null — цена по запросу */
  price: number | null;
  short: string;
  description: string;
  specs: string[];
  /** Главное фото без фона */
  image?: string;
  /** Дополнительные фото (интерьер, другие ракурсы) */
  gallery?: string[];
  art?: Art;
  hit?: boolean;
  isNew?: boolean;
  /** Выбор размера — цена меняется */
  options?: SizeOption[];
  /** Выбор глазури с фото */
  variants?: Variant[];
  /** Палитра пластика: один цвет, два (столешница и ножка) или без выбора */
  colors?: "one" | "two" | "none";
  /** Можно добавить логотип (цена зависит от диаметра) */
  logoAddon?: boolean;
  /** Сборку можно открыть в конструкторе */
  constructorPreset?: { podium: PodiumId; legs: LegId[]; extra?: HomeExtraId };
};

const legPrice = (id: LegId) => legs.find((l) => l.id === id)!.price;
const podiumPrice = (id: PodiumId) => podiums.find((p) => p.id === id)!.price;
const extraPrice = (id: HomeExtraId) => homeExtras.find((e) => e.id === id)!.price;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const img = (name: string) => `/products/${name}.webp`;
const photo = (name: string) => `/photos/${name}.webp`;

/* ================= Sloyka Home: готовые сборки ================= */

type SetDef = {
  podium: PodiumId;
  legs: LegId[];
  extra?: HomeExtraId;
  podiumColor: string;
  legColor: string;
  hit?: boolean;
  name?: string;
  image?: string;
  gallery?: string[];
  note?: string;
};

// Сборки из сторис «Собирайте свою комбинацию»
const homeSets: SetDef[] = [
  { podium: "bonbon", legs: ["pumpkin"], podiumColor: "butter", legColor: "pumpkin-spice", hit: true },
  { podium: "fleur", legs: ["muff"], podiumColor: "white", legColor: "cherry", hit: true },
  { podium: "cappottina", legs: ["muff"], podiumColor: "brownie", legColor: "cherry" },
  { podium: "bonbon", legs: ["piccola"], podiumColor: "butter", legColor: "white" },
  {
    podium: "fleur",
    legs: ["muff", "pumpkin"],
    podiumColor: "white",
    legColor: "cherry",
    hit: true,
    gallery: [photo("insta-fleur-pumpkin-muff")],
  },
  { podium: "cappottina", legs: ["souffle"], podiumColor: "brownie", legColor: "white" },
  { podium: "bonbon", legs: ["grande", "piccola"], podiumColor: "butter", legColor: "white" },
  { podium: "fleur", legs: ["souffle", "pumpkin"], podiumColor: "white", legColor: "ivory" },
  { podium: "cappottina", legs: ["muff", "pumpkin"], podiumColor: "brownie", legColor: "cherry" },
  // TODO: уточнить у заказчика точный состав трёх именных сборок (сейчас — по фото)
  {
    podium: "fleur",
    legs: ["muff"],
    extra: "nuts",
    podiumColor: "latte",
    legColor: "latte",
    name: "Fleur Nuts",
    hit: true,
    image: photo("set-fleur-nuts"),
    note: "Столик для орешков: Fleur со вкладышем Nuts.",
  },
  {
    podium: "cappottina",
    legs: ["grande"],
    extra: "attico",
    podiumColor: "brownie",
    legColor: "white",
    name: "Cappottina Palazzo",
    hit: true,
    image: photo("set-cappottina-palazzo"),
    gallery: [photo("insta-palazzo")],
    note: "Двухъярусная фруктовница: Cappottina сверху, Attico снизу.",
  },
  {
    podium: "cappottina",
    legs: ["grande", "piccola"],
    extra: "attico",
    podiumColor: "brownie",
    legColor: "white",
    name: "Cappottina Dei Dolci",
    image: photo("set-cappottina-dei-dolci"),
    gallery: [photo("insta-dei-dolci")],
    note: "Высокая фруктовница с ножкой в два яруса.",
  },
];

function setName(s: SetDef) {
  if (s.name) return s.name;
  const top = [...s.legs].reverse().map(cap);
  return [cap(s.podium), ...top].join(" + ");
}

const slugify = (name: string) => name.toLowerCase().replace(/\s*\+\s*/g, "-").replace(/\s+/g, "-");

const setProducts: Product[] = homeSets.map((s) => {
  const name = setName(s);
  const slug = slugify(name);
  const price =
    podiumPrice(s.podium) + s.legs.reduce((sum, l) => sum + legPrice(l), 0) + (s.extra ? extraPrice(s.extra) : 0);
  const height = s.legs.reduce((h, l) => h + legs.find((x) => x.id === l)!.height, 0);
  return {
    slug,
    name,
    line: "home",
    kind: "set",
    price,
    short: `Десертный столик, высота ножки ${height} см`,
    description: `${s.note ? s.note + " " : ""}Готовая сборка Sloyka Home. Детали можно менять и комбинировать между собой: сегодня одна сборка, завтра другая.`,
    specs: [
      `Подиум: ${cap(s.podium)}`,
      `Ножка: ${s.legs.map(cap).join(" + ")}`,
      ...(s.extra ? [`Доп: ${homeExtras.find((e) => e.id === s.extra)!.name}`] : []),
      `Высота ножки: ${height} см`,
      "Материал: экологичный пластик",
    ],
    image: s.image ?? img(`set-${slug}`),
    gallery: s.gallery,
    art: { type: "table", podium: s.podium, legs: s.legs, podiumColor: s.podiumColor, legColor: s.legColor, extra: s.extra },
    hit: s.hit,
    colors: "two",
    constructorPreset: { podium: s.podium, legs: s.legs, extra: s.extra },
  };
});

/* ================= Sloyka Home: детали ================= */

const extraImage: Record<HomeExtraId, string> = {
  nuts: img("insert-nuts"),
  flower: img("insert-flower"),
  honey: img("insert-honey"),
  attico: img("attico"),
};

const partProducts: Product[] = [
  ...podiums.map<Product>((p) => ({
    slug: `podium-${p.id}`,
    name: `Подиум ${p.name}`,
    line: "home",
    kind: "part",
    price: p.price,
    short: p.note,
    description: `${p.note}. Подходит ко всем ножкам Sloyka Home.`,
    specs: [...(p.id === "cappottina" ? [] : ["Диаметр: 24 см"]), "Материал: экологичный пластик", "Цвет: любой из палитры"],
    image: img(`podium-${p.id}`),
    art: { type: "table", podium: p.id, legs: [], podiumColor: "marzipan", legColor: "marzipan" },
  })),
  ...legs.map<Product>((l) => ({
    slug: `leg-${l.id}`,
    name: `Ножка ${l.name}`,
    line: "home",
    kind: "part",
    price: l.price,
    short: l.note,
    description: `Ножка ${l.name}, высота ${l.height} см. Подходит к разным столешницам.${
      l.doubleSided ? " Двустороннее крепление — можно ставить ярусом над другой ножкой." : ""
    }`,
    specs: [`Высота: ${l.height} см`, "Материал: экологичный пластик", "Цвет: любой из палитры"],
    image: img(`leg-${l.id}`),
    art: { type: "table", podium: "bonbon", legs: [l.id], podiumColor: "marzipan", legColor: "latte" },
  })),
  ...homeExtras.map<Product>((e) => ({
    slug: `extra-${e.id}`,
    name: e.name,
    line: "home",
    kind: "part",
    price: e.price,
    short: e.note,
    description: `${e.note}.${e.forPodium === "fleur" ? " Вставляется в подиум Fleur." : ""}`,
    specs: [
      `Для подиума: ${cap(e.forPodium)}`,
      ...(e.requiresLeg ? [`Только с ножкой ${cap(e.requiresLeg)}`] : []),
      "Материал: экологичный пластик",
    ],
    image: extraImage[e.id],
  })),
];

/* ================= Classic Cakestand: Muffin и Marble ================= */

type SizeRow = [label: string, group: string, muffin: number, marble: number];
const classicSizes: SizeRow[] = [
  ["10 см", "Mini", 900, 1000],
  ["12 см", "Mini", 1000, 1100],
  ["14 см", "Bento", 1100, 1200],
  ["16 см", "Bento", 1300, 1400],
  ["18 см", "Bento", 1500, 1600],
  ["20 см", "Cake", 1700, 1800],
  ["22 см", "Cake", 1900, 2000],
  ["24 см", "Cake", 2300, 2400],
  ["25,5 см", "Cake", 2600, 2800],
  ["28 см", "L", 3300, 3400],
  ["30 см", "XL", 3800, 3900],
];

const classicOptions = (col: 2 | 3): SizeOption[] =>
  classicSizes.map((r) => ({ id: r[0].replace(/\D+/g, ""), label: r[0], group: r[1], price: r[col] }));

/** Цена логотипа: Bento (10–18 см) — 300 ₽, Cake (20–30 см) — 500 ₽ */
export function logoPrice(sizeLabel: string): number {
  const d = parseFloat(sizeLabel.replace(",", "."));
  return d <= 18 ? 300 : 500;
}

const classicProducts: Product[] = [
  {
    slug: "classic-muffin",
    name: "Подставка Muffin",
    line: "classic",
    kind: "stand",
    price: 900,
    short: "Классическая подставка для торта, 10–30 см",
    description:
      "Подставка для тортов и бенто с ножкой-«маффином». Размеры от мини до XL. Ножку и столешницу можно сделать разными цветами из палитры.",
    specs: ["Mini: 10–12 см", "Bento: 14–18 см", "Cake: 20–25,5 см", "L: 28 см, XL: 30 см", "Материал: экологичный пластик"],
    image: img("classic-muffin"),
    gallery: [img("classic-muffin-l")],
    options: classicOptions(2),
    colors: "two",
    logoAddon: true,
    hit: true,
  },
  {
    slug: "classic-marble",
    name: "Подставка Marble",
    line: "classic",
    kind: "stand",
    price: 1000,
    short: "Подставка с плиссированной ножкой, 10–30 см",
    description:
      "Подставка для торта с тонкой плиссированной ножкой. Размеры от мини до XL. Ножку и столешницу можно сделать разными цветами из палитры.",
    specs: ["Mini: 10–12 см", "Bento: 14–18 см", "Cake: 20–25,5 см", "L: 28 см, XL: 30 см", "Материал: экологичный пластик"],
    image: img("classic-marble"),
    options: classicOptions(3),
    colors: "two",
    logoAddon: true,
  },
];

/* ================= Design Stand и подиумы ================= */

const designProducts: Product[] = [
  {
    slug: "podium-i-stand",
    name: "Podium I Stand",
    line: "design",
    kind: "stand",
    price: 4990,
    short: "Столешница 30 см, логотип и ножка",
    description:
      "Эксклюзивный лимитированный столик для больших тортов с откручивающейся ножкой. Ваш логотип входит в комплект. Подиум без ножки можно купить отдельно.",
    specs: ["Диаметр: 30 см", "Комплект: столешница, логотип, ножка", "Ножка откручивается"],
    image: img("design-podium-i"),
    colors: "two",
    isNew: true,
  },
  {
    slug: "modular",
    name: "Столик Modular",
    line: "design",
    kind: "stand",
    price: 1500,
    short: "Регулируемая высота, 4 части разных цветов",
    description:
      "Универсальный столик с регулировкой высоты. Каждая из 4 частей может быть своего цвета: столешница, верхняя часть ножки, нижняя часть ножки и подстолье. Нижняя часть ножки откручивается — столик становится ниже, а подача интереснее.",
    specs: ["16 см — 1500 ₽", "22 см — 2500 ₽", "4 части: столешница, 2 части ножки, подстолье"],
    image: img("design-modular"),
    options: [
      { id: "16", label: "16 см", price: 1500 },
      { id: "22", label: "22 см", price: 2500 },
    ],
    colors: "two",
  },
  {
    slug: "modular-plus",
    name: "Столик Modular +",
    line: "design",
    kind: "stand",
    price: 3300,
    short: "Большой модульный столик, 25,5 см",
    description:
      "Модульный столик большого диаметра с регулировкой высоты. Четыре части можно собрать в разных цветах из палитры.",
    specs: ["Диаметр: 25,5 см", "4 части: столешница, 2 части ножки, подстолье"],
    image: img("design-modular-plus"),
    colors: "two",
  },
  {
    slug: "milano",
    name: "Столик Milano",
    line: "design",
    kind: "stand",
    price: 1500,
    short: "Круглый столик 2 в 1 с фестонами",
    description:
      "Круглый столик 2 в 1: съёмный поворотный подиум и самостоятельный столик-основание. Дополнительный подиум можно купить отдельно.",
    specs: ["16 см — 1500 ₽", "24 см — 2500 ₽", "Подиум поворотный и съёмный"],
    image: img("design-milano"),
    options: [
      { id: "16", label: "16 см", price: 1500 },
      { id: "24", label: "24 см", price: 2500 },
    ],
    colors: "two",
    hit: true,
  },
  {
    slug: "rossi",
    name: "Столик Rossi",
    line: "design",
    kind: "stand",
    price: 1800,
    short: "Квадратный столик 2 в 1",
    description:
      "Квадратный столик 2 в 1 с архитектурным силуэтом и устойчивым основанием: съёмный подиум и самостоятельный столик-основание. Дополнительный подиум можно купить отдельно.",
    specs: ["16 см — 1800 ₽", "24 см — 3500 ₽", "Подиум съёмный"],
    image: img("design-rossi"),
    options: [
      { id: "16", label: "16 см", price: 1800 },
      { id: "24", label: "24 см", price: 3500 },
    ],
    colors: "two",
  },
  {
    slug: "podium-i",
    name: "Подиум Podium I",
    line: "design",
    kind: "podium",
    price: 3300,
    short: "Столешница 30 см с вашим логотипом",
    description: "Подиум для больших тортов, логотип входит в комплект. Ставится на стол или на ножку Podium I Stand.",
    specs: ["Диаметр: 30 см", "Комплект: столешница, логотип"],
    image: img("podium-podium-i"),
  },
  {
    slug: "podium-milano",
    name: "Подиум Milano",
    line: "design",
    kind: "podium",
    price: 800,
    short: "Круглый подиум с фестонами",
    description: "Дополнительный подиум для столика Milano или самостоятельная подставка.",
    specs: ["16 см — 800 ₽", "24 см — 1400 ₽"],
    image: img("podium-milano"),
    options: [
      { id: "16", label: "16 см", price: 800 },
      { id: "24", label: "24 см", price: 1400 },
    ],
  },
  {
    slug: "podium-rossi",
    name: "Подиум Rossi",
    line: "design",
    kind: "podium",
    price: 1000,
    short: "Квадратный подиум с фестонами",
    description: "Дополнительный подиум для столика Rossi или самостоятельная подставка.",
    specs: ["16 см — 1000 ₽", "24 см — 1600 ₽"],
    image: img("podium-rossi"),
    options: [
      { id: "16", label: "16 см", price: 1000 },
      { id: "24", label: "24 см", price: 1600 },
    ],
  },
  {
    slug: "penny",
    name: "Подиум Penny",
    line: "design",
    kind: "podium",
    price: 850,
    short: "Рифлёный подиум-«монетка», 14–18 см",
    description: "Низкий рифлёный подиум. Хорош поодиночке и пирамидкой из трёх размеров.",
    specs: ["14 см — 850 ₽", "16 см — 950 ₽", "18 см — 1050 ₽"],
    image: img("podium-penny"),
    options: [
      { id: "14", label: "14 см", price: 850 },
      { id: "16", label: "16 см", price: 950 },
      { id: "18", label: "18 см", price: 1050 },
    ],
  },
  {
    slug: "penny-set",
    name: "Набор Penny",
    line: "design",
    kind: "podium",
    price: 1900,
    short: "3 подиума одного размера или пирамидка 14 + 16 + 18",
    description: "Наборы из трёх подиумов Penny: одного размера или Penny Combo — пирамидка из 14, 16 и 18 см.",
    specs: ["Set 14 см (3 шт) — 1900 ₽", "Set 16 см (3 шт) — 2200 ₽", "Set 18 см (3 шт) — 2800 ₽", "Penny Combo (14, 16, 18) — 2300 ₽"],
    image: img("podium-penny-set"),
    options: [
      { id: "set14", label: "Set 14 см", price: 1900 },
      { id: "set16", label: "Set 16 см", price: 2200 },
      { id: "set18", label: "Set 18 см", price: 2800 },
      { id: "combo", label: "Combo 14+16+18", price: 2300 },
    ],
    hit: true,
  },
];

/* ================= Sloyka Market: стенды ================= */

const podiumName = (id: string) => marketPodiums.find((p) => p.id === id)!.name;
const marketPrice = (base: string, ids: string[], withCrown = false) =>
  marketBases.find((b) => b.id === base)!.price +
  ids.reduce((s, id) => s + marketPodiums.find((p) => p.id === id)!.price, 0) +
  (withCrown ? crown.price : 0);

type StandDef = { slug: string; name: string; base: string; podiums: string[]; crown?: boolean; image: string; hit?: boolean; text: string };

// Примеры сборок из сторис «Как собрать стенд»
const marketStands: StandDef[] = [
  { slug: "stand-florence-marseille", name: "Стенд Флоренция", base: "florence", podiums: ["marseille-25", "marseille-25"], image: "stand-florence", hit: true, text: "Двухуровневый стенд для маркетов и витрин." },
  { slug: "stand-florence-marquise", name: "Стенд Флоренция с маркизами", base: "florence", podiums: ["marquise-21", "marquise-21"], image: "stand-florence-marquise", text: "Двухуровневый стенд с фестонами-маркизами." },
  { slug: "stand-florence-diadem", name: "Стенд для украшений", base: "florence", podiums: ["diadem", "cascade-3"], image: "stand-florence-diadem", text: "Стенд для серёжек и колец: Диадема с крючками и вставкой для пусетов + Каскад-3." },
  { slug: "stand-paris-marquise", name: "Стенд Париж", base: "paris", podiums: ["marquise-21", "marquise-21", "marquise-21"], image: "stand-paris", text: "Трёхуровневый стенд с вашим логотипом на боковинах." },
  { slug: "stand-babylon-crown", name: "Стенд Вавилон с короной", base: "babylon", podiums: ["cascade-2", "patio-3", "patio-2", "patio-1"], crown: true, image: "stand-babylon-crown", hit: true, text: "Большой стенд с маркизой и подвесной вывеской — для маркетов и кофеен." },
  { slug: "stand-babylon-tribune", name: "Стенд Вавилон Трибуна", base: "babylon", podiums: ["tribune-2", "tribune-3", "agora", "amphitheatre"], image: "stand-babylon-tribune", text: "Вместительный стенд для мелочей: трибуны, Агора и Амфитеатр с секциями." },
];

const marketProducts: Product[] = [
  ...marketStands.map<Product>((s) => {
    const base = marketBases.find((b) => b.id === s.base)!;
    const counts = s.podiums.reduce<Record<string, number>>((acc, id) => ((acc[id] = (acc[id] ?? 0) + 1), acc), {});
    const list = Object.entries(counts).map(([id, n]) => (n > 1 ? `${podiumName(id)} × ${n}` : podiumName(id)));
    return {
      slug: s.slug,
      name: s.name,
      line: "market",
      kind: "set",
      price: marketPrice(s.base, s.podiums, s.crown),
      short: `${base.name}${s.crown ? " + Корона" : ""} + ${list.join(", ")}`,
      description: s.text,
      specs: [`База: ${base.name}`, ...(s.crown ? ["Допы: Корона"] : []), `Подиумы: ${list.join(", ")}`],
      image: img(s.image),
      art: { type: "stand", levels: base.levels, colors: ["marzipan", "marzipan", "marzipan"], crown: s.crown },
      hit: s.hit,
    };
  }),
  ...marketBases.map<Product>((b) => ({
    slug: `base-${b.id}`,
    name: `База ${b.name}`,
    line: "market",
    kind: "base",
    price: b.price,
    short: b.note,
    description: `${b.note}. Подиумы выбираются отдельно.`,
    specs: b.specs,
    image: img(`base-${b.id}`),
    art: { type: "stand", levels: b.levels, colors: [] },
  })),
  ...marketPodiums.map<Product>((p) => ({
    slug: `podium-${p.id}`,
    name: `Подиум ${p.name}`,
    line: "market",
    kind: "podium",
    price: p.price,
    short: p.specs[0],
    description: `Подиум ${p.name} для баз Sloyka Market.`,
    specs: [...p.specs, "Комплект: 1 шт"],
    image: img(`podium-${p.id}`),
    art: { type: "stand", levels: 1, colors: ["marzipan"] },
  })),
];

/* ================= Декор и вывески ================= */

const decorProducts: Product[] = [
  {
    slug: "crown",
    name: "Корона",
    line: "decor",
    kind: "decor",
    price: crown.price,
    short: "Маркиза с подвесом для вывески",
    description: crown.note,
    specs: ["Ширина 28 см, глубина 7 см, высота 28,5 см", "Комплект: переходник, 2 направляющие, маркиза, табличка, 2 цепочки"],
    image: img("decor-crown"),
    art: { type: "decor", label: "Корона", variant: "crown" },
    hit: true,
  },
  {
    slug: "sign",
    name: "Вывеска с логотипом",
    line: "decor",
    kind: "decor",
    price: 1000,
    short: "20 × 20, 25 × 25 или 30 × 30 см",
    description: "Индивидуальная плоская вывеска с вашим логотипом или меню. Любая форма, до 4 цветов, под любой тип крепления.",
    specs: ["20 × 20 см — 1000 ₽", "25 × 25 см — 1500 ₽", "30 × 30 см — 2300 ₽", "До 4 цветов"],
    image: img("decor-sign"),
    options: [
      { id: "20", label: "20 × 20 см", price: 1000 },
      { id: "25", label: "25 × 25 см", price: 1500 },
      { id: "30", label: "30 × 30 см", price: 2300 },
    ],
    colors: "none",
    art: { type: "decor", label: "ваш лого", variant: "sign" },
  },
  {
    slug: "table-tent",
    name: "Тейблтент",
    line: "decor",
    kind: "decor",
    price: 900,
    short: "15 × 20 см с логотипом",
    description: "Тейблтент любой формы: логотип, QR-код, меню. Другие размеры — по запросу.",
    specs: ["15 × 20 см с лого — 900 ₽", "До 4 цветов", "Прочие размеры — цена по запросу"],
    image: img("decor-tent"),
    colors: "none",
    art: { type: "decor", label: "QR · меню", variant: "tent" },
  },
  {
    slug: "logo-stand",
    name: "Логотип на подставке",
    line: "decor",
    kind: "decor",
    price: null,
    short: "Любые размеры до 30 см",
    description: "Объёмный логотип на подставке, до 4 цветов. Цена по запросу.",
    specs: ["До 30 см", "До 4 цветов", "Цена по запросу"],
    image: img("decor-logo"),
    art: { type: "decor", label: "logo", variant: "logo" },
  },
];

/* ================= Art Decor: коллекция Waffle's ================= */

const glazes = [
  { id: "raspberry", name: "Малиновый йогурт", swatch: "#F2C4D2" },
  { id: "butter", name: "Сливочное масло", swatch: "#F1ECB2" },
  { id: "pistachio", name: "Фисташка", swatch: "#B8CC8C" },
  { id: "strawberry", name: "Клубнично-ягодный", swatch: "#E0525F" },
  { id: "white", name: "Сахарная глазурь", swatch: "#FFFFFF" },
] as const;

/** Глазурь с фото, если оно есть для этого цвета */
function glazeVariants(model: string, withPhoto: string[]): Variant[] {
  return glazes.map((g) => ({ ...g, image: withPhoto.includes(g.id) ? img(`waffle-${model}-${g.id}`) : undefined }));
}

const waffleCommon = "Вафля цвета «карамель», подтёки — в самых вкусных оттенках глазури. Экологичный пластик.";

const artProducts: Product[] = [
  {
    slug: "waffle-night-light",
    name: "Ночник Waffle Night Light",
    line: "art",
    kind: "decor",
    price: 2490,
    short: "Интерьерный ночник-вафля, USB-подсветка",
    description: `Интерьерный ночник в форме вафли с цветными подтёками. Подтёки можно снять, чтобы было больше света, или оставить — для тёплого приглушённого света. ${waffleCommon}`,
    specs: ["Размер: 120 × 120 × 177 мм", "Светодиодная лампа с USB в комплекте (без адаптера)", "Материал: экологичный пластик"],
    image: img("waffle-nightlight"),
    variants: glazeVariants("nightlight", ["raspberry", "butter", "pistachio", "strawberry"]),
    colors: "none",
    hit: true,
    isNew: true,
  },
  {
    slug: "waffle-round",
    name: "Органайзер Waffle Round",
    line: "art",
    kind: "decor",
    price: 490,
    short: "Круглый органайзер-вафля, 85 × 85 × 80 мм",
    description: `Органайзер для кистей, ручек и мелочей. ${waffleCommon}`,
    specs: ["Размер: 85 × 85 × 80 мм", "Материал: экологичный пластик"],
    image: img("waffle-round"),
    variants: glazeVariants("round", ["raspberry", "pistachio", "strawberry"]),
    colors: "none",
  },
  {
    slug: "waffle-tall",
    name: "Органайзер Waffle Tall",
    line: "art",
    kind: "decor",
    price: 550,
    short: "Высокий органайзер-вафля, 85 × 85 × 103 мм",
    description: `Высокий органайзер для кистей и ручек. ${waffleCommon}`,
    specs: ["Размер: 85 × 85 × 103 мм", "Материал: экологичный пластик"],
    image: img("waffle-tall"),
    variants: glazeVariants("tall", ["raspberry", "pistachio", "strawberry"]),
    colors: "none",
  },
  {
    slug: "waffle-square",
    name: "Органайзер Waffle Square",
    line: "art",
    kind: "decor",
    price: 600,
    short: "Квадратный органайзер-вафля, 85 × 85 × 80 мм",
    description: `Квадратный органайзер для рабочего стола и туалетного столика. ${waffleCommon}`,
    specs: ["Размер: 85 × 85 × 80 мм", "Материал: экологичный пластик"],
    image: img("waffle-square"),
    variants: glazeVariants("square", ["raspberry", "butter", "pistachio", "strawberry"]),
    colors: "none",
  },
  {
    slug: "waffle-combo-cozy",
    name: "Набор «Уютный вечер»",
    line: "art",
    kind: "decor",
    price: 3600,
    short: "Ночник, Round, Square и монетница",
    description:
      "Набор из коллекции Waffle's: ночник, два органайзера и монетница Waffle Jewellery Tray — круглая вафля 15 см, половина с маленькими ячейками, половина с одной большой. Монетница продаётся только в наборах.",
    specs: ["Waffle Night Light", "Waffle Round", "Waffle Square", "Waffle Jewellery Tray, 15 см"],
    image: img("waffle-combo-cozy"),
    gallery: [img("waffle-tray")],
    variants: glazes.map((g) => ({ ...g })),
    colors: "none",
    hit: true,
  },
  {
    slug: "waffle-combo-desk",
    name: "Набор «Рабочий стол»",
    line: "art",
    kind: "decor",
    price: 1800,
    short: "Round, Square, Tall и монетница",
    description:
      "Три органайзера Waffle's и монетница Waffle Jewellery Tray — для порядка на рабочем столе. Монетница продаётся только в наборах.",
    specs: ["Waffle Round", "Waffle Square", "Waffle Tall", "Waffle Jewellery Tray, 15 см"],
    image: img("waffle-combo-desk"),
    gallery: [img("waffle-tray")],
    variants: glazes.map((g) => ({ ...g })),
    colors: "none",
  },
];

/* ================= Toppers: топперы для тортов ================= */

const topperProducts: Product[] = [
  {
    slug: "halloween-toppers",
    name: "Хэллоуин-сет топперов",
    line: "toppers",
    kind: "decor",
    price: 499,
    short: "13 топперов: призраки, летучие мыши, тыквы, ведьмы",
    description:
      "Праздничный сет из 13 топперов для тортов, бенто и капкейков. Можно взять готовое ассорти из разных фигурок или собрать набор из одинаковых персонажей — если у вас большая партия бенто или капкейков. Количество материалов ограничено.",
    specs: ["В наборе: 13 шт", "Ассорти или одинаковые фигурки", "Цвета: белый, чёрный, оранжевый", "Материал: экологичный пластик"],
    image: photo("toppers-ghosts"),
    gallery: [photo("toppers-bats"), photo("toppers-witch"), photo("toppers-mix")],
    options: [
      { id: "mix", label: "Ассорти", price: 499 },
      { id: "ghosts", label: "Призраки", price: 499 },
      { id: "bats", label: "Летучие мыши", price: 499 },
      { id: "pumpkins", label: "Тыквы и ведьмы", price: 499 },
    ],
    colors: "none",
    isNew: true,
    hit: true,
  },
];

/* ================= Всё вместе ================= */

export const products: Product[] = [
  ...setProducts,
  ...classicProducts,
  ...designProducts,
  ...marketProducts,
  ...artProducts,
  ...topperProducts,
  ...decorProducts,
  ...partProducts,
];

export const lineTitles: Record<Line, string> = {
  home: "Sloyka Home",
  classic: "Classic Cakestand",
  design: "Design Stand",
  market: "Sloyka Market",
  decor: "Вывески и декор",
  art: "Art Decor · Waffle's",
  toppers: "Toppers",
};

export const lineNotes: Record<Line, string> = {
  home: "Десертные столики-конструкторы",
  classic: "Подставки для тортов 10–30 см",
  design: "Столики и подиумы 2 в 1",
  market: "Стенды для маркетов и витрин",
  decor: "Вывески, тейблтенты, логотипы",
  art: "Ночники и органайзеры-вафли",
  toppers: "Топперы для тортов и бенто",
};

export const kindTitles: Record<Kind, string> = {
  set: "Готовые сборки",
  stand: "Столики и подставки",
  part: "Комплектующие",
  base: "Базы",
  podium: "Подиумы",
  decor: "Декор",
};

export function productBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function similarProducts(p: Product, count = 4) {
  const same = products.filter((x) => x.line === p.line && x.slug !== p.slug);
  const sameKind = same.filter((x) => x.kind === p.kind);
  return [...sameKind, ...same.filter((x) => x.kind !== p.kind)].slice(0, count);
}

export const hits = products.filter((p) => p.hit);

/** Есть ли у товара выбор, влияющий на цену — тогда показываем «от» */
export const hasPriceFrom = (p: Product) => !!p.options && p.options.length > 1;

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
import { tierName, tierOf } from "./market-rules";
import { withLayers } from "./layers";

/*
 * Каталог Sloyka. Цены, размеры и составы — из сторис бренда (каталог, Sloyka Home, Sloyka Market, Waffle's).
 * Фото: /public/products — вырезаны со скринов сторис, /public/photos — интерьерные кадры.
 * Когда появятся бэкенд и админ-панель, эти данные переедут в базу.
 */

/** Пять направлений бренда (решение заказчика): Home, Market, Podium, Topper, Wish */
export type Line = "home" | "market" | "podium" | "topper" | "wish";
/** Подраздел внутри направления */
export type Series = "modular" | "classic" | "design" | "stands" | "decor" | "waffle" | "cachette" | "toppers" | "wish";
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
export type SizeOption = {
  id: string;
  label: string;
  price: number;
  group?: string;
  /** Своё фото/форма для размера (у Marble и Muffin 28 и 30 см — «приплюснутая» форма) */
  image?: string;
  /** Слои деталей для этого размера (см. ColorZone.layer) */
  layers?: Record<string, string>;
  /** Логотип на этом размере не делается (Muffin и Marble 10 см — по матрице 03.11) */
  noLogo?: boolean;
  /** Свои зоны цвета для этого варианта (наборы Minies: у каждого подиума свой цвет) */
  zones?: ColorZone[];
};

/**
 * Зона цвета — часть изделия, которую покупатель красит отдельно (столешница, ножка, крышка…).
 * layer — картинка этой детали на прозрачном фоне (анфас, один масштаб на все слои): когда все зоны
 * с layer, на странице товара слои складываются и красятся по отдельности. Пока layer нет — работает обычное фото.
 */
export type ColorZone = {
  id: string;
  label: string;
  layer?: string;
  /** порядок слоя снизу вверх (что чем перекрывается) */
  order?: number;
};

/** Вариант с готовым фото — цвет глазури у Waffle's */
export type Variant = { id: string; name: string; swatch: string; image?: string };

export type Product = {
  slug: string;
  name: string;
  line: Line;
  series?: Series;
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
  /** Раздельные зоны цвета; если не заданы — берутся из colors */
  zones?: ColorZone[];
  /** Метка «3 в 1» на карточке: во что превращается столик */
  multi?: string;
  /** Можно добавить логотип (цена зависит от диаметра) */
  logoAddon?: boolean;
  /** Сборку можно открыть в конструкторе */
  constructorPreset?: { podium: PodiumId; legs: LegId[]; extra?: HomeExtraId };
  /** Готовая стойка — «Изменить сборку» открывает конструктор Market с ней (подиумы снизу вверх) */
  marketPreset?: { base: string; podiums: string[]; crown: boolean };
  /** Акция: старая цена (перечёркнута), метка и необязательная дата окончания */
  oldPrice?: number;
  promo?: Promo;
  /** Ограниченная палитра: только эти цвета (id из palette.ts) */
  allowedColors?: string[];
  /** Своя метка на карточке (LIMITED и т.п.) — показывается вместо «хит/new» */
  badge?: string;
  /** Логотип за фиксированную доплату (у Cappottina — 500 ₽, врезной) */
  logoFlat?: number;
  /** Логотип красится отдельно: при выборе логотипа появляется зона цвета «Логотип» */
  logoZone?: boolean;
  /** Не больше N разных цветов на изделие (зона «logo» не считается) — Па-Париж: до 3 */
  maxColors?: number;
  /** Заказ только через личку: вместо корзины кнопка «Обсудить заказ» */
  orderVia?: "direct";
  /** Цена «от» (точная — по запросу) */
  priceFrom?: boolean;
  /** Явная категория внутри линейки (иначе определяется автоматически — см. categories.ts) */
  category?: string[];
  /** Только в разделе «Акции» (наборы из разных линеек: Бон-Париж, Марсельеза) — в линейке не показываем */
  promoOnly?: boolean;
  /** Ножки Париж: логотип в подарок; можно без него — останется пустой вырез (под наклейку), цена та же */
  logoGift?: boolean;
  /** Набор «собери сам» (заказчик, 08.11, как комбо у Додо): count позиций, каждая выбирается из items */
  assortment?: { count: number; unit: string; items: { id: string; name: string; image: string }[] };
  /** Как называется выбор варианта: по умолчанию «Глазурь» (кружки-цвета); «Стиль» — кнопки с названием (шкатулки Cachette) */
  variantLabel?: string;
  /** Набор-ассорти: у каждого подиума (зоны p1, p2…) выбирается форма из списка (Minies: Flower, Wave, Cookie) */
  formPick?: string[];
};

/**
 * Акция на товар. ends — последний день акции (ГГГГ-ММ-ДД, включительно): после него цена сама
 * возвращается к oldPrice, метка пропадает. Без ends — действует, пока не уберут.
 */
export type Promo = { label: string; text?: string; ends?: string };

/** Действует ли акция сейчас */
export function promoActive(p: Pick<Product, "promo" | "oldPrice">, now = new Date()): boolean {
  if (!p.promo || p.oldPrice === undefined) return false;
  if (!p.promo.ends) return true;
  return now.getTime() <= new Date(`${p.promo.ends}T23:59:59+03:00`).getTime();
}

/** Цена с учётом акции (если акция закончилась — обычная цена) */
export function effectivePrice(p: Pick<Product, "price" | "promo" | "oldPrice">, now = new Date()): number | null {
  if (p.promo && p.oldPrice !== undefined && !promoActive(p, now)) return p.oldPrice;
  return p.price;
}

/** Зоны цвета товара: заданные явно или из colors (один цвет / столешница + ножка) */
export function zonesOf(p: Pick<Product, "colors" | "zones">): ColorZone[] {
  if (p.zones?.length) return p.zones;
  if (p.colors === "none") return [];
  if (p.colors === "two") return [{ id: "top", label: "Столешница" }, { id: "leg", label: "Ножка" }];
  return [{ id: "main", label: "Цвет" }];
}

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
  /** фото пока нет — показываем иллюстрацию */
  noImage?: boolean;
  /** акционная цена; старая = сумма деталей (подтверждено заказчиком 03.11: Nuts 2900, Moti 2800) */
  promoPrice?: number;
  promo?: Promo;
  allowedColors?: string[];
};

/*
 * В каталоге — только основные готовые сборки (структура заказчика от 27.10, порядок как здесь): остальное собирают в конструкторе.
 * TODO: фото новых сборок (без `image` показывается иллюстрация) — рендеры от заказчика.
 */
const homeSets: SetDef[] = [
  { name: "Fleur Stand", podium: "fleur", legs: ["muff"], podiumColor: "white", legColor: "cherry", hit: true, image: img("set-fleur-muff") },
  { name: "BonBon Stand", podium: "bonbon", legs: ["souffle"], podiumColor: "butter", legColor: "white", hit: true, noImage: true },
  { name: "Cappottina Torre", podium: "cappottina", legs: ["grande", "piccola"], podiumColor: "brownie", legColor: "white", noImage: true },
  { name: "Fleur-Bon", podium: "fleur", legs: ["souffle"], podiumColor: "white", legColor: "ivory", noImage: true },
  { name: "Fleur Pumpkin", podium: "fleur", legs: ["pumpkin"], podiumColor: "white", legColor: "pumpkin-spice", noImage: true },
  { name: "Bon-Fleur", podium: "bonbon", legs: ["muff"], podiumColor: "butter", legColor: "cherry", noImage: true },
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
    hit: true,
    image: photo("set-cappottina-dei-dolci"),
    gallery: [photo("insta-dei-dolci")],
    note: "Высокая фруктовница с ножкой в два яруса.",
  },
  {
    name: "Fleur Nuts",
    podium: "fleur",
    legs: ["muff"],
    extra: "nuts",
    podiumColor: "latte",
    legColor: "latte",
    hit: true,
    image: photo("set-fleur-nuts"),
    note: "Столик для орешков: Fleur на ножке Muff со вкладышем Nuts. Акционные цвета: карамель, латте, пудра, слоновая кость.",
    promoPrice: 2500,
    promo: { label: "Акция" },
    allowedColors: ["caramel", "latte", "powder", "ivory"],
  },
  {
    name: "Fleur Moti",
    podium: "fleur",
    legs: ["muff"],
    extra: "honey",
    podiumColor: "marzipan",
    legColor: "flamingo",
    noImage: true,
    note: "Столик для моти и макарон: Fleur на ножке Muff со вкладышем Honey. Акционные цвета: горький шоколад, фламинго, марципан, ледяной, черничный йогурт.",
    promoPrice: 2400,
    promo: { label: "Акция" },
    allowedColors: ["dark-chocolate", "flamingo", "marzipan", "ice", "blueberry-yogurt"],
  },
  { name: "BonBon Pumpkin", podium: "bonbon", legs: ["pumpkin"], podiumColor: "butter", legColor: "pumpkin-spice", image: img("set-bonbon-pumpkin") },
  { name: "Cappottina Grande", podium: "cappottina", legs: ["grande"], podiumColor: "brownie", legColor: "white", noImage: true },
  { name: "Cappottina Piccola", podium: "cappottina", legs: ["piccola"], podiumColor: "brownie", legColor: "white", noImage: true },
];

function setName(s: SetDef) {
  if (s.name) return s.name;
  const top = [...s.legs].reverse().map(cap);
  return [cap(s.podium), ...top].join(" + ");
}

const slugify = (name: string) => name.toLowerCase().replace(/\s*\+\s*/g, "-").replace(/\s+/g, "-");

// Размеры готовых сборок по матрице заказчика: общий Ø (в скобках — полезная зона) и высота
const setSizes: Record<string, string> = {
  "fleur-stand": "Ø 24 см (полезная зона Ø 19 см), высота 14 см",
  "fleur-bon": "Ø 24 см (полезная зона Ø 19 см), высота 12 см",
  "fleur-pumpkin": "Ø 24 см (полезная зона Ø 19 см), высота 10 см",
  "fleur-moti": "Ø 24 см (полезная зона Ø 19 см), высота 14 см",
  "fleur-nuts": "Ø 24 см (полезная зона Ø 19 см), высота 14 см",
  "bonbon-stand": "Ø 24 см, высота 11,5 см",
  "bon-fleur": "Ø 24 см, высота 13,5 см",
  "bonbon-pumpkin": "Ø 24 см, высота 9,5 см",
  "cappottina-piccola": "Ø 27 см (полезная зона Ø 24 см), высота 8,5 см",
  "cappottina-grande": "Ø 27 см (полезная зона Ø 24 см), высота 14,5 см",
  "cappottina-torre": "Ø 27 см (полезная зона Ø 24 см), высота 22,5 см",
  "cappottina-palazzo": "Ø 27 см (полезная зона Ø 24 см), высота 18,5 см; Attico Ø 22 см (Ø 19 см), высота 4 см",
  "cappottina-dei-dolci": "Ø 27 см (полезная зона Ø 24 см), высота 26,5 см; Attico Ø 22 см (Ø 19 см), высота 4 см",
};

/** Необязательная зона: вкладыш Fleur, если его добавят к заказу (в матрице — «вкладыш*») */
export const insertZone: ColorZone = { id: "insert", label: "Вкладыш (если добавите)" };

/** Зоны цвета сборки: подиум, ножки, вкладыш / Attico, у BonBon — две половины шариков */
function setZones(s: SetDef): ColorZone[] {
  const z: ColorZone[] = [{ id: "top", label: "Подиум" }];
  s.legs.forEach((l, i) => z.push({ id: i ? `leg${i + 1}` : "leg", label: s.legs.length > 1 ? `Ножка ${cap(l)}` : "Ножка" }));
  // соединитель Attico (закручивающаяся «пипка») отдельно не красим — всегда в цвет ножки Grande (заказчик, 04.11)
  if (s.extra === "attico") z.push({ id: "attico", label: "Attico" });
  else if (s.extra) z.push({ id: "insert", label: "Вкладыш" });
  // у Fleur без вкладыша в комплекте — цвет вкладыша, если его докупят («вкладыш*» в матрице)
  else if (s.podium === "fleur") z.push(insertZone);
  if (s.podium === "bonbon") z.push({ id: "balls1", label: "Шарики (половина 1)" }, { id: "balls2", label: "Шарики (половина 2)" });
  return z;
}

const setProducts: Product[] = homeSets.map((s) => {
  const name = setName(s);
  const slug = slugify(name);
  const price =
    podiumPrice(s.podium) + s.legs.reduce((sum, l) => sum + legPrice(l), 0) + (s.extra ? extraPrice(s.extra) : 0);
  const height = s.legs.reduce((h, l) => h + legs.find((x) => x.id === l)!.height, 0);
  return {
    slug,
    name,
    line: "podium",
    series: "modular",
    kind: "set",
    price: s.promoPrice ?? price,
    oldPrice: s.promoPrice !== undefined ? price : undefined,
    promo: s.promo,
    allowedColors: s.allowedColors,
    short: s.podium === "cappottina" ? (s.extra ? "Подиум, столик и фруктовница" : "Подиум и столик") : `Десертный столик, высота ножки ${height} см`,
    multi: s.podium === "cappottina" ? (s.extra ? "3 в 1" : "2 в 1") : undefined,
    description: `${s.note ? s.note + " " : ""}Готовая сборка Sloyka Podium. Детали можно менять и комбинировать между собой: сегодня одна сборка, завтра другая.`,
    specs: [
      `Подиум: ${cap(s.podium)}`,
      `Ножка: ${s.legs.map(cap).join(" + ")}`,
      ...(s.extra ? [`Доп: ${homeExtras.find((e) => e.id === s.extra)!.name}`] : []),
      ...(setSizes[slug] ? [setSizes[slug]] : [`Высота ножки: ${height} см`]),
      ...(s.podium === "cappottina" ? ["Логотип: +500 ₽ (врезной)"] : []),
      ...(s.extra === "attico" ? ["Соединитель Attico — в цвет ножки Grande"] : []),
      "Материал: экологичный пластик PLA",
    ],
    zones: setZones(s),
    isNew: s.podium === "cappottina" || undefined,
    logoAddon: s.podium === "cappottina" || undefined,
    logoFlat: s.podium === "cappottina" ? 500 : undefined,
    image: s.noImage ? undefined : (s.image ?? img(`set-${slug}`)),
    gallery: s.gallery,
    art: { type: "table", podium: s.podium, legs: s.legs, podiumColor: s.podiumColor, legColor: s.legColor, extra: s.extra },
    hit: s.hit,
    // сборки с Attico в конструкторе не собрать (Attico там убран)
    constructorPreset: s.extra === "attico" ? undefined : { podium: s.podium, legs: s.legs, extra: s.extra },
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
    name: `${p.id === "bonbon" ? "BonBon" : p.name} Podium`,
    line: "podium",
    series: "modular",
    kind: "part",
    price: p.price,
    short: p.note,
    description: `${p.note}. Подходит ко всем ножкам Sloyka Podium.`,
    specs: [
      { bonbon: "Ø 24 см (полезная зона Ø 21,5 см), высота 1,5 см", fleur: "Ø 24 см (полезная зона Ø 19 см), высота 2 см", cappottina: "Ø 27 см (полезная зона Ø 24 см), высота 5 см" }[p.id],
      ...(p.id === "cappottina" ? ["Логотип: +500 ₽ (врезной)"] : []),
      ...(p.id === "fleur" ? ["Доп. вкладыши: Nuts 800 ₽, Honey 700 ₽, Flower 750 ₽"] : []),
      ...(p.id === "bonbon" ? ["Доп. шарики: 6 шт — 150 ₽, 12 шт — 300 ₽"] : []),
      "Материал: экологичный пластик PLA",
    ],
    zones:
      p.id === "bonbon"
        ? [{ id: "top", label: "Подиум" }, { id: "balls1", label: "Шарики (половина 1)" }, { id: "balls2", label: "Шарики (половина 2)" }]
        : p.id === "fleur"
          ? [{ id: "top", label: "Подиум" }, insertZone]
          : undefined,
    isNew: p.id === "cappottina" || undefined,
    logoAddon: p.id === "cappottina" || undefined,
    logoFlat: p.id === "cappottina" ? 500 : undefined,
    image: img(`podium-${p.id}`),
    art: { type: "table", podium: p.id, legs: [], podiumColor: "marzipan", legColor: "marzipan" },
  })),
  ...legs.map<Product>((l) => ({
    slug: `leg-${l.id}`,
    name: `Ножка ${l.name}`,
    line: "podium",
    series: "modular",
    kind: "part",
    price: l.price,
    short: l.note,
    description: `Ножка ${l.name}, высота ${l.height} см. Подходит к разным столешницам.${
      l.doubleSided ? " Двустороннее крепление — можно ставить ярусом над другой ножкой." : ""
    }`,
    specs: [`Ø ${{ piccola: "11,5", pumpkin: "13", souffle: "12", muff: "12", grande: "13" }[l.id]} см, высота ${l.height} см`, ...(l.doubleSided ? ["Каскадная: можно ставить ярусом"] : []), "Материал: экологичный пластик PLA"],
    image: img(`leg-${l.id}`),
    art: { type: "table", podium: "bonbon", legs: [l.id], podiumColor: "marzipan", legColor: "latte" },
  })),
  {
    slug: "bonbon-balls",
    zones: [{ id: "balls", label: "Шарики" }],
    name: "Доп. шарики для Bonbon",
    line: "podium",
    series: "modular",
    kind: "part",
    price: 150,
    short: "Запасной комплект шариков, один цвет",
    description:
      "Дополнительный комплект шариков для подиума Bonbon. Набор одного цвета: нужны два цвета — закажите два набора по 6 шариков.",
    specs: ["6 шариков — 150 ₽", "12 шариков — 300 ₽", "Цвет набора: один, из палитры", "Материал: экологичный пластик"],
    options: [
      { id: "6", label: "6 шариков", price: 150 },
      { id: "12", label: "12 шариков (полный набор)", price: 300 },
    ],
    colors: "one",
    art: { type: "table", podium: "bonbon", legs: [], podiumColor: "marzipan", legColor: "marzipan" },
  },
  ...homeExtras.filter((e) => !e.hidden).map<Product>((e) => ({
    slug: `extra-${e.id}`,
    name: e.name,
    line: "podium",
    series: "modular",
    kind: "part",
    price: e.price,
    short: e.note,
    description: `${e.note}.${e.forPodium === "fleur" ? " Вставляется в подиум Fleur." : ""}`,
    specs: [
      `Для подиума: ${cap(e.forPodium)}`,
      ...(e.requiresLeg ? [`Только с ножкой ${cap(e.requiresLeg)}`] : []),
      "Ø 23 см, высота 1 см",
      "Материал: экологичный пластик PLA",
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

/**
 * 28 и 30 см (L и XL) у Muffin и Marble — «приплюснутая» форма (так безопаснее для тяжёлых тортов),
 * остальные размеры — вытянутые. Для L и XL подставляется своё фото `squat`.
 * TODO: фото приплюснутой формы Marble (у Muffin есть), слои деталей обеих форм — от заказчика.
 */
const classicOptions = (col: 2 | 3, squat?: string): SizeOption[] =>
  classicSizes.map((r) => {
    const id = r[0].replace(/\D+/g, "");
    const isSquat = id === "28" || id === "30";
    return { id, label: r[0], group: r[1], price: r[col], ...(id === "10" ? { noLogo: true } : {}), ...(isSquat && squat ? { image: squat } : {}) };
  });

/** Цена логотипа по матрице 03.11: 12–18 см — 300 ₽, 20–30 см — 500 ₽ (на 10 см логотипа нет — noLogo) */
export function logoPrice(sizeLabel: string): number {
  const d = parseFloat(sizeLabel.replace(",", "."));
  return d <= 18 ? 300 : 500;
}

/** Доплата за логотип для товара и размера; null — логотип недоступен */
export function logoCost(p: Pick<Product, "logoAddon" | "logoFlat">, option?: SizeOption): number | null {
  if (!p.logoAddon || option?.noLogo) return null;
  if (p.logoFlat) return p.logoFlat;
  return option ? logoPrice(option.label) : null;
}

// Размеры по матрице заказчика (29.10): диаметр и высота
const classicHeights: Record<string, string> = { "10": "6", "12": "7", "14": "8", "16": "9,5", "18": "10,5", "20": "12", "22": "13", "24": "14", "255": "15", "28": "11", "30": "12" };
const classicSpecs = [
  ...classicSizes.map((r) => `${r[1]} ${r[0]}: высота ${classicHeights[r[0].replace(/\D+/g, "")]} см`),
  "Логотип: +300 ₽ (12–18 см), +500 ₽ (20–30 см); на 10 см — без логотипа",
  "Красятся отдельно: столешница, ножка и логотип",
  "Материал: экологичный пластик PLA",
];
const classicProducts: Product[] = [
  {
    slug: "classic-muffin",
    name: "Muffin",
    line: "podium",
    series: "classic",
    kind: "stand",
    price: 900,
    short: "Воплощение аппетитной кондитерской геометрии с мягкими волнообразными формами",
    description:
      "Столик, дизайн которого вдохновлён плавными очертаниями выпечки, которые идеально подчёркивают «домашний» и уютный кондитерский стиль десертов. Модель выпускается в нескольких размерах (включая увеличенные форматы L и XL), а также адаптирована для нанесения ваших логотипов! Продуманная геометрия гарантирует отличный баланс: ставить торт на подложке на столик максимально удобно и комфортно, а сама конструкция не качается.",
    specs: classicSpecs,
    image: img("classic-muffin"),
    gallery: [img("classic-muffin-l")],
    options: classicOptions(2, img("classic-muffin-l")),
    colors: "two",
    logoAddon: true,
    logoZone: true,
    hit: true,
  },
  {
    slug: "classic-marble",
    name: "Marble",
    line: "podium",
    series: "classic",
    kind: "stand",
    price: 1000,
    short: "Монументальная классика в технологичном исполнении, имитирующая строгие линии мраморной архитектуры",
    description:
      "Модель со строгими архитектурными линиями, визуально напоминающая мраморный столб. Это незаменимый реквизит для ресторанов, статусных презентаций, стильных фуршетов и велком-зон. Модель выпускается в нескольких размерах (включая увеличенные форматы L и XL), а также адаптирована для нанесения ваших логотипов! Он сочетает в себе визуальную тяжесть камня и практичную лёгкость современных материалов.",
    specs: classicSpecs,
    image: img("classic-marble"),
    options: classicOptions(3),
    colors: "two",
    logoAddon: true,
    logoZone: true,
  },
];

/* ================= Design Stand и подиумы ================= */

/** Зоны набора Minies: у каждого подиума свой цвет и цвет шариков */
const miniesZones = (n: number): ColorZone[] =>
  Array.from({ length: n }, (_, i) => [
    { id: `p${i + 1}`, label: `Подиум ${i + 1}` },
    { id: `b${i + 1}`, label: `Шарики ${i + 1}` },
  ]).flat();

const designProducts: Product[] = [
  {
    slug: "willy-wonka",
    name: "Вилли Вонка",
    line: "podium",
    series: "design",
    kind: "stand",
    price: 1300,
    short: "Дофаминовый столик в стиле «Чарли и шоколадная фабрика» с аппетитными подтёками и маршмеллоу-ножкой",
    description: "Столик родился из индивидуального заказа и стал воплощением кондитерской магии. Мы объединили наши фирменные подтёки из вафельной коллекции с фактурной ножкой от лампы-маршмеллоу. Ножка столика откручивается для удобной транспортировки, но для монолитной устойчивости и нагрузки рекомендовано использовать его только с ножкой. Выпускается в трёх размерах: 16, 22 и 28 см.",
    specs: ["16 см: высота 7,5 см", "22 см: высота 10,5 см", "28 см: высота 13,5 см", "Ножка откручивается", "Материал: экологичный пластик PLA"],
    options: [
      { id: "16", label: "16 см", price: 1300 },
      { id: "22", label: "22 см", price: 2000 },
      { id: "28", label: "28 см", price: 2800 },
    ],
    zones: [{ id: "top", label: "Столешница с подтёками" }, { id: "leg", label: "Ножка" }],
    isNew: true,
  },
  {
    slug: "milano",
    zones: [{ id: "lid", label: "Подиум" }, { id: "base", label: "Столик" }],
    name: "Milano Stand",
    line: "podium",
    series: "design",
    kind: "stand",
    price: 1500,
    short: "Изящный дизайнерский столик со съёмным подиумом для быстрой смены кадра",
    description: "Классическая круглая модель на римских мотивах. Главная фишка — съёмный подиум. Это позволяет кондитеру и фуд-фотографу легко менять высоту и объём презентации прямо во время съёмки в одном кадре или вовсе использовать оба элемента столика одновременно для презентации нескольких десертов. Выпускается в двух основных размерах — 16 и 24 см, а дополнительные подиумы можно приобрести отдельно.",
    specs: ["16 см: высота 9,5 см", "24 см: высота 14 см", "Подиум съёмный", "Материал: экологичный пластик PLA"],
    image: img("design-milano"),
    options: [
      { id: "16", label: "16 см", price: 1500 },
      { id: "24", label: "24 см", price: 2500 },
    ],
    hit: true,
  },
  {
    slug: "rossi",
    zones: [{ id: "lid", label: "Подиум" }, { id: "base", label: "Столик" }],
    name: "Rossi Stand",
    line: "podium",
    series: "design",
    kind: "stand",
    price: 1800,
    short: "Первый квадратный столик бренда, переосмысляющий классику Milano",
    description: "Квадратный столик, который сохранил в себе всю функциональность и шарм линейки Milano, но получил принципиально новую форму. Выпускается в двух основных размерах — 16 и 24 см, а дополнительные подиумы можно приобрести отдельно. Отлично подходит для современных тортов с чёткой геометрией.",
    specs: ["16 × 16 см: высота 8,5 см", "24 × 24 см: высота 12,5 см", "Подиум съёмный", "Материал: экологичный пластик PLA"],
    image: img("design-rossi"),
    options: [
      { id: "16", label: "16 см", price: 1800 },
      { id: "24", label: "24 см", price: 3500 },
    ],
  },
  {
    slug: "modular",
    zones: [{ id: "top", label: "Столешница" }, { id: "leg-top", label: "Верх ножки" }, { id: "leg-bottom", label: "Низ ножки" }, { id: "base", label: "Подстолье" }],
    name: "Modular",
    line: "podium",
    series: "design",
    kind: "stand",
    price: 1500,
    short: "Трансформируемый столик-конструктор, позволяющий самостоятельно настраивать высоту и сочетания цветов",
    description: "Первый инновационный столик-конструктор от SLOYKA. Столик состоит из модульных элементов, благодаря которым можно выкручивать нижнюю часть ножки и уменьшать высоту столика, полностью меняя свою подачу. Столик буквально создан для тех, кто любит разнообразие в контенте. Доступен в версиях Bento (16 см), Cake (22 см) и Modular+ с увеличенной столешницей до 25,5 см. Идеальный инструмент для многоуровневых кэнди-баров и сложных фуд-съёмок.",
    specs: ["Bento 16 см: высота 7,5 или 11 см", "Cake 22 см: высота 9,5 или 15 см", "4 части: столешница, верх и низ ножки, подстолье", "Материал: экологичный пластик PLA"],
    image: img("design-modular"),
    options: [
      { id: "16", label: "Bento 16 см", price: 1500 },
      { id: "22", label: "Cake 22 см", price: 2500 },
    ],
  },
  {
    slug: "modular-plus",
    zones: [{ id: "top", label: "Столешница" }, { id: "leg-top", label: "Верх ножки" }, { id: "leg-bottom", label: "Низ ножки" }, { id: "base", label: "Подстолье" }],
    name: "Modular+",
    line: "podium",
    series: "design",
    kind: "stand",
    price: 3300,
    short: "Трансформируемый столик-конструктор, позволяющий самостоятельно настраивать высоту и сочетания цветов",
    description: "Первый инновационный столик-конструктор от SLOYKA. Столик состоит из модульных элементов, благодаря которым можно выкручивать нижнюю часть ножки и уменьшать высоту столика, полностью меняя свою подачу. Столик буквально создан для тех, кто любит разнообразие в контенте. Доступен в версиях Bento (16 см), Cake (22 см) и Modular+ с увеличенной столешницей до 25,5 см. Идеальный инструмент для многоуровневых кэнди-баров и сложных фуд-съёмок.",
    specs: ["Ø 25,5 см: высота 9,5 или 16 см", "4 части: столешница, верх и низ ножки, подстолье", "Материал: экологичный пластик PLA"],
    image: img("design-modular-plus"),
  },
  {
    slug: "podium-i-stand",
    zones: [{ id: "top", label: "Подиум" }, { id: "leg", label: "Ножка" }, { id: "logo", label: "Логотип" }],
    name: "Podium I Stand",
    line: "podium",
    series: "design",
    kind: "stand",
    price: 5000,
    short: "Масштабная 30-сантиметровая «сцена» с откручивающейся ножкой для главных кондитерских шедевров",
    description: "Полноразмерный премиальный столик диаметром 30 см, созданный для того, чтобы кондитерам больше не приходилось ставить большие красивые торты на случайные подставки. Столик оснащён надёжной откручивающейся ножкой, благодаря чему его максимально удобно брать с собой на выездные съёмки, маркеты и мастер-классы. Это настоящий подиум, который делает акцент на масштабе и дороговизне изделия, стоящего на нём.",
    specs: ["Ø 32 см (полезная зона Ø 30 см), высота 11 см", "Комплект: подиум, ножка, ваш логотип", "Ножка откручивается", "Материал: экологичный пластик PLA"],
    image: img("design-podium-i"),
    badge: "LIMITED",
  },
  {
    slug: "podium-i",
    zones: [{ id: "top", label: "Подиум" }, { id: "logo", label: "Логотип" }],
    name: "Podium I",
    line: "podium",
    series: "design",
    kind: "podium",
    price: 3300,
    short: "Подиум 30 см с вашим логотипом — без ножки",
    description: "Полноразмерный премиальный столик диаметром 30 см, созданный для того, чтобы кондитерам больше не приходилось ставить большие красивые торты на случайные подставки. Столик оснащён надёжной откручивающейся ножкой, благодаря чему его максимально удобно брать с собой на выездные съёмки, маркеты и мастер-классы. Это настоящий подиум, который делает акцент на масштабе и дороговизне изделия, стоящего на нём.",
    specs: ["Ø 32 см (полезная зона Ø 30 см), высота 2,8 см", "Комплект: подиум, ваш логотип", "Материал: экологичный пластик PLA"],
    image: img("podium-podium-i"),
    badge: "LIMITED",
  },
  {
    slug: "podium-milano",
    name: "Milano Podium",
    line: "podium",
    series: "design",
    kind: "podium",
    price: 800,
    short: "Съёмный подиум Milano — отдельно или запасной к столику",
    description: "Классическая круглая модель на римских мотивах. Главная фишка — съёмный подиум. Это позволяет кондитеру и фуд-фотографу легко менять высоту и объём презентации прямо во время съёмки в одном кадре или вовсе использовать оба элемента столика одновременно для презентации нескольких десертов. Выпускается в двух основных размерах — 16 и 24 см, а дополнительные подиумы можно приобрести отдельно.",
    specs: ["16 см: высота 2,5 см", "24 см: высота 3,5 см", "Материал: экологичный пластик PLA"],
    image: img("podium-milano"),
    options: [
      { id: "16", label: "16 см", price: 800 },
      { id: "24", label: "24 см", price: 1400 },
    ],
  },
  {
    slug: "podium-rossi",
    name: "Rossi Podium",
    line: "podium",
    series: "design",
    kind: "podium",
    price: 1000,
    short: "Съёмный квадратный подиум Rossi — отдельно или запасной к столику",
    description: "Квадратный столик, который сохранил в себе всю функциональность и шарм линейки Milano, но получил принципиально новую форму. Выпускается в двух основных размерах — 16 и 24 см, а дополнительные подиумы можно приобрести отдельно. Отлично подходит для современных тортов с чёткой геометрией.",
    specs: ["16 × 16 см: высота 2,8 см", "24 × 24 см: высота 2,8 см", "Материал: экологичный пластик PLA"],
    image: img("podium-rossi"),
    options: [
      { id: "16", label: "16 см", price: 1000 },
      { id: "24", label: "24 см", price: 1600 },
    ],
  },
  {
    slug: "penny",
    name: "Penny",
    line: "podium",
    series: "design",
    kind: "podium",
    price: 850,
    short: "Рифлёный подиум-«монетка», 14–18 см",
    description: "Низкий рифлёный подиум. Хорош поодиночке и пирамидкой из трёх размеров.",
    specs: ["14 см: Ø 15 см, высота 2,5 см", "16 см: Ø 17,5 см, высота 2,5 см", "18 см: Ø 19,5 см, высота 2,5 см", "Материал: экологичный пластик PLA"],
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
    line: "podium",
    series: "design",
    kind: "podium",
    price: 1900,
    short: "3 подиума одного размера или пирамидка 14 + 16 + 18",
    description: "Наборы из трёх подиумов Penny: одного размера или Penny Combo — пирамидка из 14, 16 и 18 см.",
    specs: ["Set-14, Set-16, Set-18 — 3 подиума одного размера", "Combo — 14, 16 и 18 см", "Каждый подиум — своего цвета", "Материал: экологичный пластик PLA"],
    image: img("podium-penny-set"),
    options: [
      { id: "set14", label: "Set-14", price: 1900 },
      { id: "set16", label: "Set-16", price: 2200 },
      { id: "set18", label: "Set-18", price: 2800 },
      { id: "combo", label: "Combo 14+16+18", price: 2300 },
    ],
    zones: [{ id: "p1", label: "Подиум 1" }, { id: "p2", label: "Подиум 2" }, { id: "p3", label: "Подиум 3" }],
    hit: true,
  },
  {
    slug: "penny-logo",
    name: "Penny с логотипом",
    line: "podium",
    series: "design",
    kind: "podium",
    price: 1150,
    short: "Подиум Penny с площадкой под ваш логотип",
    description: "Тот же рифлёный подиум Penny, но с площадкой и вашим логотипом. Макет логотипа согласуем после заказа.",
    specs: ["Размеры — как у Penny", "Логотип по вашему макету", "Материал: экологичный пластик PLA"],
    image: img("podium-penny"),
    options: [
      { id: "14", label: "14 см", price: 1150 },
      { id: "16", label: "16 см", price: 1250 },
      { id: "18", label: "18 см", price: 1350 },
    ],
    zones: [{ id: "top", label: "Подиум" }, { id: "logo", label: "Логотип" }],
  },
  {
    slug: "penny-logo-set",
    name: "Набор Penny с логотипом",
    line: "podium",
    series: "design",
    kind: "podium",
    price: 2800,
    short: "3 подиума Penny с логотипом",
    description: "Наборы из трёх подиумов Penny с вашим логотипом: одного размера или Combo 14 + 16 + 18 см. Макет логотипа согласуем после заказа.",
    specs: ["Set-14, Set-16, Set-18 — 3 подиума одного размера", "Combo — 14, 16 и 18 см", "Логотип на каждом подиуме", "Материал: экологичный пластик PLA"],
    image: img("podium-penny-set"),
    options: [
      { id: "set14", label: "Set-14", price: 2800 },
      { id: "set16", label: "Set-16", price: 3100 },
      { id: "set18", label: "Set-18", price: 3700 },
      { id: "combo", label: "Combo 14+16+18", price: 3200 },
    ],
    zones: [
      { id: "p1", label: "Подиум 1" },
      { id: "p2", label: "Подиум 2" },
      { id: "p3", label: "Подиум 3" },
      { id: "logo1", label: "Логотип 1" },
      { id: "logo2", label: "Логотип 2" },
      { id: "logo3", label: "Логотип 3" },
    ],
  },
  {
    slug: "minies",
    name: "Minies",
    line: "podium",
    series: "design",
    kind: "podium",
    price: 350,
    short: "Мини-подиум 10 см: цветок, волна или печенье",
    description: "Маленький подиум 10 см для пирожных, капкейков и бенто. Три формы: Flower, Wave и Cookie. Сама подставка — одного цвета, шарики — второго.",
    image: photo("minies-sets-color"),
    gallery: [photo("minies-sets-milk"), photo("minies-stack")],
    specs: ["Ø 10 см, высота 2,5 см", "Формы: Flower, Wave, Cookie", "Материал: экологичный пластик PLA"],
    options: [
      { id: "flower", label: "Flower", price: 350 },
      { id: "wave", label: "Wave", price: 350 },
      { id: "cookie", label: "Cookie", price: 350 },
    ],
    zones: [{ id: "top", label: "Подиум" }, { id: "balls", label: "Шарики" }],
  },
  {
    slug: "minies-set",
    name: "Набор Minies",
    line: "podium",
    series: "design",
    kind: "podium",
    price: 800,
    short: "3, 6 или 12 мини-подиумов любых форм",
    description: "Полное ассорти мини-подиумов Minies: в наборе любые формы — Flower, Wave, Cookie — и у каждого подиума свои два цвета: подставка и шарики.",
    image: photo("minies-stack"),
    gallery: [photo("minies-sets-color"), photo("minies-sets-milk")],
    formPick: ["Flower", "Wave", "Cookie"],
    specs: ["Set-3 — 800 ₽", "Set-6 — 1600 ₽", "Set-12 — 3200 ₽", "Ø 10 см, высота 2,5 см", "Материал: экологичный пластик PLA"],
    options: [
      { id: "set3", label: "Set-3", price: 800, zones: miniesZones(3) },
      { id: "set6", label: "Set-6", price: 1600, zones: miniesZones(6) },
      { id: "set12", label: "Set-12", price: 3200, zones: miniesZones(12) },
    ],
    // ассорти (заказчик, 03.11): у каждого подиума своя форма и два цвета — подставка и шарики
    zones: miniesZones(3),
  },
];

/* ================= Sloyka Market: стенды ================= */

const podiumName = (id: string) => marketPodiums.find((p) => p.id === id)!.name;
const marketPrice = (base: string, ids: string[], withCrown = false) =>
  marketBases.find((b) => b.id === base)!.price +
  ids.reduce((s, id) => s + marketPodiums.find((p) => p.id === id)!.price, 0) +
  (withCrown ? crown.price : 0);

type StandDef = { slug: string; name: string; base: string; podiums: string[]; crown?: boolean; image?: string; hit?: boolean; isNew?: boolean; size: string; price?: number; zones?: ColorZone[] };

/**
 * Зоны цвета готовой стойки (заказчик, 03.11): каждый подиум отдельно, ножки, логотип у Парижа, корона.
 * Подиумы снизу вверх; если подиумов больше, чем ярусов, нижний — приставной (на столе перед стойкой).
 */
function standZones(s: { base: string; podiums: string[]; crown?: boolean }): ColorZone[] {
  const levels = marketBases.find((b) => b.id === s.base)!.levels;
  // сверху вниз, как в матрице и в конструкторе
  return [
    ...[...s.podiums.keys()].reverse().map((i) => {
      const id = s.podiums[i];
      return { id: `p${i + 1}`, label: `${tierName(tierOf(i, s.podiums.length, levels))} — ${podiumName(id)}` };
    }),
    { id: "legs", label: "Ножки" },
    ...(s.base === "paris" ? [{ id: "logo", label: "Логотип" }] : []),
    // корона (заказчик, 03.11): стойки с переходником — один цвет, шапка — 50/50 два цвета
    ...(s.crown
      ? [
          { id: "crown", label: "Корона: стойки с переходником" },
          { id: "crown-cap1", label: "Корона: шапка, половина 1" },
          { id: "crown-cap2", label: "Корона: шапка, половина 2" },
        ]
      : []),
  ];
}

/** Па-Париж: две одинаковые стойки Париж — цвета общие на обе */
const parisZones: ColorZone[] = [
  { id: "p1", label: "Подиум 1" },
  { id: "p2", label: "Подиум 2" },
  { id: "p3", label: "Подиум 3" },
  { id: "legs", label: "Ножки" },
  { id: "logo", label: "Логотип" },
];

// Готовые стойки по матрице заказчика (29.10). В матрице подиумы перечислены сверху вниз, здесь — снизу вверх.
const marketStands: StandDef[] = [
  { slug: "stand-paris-marquise", name: "Париж", base: "paris", podiums: ["marquise-21", "marquise-21", "marquise-21"], image: "stand-paris", hit: true, size: "21,5 × 21 × 17 см" },
  // цена по деталям — 3450 ₽ (в матрице было 3350, заказчик подтвердил 3450 — 03.11)
  { slug: "stand-paris-boutique", name: "Бутик", base: "paris", podiums: ["loge-3", "loge-2", "diadem"], size: "21 × 25 × 35,5 см" },
  { slug: "stand-parisienne", name: "Парижанка", base: "paris", podiums: ["cascade-3", "cascade-3", "cascade-3"], size: "22 × 25 × 21,5 см" },
  { slug: "stand-florence-marseille", name: "Флоренция", base: "florence", podiums: ["marseille-25", "marseille-25"], image: "stand-florence", size: "15 × 25 × 15 см" },
  { slug: "stand-signorina", name: "Синьорина", base: "florence", podiums: ["marquise-25", "marquise-25"], image: "stand-florence-marquise", size: "14,5 × 25 × 15 см" },
  { slug: "stand-francesco", name: "Франческо", base: "florence", podiums: ["cascade-2", "cascade-2", "cascade-2"], crown: true, size: "22 × 25 × 43 см" },
  { slug: "stand-dolce-vita", name: "Дольче Вита", base: "florence", podiums: ["tribune-2", "amphitheatre", "tribune-3"], size: "21 × 25 × 24 см" },
  { slug: "stand-babylon-tribune", name: "Вавилон", base: "babylon", podiums: ["agora", "amphitheatre", "tribune-3", "tribune-2"], image: "stand-babylon-tribune", size: "28 × 25 × 31 см" },
  { slug: "stand-semiramis", name: "Семирамида", base: "babylon", podiums: ["agora", "agora", "amphitheatre", "amphitheatre"], crown: true, size: "28 × 25 × 50 см" },
  { slug: "stand-eden", name: "Эдэм", base: "babylon", podiums: ["marseille-25", "marseille-25", "marseille-25"], crown: true, size: "21,5 × 25 × 50 см" },
  { slug: "stand-chocolatiere", name: "Шоколатьера", base: "babylon", podiums: ["patio-3", "patio-3", "patio-1", "patio-1"], crown: true, image: "stand-babylon-crown", size: "28 × 25 × 50 см" },
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
      series: "stands",
      kind: "set",
      price: s.price ?? marketPrice(s.base, s.podiums, s.crown),
      short: `${list.join(", ")}${s.crown ? " + Корона" : ""}`,
      description: `Готовая стойка на ножках ${base.name}: ${[...s.podiums].reverse().map(podiumName).join(", ")} (сверху вниз)${s.crown ? " и корона с табличкой" : ""}. Сборку можно изменить в конструкторе.`,
      specs: [`Ножки: ${base.name}`, `Подиумы: ${list.join(", ")}`, ...(s.crown ? ["Корона с табличкой"] : []), `Габариты: ${s.size}`, "Материал: экологичный пластик PLA"],
      // рендер сборки из деталей (04.11); на странице товара стойка собирается и красится вживую
      image: `/products/render/${s.slug}.webp`,
      art: { type: "stand", levels: base.levels, colors: ["marzipan", "marzipan", "marzipan"], crown: s.crown },
      hit: s.hit,
      marketPreset: { base: s.base, podiums: s.podiums, crown: !!s.crown },
      zones: s.zones ?? standZones(s),
      logoGift: s.base === "paris" || undefined,
    };
  }),
  {
    slug: "stand-leon",
    name: "Леон",
    line: "market",
    series: "stands",
    kind: "set",
    price: 3500,
    short: "Самостоятельная стойка: 2 подиума, ножки и логотип",
    description: "Отдельная модель вне конструктора: два подиума-полки на ножках с вашим логотипом.",
    specs: ["Габариты: 29 × 26 × 20,5 см", "Полка: 29 × 13 см", "Этажи: 10,5 и 20,5 см", "Материал: экологичный пластик PLA"],
    zones: [{ id: "p1", label: "Подиум сверху" }, { id: "p2", label: "Подиум снизу" }, { id: "legs", label: "Ножки" }, { id: "logo", label: "Логотип" }],
    art: { type: "stand", levels: 2, colors: ["marzipan", "marzipan"] },
    isNew: true,
  },
  {
    slug: "wheel-carnival",
    name: "Колесо фортуны «Карнавал»",
    line: "market",
    series: "decor",
    kind: "decor",
    category: ["accessories"],
    price: 2000,
    short: "Интерактив для витрины и маркета: розыгрыши и подарки",
    description: "Настольное колесо фортуны для маркетов и витрин. Каждую деталь можно сделать своим цветом из палитры.",
    specs: ["Ø 18 см, габариты 18 × 4 × 23,5 см", "Секции и разделители — по два цвета через одну", "Материал: экологичный пластик PLA"],
    zones: [
      { id: "frame", label: "Кронштейн и диск" },
      { id: "arrow", label: "Стрелка" },
      { id: "sec1", label: "Секции (половина 1)" },
      { id: "sec2", label: "Секции (половина 2)" },
      { id: "div1", label: "Разделители (половина 1)" },
      { id: "div2", label: "Разделители (половина 2)" },
      { id: "center", label: "Центральный диск" },
    ],
    art: { type: "decor", label: "Карнавал", variant: "logo" },
  },
  ...marketBases.map<Product>((b) => ({
    slug: `base-${b.id}`,
    name: `Ножки ${b.name}`,
    line: "market",
    series: "stands",
    kind: "base",
    price: b.price,
    short: b.note,
    description: `${b.note}. Подиумы выбираются отдельно.`,
    specs: b.specs,
    image: img(`base-${b.id}`),
    art: { type: "stand", levels: b.levels, colors: [] },
    logoGift: b.id === "paris" || undefined,
  })),
  ...marketPodiums.map<Product>((p) => ({
    slug: `podium-${p.id}`,
    name: `Подиум ${p.name}`,
    line: "market",
    series: "stands",
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

// Корона — не отдельный товар (заказчик, 03.11): только доп к стойке в конструкторе и в готовых стойках
const decorProducts: Product[] = [
  {
    slug: "sign",
    name: "Вывеска с логотипом",
    line: "market",
    series: "decor",
    kind: "decor",
    price: 1000,
    short: "20 × 20, 25 × 25 или 30 × 30 см",
    description: "Индивидуальная плоская вывеска с вашим логотипом или меню. Любая форма, до 4 цветов, под любой тип крепления. Макет и детали согласуем в личных сообщениях.",
    specs: ["до 20 × 20 см — 1000 ₽", "до 25 × 25 см — 1500 ₽", "до 30 × 30 см — 2300 ₽", "До 4 цветов из палитры"],
    orderVia: "direct",
    priceFrom: true,
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
    line: "market",
    series: "decor",
    kind: "decor",
    price: 900,
    priceFrom: true,
    orderVia: "direct",
    short: "Логотип, QR-код или меню — цена по запросу",
    description: "Тейблтент любой формы: логотип, QR-код, меню. Цена зависит от размера и макета — согласуем в личных сообщениях.",
    specs: ["От 900 ₽", "До 4 цветов", "Размер и макет — по согласованию"],
    image: img("decor-tent"),
    colors: "none",
    art: { type: "decor", label: "QR · меню", variant: "tent" },
  },
  {
    slug: "logo-stand",
    name: "Логотип на подставке",
    line: "market",
    series: "decor",
    kind: "decor",
    price: 500,
    priceFrom: true,
    orderVia: "direct",
    short: "Объёмный логотип на подставке — цена по запросу",
    description: "Объёмный логотип на подставке, до 4 цветов. Цена зависит от размера и макета — согласуем в личных сообщениях.",
    specs: ["От 500 ₽", "До 4 цветов", "Размер и макет — по согласованию"],
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

/** Глазурь с фото (фото заказчика 08.11: все 5 глазурей для Round, Tall, Square и набора «Рабочий стол») */
function glazeVariants(model: string): Variant[] {
  return glazes.map((g) => ({ ...g, image: photo(`waffle-${model}-${g.id}`) }));
}

const waffleCommon = "Вафля цвета «карамель», подтёки — в самых вкусных оттенках глазури. Экологичный пластик PLA.";

/*
 * Коллекция Waffle's по матрице 06.11. Ночника на сайте нет (заказчик, 06.11: для него нужны отдельные документы на ИП),
 * набор «Уютный вечер» с ночником тоже убран. Фото сетов по 3 шт. пока нет — показываем фото одного органайзера в глазури.
 */
const waffleSingles: { id: string; name: string; price: number; short: string; text: string; size: string }[] = [
  { id: "round", name: "Round", price: 490, short: "Круглый органайзер-вафля, Ø 8,5 см, h 8 см", text: "Органайзер для кистей, ручек и мелочей.", size: "Ø 8,5 см (внутри Ø 6 см), высота 8 см" },
  { id: "tall", name: "Tall", price: 550, short: "Высокий органайзер-вафля, Ø 8,5 см, h 10 см", text: "Высокий органайзер для кистей и ручек.", size: "Ø 8,5 см (внутри Ø 6 см), высота 10 см" },
  { id: "square", name: "Square", price: 600, short: "Квадратный органайзер-вафля, 8,5 × 8,5 см, h 10 см", text: "Квадратный органайзер для рабочего стола и туалетного столика.", size: "8,5 × 8,5 см (внутри 6 × 6 см), высота 10 см" },
];
const waffleSets: { id: string; price: number; oldPrice: number }[] = [
  { id: "round", price: 1300, oldPrice: 1470 },
  { id: "tall", price: 1450, oldPrice: 1650 },
  { id: "square", price: 1600, oldPrice: 1800 },
];

const artProducts: Product[] = [
  ...waffleSingles.map(
    (w): Product => ({
      slug: `waffle-${w.id}`,
      name: `Органайзер Waffle ${w.name}`,
      line: "home",
      series: "waffle",
      kind: "decor",
      price: w.price,
      short: w.short,
      description: `${w.text} ${waffleCommon}`,
      specs: [`Размер: ${w.size}`, "Материал: экологичный пластик PLA"],
      image: photo(`waffle-${w.id}-white`),
      variants: glazeVariants(w.id),
      colors: "none",
    }),
  ),
  {
    slug: "waffle-tray",
    name: "Монетница Waffle Jewellery Tray",
    line: "home",
    series: "waffle",
    kind: "decor",
    price: 400,
    short: "Круглая вафля для украшений, Ø 15 см",
    description: "Монетница для колец, серёжек и мелочей: половина с маленькими ячейками, половина с одной большой. Цвет «карамель». Экологичный пластик PLA.",
    specs: ["Размер: Ø 15 см, высота 1 см", "Материал: экологичный пластик PLA"],
    image: img("waffle-tray"),
    gallery: [photo("waffle-desk-white")],
    colors: "none",
  },
  {
    slug: "waffle-combo-desk",
    name: "Набор «Рабочий стол»",
    line: "home",
    series: "waffle",
    kind: "decor",
    price: 1800,
    oldPrice: 2040,
    promo: { label: "Акция", text: "Дешевле, чем по отдельности" },
    short: "Round, Tall, Square и монетница",
    description: "Три органайзера Waffle's в одной глазури и монетница Waffle Jewellery Tray — для порядка на рабочем столе.",
    specs: ["Waffle Round", "Waffle Tall", "Waffle Square", "Waffle Jewellery Tray, Ø 15 см"],
    image: photo("waffle-desk-clean-white"),
    // на каждую глазурь: набор как есть и набор с вещами
    variants: glazes.map((g) => ({ ...g, image: photo(`waffle-desk-clean-${g.id}`) })),
    gallery: glazes.map((g) => photo(`waffle-desk-${g.id}`)),
    colors: "none",
    hit: true,
  },
  ...waffleSets.map((w): Product => {
    const one = waffleSingles.find((x) => x.id === w.id)!;
    return {
      slug: `waffle-${w.id}-set`,
      name: `Набор Waffle ${one.name} × 3`,
      line: "home",
      series: "waffle",
      kind: "decor",
      price: w.price,
      oldPrice: w.oldPrice,
      promo: { label: "Акция", text: "Дешевле, чем по отдельности" },
      short: `Три органайзера ${one.name} в одной глазури`,
      description: `Три органайзера Waffle ${one.name} в одной глазури. ${one.text} ${waffleCommon}`,
      specs: ["3 шт. в одной глазури", `Размер одного: ${one.size}`, "Материал: экологичный пластик PLA"],
      image: photo(`waffle-${w.id}-white`),
      variants: glazeVariants(w.id),
      colors: "none",
    };
  }),
];

/* ================= Шкатулки Cachette ================= */
/*
 * Матрица 06.11: вместо палитры — «стиль» с фото (заказчик: конструктор не делаем, другие цвета — через личку;
 * сфотографировали новый цвет — добавляем стиль конкретной шкатулке). Стиль без фото не показываем.
 * Фото 08.11: Vintage и Pastel — одиночные кадры, цвета от заказчика.
 * Cherry Lady (Колонны, Цирк) — фото 08.11 (одиночные заказчик сделал нейросетью, плюс живое фото на стойках). Autumn (Цирк) — фото 08.11.
 */
const cachetteNote = "Другие цвета — на заказ: напишите нам в Instagram* или Telegram, подберём под ваш интерьер.";
/** Дополнительные расцветки без названия стиля (Цирк, фото 08.11) */
const circusExtra = [
  { id: "pistachio", name: "Малиновый йогурт + фисташка" },
  { id: "strawberry", name: "Малиновый йогурт + клубничный йогурт" },
  { id: "blueberry", name: "Черничный йогурт + малиновый йогурт" },
  { id: "cherry2", name: "Вишня + малиновый йогурт" },
];
const cachettes: { id: string; name: string; vintage: string; pastel: string; cherry?: boolean; autumn?: boolean; extra?: { id: string; name: string }[] }[] = [
  { id: "baguette", name: "Багет", vintage: "латте", pastel: "пудра" },
  { id: "cafe", name: "Кафе", vintage: "пряная тыква, бронза", pastel: "сливочное масло, латте" },
  { id: "columns", name: "Колонны", vintage: "Тихий океан, бронза", pastel: "ледяной, латте", cherry: true },
  { id: "circus", name: "Цирк", vintage: "марципан, вишня", pastel: "малиновый йогурт, ледяной", cherry: true, autumn: true, extra: circusExtra },
];
/** Все шкатулки во всех стилях с фото — для наборов «собери сам» */
const cachetteItems = cachettes.flatMap((c) => [
  { id: `${c.id}.vintage`, name: `${c.name} · Vintage — ${c.vintage}`, image: photo(`cachette-${c.id}-vintage`) },
  { id: `${c.id}.pastel`, name: `${c.name} · Pastel — ${c.pastel}`, image: photo(`cachette-${c.id}-pastel`) },
  ...(c.cherry ? [{ id: `${c.id}.cherry`, name: `${c.name} · Cherry Lady`, image: photo(`cachette-${c.id}-cherry`) }] : []),
  ...(c.autumn ? [{ id: `${c.id}.autumn`, name: `${c.name} · Autumn`, image: photo(`cachette-${c.id}-autumn`) }] : []),
  ...(c.extra ?? []).map((x) => ({ id: `${c.id}.${x.id}`, name: `${c.name} · ${x.name}`, image: photo(`cachette-${c.id}-${x.id}`) })),
]);
const cachetteProducts: Product[] = [
  ...cachettes.map(
    (c): Product => ({
      slug: `cachette-${c.id}`,
      name: `Шкатулка Cachette «${c.name}»`,
      line: "home",
      series: "cachette",
      kind: "decor",
      price: 450,
      short: "Шкатулка для украшений и мелочей",
      description: `Шкатулка с крышкой из коллекции Cachette — для украшений, мелочей и маленьких подарков. ${cachetteNote}`,
      // размер от заказчика (08.11): корпус 6 × 6 × 7 см, крышка 2–3 см — у моделей по-разному
      specs: ["Размер: 6 × 6 × 7 см + крышка 2–3 см (зависит от модели)", "Материал: экологичный пластик PLA"],
      image: photo(`cachette-${c.id}-vintage`),
      variantLabel: "Стиль",
      variants: [
        { id: "vintage", name: `Vintage — ${c.vintage}`, swatch: "", image: photo(`cachette-${c.id}-vintage`) },
        { id: "pastel", name: `Pastel — ${c.pastel}`, swatch: "", image: photo(`cachette-${c.id}-pastel`) },
        ...(c.cherry ? [{ id: "cherry", name: "Cherry Lady", swatch: "", image: photo(`cachette-${c.id}-cherry`) }] : []),
        ...(c.autumn ? [{ id: "autumn", name: "Autumn", swatch: "", image: photo(`cachette-${c.id}-autumn`) }] : []),
        ...(c.extra ?? []).map((x) => ({ id: x.id, name: x.name, swatch: "", image: photo(`cachette-${c.id}-${x.id}`) })),
      ],
      // Cherry Lady на стойках Paris (живое фото заказчика)
      gallery: [...(c.cherry ? [photo("cachette-cherry-stand")] : []), ...(c.extra ? [photo(`cachette-${c.id}-all`)] : [])],
      colors: "none",
    }),
  ),
  ...[
    { n: 4, price: 1600 },
    { n: 8, price: 3000 },
    { n: 12, price: 4200 },
  ].map(
    (s): Product => ({
      slug: `cachette-set-${s.n}`,
      name: `Набор шкатулок Cachette × ${s.n}`,
      line: "home",
      series: "cachette",
      kind: "decor",
      price: s.price,
      short: `${s.n} шкатулок ассорти`,
      description: `Соберите свой набор из ${s.n} шкатулок Cachette: для каждой выберите модель и стиль — можно все одинаковые, можно все разные. ${cachetteNote}`,
      specs: [`${s.n} шт. на ваш выбор`, "Размер одной: 6 × 6 × 7 см + крышка 2–3 см", "Материал: экологичный пластик PLA"],
      assortment: { count: s.n, unit: "Шкатулка", items: cachetteItems },
      image: photo("cachette-set-pastel"),
      gallery: [photo("cachette-set-vintage")],
      colors: "none",
    }),
  ),
];

/* ================= Toppers: топперы для тортов ================= */

const topperProducts: Product[] = [
  {
    slug: "halloween-toppers",
    name: "Хэллоуин-сет топперов",
    line: "topper",
    series: "toppers",
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
  // цены заказчика (08.11); техническую информацию (размеры, вес) добавим позже
  {
    slug: "topper-number",
    name: "Топпер цифра-безе",
    line: "topper",
    series: "toppers",
    kind: "decor",
    category: ["numbers"],
    price: 70,
    priceFrom: true,
    short: "Объёмная цифра-безе на шпажке, 6 или 3,5 см",
    description: "Цифра с объёмным рельефом, как у безе, на шпажке — для торта, бенто или капкейков. Из нескольких цифр собирается любое число или дата. Буквы и другие символы — под запрос, напишите нам.",
    specs: ["Большая, 6 см — 150 ₽", "Маленькая, 3,5 см — 70 ₽", "Цена за одну цифру", "Буквы — под запрос", "Материал: экологичный пластик PLA"],
    image: photo("topper-numbers-tray"),
    gallery: [photo("topper-numbers-2345"), photo("topper-numbers-6789"), photo("topper-number-300k")],
    options: [
      { id: "6", label: "Большая, 6 см", price: 150 },
      { id: "35", label: "Маленькая, 3,5 см", price: 70 },
    ],
    variantLabel: "Цифра",
    variants: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => ({
      id: d,
      name: d,
      swatch: "",
      image: ["0", "2", "4", "6", "7", "9"].includes(d) ? photo(`topper-number-${d}`) : undefined,
    })),
    colors: "one",
    isNew: true,
  },
  {
    slug: "topper-happy-birthday",
    name: "Топпер Happy Birthday",
    line: "topper",
    series: "toppers",
    kind: "decor",
    category: ["birthday"],
    price: 100,
    priceFrom: true,
    short: "Большой на шпажках или маленький на торт",
    description: "Объёмная надпись Happy Birthday из нескольких слоёв. Большой — на двух шпажках, маленький кладётся прямо на торт или бенто.",
    specs: ["Большой, на шпажках — 130 ₽", "Маленький — 100 ₽", "Материал: экологичный пластик PLA"],
    image: photo("topper-hb-topper-green"),
    gallery: [photo("topper-hb-small-pink-stand"), photo("topper-hb-small-pink-butter"), photo("topper-hb-small-blue")],
    options: [
      { id: "big", label: "Большой", price: 130, image: photo("topper-hb-topper-green") },
      { id: "small", label: "Маленький", price: 100, image: photo("topper-hb-small-pink-butter") },
    ],
    zones: [
      { id: "base", label: "Основа" },
      { id: "text", label: "Надпись" },
    ],
    isNew: true,
  },
  {
    slug: "topper-lollipop",
    name: "Топпер-леденец",
    line: "topper",
    series: "toppers",
    kind: "decor",
    category: ["neutral", "birthday"],
    price: 100,
    priceFrom: true,
    short: "Леденец на шпажке: спираль, вертушка или лучи",
    description: "Плоский топпер-леденец с белыми полосками. Хорошо смотрится россыпью из нескольких цветов.",
    specs: ["Большой — 130 ₽, 3 дизайна: спираль, вертушка, лучи", "Маленький — 100 ₽, 2 дизайна: спираль, вертушка", "Материал: экологичный пластик PLA"],
    image: photo("topper-lollipops"),
    options: [
      { id: "big", label: "Большой", price: 130 },
      { id: "small", label: "Маленький", price: 100 },
    ],
    // у маленького нет «лучей» — подсказка в specs, состав проверяем при заказе
    variantLabel: "Дизайн",
    variants: [
      { id: "spiral", name: "Спираль", swatch: "" },
      { id: "swirl", name: "Вертушка", swatch: "" },
      { id: "rays", name: "Лучи (только большой)", swatch: "" },
    ],
    colors: "one",
    isNew: true,
  },
  {
    slug: "topper-custom",
    name: "Именной топпер",
    line: "topper",
    series: "toppers",
    kind: "decor",
    category: ["birthday"],
    price: null,
    orderVia: "direct",
    short: "Цифра с именем и другие топперы на заказ",
    description: "Топпер по вашей идее: цифра с именем, надпись, буквы, логотип. Напишите нам — обсудим макет, цвета и цену.",
    specs: ["Под запрос: макет, цвета и цена — в личке", "Материал: экологичный пластик PLA"],
    image: photo("topper-topper-name-2"),
    gallery: [photo("topper-number-300k")],
    colors: "none",
  },
  {
    slug: "topper-teddy",
    name: "Топпер Teddy is One",
    line: "topper",
    series: "toppers",
    kind: "decor",
    category: ["first-year"],
    price: 130,
    short: "Мишка на шпажке на первый годик",
    description: "Топпер-мишка с надписью Teddy is One — на торт к первому дню рождения. Хорошо дополняется топперами One и цифрой 1.",
    specs: ["Материал: экологичный пластик PLA"],
    image: photo("topper-one-pink-set"),
    gallery: [photo("topper-one-blue-set"), photo("topper-numbers-2345-teddy")],
    colors: "none",
    isNew: true,
  },
  {
    slug: "topper-one",
    name: "Топпер One",
    line: "topper",
    series: "toppers",
    kind: "decor",
    category: ["first-year"],
    price: 100,
    short: "Надпись One на шпажке",
    description: "Каллиграфическая надпись One на шпажке — на первый годик. В комплекте с мишкой Teddy и цифрой 1 получается целый набор.",
    specs: ["Материал: экологичный пластик PLA"],
    image: photo("topper-one-blue-set"),
    gallery: [photo("topper-one-pink-set")],
    colors: "one",
    isNew: true,
  },
];

/* ================= Wish: брелоки, бирки, подвесы ================= */

/*
 * Пока пусто: раздел Wish появится в каталоге и на главной сам, как только здесь будет хотя бы один товар.
 * Шаблон нового товара и пошаговая инструкция — docs/dobavlenie-tovara.md.
 *
 * Пример (раскомментировать и поправить):
 * {
 *   slug: "keychain-logo",
 *   name: "Брелок с логотипом",
 *   line: "wish",
 *   series: "wish",
 *   kind: "decor",
 *   price: 250,
 *   short: "Именной брелок для клиентов кондитера",
 *   description: "…",
 *   specs: ["Материал: экологичный пластик"],
 *   image: img("keychain-logo"),   // файл public/products/keychain-logo.webp
 *   colors: "one",
 * },
 */
// матрица 08.11: брелоки; бирки потом — на конструкторе, пока под запрос
const wishProducts: Product[] = [
  {
    slug: "tags-logo",
    name: "Бирки с вашим логотипом",
    line: "wish",
    series: "wish",
    kind: "decor",
    category: ["tags"],
    price: null,
    orderVia: "direct",
    short: "Бирки для упаковки: логотип, ник, надпись",
    description: "Бирки для упаковки десертов и подарков с вашим логотипом, ником или надписью: круг, волна, арка, капкейк, цветок, планка. Напишите нам — подберём форму, цвета и тираж. Скоро — конструктор бирок прямо на сайте.",
    specs: ["Форма, текст и цвета — под ваш бренд", "Цена и минимальный тираж — в личке", "Материал: экологичный пластик PLA"],
    image: photo("tags-front2"),
    gallery: [photo("tags-front"), photo("tags-stand")],
    colors: "none",
  },
  {
    slug: "keychain-nut",
    name: "Брелок Nut",
    line: "wish",
    series: "wish",
    kind: "decor",
    price: 100,
    short: "Брелок-орешек на цепочке",
    description: "Брелок в форме орешка на золотистой цепочке-шарике — для ключей, сумки или подарка к заказу. Экологичный пластик PLA.",
    specs: ["Цвета: брауни, пудра, карамель", "Материал: экологичный пластик PLA, цепочка из металла"],
    image: photo("keychain-nut-all"),
    gallery: [photo("keychain-nut-lay")],
    variantLabel: "Цвет",
    variants: [
      { id: "brownie", name: "Брауни", swatch: "", image: photo("keychain-nut-brownie") },
      { id: "powder", name: "Пудра", swatch: "", image: photo("keychain-nut-powder") },
      { id: "caramel", name: "Карамель", swatch: "", image: photo("keychain-nut-caramel") },
    ],
    colors: "none",
    isNew: true,
  },
  {
    slug: "keychain-mixer",
    name: "Подвеска «Миксер»",
    line: "wish",
    series: "wish",
    kind: "decor",
    category: ["keychains"],
    // TODO: цена от заказчика — пока заказ через личку
    price: null,
    orderVia: "direct",
    short: "Подвеска-миксер с петелькой",
    description: "Плоская подвеска в виде планетарного миксера — на ключи, сумку или как подарок кондитеру. Напишите нам, подберём цвета.",
    specs: ["Цвета — под заказ", "Материал: экологичный пластик PLA"],
    image: photo("keychain-mixer"),
    colors: "none",
    isNew: true,
  },
  {
    slug: "keychain-macaron",
    name: "Брелок Macaron",
    line: "wish",
    series: "wish",
    kind: "decor",
    price: 250,
    short: "Брелок-макарон, штучно или 10 шт.",
    description: "Брелок в форме макарона с петелькой — к ключам, на сумку или как комплимент к заказу. Набор — 10 одинаковых брелоков одного цвета, для гостей, клиентов и подарков. Экологичный пластик PLA.",
    specs: ["1 шт. — 250 ₽", "10 шт. одного цвета — 1 500 ₽", "Цвета: малиновый йогурт + белый, сливочное масло + малиновый йогурт", "Материал: экологичный пластик PLA"],
    image: photo("keychain-macaron-stand"),
    gallery: [photo("keychain-macaron-close")],
    options: [
      { id: "1", label: "1 шт.", price: 250 },
      { id: "10", label: "10 шт.", price: 1500 },
    ],
    variantLabel: "Цвет",
    variants: [
      { id: "raspberry", name: "Малиновый йогурт + белый", swatch: "", image: photo("keychain-macaron-raspberry") },
      { id: "butter", name: "Сливочное масло + малиновый йогурт", swatch: "", image: photo("keychain-macaron-butter") },
    ],
    colors: "none",
    isNew: true,
  },
];

/* ================= Акции-наборы (из разных линеек) ================= */

/*
 * Старые цены подтверждены заказчиком 03.11: Па-Париж 5000, Бон-Париж 5000, Марсельеза 7500 (= сумма по отдельности).
 * Наборы по акции: товары из разных линеек в единой цветовой гамме (до 3 цветов на весь набор).
 * TODO: как раскладываются 3 цвета по деталям — уточнить у заказчика (пока покупатель выбирает 3 цвета, раскладку подтверждаем при заказе).
 */
const threeColors: ColorZone[] = [
  { id: "c1", label: "Цвет 1" },
  { id: "c2", label: "Цвет 2" },
  { id: "c3", label: "Цвет 3" },
];
const promoSets: Product[] = [
  {
    slug: "promo-bon-paris",
    logoGift: true,
    promoOnly: true,
    name: "Бон-Париж",
    line: "market",
    series: "stands",
    kind: "set",
    price: 4000,
    oldPrice: 5000,
    promo: { label: "Акция" },
    short: "Столик BonBon на ножке Souffle + стойка Париж",
    description: "Набор в единой цветовой гамме: десертный столик BonBon на ножке Souffle и стойка Париж с маркизами. До 3 одинаковых цветов на оба изделия.",
    specs: ["Столик BonBon + ножка Souffle", "Стойка Париж с маркизами 21 см", "До 3 цветов на весь набор"],
    art: { type: "stand", levels: 3, colors: ["marzipan", "marzipan", "marzipan"] },
    zones: threeColors,
  },
  {
    slug: "promo-pa-paris",
    logoGift: true,
    name: "Па-Париж",
    line: "market",
    series: "stands",
    kind: "set",
    price: 4000,
    oldPrice: 5000,
    promo: { label: "Акция" },
    short: "6 × Маркиза-21, ножки Париж, логотип",
    description: "Две стойки Париж с маркизами в единой цветовой гамме: до 3 цветов на весь набор, логотип — отдельно, до 4 цветов.",
    specs: ["Состав: 6 × Маркиза-21, ножки Париж, логотип", "Габариты: 21,5 × 21 × 17 см", "Цвета: вся палитра, но до 3 цветов на набор", "Логотип — отдельно, до 4 цветов (макет согласуем)", "Материал: экологичный пластик PLA"],
    art: { type: "stand", levels: 3, colors: ["marzipan", "marzipan", "marzipan"] },
    zones: parisZones,
    maxColors: 3,
  },
  {
    slug: "promo-marseillaise",
    logoGift: true,
    promoOnly: true,
    name: "Марсельеза",
    line: "market",
    series: "stands",
    kind: "set",
    price: 6000,
    oldPrice: 7500,
    promo: { label: "Акция" },
    short: "Две стойки Париж + столик BonBon",
    description: "Две стойки Париж и десертный столик BonBon в единой цветовой гамме, до 3 цветов на весь набор.",
    specs: ["Стойка Париж × 2", "Столик BonBon + ножка Souffle", "До 3 цветов на весь набор"],
    art: { type: "stand", levels: 3, colors: ["marzipan", "marzipan", "marzipan"] },
    zones: threeColors,
  },
];

/* ================= Карточки-семейства ================= */

/**
 * Связанные товары в одной карточке: подиум ↔ столик ↔ сборки. В каталоге каждый — своя плитка,
 * а на странице товара — переключатель между ними. addons — «Добавить к заказу» (вкладыши, шарики).
 */
export type Family = { id: string; title: string; caption?: string; members: { slug: string; label: string }[]; addons?: string[]; noAddonsFor?: string[] };

export const families: Family[] = [
  { id: "penny", title: "Penny", caption: "штучно, набором или с логотипом", members: [{ slug: "penny", label: "Штучно" }, { slug: "penny-set", label: "Наборы" }, { slug: "penny-logo", label: "С логотипом" }, { slug: "penny-logo-set", label: "Наборы с логотипом" }] },
  { id: "minies", title: "Minies", caption: "штучно или набором", members: [{ slug: "minies", label: "Штучно" }, { slug: "minies-set", label: "Наборы" }] },
  { id: "milano", title: "Milano", members: [{ slug: "podium-milano", label: "Подиум" }, { slug: "milano", label: "Столик" }] },
  { id: "rossi", title: "Rossi", members: [{ slug: "podium-rossi", label: "Подиум" }, { slug: "rossi", label: "Столик" }] },
  { id: "podium-i", title: "Podium I", members: [{ slug: "podium-i", label: "Подиум" }, { slug: "podium-i-stand", label: "Столик с ножкой" }] },
  {
    id: "fleur",
    title: "Fleur",
    members: [
      { slug: "podium-fleur", label: "Подиум" },
      { slug: "fleur-stand", label: "Fleur Stand" },
      { slug: "fleur-bon", label: "Fleur-Bon" },
      { slug: "fleur-pumpkin", label: "Fleur Pumpkin" },
      { slug: "fleur-moti", label: "Fleur Moti · акция" },
      { slug: "fleur-nuts", label: "Fleur Nuts · акция" },
    ],
    addons: ["extra-nuts", "extra-flower", "extra-honey"],
    // у Moti и Nuts вкладыш уже в комплекте, доп. вкладыши в матрице — только для Podium, Stand, Bon, Pumpkin
    noAddonsFor: ["fleur-moti", "fleur-nuts"],
  },
  {
    id: "bonbon",
    title: "BonBon",
    members: [
      { slug: "podium-bonbon", label: "Подиум" },
      { slug: "bonbon-stand", label: "BonBon Stand" },
      { slug: "bon-fleur", label: "Bon-Fleur" },
      { slug: "bonbon-pumpkin", label: "BonBon Pumpkin" },
    ],
    addons: ["bonbon-balls"],
  },
  { id: "modular", title: "Modular", caption: "Bento, Cake или Modular+", members: [{ slug: "modular", label: "Bento 16 / Cake 22" }, { slug: "modular-plus", label: "Modular+ 25,5" }] },
  // Sloyka Market: карточки ПАРИЖ, ФЛОРЕНЦИЯ, ВАВИЛОН из матрицы — готовые стойки на одних ножках
  {
    id: "paris",
    title: "Париж",
    caption: "стойки на ножках Париж",
    members: [
      { slug: "stand-paris-marquise", label: "Париж" },
      { slug: "promo-pa-paris", label: "Па-Париж · акция" },
      { slug: "stand-paris-boutique", label: "Бутик" },
      { slug: "stand-parisienne", label: "Парижанка" },
    ],
  },
  {
    id: "florence",
    title: "Флоренция",
    caption: "стойки на ножках Флоренция",
    members: [
      { slug: "stand-florence-marseille", label: "Флоренция" },
      { slug: "stand-signorina", label: "Синьорина" },
      { slug: "stand-francesco", label: "Франческо" },
      { slug: "stand-dolce-vita", label: "Дольче Вита" },
    ],
  },
  {
    id: "babylon",
    title: "Вавилон",
    caption: "стойки на ножках Вавилон",
    members: [
      { slug: "stand-babylon-tribune", label: "Вавилон" },
      { slug: "stand-semiramis", label: "Семирамида" },
      { slug: "stand-eden", label: "Эдэм" },
      { slug: "stand-chocolatiere", label: "Шоколатьера" },
    ],
  },
  {
    id: "cappottina",
    title: "Cappottina",
    members: [
      { slug: "podium-cappottina", label: "Подиум" },
      { slug: "cappottina-grande", label: "Grande" },
      { slug: "cappottina-piccola", label: "Piccola" },
      { slug: "cappottina-torre", label: "Torre" },
      { slug: "cappottina-palazzo", label: "Palazzo" },
      { slug: "cappottina-dei-dolci", label: "Dei Dolci" },
    ],
  },
];

export function familyOf(slug: string): Family | undefined {
  return families.find((f) => f.members.some((m) => m.slug === slug));
}

/* ================= Всё вместе ================= */

export const products: Product[] = ([
  ...setProducts,
  ...classicProducts,
  ...designProducts,
  ...marketProducts,
  ...artProducts,
  ...cachetteProducts,
  ...topperProducts,
  ...wishProducts,
  ...promoSets,
  ...decorProducts,
  ...partProducts,
] as Product[]).map((p) => withLayers(p, zonesOf));

export const lineTitles: Record<Line, string> = {
  home: "Sloyka Home",
  market: "Sloyka Market",
  podium: "Sloyka Podium",
  topper: "Sloyka Topper",
  wish: "Sloyka Wish",
};

export const lineNotes: Record<Line, string> = {
  home: "Вафли, шкатулки и домашний декор",
  market: "Стойки, подиумы, вывески и реквизит для маркетов",
  podium: "Столики для тортов и модульные столики-конструкторы",
  topper: "Топперы для тортов и бенто",
  wish: "Брелоки, бирки и подвесы",
};

export const seriesTitles: Record<Series, string> = {
  modular: "Модульные столики",
  classic: "Классическая линейка",
  design: "Дизайнерская линейка",
  stands: "Стойки",
  decor: "Вывески и декор",
  waffle: "Вафельная коллекция",
  cachette: "Шкатулки Cachette",
  toppers: "Топперы",
  wish: "Брелоки, бирки, подвесы",
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
export const hasPriceFrom = (p: Product) => !!p.priceFrom || (!!p.options && p.options.length > 1);

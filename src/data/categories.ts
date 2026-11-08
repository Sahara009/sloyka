import type { Line, Product } from "./products";

/*
 * Категории внутри линеек — структура заказчика от 27.10. Порядок в массивах = порядок в каталоге.
 * Категория товара определяется автоматически (categoriesOf), а поле `category` у товара её переопределяет.
 * Товар может быть в нескольких категориях (подиумы BonBon/Fleur/Cappottina — и в Dessert Stand, и в «Подиумах»).
 */
export type Category = { id: string; title: string; note?: string; builder?: { title: string; text: string; href: string } };

export const categories: Record<Line, Category[]> = {
  podium: [
    { id: "classic", title: "Классические столики" },
    { id: "design", title: "Дизайнерские столики" },
    {
      id: "dessert",
      title: "Dessert Stand",
      builder: { title: "Собери свой столик", text: "Подиум, ножка в один или два яруса и вкладыши — цена считается сразу.", href: "/constructor" },
    },
    { id: "podiums", title: "Подиумы" },
  ],
  market: [
    {
      id: "stands",
      title: "Стойки",
      builder: { title: "Собери свою стойку", text: "База, подиумы по ярусам и корона с вывеской — несовместимое конструктор подскажет.", href: "/constructor?line=market" },
    },
    { id: "signs", title: "Вывески" },
    { id: "accessories", title: "Аксессуары для витрины" },
  ],
  home: [
    { id: "organizers", title: "Органайзеры" },
    { id: "boxes", title: "Шкатулки" },
  ],
  topper: [
    { id: "halloween", title: "Хэллоуин" },
    { id: "birthday", title: "День рождения" },
    { id: "numbers", title: "Цифры" },
    { id: "neutral", title: "Нейтральные" },
    { id: "first-year", title: "Первый годик" },
  ],
  wish: [
    { id: "keychains", title: "Брелоки" },
    { id: "tags", title: "Бирки" },
  ],
};

const designStands = ["podium-i-stand", "modular", "modular-plus", "milano", "rossi", "willy-wonka"];

/** Категории товара внутри его линейки */
export function categoriesOf(p: Product): string[] {
  if (p.category?.length) return p.category;
  switch (p.series) {
    case "classic":
      return ["classic"];
    case "design":
      return designStands.includes(p.slug) ? ["design"] : ["podiums"];
    case "modular":
      // подиумы Sloyka Podium показываем и в Dessert Stand (элементы), и в «Подиумах»
      return ["podium-bonbon", "podium-fleur", "podium-cappottina"].includes(p.slug) ? ["dessert", "podiums"] : ["dessert"];
    case "stands":
      return ["stands"];
    case "decor":
      return ["signs"];
    case "waffle":
      return ["organizers"];
    case "cachette":
      return ["boxes"];
    case "wish":
      return ["keychains"];
    case "toppers":
      return p.slug.includes("halloween") ? ["halloween"] : ["neutral"];
    default:
      return [];
  }
}

export function categoryTitle(line: Line, id: string) {
  return categories[line].find((c) => c.id === id)?.title ?? "";
}

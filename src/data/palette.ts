// Фирменная палитра пластика Sloyka (25 цветов, 5 групп).
// HEX подобраны по картинке палитры — уточнить у заказчика точные значения.

export type PaletteColor = { id: string; name: string; hex: string };
export type PaletteGroup = { id: string; title: string; subtitle: string; colors: PaletteColor[] };

export const palette: PaletteGroup[] = [
  {
    id: "milk",
    title: "Milk",
    subtitle: "молочные нейтральные",
    colors: [
      { id: "white", name: "Белый", hex: "#FFFFFF" },
      { id: "powder", name: "Пудра", hex: "#FCE9E6" },
      { id: "marzipan", name: "Марципан", hex: "#F2E8D8" },
      { id: "ivory", name: "Слоновая кость", hex: "#E6DDBB" },
    ],
  },
  {
    id: "pastel",
    title: "Pastel",
    subtitle: "мягкие цветные",
    colors: [
      { id: "butter", name: "Сливочное масло", hex: "#FDF59A" },
      { id: "pistachio", name: "Фисташка", hex: "#E9F86C" },
      { id: "ice", name: "Ледяной", hex: "#A9F3EC" },
      { id: "raspberry-yogurt", name: "Малиновый йогурт", hex: "#FCC9DD" },
      { id: "flamingo", name: "Фламинго", hex: "#F9B8F0" },
      { id: "blueberry-yogurt", name: "Черничный йогурт", hex: "#C483EE" },
    ],
  },
  {
    id: "pop",
    title: "Pop",
    subtitle: "яркие акценты",
    colors: [
      { id: "green-apple", name: "Зелёное яблоко", hex: "#8CFB5A" },
      { id: "strawberry-yogurt", name: "Клубничный йогурт", hex: "#FB386C" },
      { id: "cherry", name: "Вишня", hex: "#C1161E" },
    ],
  },
  {
    id: "sweet",
    title: "Sweet",
    subtitle: "тёплые и вкусные",
    colors: [
      { id: "pumpkin-spice", name: "Пряная тыква", hex: "#D5662A" },
      { id: "caramel", name: "Карамель", hex: "#DFA052" },
      { id: "latte", name: "Латте", hex: "#E6B077" },
      { id: "brownie", name: "Брауни", hex: "#7A4A30" },
      { id: "dark-chocolate", name: "Горький шоколад", hex: "#4E3620" },
    ],
  },
  {
    id: "deep",
    title: "Deep",
    subtitle: "глубокие и контрастные",
    colors: [
      { id: "grey", name: "Серый", hex: "#B5B5B5" },
      { id: "bronze", name: "Бронза", hex: "#84692A" },
      { id: "kombu", name: "Комбу", hex: "#3F5410" },
      { id: "sea", name: "Морской", hex: "#1F67B8" },
      { id: "pacific", name: "Тихий океан", hex: "#123E6E" },
      { id: "blackberry", name: "Ежевичный сироп", hex: "#34176E" },
      { id: "black", name: "Чёрный", hex: "#0B0B0B" },
    ],
  },
];

export const allColors: PaletteColor[] = palette.flatMap((g) => g.colors);

export function colorById(id: string): PaletteColor {
  return allColors.find((c) => c.id === id) ?? allColors[0];
}

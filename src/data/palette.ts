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
      { id: "powder", name: "Пудра", hex: "#F1E1D9" },
      { id: "marzipan", name: "Марципан", hex: "#F7F2E8" },
      { id: "ivory", name: "Слоновая кость", hex: "#EADFC4" },
    ],
  },
  {
    id: "pastel",
    title: "Pastel",
    subtitle: "мягкие цветные",
    colors: [
      { id: "butter", name: "Сливочное масло", hex: "#F8E5A4" },
      { id: "pistachio", name: "Фисташка", hex: "#E2F5AC" },
      { id: "ice", name: "Ледяной", hex: "#AEDAE1" },
      { id: "raspberry-yogurt", name: "Малиновый йогурт", hex: "#E5C1CC" },
      { id: "flamingo", name: "Фламинго", hex: "#F9BBDF" },
      { id: "blueberry-yogurt", name: "Черничный йогурт", hex: "#B5A1F0" },
    ],
  },
  {
    id: "pop",
    title: "Pop",
    subtitle: "яркие акценты",
    colors: [
      { id: "green-apple", name: "Зелёное яблоко", hex: "#70E664" },
      { id: "strawberry-yogurt", name: "Клубничный йогурт", hex: "#DB3D58" },
      { id: "cherry", name: "Вишня", hex: "#A92A2D" },
    ],
  },
  {
    id: "sweet",
    title: "Sweet",
    subtitle: "тёплые и вкусные",
    colors: [
      { id: "pumpkin-spice", name: "Пряная тыква", hex: "#CA6E49" },
      { id: "caramel", name: "Карамель", hex: "#D89E66" },
      { id: "latte", name: "Латте", hex: "#D0A77B" },
      { id: "brownie", name: "Брауни", hex: "#7D5B4A" },
      { id: "dark-chocolate", name: "Горький шоколад", hex: "#584B41" },
    ],
  },
  {
    id: "deep",
    title: "Deep",
    subtitle: "глубокие и контрастные",
    colors: [
      { id: "grey", name: "Серый", hex: "#8C9CA5" },
      { id: "bronze", name: "Бронза", hex: "#7E6537" },
      { id: "kombu", name: "Комбу", hex: "#54572B" },
      { id: "sea", name: "Морской", hex: "#196BAE" },
      { id: "pacific", name: "Тихий океан", hex: "#152B47" },
      { id: "blackberry", name: "Ежевичный сироп", hex: "#3F295D" },
      { id: "black", name: "Чёрный", hex: "#191919" },
    ],
  },
];

export const allColors: PaletteColor[] = palette.flatMap((g) => g.colors);

export function colorById(id: string): PaletteColor {
  return allColors.find((c) => c.id === id) ?? allColors[0];
}

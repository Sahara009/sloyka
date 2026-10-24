import { lineTitles, type Product } from "@/data/products";

/** Нормализация для поиска: регистр, ё→е, лишние пробелы */
const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();

/** Русские подсказки к латинским названиям — чтобы находилось «флер», «бонбон», «вафли» */
const aliases: Record<string, string> = {
  fleur: "флер флёр цветок",
  bonbon: "бонбон",
  cappottina: "каппоттина капоттина",
  pumpkin: "пампкин тыква",
  muff: "мафф",
  souffle: "суфле",
  grande: "гранде",
  piccola: "пикола пикколо",
  waffle: "вафля вафли вафельный",
  milano: "милано",
  rossi: "росси",
  penny: "пенни",
  classic: "торт подставка",
  halloween: "хэллоуин хеллоуин",
};

export function searchText(p: Product) {
  const base = [p.name, p.short, lineTitles[p.line], p.slug.replace(/-/g, " "), p.description].join(" ");
  const extra = Object.entries(aliases)
    .filter(([k]) => norm(base).includes(k))
    .map(([, v]) => v)
    .join(" ");
  return norm(`${base} ${extra}`);
}

/** Все слова запроса должны встречаться (по началу слова или внутри) */
export function matchProduct(p: Product, q: string) {
  const words = norm(q).split(" ").filter(Boolean);
  if (!words.length) return true;
  const t = searchText(p);
  return words.every((w) => t.includes(w));
}

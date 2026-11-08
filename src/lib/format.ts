export function formatPrice(value: number | null): string {
  if (value === null) return "по запросу";
  return new Intl.NumberFormat("ru-RU").format(value) + " ₽";
}

/** Затемнить/осветлить HEX-цвет: amount от -1 до 1 */
export function shade(hex: string, amount: number): string {
  const n = hex.replace("#", "");
  const rgb = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
  const out = rgb.map((c) => {
    const v = amount < 0 ? c * (1 + amount) : c + (255 - c) * amount;
    return Math.round(Math.max(0, Math.min(255, v)))
      .toString(16)
      .padStart(2, "0");
  });
  return "#" + out.join("");
}

export const site = {
  name: "Sloyka",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // Контакты от заказчика (27.10, email — 03.11). Телефона не будет.
  telegram: "https://t.me/sloykahome?direct",
  instagram: "https://instagram.com/sloyka.home",
  email: "sloyka.home@mail.ru", // для предложений и обращений (заказчик, 03.11)
  phone: "",
  city: "Санкт-Петербург",
  /** Продавец — для подвала, оферты и согласия на обработку данных */
  seller: { name: "Максимов Сергей Игоревич", inn: "780250001600", status: "Самозанятый" },
};

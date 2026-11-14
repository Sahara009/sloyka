/** Связь с покупателем: Telegram / Instagram / WhatsApp / ВКонтакте — ссылки для админки и уведомлений (заказчик, 13.11: звонки не делаем) */
export type ContactVia = "telegram" | "instagram" | "whatsapp" | "vk";
export const contactLabels: Record<ContactVia, string> = { telegram: "Telegram", instagram: "Instagram", whatsapp: "WhatsApp", vk: "ВКонтакте" };
/** где без ника не найти: подсказка в поле */
export const handleHint: Record<ContactVia, string | null> = {
  telegram: "Ник в Telegram, если номер скрыт: @name",
  instagram: "Ник в Instagram: @name",
  whatsapp: null,
  vk: "Ссылка или ник ВКонтакте",
};
export const handleRequired: Record<ContactVia, boolean> = { telegram: false, instagram: true, whatsapp: false, vk: true };

const digits = (phone: string) => {
  const d = phone.replace(/\D/g, "");
  return d.length === 11 && d.startsWith("8") ? `7${d.slice(1)}` : d.length === 10 ? `7${d}` : d;
};
const nickOf = (handle?: string | null) =>
  handle?.trim().replace(/^https?:\/\/(www\.)?(t\.me|instagram\.com|vk\.com)\//, "").replace(/^@/, "").replace(/\/$/, "") || "";

/** Ссылка, чтобы написать покупателю. Без ника — Telegram по номеру; Instagram и ВК без ника не найти */
export function contactLink(via: ContactVia, phone: string, handle?: string | null): string | null {
  const nick = nickOf(handle);
  if (via === "telegram") return nick ? `https://t.me/${nick}` : `https://t.me/+${digits(phone)}`;
  if (via === "whatsapp") return `https://wa.me/${digits(phone)}`;
  if (via === "instagram") return nick ? `https://instagram.com/${nick}` : null;
  return nick ? `https://vk.com/${nick}` : null;
}

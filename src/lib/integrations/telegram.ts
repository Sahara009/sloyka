/**
 * Уведомления в Telegram: новый заказ, оплата, отмена, возврат, заявка с сайта.
 * TELEGRAM_BOT_TOKEN — токен бота от @BotFather.
 * TELEGRAM_CHAT_ID — кому писать (можно несколько через запятую). Узнать id: каждый получатель
 * пишет боту /start, потом `node --env-file=.env.local scripts/telegram-chats.mjs`.
 * Без ключей уведомления просто не отправляются — сайт работает как обычно.
 */
import { formatPrice, site } from "@/lib/format";

export function telegramConfigured() {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);

/** Отправить сообщение всем получателям. Ошибки не роняют заказ — только пишутся в лог */
export async function notify(html: string): Promise<void> {
  if (!telegramConfigured()) return;
  const chats = process.env.TELEGRAM_CHAT_ID!.split(",").map((s) => s.trim()).filter(Boolean);
  await Promise.all(
    chats.map(async (chat_id) => {
      try {
        const res = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id, text: html, parse_mode: "HTML", disable_web_page_preview: true }),
        });
        if (!res.ok) console.warn("[telegram]", res.status, await res.text());
      } catch (e) {
        console.warn("[telegram]", e instanceof Error ? e.message : e);
      }
    }),
  );
}

type OrderInfo = {
  number: string;
  id?: string;
  customerName: string;
  phone: string;
  email: string;
  delivery: string;
  address: string;
  amount: number;
  deliveryPrice?: number | null;
  items: { name: string; qty: number; price: number; details?: string[] }[];
  comment?: string | null;
};

const adminLink = (o: { id?: string }) => (o.id ? `\n<a href="${site.url}/admin/orders/${o.id}">Открыть в админке</a>` : "");

export function newOrderText(o: OrderInfo) {
  const lines = o.items.map((i) => `• ${esc(i.name)} × ${i.qty} — ${formatPrice(i.price * i.qty)}${i.details?.length ? `\n   <i>${esc(i.details.join(" · "))}</i>` : ""}`);
  const total = o.amount + (o.deliveryPrice ?? 0);
  return [
    `🧁 <b>Новый заказ ${o.number}</b> — ждёт оплаты`,
    ...lines,
    `Товары: ${formatPrice(o.amount)}${o.deliveryPrice ? ` · доставка: ${formatPrice(o.deliveryPrice)}` : ""} · <b>итого ${formatPrice(total)}</b>`,
    `👤 ${esc(o.customerName)}, ${esc(o.phone)}, ${esc(o.email)}`,
    `📦 ${esc(o.delivery)}: ${esc(o.address)}`,
    ...(o.comment ? [`💬 ${esc(o.comment)}`] : []),
  ].join("\n") + adminLink(o);
}

export const paidText = (o: { number: string; id?: string; total: number; customerName?: string }) =>
  `✅ <b>Оплачен заказ ${o.number}</b> — ${formatPrice(o.total)}${o.customerName ? `, ${esc(o.customerName)}` : ""}` + adminLink(o);

export const canceledText = (o: { number: string; id?: string }) => `⚪️ Заказ ${o.number}: оплата не прошла или отменена` + adminLink(o);

export const refundText = (o: { number: string; id?: string; amount: number; full: boolean }) =>
  `↩️ Возврат по заказу ${o.number}: ${formatPrice(o.amount)}${o.full ? " (полный)" : " (частичный)"}` + adminLink(o);

export const requestText = (r: { topic: string; name: string; contact: string; message?: string }) =>
  [`✉️ <b>Заявка: ${esc(r.topic)}</b>`, `👤 ${esc(r.name)}, ${esc(r.contact)}`, ...(r.message ? [`💬 ${esc(r.message)}`] : [])].join("\n") + `\n<a href="${site.url}/admin/requests">Все заявки</a>`;

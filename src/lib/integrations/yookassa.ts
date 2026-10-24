import { randomUUID } from "node:crypto";

/**
 * ЮKassa — подходит самозанятым: карты, СБП, SberPay; чек в «Мой налог» ЮKassa формирует сама,
 * если в личном кабинете включена интеграция с «Мой налог».
 * Ключи: YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY (ЛК ЮKassa → Интеграция → Ключи API).
 * Уведомления: в ЛК указать URL https://<сайт>/api/payments/yookassa (событие payment.succeeded).
 * TODO: сверить поля с актуальной документацией ЮKassa перед запуском.
 */
const API = "https://api.yookassa.ru/v3";

export function yookassaConfigured() {
  return Boolean(process.env.YOOKASSA_SHOP_ID && process.env.YOOKASSA_SECRET_KEY);
}

function auth() {
  return "Basic " + Buffer.from(`${process.env.YOOKASSA_SHOP_ID}:${process.env.YOOKASSA_SECRET_KEY}`).toString("base64");
}

export async function yookassaCreate(p: { orderNumber: string; amountRub: number; description: string; returnUrl: string; email?: string }) {
  const res = await fetch(`${API}/payments`, {
    method: "POST",
    headers: { Authorization: auth(), "Idempotence-Key": randomUUID(), "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: { value: p.amountRub.toFixed(2), currency: "RUB" },
      capture: true,
      confirmation: { type: "redirect", return_url: p.returnUrl },
      description: p.description.slice(0, 128),
      metadata: { orderNumber: p.orderNumber },
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.description ?? "ЮKassa: не удалось создать платёж");
  return { paymentId: String(json.id), paymentUrl: String(json.confirmation?.confirmation_url ?? "") };
}

/** Статус платежа — уведомлениям не верим на слово, перепроверяем через API */
export async function yookassaGet(id: string): Promise<{ status: string; paid: boolean; orderNumber?: string; amount: number }> {
  const res = await fetch(`${API}/payments/${encodeURIComponent(id)}`, { headers: { Authorization: auth() }, cache: "no-store" });
  const json = await res.json();
  if (!res.ok) throw new Error("ЮKassa: платёж не найден");
  return { status: json.status, paid: Boolean(json.paid), orderNumber: json.metadata?.orderNumber, amount: Number(json.amount?.value ?? 0) };
}

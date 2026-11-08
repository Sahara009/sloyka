import { randomUUID } from "node:crypto";

/**
 * ЮKassa — подходит самозанятым: карты, СБП, SberPay; чек в «Мой налог» ЮKassa формирует сама,
 * если в личном кабинете включена интеграция с «Мой налог».
 * Ключи: YOOKASSA_SHOP_ID и YOOKASSA_SECRET_KEY (ЛК ЮKassa → Интеграция → Ключи API).
 * Уведомления: в ЛК указать URL https://<сайт>/api/payments/yookassa, события payment.succeeded,
 * payment.canceled и refund.succeeded.
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
export type YooPayment = {
  id: string;
  /** pending | waiting_for_capture | succeeded | canceled */
  status: string;
  paid: boolean;
  orderNumber?: string;
  amount: number;
  /** сколько уже вернули, ₽ */
  refunded: number;
  /** почему отменён: expired_on_confirmation, insufficient_funds … */
  cancelReason?: string;
};

export async function yookassaGet(id: string): Promise<YooPayment> {
  const res = await fetch(`${API}/payments/${encodeURIComponent(id)}`, { headers: { Authorization: auth() }, cache: "no-store" });
  const json = await res.json();
  if (!res.ok) throw new Error("ЮKassa: платёж не найден");
  return {
    id: String(json.id),
    status: json.status,
    paid: Boolean(json.paid),
    orderNumber: json.metadata?.orderNumber,
    amount: Number(json.amount?.value ?? 0),
    refunded: Number(json.refunded_amount?.value ?? 0),
    cancelReason: json.cancellation_details?.reason,
  };
}

/**
 * Возврат покупателю (полный или частичный). Деньги уходят на ту же карту / счёт, обычно за 1–3 дня.
 * У самозанятого ЮKassa сама аннулирует или корректирует чек в «Мой налог», если интеграция включена.
 */
export async function yookassaRefund(paymentId: string, amountRub: number, description?: string): Promise<{ id: string; status: string }> {
  const res = await fetch(`${API}/refunds`, {
    method: "POST",
    headers: { Authorization: auth(), "Idempotence-Key": randomUUID(), "Content-Type": "application/json" },
    body: JSON.stringify({
      payment_id: paymentId,
      amount: { value: amountRub.toFixed(2), currency: "RUB" },
      ...(description ? { description: description.slice(0, 250) } : {}),
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.description ?? "ЮKassa: возврат не создан");
  return { id: String(json.id), status: String(json.status) };
}

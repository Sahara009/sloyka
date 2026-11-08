import { yookassaConfigured, yookassaCreate } from "./yookassa";

/**
 * Оплата — только ЮKassa (решение 03.11: Т-Банка не будет).
 * Без ключей YOOKASSA_SHOP_ID / YOOKASSA_SECRET_KEY заказ просто сохраняется, а менеджер связывается с покупателем.
 */
export type Provider = "yookassa";

export function activeProvider(): Provider | null {
  return yookassaConfigured() ? "yookassa" : null;
}

export async function createPayment(p: {
  orderNumber: string;
  amountRub: number;
  description: string;
  email: string;
  phone?: string;
  items: { name: string; price: number; qty: number }[];
  successUrl: string;
  failUrl: string;
}): Promise<{ provider: Provider; paymentId: string; paymentUrl: string } | null> {
  if (activeProvider() !== "yookassa") return null;
  const r = await yookassaCreate({ orderNumber: p.orderNumber, amountRub: p.amountRub, description: p.description, returnUrl: p.successUrl, email: p.email });
  return { provider: "yookassa", ...r };
}

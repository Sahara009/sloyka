import { tbankConfigured, tbankInit } from "./tbank";
import { yookassaConfigured, yookassaCreate } from "./yookassa";

/**
 * Какой эквайринг включён: PAYMENT_PROVIDER=yookassa | tbank (по умолчанию — первый, у кого есть ключи).
 * Без ключей заказ просто сохраняется, а менеджер связывается с покупателем.
 */
export type Provider = "yookassa" | "tbank";

export function activeProvider(): Provider | null {
  const wanted = process.env.PAYMENT_PROVIDER as Provider | undefined;
  if (wanted === "yookassa" && yookassaConfigured()) return "yookassa";
  if (wanted === "tbank" && tbankConfigured()) return "tbank";
  if (!wanted) return yookassaConfigured() ? "yookassa" : tbankConfigured() ? "tbank" : null;
  return null;
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
  const provider = activeProvider();
  if (provider === "yookassa") {
    const r = await yookassaCreate({ orderNumber: p.orderNumber, amountRub: p.amountRub, description: p.description, returnUrl: p.successUrl, email: p.email });
    return { provider, ...r };
  }
  if (provider === "tbank") {
    const r = await tbankInit({ ...p, orderId: p.orderNumber });
    return { provider, ...r };
  }
  return null;
}

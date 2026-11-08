import { NextResponse } from "next/server";
import { yookassaConfigured, yookassaGet } from "@/lib/integrations/yookassa";
import { canceledText, notify, paidText } from "@/lib/integrations/telegram";
import { db, hasDb } from "@/lib/server/db";

/**
 * Уведомление ЮKassa (payment.succeeded, payment.canceled, refund.succeeded). Содержимому запроса не доверяем:
 * берём id платежа и сами спрашиваем у ЮKassa его статус.
 */
export async function POST(req: Request) {
  if (!yookassaConfigured()) return NextResponse.json({ ok: false }, { status: 404 });
  const body = await req.json().catch(() => null);
  const obj = body?.object;
  // у возврата id платежа лежит в payment_id
  const id = typeof obj?.payment_id === "string" ? obj.payment_id : obj?.id;
  if (typeof id !== "string") return NextResponse.json({ ok: false }, { status: 400 });

  const p = await yookassaGet(id);
  if (!p.orderNumber) return NextResponse.json({ ok: true });
  const order = hasDb ? await db().order.findUnique({ where: { number: p.orderNumber } }) : null;
  const total = order ? order.amount + (order.deliveryPrice ?? 0) : p.amount;

  if (p.status === "succeeded" && p.paid) {
    if (order && Math.abs(total - p.amount) >= 1) {
      console.warn("[yookassa] сумма не совпала", p.orderNumber, total, p.amount);
      return NextResponse.json({ ok: true });
    }
    const first = !order || order.paymentStatus !== "succeeded";
    if (order) {
      await db().order.update({
        where: { id: order.id },
        data: {
          paymentId: id,
          paymentStatus: "succeeded",
          refunded: Math.round(p.refunded),
          // статус заказа двигаем только из «Новый», дальше им управляет менеджер
          ...(order.status === "NEW" ? { status: "PAID" as const } : {}),
        },
      });
    }
    if (first) await notify(paidText({ number: p.orderNumber, id: order?.id, total: p.amount, customerName: order?.customerName }));
  } else if (p.status === "canceled") {
    if (order && order.paymentStatus !== "canceled" && order.paymentStatus !== "succeeded") {
      await db().order.update({ where: { id: order.id }, data: { paymentStatus: "canceled" } });
    }
    if (!order || order.paymentStatus !== "canceled") await notify(canceledText({ number: p.orderNumber, id: order?.id }));
  }
  return NextResponse.json({ ok: true });
}

/**
 * Статус оплаты для страницы возврата из ЮKassa (/cart?paid=…): браузер помнит id своего платежа.
 * Отдаём только статус — без суммы и данных покупателя.
 */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id || !/^[\w-]{10,64}$/.test(id) || !yookassaConfigured()) return NextResponse.json({ status: "unknown" });
  try {
    const p = await yookassaGet(id);
    return NextResponse.json({ status: p.status, paid: p.paid, orderNumber: p.orderNumber });
  } catch {
    return NextResponse.json({ status: "unknown" });
  }
}

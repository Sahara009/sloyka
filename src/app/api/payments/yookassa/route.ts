import { NextResponse } from "next/server";
import { yookassaConfigured, yookassaGet } from "@/lib/integrations/yookassa";
import { db, hasDb } from "@/lib/server/db";

/**
 * Уведомление ЮKassa о платеже. Содержимому запроса не доверяем:
 * берём id платежа и сами спрашиваем у ЮKassa его статус.
 * TODO: уведомление менеджеру в Telegram, создание отправления СДЭК после оплаты.
 */
export async function POST(req: Request) {
  if (!yookassaConfigured()) return NextResponse.json({ ok: false }, { status: 404 });
  const body = await req.json().catch(() => null);
  const id = body?.object?.id;
  if (typeof id !== "string") return NextResponse.json({ ok: false }, { status: 400 });

  const p = await yookassaGet(id);
  if (p.status === "succeeded" && p.paid && p.orderNumber && hasDb) {
    const order = await db().order.findUnique({ where: { number: p.orderNumber } });
    if (order && order.status === "NEW" && Math.abs(order.amount - p.amount) < 1) {
      await db().order.update({ where: { id: order.id }, data: { status: "PAID", paymentId: id } });
    }
  }
  return NextResponse.json({ ok: true });
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { yookassaRefund } from "@/lib/integrations/yookassa";
import { notify, refundText } from "@/lib/integrations/telegram";
import { requireAdmin } from "@/lib/server/auth";
import { db } from "@/lib/server/db";

const statuses = ["NEW", "PAID", "IN_PRODUCTION", "SHIPPED", "DONE", "CANCELLED"] as const;

export async function updateOrder(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) as (typeof statuses)[number];
  if (!statuses.includes(status)) return;
  const trackNumber = String(formData.get("trackNumber") ?? "").trim() || null;
  await db().order.update({ where: { id }, data: { status, trackNumber } });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function updateProduct(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug"));
  const priceRaw = String(formData.get("price") ?? "").trim();
  const price = priceRaw === "" ? null : Math.max(0, Math.round(Number(priceRaw)));
  if (price !== null && Number.isNaN(price)) return;
  await db().product.update({
    where: { slug },
    data: { price, active: formData.get("active") === "on", hit: formData.get("hit") === "on" },
  });
  revalidatePath("/admin/products");
  revalidatePath("/catalog");
  revalidatePath(`/catalog/${slug}`);
  revalidatePath("/");
}

export async function toggleRequest(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await db().request.update({ where: { id }, data: { done: formData.get("done") === "1" } });
  revalidatePath("/admin/requests");
}

/** Менеджер поменял коробки в заказе */
export async function updateOrderPacking(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const boxIds = formData.getAll("box").map(String);
  const weights = formData.getAll("weight").map((w) => Math.max(0, Math.round(Number(w) || 0)));
  const packing = boxIds.map((box, i) => ({ box, weight: weights[i] ?? 0 }));
  await db().order.update({ where: { id }, data: { packing, weight: weights.reduce((a, b) => a + b, 0) } });
  revalidatePath(`/admin/orders/${id}`);
}

/**
 * Возврат денег покупателю через ЮKassa (полный или частичный). Сумму вводит менеджер,
 * по умолчанию — всё, что ещё не вернули. Полный возврат переводит заказ в «Отменён».
 */
export async function refundOrder(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const back = (msg: string) => redirect(`/admin/orders/${id}?refund=${encodeURIComponent(msg)}`);
  const order = await db().order.findUnique({ where: { id } });
  if (!order) return back("Заказ не найден");
  if (!order.paymentId || order.paymentStatus !== "succeeded") return back("По заказу нет успешной оплаты — возвращать нечего");
  const total = order.amount + (order.deliveryPrice ?? 0);
  const left = total - order.refunded;
  const amount = Math.round(Number(String(formData.get("amount") ?? "").replace(",", ".")));
  if (!Number.isFinite(amount) || amount <= 0) return back("Укажите сумму возврата");
  if (amount > left) return back(`Можно вернуть не больше ${left} ₽`);
  if (formData.get("confirm") !== "on") return back("Поставьте галочку «Подтверждаю возврат»");
  const reason = String(formData.get("reason") ?? "").trim();
  let error = "";
  try {
    await yookassaRefund(order.paymentId, amount, reason || `Возврат по заказу ${order.number}`);
  } catch (e) {
    error = e instanceof Error ? e.message : "ЮKassa не приняла возврат";
  }
  if (error) return back(error);
  const full = amount === left;
  await db().order.update({
    where: { id },
    data: {
      refunded: order.refunded + amount,
      ...(full ? { status: "CANCELLED" as const } : {}),
      comment: [order.comment, `Возврат ${amount} ₽${reason ? `: ${reason}` : ""}`].filter(Boolean).join("\n"),
    },
  });
  await notify(refundText({ number: order.number, id, amount, full }));
  revalidatePath("/admin/orders");
  return back(full ? "ok-full" : "ok");
}

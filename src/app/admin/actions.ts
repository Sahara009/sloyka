"use server";

import { revalidatePath } from "next/cache";
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

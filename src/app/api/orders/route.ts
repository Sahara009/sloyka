import { NextResponse } from "next/server";
import { z } from "zod";
import { createPayment } from "@/lib/integrations/payments";
import { cdekConfigured, cdekPoints, cdekQuote } from "@/lib/integrations/delivery";
import { newOrderText, notify } from "@/lib/integrations/telegram";
import { pack } from "@/lib/shipping";
import { getShippingData } from "@/lib/server/shipping";
import { site } from "@/lib/format";
import { PriceError, unitPrice } from "@/lib/pricing";
import { getProduct } from "@/lib/server/catalog";
import { db, hasDb } from "@/lib/server/db";
import { applyPromoCode } from "@/data/promocodes";
import { MIN_ORDER_TOTAL } from "@/data/settings";

const refSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("product"), slug: z.string(), option: z.string().optional(), logo: z.boolean().optional() }),
  z.object({ kind: z.literal("home"), podium: z.string(), legs: z.array(z.string()).min(1).max(2), extra: z.string().nullable().optional() }),
  z.object({ kind: z.literal("market"), base: z.string(), podiums: z.array(z.string()).max(8), crown: z.boolean() }),
]);

const orderSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, "Укажите имя"),
    phone: z.string().trim().min(10, "Укажите телефон"),
    email: z.string().trim().email("Проверьте email"),
  }),
  delivery: z.object({
    method: z.enum(["cdek-pvz", "cdek-courier", "ozon-pvz", "wb-pvz"]),
    city: z.string().trim().max(120).default(""),
    address: z.string().trim().max(300).default(""),
    /** код города СДЭК (из подсказки в корзине) */
    cityCode: z.number().int().positive().optional(),
    /** код пункта выдачи СДЭК */
    pointCode: z.string().max(40).optional(),
    /** Ozon / WB: телефон, к которому привязано приложение покупателя (доставку оформляем вручную в Telegram / Instagram) */
    marketplacePhone: z.string().trim().max(40).optional(),
    /** цена, которую видел покупатель, — для менеджера (СДЭК сервер пересчитывает сам) */
    quote: z.string().max(60).optional(),
  }),
  comment: z.string().max(2000).optional(),
  promoCode: z.string().max(40).optional(),
  consents: z.object({ personalData: z.literal(true), offer: z.literal(true) }),
  items: z
    .array(
      z.object({
        name: z.string(),
        qty: z.number().int().min(1).max(100),
        details: z.array(z.string()).optional(),
        price: z.number().optional(), // цена из браузера — только для сверки
        ref: refSchema,
      }),
    )
    .min(1, "Корзина пуста")
    .max(50),
});

/**
 * Создание заказа:
 * 1) проверяем данные; 2) пересчитываем цены на сервере по каталогу (цене из браузера не доверяем);
 * 3) подбираем коробки (админ может поменять в заказе); 4) сохраняем заказ в базу (если подключена);
 * 5) СДЭК: сами пересчитываем доставку по коробкам и коду города, проверяем пункт выдачи — доставка входит в оплату;
 *    Ozon / WB — покупатель оставляет телефон из приложения и адрес ПВЗ, доставку оформляем в Telegram / Instagram
 *    и она оплачивается отдельно, сразу (заказчик, 03.11; интеграцию — позже);
 * 6) создаём оплату в ЮKassa (если заданы ключи) на товары + доставку СДЭК; 7) уведомление в Telegram.
 * TODO: создание отправления СДЭК после оплаты (после запуска).
 */
export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = orderSchema.safeParse(raw);
  if (!parsed.success) {
    const consentIssue = parsed.error.issues.some((i) => i.path[0] === "consents");
    const msg = consentIssue ? "Нужно согласие на обработку данных и принятие оферты" : parsed.error.issues[0]?.message;
    return NextResponse.json({ error: msg ?? "Проверьте данные заказа" }, { status: 400 });
  }
  const body = parsed.data;

  let items: { name: string; qty: number; details: string[]; price: number; ref: z.infer<typeof refSchema> }[];
  try {
    items = await Promise.all(
      body.items.map(async (i) => ({ name: i.name, qty: i.qty, details: i.details ?? [], ref: i.ref, price: await unitPrice(i.ref, getProduct) })),
    );
  } catch (e) {
    const msg = e instanceof PriceError ? e.message : "Не удалось посчитать стоимость";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const changed = body.items.some((i, k) => i.price !== undefined && i.price !== items[k].price);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  if (MIN_ORDER_TOTAL > 0 && subtotal < MIN_ORDER_TOTAL) {
    return NextResponse.json({ error: `Минимальная сумма заказа — ${MIN_ORDER_TOTAL} ₽` }, { status: 400 });
  }
  // промокод уменьшает цену подходящих позиций (так чек в оплате сходится с суммой)
  const promo = body.promoCode ? applyPromoCode(body.promoCode, items) : { items, discount: 0 };
  // промокод — 1 раз на телефон / email: ищем оплаченные (или ещё ждущие оплаты) заказы с ним
  const phoneDigits = body.customer.phone.replace(/\D/g, "").slice(-10);
  if (promo.discount && "code" in promo && promo.code && hasDb) {
    const used = await db().order.findFirst({
      where: {
        promoCode: promo.code.code,
        paymentStatus: { in: ["succeeded", "pending"] },
        OR: [{ phoneDigits }, { email: { equals: body.customer.email, mode: "insensitive" } }],
      },
      select: { id: true },
    });
    if (used) return NextResponse.json({ error: `Промокод ${promo.code.code} уже использован с этим телефоном или email` }, { status: 400 });
  }
  items = promo.items;
  const amount = items.reduce((s, i) => s + i.price * i.qty, 0);
  const number = `SL-${Date.now().toString(36).toUpperCase()}`;
  const products = await Promise.all(items.map((i) => (i.ref.kind === "product" ? getProduct(i.ref.slug) : undefined)));
  const packing = pack(
    items.map((i, k) => ({ ref: i.ref as never, qty: i.qty, kind: products[k]?.kind })),
    (await getShippingData()).boxes,
  );

  // доставка СДЭК: цену не берём из браузера — считаем заново
  let deliveryPrice: number | undefined;
  let deliveryAddress = body.delivery.address;
  const isCdek = body.delivery.method === "cdek-pvz" || body.delivery.method === "cdek-courier";
  if (isCdek && cdekConfigured()) {
    const { cityCode, pointCode } = body.delivery;
    if (!cityCode) return NextResponse.json({ error: "Выберите город из подсказок" }, { status: 400 });
    try {
      if (body.delivery.method === "cdek-pvz") {
        const point = (await cdekPoints(cityCode)).find((p) => p.code === pointCode);
        if (!point) return NextResponse.json({ error: "Выберите пункт выдачи из списка" }, { status: 400 });
        deliveryAddress = `${point.address} (пункт СДЭК ${point.code})`;
      } else if (deliveryAddress.length < 5) {
        return NextResponse.json({ error: "Укажите адрес доставки" }, { status: 400 });
      }
      const tariff = (await cdekQuote(cityCode, packing)).find((q) => q.method === body.delivery.method);
      if (!tariff) return NextResponse.json({ error: "СДЭК не возит этим способом в выбранный город — выберите другой" }, { status: 400 });
      deliveryPrice = tariff.price;
    } catch (e) {
      console.warn("[order] СДЭК:", e instanceof Error ? e.message : e);
      return NextResponse.json({ error: "Не получилось рассчитать доставку СДЭК, попробуйте ещё раз через минуту" }, { status: 502 });
    }
  } else if (deliveryAddress.length < 3) {
    return NextResponse.json({ error: "Укажите адрес доставки" }, { status: 400 });
  }
  if (body.delivery.method === "ozon-pvz" || body.delivery.method === "wb-pvz") {
    if (!body.delivery.marketplacePhone || body.delivery.marketplacePhone.replace(/\D/g, "").length < 10)
      return NextResponse.json({ error: "Укажите телефон, к которому привязано приложение Ozon / Wildberries" }, { status: 400 });
    deliveryAddress = `${deliveryAddress} · телефон в приложении: ${body.delivery.marketplacePhone} · доставку оформить в Telegram/Instagram, оплачивается отдельно`;
  }
  const toPay = amount + (deliveryPrice ?? 0);

  let orderId: string | undefined;
  if (hasDb) {
    const order = await db().order.create({
      data: {
        number,
        customerName: body.customer.name,
        phone: body.customer.phone,
        email: body.customer.email,
        deliveryMethod: body.delivery.method,
        deliveryCity: body.delivery.city,
        deliveryAddress,
        deliveryQuote: body.delivery.quote,
        deliveryPrice,
        deliveryPoint: body.delivery.pointCode,
        packing: packing.boxes.map((b) => ({ box: b.box.id, weight: b.weight })),
        weight: packing.weight,
        comment: [body.comment, promo.discount ? `Промокод ${body.promoCode}: −${promo.discount} ₽` : ""].filter(Boolean).join("\n") || undefined,
        promoCode: promo.discount && "code" in promo ? promo.code?.code : undefined,
        phoneDigits,
        amount,
        items: { create: items.map((i) => ({ name: i.name, ref: i.ref, details: i.details, price: i.price, qty: i.qty })) },
      },
    });
    orderId = order.id;
  } else {
    console.log("[order] без базы:", number, amount, deliveryPrice, body.customer.name, body.delivery);
  }

  await notify(
    newOrderText({
      number,
      id: orderId,
      customerName: body.customer.name,
      phone: body.customer.phone,
      email: body.customer.email,
      delivery: { "cdek-pvz": "СДЭК, пункт выдачи", "cdek-courier": "СДЭК, курьер", "ozon-pvz": "Ozon", "wb-pvz": "Wildberries" }[body.delivery.method],
      address: [body.delivery.city, deliveryAddress].filter(Boolean).join(", "),
      amount,
      deliveryPrice,
      items,
      comment: body.comment,
    }),
  );

  try {
    const payment = await createPayment({
      orderNumber: number,
      amountRub: toPay,
      description: `Заказ ${number} — Sloyka`,
      email: body.customer.email,
      phone: body.customer.phone,
      items: deliveryPrice ? [...items, { name: "Доставка СДЭК", price: deliveryPrice, qty: 1 }] : items,
      successUrl: `${site.url}/cart?paid=${number}`,
      failUrl: `${site.url}/cart?failed=${number}`,
    });
    if (payment) {
      if (orderId) await db().order.update({ where: { id: orderId }, data: { paymentId: payment.paymentId, paymentProvider: payment.provider, paymentStatus: "pending" } });
      return NextResponse.json({ orderId: number, paymentId: payment.paymentId, paymentUrl: payment.paymentUrl, amount: toPay, deliveryPrice, priceChanged: changed });
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Ошибка оплаты" }, { status: 502 });
  }

  return NextResponse.json({ orderId: number, amount: toPay, deliveryPrice, priceChanged: changed });
}

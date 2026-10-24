import { NextResponse } from "next/server";
import { z } from "zod";
import { createPayment } from "@/lib/integrations/payments";
import { pack } from "@/lib/shipping";
import { getShippingData } from "@/lib/server/shipping";
import { site } from "@/lib/format";
import { PriceError, unitPrice } from "@/lib/pricing";
import { getProduct } from "@/lib/server/catalog";
import { db, hasDb } from "@/lib/server/db";

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
    address: z.string().trim().default(""),
    /** примерная цена, которую видел покупатель (₽), — для менеджера; к оплате не прибавляем */
    quote: z.string().max(60).optional(),
  }),
  comment: z.string().max(2000).optional(),
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
 * 5) создаём оплату в ЮKassa или Т-Банке — смотря чьи ключи есть (PAYMENT_PROVIDER).
 * Доставка оплачивается отдельно: на сайте она «≈», точную сумму менеджер подтверждает.
 * TODO: уведомление в Telegram, создание отправления СДЭК после оплаты.
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

  const amount = items.reduce((s, i) => s + i.price * i.qty, 0);
  const changed = body.items.some((i, k) => i.price !== undefined && i.price !== items[k].price);
  const number = `SL-${Date.now().toString(36).toUpperCase()}`;
  const products = await Promise.all(items.map((i) => (i.ref.kind === "product" ? getProduct(i.ref.slug) : undefined)));
  const packing = pack(
    items.map((i, k) => ({ ref: i.ref as never, qty: i.qty, kind: products[k]?.kind })),
    (await getShippingData()).boxes,
  );

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
        deliveryAddress: body.delivery.address,
        deliveryQuote: body.delivery.quote,
        packing: packing.boxes.map((b) => ({ box: b.box.id, weight: b.weight })),
        weight: packing.weight,
        comment: body.comment,
        amount,
        items: { create: items.map((i) => ({ name: i.name, ref: i.ref, details: i.details, price: i.price, qty: i.qty })) },
      },
    });
    orderId = order.id;
  } else {
    console.log("[order] без базы:", number, amount, body.customer.name, body.delivery);
  }

  try {
    const payment = await createPayment({
      orderNumber: number,
      amountRub: amount,
      description: `Заказ ${number} — Sloyka`,
      email: body.customer.email,
      phone: body.customer.phone,
      items,
      successUrl: `${site.url}/cart?paid=${number}`,
      failUrl: `${site.url}/cart?failed=${number}`,
    });
    if (payment) {
      if (orderId) await db().order.update({ where: { id: orderId }, data: { paymentId: payment.paymentId, paymentProvider: payment.provider } });
      return NextResponse.json({ orderId: number, paymentUrl: payment.paymentUrl, amount, priceChanged: changed });
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Ошибка оплаты" }, { status: 502 });
  }

  return NextResponse.json({ orderId: number, amount, priceChanged: changed });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { db, hasDb } from "@/lib/server/db";

const schema = z.object({
  topic: z.string().max(100).default("Заявка"),
  name: z.string().trim().min(2),
  contact: z.string().trim().min(3),
  message: z.string().max(3000).optional(),
  pd: z.literal("on"),
});

/**
 * Заявки с форм «Для бизнеса» и «Контакты». Сохраняются в базу (если подключена) и видны в админке.
 * TODO: уведомление заказчику в Telegram-бот.
 */
export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Заполните имя, контакт и дайте согласие" }, { status: 400 });
  const { topic, name, contact, message } = parsed.data;
  if (hasDb) await db().request.create({ data: { topic, name, contact, message } });
  else console.log("[request] без базы:", topic, name, contact);
  return NextResponse.json({ ok: true });
}

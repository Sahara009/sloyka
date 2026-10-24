import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/*
 * Простой вход в админку: один пароль из ADMIN_PASSWORD.
 * В cookie лежит срок действия + подпись HMAC (ADMIN_SECRET), подделать без секрета нельзя.
 * Когда понадобятся несколько менеджеров — заменить на Auth.js или модель User в базе.
 */
export const ADMIN_COOKIE = "sloyka_admin";
const TTL_DAYS = 14;

function secret() {
  const s = process.env.ADMIN_SECRET;
  if (!s || s.length < 16) throw new Error("ADMIN_SECRET не задан (нужна строка от 16 символов) — см. .env.example");
  return s;
}

const sign = (value: string) => createHmac("sha256", secret()).update(value).digest("hex");

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_SECRET);
}

export function checkPassword(password: string) {
  const real = process.env.ADMIN_PASSWORD ?? "";
  const a = Buffer.from(password);
  const b = Buffer.from(real);
  return real.length > 0 && a.length === b.length && timingSafeEqual(a, b);
}

export function makeSessionCookie() {
  const expires = Date.now() + TTL_DAYS * 86400_000;
  return { value: `${expires}.${sign(String(expires))}`, maxAge: TTL_DAYS * 86400 };
}

export async function isAdmin(): Promise<boolean> {
  if (!adminConfigured()) return false;
  const raw = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!raw) return false;
  const [expires, sig] = raw.split(".");
  if (!expires || !sig || Number(expires) < Date.now()) return false;
  const good = Buffer.from(sign(expires));
  const got = Buffer.from(sig);
  return good.length === got.length && timingSafeEqual(good, got);
}

/** Для страниц админки: если не вошли — на страницу входа */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

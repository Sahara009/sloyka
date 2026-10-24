import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminConfigured, checkPassword, makeSessionCookie } from "@/lib/server/auth";

export async function POST(req: Request) {
  if (!adminConfigured()) {
    return NextResponse.json({ error: "Админка не настроена: задайте ADMIN_PASSWORD и ADMIN_SECRET в .env.local" }, { status: 503 });
  }
  const body = await req.json().catch(() => null);
  // небольшая пауза — чтобы пароль было неудобно перебирать
  await new Promise((r) => setTimeout(r, 400));
  if (!checkPassword(String(body?.password ?? ""))) return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  const { value, maxAge } = makeSessionCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, value, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}

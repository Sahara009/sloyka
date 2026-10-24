import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { requireAdmin } from "@/lib/server/auth";
import { hasDb } from "@/lib/server/db";
import { catalogSource } from "@/lib/server/catalog";
import { LogoutButton } from "./LogoutButton";

export const metadata: Metadata = { title: "Админ-панель", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const nav = [
  { href: "/admin", label: "Обзор" },
  { href: "/admin/orders", label: "Заказы" },
  { href: "/admin/requests", label: "Заявки" },
  { href: "/admin/products", label: "Товары" },
  { href: "/admin/shipping", label: "Доставка" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  return (
    <div className="admin">
      <aside className="admin__side">
        <img src="/logo.svg" alt="Sloyka" className="admin__logo" />
        <nav>
          {nav.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="admin__status">
          <span className={hasDb ? "ok" : "off"}>База: {hasDb ? "подключена" : "не подключена"}</span>
          <span>Каталог: {catalogSource === "db" ? "из базы" : "из файлов"}</span>
        </div>
        <Link href="/" className="admin__site">
          На сайт →
        </Link>
        <LogoutButton />
      </aside>
      <div className="admin__main">
        {!hasDb && (
          <p className="admin-note">
            База данных ещё не подключена: заказы и заявки пока не сохраняются. Задайте DATABASE_URL в .env.local и выполните
            <code> npm run db:push </code> и <code> npm run db:seed</code> — инструкция в README.
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

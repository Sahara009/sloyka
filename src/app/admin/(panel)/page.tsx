import Link from "next/link";
import { db, hasDb } from "@/lib/server/db";
import { getProducts } from "@/lib/server/catalog";
import { formatPrice } from "@/lib/format";
import { dateFmt, statusLabels } from "../labels";

export default async function AdminHome() {
  const products = await getProducts();
  const stats = hasDb
    ? await Promise.all([
        db().order.count({ where: { status: { in: ["NEW", "PAID", "IN_PRODUCTION"] } } }),
        db().request.count({ where: { done: false } }),
        db().order.aggregate({ _sum: { amount: true }, where: { status: { not: "CANCELLED" } } }),
        db().order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      ])
    : null;

  return (
    <>
      <h1>Обзор</h1>
      <div className="admin-cards">
        <div className="admin-card">
          <span>Заказы в работе</span>
          <b>{stats ? stats[0] : "—"}</b>
        </div>
        <div className="admin-card">
          <span>Новые заявки</span>
          <b>{stats ? stats[1] : "—"}</b>
        </div>
        <div className="admin-card">
          <span>Сумма заказов</span>
          <b>{stats ? formatPrice(stats[2]._sum.amount ?? 0) : "—"}</b>
        </div>
        <div className="admin-card">
          <span>Товаров в каталоге</span>
          <b>{products.length}</b>
        </div>
      </div>

      {stats && stats[3].length > 0 && (
        <>
          <h2>Последние заказы</h2>
          <table className="admin-table">
            <tbody>
              {stats[3].map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link href={`/admin/orders/${o.id}`}>{o.number}</Link>
                  </td>
                  <td>{dateFmt.format(o.createdAt)}</td>
                  <td>{o.customerName}</td>
                  <td>{formatPrice(o.amount)}</td>
                  <td>
                    <span className={`pill pill--${o.status.toLowerCase()}`}>{statusLabels[o.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </>
  );
}

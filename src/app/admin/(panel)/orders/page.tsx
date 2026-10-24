import Link from "next/link";
import { db, hasDb } from "@/lib/server/db";
import { formatPrice } from "@/lib/format";
import { dateFmt, deliveryLabels, statusLabels } from "../../labels";

type Props = { searchParams: Promise<{ status?: string }> };

export default async function AdminOrders({ searchParams }: Props) {
  const { status } = await searchParams;
  const orders = hasDb
    ? await db().order.findMany({
        where: status && status in statusLabels ? { status: status as never } : undefined,
        orderBy: { createdAt: "desc" },
        take: 200,
        include: { _count: { select: { items: true } } },
      })
    : [];

  return (
    <>
      <h1>Заказы</h1>
      <div className="chips">
        <Link href="/admin/orders" className={`chip ${!status ? "is-active" : ""}`}>
          Все
        </Link>
        {Object.entries(statusLabels).map(([k, v]) => (
          <Link key={k} href={`/admin/orders?status=${k}`} className={`chip ${status === k ? "is-active" : ""}`}>
            {v}
          </Link>
        ))}
      </div>
      {orders.length === 0 ? (
        <p className="muted">Заказов пока нет.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Номер</th>
              <th>Дата</th>
              <th>Покупатель</th>
              <th>Доставка</th>
              <th>Позиций</th>
              <th>Сумма</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link href={`/admin/orders/${o.id}`}>{o.number}</Link>
                </td>
                <td>{dateFmt.format(o.createdAt)}</td>
                <td>
                  {o.customerName}
                  <br />
                  <span className="muted small">{o.phone}</span>
                </td>
                <td>{deliveryLabels[o.deliveryMethod] ?? o.deliveryMethod}</td>
                <td>{o._count.items}</td>
                <td>{formatPrice(o.amount)}</td>
                <td>
                  <span className={`pill pill--${o.status.toLowerCase()}`}>{statusLabels[o.status]}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

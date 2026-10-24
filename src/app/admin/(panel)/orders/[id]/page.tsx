import Link from "next/link";
import { notFound } from "next/navigation";
import { db, hasDb } from "@/lib/server/db";
import { formatPrice } from "@/lib/format";
import { boxes as boxList } from "@/data/shipping";
import { updateOrder, updateOrderPacking } from "../../../actions";
import { dateFmt, deliveryLabels, statusLabels } from "../../../labels";

type Props = { params: Promise<{ id: string }> };

export default async function AdminOrder({ params }: Props) {
  if (!hasDb) notFound();
  const { id } = await params;
  const order = await db().order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  return (
    <>
      <Link href="/admin/orders" className="more">
        ← Все заказы
      </Link>
      <h1>
        Заказ {order.number} <span className={`pill pill--${order.status.toLowerCase()}`}>{statusLabels[order.status]}</span>
      </h1>
      <p className="muted">{dateFmt.format(order.createdAt)}</p>

      <div className="admin-grid">
        <section className="admin-box">
          <h2>Состав</h2>
          <table className="admin-table">
            <tbody>
              {order.items.map((i) => (
                <tr key={i.id}>
                  <td>
                    <b>{i.name}</b>
                    {i.details.length > 0 && <div className="muted small">{i.details.join(" · ")}</div>}
                  </td>
                  <td>× {i.qty}</td>
                  <td>{formatPrice(i.price * i.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="admin-total">
            Итого: <b>{formatPrice(order.amount)}</b>
            {order.deliveryPrice ? ` + доставка ${formatPrice(order.deliveryPrice)}` : ""}
          </p>
        </section>

        <section className="admin-box">
          <h2>Покупатель</h2>
          <p>
            {order.customerName}
            <br />
            <a href={`tel:${order.phone}`}>{order.phone}</a>
            <br />
            <a href={`mailto:${order.email}`}>{order.email}</a>
          </p>
          <h2>Доставка</h2>
          <p>
            {deliveryLabels[order.deliveryMethod] ?? order.deliveryMethod}
            {order.deliveryQuote && <span className="muted"> · на сайте: {order.deliveryQuote}</span>}
            <br />
            {[order.deliveryCity, order.deliveryAddress].filter(Boolean).join(", ") || <span className="muted">адрес не указан</span>}
          </p>
          <h2>Упаковка</h2>
          <p className="muted small">
            Сайт подобрал коробки по весу и габаритам. Если собрали по-другому — поменяйте, вес пересчитается для СДЭК.
          </p>
          <form action={updateOrderPacking} className="admin-inline">
            <input type="hidden" name="id" value={order.id} />
            {(Array.isArray(order.packing) ? (order.packing as { box: string; weight: number }[]) : [{ box: "M", weight: order.weight ?? 0 }]).map((p, i) => (
              <span key={i} className="admin-inline">
                <select name="box" defaultValue={p.box} aria-label={`Коробка ${i + 1}`}>
                  {boxList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} · {b.length}×{b.width}×{b.height}
                    </option>
                  ))}
                  <option value="custom">Нестандартная</option>
                </select>
                <input name="weight" type="number" min={0} defaultValue={p.weight} aria-label="Вес, г" style={{ width: 90 }} /> г
              </span>
            ))}
            <button className="btn btn--sm">Сохранить</button>
          </form>
          {order.comment && (
            <>
              <h2>Комментарий</h2>
              <p>{order.comment}</p>
            </>
          )}

          <form action={updateOrder} className="admin-form">
            <input type="hidden" name="id" value={order.id} />
            <label className="field">
              <span>Статус</span>
              <select name="status" defaultValue={order.status}>
                {Object.entries(statusLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Трек-номер</span>
              <input name="trackNumber" defaultValue={order.trackNumber ?? ""} placeholder="СДЭК / Ozon" />
            </label>
            <button className="btn btn--sm">Сохранить</button>
          </form>
        </section>
      </div>
    </>
  );
}

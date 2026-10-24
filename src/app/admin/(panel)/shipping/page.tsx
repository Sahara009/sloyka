import { partPhysics } from "@/data/shipping";
import { getShippingData } from "@/lib/server/shipping";
import { formatPrice } from "@/lib/format";

/**
 * Доставка: коробки, зоны Ozon/WB и вес/габариты деталей.
 * Пока только просмотр. Следующий шаг — формы редактирования (как у товаров).
 * Если база подключена и заполнена (npm run db:seed) — показываем данные из базы.
 */
export default async function AdminShipping() {
  const { boxes, zones, fromDb } = await getShippingData();
  const range = (r?: [number, number]) => (r ? `${formatPrice(r[0])} – ${formatPrice(r[1])}` : "—");

  return (
    <>
      <h1>Доставка</h1>
      <p className="admin-note">
        Цифры — черновик, их нужно заменить на реальные (размеры коробок, вес деталей, вилки Ozon/WB). Сейчас они в{" "}
        <code>src/data/shipping.ts</code>
        {fromDb ? ", а на сайте используются из базы" : ""}. СДЭК считается точно по API, когда в .env.local есть CDEK_ACCOUNT и CDEK_SECURE.
      </p>

      <section className="admin-box">
        <h2>Коробки</h2>
        <p className="muted small">Сайт берёт самую маленькую коробку, в которую помещается весь заказ (детали с пометкой «вкладывается» почти не занимают места).</p>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Коробка</th>
              <th>Внутри, см</th>
              <th>До, кг</th>
            </tr>
          </thead>
          <tbody>
            {boxes.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>
                  {b.length} × {b.width} × {b.height}
                </td>
                <td>{b.maxWeight / 1000}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-box">
        <h2>Ozon и Wildberries: от Санкт-Петербурга</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Зона</th>
              <th>Срок, дн.</th>
              {boxes.map((b) => (
                <th key={b.id}>Ozon · {b.id}</th>
              ))}
              {boxes.map((b) => (
                <th key={b.id}>WB · {b.id}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zones.map((z) => (
              <tr key={z.id}>
                <td>
                  <b>{z.title}</b>
                  {z.match.length > 0 && <div className="muted small">{z.match.slice(0, 6).join(", ")}…</div>}
                </td>
                <td>
                  {z.days[0]}–{z.days[1]}
                </td>
                {boxes.map((b) => (
                  <td key={b.id}>{range(z.ozon[b.id])}</td>
                ))}
                {boxes.map((b) => (
                  <td key={b.id}>{range(z.wb[b.id])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-box">
        <h2>Вес и габариты деталей</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Деталь</th>
              <th>Габариты, см</th>
              <th>Вес, г</th>
              <th>Вкладывается</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(partPhysics).map(([id, p]) => (
              <tr key={id}>
                <td>{id}</td>
                <td>
                  {p.length} × {p.width} × {p.height}
                </td>
                <td>{p.weight}</td>
                <td>{p.nests ? "да" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}

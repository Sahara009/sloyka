import Link from "next/link";
import { lineTitles } from "@/data/products";
import { db } from "@/lib/server/db";
import { catalogSource, getProducts } from "@/lib/server/catalog";
import { formatPrice } from "@/lib/format";
import { updateProduct } from "../../actions";

/**
 * Товары. Когда каталог берётся из базы (CATALOG_SOURCE=db) — цены, наличие и «хит» правятся прямо здесь.
 * Следующий шаг: полная форма товара (описание, фото, размеры) и загрузка фото.
 */
export default async function AdminProducts() {
  const editable = catalogSource === "db";
  const rows = editable
    ? await db().product.findMany({ orderBy: [{ line: "asc" }, { sort: "asc" }] })
    : (await getProducts()).map((p) => ({ ...p, active: true, hit: !!p.hit }));

  return (
    <>
      <h1>Товары</h1>
      {!editable && (
        <p className="admin-note">
          Сейчас каталог берётся из файла <code>src/data/products.ts</code>. Чтобы править цены здесь — подключите базу,
          выполните <code>npm run db:seed</code> и поставьте <code>CATALOG_SOURCE=db</code> в .env.local.
        </p>
      )}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Товар</th>
            <th>Линейка</th>
            <th>Цена</th>
            <th>В продаже</th>
            <th>Хит</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.slug}>
              <td>
                <Link href={`/catalog/${p.slug}`} target="_blank">
                  {p.name}
                </Link>
              </td>
              <td>{lineTitles[p.line as keyof typeof lineTitles] ?? p.line}</td>
              {editable ? (
                <td colSpan={4}>
                  <form action={updateProduct} className="admin-inline">
                    <input type="hidden" name="slug" value={p.slug} />
                    <input name="price" type="number" min={0} defaultValue={p.price ?? ""} placeholder="по запросу" aria-label="Цена" />
                    <label>
                      <input type="checkbox" name="active" defaultChecked={p.active} /> в продаже
                    </label>
                    <label>
                      <input type="checkbox" name="hit" defaultChecked={p.hit} /> хит
                    </label>
                    <button className="btn btn--sm">Сохранить</button>
                  </form>
                </td>
              ) : (
                <>
                  <td>{formatPrice(p.price)}</td>
                  <td>да</td>
                  <td>{p.hit ? "да" : ""}</td>
                  <td />
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

import Link from "next/link";
import { lineTitles } from "@/data/products";
import { catalogEditable, getProducts } from "@/lib/server/catalog";
import { formatPrice } from "@/lib/format";
import { updateProduct } from "../../actions";

/**
 * Товары. Когда каталог берётся из базы (CATALOG_SOURCE=db) — цены, наличие и «хит» правятся прямо здесь.
 * Следующий шаг: полная форма товара (описание, фото, размеры) и загрузка фото.
 */
export default async function AdminProducts() {
  const editable = catalogEditable;
  // товары из файла + правки из базы (цена, «в продаже», «хит»)
  const rows = (await getProducts({ includeHidden: true })).map((p) => ({ ...p, active: !p.hidden, hit: !!p.hit }));

  return (
    <>
      <h1>Товары</h1>
      {editable && (
        <p className="admin-note">
          Цена здесь — базовая («от»). У товаров с размерами цены каждого размера меняются через разработчика. Снятый с продажи
          товар пропадает из каталога и корзины.
        </p>
      )}
      {!editable && (
        <p className="admin-note">
          База не подключена, поэтому цены здесь только для просмотра. Править цены, наличие и «хит» можно после подключения
          базы (DATABASE_URL).
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

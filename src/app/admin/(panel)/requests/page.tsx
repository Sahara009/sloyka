import { db, hasDb } from "@/lib/server/db";
import { toggleRequest } from "../../actions";
import { dateFmt } from "../../labels";

export default async function AdminRequests() {
  const list = hasDb ? await db().request.findMany({ orderBy: [{ done: "asc" }, { createdAt: "desc" }], take: 200 }) : [];
  return (
    <>
      <h1>Заявки</h1>
      {list.length === 0 ? (
        <p className="muted">Заявок пока нет.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Тема</th>
              <th>Имя</th>
              <th>Контакт</th>
              <th>Сообщение</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <tr key={r.id} className={r.done ? "is-done" : ""}>
                <td>{dateFmt.format(r.createdAt)}</td>
                <td>{r.topic}</td>
                <td>{r.name}</td>
                <td>{r.contact}</td>
                <td>{r.message}</td>
                <td>
                  <form action={toggleRequest}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="done" value={r.done ? "0" : "1"} />
                    <button className="btn btn--sm btn--ghost">{r.done ? "Вернуть" : "Готово"}</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

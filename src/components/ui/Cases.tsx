import Link from "next/link";
import { cases } from "@/data/cases";
import { formatPrice } from "@/lib/format";
import { Photo } from "./Photo";
import { Reveal } from "./Reveal";

/** «Торты на наших подставках» — реальные заказы кондитеров с моделью, цветом и ценой */
export function Cases({ limit }: { limit?: number }) {
  const list = limit ? cases.slice(0, limit) : cases;
  return (
    <section className="section cases">
      <div className="container">
        <Reveal className="section-head">
          <h2>
            Торты <span className="script">на наших</span> подставках
          </h2>
          <Link href="/catalog?line=classic" className="more">
            Classic Cakestand →
          </Link>
        </Reveal>
        <div className="cases__grid">
          {list.map((c, i) => (
            <Reveal key={c.id} effect="up" delay={(i % 3) * 100}>
              <Link href={`/catalog/${c.productSlug}`} className="case">
                <div className="case__photo">
                  <Photo src={c.photo} alt={`${c.model}${c.client ? ` — ${c.client}` : ""}`} className="cover" />
                  {c.client && <span className="case__client">{c.client}</span>}
                </div>
                <div className="case__info">
                  <b>{c.model}</b>
                  <span className="muted small">Цвет: {c.colors}</span>
                  <span className="case__price">
                    {formatPrice(c.price)}
                    {c.logo ? <small> + логотип {formatPrice(c.logo)}</small> : null}
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

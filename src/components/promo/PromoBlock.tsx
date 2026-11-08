import Link from "next/link";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Carousel } from "@/components/ui/Carousel";
import { Drip } from "@/components/ui/Drip";
import { Reveal } from "@/components/ui/Reveal";
import { promoActive, type Product } from "@/data/products";

/**
 * Блок «Акции» на главной (вместо сезонной хэллоуинской секции, решение заказчика 03.11):
 * наборы в единой гамме (Бон-Париж, Па-Париж, Марсельеза) и спеццены (Fleur Moti, Fleur Nuts).
 * Товары подтягиваются сами — всё, у чего действует акция. Нет акций — блок не показывается.
 */
export function PromoBlock({ products }: { products: Product[] }) {
  const list = products.filter((p) => promoActive(p));
  if (!list.length) return null;
  const maxSave = Math.max(...list.map((p) => (p.oldPrice ?? 0) - (p.price ?? 0)));
  return (
    <section className="promo-block" aria-labelledby="promo-title">
      <div className="scallop-top" style={{ ["--scallop-color" as string]: "var(--blush-100)" }} />
      <div className="promo-block__body">
        <div className="container">
          <div className="section-head">
            <Reveal>
              <p className="eyebrow">Спеццены и наборы в единой гамме</p>
              <h2 id="promo-title">
                Сейчас <span className="script">по акции</span>
              </h2>
              {maxSave > 0 && <p className="muted">Экономия до {maxSave.toLocaleString("ru-RU")} ₽ — как если бы собирать по отдельности, только дешевле.</p>}
            </Reveal>
            <Reveal delay={100}>
              <Link href="/catalog?line=promo" className="more">
                Все акции →
              </Link>
            </Reveal>
          </div>
          <Reveal>
            <Carousel label="Акции">
              {list.map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i + 3} />
              ))}
            </Carousel>
          </Reveal>
        </div>
      </div>
      <Drip color="var(--blush-100)" seed={21} depth={60} />
    </section>
  );
}

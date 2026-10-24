import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductView } from "@/components/catalog/ProductView";
import { Reveal } from "@/components/ui/Reveal";
import { lineTitles, type Product } from "@/data/products";
import { getProduct, getProducts } from "@/lib/server/catalog";

type Params = { params: Promise<{ slug: string }> };

// при товарах из базы страницы обновляются раз в минуту после правок в админке
export const revalidate = 60;

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

function similar(all: Product[], p: Product, count = 4) {
  const same = all.filter((x) => x.line === p.line && x.slug !== p.slug);
  return [...same.filter((x) => x.kind === p.kind), ...same.filter((x) => x.kind !== p.kind)].slice(0, count);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: `${p.short}. ${p.description}`,
    openGraph: p.image ? { images: [p.image] } : undefined,
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = similar(await getProducts(), product);

  return (
    <div className="container page">
      <nav className="crumbs" aria-label="Хлебные крошки">
        <Link href="/catalog">Каталог</Link> / <Link href={`/catalog?line=${product.line}`}>{lineTitles[product.line]}</Link> /{" "}
        {product.name}
      </nav>

      <ProductView product={product}>
        <div className="accordion">
          <details open>
            <summary>Характеристики</summary>
            <div>
              <ul className="specs">
                {product.specs.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </details>
          <details>
            <summary>Доставка и оплата</summary>
            <div>
              Отправляем СДЭК и Ozon по всей России. Оплата картой или через СБП.{" "}
              <Link href="/delivery">Подробнее</Link>
            </div>
          </details>
          <details>
            <summary>Уход</summary>
            <div>
              {/* TODO: уточнить у заказчика рекомендации по уходу */}
              Протирайте влажной мягкой тканью. Не используйте абразивные губки и не мойте в посудомоечной машине.
            </div>
          </details>
        </div>
      </ProductView>

      {related.length > 0 && (
        <section className="section">
          <h2 className="center">
            Вам <span className="script">также</span> понравится
          </h2>
          <div className="grid-products">
            {related.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <ProductCard product={p} index={i} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

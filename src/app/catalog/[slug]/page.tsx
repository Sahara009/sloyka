import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductView } from "@/components/catalog/ProductView";
import { Reveal } from "@/components/ui/Reveal";
import { lineTitles, type Product } from "@/data/products";
import { categories, categoriesOf } from "@/data/categories";
import { getProduct, getProducts } from "@/lib/server/catalog";
import { ldJson, productLd, seoDescription } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

// при товарах из базы страницы обновляются раз в минуту после правок в админке
export const revalidate = 60;

export async function generateStaticParams() {
  return (await getProducts({ includeHidden: true })).map((p) => ({ slug: p.slug }));
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
    description: seoDescription(`${p.short}. ${p.description}`),
    alternates: { canonical: `/catalog/${p.slug}` },
    openGraph: { title: p.name, description: seoDescription(p.short), url: `/catalog/${p.slug}`, images: [p.image ?? "/og.jpg"] },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = similar(await getProducts(), product);

  return (
    <div className="container page">
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(productLd(product))} />
      <nav className="crumbs" aria-label="Хлебные крошки">
        <Link href="/catalog">Каталог</Link> / <Link href={`/catalog?line=${product.line}`}>{lineTitles[product.line]}</Link> /{" "}
        {(() => {
          // раздел внутри линейки — чтобы вернуться ровно туда, откуда пришли (заказчик, 17.11)
          const c = categories[product.line]?.find((x) => x.id === categoriesOf(product)[0]);
          return c ? (
            <>
              <Link href={`/catalog?line=${product.line}&cat=${c.id}`}>{c.title}</Link> /{" "}
            </>
          ) : null;
        })()}
        {product.name}
      </nav>

      <ProductView key={product.slug} product={product}>
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
              Отправляем СДЭК по всей России. Оплата картой или через СБП.{" "}
              <Link href="/delivery">Подробнее</Link>
            </div>
          </details>
          <details>
            <summary>Уход</summary>
            {/* текст заказчика, 17.11 */}
            <div className="care">
              <p>Изделия из экологичного пластика PLA, поэтому:</p>
              <ul>
                <li>выдерживают температуру до +50 °C;</li>
                <li>не оставляйте их надолго под прямыми солнечными лучами;</li>
                <li>используйте деликатные чистящие средства, без абразивов;</li>
                <li>берегите от падений и ударов сбоку, особенно резьбу и тонкие соединения.</li>
              </ul>
              <p>
                Изделия по умолчанию не предназначены для прямого контакта с едой: ставьте торты и десерты на подложку или
                кальку. Если нужен прямой контакт с продуктами — согласуйте это с нами заранее, подскажем по модели и
                материалу.
              </p>
              <p>
                Чистка: протирайте спиртом или влажными салфетками, сухая и слегка влажная уборка. Не замачивайте и не мойте под
                краном: при печати слоями остаются поры и микрошвы, куда может попасть вода.
              </p>
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

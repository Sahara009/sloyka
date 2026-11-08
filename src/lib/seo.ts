import { effectivePrice, lineTitles, type Product } from "@/data/products";
import { site } from "@/lib/format";

/*
 * Базовое SEO: описания до ~160 символов, разметка schema.org (JSON-LD) для Яндекса и Google.
 * Метрику пока не подключаем (решение 03.11). Для Яндекс Вебмастера: NEXT_PUBLIC_YANDEX_VERIFICATION в .env.
 */

/** Описание для сниппета: без переносов, до 160 символов по границе слова */
export function seoDescription(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:—-]+$/, "") + "…";
}

const abs = (path: string) => (path.startsWith("http") ? path : `${site.url}${path}`);

/** Магазин: имя, адрес, ссылки на соцсети */
export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "Sloyka",
    url: site.url,
    logo: abs("/logo.svg"),
    ...(site.email ? { email: site.email } : {}),
    address: { "@type": "PostalAddress", addressLocality: site.city, addressCountry: "RU" },
    sameAs: [site.telegram.replace("?direct", ""), site.instagram],
  };
}

/** Товар с ценой (у товаров с размерами — диапазон цен) и хлебные крошки */
export function productLd(p: Product) {
  const prices = p.options?.length ? p.options.map((o) => o.price) : [effectivePrice(p)].filter((x): x is number => x !== null);
  const offer =
    prices.length === 0
      ? undefined
      : prices.length === 1 || p.orderVia
        ? { "@type": "Offer", price: Math.min(...prices), priceCurrency: "RUB", availability: "https://schema.org/MadeToOrder", url: abs(`/catalog/${p.slug}`) }
        : { "@type": "AggregateOffer", lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: prices.length, priceCurrency: "RUB", availability: "https://schema.org/MadeToOrder" };
  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: p.name,
      description: seoDescription(`${p.short}. ${p.description}`, 300),
      ...(p.image ? { image: [abs(p.image), ...(p.gallery ?? []).map(abs)] } : {}),
      brand: { "@type": "Brand", name: "Sloyka" },
      category: lineTitles[p.line],
      sku: p.slug,
      ...(offer ? { offers: offer } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Каталог", item: abs("/catalog") },
        { "@type": "ListItem", position: 2, name: lineTitles[p.line], item: abs(`/catalog?line=${p.line}`) },
        { "@type": "ListItem", position: 3, name: p.name, item: abs(`/catalog/${p.slug}`) },
      ],
    },
  ];
}

/** <script type="application/ld+json"> — экранируем «<», чтобы текст не закрыл тег */
export const ldJson = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });

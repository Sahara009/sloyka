import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { legalDocs } from "@/data/legal";
import { site } from "@/lib/format";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/catalog", "/constructor", "/business", "/about", "/contacts", "/delivery"];
  return [
    ...pages.map((p) => ({ url: `${site.url}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.8 })),
    ...products.map((p) => ({ url: `${site.url}/catalog/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...legalDocs.map((d) => ({ url: `${site.url}/legal/${d.slug}`, changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}

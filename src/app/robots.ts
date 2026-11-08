import type { MetadataRoute } from "next";
import { site } from "@/lib/format";
import { DEMO } from "@/lib/demo";

export default function robots(): MetadataRoute.Robots {
  // демо на GitHub Pages закрыто от поиска целиком
  if (DEMO) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/cart", "/api/", "/admin", "/constructor?b="] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

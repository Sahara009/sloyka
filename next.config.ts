import type { NextConfig } from "next";

/*
 * Обычный режим — как раньше (сервер, API, админка).
 * DEMO_EXPORT=1 — статическая выгрузка для GitHub Pages (см. scripts/build-demo.mjs):
 * сайт целиком из HTML-файлов, без сервера; поиск/доставка считаются в браузере.
 */
const demo = process.env.DEMO_EXPORT === "1";
const base = process.env.DEMO_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(demo
    ? {
        output: "export" as const,
        trailingSlash: true,
        images: { unoptimized: true },
        ...(base ? { basePath: base } : {}),
      }
    : {}),
};

export default nextConfig;

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { Analytics } from "@/components/consent/Analytics";
import { CookieBanner } from "@/components/consent/CookieBanner";
import { ClickSpark } from "@/components/ui/ClickSpark";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { Preloader, preloaderBootScript } from "@/components/preloader/Preloader";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { themeBootScript } from "@/data/themes";
import { site } from "@/lib/format";
import { body, heading, spooky } from "./fonts";
import { DEMO } from "@/lib/demo";
import { ldJson, organizationLd } from "@/lib/seo";

import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/patterns.css";
import "@/styles/components.css";
import "@/styles/pages.css";
import "@/styles/motion.css";
import "@/styles/admin.css";
import "@/styles/outline.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Sloyka — десертные столики и стенды-конструкторы",
    template: "%s · Sloyka",
  },
  description:
    "Десертные столики Sloyka Podium и стенды Sloyka Market: собирайте подиум, ножку и детали как конструктор. 25 цветов, доставка СДЭК и Ozon.",
  applicationName: "Sloyka",
  formatDetection: { telephone: false },
  // демо на GitHub Pages не индексируем, чтобы не спорило с настоящим сайтом
  robots: DEMO ? { index: false, follow: false } : { index: true, follow: true },
  ...(process.env.NEXT_PUBLIC_YANDEX_VERIFICATION ? { verification: { yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION } } : {}),
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Sloyka",
    url: "/",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Sloyka — десертные столики и стенды-конструкторы" }],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={`${heading.variable} ${body.variable} ${spooky.variable}`} suppressHydrationWarning>
      <head>
        {/* решает до первой отрисовки, показывать ли прелоадер (классы js / is-preloading / no-preload) */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript + preloaderBootScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(organizationLd())} />
      </head>
      <body>
        <Preloader />
        {DEMO && <div className="demo-badge">демо-версия · заказы и заявки не отправляются</div>}
        <CartProvider>
          <SiteChrome
            header={<Header />}
            footer={<Footer />}
            extras={
              <>
                <CartDrawer />
                <CookieBanner />
                <ClickSpark />
                <ThemeSwitcher />
                <Analytics />
              </>
            }
          >
            {children}
          </SiteChrome>
        </CartProvider>
      </body>
    </html>
  );
}

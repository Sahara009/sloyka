"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Шапка, подвал, корзина и баннеры — только на публичном сайте.
 * В админке (/admin) их нет: там своё меню.
 */
export function SiteChrome({ header, footer, extras, children }: { header: ReactNode; footer: ReactNode; extras: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return <>{children}</>;
  return (
    <>
      {header}
      <main>{children}</main>
      {footer}
      {extras}
    </>
  );
}

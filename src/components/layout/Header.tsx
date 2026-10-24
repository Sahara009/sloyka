"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { CartIcon, CloseIcon, MenuIcon, SearchIcon } from "@/components/ui/Icons";
import { SearchOverlay } from "./SearchOverlay";
import { Drip } from "@/components/ui/Drip";
import { Logo } from "@/components/ui/Logo";

export const nav = [
  { href: "/catalog", label: "Каталог" },
  { href: "/constructor", label: "Конструктор" },
  { href: "/business", label: "Для бизнеса" },
  { href: "/about", label: "История бренда" },
  { href: "/contacts", label: "Контакты" },
];

export function Header() {
  const { count, openDrawer } = useCart();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  // наверху страницы шапка коричневая и высокая, при прокрутке — компактная и светлая.
  // Разные пороги (80 / 20 px), чтобы шапка не «дрожала» на границе.
  useEffect(() => {
    const onScroll = () => setScrolled((s) => (s ? window.scrollY > 20 : window.scrollY > 80));
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? "is-scrolled" : "is-top"}`}>
      <div className="announce">Доставка СДЭК и Ozon по всей России · оплата картой и СБП</div>
      <div className="header__bar container">
        <nav className="header__nav" aria-label="Основное меню">
          {nav.slice(0, 3).map((n) => (
            <Link key={n.href} href={n.href} className={pathname?.startsWith(n.href) ? "is-active" : ""}>
              {n.label}
            </Link>
          ))}
        </nav>
        <Logo />
        <div className="header__right">
          <nav className="header__nav" aria-label="О бренде">
            {nav.slice(3).map((n) => (
              <Link key={n.href} href={n.href} className={pathname?.startsWith(n.href) ? "is-active" : ""}>
                {n.label}
              </Link>
            ))}
          </nav>
          <button type="button" className="header__icon" onClick={() => setSearch(true)} aria-label="Поиск">
            <SearchIcon />
          </button>
          <button type="button" className="header__cart" onClick={openDrawer} aria-label={`Корзина, товаров: ${count}`}>
            <CartIcon />
            {count > 0 && <span className="badge">{count}</span>}
          </button>
          <button type="button" className="header__burger" onClick={() => setOpen((v) => !v)} aria-label="Меню" aria-expanded={open}>
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
      {/* низ шапки стекает однотонной глазурью */}
      <div className="header__cake" aria-hidden="true">
        <Drip color="var(--header-bg)" seed={13} depth={22} className="header__drip" />
      </div>
      {open && (
        <nav className="mobile-nav bg-stripes-blue" aria-label="Мобильное меню">
          {nav.map((n) => (
            <Link key={n.href} href={n.href}>
              {n.label}
            </Link>
          ))}
          <Link href="/delivery">Доставка и оплата</Link>
        </nav>
      )}
      <SearchOverlay open={search} onClose={() => setSearch(false)} />
    </header>
  );
}

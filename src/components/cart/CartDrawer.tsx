"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ProductArt } from "@/components/art/ProductArt";
import { Drip } from "@/components/ui/Drip";
import { CloseIcon } from "@/components/ui/Icons";
import { Photo } from "@/components/ui/Photo";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";

/** Корзина-дровер: выезжает справа по кнопке в шапке и после «В корзину» */
export function CartDrawer() {
  const { items, total, count, setQty, remove, drawerOpen, closeDrawer } = useCart();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // закрываем при переходе на другую страницу
  useEffect(() => closeDrawer(), [pathname, closeDrawer]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    document.documentElement.classList.add("drawer-lock");
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("drawer-lock");
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <div className={`drawer ${drawerOpen ? "is-open" : ""}`} aria-hidden={!drawerOpen}>
      <div className="drawer__overlay" onClick={closeDrawer} />
      <div
        ref={panelRef}
        className="drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Корзина"
        tabIndex={-1}
      >
        <header className="drawer__head">
          <h2>
            Корзина <sup>{count}</sup>
          </h2>
          <button type="button" className="drawer__close" onClick={closeDrawer} aria-label="Закрыть корзину">
            <CloseIcon />
          </button>
        </header>
        <Drip color="var(--blue-200)" seed={31} depth={26} className="drawer__drip" />

        {items.length === 0 ? (
          <div className="drawer__empty">
            <p>
              Пока <span className="script">пусто</span>
            </p>
            <p className="muted">Соберите столик в конструкторе или загляните в каталог.</p>
            <div className="row-gap">
              <Link href="/constructor" className="btn" onClick={closeDrawer}>
                В конструктор
              </Link>
              <Link href="/catalog" className="btn btn--ghost" onClick={closeDrawer}>
                Каталог
              </Link>
            </div>
          </div>
        ) : (
          <>
            <ul className="drawer__list">
              {items.map((i) => (
                <li key={i.key} className="drawer__item">
                  <div className="drawer__img">{i.image ? <Photo src={i.image} alt="" /> : i.art && <ProductArt art={i.art} />}</div>
                  <div className="drawer__info">
                    <p className="drawer__name">{i.name}</p>
                    {i.details && <p className="muted small">{i.details.join(" · ")}</p>}
                    <div className="drawer__row">
                      <div className="qty qty--sm">
                        <button type="button" onClick={() => setQty(i.key, i.qty - 1)} aria-label="Меньше">
                          −
                        </button>
                        <span>{i.qty}</span>
                        <button type="button" onClick={() => setQty(i.key, i.qty + 1)} aria-label="Больше">
                          +
                        </button>
                      </div>
                      <strong>{formatPrice(i.price * i.qty)}</strong>
                    </div>
                    <button type="button" className="link-btn" onClick={() => remove(i.key)}>
                      Удалить
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="drawer__foot">
              <div className="drawer__total">
                <span>Итого</span>
                <strong>{formatPrice(total)}</strong>
              </div>
              <p className="muted small">Доставку СДЭК или Ozon посчитаем при оформлении.</p>
              <Link href="/cart" className="btn btn--block" onClick={closeDrawer}>
                Оформить заказ
              </Link>
              <button type="button" className="btn btn--ghost btn--block" onClick={closeDrawer}>
                Продолжить покупки
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

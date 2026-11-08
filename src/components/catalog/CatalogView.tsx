"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowIcon, SearchIcon } from "@/components/ui/Icons";
import { categories, categoriesOf } from "@/data/categories";
import { effectivePrice, lineNotes, lineTitles, promoActive, type Line, type Product } from "@/data/products";
import { matchProduct } from "@/lib/search";
import { ProductCard } from "./ProductCard";

const lineOrder: Line[] = ["podium", "market", "home", "topper", "wish"];
type Tab = "all" | "promo" | Line;

/** Картинка и цвет плитки для каждой линейки */
const lineLook: Record<Tab, { img?: string; tone: string }> = {
  all: { tone: "var(--blue-200)" },
  // рендеры и фото заказчика (08.11)
  promo: { img: "/products/render/fleur-moti.webp", tone: "var(--blush-100)" },
  home: { img: "/photos/waffle-desk-clean-raspberry.webp", tone: "var(--cream)" },
  market: { img: "/products/render/stand-semiramis.webp", tone: "var(--blush-100)" },
  podium: { img: "/products/render/bonbon-stand.webp", tone: "var(--blue-100)" },
  topper: { img: "/photos/topper-numbers-tray.webp", tone: "var(--blue-100)" },
  wish: { img: "/photos/keychain-macaron-stand.webp", tone: "var(--sage-100)" },
};

type Sort = "default" | "cheap" | "expensive";

/**
 * Каталог: плитки линеек (+ «Акции»), внутри линейки — чипы категорий по структуре заказчика.
 * Перед готовыми сборками (Dessert Stand, Стойки) — блок «Собери свой» со ссылкой в конструктор.
 * Адрес: /catalog?line=podium&cat=dessert, /catalog?line=promo
 */
export function CatalogView({ products }: { products: Product[] }) {
  const [tab, setTab] = useState<Tab>("all");
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("default");

  // ?line=…&cat=… из ссылок на главной, ?q= из поиска в шапке
  useEffect(() => {
    const s = new URLSearchParams(window.location.search);
    const p = s.get("line");
    if (p && (p === "promo" || (lineOrder as string[]).includes(p))) setTab(p as Tab);
    if (s.get("cat")) setCat(s.get("cat")!);
    if (s.get("q")) setQ(s.get("q")!);
  }, []);

  // наборы из разных линеек (promoOnly) — только во «Всех товарах» и «Акциях»
  const inLine = (p: Product, line: Tab) => p.line === line && !p.promoOnly;
  const inTab = (p: Product) => tab === "all" || (tab === "promo" ? promoActive(p) : inLine(p, tab));
  const lineCats = tab === "all" || tab === "promo" ? [] : categories[tab].filter((c) => products.some((p) => inLine(p, tab) && categoriesOf(p).includes(c.id)));
  const activeCat = lineCats.find((c) => c.id === cat);

  const list = useMemo(() => {
    const l = products.filter((p) => inTab(p) && (!activeCat || categoriesOf(p).includes(activeCat.id)) && matchProduct(p, q));
    if (sort === "default") return l;
    const price = (p: Product) => effectivePrice(p) ?? Number.MAX_SAFE_INTEGER;
    return [...l].sort((a, b) => (sort === "cheap" ? price(a) - price(b) : price(b) - price(a)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, cat, q, sort, products]);

  const tabs: Tab[] = ["all", ...(products.some((p) => promoActive(p)) ? (["promo"] as Tab[]) : []), ...lineOrder];
  const countOf = (id: Tab) => (id === "all" ? products.length : products.filter((p) => (id === "promo" ? promoActive(p) : inLine(p, id))).length);

  return (
    <div className="catalog">
      <div className="lines-filter" role="tablist" aria-label="Линейки">
        {tabs.map((id) => {
          const look = lineLook[id];
          const count = countOf(id);
          if (!count) return null;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              className={`line-tile ${tab === id ? "is-active" : ""} ${id === "promo" ? "line-tile--promo" : ""}`}
              style={{ ["--tile" as string]: look.tone }}
              onClick={() => {
                setTab(id);
                setCat("all");
              }}
            >
              <span className={`line-tile__pic ${id === "all" ? "bg-stripes-blue" : ""}`}>
                {look.img && <Photo src={look.img} alt="" className={look.img.startsWith("/photos/") ? "cover" : ""} />}
                {id === "all" && <b>{count}</b>}
              </span>
              <span className="line-tile__text">
                {id === "all" ? "Все товары" : id === "promo" ? "Акции" : lineTitles[id]}
                <small>{id === "all" ? "Весь каталог" : id === "promo" ? "Спеццены и наборы" : lineNotes[id]}</small>
              </span>
              {id !== "all" && <sup>{count}</sup>}
            </button>
          );
        })}
      </div>

      <div className="catalog__bar">
        {lineCats.length > 0 ? (
          <div className="chips chips--soft">
            <button type="button" className={`chip ${!activeCat ? "is-active" : ""}`} onClick={() => setCat("all")}>
              Всё
            </button>
            {lineCats.map((c) => (
              <button key={c.id} type="button" className={`chip ${activeCat?.id === c.id ? "is-active" : ""}`} onClick={() => setCat(c.id)}>
                {c.title}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <div className="catalog__tools">
          <label className="search-field">
            <SearchIcon />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Найти: Fleur, торт, вафля…" aria-label="Поиск по каталогу" />
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="sort-select" aria-label="Сортировка">
            <option value="default">Сначала популярные</option>
            <option value="cheap">Сначала дешевле</option>
            <option value="expensive">Сначала дороже</option>
          </select>
        </div>
      </div>

      {activeCat?.builder && (
        <Link href={activeCat.builder.href} className="builder-cta bg-stripes-blue">
          <span>
            <b>{activeCat.builder.title}</b>
            <small>{activeCat.builder.text}</small>
          </span>
          <span className="btn btn--sm">
            В конструктор <ArrowIcon />
          </span>
        </Link>
      )}

      <div className="grid-products grid-products--catalog">
        {list.map((p, i) => (
          <Reveal key={`${tab}-${cat}-${p.slug}`} delay={(i % 4) * 60}>
            <ProductCard product={p} index={i} simple />
          </Reveal>
        ))}
      </div>
      {list.length === 0 && (
        <div className="empty-state">
          <p className="script">Ничего не нашлось</p>
          <p className="muted">Попробуйте другое слово или напишите нам — соберём под заказ.</p>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => {
              setQ("");
              setTab("all");
              setCat("all");
            }}
          >
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
}

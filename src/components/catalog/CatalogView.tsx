"use client";

import { useEffect, useMemo, useState } from "react";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { SearchIcon } from "@/components/ui/Icons";
import { kindTitles, lineNotes, lineTitles, type Kind, type Line, type Product } from "@/data/products";
import { matchProduct } from "@/lib/search";
import { ProductCard } from "./ProductCard";

const lineOrder: Line[] = ["home", "classic", "design", "market", "art", "toppers", "decor"];

/** Картинка и цвет плитки для каждой линейки */
const lineLook: Record<"all" | Line, { img?: string; tone: string }> = {
  all: { tone: "var(--blue-200)" },
  home: { img: "/products/set-fleur-pumpkin-muff.webp", tone: "var(--blue-100)" },
  classic: { img: "/products/classic-muffin.webp", tone: "var(--cream)" },
  design: { img: "/products/design-milano.webp", tone: "var(--sage-100)" },
  market: { img: "/products/stand-paris.webp", tone: "var(--blush-100)" },
  art: { img: "/products/waffle-round-raspberry.webp", tone: "var(--cream)" },
  toppers: { img: "/photos/toppers-ghosts.webp", tone: "var(--blue-100)" },
  decor: { img: "/products/decor-sign.webp", tone: "var(--sage-100)" },
};

const kindOrder: Kind[] = ["set", "stand", "base", "podium", "part", "decor"];
type Sort = "default" | "cheap" | "expensive";

export function CatalogView({ products }: { products: Product[] }) {
  const [line, setLine] = useState<"all" | Line>("all");
  const [kind, setKind] = useState<"all" | Kind>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("default");

  // ?line=home из ссылок на главной, ?q= из поиска в шапке
  useEffect(() => {
    const s = new URLSearchParams(window.location.search);
    const p = s.get("line");
    if (p && (lineOrder as string[]).includes(p)) setLine(p as Line);
    if (s.get("q")) setQ(s.get("q")!);
  }, []);

  const inLine = (p: Product) => line === "all" || p.line === line;
  const list = useMemo(() => {
    const l = products.filter((p) => inLine(p) && (kind === "all" || p.kind === kind) && matchProduct(p, q));
    if (sort === "default") return l;
    const price = (p: Product) => p.price ?? Number.MAX_SAFE_INTEGER;
    return [...l].sort((a, b) => (sort === "cheap" ? price(a) - price(b) : price(b) - price(a)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line, kind, q, sort, products]);

  const kinds = kindOrder.filter((k) => products.some((p) => inLine(p) && p.kind === k));

  return (
    <div className="catalog">
      <div className="lines-filter" role="tablist" aria-label="Линейки">
        {(["all", ...lineOrder] as const).map((id) => {
          const look = lineLook[id];
          const count = id === "all" ? products.length : products.filter((p) => p.line === id).length;
          if (!count) return null;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={line === id}
              className={`line-tile ${line === id ? "is-active" : ""}`}
              style={{ ["--tile" as string]: look.tone }}
              onClick={() => {
                setLine(id);
                setKind("all");
              }}
            >
              <span className={`line-tile__pic ${id === "all" ? "bg-stripes-blue" : ""}`}>
                {look.img && <Photo src={look.img} alt="" className={look.img.startsWith("/photos/") ? "cover" : ""} />}
                {id === "all" && <b>{count}</b>}
              </span>
              <span className="line-tile__text">
                {id === "all" ? "Все товары" : lineTitles[id]}
                <small>{id === "all" ? "Весь каталог" : lineNotes[id]}</small>
              </span>
              {id !== "all" && <sup>{count}</sup>}
            </button>
          );
        })}
      </div>

      <div className="catalog__bar">
        <div className="chips chips--soft">
          <button type="button" className={`chip ${kind === "all" ? "is-active" : ""}`} onClick={() => setKind("all")}>
            Всё
          </button>
          {kinds.map((k) => (
            <button key={k} type="button" className={`chip ${kind === k ? "is-active" : ""}`} onClick={() => setKind(k)}>
              {kindTitles[k]}
            </button>
          ))}
        </div>
        <div className="catalog__tools">
          <label className="search-field">
            <SearchIcon />
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Найти: Fleur, торт, ночник…" aria-label="Поиск по каталогу" />
          </label>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="sort-select" aria-label="Сортировка">
            <option value="default">Сначала популярные</option>
            <option value="cheap">Сначала дешевле</option>
            <option value="expensive">Сначала дороже</option>
          </select>
        </div>
      </div>

      <div className="grid-products grid-products--catalog">
        {list.map((p, i) => (
          <Reveal key={`${line}-${kind}-${p.slug}`} delay={(i % 4) * 60}>
            <ProductCard product={p} index={i} simple />
          </Reveal>
        ))}
      </div>
      {list.length === 0 && (
        <div className="empty-state">
          <p className="script">Ничего не нашлось</p>
          <p className="muted">Попробуйте другое слово или напишите нам — соберём под заказ.</p>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => { setQ(""); setLine("all"); setKind("all"); }}>
            Сбросить фильтры
          </button>
        </div>
      )}
    </div>
  );
}

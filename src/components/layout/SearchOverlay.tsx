"use client";

import { DEMO, demoSearch } from "@/lib/demo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "@/components/ui/Icons";
import { Photo } from "@/components/ui/Photo";
import { formatPrice } from "@/lib/format";

type Hit = { slug: string; name: string; short: string; price: number | null; image: string | null };

const hints = ["Fleur", "Bonbon", "торт", "ночник", "стенд", "Хэллоуин"];

/** Поиск из шапки: подсказки сразу при вводе, Enter — весь список в каталоге */
export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => input.current?.focus(), 30);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits(null);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      if (DEMO) {
        setHits(demoSearch(q));
        return;
      }
      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => r.json())
        .then((d) => setHits(d.items ?? []))
        .catch(() => {});
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  if (!open) return null;
  return (
    <div className="search" role="dialog" aria-modal="true" aria-label="Поиск по сайту" onClick={onClose}>
      <div className="search__panel" onClick={(e) => e.stopPropagation()}>
        <form
          className="search__form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!q.trim()) return;
            onClose();
            router.push(`/catalog?q=${encodeURIComponent(q.trim())}`);
          }}
        >
          <SearchIcon size={24} />
          <input ref={input} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Что ищем? Например, Fleur или подставка для торта" aria-label="Поиск" />
          <button type="button" className="search__close" onClick={onClose} aria-label="Закрыть поиск">
            <CloseIcon />
          </button>
        </form>

        {hits === null && (
          <div className="search__hints">
            <span className="muted small">Часто ищут:</span>
            {hints.map((h) => (
              <button key={h} type="button" className="chip" onClick={() => setQ(h)}>
                {h}
              </button>
            ))}
          </div>
        )}
        {hits && hits.length === 0 && <p className="search__empty muted">Ничего не нашлось — попробуйте другое слово.</p>}
        {hits && hits.length > 0 && (
          <ul className="search__list">
            {hits.map((h) => (
              <li key={h.slug}>
                <Link href={`/catalog/${h.slug}`} onClick={onClose} className="search__hit">
                  <span className="search__pic">{h.image && <Photo src={h.image} alt="" className={h.image.startsWith("/photos/") ? "cover" : ""} />}</span>
                  <span>
                    <b>{h.name}</b>
                    <small>{h.short}</small>
                  </span>
                  <em>{formatPrice(h.price)}</em>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

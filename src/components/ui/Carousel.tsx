"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

/** Горизонтальная карусель на scroll-snap: свайп на телефоне, стрелки на десктопе */
export function Carousel({ children, label }: { children: ReactNode; label: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = () => {
    const el = track.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  };

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const slide = el.querySelector<HTMLElement>(".carousel__slide");
    const step = slide ? slide.offsetWidth + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="carousel" role="region" aria-roledescription="карусель" aria-label={label}>
      <button type="button" className="carousel__btn carousel__btn--prev" onClick={() => go(-1)} disabled={edge.start} aria-label="Назад">
        ←
      </button>
      <div className="carousel__track" ref={track} onScroll={update}>
        {Children.map(children, (c) => (
          <div className="carousel__slide">{c}</div>
        ))}
      </div>
      <button type="button" className="carousel__btn carousel__btn--next" onClick={() => go(1)} disabled={edge.end} aria-label="Вперёд">
        →
      </button>
    </div>
  );
}

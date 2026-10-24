"use client";

import { useEffect, useId, useRef } from "react";

const defaultItems = ["десертные столики", "подставки для тортов", "стенды для маркетов", "собери свою комбинацию", "25 цветов", "вафельный декор", "топперы"];

/**
 * Бегущая лента-волна: текст едет по изогнутой ленте, как в референсе.
 * Двигаем startOffset у textPath; длину одного «круга» текста меряем в браузере, чтобы цикл был бесшовным.
 */
export function WavyTicker({ items = defaultItems, tone = "choc", speed = 60 }: { items?: string[]; tone?: "choc" | "blue" | "caramel"; speed?: number }) {
  const uid = useId().replace(/:/g, "");
  const unitRef = useRef<SVGTextElement>(null);
  const pathTextRef = useRef<SVGTextPathElement>(null);

  const unit = items.map((t) => `${t}  ✿  `).join("");
  const text = unit.repeat(6);

  useEffect(() => {
    const tp = pathTextRef.current;
    const u = unitRef.current;
    if (!tp || !u) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const len = u.getComputedTextLength() || 1000;
    let raf = 0;
    let last = performance.now();
    let off = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(tp.ownerSVGElement!);
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (visible) {
        off = (off - (speed * dt) / 1000) % len;
        tp.setAttribute("startOffset", String(off));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [speed, unit]);

  // волна шириной 1440: мягкие «горки», с запасом сверху и снизу, чтобы лента нигде не обрезалась
  const d = "M-80,95 C200,45 380,150 620,100 S1040,45 1220,95 S1460,140 1540,90";

  return (
    <div className={`wavy wavy--${tone}`} aria-hidden="true">
      <svg viewBox="0 0 1440 190" preserveAspectRatio="xMidYMid slice" focusable="false">
        <defs>
          <path id={`${uid}-p`} d={d} />
        </defs>
        <use href={`#${uid}-p`} className="wavy__band" />
        <text className="wavy__text" dy="7">
          <textPath ref={pathTextRef} href={`#${uid}-p`} startOffset="0">
            {text}
          </textPath>
        </text>
        {/* скрытый образец одного «круга» — по нему меряем длину */}
        <text ref={unitRef} className="wavy__text wavy__measure">
          {unit}
        </text>
      </svg>
    </div>
  );
}

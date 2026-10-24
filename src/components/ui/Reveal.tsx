"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { PRELOADED_EVENT } from "@/components/preloader/PreloaderController";

type Effect = "up" | "fade" | "scale" | "left" | "right" | "drip";

type Props = {
  children: ReactNode;
  /** Как появляется элемент */
  effect?: Effect;
  /** Задержка в мс — для каскада карточек */
  delay?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
};

/* Один IntersectionObserver на всю страницу — дешевле, чем по наблюдателю на элемент */
let observer: IntersectionObserver | null = null;
const pending = new Set<Element>();

function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          observer!.unobserve(e.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
  );
  return observer;
}

function preloading() {
  return document.documentElement.classList.contains("is-preloading");
}

if (typeof window !== "undefined") {
  window.addEventListener(PRELOADED_EVENT, () => {
    pending.forEach((el) => getObserver().observe(el));
    pending.clear();
  });
}

/**
 * Плавное появление при скролле: элемент выезжает, когда доходит до экрана.
 * Пока стекает прелоадер — ждём, чтобы анимация не прошла за ним.
 * Без JS и при prefers-reduced-motion всё видно сразу (см. styles/motion.css).
 */
export function Reveal({ children, effect = "up", delay = 0, as: Tag = "div", className, style }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-in");
      return;
    }
    if (preloading()) pending.add(el);
    else getObserver().observe(el);
    return () => {
      pending.delete(el);
      observer?.unobserve(el);
    };
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal reveal--${effect} ${className ?? ""}`}
      style={{ ...style, ["--reveal-delay" as string]: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

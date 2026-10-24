"use client";

import { useEffect } from "react";

const COLORS = ["var(--choc)", "var(--blue-400)", "var(--caramel)", "var(--bordeaux-300)"];

/**
 * Милая «вспышка» при клике: из точки разлетаются 8 коротких чёрточек.
 * Один слушатель на весь документ; элементы удаляются после анимации. Без анимации — если в системе выключено движение.
 */
export function ClickSpark() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let n = 0;
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const color = COLORS[n++ % COLORS.length];
      const el = document.createElement("span");
      el.className = "spark";
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
      el.style.setProperty("--spark", color);
      for (let i = 0; i < 8; i++) {
        const ray = document.createElement("i");
        ray.style.setProperty("--a", `${i * 45 + (i % 2 ? 8 : 0)}deg`);
        ray.style.setProperty("--len", i % 2 ? "9px" : "13px");
        el.appendChild(ray);
      }
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 550);
    };
    window.addEventListener("pointerdown", onDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}

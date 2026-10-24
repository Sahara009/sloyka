"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import { logoLayers, logoLetters, logoNozzle, logoViewBox, logoYBody, nozzleTip } from "./logo-paths";

type Props = {
  className?: string;
  /** Светлая версия для тёмного фона (прелоадер) */
  tone?: "dark" | "light";
  /** Когда запускать: после прелоадера, сразу, или только по наведению */
  autoplay?: "after-preload" | "now" | "none";
  /** Ускорение анимации: 1 — обычная, 0.6 — быстрее */
  speed?: number;
  /** Задержка перед стартом, мс */
  delay?: number;
  /** Повторять при наведении */
  replayOnHover?: boolean;
  title?: string;
};

type Seg = { dur: number; from: [number, number]; to: [number, number]; layer?: number; dir?: 1 | -1 };

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Маршрут насадки: к слою → проход по слою → к следующему … → домой */
function buildTimeline(speed: number): Seg[] {
  const segs: Seg[] = [];
  let pos: [number, number] = [0, 0];
  logoLayers.forEach((l, i) => {
    const dir: 1 | -1 = i % 2 === 0 ? 1 : -1; // туда-обратно, как печатает принтер
    const startX = (dir === 1 ? l.x0 : l.x1) - nozzleTip.x;
    const endX = (dir === 1 ? l.x1 : l.x0) - nozzleTip.x;
    const y = l.y0 - nozzleTip.y;
    const start: [number, number] = [startX, y];
    segs.push({ dur: (i === 0 ? 480 : 220) * speed, from: pos, to: start });
    segs.push({ dur: 360 * speed, from: start, to: [endX, y], layer: i, dir });
    pos = [endX, y];
  });
  segs.push({ dur: 560 * speed, from: pos, to: [0, 0] });
  return segs;
}

/**
 * Логотип Sloyka с анимацией: насадка опускается к букве y и слой за слоем
 * «печатает» голубые полоски, а потом возвращается на место.
 */
export function AnimatedLogo({ className, tone = "dark", autoplay = "after-preload", speed = 1, delay = 0, replayOnHover = true, title = "Sloyka" }: Props) {
  const uid = useId().replace(/:/g, "");
  const nozzleRef = useRef<SVGGElement>(null);
  const clipRefs = useRef<(SVGRectElement | null)[]>([]);
  const playing = useRef(false);
  const raf = useRef<number | undefined>(undefined);

  const setLayer = (i: number, p: number, dir: 1 | -1) => {
    const r = clipRefs.current[i];
    if (!r) return;
    const l = logoLayers[i];
    const w = (l.x1 - l.x0 + 4) * p;
    r.setAttribute("width", String(w));
    r.setAttribute("x", String(dir === 1 ? l.x0 - 2 : l.x1 + 2 - w));
  };

  const showAll = () => logoLayers.forEach((_, i) => setLayer(i, 1, 1));

  const play = useCallback(() => {
    if (playing.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      showAll();
      return;
    }
    playing.current = true;
    logoLayers.forEach((_, i) => setLayer(i, 0, 1));
    const segs = buildTimeline(speed);
    const total = segs.reduce((s, x) => s + x.dur, 0);
    const t0 = performance.now();

    const frame = (now: number) => {
      let t = now - t0;
      for (const s of segs) {
        if (t <= s.dur) {
          const p = s.layer === undefined ? ease(t / s.dur) : t / s.dur;
          const x = s.from[0] + (s.to[0] - s.from[0]) * p;
          const y = s.from[1] + (s.to[1] - s.from[1]) * p;
          // лёгкое покачивание во время печати
          const wobble = s.layer !== undefined ? Math.sin(p * Math.PI * 4) * 0.6 : 0;
          nozzleRef.current?.setAttribute("transform", `translate(${x.toFixed(2)} ${(y + wobble).toFixed(2)})`);
          if (s.layer !== undefined) setLayer(s.layer, p, s.dir!);
          break;
        }
        if (s.layer !== undefined) setLayer(s.layer, 1, s.dir!);
        t -= s.dur;
      }
      if (now - t0 < total) raf.current = requestAnimationFrame(frame);
      else {
        nozzleRef.current?.setAttribute("transform", "translate(0 0)");
        showAll();
        playing.current = false;
      }
    };
    raf.current = requestAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speed]);

  useEffect(() => {
    if (autoplay === "none") return;
    // в шапке: если сейчас идёт прелоадер, анимацию уже покажет он — второй раз не нужно
    if (autoplay === "after-preload" && document.documentElement.classList.contains("is-preloading")) return;
    logoLayers.forEach((_, i) => setLayer(i, 0, 1));
    const id = window.setTimeout(play, autoplay === "now" ? delay : 400 + delay);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, play, delay]);

  useEffect(() => () => {
    if (raf.current) cancelAnimationFrame(raf.current);
  }, []);

  return (
    <svg
      viewBox={logoViewBox}
      className={`alogo alogo--${tone} ${className ?? ""}`}
      role="img"
      aria-label={title}
      onMouseEnter={replayOnHover ? play : undefined}
    >
      <defs>
        {logoLayers.map((l, i) => (
          <clipPath key={i} id={`${uid}-c${i}`}>
            {/* по умолчанию слой виден целиком — так логотип нормальный без JS */}
            <rect ref={(el) => void (clipRefs.current[i] = el)} x={l.x0 - 2} y={l.y0 - 2} width={l.x1 - l.x0 + 4} height={l.y1 - l.y0 + 4} />
          </clipPath>
        ))}
      </defs>
      <path d={logoLetters} className="alogo__letters" fillRule="evenodd" />
      <path d={logoYBody} className="alogo__y" />
      {logoLayers.map((l, i) => (
        <path key={i} d={l.d} className="alogo__y" clipPath={`url(#${uid}-c${i})`} />
      ))}
      <g ref={nozzleRef} className="alogo__nozzle">
        <path d={logoNozzle} fillRule="evenodd" />
      </g>
    </svg>
  );
}

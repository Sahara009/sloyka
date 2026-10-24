import type { CSSProperties, ReactNode } from "react";

export type ShapeName = "quatrefoil" | "clover" | "scallop" | "arch" | "arch-scallop" | "cloud" | "stamp" | "ornate" | "rounded";

type Props = {
  shape: ShapeName;
  /** Цвет обводки (как у ilovepink). Без обводки — не передавать */
  outline?: string;
  /** Фон внутри фигуры */
  bg?: string;
  /** Толщина обводки в px */
  stroke?: number;
  ratio?: string;
  className?: string;
  children?: ReactNode;
};

/**
 * Фигурная маска: картинка или иллюстрация внутри формы (цветок, арка, фестоны).
 * Формы лежат в /public/shapes/*.svg — новую форму достаточно нарисовать там.
 */
export function Shape({ shape, outline, bg = "var(--cream)", stroke = 5, ratio = "1 / 1", className, children }: Props) {
  const style = {
    "--mask": `url(/shapes/${shape}.svg)`,
    "--shape-outline": outline ?? "transparent",
    "--shape-bg": bg,
    "--shape-stroke": outline ? `${stroke}px` : "0px",
    aspectRatio: ratio,
  } as CSSProperties;

  return (
    <div className={`shape ${className ?? ""}`} style={style}>
      <div className="shape__outline" aria-hidden />
      <div className="shape__inner">{children}</div>
    </div>
  );
}

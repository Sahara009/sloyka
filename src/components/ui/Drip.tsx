import { DRIP_WIDTH, dripPath } from "@/components/preloader/drip";

/**
 * Край секции «подтёки глазури» — как в прелоадере.
 * Ставится сразу под секцией того же цвета: <section style={{ background: c }}>…</section><Drip color={c} />
 */
export function Drip({ color, seed = 5, depth = 70, className }: { color: string; seed?: number; depth?: number; className?: string }) {
  return (
    <svg
      className={`drip ${className ?? ""}`}
      viewBox={`0 0 ${DRIP_WIDTH} ${depth + 40}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d={dripPath(seed, depth)} fill={color} />
    </svg>
  );
}

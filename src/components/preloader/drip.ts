/**
 * Нижний край «глазури» с подтёками — SVG-путь шириной 1440.
 * Генератор детерминированный (seed), поэтому сервер и браузер рисуют одно и то же.
 */
function random(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export const DRIP_WIDTH = 1440;

/**
 * @param seed  разные значения — разные подтёки
 * @param depth максимальная длина подтёка
 * Путь начинается сверху (y=0) — это низ сплошной заливки — и рисует волну с каплями вниз.
 */
export function dripPath(seed: number, depth = 120): string {
  const rnd = random(seed);
  const top = 0;
  let x = DRIP_WIDTH;
  let d = `M${DRIP_WIDTH},${top} V${top + 6}`;

  while (x > 0) {
    // волнистый промежуток между каплями
    const gap = 40 + rnd() * 90;
    const x1 = Math.max(0, x - gap);
    d += ` Q${((x + x1) / 2).toFixed(1)},${(top + 18 + rnd() * 10).toFixed(1)} ${x1.toFixed(1)},${top + 6}`;
    x = x1;
    const w = 22 + rnd() * 26;
    if (x - w <= 0) break;

    // капля: вниз, круглый кончик, обратно вверх
    const len = 24 + rnd() * depth;
    const xm = x - w / 2;
    d += ` C${x.toFixed(1)},${(top + 6 + len * 0.55).toFixed(1)} ${(x - w * 0.06).toFixed(1)},${(top + 6 + len).toFixed(1)} ${xm.toFixed(1)},${(top + 6 + len).toFixed(1)}`;
    d += ` C${(x - w + w * 0.06).toFixed(1)},${(top + 6 + len).toFixed(1)} ${(x - w).toFixed(1)},${(top + 6 + len * 0.55).toFixed(1)} ${(x - w).toFixed(1)},${top + 6}`;
    x -= w;
  }

  d += ` L0,${top + 6} V${top} Z`;
  return d;
}

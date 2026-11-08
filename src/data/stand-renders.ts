/*
 * Рендеры стоек Sloyka Market (заказчик, 04.11): каждая деталь отдельно, одна камера (изометрия, без перспективы).
 * Сайт собирает стойку сам: ставит подиумы на ступени ножек по сантиметрам и перекрашивает каждую деталь.
 * Файлы: public/products/stand/<деталь>.webp (осветлены, обрезаны по силуэту, уменьшены в 0.6 раза).
 * parts — где деталь лежала в исходном кадре 1920×1080: [x, y, ширина, высота] в px кадра.
 * U, V, Z — куда смещается картинка на 1 см: вдоль подиума (вправо), вглубь (назад), вверх.
 * Q — точка кадра для ножек: середина по ширине, передний край, уровень стола.
 * Подиум стоит на ступени: задний край — по заднему краю ступени (ступень 7 см), низ — на высоте этажа;
 * Маркиза свисает на 3 см ниже этажа (drop). Приставной — на столе перед стойкой.
 * Ножки -21 не нужны: это те же боковины, сдвинутые на 2 см к центру.
 */
type XY = [number, number];
export const SR = { U: [18.08, 4.12] as XY, V: [18.86, -3.73] as XY, Z: [0.0, -25.7] as XY };
export const STEP_CM = 7;

export const srParts: Record<string, [number, number, number, number]> = {
  "legs-babylon-l": [536, 204, 411, 640],
  "legs-babylon-r": [970, 303, 412, 640],
  "logo-paris-l": [716, 642, 199, 275],
  "logo-paris-r": [1150, 740, 199, 275],
  "legs-paris-l": [538, 458, 410, 512],
  "legs-paris-r": [973, 558, 409, 511],
  "legs-florence-l": [604, 504, 276, 433],
  "legs-florence-r": [1039, 603, 276, 433],
  "podium-cascade-1": [653, 463, 611, 213],
  "podium-cascade-2": [653, 452, 610, 236],
  "podium-cascade-3": [653, 441, 611, 259],
  "podium-tribune-2": [667, 373, 586, 375],
  "podium-tribune-3": [667, 373, 586, 375],
  "podium-amphitheatre": [664, 377, 588, 372],
  "podium-agora": [667, 392, 582, 345],
  "podium-diadem": [667, 487, 582, 169],
  "podium-marseille-21": [698, 507, 523, 130],
  "podium-marseille-25": [661, 499, 599, 147],
  "podium-marquise-21": [697, 466, 519, 199],
  "podium-marquise-25": [657, 458, 595, 216],
  "podium-loge-1": [667, 487, 582, 169],
  "podium-loge-2": [667, 487, 582, 169],
  "podium-loge-3": [667, 487, 582, 169],
  "podium-patio-1": [662, 483, 589, 180],
  "podium-patio-2": [664, 483, 589, 179],
  "podium-patio-3": [663, 483, 589, 179],
  "diadem-pusety-l": [806, 166, 191, 382],
  "diadem-pusety-r": [1026, 217, 191, 382],
  "diadem-chains-l": [788, 64, 227, 487],
  "diadem-chains-r": [1009, 114, 227, 488],
  "crown-post": [669, 282, 578, 779],
  "crown-cap1": [657, 179, 497, 268],
  "crown-cap2": [741, 199, 497, 268],
};
export const srSrc = (name: string) => `/products/stand/${name}.webp`;

export const srBases: Record<string, { Q: XY; floors: number[]; L: string; R: string; logoL?: string; logoR?: string }> = {
  babylon: {"Q": [758.7, 892.3], "floors": [7.5, 14.5, 21.5], "L": "legs-babylon-l", "R": "legs-babylon-r"},
  paris: {"Q": [760.7, 1018.3], "floors": [5.5, 11, 16.5], "L": "legs-paris-l", "R": "legs-paris-r", "logoL": "logo-paris-l", "logoR": "logo-paris-r"},
  florence: {"Q": [826.9, 985.3], "floors": [7.5, 14.5], "L": "legs-florence-l", "R": "legs-florence-r"},
};

/** Габариты по матрице (глубина D, высота H, см) и свес вниз под этаж */
export const srPodiums: Record<string, { D: number; H: number; drop: number }> = {
  "cascade-1": { D: 8, H: 3, drop: 0 },
  "cascade-2": { D: 8, H: 4, drop: 0 },
  "cascade-3": { D: 8, H: 5, drop: 0 },
  "tribune-2": { D: 7, H: 9.5, drop: 0 },
  "tribune-3": { D: 7, H: 9.5, drop: 0 },
  "amphitheatre": { D: 7, H: 9.5, drop: 0 },
  "agora": { D: 7, H: 9.5, drop: 0 },
  "diadem": { D: 7, H: 1.5, drop: 0 },
  "marseille-21": { D: 8, H: 0.5, drop: 0 },
  "marseille-25": { D: 8, H: 0.5, drop: 0 },
  "marquise-21": { D: 7.5, H: 3.5, drop: 3 },
  "marquise-25": { D: 7.5, H: 3.5, drop: 3 },
  "loge-1": { D: 7, H: 1.5, drop: 0 },
  "loge-2": { D: 7, H: 1.5, drop: 0 },
  "loge-3": { D: 7, H: 1.5, drop: 0 },
  "patio-1": { D: 7, H: 2, drop: 0 },
  "patio-2": { D: 7, H: 2, drop: 0 },
  "patio-3": { D: 7, H: 2, drop: 0 },
};
/** Корона: стойки с переходником встают на верхний этаж у задней стенки, шапка — сверху */
export const srCrown = { D: 6.49, H: 25.33 };

export type DiademInsert = "pusety" | "chains";
export const diademInserts: { id: DiademInsert; name: string }[] = [
  { id: "pusety", name: "для пусетов" },
  { id: "chains", name: "для цепочек" },
];

export type StandLayer = { key: string; src: string; color: string; x: number; y: number; w: number; h: number };
export type StandSceneInput = {
  base: string;
  /** сверху вниз: [верхний ярус, …, ярус 1, приставной]; null — пусто */
  slots: (string | null)[];
  colors: { legs: string; slots: string[]; logo?: string | null; crown?: { post: string; cap1: string; cap2: string } | null };
  inserts?: { l: DiademInsert; r: DiademInsert };
};

const add = (a: XY, b: XY): XY => [a[0] + b[0], a[1] + b[1]];
const proj = (x: number, y: number, z: number): XY => [x * SR.U[0] + y * SR.V[0] + z * SR.Z[0], x * SR.U[1] + y * SR.V[1] + z * SR.Z[1]];
const center = (name: string): XY => {
  const [x, y, w, h] = srParts[name];
  return [x + w / 2, y + h / 2];
};

/** Сборка стойки: слои снизу вверх (что чем перекрывается) и общий кадр. Координаты — px исходного кадра */
export function standScene({ base, slots, colors, inserts }: StandSceneInput) {
  const b = srBases[base];
  const levels = b.floors.length;
  const out: StandLayer[] = [];
  const put = (key: string, name: string, color: string, d: XY) => {
    const [x, y, w, h] = srParts[name];
    out.push({ key, src: srSrc(name), color, x: x + d[0], y: y + d[1], w, h });
  };
  // узкие подиумы (21 см) — боковины ближе к центру на 2 см с каждой стороны
  const narrow = slots.some((id) => id?.endsWith("-21"));
  const sh = narrow ? proj(2, 0, 0) : ([0, 0] as XY);
  const neg: XY = [-sh[0], -sh[1]];
  const top = b.floors[levels - 1];
  const crownD = add(add(b.Q, proj(0, STEP_CM * levels - srCrown.D / 2, top + srCrown.H / 2)), [-center("crown-post")[0], -center("crown-post")[1]]);

  put("legs-l", b.L, colors.legs, sh);
  if (b.logoL && colors.logo) put("logo-l", b.logoL, colors.logo, sh);
  if (colors.crown) put("crown", "crown-post", colors.crown.post, crownD);
  // ярусы: дальние (верхние) раньше, ближние позже
  for (let k = 0; k < levels; k++) {
    const id = slots[k];
    if (!id) continue;
    const p = srPodiums[id];
    const f = levels - 1 - k;
    const target = add(b.Q, proj(0, STEP_CM * (f + 1) - p.D / 2, b.floors[f] - p.drop + p.H / 2));
    const c = center(`podium-${id}`);
    const d: XY = [target[0] - c[0], target[1] - c[1]];
    const col = colors.slots[k] ?? colors.legs;
    put(`s${k}`, `podium-${id}`, col, d);
    if (id === "diadem") {
      put(`s${k}-l`, `diadem-${inserts?.l ?? "pusety"}-l`, col, d);
      put(`s${k}-r`, `diadem-${inserts?.r ?? "chains"}-r`, col, d);
    }
  }
  put("legs-r", b.R, colors.legs, neg);
  if (b.logoR && colors.logo) put("logo-r", b.logoR, colors.logo, neg);
  if (colors.crown) {
    put("cap1", "crown-cap1", colors.crown.cap1, crownD);
    put("cap2", "crown-cap2", colors.crown.cap2, crownD);
  }
  const extra = slots[levels];
  if (extra) {
    const p = srPodiums[extra];
    const target = add(b.Q, proj(0, -0.5 - p.D / 2, p.H / 2));
    const c = center(`podium-${extra}`);
    put(`s${levels}`, `podium-${extra}`, colors.slots[levels] ?? colors.legs, [target[0] - c[0], target[1] - c[1]]);
  }
  const box = {
    x: Math.min(...out.map((l) => l.x)),
    y: Math.min(...out.map((l) => l.y)),
    r: Math.max(...out.map((l) => l.x + l.w)),
    b: Math.max(...out.map((l) => l.y + l.h)),
  };
  return { layers: out, box: { x: box.x, y: box.y, w: box.r - box.x, h: box.b - box.y } };
}

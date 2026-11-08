/*
 * Как деталь выглядит в конструкторе.
 * base   — фото детали в белом без фона (из него сайт перекрашивает в любой цвет палитры);
 * width  — ширина в «единицах сцены»: реальный диаметр × 13,5 (рендеры сняты в разном масштабе, поэтому считаем по сантиметрам);
 * tuck   — какая доля высоты детали уходит под деталь сверху (место крепления);
 * photos — настоящие фото в конкретных цветах: если есть, показываются вместо перекраски (обычно для тёмных цветов).
 *
 * overlays — слои того же кадра поверх детали (вкладыши Fleur, шарики BonBon): рисуются точно поверх, красятся отдельно.
 * Рендеры от заказчика — 04.11 (осветлены, обрезаны по силуэту). Новые файлы класть с теми же именами.
 * Позже эти данные переедут в админку (модель Part: image, width, tuck, colorPhotos).
 */

export type PartVisual = { base: string; width: number; tuck: number; photos?: Record<string, string>; overlays?: Record<string, string> };

const b = (n: string) => `/products/base/${n}.webp`;
const cm = (d: number) => Math.round(d * 13.5);

export const podiumVisuals: Record<string, PartVisual> = {
  bonbon: { base: b("podium-bonbon"), width: cm(24), tuck: 0.34, overlays: { balls1: b("bonbon-balls1"), balls2: b("bonbon-balls2") } },
  fleur: { base: b("podium-fleur"), width: cm(24), tuck: 0.3, overlays: { nuts: b("fleur-insert-nuts"), honey: b("fleur-insert-honey"), flower: b("fleur-insert-flower") } },
  cappottina: { base: b("podium-cappottina"), width: cm(27), tuck: 0.42 },
};

export const legVisuals: Record<string, PartVisual> = {
  piccola: { base: b("leg-piccola"), width: cm(11.5), tuck: 0.06 },
  pumpkin: { base: b("leg-pumpkin"), width: cm(13), tuck: 0.06 },
  souffle: { base: b("leg-souffle"), width: cm(12), tuck: 0.05 },
  muff: { base: b("leg-muff"), width: cm(12), tuck: 0.05 },
  grande: { base: b("leg-grande"), width: cm(13), tuck: 0.05 },
};

export const extraVisuals: Record<string, PartVisual> = {
  nuts: { base: b("insert-nuts"), width: 148, tuck: 0 },
  flower: { base: b("insert-flower"), width: 147, tuck: 0 },
  honey: { base: b("insert-honey"), width: 146, tuck: 0 },
  attico: { base: b("attico"), width: 330, tuck: 0 },
};

export const marketBaseVisuals: Record<string, PartVisual> = {
  florence: { base: b("base-florence"), width: 165, tuck: 0 },
  paris: { base: b("base-paris"), width: 284, tuck: 0 },
  babylon: { base: b("base-babylon"), width: 288, tuck: 0 },
};

/** Ширина сцены в тех же единицах — по ней считаются проценты */
export const STAGE_UNITS = 420;

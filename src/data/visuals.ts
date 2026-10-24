/*
 * Как деталь выглядит в конструкторе.
 * base   — фото детали в белом без фона (из него сайт перекрашивает в любой цвет палитры);
 * width  — ширина в «единицах сцены» (1 ед. ≈ 1 px исходного фото, все фото сняты в одном масштабе);
 * tuck   — какая доля высоты детали уходит под деталь сверху (место крепления);
 * photos — настоящие фото в конкретных цветах: если есть, показываются вместо перекраски (обычно для тёмных цветов).
 *
 * TODO: когда заказчик пришлёт фото деталей в белом, заменить файлы в /public/products/base с теми же именами.
 * Позже эти данные переедут в админку (модель Part: image, width, tuck, colorPhotos).
 */

export type PartVisual = { base: string; width: number; tuck: number; photos?: Record<string, string> };

const b = (n: string) => `/products/base/${n}.webp`;

export const podiumVisuals: Record<string, PartVisual> = {
  bonbon: { base: b("podium-bonbon"), width: 326, tuck: 0.34 },
  fleur: { base: b("podium-fleur"), width: 323, tuck: 0.3 },
  cappottina: { base: b("podium-cappottina"), width: 357, tuck: 0.42 },
};

export const legVisuals: Record<string, PartVisual> = {
  piccola: { base: b("leg-piccola"), width: 170, tuck: 0.06 },
  pumpkin: { base: b("leg-pumpkin"), width: 185, tuck: 0.06 },
  souffle: { base: b("leg-souffle"), width: 161, tuck: 0.05 },
  muff: { base: b("leg-muff"), width: 158, tuck: 0.05 },
  grande: { base: b("leg-grande"), width: 179, tuck: 0.05 },
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

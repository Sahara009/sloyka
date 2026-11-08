/*
 * Правила совместимости подиумов Sloyka Market — по матрице заказчика (29.10, сверено с матрицей 03.11).
 * По ним работают и конструктор (серая кнопка «+» с подсказкой), и сервер (не даст оформить невозможную стойку).
 * Порядок подиумов в сборке — снизу вверх (первый — нижний ярус).
 *
 * Общие правила:
 *  • Маркиза-21 и Марсель-21 — только в комбо между собой (с подиумами 25 см стойку не собрать);
 *  • Диадема — всегда только наверху и «либо/либо» с короной (в матрице 03.11 правило объединено с Короной).
 * По ножкам:
 *  • Париж: без Трибун, Амфитеатра и Агоры; Маркиза-25 не ставится над Каскадом и Патио;
 *  • Флоренция и Вавилон: Маркиза-25 не над Каскад-2/3, Трибуной, Амфитеатром, Агорой;
 *    Марсель-25 и Каскад-1/2/3 — не над Трибуной, Амфитеатром, Агорой (в матрице 03.11 правило Каскада на все три);
 *    Трибуны, Амфитеатр, Агора не могут стоять перед подиумом с выносом (Маркиза, Марсель, Каскад) —
 *    «перед» = ярусом ниже, то есть то же правило с другой стороны; проверяется общим списком overhang.
 * «Над» — на ярус прямо над (заказчик, 03.11): Каскад на 1-м ярусе → на 2-м Маркиза не встанет;
 * на 3-м встанет, если на 2-м нет Каскада или Патио.
 * Ярусы: 1 — низ, 2 — середина, 3 — верх (или 2 яруса у Флоренции) + один приставной подиум на столе перед стойкой.
 * Если подиумов больше, чем ярусов, первый (нижний) в сборке — приставной. Маркиза приставной быть не может.
 * Приставной тоже проверяем по правилу «над» с 1-м ярусом (заказчик, 03.11: впритык не встанет — проще запретить).
 * Подиумы выбираются сверху вниз (заказчик, 03.11): первый — верхний ярус, дальше ниже, последний — приставной.
 * В массиве сборки порядок по-прежнему снизу вверх.
 */
import { marketBases } from "./parts";

/** Номер яруса подиума i (снизу вверх) в сборке из n подиумов: 0 — приставной. Ярусы заполняются сверху */
export function tierOf(i: number, n: number, levels: number): number {
  return n > levels ? i : levels - n + 1 + i;
}
export const tierName = (t: number) => (t === 0 ? "Приставной" : `Ярус ${t}`);

const tall = ["tribune-2", "tribune-3", "amphitheatre", "agora"];
const narrow = ["marquise-21", "marseille-21"];
/** Подиумы с выносом (матрица: «вынос 0,5 см» у Маркиз, «1 см» у Марселей и Каскадов) */
const overhang = ["marquise-21", "marquise-25", "marseille-21", "marseille-25", "cascade-1", "cascade-2", "cascade-3"];

type BaseRules = {
  /** какие подиумы можно ставить на эти ножки (если не указано — все) */
  allowed?: string[];
  /** подиум → над какими подиумами его ставить нельзя */
  notAbove: Record<string, string[]>;
};

export const baseRules: Record<string, BaseRules> = {
  paris: {
    allowed: ["marquise-21", "marseille-21", "marquise-25", "marseille-25", "loge-1", "loge-2", "loge-3", "patio-1", "patio-2", "patio-3", "cascade-1", "cascade-2", "cascade-3", "diadem"],
    notAbove: { "marquise-25": ["cascade-1", "cascade-2", "cascade-3", "patio-1", "patio-2", "patio-3"] },
  },
  florence: {
    notAbove: {
      "marquise-25": ["cascade-2", "cascade-3", ...tall],
      "marseille-25": tall,
      "cascade-1": tall,
      "cascade-2": tall,
      "cascade-3": tall,
    },
  },
};
baseRules.babylon = baseRules.florence;

/** Первая проблема в сборке (подиумы снизу вверх) или null, если всё совместимо */
export function validateStand(baseId: string, names: Record<string, string>, picked: string[], crown = false): string | null {
  const n = (id: string) => names[id] ?? id;
  const rules = baseRules[baseId];
  const notAllowed = picked.find((id) => rules?.allowed && !rules.allowed.includes(id));
  if (notAllowed) return `«${n(notAllowed)}» не ставится на эти ножки.`;
  const hasNarrow = picked.some((id) => narrow.includes(id));
  if (hasNarrow && picked.some((id) => !narrow.includes(id))) return "Маркиза-21 и Марсель-21 сочетаются только между собой: с подиумами 25 см стойку не собрать.";
  const levels = marketBases.find((b) => b.id === baseId)?.levels ?? picked.length;
  if (picked.length > levels && picked[0].startsWith("marquise")) return "Маркиза не может быть приставным подиумом — поставьте её на ярус стойки.";
  const di = picked.indexOf("diadem");
  if (di >= 0 && di !== picked.length - 1) return "Диадема ставится только наверх.";
  if (di >= 0 && crown) return "Диадема и корона — либо одно, либо другое.";
  for (let i = 1; i < picked.length; i++) {
    const forbidden = rules?.notAbove[picked[i]];
    if (forbidden?.includes(picked[i - 1])) return `«${n(picked[i])}» не ставится над «${n(picked[i - 1])}».`;
    if (overhang.includes(picked[i]) && tall.includes(picked[i - 1]))
      return `«${n(picked[i - 1])}» не ставится перед подиумом с выносом («${n(picked[i])}»).`;
  }
  return null;
}

/** Можно ли добавить подиум следующим (ниже уже выбранных — сборка идёт сверху вниз); если нет — причина для подсказки */
export function blockedReason(baseId: string, names: Record<string, string>, picked: string[], candidate: string, crown = false): string | null {
  return validateStand(baseId, names, [candidate, ...picked], crown);
}

/*
 * Конструктор по ярусам (заказчик, 04.11): выбираем сверху вниз — корона/диадема, верхний ярус, ниже, …, приставной.
 * На каждом ярусе недоступные подиумы серые с причиной «не совместим: сверху …». Верхний ярус доступен всегда.
 * Если сверху выбрали несовместимое с тем, что уже стоит ниже, — нижний подиум «слетает».
 * Схема заказчика: этаж 7 см; подиумы с выносом (Маркиза, Марсель, Каскад) не встают над подиумами с подъёмом
 * (Трибуны, Амфитеатр, Агора); у Маркизы свес 3 см — под ней подиум ниже 4 см (Каскад-2/3 не встанут).
 * slots — сверху вниз: [верхний ярус, …, ярус 1, приставной]; null — пусто.
 */
function pairConflict(baseId: string, above: string, below: string): boolean {
  if (baseRules[baseId]?.notAbove[above]?.includes(below)) return true;
  return overhang.includes(above) && tall.includes(below);
}

/** Почему подиум cand нельзя поставить в слот i (смотрим только на то, что выше) */
export function slotReason(baseId: string, names: Record<string, string>, slots: (string | null)[], i: number, cand: string): string | null {
  const n = (id: string) => names[id] ?? id;
  const levels = marketBases.find((b) => b.id === baseId)?.levels ?? slots.length - 1;
  const rules = baseRules[baseId];
  if (rules?.allowed && !rules.allowed.includes(cand)) return "Не ставится на эти ножки";
  if (cand === "diadem" && i !== 0) return "Диадема — только наверх";
  if (i === levels && cand.startsWith("marquise")) return "Маркиза не бывает приставной";
  const above = slots.slice(0, i).filter((x): x is string => !!x);
  const narrowAbove = above.find((id) => narrow.includes(id) !== narrow.includes(cand));
  if (narrowAbove) return `Не совместим: сверху «${n(narrowAbove)}» (21 и 25 см не сочетаются)`;
  const a = slots[i - 1];
  if (a && pairConflict(baseId, a, cand)) return `Не совместим: сверху «${n(a)}»`;
  return null;
}

/** После выбора в слоте i убираем снизу то, что стало несовместимым */
export function pruneBelow(baseId: string, names: Record<string, string>, slots: (string | null)[], i: number): (string | null)[] {
  const out = [...slots];
  for (let j = i + 1; j < out.length; j++) if (out[j] && slotReason(baseId, names, out, j, out[j]!)) out[j] = null;
  return out;
}

/** Слоты сверху вниз ↔ сборка снизу вверх (ярусы заполняются сверху, лишний нижний — приставной) */
export function slotsFromPicked(picked: string[], levels: number): (string | null)[] {
  const slots: (string | null)[] = Array(levels + 1).fill(null);
  const extra = picked.length > levels;
  const tiers = (extra ? picked.slice(1) : picked).slice().reverse();
  tiers.forEach((id, k) => (slots[k] = id));
  if (extra) slots[levels] = picked[0];
  return slots;
}
export function pickedFromSlots(slots: (string | null)[]): string[] {
  return slots.filter((x): x is string => !!x).reverse();
}
/** Первый пустой ярус, под которым уже что-то стоит (сборка с «дыркой» — в корзину нельзя) */
export function gapIn(slots: (string | null)[]): number {
  const last = slots.map((x) => !!x).lastIndexOf(true);
  return slots.findIndex((x, k) => !x && k < last);
}

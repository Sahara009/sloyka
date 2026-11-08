/**
 * Доставка: СДЭК (API v2) — точный расчёт по API; Ozon и WB — примерные вилки по зонам (src/lib/shipping.ts).
 * Ключи СДЭК: CDEK_ACCOUNT / CDEK_SECURE из личного кабинета (договор с СДЭК).
 * Для проверки без договора: CDEK_TEST=1 — тестовый контур api.edu.cdek.ru с публичными тестовыми ключами из документации СДЭК.
 * Решение 03.11: пункт выдачи выбирается списком по городу (без карты, ключ Яндекс Карт не нужен) — /v2/deliverypoints.
 * Доставка СДЭК входит в оплату заказа.
 * TODO: сверить коды тарифов с договором заказчика (136 — склад-склад/ПВЗ, 137 — склад-дверь/курьер).
 */
import { ORIGIN } from "@/data/shipping";
import type { Packing } from "@/lib/shipping";

export type DeliveryMethod = "cdek-pvz" | "cdek-courier" | "ozon-pvz" | "wb-pvz";

const CDEK_API = process.env.CDEK_TEST === "1" ? "https://api.edu.cdek.ru/v2" : "https://api.cdek.ru/v2";
export const CDEK_TARIFFS: Record<"cdek-pvz" | "cdek-courier", number> = { "cdek-pvz": 136, "cdek-courier": 137 };

export function cdekConfigured() {
  return Boolean(process.env.CDEK_ACCOUNT && process.env.CDEK_SECURE);
}

let cached: { token: string; until: number } | null = null;

export async function getCdekToken(): Promise<string> {
  if (cached && cached.until > Date.now()) return cached.token;
  const params = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: process.env.CDEK_ACCOUNT ?? "",
    client_secret: process.env.CDEK_SECURE ?? "",
  });
  const res = await fetch(`${CDEK_API}/oauth/token`, { method: "POST", body: params });
  if (!res.ok) throw new Error("СДЭК: не удалось получить токен");
  const json = await res.json();
  cached = { token: json.access_token as string, until: Date.now() + (Number(json.expires_in ?? 3600) - 60) * 1000 };
  return cached.token;
}

export type CdekQuote = { method: "cdek-pvz" | "cdek-courier"; price: number; days: [number, number]; tariff: number };

async function cdekGet<T>(path: string): Promise<T> {
  const token = await getCdekToken();
  const res = await fetch(`${CDEK_API}${path}`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`СДЭК: ${path.split("?")[0]} — ${res.status}`);
  return (await res.json()) as T;
}

export type CdekCity = { code: number; name: string };

/** Подсказки городов по началу названия (location/suggest/cities), запасной вариант — location/cities */
export async function cdekCities(q: string): Promise<CdekCity[]> {
  const name = q.trim();
  if (name.length < 2) return [];
  try {
    const list = await cdekGet<{ code: number; full_name: string }[]>(`/location/suggest/cities?name=${encodeURIComponent(name)}&country_code=RU`);
    if (list.length) return list.slice(0, 10).map((c) => ({ code: c.code, name: c.full_name.replace(/,\s*Россия$/, "") }));
  } catch {
    /* подсказки недоступны — ищем по точному названию */
  }
  const list = await cdekGet<{ code: number; city: string; region?: string; sub_region?: string }[]>(
    `/location/cities?city=${encodeURIComponent(name)}&country_codes=RU&size=10`,
  );
  return list.map((c) => ({ code: c.code, name: [c.city, c.sub_region, c.region].filter(Boolean).join(", ") }));
}

export type CdekPoint = { code: string; name: string; address: string; workTime?: string };

const pointsCache = new Map<number, { until: number; list: CdekPoint[] }>();

/** Пункты выдачи СДЭК в городе (deliverypoints, тип PVZ), кэш на 6 часов */
export async function cdekPoints(cityCode: number): Promise<CdekPoint[]> {
  const hit = pointsCache.get(cityCode);
  if (hit && hit.until > Date.now()) return hit.list;
  const raw = await cdekGet<{ code: string; name?: string; work_time?: string; location?: { address?: string; address_full?: string } }[]>(
    `/deliverypoints?city_code=${cityCode}&type=PVZ&country_code=RU`,
  );
  const list = raw
    .map((p) => ({ code: p.code, name: p.name ?? p.code, address: p.location?.address ?? p.location?.address_full ?? "", workTime: p.work_time }))
    .sort((a, b) => a.address.localeCompare(b.address, "ru"));
  pointsCache.set(cityCode, { until: Date.now() + 6 * 3600_000, list });
  return list;
}

/** Расчёт по всем тарифам сразу (calculator/tarifflist), берём ПВЗ и курьера. to — код города СДЭК или название */
export async function cdekQuote(to: number | string, packing: Packing): Promise<CdekQuote[]> {
  const token = await getCdekToken();
  const res = await fetch(`${CDEK_API}/calculator/tarifflist`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from_location: { code: ORIGIN.cdekCityCode },
      to_location: typeof to === "number" ? { code: to } : { address: to },
      packages: packing.boxes.map((b) => ({ weight: b.weight, length: b.box.length, width: b.box.width, height: b.box.height })),
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("СДЭК: расчёт недоступен");
  const json = (await res.json()) as { tariff_codes?: { tariff_code: number; delivery_sum: number; period_min: number; period_max: number }[] };
  const out: CdekQuote[] = [];
  for (const method of ["cdek-pvz", "cdek-courier"] as const) {
    const t = json.tariff_codes?.find((x) => x.tariff_code === CDEK_TARIFFS[method]);
    if (t) out.push({ method, price: Math.ceil(t.delivery_sum), days: [t.period_min, t.period_max], tariff: t.tariff_code });
  }
  return out;
}

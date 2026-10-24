/**
 * Доставка: СДЭК (API v2) — точный расчёт по API; Ozon и WB — примерные вилки по зонам (src/lib/shipping.ts).
 * Ключи СДЭК: CDEK_ACCOUNT / CDEK_SECURE из личного кабинета (договор с СДЭК).
 * Для проверки без договора: CDEK_TEST=1 — тестовый контур api.edu.cdek.ru с публичными тестовыми ключами из документации СДЭК.
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

/** Расчёт по всем тарифам сразу (calculator/tarifflist), берём ПВЗ и курьера */
export async function cdekQuote(city: string, packing: Packing): Promise<CdekQuote[]> {
  const token = await getCdekToken();
  const res = await fetch(`${CDEK_API}/calculator/tarifflist`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from_location: { code: ORIGIN.cdekCityCode },
      to_location: { address: city },
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

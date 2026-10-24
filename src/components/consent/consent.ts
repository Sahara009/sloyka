// Согласие на cookie. Хранится в cookie на 365 дней.
// "necessary" — только необходимые (корзина, сессия), "all" — плюс аналитика (Яндекс Метрика).

export type Consent = "necessary" | "all";
export const CONSENT_COOKIE = "sloyka_consent";
export const CONSENT_EVENT = "sloyka:consent";

export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  const v = m ? decodeURIComponent(m[1]) : null;
  return v === "all" || v === "necessary" ? v : null;
}

export function writeConsent(value: Consent) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}

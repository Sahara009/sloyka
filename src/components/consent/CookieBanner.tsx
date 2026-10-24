"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { readConsent, writeConsent, CONSENT_EVENT } from "./consent";

export function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(readConsent() === null);
    // Открыть баннер снова из подвала («Настройки cookie»)
    const reopen = () => setOpen(true);
    window.addEventListener("sloyka:cookie-settings", reopen);
    return () => window.removeEventListener("sloyka:cookie-settings", reopen);
  }, []);

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener(CONSENT_EVENT, close);
    return () => window.removeEventListener(CONSENT_EVENT, close);
  }, []);

  if (!open) return null;

  return (
    <div className="cookie" role="dialog" aria-live="polite" aria-label="Использование cookie">
      <p>
        Мы используем cookie, чтобы корзина работала, а сайт становился удобнее. Аналитические cookie включаются только с
        вашего согласия. <Link href="/legal/cookies">Подробнее</Link>
      </p>
      <div className="cookie__actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => writeConsent("necessary")}>
          Только необходимые
        </button>
        <button type="button" className="btn btn--sm" onClick={() => writeConsent("all")}>
          Принять все
        </button>
      </div>
    </div>
  );
}

/** Кнопка в подвале, чтобы изменить выбор */
export function CookieSettingsButton() {
  return (
    <button type="button" className="link-btn" onClick={() => window.dispatchEvent(new Event("sloyka:cookie-settings"))}>
      Настройки cookie
    </button>
  );
}

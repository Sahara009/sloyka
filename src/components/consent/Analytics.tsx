"use client";

import { useEffect } from "react";
import { readConsent, CONSENT_EVENT, type Consent } from "./consent";

/**
 * Яндекс Метрика подключается ТОЛЬКО после согласия «Принять все».
 * ID счётчика — в .env.local: NEXT_PUBLIC_YM_ID
 */
export function Analytics() {
  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_YM_ID;
    if (!id) return;

    const load = () => {
      if (document.getElementById("ym-script")) return;
      const s = document.createElement("script");
      s.id = "ym-script";
      s.async = true;
      s.innerHTML = `
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
        ym(${Number(id)}, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });
      `;
      document.head.appendChild(s);
    };

    if (readConsent() === "all") load();
    const onConsent = (e: Event) => {
      if ((e as CustomEvent<Consent>).detail === "all") load();
    };
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  return null;
}

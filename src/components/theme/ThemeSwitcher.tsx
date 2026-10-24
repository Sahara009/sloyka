"use client";

import { useEffect, useState } from "react";
import { DEFAULT_THEME, THEME_STORAGE_KEY, THEME_SWITCHER, themes, type ThemeId } from "@/data/themes";

/**
 * Временный переключатель оформления — чтобы заказчик сравнил два варианта на живом сайте.
 * Выключается в data/themes.ts (THEME_SWITCHER = false).
 */
export function ThemeSwitcher() {
  const [theme, setTheme] = useState<ThemeId>(DEFAULT_THEME);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-style") as ThemeId | null;
    setTheme(current ?? "soft");
  }, []);

  if (!THEME_SWITCHER) return null;

  const apply = (id: ThemeId) => {
    const root = document.documentElement;
    root.classList.add("theme-switching");
    if (id === "soft") root.removeAttribute("data-style");
    else root.setAttribute("data-style", id);
    window.setTimeout(() => root.classList.remove("theme-switching"), 500);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      /* без сохранения — тема продержится до перезагрузки */
    }
    setTheme(id);
  };

  const active = themes.find((t) => t.id === theme) ?? themes[0];

  return (
    <div className={`theme-switch ${open ? "is-open" : ""}`}>
      {open && (
        <div className="theme-switch__panel" role="radiogroup" aria-label="Вариант оформления">
          <p className="theme-switch__title">Вариант оформления</p>
          {themes.map((t, i) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={t.id === theme}
              className={`theme-switch__opt ${t.id === theme ? "is-active" : ""}`}
              onClick={() => apply(t.id)}
            >
              <span className="theme-switch__dots" aria-hidden>
                {t.colors.map((c) => (
                  <i key={c} style={{ background: c }} />
                ))}
              </span>
              <span>
                <b>
                  {i + 1}. {t.name}
                </b>
                <small>{t.note}</small>
              </span>
            </button>
          ))}
          <p className="theme-switch__hint">Временная панель для выбора варианта</p>
        </div>
      )}
      <button
        type="button"
        className="theme-switch__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Выбрать вариант оформления"
      >
        <span className="theme-switch__dots" aria-hidden>
          {active.colors.map((c) => (
            <i key={c} style={{ background: c }} />
          ))}
        </span>
        <span>Стиль: {active.name}</span>
      </button>
    </div>
  );
}

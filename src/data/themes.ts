/*
 * Два варианта оформления, пока заказчик выбирает (переключатель внизу слева):
 *   soft    — мягкий, как сейчас: тонкие обводки, тени;
 *   outline — с обводкой граней: толстый шоколадный контур у карточек, кнопок, фото и плотная «тень-подложка».
 * Когда выбор сделан: поставьте DEFAULT_THEME и THEME_SWITCHER = false.
 * Стили варианта «outline» — в src/styles/outline.css.
 */

export type ThemeId = "soft" | "outline";

export const themes: { id: ThemeId; name: string; note: string; colors: [string, string, string] }[] = [
  { id: "soft", name: "Мягкий", note: "тонкие линии и лёгкие тени", colors: ["#fbf6ec", "#b5cfe2", "#c98a4b"] },
  { id: "outline", name: "С обводкой", note: "контур у карточек, кнопок и фото", colors: ["#fbf6ec", "#b5cfe2", "#4a2e22"] },
];

export const DEFAULT_THEME: ThemeId = "soft";
export const THEME_SWITCHER = false; // заказчик выбрал «Мягкий»; поставьте true, чтобы вернуть переключатель
export const THEME_STORAGE_KEY = "sloyka_style";

/**
 * Инлайн-скрипт в <head>: ставит вариант до первой отрисовки.
 * Порядок: ?style=outline в адресе → сохранённый в браузере → DEFAULT_THEME.
 */
export const themeBootScript = `(function(){var d=document.documentElement,ids=${JSON.stringify(
  themes.map((t) => t.id),
)},t=${JSON.stringify(DEFAULT_THEME)};${
  THEME_SWITCHER
    ? `try{var q=new URLSearchParams(location.search).get('style');var s=localStorage.getItem('${THEME_STORAGE_KEY}');if(q&&ids.indexOf(q)>-1){t=q;localStorage.setItem('${THEME_STORAGE_KEY}',q)}else if(s&&ids.indexOf(s)>-1){t=s}}catch(e){}`
    : ""
}if(t!=='soft')d.setAttribute('data-style',t)})();`;

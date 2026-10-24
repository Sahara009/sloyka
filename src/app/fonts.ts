import { Manrope, Nunito, Rubik_Wet_Paint } from "next/font/google";

/**
 * Шрифты сайта. Клиент ещё выбирает пару — менять здесь, в одном месте.
 * Заголовки — Nunito: округлый и плотный, перекликается с буквами логотипа.
 * Раньше стоял Cormorant Garamond — слишком тонкий и «воздушный».
 */
export const heading = Nunito({
  subsets: ["latin", "cyrillic"],
  weight: ["700", "800", "900"],
  variable: "--font-heading",
  display: "swap",
});

export const body = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  display: "swap",
});

/** «Ужасно симпатичный» шрифт с подтёками — только для хэллоуинской секции */
export const spooky = Rubik_Wet_Paint({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  variable: "--font-spooky",
  display: "swap",
});

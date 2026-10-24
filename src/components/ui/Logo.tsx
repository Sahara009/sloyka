import Link from "next/link";
import { AnimatedLogo } from "./AnimatedLogo";

/** Логотип в шапке: оригинальный знак Sloyka, насадка «печатает» слои буквы y при загрузке и при наведении */
export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Sloyka — на главную">
      <AnimatedLogo className="logo__svg" title="Sloyka" />
    </Link>
  );
}

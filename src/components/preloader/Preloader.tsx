import { AnimatedLogo } from "@/components/ui/AnimatedLogo";
import { DRIP_WIDTH, dripPath } from "./drip";
import { PreloaderController } from "./PreloaderController";

/*
 * Прелоадер «глазурь»: сверху стекают три слоя — голубой, карамельный и шоколадный,
 * как глазурь по торту. Когда страница загрузилась, слои стекают вниз и открывают сайт.
 * Показывается один раз за визит (sessionStorage), при prefers-reduced-motion — просто плавно исчезает.
 * Разметка рендерится на сервере, чтобы закрыть страницу ещё до загрузки JS.
 */

const layers = [
  { color: "var(--blue-200)", seed: 11, depth: 150 },
  { color: "var(--caramel-200)", seed: 23, depth: 120 },
  { color: "var(--choc)", seed: 37, depth: 170 },
];

export function Preloader() {
  return (
    <div id="preloader" className="preloader" aria-hidden="true">
      {layers.map((l, i) => (
        <div key={i} className="preloader__layer" style={{ ["--i" as string]: i, background: l.color }}>
          <svg className="preloader__drip" viewBox={`0 0 ${DRIP_WIDTH} 220`} preserveAspectRatio="none" focusable="false">
            <path d={dripPath(l.seed, l.depth)} fill={l.color} />
          </svg>
        </div>
      ))}
      <div className="preloader__logo">
        <AnimatedLogo className="preloader__mark" tone="light" autoplay="now" delay={950} speed={0.62} replayOnHover={false} />
      </div>
      <PreloaderController />
    </div>
  );
}

/** Инлайн-скрипт в <head>: решает до отрисовки, показывать ли прелоадер */
export const preloaderBootScript = `(function(){var d=document.documentElement;d.classList.add('js');if(location.pathname.indexOf('/admin')===0){d.classList.add('no-preload');return}try{if(sessionStorage.getItem('sloyka_preloaded')){d.classList.add('no-preload');return}}catch(e){}d.classList.add('is-preloading')})();`;

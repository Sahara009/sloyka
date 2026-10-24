import Link from "next/link";
import { Drip } from "@/components/ui/Drip";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { Countdown } from "./Countdown";

/* Милые хэллоуинские значки — свои SVG, чтобы не тащить картинки */
const Ghost = () => (
  <svg viewBox="0 0 64 72" aria-hidden="true">
    <path d="M32 3C17 3 8 15 8 30v34l7-6 6 6 6-6 5 6 5-6 6 6 6-6 7 6V30C56 15 47 3 32 3Z" fill="#FBF6EC" />
    <ellipse cx="24" cy="30" rx="3.6" ry="5" fill="#3B2418" />
    <ellipse cx="40" cy="30" rx="3.6" ry="5" fill="#3B2418" />
    <ellipse cx="32" cy="41" rx="4" ry="3" fill="#3B2418" />
    <circle cx="18" cy="38" r="3.5" fill="#F2B8B5" opacity=".8" />
    <circle cx="46" cy="38" r="3.5" fill="#F2B8B5" opacity=".8" />
  </svg>
);
const Bat = () => (
  <svg viewBox="0 0 90 44" aria-hidden="true">
    <path
      d="M45 12c-4 0-6 3-6 3l-2-6-3 7C26 8 14 6 2 12c8 2 12 8 12 14 5-4 11-4 15 1 3-5 9-6 16 2 7-8 13-7 16-2 4-5 10-5 15-1 0-6 4-12 12-14-12-6-24-4-32 4l-3-7-2 6s-2-3-6-3Z"
      fill="#140C08"
    />
    <circle cx="41" cy="19" r="1.8" fill="#F4A259" />
    <circle cx="49" cy="19" r="1.8" fill="#F4A259" />
  </svg>
);
const Pumpkin = () => (
  <svg viewBox="0 0 70 64" aria-hidden="true">
    <path d="M35 14c1-6 6-10 12-10" stroke="#7C9A5E" strokeWidth="4" fill="none" strokeLinecap="round" />
    <ellipse cx="22" cy="38" rx="17" ry="22" fill="#E8792F" />
    <ellipse cx="48" cy="38" rx="17" ry="22" fill="#E8792F" />
    <ellipse cx="35" cy="38" rx="15" ry="24" fill="#F08A3C" />
    <path d="M24 34l5-6 4 6Zm13 0l4-6 5 6Z" fill="#3B2418" />
    <path d="M23 44c6 6 18 6 24 0-3 7-21 7-24 0Z" fill="#3B2418" />
  </svg>
);

/** Эксклюзивная секция к Хэллоуину: топперы, «ужасно симпатично», обратный отсчёт до 31 октября */
export function Halloween() {
  return (
    <section className="hw" aria-labelledby="hw-title">
      <div className="scallop-top" style={{ ["--scallop-color" as string]: "var(--hw-bg)" }} />
      <div className="hw__body">
        <div className="hw__float" aria-hidden="true">
          <span className="hw__ghost hw__ghost--1"><Ghost /></span>
          <span className="hw__ghost hw__ghost--2"><Ghost /></span>
          <span className="hw__bat hw__bat--1"><Bat /></span>
          <span className="hw__bat hw__bat--2"><Bat /></span>
          <span className="hw__bat hw__bat--3"><Bat /></span>
          <span className="hw__pumpkin"><Pumpkin /></span>
        </div>
        {/* паутинка в углу */}
        <svg className="hw__web" viewBox="0 0 200 200" aria-hidden="true">
          <g fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M0 0L200 200M0 0L200 90M0 0L90 200M0 0L200 20M0 0L20 200" />
            <path d="M40 8Q30 30 8 40M80 18Q60 60 18 80M125 30Q90 90 30 125M170 42Q120 120 42 170" />
          </g>
        </svg>

        <div className="container hw__grid">
          <div className="hw__text">
            <Reveal effect="fade">
              <p className="hw__eyebrow">Лимитированная коллекция · Хэллоуин</p>
            </Reveal>
            <Reveal delay={100}>
              <h2 id="hw-title" className="hw__title">
                Ужасно <span>симпатично!</span>
              </h2>
            </Reveal>
            <Reveal delay={180}>
              <p className="hw__lead">
                13 топперов для тортов, бенто и капкейков: призраки, летучие мыши, тыквы и ведьмы. Берите ассорти или набор
                одинаковых фигурок под большую партию.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="hw__offer">
                <span className="hw__price">
                  499 ₽ <small>за сет из 13 шт</small>
                </span>
                <Countdown />
              </div>
            </Reveal>
            <Reveal delay={300}>
              <div className="row-gap">
                <Link href="/catalog/halloween-toppers" className="btn hw__btn">
                  Хочу этот сет
                </Link>
                <Link href="/catalog?line=toppers" className="btn btn--ghost hw__btn-ghost">
                  Все топперы
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="hw__photos">
            {[
              { src: "/photos/toppers-ghosts.webp", alt: "Топперы-призраки", label: "бу!" },
              { src: "/photos/toppers-witch.webp", alt: "Тыквы и ведьмы", label: "тыквы и ведьмы" },
              { src: "/photos/toppers-bats.webp", alt: "Летучие мыши", label: "летучие мыши" },
            ].map((p, i) => (
              <Reveal key={p.src} effect="scale" delay={150 + i * 140} className={`hw__card hw__card--${i}`}>
                <Photo src={p.src} alt={p.alt} className="cover" />
                <span>{p.label}</span>
              </Reveal>
            ))}
            <span className="hw__stamp" aria-hidden="true">
              материалов
              <br />
              мало!
            </span>
          </div>
        </div>
      </div>
      <Drip color="var(--hw-bg)" seed={44} depth={70} />
    </section>
  );
}

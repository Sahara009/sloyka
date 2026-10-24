import Link from "next/link";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Drip } from "@/components/ui/Drip";
import { ArrowIcon } from "@/components/ui/Icons";
import { Photo } from "@/components/ui/Photo";
import { Carousel } from "@/components/ui/Carousel";
import { Reveal } from "@/components/ui/Reveal";
import { Cases } from "@/components/ui/Cases";
import { Halloween } from "@/components/halloween/Halloween";
import { Faq } from "@/components/ui/Faq";
import { LogoStrip } from "@/components/ui/LogoStrip";
import { PaletteStripes } from "@/components/ui/PaletteStripes";
import { Shape, type ShapeName } from "@/components/ui/Shape";
import { WavyTicker } from "@/components/ui/WavyTicker";
import { lineNotes, lineTitles, type Line } from "@/data/products";
import { getProducts } from "@/lib/server/catalog";
import { site } from "@/lib/format";

/* Линейки на главной: фото, фигура и фон-узор у каждой свои */
const lines: { id: Line; text: string; image: string; shape: ShapeName; outline: string; bg: string; pattern: string }[] = [
  {
    id: "home",
    text: "Подиумы Bonbon, Fleur, Cappottina и пять ножек — собираются как конструктор.",
    image: "/products/set-cappottina-pumpkin-muff.webp",
    shape: "scallop",
    outline: "var(--blue-400)",
    bg: "var(--milk)",
    pattern: "bg-gingham",
  },
  {
    id: "classic",
    text: "Muffin и Marble от 10 до 30 см. Можно с вашим логотипом.",
    image: "/products/classic-muffin.webp",
    shape: "clover",
    outline: "var(--caramel)",
    bg: "var(--milk)",
    pattern: "bg-stripes-caramel",
  },
  {
    id: "design",
    text: "Modular, Milano, Rossi, Penny и Podium I — столики 2 в 1 и подиумы.",
    image: "/products/design-milano.webp",
    shape: "arch",
    outline: "var(--blue-400)",
    bg: "var(--milk)",
    pattern: "bg-stripes-blue",
  },
  {
    id: "market",
    text: "Стенды из базы, подиумов и короны с вашей вывеской — для маркетов и витрин.",
    image: "/products/stand-babylon-crown.webp",
    shape: "arch-scallop",
    outline: "var(--sage-400)",
    bg: "var(--milk)",
    pattern: "bg-stripes-sage",
  },
  {
    id: "art",
    text: "Ночник и органайзеры-вафли с подтёками глазури.",
    image: "/products/waffle-nightlight-raspberry.webp",
    shape: "cloud",
    outline: "var(--bordeaux-300)",
    bg: "var(--milk)",
    pattern: "bg-gingham-sage",
  },
  {
    id: "toppers",
    text: "Сезонные сеты топперов для тортов, бенто и капкейков. Сейчас — Хэллоуин.",
    image: "/photos/toppers-ghosts.webp",
    shape: "arch",
    outline: "var(--choc-500)",
    bg: "var(--milk)",
    pattern: "bg-gingham",
  },
  {
    id: "decor",
    text: "Вывески, тейблтенты и логотипы на подставке для кофеен и кондитерских.",
    image: "/products/decor-crown.webp",
    shape: "stamp",
    outline: "var(--choc-500)",
    bg: "var(--milk)",
    pattern: "bg-stripes-choc",
  },
];

const gallery = [
  { src: "/photos/fleur-trio.webp", alt: "Подиумы Fleur в трёх цветах" },
  { src: "/photos/cake-2000.webp", alt: "Торт на подставке Sloyka" },
  { src: "/photos/boxes-houses.webp", alt: "Шкатулки-домики" },
  { src: "/photos/milano-rossi.webp", alt: "Столики Milano и Rossi" },
  { src: "/photos/classic-colors.webp", alt: "Подставки разных цветов" },
  { src: "/photos/bonbon-bento-box.webp", alt: "Бенто-торт на подставке Bonbon" },
  { src: "/photos/toppers-witch.webp", alt: "Топперы на Хэллоуин" },
  { src: "/photos/waffle-numbers.webp", alt: "Органайзер Waffle's с цифрами-топперами" },
  { src: "/photos/macarons-drip.webp", alt: "Подставка с подтёками глазури и макарон" },
]


export const revalidate = 60;

export default async function HomePage() {
  const hits = (await getProducts()).filter((p) => p.hit);
  return (
    <>
      {/* Первый экран */}
      <section className="hero">
        <div className="hero__frame">
          <div className="hero__text bg-stripes-blue">
            <Reveal effect="fade">
              <p className="eyebrow">Тот самый бренд из Петербурга</p>
            </Reveal>
            <Reveal delay={80}>
              <h1>
                Столики, которые <span className="script">собираются</span> как конструктор
              </h1>
            </Reveal>
            <Reveal delay={180}>
              <p className="hero__lead hero__note">
                Кастомные подиумы и стойки для кондитеров, кофеен и брендов. Соберём сет в оттенках вашего бренда — из 25
                цветов пластика.
              </p>
            </Reveal>
            <Reveal delay={260}>
              <div className="row-gap">
                <Link href="/constructor" className="btn">
                  Собрать свой столик
                </Link>
                <Link href="/catalog" className="btn btn--ghost">
                  Каталог
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="hero__art">
            <Reveal effect="drip">
              <Shape shape="arch" outline="var(--blue-400)" bg="var(--blue-100)" ratio="4 / 5">
                <Photo src="/photos/macarons-drip.webp" alt="Макаронс на подставке Sloyka" eager className="cover hero__scene" />
              </Shape>
            </Reveal>
            <Reveal effect="scale" delay={350} className="hero__badge">
              <Shape shape="quatrefoil" outline="var(--caramel)" bg="var(--cream)">
                <Photo src="/photos/milano-rossi.webp" alt="Столики Milano и Rossi" eager className="cover" />
              </Shape>
            </Reveal>
            <Reveal effect="scale" delay={500} className="hero__badge2">
              <Shape shape="clover" outline="var(--bordeaux-300)" bg="var(--blush-100)">
                <Photo src="/photos/fleur-trio.webp" alt="Три столика Fleur" eager className="cover" />
              </Shape>
            </Reveal>
          </div>
        </div>
      </section>

      <WavyTicker />

      {/* О бренде — сразу после первого экрана, на голубой клетке */}
      <section className="about-teaser bg-gingham">
        <div className="container about-teaser__grid">
          <Reveal effect="left" className="about-teaser__card">
            <p className="eyebrow">История бренда</p>
            <h2>
              Знакомьтесь, <span className="script">Sloyka</span>
            </h2>
            <p>
              {/* TODO: короткий текст от заказчика */}
              Печатаем на 3D-принтере подставки, столики и декор — лёгкие, прочные и в 25 цветах. Это база для продающего
              визуала ваших тортов, витрин и маркетов: детали пересобираются под каждый праздник и настроение.
            </p>
            <ul className="about-teaser__facts">
              <li>
                <b>25</b> цветов пластика
              </li>
              <li>
                <b>7</b> линеек изделий
              </li>
              <li>
                <b>от 1</b> экземпляра под заказ
              </li>
            </ul>
            <Link href="/about" className="btn btn--ghost">
              Узнать больше
            </Link>
          </Reveal>
          <Reveal effect="drip">
            <Shape shape="arch" outline="var(--blue-400)" bg="var(--milk)" ratio="4 / 5">
              <Photo src="/photos/dei-dolci-white.webp" alt="Cappottina на ножке Grande" className="cover" />
            </Shape>
          </Reveal>
        </div>
      </section>

      {/* Хиты */}
      <section className="section">
        <div className="container">
          <Reveal className="section-head">
            <h2>
              <span className="script">Любимые</span> сборки
            </h2>
            <Link href="/catalog" className="more">
              Весь каталог <ArrowIcon />
            </Link>
          </Reveal>
          <Reveal>
            <Carousel label="Любимые сборки">
              {hits.slice(0, 12).map((p, i) => (
                <ProductCard key={p.slug} product={p} index={i} />
              ))}
            </Carousel>
          </Reveal>
        </div>
      </section>

      {/* Сезонная секция — убрать после 1 ноября (или заменить на новогоднюю) */}
      <Halloween />

      {/* Линейки */}
      <section className="section--tight">
        <div className="container">
          <Reveal>
            <h2 className="center">
              Наши <span className="script">линейки</span>
            </h2>
          </Reveal>
          <div className="lines">
            {lines.map((l, i) => (
              <Reveal key={l.id} effect={i % 2 ? "right" : "left"} delay={(i % 2) * 120}>
                <Link href={`/catalog?line=${l.id}`} className={`line-card ${l.pattern}`}>
                  <div className="line-card__text">
                    <p className="eyebrow">{lineNotes[l.id]}</p>
                    <h3>{lineTitles[l.id]}</h3>
                    <p>{l.text}</p>
                    <span className="more">
                      Смотреть <ArrowIcon />
                    </span>
                  </div>
                  <Shape shape={l.shape} outline={l.outline} bg={l.bg} className="line-card__art">
                    <Photo src={l.image} alt={lineTitles[l.id]} className={l.image.startsWith("/photos/") ? "cover" : undefined} />
                  </Shape>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Как работает конструктор */}
      <section className="how">
        <div className="scallop-top" style={{ ["--scallop-color" as string]: "var(--blue-200)" }} />
        <div className="how__body">
          <div className="container">
            <Reveal>
              <h2 className="center">
                Один столик — <span className="script">десятки</span> сборок
              </h2>
            </Reveal>
            <div className="how__steps">
              {[
                { src: "/products/podium-fleur.webp", t: "1. Столешница", d: "Bonbon, Fleur или Cappottina" },
                { src: "/products/leg-muff.webp", t: "2. Ножка", d: "от 8 до 14 см, можно в два яруса" },
                { src: "/products/insert-flower.webp", t: "3. Допы", d: "вкладыши и подиум Attico" },
              ].map((s, i) => (
                <Reveal key={s.t} effect="scale" delay={i * 160} className="how__step-wrap">
                  {i > 0 && <span className="how__plus">+</span>}
                  <div className="how__step">
                    <Shape shape="clover" bg="var(--milk)">
                      <Photo src={s.src} alt="" />
                    </Shape>
                    <p>
                      <b>{s.t}</b>
                      <br />
                      {s.d}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal className="center">
              <Link href="/constructor" className="btn">
                Открыть конструктор
              </Link>
            </Reveal>
          </div>
        </div>
        <div className="scallop-bottom" style={{ ["--scallop-color" as string]: "var(--blue-200)" }} />
      </section>

      {/* Интерьерный кадр */}
      <section className="section">
        <div className="container">
          <Reveal effect="drip" className="scene">
            <Photo src="/photos/scene-table.webp" alt="Десертные столики Sloyka Home на деревянном столе" className="scene__img" />
            <div className="scene__card">
              <p className="eyebrow">Sloyka Home</p>
              <p className="scene__title">
                Сегодня — одна сборка. <span className="script">Завтра</span> — другая.
              </p>
              <Link href="/catalog?line=home" className="more">
                Готовые сборки <ArrowIcon />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Waffle's — секция с подтёками глазури */}
      <section className="waffles">
        <div className="scallop-top" style={{ ["--scallop-color" as string]: "var(--blush-100)" }} />
        <div className="waffles__body">
          <div className="container waffles__grid">
            <div>
              <Reveal>
                <p className="eyebrow">Art Decor</p>
                <h2>
                  Коллекция <span className="script">Waffle&apos;s</span>
                </h2>
              </Reveal>
              <Reveal delay={120}>
                <p>
                  Ночник и органайзеры в форме вафли с подтёками глазури: малиновый йогурт, сливочное масло, фисташка,
                  клубнично-ягодный и сахарная глазурь.
                </p>
              </Reveal>
              <Reveal delay={200}>
                <Link href="/catalog?line=art" className="btn">
                  Смотреть коллекцию
                </Link>
              </Reveal>
            </div>
            <div className="waffles__items">
              {[
                { src: "/products/waffle-nightlight-raspberry.webp", n: "Night Light", p: "2 490 ₽", slug: "waffle-night-light" },
                { src: "/products/waffle-tall-pistachio.webp", n: "Tall", p: "550 ₽", slug: "waffle-tall" },
                { src: "/products/waffle-square-strawberry.webp", n: "Square", p: "600 ₽", slug: "waffle-square" },
                { src: "/products/waffle-round-raspberry.webp", n: "Round", p: "490 ₽", slug: "waffle-round" },
              ].map((w, i) => (
                <Reveal key={w.slug} effect="up" delay={i * 110}>
                  <Link href={`/catalog/${w.slug}`} className="waffle">
                    <Photo src={w.src} alt={`Waffle ${w.n}`} className={i % 2 ? "float float--slow" : "float"} />
                    <span>
                      {w.n} <b>{w.p}</b>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
        <Drip color="var(--blush-100)" seed={19} depth={80} />
      </section>

      {/* Палитра — полосками */}
      <section className="section palette-section">
        <div className="container">
          <Reveal className="palette-head">
            <h2>
              25 цветов <span className="script">пластика</span>
            </h2>
            <p className="muted">
              Каждую деталь можно выбрать в любом цвете палитры: Milk, Pastel, Pop, Sweet и Deep. Ножку и столешницу —
              разными цветами.
            </p>
          </Reveal>
          <PaletteStripes />
        </div>
      </section>

      {/* Галерея из инстаграма */}
      <section className="section--tight">
        <div className="container">
          <Reveal className="section-head">
            <h2>
              Сборки <span className="script">в жизни</span>
            </h2>
            <a href={site.instagram} className="more" target="_blank" rel="noreferrer">
              @sloyka.home <ArrowIcon />
            </a>
          </Reveal>
          <div className="gallery">
            {gallery.map((g, i) => (
              <Reveal key={g.src} effect="scale" delay={(i % 3) * 100}>
                <figure className={`snap snap--${i % 3}`}>
                  <span className="snap__tape" aria-hidden="true" />
                  <span className="snap__frame">
                    <Photo src={g.src} alt={g.alt} className="cover" />
                  </span>
                  <figcaption>{g.alt}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <WavyTicker tone="blue" items={["ваш логотип на подставке", "от 300 ₽", "до 4 цветов", "для кондитеров и кофеен"]} speed={45} />

      <LogoStrip />

      <Cases limit={3} />

      <Faq />

      {/* Для бизнеса */}
      <section className="section--tight">
        <div className="container">
          <Reveal effect="drip" className="biz-banner">
            <div>
              <h2>
                Для кофеен <span className="script">и маркетов</span>
              </h2>
              <p>Стенды, вывески с логотипом, тейблтенты и корона-маркиза. Соберём сет в оттенках вашего бренда.</p>
            </div>
            <Link href="/business" className="btn btn--milk">
              Для бизнеса
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}

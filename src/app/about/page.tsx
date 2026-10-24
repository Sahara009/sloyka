import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { Shape } from "@/components/ui/Shape";
import { Ticker } from "@/components/ui/Ticker";

export const metadata: Metadata = { title: "История бренда", description: "Как появилась Sloyka и почему наши столики собираются как конструктор." };

// TODO: тексты истории бренда пришлёт заказчик — ниже заглушки той же длины
export default function AboutPage() {
  return (
    <>
      <section className="container page">
        <div className="about-hero">
          <Reveal effect="left">
            <p className="eyebrow">История бренда</p>
            <h1>
              <span className="script">Как появилась</span> Sloyka
            </h1>
            <p className="lead">
              Здесь будет история бренда: с чего всё началось, кто стоит за Sloyka и почему мы решили делать подставки,
              которые собираются как конструктор.
            </p>
          </Reveal>
          <Reveal effect="drip">
            <Shape shape="arch" outline="var(--caramel)" bg="var(--cream)" ratio="4 / 5">
              <Photo src="/photos/fleur-trio.webp" alt="Подиумы Fleur" eager className="cover" />
            </Shape>
          </Reveal>
        </div>
      </section>

      <Ticker items={["сегодня одна сборка", "завтра другая", "детали меняются", "25 цветов"]} tone="blue" />

      <section className="section">
        <div className="container facts">
          <Reveal className="fact">
            <Shape shape="scallop" bg="var(--blue-100)">
              <Photo src="/products/set-fleur-muff.webp" alt="" />
            </Shape>
            <h3>Sloyka Home</h3>
            <p className="muted">Десертные столики для дома, праздников и фотосессий.</p>
          </Reveal>
          <Reveal className="fact" delay={120}>
            <Shape shape="clover" bg="var(--sage-100)">
              <Photo src="/products/stand-paris.webp" alt="" />
            </Shape>
            <h3>Sloyka Market</h3>
            <p className="muted">Стенды для маркетов, кофеен и мастеров — с вашим логотипом.</p>
          </Reveal>
          <Reveal className="fact" delay={240}>
            <Shape shape="quatrefoil" bg="var(--blush-100)">
              <Photo src="/products/waffle-nightlight-raspberry.webp" alt="" />
            </Shape>
            <h3>Art Decor</h3>
            <p className="muted">Ночники и органайзеры-вафли — сладкий декор для дома и рабочего стола.</p>
          </Reveal>
        </div>
      </section>

      <section className="section--tight">
        <div className="container about-photos">
          {[
            { src: "/photos/cake-2000.webp", alt: "Торт на подставке Sloyka", shape: "arch" as const },
            { src: "/photos/boxes-houses.webp", alt: "Шкатулки-домики", shape: "rounded" as const },
            { src: "/photos/stands-closeup.webp", alt: "Подставки Sloyka в разных цветах", shape: "arch" as const },
          ].map((p, i) => (
            <Reveal key={p.src} effect="drip" delay={i * 140}>
              <Shape shape={p.shape} ratio="3 / 4" bg="var(--cream)">
                <Photo src={p.src} alt={p.alt} className="cover" />
              </Shape>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="about-quote bg-gingham">
        <div className="container">
          <Reveal effect="fade">
            <blockquote>
              «Место для цитаты основателя бренда — пара тёплых предложений о том, ради чего всё это.»
            </blockquote>
          </Reveal>
          <Link href="/catalog" className="btn">
            Перейти в каталог
          </Link>
        </div>
      </section>
    </>
  );
}

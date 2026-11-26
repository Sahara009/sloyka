import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { Shape } from "@/components/ui/Shape";
import { Ticker } from "@/components/ui/Ticker";

export const metadata: Metadata = { title: "История бренда", description: "Sloyka — семейный бренд из Санкт-Петербурга: авторские подставки, подиумы, фотореквизит и предметы декора из пластика.", alternates: { canonical: "/about" } };

// Тексты — заказчик, 26.11
export default function AboutPage() {
  return (
    <>
      <section className="container page">
        <div className="about-hero">
          <Reveal effect="left">
            <p className="eyebrow">История бренда</p>
            <h1>
              <span className="script">Привет,</span> мы Sloyka!
            </h1>
            <p className="lead">
              Семейный бренд из Санкт-Петербурга, который начался с любви к эстетике и желания создавать красивые и
              функциональные вещи.
            </p>
            <p className="lead">
              Сегодня мы разрабатываем и производим авторские подставки, подиумы, фотореквизит и предметы декора из пластика.
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
            <h3>Sloyka Podium</h3>
            <p className="muted">Столики для тортов и модульные десертные столики для дома, праздников и фотосессий.</p>
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
              <Photo src="/products/waffle-tall-raspberry.webp" alt="" />
            </Shape>
            <h3>Art Decor</h3>
            <p className="muted">Органайзеры-вафли и шкатулки — сладкий декор для дома и рабочего стола.</p>
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
              «Для нас Sloyka — это не просто подставки и декор, а возможность создавать пространство, в котором каждый продукт
              выглядит по-особенному.»
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

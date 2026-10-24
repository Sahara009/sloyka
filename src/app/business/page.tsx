import type { Metadata } from "next";
import Link from "next/link";
import { ProductVisual } from "@/components/art/ProductArt";
import { Photo } from "@/components/ui/Photo";
import { Reveal } from "@/components/ui/Reveal";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Cases } from "@/components/ui/Cases";
import { LogoStrip } from "@/components/ui/LogoStrip";
import { RequestForm } from "@/components/ui/RequestForm";
import { Shape } from "@/components/ui/Shape";
import { getProducts } from "@/lib/server/catalog";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Для бизнеса",
  description: "Стенды для маркетов, вывески, тейблтенты и логотипы для кофеен и кондитерских.",
};

export const revalidate = 60;

export default async function BusinessPage() {
  const products = await getProducts();
  const decor = products.filter((p) => p.line === "decor");
  const stands = products.filter((p) => p.line === "market" && p.kind === "set");

  return (
    <>
      <section className="page-hero bg-stripes-sage">
        <div className="container page-hero__grid">
          <div className="page-hero__card">
            <p className="eyebrow">Sloyka Market</p>
            <h1>
              Для кофеен, кондитерских <span className="script">и маркетов</span>
            </h1>
            <p>Соберите стенд под свою витрину, добавьте вывеску с логотипом и тейблтенты с меню и QR-кодом.</p>
            <div className="row-gap">
              <Link href="/constructor?line=market" className="btn">
                Собрать стенд
              </Link>
              <a href="#request" className="btn btn--ghost">
                Индивидуальный заказ
              </a>
            </div>
          </div>
          <Shape shape="arch" outline="var(--sage-400)" bg="var(--milk)" ratio="4 / 5">
            <Photo src="/photos/logo-elena.webp" alt="Подиумы с логотипом Elena Bakery" eager className="cover" />
          </Shape>
        </div>
      </section>

      {/* Тексты из сторис «Для бизнеса» */}
      <section className="section">
        <div className="container b2b">
          <Reveal effect="left" className="b2b__paper">
            <h2>Что мы можем сделать для вашего бизнеса</h2>
            <ul className="b2b__list">
              <li>
                <b>Уникальный реквизит для декораторов</b>
                Лёгкие, прочные, эстетичные 3D-базы, колонны, подставки и столики, которые удобно возить на монтажи и которые
                идеально смотрятся в кадре.
              </li>
              <li>
                <b>Для ресторанов и кафе</b>
                Кастомные подставки под десерты, бенто-торты, макарон, брендированные элементы сервировки в концепции вашего
                заведения.
              </li>
              <li>
                <b>Оформление фотозон</b>
                Любые сложные геометрические и плавные формы под заказ по вашим размерам.
              </li>
              <li>
                <b>Разработка с нуля</b>
                От вашей безумной идеи или референса до готового изделия. Любые палитры — от сочных трендовых до глубоких
                матовых текстур.
              </li>
            </ul>
          </Reveal>
          <Reveal effect="right" className="b2b__why">
            <h2>Почему 3D-печать от Sloyka — это выгодно</h2>
            <ul>
              <li>Сжатые сроки по сравнению с деревом или металлом.</li>
              <li>Идеальная геометрия и высокая прочность при небольшом весе.</li>
              <li>Можно изготовить эксклюзив — 1 или 100 экземпляров, не важно.</li>
            </ul>
            <div className="b2b__cta">
              <p>
                <b>Как обсудить проект?</b> Оставьте заявку с пометкой «B2B» — рассчитаем стоимость вашей задумки и
                разделим подготовку к осеннему и новогоднему сезону.
              </p>
              <a href="#request" className="btn">
                Получить предложение
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>
            Декор <span className="script">с вашим</span> логотипом
          </h2>
          <div className="decor-grid">
            {decor.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
              <Link href={`/catalog/${p.slug}`} className="decor-card">
                <div className="decor-card__art">
                  <ProductVisual product={p} />
                </div>
                <div>
                  <h3>{p.name}</h3>
                  <p className="muted small">{p.short}</p>
                  <strong>{p.price === null ? "Цена по запросу" : `от ${formatPrice(p.price)}`}</strong>
                </div>
              </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section--tight">
        <div className="container">
          <div className="section-head">
            <h2>
              Готовые <span className="script">стенды</span>
            </h2>
            <Link href="/catalog?line=market" className="more">
              Все базы и подиумы →
            </Link>
          </div>
          <div className="grid-products">
            {stands.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 80}>
                <ProductCard product={p} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section--tight">
        <div className="container steps-row">
          {[
            ["Заявка", "Расскажите, что нужно: размеры, цвета, логотип"],
            ["Макет", "Согласуем форму и цвета (до 4 цветов на изделие)"],
            ["Изготовление", "Сроки зависят от объёма — назовём заранее"],
            ["Доставка", "СДЭК или Ozon в ваш город"],
          ].map(([t, d], i) => (
            <div key={t} className="steps-row__item">
              <span className="steps-row__n">{i + 1}</span>
              <h3>{t}</h3>
              <p className="muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <LogoStrip />

      <Cases />

      <section className="section" id="request">
        <div className="container request">
          <div>
            <h2>
              Индивидуальный <span className="script">заказ</span>
            </h2>
            <p className="muted">Другие формы вывесок, размеры и наполнение тейблтентов — цена по запросу.</p>
          </div>
          <RequestForm topic="Для бизнеса" />
        </div>
      </section>
    </>
  );
}

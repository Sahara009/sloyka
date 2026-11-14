import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/format";

/* Памятка по логотипу — текст заказчика (11.11) */

export const metadata: Metadata = {
  title: "Памятка по логотипу",
  description: "Что прислать для логотипа на столике, подиуме, стойке Париж, Leon и табличке короны: текст, шрифт, цвета и ограничения.",
  alternates: { canonical: "/logo" },
};

export default function LogoPage() {
  return (
    <div className="container page narrow">
      <Reveal className="page-head">
        <h1>
          Памятка <span className="script">по логотипу</span>
        </h1>
        <p className="muted">
          После оформления заказа пришлите логотип в{" "}
          <a href={site.telegram} target="_blank" rel="noreferrer">Telegram</a> или{" "}
          <a href={site.instagram} target="_blank" rel="noreferrer">Instagram</a> и укажите номер заказа. Макет согласовываем
          обязательно — без согласования в работу не берём.
        </p>
      </Reveal>

      <div className="info-grid">
        <section className="info-card bg-gingham">
          <div className="info-card__inner">
            <h2>Столики</h2>
            <p>Логотип на торце столешницы. Пришлите:</p>
            <ul>
              <li>Текст логотипа — как он должен выглядеть: язык, регистр, символы. Например: Красные_Торты</li>
              <li>
                Шрифт: наш (пухлые буквы, фирменный или по референсу из наших работ) или ваш — тогда достаточно чёрно-белого фото:
                обязательно белый фон и чёткие чёрные буквы
              </li>
            </ul>
            <p>Условия:</p>
            <ul>
              <li>Без тонких линий и мелких элементов</li>
              <li>Только одна строка — логотип в две строки на торец не поместится</li>
              <li>Цветов — сколько угодно: хоть каждая буква своим цветом</li>
              <li>Логотип наносится вручную, поэтому возможны небольшие неточности</li>
            </ul>
          </div>
        </section>

        <section className="info-card bg-stripes-sage">
          <div className="info-card__inner">
            <h2>Подиум I и Penny</h2>
            <p>Логотип небольшой по размеру, наносится не вручную. Поэтому:</p>
            <ul>
              <li>Чем короче логотип, тем лучше</li>
              <li>Толстый шрифт, без мелких элементов</li>
              <li>Цвета: 1 цвет подложки и до 3 цветов на сам логотип</li>
            </ul>
          </div>
        </section>

        <section className="info-card bg-gingham">
          <div className="info-card__inner">
            <h2>Париж, Leon, табличка короны</h2>
            <p>Здесь почти полная свобода: печатаем до 4 цветов, ограничение одно — без слишком тонких линий.</p>
            <ul>
              <li>Париж — круг диаметром 8 см, самый маленький: мелкие детали могут не пропечататься</li>
              <li>Leon — круг диаметром 11 см</li>
              <li>
                Табличка короны — 7 × 17 см, форму тоже можно изменить. Табличка с вашим логотипом входит в стоимость короны: есть
                базовая форма, а дальше — полный кастом
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

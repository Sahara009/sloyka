import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";
import { Photo } from "@/components/ui/Photo";
import { site } from "@/lib/format";

/* Памятка по нанесению логотипа — текст и примеры заказчика (20.11) */

export const metadata: Metadata = {
  title: "Памятка по логотипу",
  description:
    "Как мы наносим логотип на столики, подиумы, стойки и вывески Sloyka: на какие изделия, варианты исполнения, ограничения и какие файлы прислать.",
  alternates: { canonical: "/logo" },
};

type Fig = { src: string; cap: string };

function Figs({ items }: { items: Fig[] }) {
  return (
    <div className="memo-figs">
      {items.map((f) => (
        <figure key={f.src}>
          <Photo src={f.src} alt={f.cap} />
          <figcaption>{f.cap}</figcaption>
        </figure>
      ))}
    </div>
  );
}

const m = (n: string) => `/photos/logo-memo/${n}.webp`;

export default function LogoPage() {
  return (
    <div className="container page narrow memo">
      <Reveal className="page-head">
        <h1>
          Памятка <span className="script">по нанесению логотипа</span>
        </h1>
        <p className="muted">
          Мы наносим ваш логотип на наши изделия. Вы можете прислать свой готовый макет или доверить подбор шрифта нам. После
          оформления заказа пришлите логотип в{" "}
          <a href={site.telegram} target="_blank" rel="noreferrer">Telegram</a> или{" "}
          <a href={site.instagram} target="_blank" rel="noreferrer">Instagram</a> и укажите номер заказа.
        </p>
      </Reveal>

      <section className="memo__sec">
        <h2>1. На какие изделия наносим логотип</h2>
        <div className="info-grid">
          <div className="info-card bg-gingham">
            <div className="info-card__inner">
              <h3>Столики</h3>
              <ul>
                <li>
                  MUFFIN, MARBLE, Classic Podium — только однострочное горизонтальное размещение. Логотипы для столиков наносятся
                  вручную, поэтому допустимы небольшие отклонения по межбуквенному интервалу и наклону букв.
                </li>
              </ul>
              <h3>Подиумы и подставки</h3>
              <ul>
                <li>Podium I, Penny с лого — короткие небольшие логотипы, возможно размещение в 2 строки.</li>
              </ul>
            </div>
          </div>
          <div className="info-card bg-stripes-sage">
            <div className="info-card__inner">
              <h3>Стойки и вывески</h3>
              <ul>
                <li>Ножки Paris — боковые логотипы диаметром до 8 см.</li>
                <li>Стойка Леон — боковые логотипы диаметром до 11 см.</li>
                <li>«Корона» для стоек — размер до 17 × 7 см.</li>
                <li>Вывески и тейбл-тенты — размер до 30 × 30 см (обсуждается индивидуально).</li>
                <li>Другие модели — на любые изделия, в описании которых указана возможность брендирования.</li>
              </ul>
            </div>
          </div>
        </div>
        <Figs
          items={[
            { src: m("limbox-model"), cap: "Логотип на боковину стойки: макет" },
            { src: m("limbox-stand"), cap: "Так он выглядит на стойке Леон" },
          ]}
        />
        <p className="memo__note">Логотип на Penny с лого и Podium I:</p>
        <Figs
          items={[
            { src: m("elena-plates"), cap: "Таблички с логотипом: макет в трёх цветах" },
            { src: m("elena-photo"), cap: "Готовые Penny и столик с тем же логотипом" },
          ]}
        />
        <p className="memo__note">Двухстрочный логотип для столика выносим в одну строку:</p>
        <Figs
          items={[
            { src: m("katrin-src"), cap: "Исходный логотип в две строки" },
            { src: m("katrin-line"), cap: "Варианты в одну строку" },
            { src: m("katrin-table"), cap: "Готовый столик" },
          ]}
        />
      </section>

      <section className="memo__sec">
        <h2>2. Варианты исполнения</h2>
        <ul className="memo__list">
          <li>
            <b>Ваш оригинальный логотип.</b> Переносим в точности по вашему макету и шрифту.
          </li>
          <li>
            <b>Подбор нашего шрифта.</b> Подберём максимально похожий шрифт из нашей базы под ваш запрос.
          </li>
          <li>
            <b>Объёмные «пухлые» буквы.</b> Эффектный мягкий 3D-объём.
          </li>
          <li>
            <b>Резной логотип (без цвета).</b> Вырезается прямо в корпусе изделия. Доступно только для Cappottina и
            декоративных табличек (например, «Корона»).
          </li>
        </ul>
        <Figs
          items={[
            { src: m("font-flat"), cap: "Наш фирменный шрифт — так присылаем макет" },
            { src: m("font-3d"), cap: "Он же в объёме" },
            { src: m("sova-flat"), cap: "Другие шрифты из нашей базы — на выбор" },
            { src: m("sova-3d"), cap: "Те же варианты в объёме" },
          ]}
        />
        <p className="memo__note">Объёмные «пухлые» буквы:</p>
        <Figs
          items={[
            { src: m("theida-model"), cap: "Макет" },
            { src: m("theida-photo"), cap: "Готовый столик" },
            { src: m("kondihome"), cap: "Пухлые буквы крупно" },
          ]}
        />
        <p className="memo__note">Резной логотип:</p>
        <Figs
          items={[
            { src: m("choc-model"), cap: "Вырезанные буквы на табличке: макет" },
            { src: m("choc-photo"), cap: "Табличка на короне стойки" },
          ]}
        />
      </section>

      <section className="memo__sec">
        <h2>3. Технические ограничения</h2>
        <p>Чтобы логотип получился чётким и аккуратным при 3D-печати, в макете не должно быть слишком мелких деталей:</p>
        <ul className="memo__list">
          <li>
            <b>Толщина линий:</b> не менее 0,5 мм в реальном размере готового логотипа.
          </li>
          <li>
            <b>Мелкие элементы</b> (точки, «пыльца», засечки): общий диаметр элемента не менее 1,5 мм.
          </li>
          <li>
            <b>Количество цветов:</b> до 3 цветов на сам логотип + 1 цвет на подложку (фон).
          </li>
        </ul>
        <p className="memo__note">Пример проблемы тонких линий: в таком размере линии букв слишком тонкие и не пропечатываются.</p>
        <Figs
          items={[
            { src: m("mira"), cap: "Логотип с тонкими линиями" },
            { src: m("thin-1"), cap: "Тонкие элементы при печати" },
            { src: m("thin-2"), cap: "Тонкие элементы при печати" },
          ]}
        />
      </section>

      <section className="memo__sec">
        <h2>4. Требования к файлам от вас</h2>
        <p>Чтобы мы могли перевести логотип в 3D-модель, подготовьте файлы одним из двух способов:</p>
        <div className="info-grid">
          <div className="info-card bg-gingham">
            <div className="info-card__inner">
              <h3>Вариант А. Вектор или PNG без фона (предпочтительно)</h3>
              <ul>
                <li>Формат SVG или PNG на прозрачном фоне в высоком разрешении.</li>
                <li>
                  Если логотип многоцветный, каждый цвет нужно сохранить отдельным файлом (слоем) с сохранением исходного
                  расположения элементов.
                </li>
              </ul>
            </div>
          </div>
          <div className="info-card bg-stripes-sage">
            <div className="info-card__inner">
              <h3>Вариант Б. Чёрно-белое изображение</h3>
              <ul>
                <li>Чёткий чёрный логотип на чистом белом фоне без размытия и пикселей.</li>
                <li>
                  Для многоцветных логотипов присылается отдельный ч/б файл под каждый цвет (элементы должны оставаться на своих
                  местах относительно общего макета).
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p>
          <b>Обязательно для обоих вариантов:</b> приложите оригинальное цветное изображение логотипа, чтобы мы видели, как он
          должен выглядеть в сборе.
        </p>
        <p className="memo__note">Пример с разбивкой цветов на слои:</p>
        <Figs
          items={[
            { src: m("kostanda-color"), cap: "Оригинал в цвете" },
            { src: m("kostanda-bw"), cap: "Слой 1 — ч/б файл" },
            { src: m("kostanda-house"), cap: "Слой 2 — ч/б файл, элемент на своём месте" },
            { src: m("kostanda-3d"), cap: "Готовая модель" },
          ]}
        />
        <p className="memo__note">Так присылать не нужно — нечёткое фото или картинка с помехами:</p>
        <Figs
          items={[
            { src: m("limbox-bad"), cap: "Размытое серое фото" },
            { src: m("teplo-src"), cap: "Картинка с помехами" },
            { src: m("teplo-plates"), cap: "Из чёткого файла получаются такие таблички" },
          ]}
        />
      </section>

      <section className="memo__sec">
        <h2>5. Важно перед запуском в работу</h2>
        <ul className="memo__list">
          <li>
            <b>Обязательное согласование.</b> Мы всегда утверждаем с вами макет перед печатью. Без вашего подтверждения мы не
            запускаем логотип в работу.
          </li>
          <li>
            <b>Влияние на сроки.</b> Срок изготовления заказа увеличивается на время ожидания вашего ответа по согласованию
            макета.
          </li>
        </ul>
      </section>
    </div>
  );
}

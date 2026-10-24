import Link from "next/link";
import { Photo } from "./Photo";
import { Shape, type ShapeName } from "./Shape";

/* Подставки с логотипами кондитерских — декоративная лента «С вашим логотипом» */
const items = [
  { src: "/photos/logo-kakava.webp", alt: "Подставка с логотипом KAKAVA" },
  { src: "/photos/logo-valeribento.webp", alt: "Подставка с логотипом valeribento" },
  { src: "/photos/logo-tower.webp", alt: "Подставки с логотипами кондитеров" },
  { src: "/photos/logo-krem.webp", alt: "Подставки с логотипами «Крем» и «Бентортик»" },
  { src: "/photos/logo-bentodel.webp", alt: "Подставка с логотипом bentodel" },
  { src: "/photos/logo-tanya.webp", alt: "Подставка с логотипом Tanya Bakery" },
  { src: "/photos/logo-elena.webp", alt: "Подиумы Penny с логотипом Elena Bakery" },
  { src: "/photos/waffles-hochu-peku.webp", alt: "Подставки «Хочу Пеку» с органайзерами Waffle's" },
  { src: "/photos/fleur-logo-sun.webp", alt: "Столик Fleur с вкладышем и логотипом" },
  { src: "/photos/logo-stands-colors.webp", alt: "Цветные подставки с логотипами" },
];

const shapes: ShapeName[] = ["arch", "rounded"];

export function LogoStrip({ title = true }: { title?: boolean }) {
  // дублируем ленту, чтобы она бесшовно прокручивалась по кругу
  const row = [...items, ...items];
  return (
    <section className="logo-strip">
      {title && (
        <div className="container logo-strip__head">
          <h2>
            С <span className="script">вашим</span> логотипом
          </h2>
          <p className="muted">
            Объёмный логотип на столешнице — от 300 ₽. Сделаем в цветах вашего бренда для кондитерской, кофейни или маркета.
          </p>
          <Link href="/catalog/classic-muffin" className="more">
            Подставки с логотипом →
          </Link>
        </div>
      )}
      <div className="logo-strip__viewport">
        <div className="logo-strip__track">
          {row.map((it, i) => (
            <div key={i} className="logo-strip__item" aria-hidden={i >= items.length}>
              <Shape shape={shapes[i % shapes.length]} ratio="3 / 4" bg="var(--cream)">
                <Photo src={it.src} alt={i >= items.length ? "" : it.alt} className="cover" />
              </Shape>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

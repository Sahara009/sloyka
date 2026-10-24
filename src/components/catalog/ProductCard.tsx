import Link from "next/link";
import { hasPriceFrom, type Product } from "@/data/products";
import { ProductVisual } from "@/components/art/ProductArt";
import { Shape, type ShapeName } from "@/components/ui/Shape";
import { formatPrice } from "@/lib/format";

const shapes: ShapeName[] = ["quatrefoil", "arch-scallop", "clover", "scallop"];
const tones = [
  { bg: "var(--blue-100)", outline: "var(--blue-400)" },
  { bg: "var(--cream)", outline: "var(--caramel)" },
  { bg: "var(--sage-100)", outline: "var(--sage-400)" },
  { bg: "var(--blush-100)", outline: "var(--bordeaux-300)" },
];

/** Карточка товара: на главной — в фигурной маске, в каталоге (simple) — спокойная плитка.
 * Фигурная маска — формы и цвета чередуются, как в референсе ilovepink */
export function ProductCard({ product, index = 0, simple }: { product: Product; index?: number; simple?: boolean }) {
  const tone = tones[index % tones.length];
  const from = hasPriceFrom(product);
  // фото с фоном — в спокойную арку, чтобы узорная маска его не съедала
  const isPhoto = !!product.image?.startsWith("/photos/");
  return (
    <Link href={`/catalog/${product.slug}`} className={`pcard ${simple ? "pcard--simple" : ""}`}>
      {simple ? (
        <span className={`pcard__box ${isPhoto ? "pcard__box--photo" : ""}`}>
          <ProductVisual product={product} className={isPhoto ? "pcard__photo" : "pcard__art"} />
        </span>
      ) : (
      <Shape shape={isPhoto ? "arch" : shapes[index % shapes.length]} outline={tone.outline} bg={tone.bg} stroke={4}>
        <ProductVisual product={product} className={isPhoto ? "pcard__photo" : "pcard__art"} />
      </Shape>
      )}
      {(product.hit || product.isNew) && <span className="pcard__tag">{product.isNew ? "new" : "хит"}</span>}
      <span className="pcard__name">{product.name}</span>
      <span className="pcard__meta">{product.short}</span>
      <span className="pcard__price">
        {from && "от "}
        {formatPrice(product.price)}
      </span>
    </Link>
  );
}

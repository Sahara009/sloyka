import type { Art, Product } from "@/data/products";
import { Photo } from "@/components/ui/Photo";
import { StandArt } from "./StandArt";
import { TableArt } from "./TableArt";

/** Фото товара, а если фото нет — SVG-иллюстрация */
export function ProductVisual({
  product,
  image,
  className,
  eager,
}: {
  product: Pick<Product, "name" | "image" | "art">;
  /** Перекрыть главное фото (например, выбранной глазурью) */
  image?: string;
  className?: string;
  eager?: boolean;
}) {
  const src = image ?? product.image;
  if (src) return <Photo src={src} alt={product.name} className={className} eager={eager} />;
  if (product.art) return <ProductArt art={product.art} className={className} title={product.name} />;
  return null;
}

export function ProductArt({ art, className, title }: { art: Art; className?: string; title?: string }) {
  if (art.type === "table") return <TableArt {...art} className={className} title={title} />;
  if (art.type === "stand") return <StandArt {...art} className={className} title={title} />;
  if (art.variant === "crown") return <StandArt levels={1} colors={["white"]} crown className={className} title={title} />;
  return <DecorArt label={art.label} variant={art.variant} className={className} />;
}

function DecorArt({ label, variant, className }: { label: string; variant: "sign" | "tent" | "logo"; className?: string }) {
  return (
    <svg viewBox="0 0 240 240" className={className} role="img" aria-label={label}>
      <ellipse cx={120} cy={222} rx={70} ry={6} fill="rgba(74,46,34,0.12)" />
      {variant === "sign" && (
        <g>
          <rect x={50} y={46} width={140} height={140} rx={34} fill="#efe6d8" stroke="#b39a7d" strokeWidth={3} />
          <rect x={62} y={58} width={116} height={116} rx={26} fill="#fffaf2" />
          <circle cx={120} cy={100} r={18} fill="#4a2e22" />
          <text x={120} y={148} textAnchor="middle" fontSize="16" fill="#4a2e22" fontFamily="serif">
            {label}
          </text>
        </g>
      )}
      {variant === "tent" && (
        <g>
          <rect x={74} y={40} width={92} height={160} rx={4} fill="#fffaf2" stroke="#cdbba3" strokeWidth={2} />
          <rect x={98} y={88} width={44} height={44} fill="#4a2e22" />
          <rect x={106} y={96} width={28} height={28} fill="#fffaf2" />
          <rect x={114} y={104} width={12} height={12} fill="#4a2e22" />
          <text x={120} y={160} textAnchor="middle" fontSize="13" fill="#4a2e22">
            {label}
          </text>
          <rect x={62} y={198} width={116} height={14} rx={7} fill="#8a6a55" />
        </g>
      )}
      {variant === "logo" && (
        <g>
          <text x={120} y={140} textAnchor="middle" fontSize="54" fill="#4a2e22" fontFamily="cursive" fontStyle="italic">
            {label}
          </text>
          <rect x={60} y={160} width={120} height={10} rx={5} fill="#8a6a55" />
        </g>
      )}
    </svg>
  );
}

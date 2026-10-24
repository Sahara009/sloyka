import { imageSizes } from "@/data/images";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** Для первого экрана — грузить сразу */
  eager?: boolean;
};

/**
 * Фото товара (WebP без фона из /public/products) или интерьерное фото из /public/photos.
 * Ширина и высота берутся из data/images.ts, чтобы вёрстка не прыгала при загрузке.
 */
export function Photo({ src, alt, className, eager }: Props) {
  const [w, h] = imageSizes[src] ?? [600, 600];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={w}
      height={h}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={className}
      draggable={false}
    />
  );
}

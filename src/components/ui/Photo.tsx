import type React from "react";
import { imageSizes } from "@/data/images";
import { photoCrops } from "@/data/photo-crops";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** Для первого экрана — грузить сразу */
  eager?: boolean;
  style?: React.CSSProperties;
};

/**
 * Фото товара (WebP без фона из /public/products) или интерьерное фото из /public/photos.
 * Ширина и высота берутся из data/images.ts, чтобы вёрстка не прыгала при загрузке.
 */
export function Photo({ src, alt, className, eager, style }: Props) {
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
      style={style}
    />
  );
}

/** Фото в квадрате с товаром по центру (кадр из data/photo-crops.ts); без кадра — обычная обрезка по центру */
export function CropPhoto({ src, alt, className, eager }: { src: string; alt: string; className?: string; eager?: boolean }) {
  const c = photoCrops[src];
  return (
    <span className={`crop-photo ${className ?? ""}`}>
      <Photo
        src={src}
        alt={alt}
        eager={eager}
        className={c ? "crop-photo__img" : "crop-photo__img crop-photo__img--cover"}
        style={c ? { width: `${100 / c[2]}%`, left: `${(-c[0] / c[2]) * 100}%`, top: `${(-c[1] / c[2]) * 100}%` } : undefined}
      />
    </span>
  );
}

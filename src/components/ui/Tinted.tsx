import type { CSSProperties } from "react";
import { imageSizes } from "@/data/images";

/**
 * Перекраска изделия в цвет палитры по фото.
 * base — фото детали в белом/светлом пластике без фона (тени и рельеф сохраняются),
 * поверх кладём слой цвета, обрезанный по силуэту детали, в режиме multiply.
 * Если для цвета есть настоящее фото (photo), показываем его вместо перекраски.
 */
export function Tinted({
  base,
  color,
  photo,
  alt = "",
  className,
  style,
}: {
  base: string;
  color: string;
  photo?: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [w, h] = imageSizes[photo ?? base] ?? [400, 400];
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={photo} alt={alt} width={w} height={h} className={`tinted ${className ?? ""}`} style={style} draggable={false} />;
  }
  return (
    <span
      className={`tinted ${className ?? ""}`}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      style={{ ...style, ["--tint" as string]: color, ["--tint-mask" as string]: `url(${base})`, aspectRatio: `${w} / ${h}` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={base} alt="" width={w} height={h} draggable={false} />
    </span>
  );
}

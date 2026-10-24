"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { ProductVisual } from "@/components/art/ProductArt";
import { useCart } from "@/components/cart/CartProvider";
import { Photo } from "@/components/ui/Photo";
import { Shape } from "@/components/ui/Shape";
import { Swatches } from "@/components/ui/Swatches";
import { colorById } from "@/data/palette";
import { hasPriceFrom, lineTitles, logoPrice, type Product } from "@/data/products";
import { formatPrice } from "@/lib/format";

/**
 * Страница товара: фото + выбор размера / глазури / цвета + кнопка «В корзину».
 * Цена пересчитывается от выбранного размера и логотипа.
 */
export function ProductView({ product, children }: { product: Product; children?: ReactNode }) {
  const { add } = useCart();
  const initialColor = product.art?.type === "table" ? product.art.podiumColor : "white";
  const initialLeg = product.art?.type === "table" ? product.art.legColor : "white";

  const [optionId, setOptionId] = useState(product.options?.[0]?.id);
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id);
  const [color, setColor] = useState(initialColor);
  const [color2, setColor2] = useState(initialLeg);
  const [withLogo, setWithLogo] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [shot, setShot] = useState<string | null>(null);

  const option = product.options?.find((o) => o.id === optionId);
  const variant = product.variants?.find((v) => v.id === variantId);
  const colorsMode = product.colors ?? "one";
  const logo = product.logoAddon && withLogo && option ? logoPrice(option.label) : 0;
  const unit = product.price === null ? null : (option?.price ?? product.price) + logo;

  const mainImage = shot ?? variant?.image ?? product.image;
  const thumbs = useMemo(() => {
    const list = [product.image, ...(product.gallery ?? [])].filter(Boolean) as string[];
    return list.length > 1 ? list : [];
  }, [product]);

  const isPhoto = !!mainImage?.startsWith("/photos/");
  const optionGroups = Array.from(new Set(product.options?.map((o) => o.group ?? "") ?? []));

  const onAdd = () => {
    if (unit === null) return;
    const details: string[] = [];
    if (option) details.push(`Размер: ${option.group ? `${option.group}, ` : ""}${option.label}`);
    if (variant) details.push(`Глазурь: ${variant.name}`);
    if (colorsMode === "one") details.push(`Цвет: ${colorById(color).name}`);
    if (colorsMode === "two") details.push(`Столешница: ${colorById(color).name}`, `Ножка: ${colorById(color2).name}`);
    if (logo) details.push(`Логотип: +${formatPrice(logo)}`);
    add(
      {
        key: [product.slug, optionId, variantId, colorsMode !== "none" && color, colorsMode === "two" && color2, logo].filter(Boolean).join(":"),
        slug: product.slug,
        name: product.name,
        price: unit,
        details,
        image: variant?.image ?? product.image,
        ref: { kind: "product", slug: product.slug, option: optionId, logo: logo > 0 },
        art: product.art?.type === "table" ? { ...product.art, podiumColor: color, legColor: color2 } : product.art,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="product">
      <div className="product__media">
        <Shape shape={isPhoto ? "arch" : "arch-scallop"} outline="var(--blue-400)" bg="var(--blue-100)" stroke={6} ratio="4 / 5" className={isPhoto ? "" : "bg-stripes-blue"}>
          <ProductVisual
            key={mainImage}
            product={product}
            image={mainImage}
            eager
            className={`product__img ${isPhoto ? "is-photo" : ""}`}
          />
        </Shape>
        {thumbs.length > 0 && (
          <div className="thumbs" role="list" aria-label="Фото товара">
            {thumbs.map((src) => (
              <button
                key={src}
                type="button"
                role="listitem"
                className={`thumbs__item ${(shot ?? product.image) === src && !variant?.image ? "is-active" : ""}`}
                onClick={() => setShot(src === product.image ? null : src)}
                aria-label="Показать фото"
              >
                <Photo src={src} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="product__info">
        <p className="eyebrow">{lineTitles[product.line]}</p>
        <h1 className="product__title">{product.name}</h1>
        <p className="product__price">
          {unit === null ? "Цена по запросу" : formatPrice(unit * qty)}
          {qty > 1 && unit !== null && <small> · {formatPrice(unit)} за шт.</small>}
        </p>
        <p>{product.description}</p>

        {unit === null ? (
          <a className="btn" href="/business#request">
            Оставить заявку
          </a>
        ) : (
          <div className="buy">
            {product.options && (
              <div className="buy__block">
                <p className="buy__label">Размер</p>
                {optionGroups.map((g) => (
                  <div key={g} className="sizes">
                    {g && <span className="sizes__group">{g}</span>}
                    {product.options!
                      .filter((o) => (o.group ?? "") === g)
                      .map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          className={`size ${o.id === optionId ? "is-active" : ""}`}
                          aria-pressed={o.id === optionId}
                          onClick={() => setOptionId(o.id)}
                        >
                          {o.label}
                          <small>{formatPrice(o.price)}</small>
                        </button>
                      ))}
                  </div>
                ))}
              </div>
            )}

            {product.variants && (
              <div className="buy__block">
                <p className="buy__label">Глазурь: {variant?.name}</p>
                <div className="glazes">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      className={`glaze ${v.id === variantId ? "is-active" : ""}`}
                      style={{ ["--glaze" as string]: v.swatch }}
                      aria-pressed={v.id === variantId}
                      aria-label={v.name}
                      title={v.name}
                      onClick={() => {
                        setVariantId(v.id);
                        setShot(null);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {colorsMode === "one" && <Swatches value={color} onChange={setColor} label={`Цвет: ${colorById(color).name}`} />}
            {colorsMode === "two" && (
              <>
                <Swatches value={color} onChange={setColor} label={`Столешница: ${colorById(color).name}`} />
                <Swatches value={color2} onChange={setColor2} label={`Ножка: ${colorById(color2).name}`} />
              </>
            )}

            {product.logoAddon && option && (
              <label className="check">
                <input type="checkbox" checked={withLogo} onChange={(e) => setWithLogo(e.target.checked)} />
                <span>
                  Добавить ваш логотип · +{formatPrice(logoPrice(option.label))}
                  <small className="muted"> (Лого PRO — от 600 ₽, по запросу)</small>
                </span>
              </label>
            )}

            <div className="buy__row">
              <div className="qty">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Меньше">
                  −
                </button>
                <span>{qty}</span>
                <button type="button" onClick={() => setQty((q) => q + 1)} aria-label="Больше">
                  +
                </button>
              </div>
              <button type="button" className="btn" onClick={onAdd}>
                {added ? "Добавлено ✓" : `В корзину · ${formatPrice(unit * qty)}`}
              </button>
            </div>
            {hasPriceFrom(product) && <p className="muted small">Цвета могут незначительно отличаться из-за настроек экрана и партии пластика.</p>}
          </div>
        )}

        {product.constructorPreset && (
          <Link href={`/constructor?preset=${product.slug}`} className="more">
            Изменить сборку в конструкторе →
          </Link>
        )}

        {children}
      </div>
    </div>
  );
}

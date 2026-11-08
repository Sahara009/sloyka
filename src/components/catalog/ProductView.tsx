"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { ProductVisual } from "@/components/art/ProductArt";
import { useCart } from "@/components/cart/CartProvider";
import { Photo } from "@/components/ui/Photo";
import { Shape } from "@/components/ui/Shape";
import { Swatches } from "@/components/ui/Swatches";
import { allColors, colorById } from "@/data/palette";
import { categoriesOf, categoryTitle } from "@/data/categories";
import { effectivePrice, familyOf, hasPriceFrom, lineTitles, logoCost, productBySlug, promoActive, zonesOf, type ColorZone, type Product } from "@/data/products";
import { Tinted } from "@/components/ui/Tinted";
import { StandView } from "@/components/constructor/StandView";
import { marketBases } from "@/data/parts";
import { slotsFromPicked } from "@/data/market-rules";
import { diademInserts, type DiademInsert } from "@/data/stand-renders";
import { formatPrice, site } from "@/lib/format";
import { SetSlots } from "./SetSlots";

/**
 * Страница товара: фото + выбор размера / глазури / цвета + кнопка «В корзину».
 * Цена пересчитывается от выбранного размера и логотипа.
 */
export function ProductView({ product, children }: { product: Product; children?: ReactNode }) {
  const { add } = useCart();
  const allowed = product.allowedColors;
  const pickStart = (c: string) => (allowed && !allowed.includes(c) ? allowed[0] : c);
  const initialColor = pickStart(product.art?.type === "table" ? product.art.podiumColor : "white");
  const initialLeg = pickStart(product.art?.type === "table" ? product.art.legColor : "white");
  const family = familyOf(product.slug);
  const addons = family?.addons && !family.noAddonsFor?.includes(product.slug) ? family.addons.map((s) => productBySlug(s)).filter(Boolean) as Product[] : [];
  const onPromo = promoActive(product);
  const [addedAddon, setAddedAddon] = useState<string | null>(null);

  const [optionId, setOptionId] = useState(product.options?.[0]?.id);
  const [variantId, setVariantId] = useState(product.variants?.[0]?.id);
  const baseZones = zonesOf(product);
  // цвет по зонам: первая зона — столешница/подиум, вторая — ножка, остальные стартуют белыми
  const [zoneColors, setZoneColors] = useState<Record<string, string>>(() =>
    // ножки (leg, leg2…) — в цвет ножки из готовой сборки, остальное — в цвет подиума
    Object.fromEntries(baseZones.map((z, i) => [z.id, z.id.startsWith("leg") || (i === 1 && !baseZones.some((x) => x.id.startsWith("leg"))) ? initialLeg : initialColor])),
  );
  const colorOf = (id: string) => zoneColors[id] ?? pickStart("white");
  const [withLogo, setWithLogo] = useState(false);
  // наборы-ассорти Minies: форма каждого подиума
  const [forms, setForms] = useState<Record<string, string>>({});
  // ножки Париж: логотип в подарок, можно отказаться (останется вырез под наклейку)
  const [giftLogo, setGiftLogo] = useState(true);
  // готовая стойка с диадемой: вставки слева и справа — для пусетов или для цепочек (заказчик, 04.11)
  const [inserts, setInserts] = useState<{ l: DiademInsert; r: DiademInsert }>({ l: "pusety", r: "chains" });
  const preset = product.marketPreset;
  const hasDiadem = !!preset?.podiums.includes("diadem");
  const insertName = (id: DiademInsert) => diademInserts.find((x) => x.id === id)!.name;
  // набор «собери сам» (шкатулки Cachette): по позиции на шкатулку; по умолчанию — все модели по кругу в Pastel
  const asm = product.assortment;
  const [picks, setPicks] = useState<string[]>(() => {
    if (!asm) return [];
    const start = asm.items.filter((x) => x.id.endsWith(".pastel"));
    const pool = start.length ? start : asm.items;
    return Array.from({ length: asm.count }, (_, i) => pool[i % pool.length].id);
  });
  const asmItem = (id: string) => asm?.items.find((x) => x.id === id);
  const formOf = (id: string) => forms[id] ?? product.formPick?.[0] ?? "";
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [shot, setShot] = useState<string | null>(null);

  const option = product.options?.find((o) => o.id === optionId);
  const variant = product.variants?.find((v) => v.id === variantId);
  const optionTitle = product.options?.some((o) => o.id === "podium") ? "Вариант сборки" : product.slug === "bonbon-balls" || product.slug === "keychain-macaron" ? "Количество" : "Размер";
  const logoOffer = logoCost(product, option);
  const logo = withLogo && logoOffer !== null ? logoOffer : 0;
  // логотип красится отдельно (Muffin, Marble) — зона появляется, когда логотип выбран
  // у варианта могут быть свои зоны (наборы Minies: 3, 6 или 12 подиумов — у каждого свой цвет)
  const optZones = (option?.zones ?? baseZones).filter((z) => !(product.logoGift && !giftLogo && z.id === "logo"));
  const zones: ColorZone[] = logo && product.logoZone ? [...optZones, { id: "logo", label: "Логотип" }] : optZones;
  // много зон — компактный выбор списком, чтобы страница не растягивалась на несколько экранов
  const compactZones = zones.length > 6 || !!product.formPick;
  const color = zones[0] ? colorOf(zones[0].id) : initialColor;
  const color2 = zones[1] ? colorOf(zones[1].id) : initialLeg;
  // ограничение палитры по числу цветов (Па-Париж: до 3, логотип не считается)
  const usedColors = new Set(zones.filter((z) => !z.id.startsWith("logo")).map((z) => colorOf(z.id))).size;
  const tooManyColors = !!product.maxColors && usedColors > product.maxColors;
  const insertColor = zones.some((z) => z.id === "insert") ? colorOf("insert") : null;
  const base = effectivePrice(product);
  const unit = base === null ? null : (option?.price ?? base) + logo;

  const mainImage = shot ?? variant?.image ?? option?.image ?? product.image;
  // слои деталей (если есть у всех зон): складываем и красим каждый отдельно
  const layerSrc = (z: (typeof zones)[number]) => option?.layers?.[z.id] ?? z.layer;
  // зоны без своего слоя (логотип, «вкладыш, если добавите») не мешают — их просто не рисуем
  const canSkip = (z: ColorZone) => z.id.startsWith("logo") || z.id === "insert";
  const layerZones = zones.filter((z) => layerSrc(z)).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const layered = !shot && !variant?.image && layerZones.length > 0 && zones.every((z) => layerSrc(z) || canSkip(z));
  const thumbs = useMemo(() => {
    const list = [product.image, ...(product.gallery ?? [])].filter(Boolean) as string[];
    return list.length > 1 ? list : [];
  }, [product]);

  const isPhoto = !!mainImage?.startsWith("/photos/");
  const optionGroups = Array.from(new Set(product.options?.map((o) => o.group ?? "") ?? []));

  const onAdd = () => {
    if (unit === null || tooManyColors) return;
    const details: string[] = [];
    if (option) details.push(`${optionTitle}: ${option.group ? `${option.group}, ` : ""}${option.label}`);
    if (variant) details.push(`${product.variantLabel ?? "Глазурь"}: ${variant.name}`);
    for (const z of zones)
      details.push(
        `${zones.length === 1 && z.id === "main" ? "Цвет" : z.label}: ${product.formPick && /^p\d+$/.test(z.id) ? `${formOf(z.id)}, ` : ""}${colorById(colorOf(z.id)).name}`,
      );
    if (logo) details.push(`Логотип: +${formatPrice(logo)}`);
    if (asm) picks.forEach((id, i) => details.push(`${asm.unit} ${i + 1}: ${asmItem(id)?.name ?? id}`));
    if (hasDiadem) details.push(`Вставки диадемы: слева ${insertName(inserts.l)}, справа ${insertName(inserts.r)}`);
    if (product.logoGift) details.push(giftLogo ? "Логотип на ножках — в подарок, макет согласуем" : "Без логотипа — пустой вырез под наклейку");
    add(
      {
        key: [product.slug, optionId, variantId, product.logoGift && !giftLogo ? "nologo" : "", hasDiadem ? `${inserts.l}.${inserts.r}` : "", asm ? picks.join("+") : "", ...zones.map((z) => colorOf(z.id) + (product.formPick && /^p\d+$/.test(z.id) ? formOf(z.id) : "")), logo].filter(Boolean).join(":"),
        slug: product.slug,
        name: product.name,
        price: unit,
        details,
        image: variant?.image ?? option?.image ?? product.image,
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
          {preset ? (
            <StandView
              label={product.name}
              className="product__stand"
              base={preset.base}
              inserts={inserts}
              // слоты сверху вниз ← подиумы сборки снизу вверх (зоны p1…pN)
              slots={slotsFromPicked(preset.podiums, marketBases.find((b) => b.id === preset.base)!.levels)}
              colors={{
                legs: colorOf("legs"),
                slots: slotsFromPicked(preset.podiums.map((_, i) => `p${i + 1}`), marketBases.find((b) => b.id === preset.base)!.levels).map((z) => (z ? colorOf(z) : colorOf("legs"))),
                logo: zones.some((z) => z.id === "logo") ? colorOf("logo") : null,
                crown: preset.crown ? { post: colorOf("crown"), cap1: colorOf("crown-cap1"), cap2: colorOf("crown-cap2") } : null,
              }}
            />
          ) : layered ? (
            <span className="layered" role="img" aria-label={product.name}>
              {layerZones.map((z, i) => (
                <Tinted key={z.id} base={layerSrc(z)!} color={colorById(colorOf(z.id)).hex} className={i ? "layered__top" : ""} />
              ))}
            </span>
          ) : (
            <ProductVisual
              key={mainImage}
              product={product}
              image={mainImage}
              eager
              className={`product__img ${isPhoto ? "is-photo" : ""}`}
            />
          )}
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
        <p className="eyebrow">
          {lineTitles[product.line]}
          {categoriesOf(product)[0] ? ` · ${categoryTitle(product.line, categoriesOf(product)[0])}` : ""}
        </p>
        <h1 className="product__title">{product.name}</h1>
        {product.multi && <p className="small muted">{product.multi}: {product.short.toLowerCase()}</p>}
        <p className="product__price">
          {unit === null ? "Цена по запросу" : `${product.priceFrom ? "от " : ""}${formatPrice(unit * qty)}`}
          {onPromo && !option && <s className="product__old">{formatPrice(product.oldPrice! * qty)}</s>}
          {qty > 1 && unit !== null && <small> · {formatPrice(unit)} за шт.</small>}
        </p>
        {onPromo && (
          <p className="promo-note">
            <b>{product.promo!.label}</b>
            {product.promo!.text ? ` · ${product.promo!.text}` : ""}
            {product.promo!.ends ? ` · до ${new Date(product.promo!.ends).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}` : ""}
          </p>
        )}

        {family && (
          <div className="family" role="group" aria-label={`Варианты ${family.title}`}>
            <p className="buy__label">{family.title}: {family.caption ?? (family.members.length > 2 ? "подиум, столик или сборка" : "подиум или столик")}</p>
            <div className="family__list">
              {family.members.map((m) => {
                const mp = productBySlug(m.slug);
                if (!mp) return null;
                const price = effectivePrice(mp);
                return (
                  <Link key={m.slug} href={`/catalog/${m.slug}`} className={`size ${m.slug === product.slug ? "is-active" : ""}`} aria-current={m.slug === product.slug ? "page" : undefined} scroll={false}>
                    {m.label}
                    {price !== null && <small>{formatPrice(price)}</small>}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
        <p>{product.description}</p>

        {product.orderVia === "direct" ? (
          <div className="buy">
            <p className="muted">Этот товар делаем по вашему макету: размер, цвета и логотип согласуем в личных сообщениях.</p>
            <a className="btn" href={site.telegram} target="_blank" rel="noreferrer">
              Обсудить заказ в Telegram
            </a>
          </div>
        ) : unit === null ? (
          <a className="btn" href="/business#request">
            Оставить заявку
          </a>
        ) : (
          <div className="buy">
            {product.options && (
              <div className="buy__block">
                <p className="buy__label">{optionTitle}</p>
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
                <p className="buy__label">
                  {product.variantLabel ?? "Глазурь"}: {variant?.name}
                </p>
                {product.variantLabel ? (
                  // стиль — кнопки с названием и фото (шкатулки Cachette)
                  <div className="sizes" role="radiogroup" aria-label={product.variantLabel}>
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        role="radio"
                        aria-checked={v.id === variantId}
                        className={`size ${v.id === variantId ? "is-active" : ""}`}
                        onClick={() => {
                          setVariantId(v.id);
                          setShot(null);
                        }}
                      >
                        {v.name.split(" — ")[0]}
                      </button>
                    ))}
                  </div>
                ) : (
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
                )}
              </div>
            )}

            {asm && (
              <SetSlots
                title={`Соберите набор: ${asm.count} шт.`}
                slots={picks.map((id, i) => ({
                  key: `a${i}`,
                  title: `${asm.unit} ${i + 1}`,
                  value: id,
                  name: asmItem(id)?.name ?? id,
                  // eslint-disable-next-line @next/next/no-img-element
                  thumb: <img src={asmItem(id)?.image} alt="" />,
                }))}
                options={asm.items.map((x) => ({
                  id: x.id,
                  name: x.name.split(" — ")[0],
                  // eslint-disable-next-line @next/next/no-img-element
                  thumb: <img src={x.image} alt="" loading="lazy" />,
                }))}
                onPick={(i, id) => setPicks((prev) => prev.map((v, k) => (k === i ? id : v)))}
              />
            )}

            {product.formPick ? (
              <SetSlots
                title="Соберите набор: форма и цвета каждого подиума"
                slots={zones
                  .filter((z) => /^p\d+$/.test(z.id))
                  .map((z) => {
                    const b = z.id.replace("p", "b");
                    return {
                      key: z.id,
                      title: z.label,
                      value: formOf(z.id),
                      name: formOf(z.id),
                      thumb: <MiniThumb form={formOf(z.id)} top={colorOf(z.id)} balls={colorOf(b)} />,
                      extra: (
                        <span className="set-slot__colors">
                          {[
                            [z.id, "Подставка"],
                            [b, "Шарики"],
                          ].map(([id, label]) => (
                            <select key={id} value={colorOf(id)} onChange={(e) => setZoneColors((prev) => ({ ...prev, [id]: e.target.value }))} aria-label={`${label}: ${z.label}`}>
                              {allColors
                                .filter((c) => !allowed || allowed.includes(c.id))
                                .map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {label}: {c.name}
                                  </option>
                                ))}
                            </select>
                          ))}
                        </span>
                      ),
                    };
                  })}
                options={(i) => {
                  const z = zones.filter((x) => /^p\d+$/.test(x.id))[i];
                  return product.formPick!.map((f) => ({ id: f, name: f, thumb: <MiniThumb form={f} top={colorOf(z.id)} balls={colorOf(z.id.replace("p", "b"))} /> }));
                }}
                onPick={(i, f) => {
                  const z = zones.filter((x) => /^p\d+$/.test(x.id))[i];
                  setForms((prev) => ({ ...prev, [z.id]: f }));
                }}
              />
            ) : compactZones ? (
              <div className="buy__block zone-list">
                <p className="buy__label">Цвета</p>
                {zones.map((z) => (
                  <label key={z.id} className="zone-row">
                    <i style={{ background: colorById(colorOf(z.id)).hex }} aria-hidden="true" />
                    <span>{z.label}</span>
                    {product.formPick && /^p\d+$/.test(z.id) ? (
                      <select value={formOf(z.id)} onChange={(e) => setForms((prev) => ({ ...prev, [z.id]: e.target.value }))} aria-label={`Форма: ${z.label}`}>
                        {product.formPick.map((f) => (
                          <option key={f}>{f}</option>
                        ))}
                      </select>
                    ) : (
                      <span />
                    )}
                    <select value={colorOf(z.id)} onChange={(e) => setZoneColors((prev) => ({ ...prev, [z.id]: e.target.value }))}>
                      {allColors
                        .filter((c) => !allowed || allowed.includes(c.id))
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </label>
                ))}
              </div>
            ) : (
              zones.map((z) => (
                <Swatches
                  key={z.id}
                  only={allowed}
                  value={colorOf(z.id)}
                  onChange={(c) => setZoneColors((prev) => ({ ...prev, [z.id]: c }))}
                  label={`${zones.length === 1 && z.id === "main" ? "Цвет" : z.label}: ${colorById(colorOf(z.id)).name}`}
                />
              ))
            )}

            {logoOffer !== null && (
              <label className="check">
                <input type="checkbox" checked={withLogo} onChange={(e) => setWithLogo(e.target.checked)} />
                <span>
                  Добавить ваш логотип{product.logoFlat ? " (врезной)" : ""} · +{formatPrice(logoOffer)}
                  {!product.logoFlat && <small className="muted"> (Лого PRO — от 600 ₽, по запросу)</small>}
                </span>
              </label>
            )}
            {product.logoGift && (
              <label className="check">
                <input type="checkbox" checked={giftLogo} onChange={(e) => setGiftLogo(e.target.checked)} />
                <span>
                  Ваш логотип на ножках — в подарок
                  <small className="muted"> (без него останется пустой вырез, например под наклейку; цена та же)</small>
                </span>
              </label>
            )}
            {hasDiadem && (
              <div className="diadem-pick">
                <p className="buy__label">Вставки диадемы — можно две одинаковые или разные</p>
                {(["l", "r"] as const).map((side) => (
                  <div key={side} className="diadem-pick__row" role="radiogroup" aria-label={side === "l" ? "Левая вставка" : "Правая вставка"}>
                    <span className="muted small">{side === "l" ? "Слева" : "Справа"}</span>
                    {diademInserts.map((x) => (
                      <button key={x.id} type="button" role="radio" aria-checked={inserts[side] === x.id} className={`size ${inserts[side] === x.id ? "is-active" : ""}`} onClick={() => setInserts((prev) => ({ ...prev, [side]: x.id }))}>
                        {x.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
            {product.logoAddon && option?.noLogo && <p className="muted small">На размере {option.label} логотип не делаем.</p>}
            {product.maxColors && (
              <p className={`small ${tooManyColors ? "error" : "muted"}`}>
                До {product.maxColors} разных цветов на набор (логотип — отдельно){tooManyColors ? `: сейчас ${usedColors}` : ""}.
              </p>
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
              <button type="button" className="btn" onClick={onAdd} disabled={tooManyColors}>
                {added ? "Добавлено ✓" : `В корзину · ${formatPrice(unit * qty)}`}
              </button>
            </div>
            {hasPriceFrom(product) && <p className="muted small">Цвета могут незначительно отличаться из-за настроек экрана и партии пластика.</p>}
          </div>
        )}

        {addons.length > 0 && unit !== null && (
          <div className="addons">
            <p className="buy__label">Добавить к заказу</p>
            {addons.map((a) => (
              <div key={a.slug} className="addons__row">
                <Link href={`/catalog/${a.slug}`}>
                  <b>{a.name}</b>
                  <small className="muted"> · {a.options?.length ? `от ${formatPrice(a.options[0].price)}` : formatPrice(a.price)}</small>
                </Link>
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => {
                    // доп в цвет столешницы (вкладыш — в выбранный цвет вкладыша); другой цвет или количество — на странице допа
                    const opt = a.options?.[0];
                    const addColor = a.slug.startsWith("extra-") && insertColor ? insertColor : color;
                    add(
                      {
                        key: [a.slug, opt?.id, addColor].filter(Boolean).join(":"),
                        slug: a.slug,
                        name: a.name,
                        price: opt?.price ?? a.price ?? 0,
                        details: [...(opt ? [opt.label] : []), `Цвет: ${colorById(addColor).name}${addColor === insertColor ? "" : " (как столешница)"}`],
                        image: a.image,
                        ref: { kind: "product", slug: a.slug, option: opt?.id, logo: false },
                        art: a.art,
                      },
                      1,
                    );
                    setAddedAddon(a.slug);
                    setTimeout(() => setAddedAddon(null), 1600);
                  }}
                >
                  {addedAddon === a.slug ? "Добавлено ✓" : "+ В корзину"}
                </button>
              </div>
            ))}
          </div>
        )}

        {product.marketPreset && !onPromo && (
          <Link href={`/constructor?line=market&preset=${product.slug}`} className="more">
            Изменить сборку в конструкторе →
          </Link>
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

/** Миниатюра Minies: шарики под подиумом, оба слоя перекрашены (рендеры заказчика) */
function MiniThumb({ form, top, balls }: { form: string; top: string; balls: string }) {
  const dir = `/products/layers/minies-${form.toLowerCase()}`;
  return (
    <span className="stack">
      <Tinted base={`${dir}/balls.webp`} color={colorById(balls).hex} />
      <Tinted base={`${dir}/top.webp`} color={colorById(top).hex} />
    </span>
  );
}

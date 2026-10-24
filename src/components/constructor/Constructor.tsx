"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { allColors, colorById, palette } from "@/data/palette";
import {
  crown,
  homeExtras,
  legs,
  marketBases,
  marketPodiums,
  maxPodiums,
  podiums,
  stackableLegs,
  type HomeExtraId,
  type LegId,
  type PodiumId,
} from "@/data/parts";
import { productBySlug } from "@/data/products";
import { STAGE_UNITS, extraVisuals, legVisuals, marketBaseVisuals, podiumVisuals, type PartVisual } from "@/data/visuals";
import { useCart } from "@/components/cart/CartProvider";
import { Photo } from "@/components/ui/Photo";
import { Tinted } from "@/components/ui/Tinted";
import { formatPrice } from "@/lib/format";
import { imageSizes } from "@/data/images";

/*
 * Конструктор в духе Printesso: слева большое живое превью, справа шаги вкладками.
 * Превью собирается из фото деталей и перекрашивается в цвета палитры (см. components/ui/Tinted).
 * Внизу — цена, «код сборки» (можно скопировать и отправить в директ) и кнопка в корзину.
 */

type Mode = "home" | "market";

export function Constructor() {
  const [mode, setMode] = useState<Mode>("home");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("line") === "market" || q.get("b")?.startsWith("M")) setMode("market");
  }, []);

  return (
    <div className="cfg">
      <div className="cfg__modes" role="tablist" aria-label="Что собираем">
        <button role="tab" aria-selected={mode === "home"} className={mode === "home" ? "is-active" : ""} onClick={() => setMode("home")}>
          Десертный столик <small>Sloyka Home</small>
        </button>
        <button role="tab" aria-selected={mode === "market"} className={mode === "market" ? "is-active" : ""} onClick={() => setMode("market")}>
          Стенд для маркета <small>Sloyka Market</small>
        </button>
      </div>
      {mode === "home" ? <HomeBuilder /> : <MarketBuilder />}
    </div>
  );
}

/* ---------------- общие кусочки ---------------- */

function Steps({ steps, active, onChange }: { steps: { id: string; title: string; value?: string }[]; active: string; onChange: (id: string) => void }) {
  return (
    <ol className="cfg__steps">
      {steps.map((s, i) => (
        <li key={s.id}>
          <button type="button" className={active === s.id ? "is-active" : ""} onClick={() => onChange(s.id)} aria-current={active === s.id ? "step" : undefined}>
            <span className="cfg__n">{i + 1}</span>
            <span>
              {s.title}
              {s.value && <small>{s.value}</small>}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

function Card({
  active,
  disabled,
  onClick,
  title,
  sub,
  price,
  art,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  sub?: string;
  price?: number;
  art?: ReactNode;
}) {
  return (
    <button type="button" className={`cfg-card ${active ? "is-active" : ""}`} disabled={disabled} onClick={onClick} aria-pressed={active}>
      {art && <span className="cfg-card__art">{art}</span>}
      <span className="cfg-card__title">{title}</span>
      {sub && <span className="cfg-card__sub">{sub}</span>}
      {price !== undefined && <span className="cfg-card__price">{price === 0 ? "—" : `+${formatPrice(price)}`}</span>}
    </button>
  );
}

/** Сетка 25 цветов — крупные плашки, название выбранного рядом */
function ColorGrid({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="cfg-colors">
      {palette.map((g) => (
        <div key={g.id} className="cfg-colors__group">
          <span className="cfg-colors__title">{g.title}</span>
          <div className="cfg-colors__row">
            {g.colors.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`cfg-swatch ${value === c.id ? "is-active" : ""}`}
                style={{ background: c.hex }}
                aria-label={c.name}
                title={c.name}
                aria-pressed={value === c.id}
                onClick={() => onChange(c.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Bar({ total, code, lines, onAdd, nextLabel, onNext }: { total: number; code: string; lines: [string, number][]; onAdd: () => void; nextLabel?: string; onNext?: () => void }) {
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const copy = async () => {
    const url = `${window.location.origin}/constructor?b=${encodeURIComponent(code)}`;
    try {
      await navigator.clipboard.writeText(`${code}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Скопируйте код сборки", url);
    }
  };

  return (
    <div className="cfg-bar">
      <button type="button" className="cfg-bar__sum" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="muted small">
          Ваша сборка {open ? "▴" : "▾"}
          <br />
          код <code className="cfg-bar__code">{code}</code>
        </span>
        <strong>{formatPrice(total)}</strong>
      </button>
      {open && (
        <ul className="cfg-bar__lines">
          {lines.map(([n, p], i) => (
            <li key={i}>
              <span>{n}</span>
              <span>{formatPrice(p)}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="cfg-bar__actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={copy} title="Код сборки можно отправить нам в директ">
          {copied ? "Скопировано ✓" : "Скопировать код"}
        </button>
        {onNext && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={onNext}>
            {nextLabel} →
          </button>
        )}
        <button
          type="button"
          className="btn"
          onClick={() => {
            onAdd();
            setAdded(true);
            setTimeout(() => setAdded(false), 1800);
          }}
        >
          {added ? "В корзине ✓" : "В корзину"}
        </button>
      </div>
    </div>
  );
}

/** Деталь на сцене: размер в процентах от ширины сцены, остальное — перекраска */
function Piece({ v, color, className, style }: { v: PartVisual; color: string; className?: string; style?: CSSProperties }) {
  const hex = colorById(color).hex;
  return <Tinted base={v.base} color={hex} photo={v.photos?.[color]} className={className} style={{ width: `${(v.width / STAGE_UNITS) * 100}%`, ...style }} />;
}

/** Высота детали в единицах сцены (по пропорциям фото) */
function unitsHeight(v: PartVisual) {
  const [w, h] = imageSizes[v.base] ?? [1, 1];
  return (h / w) * v.width;
}

/**
 * Раскладка столбика сверху вниз: каждая следующая деталь заезжает под предыдущую
 * на её tuck (место крепления). Отрицательный margin в % считается от ширины сцены —
 * поэтому всё в одних «единицах сцены».
 */
function stackLayout<T extends { v: PartVisual }>(items: T[]) {
  return items.map((it, i) => {
    const prev = items[i - 1];
    const overlap = prev ? (prev.v.tuck * unitsHeight(prev.v)) / STAGE_UNITS * 100 : 0;
    return { ...it, style: { marginTop: overlap ? `-${overlap}%` : undefined, zIndex: items.length - i } as CSSProperties };
  });
}

/* ---------------- Sloyka Home ---------------- */

type Part = "podium" | "leg" | "top";

const codeColor = (id: string) => allColors.findIndex((c) => c.id === id).toString(36);
const colorFromCode = (s: string) => allColors[parseInt(s, 36)]?.id;

function HomeBuilder() {
  const { add } = useCart();
  const [step, setStep] = useState("podium");
  const [podium, setPodium] = useState<PodiumId>("fleur");
  const [mainLeg, setMainLeg] = useState<LegId>("muff");
  const [topLeg, setTopLeg] = useState<LegId | null>("pumpkin");
  const [extra, setExtra] = useState<HomeExtraId | null>(null);
  const [colors, setColors] = useState<Record<Part, string>>({ podium: "white", leg: "cherry", top: "pumpkin-spice" });
  const [paint, setPaint] = useState<Part>("podium");

  // ?preset=slug — готовая сборка из каталога; ?b=код — сборка по коду
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const code = q.get("b");
    if (code?.startsWith("H-")) {
      const [, p, l, t, e, c] = code.split("-");
      const pod = podiums.find((x) => x.id.startsWith(p.toLowerCase()));
      const leg = legs.find((x) => x.id.startsWith(l.toLowerCase()));
      const top = legs.find((x) => x.id.startsWith(t.toLowerCase()));
      const ex = homeExtras.find((x) => x.id.startsWith(e.toLowerCase()));
      if (pod) setPodium(pod.id);
      if (leg) setMainLeg(leg.id);
      setTopLeg(t === "0" ? null : (top?.id ?? null));
      setExtra(e === "0" ? null : (ex?.id ?? null));
      if (c?.length === 3) setColors({ podium: colorFromCode(c[0]) ?? "white", leg: colorFromCode(c[1]) ?? "white", top: colorFromCode(c[2]) ?? "white" });
      return;
    }
    const p = productBySlug(q.get("preset") ?? "");
    const art = p?.art;
    if (p?.constructorPreset && art?.type === "table") {
      setPodium(p.constructorPreset.podium);
      setMainLeg(p.constructorPreset.legs[0]);
      setTopLeg(p.constructorPreset.legs[1] ?? null);
      setExtra(p.constructorPreset.extra ?? null);
      setColors({ podium: art.podiumColor, leg: art.legColor, top: art.legColor });
    }
  }, []);

  // правила совместимости
  useEffect(() => {
    if (!extra) return;
    const e = homeExtras.find((x) => x.id === extra)!;
    if (e.forPodium !== podium || (e.requiresLeg && e.requiresLeg !== mainLeg)) setExtra(null);
  }, [podium, mainLeg, extra]);

  const P = podiums.find((x) => x.id === podium)!;
  const L = legs.find((x) => x.id === mainLeg)!;
  const T = topLeg ? legs.find((x) => x.id === topLeg)! : null;
  const E = extra ? homeExtras.find((x) => x.id === extra)! : null;
  const availableExtras = homeExtras.filter((e) => e.forPodium === podium);

  const lines: [string, number][] = [
    [`Подиум ${P.name} · ${colorById(colors.podium).name}`, P.price],
    ...(T ? [[`Ярус ${T.name} · ${colorById(colors.top).name}`, T.price] as [string, number]] : []),
    [`Ножка ${L.name} · ${colorById(colors.leg).name}`, L.price],
    ...(E ? [[E.name, E.price] as [string, number]] : []),
  ];
  const total = lines.reduce((s, [, p]) => s + p, 0);
  const height = L.height + (T?.height ?? 0);
  const name = [P.name, T?.name, L.name].filter(Boolean).join(" + ");
  const code = ["H", P.id.slice(0, 3).toUpperCase(), L.id.slice(0, 3).toUpperCase(), T ? T.id.slice(0, 3).toUpperCase() : "0", E ? E.id.slice(0, 3).toUpperCase() : "0", codeColor(colors.podium) + codeColor(colors.leg) + codeColor(colors.top)].join("-");

  const steps = [
    { id: "podium", title: "Подиум", value: P.name },
    { id: "leg", title: "Ножка", value: `${L.name}, ${L.height} см` },
    { id: "top", title: "Второй ярус", value: T ? T.name : "нет" },
    { id: "extra", title: "Детали", value: E ? E.name : "нет" },
    { id: "colors", title: "Цвета", value: [colors.podium, colors.leg].map((c) => colorById(c).name).join(" / ") },
  ];
  const order = steps.map((s) => s.id);
  const next = order[order.indexOf(step) + 1];

  const paintable: { id: Part; label: string }[] = [
    { id: "podium", label: `Подиум ${P.name}` },
    ...(T ? [{ id: "top" as Part, label: `Ярус ${T.name}` }] : []),
    { id: "leg", label: `Ножка ${L.name}` },
  ];

  return (
    <div className="cfg__layout">
      <div className="cfg__stage-wrap">
        <div className="cfg__stage bg-stripes-blue" aria-label={`Превью: ${name}`}>
          <div className="cfg__stack" key={`${podium}-${mainLeg}-${topLeg}-${extra}`}>
            {stackLayout([
              { v: podiumVisuals[podium], color: colors.podium, key: "p" },
              ...(T ? [{ v: legVisuals[T.id], color: colors.top, key: "t" }] : []),
              { v: legVisuals[L.id], color: colors.leg, key: "l" },
            ]).map(({ v, color, key, style }) => (
              <Piece key={key} v={v} color={color} className="cfg__piece" style={style} />
            ))}
            {E?.id === "attico" && (
              <Piece
                v={extraVisuals.attico}
                color={colors.podium}
                className="cfg__piece cfg__piece--attico"
                style={{ marginTop: `-${unitsHeight(legVisuals[L.id]) * 0.62 / STAGE_UNITS * 100}%`, zIndex: 5 }}
              />
            )}
          </div>
          {E && E.id !== "attico" && (
            <div className="cfg__insert">
              <Piece v={{ ...extraVisuals[E.id], width: STAGE_UNITS }} color={colors.podium} />
              <span>{E.name}</span>
            </div>
          )}
          <span className="cfg__height">↕ {height} см</span>
        </div>
        <p className="cfg__name">{name}</p>
        <p className="muted small center">Превью собрано из фото деталей. Оттенок на экране может немного отличаться от пластика.</p>
      </div>

      <div className="cfg__panel">
        <Steps steps={steps} active={step} onChange={setStep} />

        <div className="cfg__body">
          {step === "podium" && (
            <div className="cfg-grid">
              {podiums.map((p) => (
                <Card key={p.id} active={podium === p.id} onClick={() => setPodium(p.id)} title={p.name} sub={p.note} price={p.price} art={<Photo src={`/products/podium-${p.id}.webp`} alt="" />} />
              ))}
            </div>
          )}

          {step === "leg" && (
            <div className="cfg-grid cfg-grid--5">
              {legs.map((l) => (
                <Card key={l.id} active={mainLeg === l.id} onClick={() => setMainLeg(l.id)} title={l.name} sub={`${l.height} см`} price={l.price} art={<Photo src={`/products/leg-${l.id}.webp`} alt="" />} />
              ))}
            </div>
          )}

          {step === "top" && (
            <>
              <p className="muted small">Piccola и Pumpkin с двусторонним креплением ставятся над основной ножкой — столик становится выше.</p>
              <div className="cfg-grid">
                <Card active={topLeg === null} onClick={() => setTopLeg(null)} title="Без яруса" price={0} />
                {legs
                  .filter((l) => stackableLegs.includes(l.id))
                  .map((l) => (
                    <Card key={l.id} active={topLeg === l.id} onClick={() => setTopLeg(l.id)} title={l.name} sub={`+${l.height} см`} price={l.price} art={<Photo src={`/products/leg-${l.id}.webp`} alt="" />} />
                  ))}
              </div>
            </>
          )}

          {step === "extra" &&
            (availableExtras.length === 0 ? (
              <p className="muted">Для подиума Bonbon дополнительных деталей нет — переходите к цветам.</p>
            ) : (
              <div className="cfg-grid">
                <Card active={extra === null} onClick={() => setExtra(null)} title="Без деталей" price={0} />
                {availableExtras.map((e) => {
                  const blocked = !!e.requiresLeg && e.requiresLeg !== mainLeg;
                  return (
                    <Card
                      key={e.id}
                      active={extra === e.id}
                      disabled={blocked}
                      onClick={() => setExtra(e.id)}
                      title={e.name}
                      sub={blocked ? "Только с ножкой Grande" : e.note}
                      price={e.price}
                      art={<Photo src={e.id === "attico" ? "/products/attico.webp" : `/products/insert-${e.id}.webp`} alt="" />}
                    />
                  );
                })}
              </div>
            ))}

          {step === "colors" && (
            <>
              <div className="cfg-parts" role="tablist" aria-label="Что красим">
                {paintable.map((p) => (
                  <button key={p.id} type="button" role="tab" aria-selected={paint === p.id} className={paint === p.id ? "is-active" : ""} onClick={() => setPaint(p.id)}>
                    <i style={{ background: colorById(colors[p.id]).hex }} />
                    {p.label}
                    <small>{colorById(colors[p.id]).name}</small>
                  </button>
                ))}
              </div>
              <ColorGrid value={colors[paint]} onChange={(c) => setColors((prev) => ({ ...prev, [paint]: c }))} />
              <button type="button" className="link-btn" onClick={() => setColors((p) => ({ ...p, leg: p.podium, top: p.podium }))}>
                Сделать всё в цвет подиума
              </button>
            </>
          )}
        </div>

        <Bar
          total={total}
          code={code}
          lines={lines}
          nextLabel={next ? steps.find((s) => s.id === next)!.title : undefined}
          onNext={next ? () => setStep(next) : undefined}
          onAdd={() =>
            add({
              key: `home:${code}`,
              name: `Сборка ${name}`,
              price: total,
              details: [...lines.map(([n]) => n), `Код сборки: ${code}`],
              image: `/products/podium-${podium}.webp`,
              art: { type: "table", podium, legs: T ? [mainLeg, T.id] : [mainLeg], podiumColor: colors.podium, legColor: colors.leg, extra: extra ?? undefined },
              ref: { kind: "home", podium, legs: T ? [mainLeg, T.id] : [mainLeg], extra },
            })
          }
        />
      </div>
    </div>
  );
}

/* ---------------- Sloyka Market ---------------- */

function MarketBuilder() {
  const { add } = useCart();
  const [step, setStep] = useState("base");
  const [baseId, setBaseId] = useState(marketBases[0].id);
  const [picked, setPicked] = useState<string[]>(["marseille-25", "marseille-25"]);
  const [withCrown, setWithCrown] = useState(false);
  const [color, setColor] = useState("raspberry-yogurt");

  const base = marketBases.find((b) => b.id === baseId)!;
  const limit = maxPodiums(base);

  useEffect(() => {
    setPicked((p) => p.slice(0, limit));
  }, [limit]);

  const groups = Array.from(new Set(marketPodiums.map((p) => p.group)));
  const countOf = (id: string) => picked.filter((x) => x === id).length;

  const lines: [string, number][] = useMemo(
    () => [
      [`База ${base.name} · ${colorById(color).name}`, base.price],
      ...picked.map((id) => {
        const p = marketPodiums.find((x) => x.id === id)!;
        return [`Подиум ${p.name}`, p.price] as [string, number];
      }),
      ...(withCrown ? [[crown.name, crown.price] as [string, number]] : []),
    ],
    [base, picked, withCrown, color],
  );
  const total = lines.reduce((s, [, p]) => s + p, 0);
  const code = ["M", base.id.slice(0, 3).toUpperCase(), picked.length, withCrown ? "C" : "0", codeColor(color)].join("-");

  const steps = [
    { id: "base", title: "База", value: base.name },
    { id: "podiums", title: "Подиумы", value: `${picked.length} из ${limit}` },
    { id: "crown", title: "Корона", value: withCrown ? "да" : "нет" },
    { id: "color", title: "Цвет", value: colorById(color).name },
  ];
  const order = steps.map((s) => s.id);
  const next = order[order.indexOf(step) + 1];

  return (
    <div className="cfg__layout">
      <div className="cfg__stage-wrap">
        <div className="cfg__stage bg-stripes-sage">
          <div className="cfg__stack cfg__stack--market">
            {withCrown && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/products/decor-crown.webp" alt="" className="cfg__crown" />
            )}
            <Piece v={marketBaseVisuals[baseId]} color={color} className="cfg__piece" style={{ width: `${(marketBaseVisuals[baseId].width / 300) * 100}%` }} />
          </div>
          <span className="cfg__height">{picked.length} подиума</span>
        </div>
        <p className="cfg__name">Стенд {base.name}</p>
        <p className="muted small center">Подиумы видно в составе сборки — фото баз с подиумами добавим, когда будут снимки.</p>
      </div>

      <div className="cfg__panel">
        <Steps steps={steps} active={step} onChange={setStep} />
        <div className="cfg__body">
          {step === "base" && (
            <div className="cfg-grid">
              {marketBases.map((b) => (
                <Card key={b.id} active={baseId === b.id} onClick={() => setBaseId(b.id)} title={b.name} sub={`${b.levels} уровня`} price={b.price} art={<Photo src={`/products/base-${b.id}.webp`} alt="" />} />
              ))}
            </div>
          )}

          {step === "podiums" && (
            <>
              <p className="muted small">На эту базу помещается до {limit} подиумов.</p>
              {groups.map((g) => (
                <div key={g} className="podium-group">
                  <p className="podium-group__title">{g}</p>
                  <div className="counter-list">
                    {marketPodiums
                      .filter((p) => p.group === g)
                      .map((p) => (
                        <div key={p.id} className="counter">
                          <Photo src={`/products/podium-${p.id}.webp`} alt="" className="counter__img" />
                          <div>
                            <strong>{p.name}</strong>
                            <span className="muted small">
                              {p.specs[0]} · {formatPrice(p.price)}
                            </span>
                          </div>
                          <div className="qty qty--sm">
                            <button
                              type="button"
                              aria-label={`Убрать ${p.name}`}
                              disabled={countOf(p.id) === 0}
                              onClick={() => {
                                const i = picked.lastIndexOf(p.id);
                                setPicked((prev) => prev.filter((_, k) => k !== i));
                              }}
                            >
                              −
                            </button>
                            <span>{countOf(p.id)}</span>
                            <button type="button" aria-label={`Добавить ${p.name}`} disabled={picked.length >= limit} onClick={() => setPicked((prev) => [...prev, p.id])}>
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {step === "crown" && (
            <div className="cfg-grid">
              <Card active={!withCrown} onClick={() => setWithCrown(false)} title="Без короны" price={0} />
              <Card active={withCrown} onClick={() => setWithCrown(true)} title="Корона" sub="Маркиза и табличка 17 × 7 см под ваш логотип" price={crown.price} art={<Photo src="/products/decor-crown.webp" alt="" />} />
            </div>
          )}

          {step === "color" && <ColorGrid value={color} onChange={setColor} />}
        </div>

        <Bar
          total={total}
          code={code}
          lines={lines}
          nextLabel={next ? steps.find((s) => s.id === next)!.title : undefined}
          onNext={next ? () => setStep(next) : undefined}
          onAdd={() =>
            add({
              key: `market:${baseId}:${[...picked].sort().join("+")}:${withCrown}:${color}`,
              name: `Стенд ${base.name}`,
              price: total,
              details: [...lines.map(([n]) => n), `Код сборки: ${code}`],
              image: `/products/base-${baseId}.webp`,
              art: { type: "stand", levels: base.levels, colors: picked.slice(0, base.levels).map(() => color), crown: withCrown },
              ref: { kind: "market", base: baseId, podiums: picked, crown: withCrown },
            })
          }
        />
      </div>
    </div>
  );
}

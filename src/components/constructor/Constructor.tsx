"use client";

import { gapIn, pickedFromSlots, pruneBelow, slotReason, slotsFromPicked, validateStand } from "@/data/market-rules";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { allColors, colorById, palette } from "@/data/palette";
import {
  crown,
  homeExtras,
  legs,
  marketBases,
  marketPodiums,
  podiums,
  stackableLegs,
  type HomeExtraId,
  type LegId,
  type PodiumId,
} from "@/data/parts";
import { productBySlug } from "@/data/products";
import { STAGE_UNITS, extraVisuals, legVisuals, podiumVisuals, type PartVisual } from "@/data/visuals";
import { diademInserts, srSrc, type DiademInsert } from "@/data/stand-renders";
import { StandView } from "./StandView";
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
          Десертный столик <small>Sloyka Podium</small>
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

/** Миниатюра детали на карточке выбора: рендер в выбранном цвете (слои — снизу вверх) */
function Thumb({ layers }: { layers: { src: string; color: string }[] }) {
  const [w, h] = imageSizes[layers[0].src] ?? [1, 1];
  return (
    <span className="cfg-thumb" style={{ width: `min(100%, ${Math.round((92 * w) / h)}px)` }}>
      {layers.map((l, i) => (
        <Tinted key={l.src} base={l.src} color={colorById(l.color).hex} className={i ? "cfg-thumb__over" : ""} />
      ))}
    </span>
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

function Bar({ total, code, lines, onAdd, nextLabel, onNext, blocked }: { total: number; code: string; lines: [string, number][]; onAdd: () => void; nextLabel?: string; onNext?: () => void; /** причина, почему сборку нельзя положить в корзину */ blocked?: string | null }) {
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
          disabled={!!blocked}
          title={blocked ?? undefined}
          onClick={() => {
            if (blocked) return;
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

/* ---------------- Sloyka Podium: модульные столики ---------------- */

type Part = "podium" | "leg" | "top" | "insert" | "balls1" | "balls2";

const codeColor = (id: string) => allColors.findIndex((c) => c.id === id).toString(36);
const colorFromCode = (s: string) => allColors[parseInt(s, 36)]?.id;

function HomeBuilder() {
  const { add } = useCart();
  const [step, setStep] = useState("podium");
  const [podium, setPodium] = useState<PodiumId>("fleur");
  const [mainLeg, setMainLeg] = useState<LegId>("muff");
  const [topLeg, setTopLeg] = useState<LegId | null>("pumpkin");
  const [extra, setExtra] = useState<HomeExtraId | null>(null);
  const [colors, setColors] = useState<Record<Part, string>>({ podium: "white", leg: "cherry", top: "pumpkin-spice", insert: "white", balls1: "white", balls2: "cherry" });
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
      if (c && c.length >= 3) {
        const at = (i: number, d: string) => (c[i] ? (colorFromCode(c[i]) ?? d) : d);
        setColors({ podium: at(0, "white"), leg: at(1, "white"), top: at(2, "white"), insert: at(3, at(0, "white")), balls1: at(4, "white"), balls2: at(5, "white") });
      }
      return;
    }
    const p = productBySlug(q.get("preset") ?? "");
    const art = p?.art;
    if (p?.constructorPreset && art?.type === "table") {
      setPodium(p.constructorPreset.podium);
      setMainLeg(p.constructorPreset.legs[0]);
      setTopLeg(p.constructorPreset.legs[1] ?? null);
      setExtra(p.constructorPreset.extra ?? null);
      setColors({ podium: art.podiumColor, leg: art.legColor, top: art.legColor, insert: art.podiumColor, balls1: "white", balls2: art.legColor });
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
  const availableExtras = homeExtras.filter((e) => e.forPodium === podium && !e.hidden);

  const lines: [string, number][] = [
    [`Подиум ${P.name} · ${colorById(colors.podium).name}`, P.price],
    ...(T ? [[`Ярус ${T.name} · ${colorById(colors.top).name}`, T.price] as [string, number]] : []),
    [`Ножка ${L.name} · ${colorById(colors.leg).name}`, L.price],
    ...(E ? [[`${E.name} · ${colorById(colors.insert).name}`, E.price] as [string, number]] : []),
    ...(P.id === "bonbon" ? [[`Шарики · ${colorById(colors.balls1).name} / ${colorById(colors.balls2).name}`, 0] as [string, number]] : []),
  ];
  const total = lines.reduce((s, [, p]) => s + p, 0);
  const height = L.height + (T?.height ?? 0);
  const name = [P.name, T?.name, L.name].filter(Boolean).join(" + ");
  const code = ["H", P.id.slice(0, 3).toUpperCase(), L.id.slice(0, 3).toUpperCase(), T ? T.id.slice(0, 3).toUpperCase() : "0", E ? E.id.slice(0, 3).toUpperCase() : "0", [colors.podium, colors.leg, colors.top, colors.insert, colors.balls1, colors.balls2].map(codeColor).join("")].join("-");

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
    ...(E && E.id !== "attico" ? [{ id: "insert" as Part, label: E.name }] : []),
    ...(P.id === "bonbon" ? [{ id: "balls1" as Part, label: "Шарики ½ №1" }, { id: "balls2" as Part, label: "Шарики ½ №2" }] : []),
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
              <span key={key} className="cfg__slot" style={{ ...style, width: `${(v.width / STAGE_UNITS) * 100}%` }}>
                {/* шарики BonBon — под подиумом (в DOM раньше), вкладыш Fleur — поверх; это слои того же кадра, красятся отдельно */}
                {key === "p" &&
                  Object.entries(v.overlays ?? {})
                    .filter(([id]) => id.startsWith("balls"))
                    .map(([id, src]) => <Piece key={id} v={{ base: src, width: STAGE_UNITS, tuck: 0 }} color={id === "balls1" ? colors.balls1 : colors.balls2} className="cfg__overlay" />)}
                <Piece v={{ ...v, width: STAGE_UNITS }} color={color} className="cfg__piece" />
                {key === "p" && E && v.overlays?.[E.id] && <Piece v={{ base: v.overlays[E.id], width: STAGE_UNITS, tuck: 0 }} color={colors.insert} className="cfg__overlay" />}
              </span>
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
                <Card key={p.id} active={podium === p.id} onClick={() => setPodium(p.id)} title={p.name} sub={p.note} price={p.price} art={
                    <Thumb
                      layers={[
                        ...Object.entries(podiumVisuals[p.id].overlays ?? {})
                          .filter(([id]) => id.startsWith("balls"))
                          .map(([id, src]) => ({ src, color: id === "balls1" ? colors.balls1 : colors.balls2 })),
                        { src: podiumVisuals[p.id].base, color: colors.podium },
                      ]}
                    />
                  }
                />
              ))}
            </div>
          )}

          {step === "leg" && (
            <div className="cfg-grid cfg-grid--5">
              {legs.map((l) => (
                <Card key={l.id} active={mainLeg === l.id} onClick={() => setMainLeg(l.id)} title={l.name} sub={`${l.height} см`} price={l.price} art={<Thumb layers={[{ src: legVisuals[l.id].base, color: colors.leg }]} />} />
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
                    <Card key={l.id} active={topLeg === l.id} onClick={() => setTopLeg(l.id)} title={l.name} sub={`+${l.height} см`} price={l.price} art={<Thumb layers={[{ src: legVisuals[l.id].base, color: colors.top }]} />} />
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
                      art={e.id === "attico" ? <Photo src="/products/attico.webp" alt="" /> : <Thumb layers={[{ src: `/products/layers/extra-${e.id}/main.webp`, color: colors.insert }]} />}
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
              <button type="button" className="link-btn" onClick={() => setColors((p) => ({ ...p, leg: p.podium, top: p.podium, insert: p.podium, balls1: p.podium, balls2: p.podium }))}>
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
  // ярусы сверху вниз (заказчик, 04.11): [верхний ярус, …, ярус 1, приставной]; null — пусто
  const [slots, setSlots] = useState<(string | null)[]>(["marseille-25", "marseille-25", null]);
  const [slotColors, setSlotColors] = useState<string[]>(() => Array(4).fill("raspberry-yogurt"));
  const [active, setActive] = useState(0);
  // верх стойки: корона или диадема — либо одно, либо другое
  const [top, setTop] = useState<"none" | "crown" | "diadem">("none");
  const withCrown = top === "crown";
  // цвета (заказчик, 03.11): каждый подиум отдельно + ножки, логотип (Париж), корона
  const [color, setColor] = useState("raspberry-yogurt"); // ножки
  // корона: стойки с переходником — один цвет, шапка — 50/50 два цвета (заказчик, 03.11)
  const [extraColors, setExtraColors] = useState<Record<"logo" | "crown" | "cap1" | "cap2", string>>({ logo: "white", crown: "raspberry-yogurt", cap1: "raspberry-yogurt", cap2: "white" });
  const [paint, setPaint] = useState("legs");
  // ножки Париж: логотип в подарок, можно без него — останется вырез под наклейку (заказчик, 03.11)
  const [giftLogo, setGiftLogo] = useState(true);
  // диадема: две вставки — слева и справа, каждая для пусетов или для цепочек (заказчик, 04.11)
  const [inserts, setInserts] = useState<{ l: DiademInsert; r: DiademInsert }>({ l: "pusety", r: "chains" });
  const insertName = (id: DiademInsert) => diademInserts.find((x) => x.id === id)!.name;

  const base = marketBases.find((b) => b.id === baseId)!;
  const levels = base.levels;
  const podiumNames = useMemo(() => Object.fromEntries(marketPodiums.map((p) => [p.id, p.name])), []);

  // смена ножек: оставляем верхние ярусы, лишнее убираем, несовместимое «слетает»
  const changeBase = (id: string) => {
    const lv = marketBases.find((b) => b.id === id)!.levels;
    let next: (string | null)[] = Array(lv + 1).fill(null);
    slots.slice(0, Math.min(lv, levels)).forEach((x, k) => (next[k] = x));
    next = next.map((x, k) => (x && slotReason(id, podiumNames, next, k, x) ? null : x));
    setBaseId(id);
    setSlots(next);
    setActive(0);
  };

  // ?preset=slug готовой стойки из каталога — открываем её в конструкторе
  useEffect(() => {
    const p = productBySlug(new URLSearchParams(window.location.search).get("preset") ?? "");
    if (!p?.marketPreset) return;
    const b = marketBases.find((x) => x.id === p.marketPreset!.base)!;
    const sl = slotsFromPicked(p.marketPreset.podiums, b.levels);
    setBaseId(b.id);
    setSlots(sl);
    setTop(p.marketPreset.crown ? "crown" : sl[0] === "diadem" ? "diadem" : "none");
    setStep("podiums");
  }, []);

  const pick = (i: number, id: string | null) => {
    let next = [...slots];
    next[i] = id;
    if (id) next = pruneBelow(baseId, podiumNames, next, i);
    setSlots(next);
    // дальше — следующий пустой ярус ниже (в том числе тот, что только что «слетел»)
    const after = next.findIndex((x, k) => k > i && !x);
    if (id && after >= 0) setActive(after);
  };
  const chooseTop = (t: "none" | "crown" | "diadem") => {
    setTop(t);
    if (t === "diadem") pick(0, "diadem");
    else if (slots[0] === "diadem") pick(0, null);
  };

  const picked = pickedFromSlots(slots);
  // индекс в picked (снизу вверх) ↔ слот: для подписей и цветов
  const filled = slots.map((x, k) => (x ? k : -1)).filter((k) => k >= 0); // сверху вниз
  const slotLabel = (k: number) => (k === levels ? "Приставной" : `Ярус ${levels - k}${k === 0 ? " · верх" : ""}`);
  const gap = gapIn(slots);
  const problem =
    picked.length === 0
      ? "Выберите хотя бы один подиум"
      : gap >= 0
        ? `${slotLabel(gap)} пустой — выберите подиум или уберите те, что ниже`
        : validateStand(baseId, podiumNames, picked, withCrown);

  const lines: [string, number][] = useMemo(
    () => [
      [
        `Ножки ${base.name} · ${colorById(color).name}${base.id === "paris" ? (giftLogo ? ` · логотип в подарок, ${colorById(extraColors.logo).name}` : " · без логотипа (вырез под наклейку)") : ""}`,
        base.price,
      ],
      ...(withCrown
        ? [[`${crown.name} · стойки ${colorById(extraColors.crown).name}, шапка ${colorById(extraColors.cap1).name} / ${colorById(extraColors.cap2).name}`, crown.price] as [string, number]]
        : []),
      ...filled.map((k) => {
        const p = marketPodiums.find((x) => x.id === slots[k])!;
        const ins = p.id === "diadem" ? ` · вставки: слева ${insertName(inserts.l)}, справа ${insertName(inserts.r)}` : "";
        return [`${slotLabel(k)}: ${p.name} · ${colorById(slotColors[k] ?? color).name}${ins}`, p.price] as [string, number];
      }),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [base, slots, withCrown, color, slotColors, extraColors, giftLogo, inserts],
  );
  const paintable = [
    { id: "legs", label: `Ножки ${base.name}`, value: color },
    ...(base.id === "paris" && giftLogo ? [{ id: "logo", label: "Логотип", value: extraColors.logo }] : []),
    ...(withCrown
      ? [
          { id: "crown", label: "Корона: стойки", value: extraColors.crown },
          { id: "cap1", label: "Корона: шапка, ½ №1", value: extraColors.cap1 },
          { id: "cap2", label: "Корона: шапка, ½ №2", value: extraColors.cap2 },
        ]
      : []),
    ...filled.map((k) => ({ id: `s${k}`, label: `${slotLabel(k)} — ${podiumNames[slots[k]!]}`, value: slotColors[k] ?? color })),
  ];
  const paintNow = paintable.find((x) => x.id === paint) ?? paintable[0];
  const setPaintColor = (c: string) => {
    const id = paintNow.id;
    if (id === "legs") setColor(c);
    else if (id === "logo" || id === "crown" || id === "cap1" || id === "cap2") setExtraColors((prev) => ({ ...prev, [id]: c }));
    else setSlotColors((prev) => prev.map((x, k) => (`s${k}` === id ? c : x)));
  };
  const total = lines.reduce((s, [, p]) => s + p, 0);
  const pickedColors = [...filled].reverse().map((k) => slotColors[k] ?? color); // снизу вверх, как picked
  const code = ["M", base.id.slice(0, 3).toUpperCase(), picked.length, withCrown ? "C" : "0", [color, ...pickedColors].map(codeColor).join("")].join("-");

  const steps = [
    { id: "base", title: "Ножки", value: base.name },
    { id: "podiums", title: "Подиумы", value: `${picked.length} из ${levels + 1}` },
    { id: "color", title: "Цвета", value: new Set([color, ...pickedColors]).size > 1 ? "разные" : colorById(color).name },
  ];
  const order = steps.map((s) => s.id);
  const next = order[order.indexOf(step) + 1];
  const groups = Array.from(new Set(marketPodiums.map((p) => p.group)));
  const activeSlot = Math.min(active, levels);

  return (
    <div className="cfg__layout">
      <div className="cfg__stage-wrap">
        <div className="cfg__stage bg-stripes-sage">
          <div className="cfg__stack cfg__stack--market" key={baseId}>
            <StandView
              label={`Стенд ${base.name}`}
              base={baseId}
              slots={slots}
              inserts={inserts}
              colors={{
                legs: color,
                slots: slots.map((_, k) => slotColors[k] ?? color),
                logo: baseId === "paris" && giftLogo ? extraColors.logo : null,
                crown: withCrown ? { post: extraColors.crown, cap1: extraColors.cap1, cap2: extraColors.cap2 } : null,
              }}
            />
          </div>
          <span className="cfg__height">{picked.length} подиума</span>
        </div>
        <p className="cfg__name">Стенд {base.name}</p>
      </div>

      <div className="cfg__panel">
        <Steps steps={steps} active={step} onChange={setStep} />
        <div className="cfg__body">
          {step === "base" && (
            <>
              <div className="cfg-grid">
                {marketBases.map((b) => (
                  <Card key={b.id} active={baseId === b.id} onClick={() => changeBase(b.id)} title={b.name} sub={`${b.levels} уровня`} price={b.price} art={<StandView base={b.id} slots={[]} colors={{ legs: color, slots: [], logo: b.id === "paris" ? extraColors.logo : null }} className="cfg-stand-thumb" />} />
                ))}
              </div>
              {baseId === "paris" && (
                <label className="check" style={{ marginTop: 14 }}>
                  <input type="checkbox" checked={giftLogo} onChange={(e) => setGiftLogo(e.target.checked)} />
                  <span>
                    Ваш логотип на ножках — в подарок <small className="muted">(без него останется вырез под наклейку, цена та же)</small>
                  </span>
                </label>
              )}
            </>
          )}

          {step === "podiums" && (
            <>
              <p className="muted small">Собираем сверху вниз: сначала верх стойки, потом ярусы. Несовместимые подиумы серые — рядом написано почему.</p>
              <div className="top-pick" role="radiogroup" aria-label="Верх стойки">
                {(
                  [
                    ["none", "Без короны", 0],
                    ["crown", "Корона", crown.price],
                    ["diadem", "Диадема", marketPodiums.find((p) => p.id === "diadem")!.price],
                  ] as const
                ).map(([id, title, price]) => (
                  <button key={id} type="button" role="radio" aria-checked={top === id} className={`size ${top === id ? "is-active" : ""}`} onClick={() => chooseTop(id)}>
                    {title}
                    <small>{price ? `+${formatPrice(price)}` : "—"}</small>
                  </button>
                ))}
              </div>

              <ol className="tier-list tier-list--slots" aria-label="Ярусы сверху вниз">
                {slots.map((id, k) => (
                  <li key={k} className={`${activeSlot === k ? "is-active" : ""} ${gap === k ? "is-gap" : ""}`}>
                    <button type="button" className="tier-list__pick" onClick={() => setActive(k)} disabled={k === 0 && top === "diadem"}>
                      <span className="muted small">{slotLabel(k)}</span>
                      <b>{id ? podiumNames[id] : k === levels ? "не обязательно" : "выбрать"}</b>
                    </button>
                    {id && !(k === 0 && top === "diadem") && (
                      <button type="button" className="link-btn" onClick={() => pick(k, null)} aria-label={`Убрать ${podiumNames[id]}`}>
                        ✕
                      </button>
                    )}
                  </li>
                ))}
              </ol>
              {problem && picked.length > 0 && <p className="error">{problem}</p>}
              {slots[0] === "diadem" && (
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

              {!(activeSlot === 0 && top === "diadem") && (
                <>
                  <p className="buy__label">{slotLabel(activeSlot)}: выберите подиум</p>
                  {groups
                    .filter((g) => g !== "Диадема")
                    .map((g) => (
                      <div key={g} className="podium-group">
                        <p className="podium-group__title">{g}</p>
                        <div className="cfg-grid">
                          {marketPodiums
                            .filter((p) => p.group === g)
                            .map((p) => {
                              const why = slotReason(baseId, podiumNames, slots, activeSlot, p.id);
                              return (
                                <Card
                                  key={p.id}
                                  active={slots[activeSlot] === p.id}
                                  disabled={!!why}
                                  onClick={() => pick(activeSlot, p.id)}
                                  title={p.name}
                                  sub={why ?? p.specs[0]}
                                  price={p.price}
                                  art={<Thumb layers={[{ src: srSrc(`podium-${p.id}`), color: slotColors[activeSlot] ?? color }]} />}
                                />
                              );
                            })}
                        </div>
                      </div>
                    ))}
                </>
              )}
            </>
          )}

          {step === "color" && (
            <>
              <div className="cfg-parts" role="tablist" aria-label="Что красим">
                {paintable.map((p) => (
                  <button key={p.id} type="button" role="tab" aria-selected={paintNow.id === p.id} className={paintNow.id === p.id ? "is-active" : ""} onClick={() => setPaint(p.id)}>
                    <i style={{ background: colorById(p.value).hex }} />
                    {p.label}
                    <small>{colorById(p.value).name}</small>
                  </button>
                ))}
              </div>
              <ColorGrid value={paintNow.value} onChange={setPaintColor} />
              <button
                type="button"
                className="link-btn"
                onClick={() => {
                  setSlotColors((prev) => prev.map(() => color));
                  setExtraColors((prev) => ({ ...prev, crown: color, cap1: color, cap2: color }));
                }}
              >
                Сделать подиумы и корону в цвет ножек
              </button>
            </>
          )}
        </div>

        <Bar
          blocked={problem}
          total={total}
          code={code}
          lines={lines}
          nextLabel={next ? steps.find((s) => s.id === next)!.title : undefined}
          onNext={next ? () => setStep(next) : undefined}
          onAdd={() =>
            add({
              key: `market:${baseId}:${slots.map((id, k) => (id ? `${id}.${slotColors[k] ?? color}` : "_")).join("+")}:${slots[0] === "diadem" ? `${inserts.l}.${inserts.r}` : ""}:${withCrown}:${color}:${Object.values(extraColors).join(".")}:${baseId === "paris" && !giftLogo ? "nologo" : ""}`,
              name: `Стенд ${base.name}`,
              price: total,
              details: [...lines.map(([n]) => n), `Код сборки: ${code}`],
              image: `/products/base-${baseId}.webp`,
              art: { type: "stand", levels, colors: pickedColors.slice(-levels), crown: withCrown },
              ref: { kind: "market", base: baseId, podiums: picked, crown: withCrown },
            })
          }
        />
      </div>
    </div>
  );
}

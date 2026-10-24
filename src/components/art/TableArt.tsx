import { colorById } from "@/data/palette";
import { legs as legData, type HomeExtraId, type LegId, type PodiumId } from "@/data/parts";
import { shade } from "@/lib/format";

/**
 * Схематичная иллюстрация десертного столика Sloyka Home.
 * Используется в каталоге и конструкторе, пока нет фото комплектующих.
 * Когда заказчик пришлёт PNG без фона, можно заменить на слои картинок.
 */

type Props = {
  podium: PodiumId;
  legs: LegId[]; // снизу вверх
  podiumColor: string;
  legColor: string;
  extra?: HomeExtraId;
  className?: string;
  title?: string;
};

const CX = 120;
const GROUND = 226;
const PX_PER_CM = 6.4;

function flowerPath(cx: number, cy: number, rx: number, ry: number, lobes: number, depth: number) {
  const pts: string[] = [];
  const steps = 96;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const k = 1 - depth + depth * Math.abs(Math.cos((t * lobes) / 2));
    pts.push(`${(cx + rx * k * Math.cos(t)).toFixed(1)},${(cy + ry * k * Math.sin(t)).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
}

function Leg({ id, bottom, height, color, uid }: { id: LegId; bottom: number; height: number; color: string; uid: string }) {
  const top = bottom - height;
  const dark = shade(color, -0.18);
  const line = shade(color, -0.28);
  const clip = `${uid}-clip`;

  if (id === "piccola") {
    const ribs = [-28, -19, -10, 0, 10, 19, 28];
    return (
      <g>
        <clipPath id={clip}>
          <ellipse cx={CX} cy={top + height / 2} rx={38} ry={height / 2} />
        </clipPath>
        <ellipse cx={CX} cy={top + height / 2} rx={38} ry={height / 2} fill={color} stroke={line} strokeWidth={1} />
        <g clipPath={`url(#${clip})`} stroke={line} strokeWidth={1.2} fill="none">
          {ribs.map((d) => (
            <path key={d} d={`M${CX + d * 0.6} ${top} Q ${CX + d * 1.3} ${top + height / 2} ${CX + d * 0.6} ${bottom}`} />
          ))}
        </g>
      </g>
    );
  }

  if (id === "pumpkin") {
    return (
      <g stroke={line} strokeWidth={1}>
        <ellipse cx={CX - 20} cy={top + height / 2} rx={24} ry={height / 2} fill={dark} />
        <ellipse cx={CX + 20} cy={top + height / 2} rx={24} ry={height / 2} fill={dark} />
        <ellipse cx={CX} cy={top + height / 2} rx={26} ry={height / 2} fill={color} />
      </g>
    );
  }

  if (id === "souffle") {
    const d = `M${CX - 24} ${top} H${CX + 24} L${CX + 40} ${bottom} H${CX - 40} Z`;
    return (
      <g>
        <clipPath id={clip}>
          <path d={d} />
        </clipPath>
        <path d={d} fill={color} stroke={line} strokeWidth={1} />
        <g clipPath={`url(#${clip})`} stroke={line} strokeWidth={1.3}>
          {Array.from({ length: 14 }, (_, i) => (
            <line key={i} x1={CX - 60 + i * 9} y1={bottom} x2={CX - 30 + i * 9} y2={top} />
          ))}
        </g>
      </g>
    );
  }

  if (id === "muff") {
    const flutes = 7;
    const topW = 30;
    const botW = 44;
    return (
      <g>
        <clipPath id={clip}>
          <path d={`M${CX - topW} ${top} H${CX + topW} L${CX + botW} ${bottom + 6} H${CX - botW} Z`} />
        </clipPath>
        <path d={`M${CX - topW} ${top} H${CX + topW} L${CX + botW} ${bottom} L${CX - botW} ${bottom} Z`} fill={color} stroke={line} strokeWidth={1} />
        <g clipPath={`url(#${clip})`} stroke={dark} strokeWidth={5}>
          {Array.from({ length: flutes }, (_, i) => {
            const f = (i + 0.5) / flutes;
            return <line key={i} x1={CX - topW + f * 2 * topW} y1={top} x2={CX - botW + f * 2 * botW} y2={bottom} />;
          })}
        </g>
      </g>
    );
  }

  // grande — ваза
  const d =
    `M${CX - 30} ${top} H${CX + 30} ` +
    `C ${CX + 30} ${top + height * 0.25}, ${CX + 14} ${top + height * 0.35}, ${CX + 15} ${top + height * 0.55} ` +
    `C ${CX + 16} ${top + height * 0.78}, ${CX + 44} ${bottom - 10}, ${CX + 44} ${bottom} ` +
    `H${CX - 44} ` +
    `C ${CX - 44} ${bottom - 10}, ${CX - 16} ${top + height * 0.78}, ${CX - 15} ${top + height * 0.55} ` +
    `C ${CX - 14} ${top + height * 0.35}, ${CX - 30} ${top + height * 0.25}, ${CX - 30} ${top} Z`;
  return (
    <g>
      <clipPath id={clip}>
        <path d={d} />
      </clipPath>
      <path d={d} fill={color} stroke={line} strokeWidth={1} />
      <g clipPath={`url(#${clip})`} stroke={line} strokeWidth={1.1} fill="none">
        {[-36, -26, -17, -8, 0, 8, 17, 26, 36].map((x) => (
          <path key={x} d={`M${CX + x * 0.8} ${top} C ${CX + x * 0.35} ${top + height * 0.5}, ${CX + x * 0.4} ${top + height * 0.6}, ${CX + x * 1.15} ${bottom}`} />
        ))}
      </g>
    </g>
  );
}

function Podium({ id, y, color, extra }: { id: PodiumId; y: number; color: string; extra?: HomeExtraId }) {
  const side = shade(color, -0.2);
  const line = shade(color, -0.3);
  const inner = shade(color, -0.07);

  if (id === "bonbon") {
    const ry = 15;
    const t = 7;
    const ball = shade(color, -0.45);
    const balls = Array.from({ length: 9 }, (_, i) => {
      const a = Math.PI * (0.06 + (0.88 * i) / 8);
      return { x: CX + 92 * Math.cos(a), y: y + ry * Math.sin(a) + t };
    });
    return (
      <g>
        <ellipse cx={CX} cy={y + t} rx={92} ry={ry} fill={side} />
        <rect x={CX - 92} y={y} width={184} height={t} fill={side} />
        <ellipse cx={CX} cy={y} rx={92} ry={ry} fill={color} stroke={line} strokeWidth={1} />
        <ellipse cx={CX} cy={y} rx={82} ry={ry - 3} fill="none" stroke={inner} strokeWidth={2} />
        {balls.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={6.5} fill={ball} />
        ))}
      </g>
    );
  }

  if (id === "fleur") {
    const t = 10;
    return (
      <g>
        <path d={flowerPath(CX, y + t, 94, 22, 8, 0.12)} fill={side} />
        <path d={flowerPath(CX, y, 94, 22, 8, 0.12)} fill={color} stroke={line} strokeWidth={1} />
        <path d={flowerPath(CX, y + 1.5, 82, 18, 8, 0.12)} fill={inner} />
        {extra === "nuts" &&
          Array.from({ length: 14 }, (_, i) => (
            <ellipse key={i} cx={CX - 60 + (i % 7) * 20} cy={y - 5 + Math.floor(i / 7) * 11} rx={6} ry={3} fill={line} />
          ))}
        {extra === "flower" && <path d={flowerPath(CX, y + 1, 46, 10, 8, 0.3)} fill="none" stroke={line} strokeWidth={3} />}
        {extra === "honey" &&
          Array.from({ length: 7 }, (_, i) => (
            <ellipse key={i} cx={CX - 54 + i * 18} cy={y + 1} rx={7} ry={4} fill="none" stroke={line} strokeWidth={2} />
          ))}
      </g>
    );
  }

  // cappottina — пышный «цветок»
  const t = 26;
  return (
    <g>
      <path d={flowerPath(CX, y + t, 100, 24, 8, 0.16)} fill={side} />
      <rect x={CX - 88} y={y} width={176} height={t} fill={side} />
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse key={i} cx={CX - 76 + i * 38} cy={y + t - 2} rx={20} ry={14} fill={shade(color, -0.12)} />
      ))}
      <path d={flowerPath(CX, y, 100, 24, 8, 0.16)} fill={color} stroke={line} strokeWidth={1} />
    </g>
  );
}

export function TableArt({ podium, legs, podiumColor, legColor, extra, className, title }: Props) {
  const pc = colorById(podiumColor).hex;
  const lc = colorById(legColor).hex;
  const uid = `ta-${podium}-${legs.join("-")}-${podiumColor}-${legColor}-${extra ?? "x"}`;

  let bottom = GROUND;
  const stack = legs.map((id, i) => {
    const h = legData.find((l) => l.id === id)!.height * PX_PER_CM;
    const el = <Leg key={`${id}-${i}`} id={id} bottom={bottom} height={h} color={lc} uid={`${uid}-${i}`} />;
    bottom -= h;
    return el;
  });
  const podiumY = legs.length ? bottom - (podium === "cappottina" ? 22 : 6) : 150;

  return (
    <svg viewBox="0 0 240 240" className={className} role="img" aria-label={title ?? "Десертный столик"}>
      <ellipse cx={CX} cy={GROUND + 4} rx={70} ry={6} fill="rgba(74,46,34,0.12)" />
      {extra === "attico" && legs.includes("grande") && (
        <g>
          <path d={flowerPath(CX, GROUND - 4, 86, 18, 8, 0.16)} fill={shade(pc, -0.2)} />
          <path d={flowerPath(CX, GROUND - 16, 86, 18, 8, 0.16)} fill={pc} stroke={shade(pc, -0.3)} strokeWidth={1} />
          <path d={flowerPath(CX, GROUND - 14, 70, 13, 8, 0.16)} fill={shade(pc, -0.08)} />
        </g>
      )}
      {stack}
      <Podium id={podium} y={podiumY} color={pc} extra={extra} />
    </svg>
  );
}

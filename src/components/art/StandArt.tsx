import { colorById } from "@/data/palette";
import { shade } from "@/lib/format";

/** Схематичный стенд Sloyka Market: база-«лесенка», подиумы и корона-маркиза. */
type Props = { levels: number; colors: string[]; crown?: boolean; className?: string; title?: string };

export function StandArt({ levels, colors, crown, className, title }: Props) {
  const ground = 224;
  const stepH = levels === 1 ? 26 : 150 / (levels + (crown ? 1 : 0));
  const left = 36;
  const width = 168;
  const depthX = 22;
  const panel = "#d9c9b4";
  const panelLine = "#bba78f";
  const uid = `sa-${levels}-${colors.join("-")}-${crown ? 1 : 0}`;

  const steps = Array.from({ length: levels }, (_, i) => {
    const y = ground - (i + 1) * stepH;
    const x = left + i * depthX * 0.6;
    const w = width - i * depthX * 0.6;
    const c = colorById(colors[i] ?? "marzipan").hex;
    return { x, y, w, c };
  });

  const topY = steps.length ? steps[steps.length - 1].y : ground - 30;

  return (
    <svg viewBox="0 0 240 240" className={className} role="img" aria-label={title ?? "Стенд Sloyka Market"}>
      <defs>
        <pattern id={`${uid}-lattice`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill={panel} />
          <line x1="0" y1="0" x2="0" y2="8" stroke={panelLine} strokeWidth="2" />
          <line x1="0" y1="0" x2="8" y2="0" stroke={panelLine} strokeWidth="2" />
        </pattern>
      </defs>
      <ellipse cx={120} cy={ground + 5} rx={96} ry={6} fill="rgba(74,46,34,0.12)" />

      {levels > 1 && (
        <path
          d={
            `M${left + width} ${ground} ` +
            steps.map((s) => `V${s.y} H${s.x + s.w - 8}`).join(" ") +
            ` V${ground} Z`
          }
          transform={`translate(-4 0)`}
          fill={`url(#${uid}-lattice)`}
          stroke={panelLine}
        />
      )}

      {steps.map((s, i) => (
        <g key={i}>
          <rect x={s.x} y={s.y} width={s.w} height={10} rx={2} fill={s.c} stroke={shade(s.c, -0.25)} />
          <path
            d={`M${s.x} ${s.y + 10} ` + Array.from({ length: 8 }, (_, k) => `a ${s.w / 16} 6 0 0 0 ${s.w / 8} 0`).join(" ")}
            fill={shade(s.c, -0.06)}
            stroke={shade(s.c, -0.25)}
          />
        </g>
      ))}

      {crown && (
        <g>
          <rect x={left + 10} y={topY - 70} width={5} height={70} fill="#e8e1d6" stroke={panelLine} />
          <rect x={left + width - 15} y={topY - 70} width={5} height={70} fill="#e8e1d6" stroke={panelLine} />
          <path d={`M${left} ${topY - 72} Q 120 ${topY - 108} ${left + width} ${topY - 72} V${topY - 60} H${left} Z`} fill="#f3eee6" stroke={panelLine} />
          {Array.from({ length: 5 }, (_, i) => (
            <path
              key={i}
              d={`M${left + 17 + i * 34} ${topY - 94 + Math.abs(2 - i) * 5} L${left + 34 + i * 34} ${topY - 94 + Math.abs(2 - i) * 5} L${left + 34 + i * 34} ${topY - 60} L${left + 17 + i * 34} ${topY - 60} Z`}
              fill={i % 2 ? "#b9d3e6" : "transparent"}
            />
          ))}
          <rect x={90} y={topY - 48} width={60} height={22} rx={5} fill="#fff" stroke={panelLine} />
          <text x={120} y={topY - 33} textAnchor="middle" fontSize="10" fill="#4a2e22" fontFamily="serif">
            sloyka
          </text>
        </g>
      )}
    </svg>
  );
}

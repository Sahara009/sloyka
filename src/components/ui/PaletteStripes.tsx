"use client";

import { useState } from "react";
import { palette } from "@/data/palette";
import { Reveal } from "./Reveal";

/**
 * 25 цветов пластика — полосками, как фоны в сторис бренда.
 * Полоски «стекают» сверху при появлении, при наведении/нажатии раздвигаются и показывают название.
 */
export function PaletteStripes() {
  const all = palette.flatMap((g) => g.colors.map((c) => ({ ...c, group: g.title })));
  const [active, setActive] = useState<string | null>(null);
  const current = all.find((c) => c.id === active);

  return (
    <Reveal effect="fade" className="pstripes">
      <div className="pstripes__groups" role="list">
        {palette.map((g) => (
          <div key={g.id} className="pstripes__group" role="listitem" style={{ flexGrow: g.colors.length }}>
            <div className="pstripes__row">
              {g.colors.map((c) => {
                const i = all.findIndex((x) => x.id === c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`pstripe ${active === c.id ? "is-active" : ""}`}
                    style={{ background: c.hex, ["--d" as string]: `${i * 35}ms` }}
                    onMouseEnter={() => setActive(c.id)}
                    onFocus={() => setActive(c.id)}
                    onClick={() => setActive(c.id)}
                    aria-label={`${g.title}: ${c.name}`}
                  >
                    <span className="pstripe__name">{c.name}</span>
                  </button>
                );
              })}
            </div>
            <span className="pstripes__title">{g.title}</span>
          </div>
        ))}
      </div>
      <p className="pstripes__current" aria-live="polite">
        {current ? (
          <>
            <i style={{ background: current.hex }} /> {current.group} · <b>{current.name}</b>
          </>
        ) : (
          "Наведите на полоску, чтобы увидеть название цвета"
        )}
      </p>
    </Reveal>
  );
}

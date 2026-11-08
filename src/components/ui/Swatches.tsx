"use client";

import { palette } from "@/data/palette";

type Props = { value: string; onChange: (id: string) => void; label?: string; /** только эти цвета (акционная палитра) */ only?: string[] };

/** Выбор цвета из фирменной палитры (5 групп по 3–7 цветов) */
export function Swatches({ value, onChange, label = "Цвет", only }: Props) {
  const groups = palette.map((g) => ({ ...g, colors: only ? g.colors.filter((c) => only.includes(c.id)) : g.colors })).filter((g) => g.colors.length);
  return (
    <fieldset className="swatches">
      <legend className="swatches__legend">{label}</legend>
      {groups.map((g) => (
        <div className="swatches__group" key={g.id}>
          <span className="swatches__title">{g.title}</span>
          <div className="swatches__row">
            {g.colors.map((c) => (
              <button
                type="button"
                key={c.id}
                className={`swatch ${value === c.id ? "is-active" : ""}`}
                style={{ background: c.hex }}
                title={c.name}
                aria-label={c.name}
                aria-pressed={value === c.id}
                onClick={() => onChange(c.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </fieldset>
  );
}

"use client";

import { useState, type ReactNode } from "react";

/*
 * «Собери свой набор» — как комбо у Додо (заказчик, 08.11): каждая позиция набора — карточка
 * с картинкой и кнопкой «Заменить»; по нажатию раскрываются варианты, выбрал — карточка обновилась.
 * Используется в наборах шкатулок Cachette (модель + стиль) и в наборе Minies (форма + два цвета).
 */
export type SlotOption = { id: string; name: string; thumb: ReactNode };
export type Slot = { key: string; title: string; value: string; thumb: ReactNode; name: string; extra?: ReactNode };

export function SetSlots({ title, slots, options, onPick }: { title: string; slots: Slot[]; options: SlotOption[] | ((slot: number) => SlotOption[]); onPick: (slot: number, id: string) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="buy__block set-slots">
      <p className="buy__label">{title}</p>
      {slots.map((s, i) => (
        <div key={s.key} className={`set-slot ${open === i ? "is-open" : ""}`}>
          <div className="set-slot__row">
            <span className="set-slot__thumb">{s.thumb}</span>
            <span className="set-slot__text">
              <span className="set-slot__title">{s.title}</span>
              <b>{s.name}</b>
              {s.extra}
            </span>
            <button type="button" className="set-slot__swap" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
              {open === i ? "Готово" : "Заменить"}
            </button>
          </div>
          {open === i && (
            <div className="set-slot__options" role="radiogroup" aria-label={s.title}>
              {(typeof options === "function" ? options(i) : options).map((o) => (
                <button
                  key={o.id}
                  type="button"
                  role="radio"
                  aria-checked={o.id === s.value}
                  className={`set-opt ${o.id === s.value ? "is-active" : ""}`}
                  onClick={() => {
                    onPick(i, o.id);
                    setOpen(null);
                  }}
                >
                  <span className="set-opt__thumb">{o.thumb}</span>
                  <span>{o.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

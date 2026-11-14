"use client";

import { useEffect, useMemo, useState } from "react";
import { palette } from "@/data/palette";
import { Tinted } from "@/components/ui/Tinted";

/** Рендеры-образцы: на них видно, как цвет ложится на изделие на сайте */
const samples = [
  { id: "fleur", label: "Подиум Fleur", src: "/products/base/podium-fleur.webp" },
  { id: "muff", label: "Ножка Muff", src: "/products/base/leg-muff.webp" },
  { id: "bonbon", label: "Подиум BonBon", src: "/products/base/podium-bonbon.webp" },
  { id: "minies", label: "Minies", src: "/products/layers/minies-flower/top.webp" },
  { id: "babylon", label: "Ножки Вавилон", src: "/products/stand/legs-babylon-l.webp" },
  { id: "marseille", label: "Подиум Марсель", src: "/products/stand/podium-marseille-25.webp" },
];

const KEY = "sloyka_admin_colors";
const all = palette.flatMap((g) => g.colors.map((c) => ({ ...c, group: g.title })));
const isHex = (v: string) => /^#[0-9a-f]{6}$/i.test(v);

export function ColorTuner() {
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [picked, setPicked] = useState<string[]>(["fleur", "muff"]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setEdits(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(edits));
    } catch {}
  }, [edits]);

  const changed = useMemo(() => all.filter((c) => edits[c.id] && edits[c.id].toUpperCase() !== c.hex.toUpperCase()), [edits]);
  const hexOf = (id: string, def: string) => edits[id] ?? def;

  const copy = async () => {
    const text = changed.map((c) => `${c.id} — ${c.name}: ${c.hex.toUpperCase()} → ${edits[c.id].toUpperCase()}`).join("\n");
    try {
      await navigator.clipboard.writeText(text || "Изменений нет");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Скопируйте текст:", text);
    }
  };

  return (
    <div className="ctune">
      <div className="ctune__bar">
        <span className="muted small">Образцы:</span>
        {samples.map((s) => (
          <label key={s.id} className="check">
            <input
              type="checkbox"
              checked={picked.includes(s.id)}
              onChange={(e) => setPicked((p) => (e.target.checked ? [...p, s.id] : p.filter((x) => x !== s.id)))}
            />
            <span>{s.label}</span>
          </label>
        ))}
        <span className="ctune__spacer" />
        <span className="muted small">Изменено: {changed.length}</span>
        <button type="button" className="btn btn--sm" onClick={copy} disabled={!changed.length}>
          {copied ? "Скопировано" : "Скопировать изменения"}
        </button>
        {changed.length > 0 && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => confirmReset() && setEdits({})}>
            Сбросить всё
          </button>
        )}
      </div>

      {palette.map((g) => (
        <section key={g.id} className="admin-box">
          <h2>
            {g.title} <small className="muted">{g.subtitle}</small>
          </h2>
          {g.colors.map((c) => {
            const hex = hexOf(c.id, c.hex);
            const dirty = hex.toUpperCase() !== c.hex.toUpperCase();
            return (
              <div key={c.id} className={`ctune__row${dirty ? " is-dirty" : ""}`}>
                <div className="ctune__ctl">
                  <b>{c.name}</b>
                  <span className="muted small">
                    было {c.hex.toUpperCase()}
                    {dirty && <> → {hex.toUpperCase()}</>}
                  </span>
                  <div className="ctune__inputs">
                    <input type="color" value={isHex(hex) ? hex : c.hex} onChange={(e) => setEdits((p) => ({ ...p, [c.id]: e.target.value }))} />
                    <input
                      type="text"
                      value={hex}
                      maxLength={7}
                      onChange={(e) => {
                        const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
                        setEdits((p) => ({ ...p, [c.id]: v }));
                      }}
                    />
                    {dirty && (
                      <button
                        type="button"
                        className="btn btn--ghost btn--sm"
                        onClick={() =>
                          setEdits((p) => {
                            const n = { ...p };
                            delete n[c.id];
                            return n;
                          })
                        }
                      >
                        Вернуть
                      </button>
                    )}
                  </div>
                </div>
                <div className="ctune__samples">
                  {samples
                    .filter((s) => picked.includes(s.id))
                    .map((s) => (
                      <Tinted key={s.id} base={s.src} color={isHex(hex) ? hex : c.hex} className="ctune__sample" alt={`${s.label} — ${c.name}`} />
                    ))}
                </div>
                <label className="ctune__photo">
                  {photos[c.id] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photos[c.id]} alt={`Фото: ${c.name}`} />
                  ) : (
                    <span className="muted small">+ фото для сравнения</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setPhotos((p) => ({ ...p, [c.id]: URL.createObjectURL(f) }));
                    }}
                  />
                </label>
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}

function confirmReset() {
  return window.confirm("Вернуть все цвета как было?");
}

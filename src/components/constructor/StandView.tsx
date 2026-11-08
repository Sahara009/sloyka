"use client";

import { useMemo } from "react";
import { Tinted } from "@/components/ui/Tinted";
import { colorById } from "@/data/palette";
import { standScene, type StandSceneInput } from "@/data/stand-renders";

/** Стойка Sloyka Market из отдельных рендеров деталей: каждая деталь на своём месте и в своём цвете */
export function StandView({ className, label, ...input }: StandSceneInput & { className?: string; label?: string }) {
  const key = JSON.stringify(input);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { layers, box } = useMemo(() => standScene(input), [key]);
  return (
    <span className={`stand-view ${className ?? ""}`} style={{ aspectRatio: `${box.w} / ${box.h}`, ["--a" as string]: (box.w / box.h).toFixed(3) }} role={label ? "img" : undefined} aria-label={label}>
      {layers.map((l) => (
        <Tinted
          key={l.key}
          base={l.src}
          color={colorById(l.color).hex}
          className="stand-view__part"
          style={{ left: `${((l.x - box.x) / box.w) * 100}%`, top: `${((l.y - box.y) / box.h) * 100}%`, width: `${(l.w / box.w) * 100}%` }}
        />
      ))}
    </span>
  );
}

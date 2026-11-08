"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoLayers, logoLetters, logoNozzle, logoViewBox, logoYBody } from "@/components/ui/logo-paths";

/*
 * Большой логотип в подвале: когда подвал появляется на экране, буквы s-l-o-y-k-a
 * по одной «выезжают» снизу. Без JS и при «уменьшить движение» логотип просто виден целиком.
 */

// logoLetters — один путь из контуров; делим на буквы по положению контура по X (o и a — с «дыркой», это два контура)
const contours = logoLetters.match(/M[^M]*/g) ?? [];
const startX = (d: string) => parseFloat(d.slice(1));
const letterOf = (x: number) => (x < 100 ? "s" : x < 170 ? "l" : x < 300 ? "o" : x < 540 ? "k" : "a");
const byLetter = (id: string) => contours.filter((c) => letterOf(startX(c)) === id).join("");

const order = ["s", "l", "o", "y", "k", "a"] as const;

export function FooterLogo() {
  const ref = useRef<HTMLAnchorElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <Link href="/" ref={ref} aria-label="Sloyka — на главную" className={`flogo ${shown ? "is-in" : ""}`}>
      <svg viewBox={logoViewBox} className="footer__giant alogo alogo--light" role="img" aria-label="Sloyka">
        {order.map((id, i) =>
          id === "y" ? (
            <g key={id} className="flogo__l" style={{ ["--i" as string]: i }}>
              <path d={logoYBody} className="alogo__y" />
              {logoLayers.map((l, k) => (
                <path key={k} d={l.d} className="alogo__y" />
              ))}
              <path d={logoNozzle} className="alogo__nozzle" fillRule="evenodd" />
            </g>
          ) : (
            <g key={id} className="flogo__l" style={{ ["--i" as string]: i }}>
              <path d={byLetter(id)} className="alogo__letters" fillRule="evenodd" />
            </g>
          ),
        )}
      </svg>
    </Link>
  );
}

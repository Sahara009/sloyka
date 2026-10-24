"use client";

import { useEffect, useState } from "react";

const plural = (n: number, forms: [string, string, string]) => {
  const a = n % 100;
  const b = n % 10;
  if (a > 10 && a < 20) return forms[2];
  if (b === 1) return forms[0];
  if (b >= 2 && b <= 4) return forms[1];
  return forms[2];
};

/** «До Хэллоуина 8 дней» — считаем в браузере, чтобы цифра не застревала в кэше страницы */
export function Countdown() {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let target = new Date(now.getFullYear(), 9, 31);
    if (today > target) target = new Date(now.getFullYear() + 1, 9, 31);
    setDays(Math.round((target.getTime() - today.getTime()) / 86400000));
  }, []);
  if (days === null) return null;
  return (
    <span className="hw__count">
      {days === 0 ? (
        "Сегодня Хэллоуин!"
      ) : (
        <>
          до Хэллоуина <b>{days}</b> {plural(days, ["день", "дня", "дней"])}
        </>
      )}
    </span>
  );
}

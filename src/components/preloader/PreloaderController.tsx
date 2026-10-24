"use client";

import { useEffect } from "react";

const MIN_VISIBLE = 2950; // успеть увидеть, как стекает глазурь и насадка печатает логотип
const LEAVE_DURATION = 1300; // длина анимации ухода в CSS
export const PRELOADED_EVENT = "sloyka:preloaded";

/** Убирает прелоадер, когда страница загрузилась, и сообщает об этом анимациям появления */
export function PreloaderController() {
  useEffect(() => {
    const root = document.documentElement;
    const el = document.getElementById("preloader");

    const finish = () => {
      root.classList.remove("is-preloading");
      root.classList.add("no-preload");
      window.dispatchEvent(new Event(PRELOADED_EVENT));
    };

    if (!el || !root.classList.contains("is-preloading")) {
      finish();
      return;
    }

    const started = performance.now();
    let leaveTimer: number | undefined;
    let doneTimer: number | undefined;
    let leaving = false;

    const leave = () => {
      if (leaving) return;
      leaving = true;
      const wait = Math.max(0, MIN_VISIBLE - (performance.now() - started));
      leaveTimer = window.setTimeout(() => {
        el.classList.add("is-leaving");
        try {
          sessionStorage.setItem("sloyka_preloaded", "1");
        } catch {
          /* приватный режим — покажем ещё раз, не страшно */
        }
        // сайт начинает появляться, пока глазурь ещё стекает
        window.setTimeout(() => window.dispatchEvent(new Event(PRELOADED_EVENT)), LEAVE_DURATION * 0.45);
        doneTimer = window.setTimeout(finish, LEAVE_DURATION);
      }, wait);
    };

    if (document.readyState === "complete") leave();
    else window.addEventListener("load", leave, { once: true });

    // страховка: даже если какая-то картинка грузится вечно, через 4 с открываем сайт
    const safety = window.setTimeout(leave, 4000);

    return () => {
      window.removeEventListener("load", leave);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(doneTimer);
      window.clearTimeout(safety);
    };
  }, []);

  return null;
}

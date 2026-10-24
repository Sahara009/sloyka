"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { DEMO } from "@/lib/demo";

/** Заявка на индивидуальный заказ / вопрос. Отправляется на /api/requests */
export function RequestForm({ topic = "Индивидуальный заказ" }: { topic?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setState("sending");
    if (DEMO) {
      setTimeout(() => setState("done"), 500);
      return;
    }
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, topic }),
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return <p className="form-done">{DEMO ? "Спасибо! (демо: заявка никуда не отправлена)" : "Спасибо! Мы ответим в течение рабочего дня."}</p>;
  }

  return (
    <form className="request-form" onSubmit={onSubmit}>
      <label className="field">
        <span>Имя</span>
        <input name="name" required autoComplete="name" />
      </label>
      <label className="field">
        <span>Телефон или Telegram</span>
        <input name="contact" required />
      </label>
      <label className="field">
        <span>Что хотите сделать</span>
        <textarea name="message" rows={4} placeholder="Например: стенд Париж с нашим логотипом, вывеска 25 × 25 см" />
      </label>
      <label className="check">
        <input type="checkbox" name="pd" required />
        <span>
          Даю <Link href="/legal/consent">согласие на обработку персональных данных</Link>
        </span>
      </label>
      <button className="btn" disabled={state === "sending"}>
        {state === "sending" ? "Отправляем…" : "Отправить заявку"}
      </button>
      {state === "error" && <p className="error">Не получилось отправить. Напишите нам в Telegram.</p>}
    </form>
  );
}

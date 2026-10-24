"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { faq } from "@/data/faq";
import { site } from "@/lib/format";
import { Reveal } from "./Reveal";

type Msg = { from: "me" | "sloyka"; text: string; id: number };

/**
 * «Вопросы и ответы» в формате переписки: нажимаешь на вопрос — он улетает в чат,
 * Sloyka «печатает…» и отвечает. Все ответы дублируются скрытым списком и JSON-LD для поисковиков.
 */
export function Faq() {
  const [topic, setTopic] = useState(faq[0].id);
  const [asked, setAsked] = useState<string[]>([faq[0].items[0].q]);
  const [msgs, setMsgs] = useState<Msg[]>([
    { from: "sloyka", text: "Привет! Это Sloyka 🧁 Выберите вопрос ниже — отвечу сразу.", id: 0 },
    { from: "me", text: faq[0].items[0].q, id: 1 },
    { from: "sloyka", text: faq[0].items[0].a, id: 2 },
  ]);
  const [typing, setTyping] = useState(false);
  const body = useRef<HTMLDivElement>(null);
  const nextId = useRef(3);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = body.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  const ask = (q: string, a: string) => {
    if (typing) return;
    setAsked((x) => [...x, q]);
    setMsgs((m) => [...m, { from: "me", text: q, id: nextId.current++ }]);
    setTyping(true);
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650 + Math.min(900, a.length * 6);
    setTimeout(() => {
      setTyping(false);
      setMsgs((m) => [...m, { from: "sloyka", text: a, id: nextId.current++ }]);
    }, delay);
  };

  const current = faq.find((t) => t.id === topic)!;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.flatMap((t) => t.items).map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };

  return (
    <section className="section faq" aria-labelledby="faq-title">
      <div className="container faq__grid">
        <Reveal className="faq__intro">
          <p className="eyebrow">Вопросы и ответы</p>
          <h2 id="faq-title">
            Спросите <span className="script">Слойку</span>
          </h2>
          <p className="muted">Самое частое из директа — в формате переписки. Выберите тему и нажмите на вопрос.</p>
          <div className="faq__topics" role="tablist" aria-label="Темы">
            {faq.map((t) => (
              <button key={t.id} type="button" role="tab" aria-selected={topic === t.id} className={`faq__topic ${topic === t.id ? "is-active" : ""}`} onClick={() => setTopic(t.id)}>
                <span aria-hidden="true">{t.emoji}</span> {t.title}
              </button>
            ))}
          </div>
          <p className="small muted">
            Не нашли ответ?{" "}
            <a href={site.instagram} target="_blank" rel="noreferrer">
              Напишите в директ
            </a>{" "}
            или <Link href="/contacts">в контакты</Link>.
          </p>
        </Reveal>

        <Reveal effect="up" delay={120} className="chat">
          <div className="chat__head">
            <span className="chat__avatar" aria-hidden="true">
              <img src="/logo.svg" alt="" />
            </span>
            <span>
              <b>Sloyka</b>
              <small>{typing ? "печатает…" : "онлайн · отвечает быстро"}</small>
            </span>
          </div>
          <div className="chat__body" ref={body} aria-live="polite">
            {msgs.map((m) => (
              <p key={m.id} className={`bubble bubble--${m.from}`}>
                {m.text}
              </p>
            ))}
            {typing && (
              <p className="bubble bubble--sloyka bubble--typing" aria-label="Sloyka печатает">
                <i />
                <i />
                <i />
              </p>
            )}
          </div>
          <div className="chat__replies">
            {current.items.map((i) => (
              <button key={i.q} type="button" className={`chat__chip ${asked.includes(i.q) ? "is-asked" : ""}`} onClick={() => ask(i.q, i.a)} disabled={typing}>
                {i.q}
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      {/* для поисковиков и экранных читалок — все вопросы списком */}
      <dl className="sr-only">
        {faq.flatMap((t) => t.items).map((i) => (
          <div key={i.q}>
            <dt>{i.q}</dt>
            <dd>{i.a}</dd>
          </div>
        ))}
      </dl>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </section>
  );
}

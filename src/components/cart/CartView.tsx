"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ProductArt } from "@/components/art/ProductArt";
import { Photo } from "@/components/ui/Photo";
import { DEMO, demoQuote } from "@/lib/demo";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";

const deliveryOptions = [
  { id: "cdek-pvz", label: "СДЭК — пункт выдачи", hint: "Точная цена по тарифу СДЭК" },
  { id: "cdek-courier", label: "СДЭК — курьер", hint: "До двери" },
  { id: "ozon-pvz", label: "Ozon — пункт выдачи", hint: "Примерно, по зоне" },
  { id: "wb-pvz", label: "Wildberries — пункт выдачи", hint: "Примерно, по зоне" },
];

type QuoteOption = { method: string; price?: number; min?: number; max?: number; days: [number, number]; approx: boolean };
type Quote = { zone: string; weight: number; boxes: { id: string; name: string; size: string }[]; options: QuoteOption[] };

const quoteText = (o?: QuoteOption) =>
  !o ? "" : o.price !== undefined ? formatPrice(o.price) : `≈ ${formatPrice(o.min ?? 0).replace(/\s₽$/, "")}–${formatPrice(o.max ?? 0)}`;

type Status = { type: "idle" } | { type: "sending" } | { type: "done"; orderId: string; paymentUrl?: string } | { type: "error"; message: string };

export function CartView() {
  const { items, total, setQty, remove, clear } = useCart();
  const [delivery, setDelivery] = useState(deliveryOptions[0].id);
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [city, setCity] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);

  // примерная доставка: пересчитываем, когда покупатель ввёл город или поменял корзину
  const refs = items.map((i) => ({ qty: i.qty, ref: i.ref ?? (i.slug ? { kind: "product", slug: i.slug } : undefined) })).filter((i) => i.ref);
  const refsKey = JSON.stringify(refs);
  useEffect(() => {
    if (city.trim().length < 3 || refs.length === 0) {
      setQuote(null);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setQuoting(true);
      try {
        if (DEMO) {
          setQuote(demoQuote(city, refs as never));
          return;
        }
        const res = await fetch("/api/delivery/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city, items: refs }),
          signal: ctrl.signal,
        });
        setQuote(res.ok ? await res.json() : null);
      } catch {
        /* отменён или сеть — просто не показываем */
      } finally {
        setQuoting(false);
      }
    }, 500);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city, refsKey]);
  const chosen = quote?.options.find((o) => o.method === delivery);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus({ type: "sending" });
    try {
      if (DEMO) {
        // демо: заказ никуда не отправляем
        await new Promise((r) => setTimeout(r, 600));
        setStatus({ type: "done", orderId: "DEMO-001" });
        return;
      }
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.get("name"),
            phone: form.get("phone"),
            email: form.get("email"),
          },
          delivery: { method: delivery, city, address: String(form.get("address") ?? ""), quote: chosen ? quoteText(chosen) : undefined },
          comment: String(form.get("comment") ?? "") || undefined,
          consents: { personalData: form.get("pd") === "on", offer: form.get("offer") === "on" },
          // ref — состав позиции, по нему сервер сам считает цену
          items: items.map((i) => ({
            name: i.name,
            price: i.price,
            qty: i.qty,
            details: i.details,
            ref: i.ref ?? (i.slug ? { kind: "product", slug: i.slug } : undefined),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Не получилось оформить заказ");
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      clear();
      setStatus({ type: "done", orderId: data.orderId });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Ошибка" });
    }
  };

  if (status.type === "done") {
    return (
      <div className="empty">
        <h2>Спасибо, заказ №{status.orderId} принят!</h2>
        <p>{DEMO ? "Это демо-версия: заказ никуда не отправлен. На рабочем сайте здесь будет оплата и письмо с подтверждением." : "Мы свяжемся с вами, чтобы подтвердить детали и сроки изготовления."}</p>
        <Link className="btn" href="/catalog">
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty">
        <h2>
          Корзина пока <span className="script">пустая</span>
        </h2>
        <p>Соберите свой столик в конструкторе или выберите готовую сборку.</p>
        <div className="row-gap">
          <Link className="btn" href="/constructor">
            В конструктор
          </Link>
          <Link className="btn btn--ghost" href="/catalog">
            В каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      <ul className="cart__list">
        {items.map((i) => (
          <li key={i.key} className="cart__item">
            <div className="cart__art">{i.image ? <Photo src={i.image} alt={i.name} /> : i.art && <ProductArt art={i.art} />}</div>
            <div>
              <p className="cart__name">{i.name}</p>
              {i.details && (
                <ul className="cart__details">
                  {i.details.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              )}
              <button type="button" className="link-btn" onClick={() => remove(i.key)}>
                Удалить
              </button>
            </div>
            <div className="cart__right">
              <div className="qty qty--sm">
                <button type="button" onClick={() => setQty(i.key, i.qty - 1)} aria-label="Меньше">
                  −
                </button>
                <span>{i.qty}</span>
                <button type="button" onClick={() => setQty(i.key, i.qty + 1)} aria-label="Больше">
                  +
                </button>
              </div>
              <strong>{formatPrice(i.price * i.qty)}</strong>
            </div>
          </li>
        ))}
      </ul>

      <form className="checkout" onSubmit={onSubmit}>
        <h2>Оформление</h2>
        <label className="field">
          <span>Имя</span>
          <input name="name" required autoComplete="name" />
        </label>
        <label className="field">
          <span>Телефон</span>
          <input name="phone" type="tel" required autoComplete="tel" placeholder="+7" />
        </label>
        <label className="field">
          <span>Email для чека</span>
          <input name="email" type="email" required autoComplete="email" />
        </label>

        <label className="field">
          <span>Город</span>
          <input name="city" required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Например, Москва" autoComplete="address-level2" />
        </label>
        <fieldset className="field">
          <span>Доставка {quoting && <small className="muted">· считаем…</small>}</span>
          {deliveryOptions.map((o) => {
            const q = quote?.options.find((x) => x.method === o.id);
            return (
              <label key={o.id} className={`radio ${delivery === o.id ? "is-active" : ""}`}>
                <input type="radio" name="delivery" value={o.id} checked={delivery === o.id} onChange={() => setDelivery(o.id)} />
                <span>
                  {o.label}
                  <small>{q ? `${q.days[0]}–${q.days[1]} дн.` : o.hint}</small>
                </span>
                {q && <b className="radio__price">{quoteText(q)}</b>}
              </label>
            );
          })}
          {quote && (
            <small className="muted">
              {quote.zone} · {quote.boxes.map((b) => b.name).join(" + ")} · ≈ {(quote.weight / 1000).toFixed(1)} кг
            </small>
          )}
        </fieldset>
        {/* TODO: заменить на виджет выбора ПВЗ СДЭК / Ozon */}
        <label className="field">
          <span>{delivery === "cdek-courier" ? "Адрес доставки" : "Адрес пункта выдачи"}</span>
          <input name="address" required />
        </label>
        <label className="field">
          <span>Комментарий</span>
          <textarea name="comment" rows={3} />
        </label>

        <div className="checkout__total">
          <span>Товары</span>
          <strong>{formatPrice(total)}</strong>
        </div>
        {chosen && (
          <div className="checkout__total checkout__total--sub">
            <span>Доставка</span>
            <span>{quoteText(chosen)}</span>
          </div>
        )}
        <p className="muted small">
          Сейчас оплачиваются товары. Доставку {chosen?.approx === false ? "по тарифу СДЭК" : "(значок ≈ — примерная цена)"} менеджер подтвердит
          после сборки заказа, когда коробка будет взвешена.
        </p>

        <label className="check">
          <input type="checkbox" name="pd" required />
          <span>
            Даю <Link href="/legal/consent">согласие на обработку персональных данных</Link>
          </span>
        </label>
        <label className="check">
          <input type="checkbox" name="offer" required />
          <span>
            Принимаю условия <Link href="/legal/offer">публичной оферты</Link>
          </span>
        </label>

        <button className="btn btn--block" disabled={status.type === "sending"}>
          {status.type === "sending" ? "Отправляем…" : `Оплатить ${formatPrice(total)} · карта или СБП`}
        </button>
        {status.type === "error" && <p className="error">{status.message}</p>}
      </form>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ProductArt } from "@/components/art/ProductArt";
import { Photo } from "@/components/ui/Photo";
import { DEMO, demoQuote } from "@/lib/demo";
import { applyPromoCode, findPromoCode } from "@/data/promocodes";
import { MIN_ORDER_TOTAL } from "@/data/settings";
import { formatPrice } from "@/lib/format";
import { useCart } from "./CartProvider";

const deliveryOptions = [
  { id: "cdek-pvz", label: "СДЭК — пункт выдачи", hint: "Цена по тарифу СДЭК, входит в оплату" },
  { id: "cdek-courier", label: "СДЭК — курьер до двери", hint: "Цена по тарифу СДЭК, входит в оплату" },
  { id: "ozon-pvz", label: "Ozon — пункт выдачи", hint: "Оплачивается отдельно, оформим в Telegram или Instagram" },
  { id: "wb-pvz", label: "Wildberries — пункт выдачи", hint: "Оплачивается отдельно, оформим в Telegram или Instagram" },
];

type QuoteOption = { method: string; price?: number; min?: number; max?: number; days: [number, number]; approx: boolean };
type Quote = { zone: string; weight: number; boxes: { id: string; name: string; size: string }[]; options: QuoteOption[] };

const quoteText = (o?: QuoteOption) =>
  !o ? "" : o.price !== undefined ? formatPrice(o.price) : `≈ ${formatPrice(o.min ?? 0).replace(/\s₽$/, "")}–${formatPrice(o.max ?? 0)}`;

type Status =
  | { type: "idle" }
  | { type: "sending" }
  | { type: "checking" }
  | { type: "done"; orderId: string; paid?: boolean; pending?: boolean }
  | { type: "error"; message: string };

type City = { code: number; name: string };
type Point = { code: string; name: string; address: string; workTime?: string };
/** id платежа, пока покупатель на странице ЮKassa — чтобы после возврата проверить, прошла ли оплата */
const PAY_KEY = "sloyka_payment";

export function CartView() {
  const { items, total, setQty, remove, clear } = useCart();
  const [delivery, setDelivery] = useState(deliveryOptions[0].id);
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [city, setCity] = useState("");
  // город из подсказок СДЭК: по коду считается доставка и ищутся пункты выдачи
  const [cityCode, setCityCode] = useState<number | null>(null);
  const [suggest, setSuggest] = useState<City[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  // null — ещё не знаем, подключён ли СДЭК (без ключей и в демо — ввод города и адреса вручную)
  const [cdekOn, setCdekOn] = useState<boolean | null>(DEMO ? false : null);
  const [points, setPoints] = useState<Point[] | null>(null);
  const [pointsError, setPointsError] = useState("");
  const [pointQuery, setPointQuery] = useState("");
  const [pointCode, setPointCode] = useState<string | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoMsg, setPromoMsg] = useState("");

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
          body: JSON.stringify({ city, cityCode: cityCode ?? undefined, items: refs }),
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
  }, [city, cityCode, refsKey]);

  // подсказки городов СДЭК, пока покупатель печатает
  useEffect(() => {
    if (DEMO || cdekOn === false || cityCode || city.trim().length < 2) {
      setSuggest([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/delivery/cities?q=${encodeURIComponent(city.trim())}`, { signal: ctrl.signal });
        const data = (await res.json()) as { cities: City[]; configured: boolean };
        setCdekOn(data.configured);
        setSuggest(data.cities);
        setSuggestOpen(true);
      } catch {
        /* отменён или сеть */
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [city, cityCode, cdekOn]);

  // пункты выдачи СДЭК в выбранном городе
  useEffect(() => {
    setPointCode(null);
    setPointQuery("");
    setPoints(null);
    setPointsError("");
    if (!cityCode) return;
    const ctrl = new AbortController();
    fetch(`/api/delivery/points?city=${cityCode}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d: { points: Point[]; error?: string }) => {
        setPoints(d.points);
        if (d.error) setPointsError(d.error);
        else if (!d.points.length) setPointsError("В этом городе нет пунктов выдачи СДЭК — выберите курьера");
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, [cityCode]);

  // вернулись со страницы оплаты ЮKassa: /cart?paid=SL-… — проверяем, прошла ли оплата
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const number = q.get("paid");
    if (!number) return;
    let saved: { id?: string; order?: string } = {};
    try {
      saved = JSON.parse(sessionStorage.getItem(PAY_KEY) ?? "{}");
    } catch {}
    if (!saved.id || saved.order !== number) {
      setStatus({ type: "done", orderId: number, pending: true });
      return;
    }
    setStatus({ type: "checking" });
    fetch(`/api/payments/yookassa?id=${encodeURIComponent(saved.id)}`)
      .then((r) => r.json())
      .then((d: { status: string; paid?: boolean }) => {
        if (d.status === "succeeded") {
          clear();
          try {
            sessionStorage.removeItem(PAY_KEY);
          } catch {}
          setStatus({ type: "done", orderId: number, paid: true });
        } else if (d.status === "canceled") {
          setStatus({ type: "error", message: `Оплата заказа №${number} не прошла. Корзина сохранена — можно попробовать ещё раз.` });
        } else {
          setStatus({ type: "done", orderId: number, pending: true });
        }
      })
      .catch(() => setStatus({ type: "done", orderId: number, pending: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chosen = quote?.options.find((o) => o.method === delivery);
  const isCdek = delivery === "cdek-pvz" || delivery === "cdek-courier";
  const isMarket = delivery === "ozon-pvz" || delivery === "wb-pvz";
  const marketName = delivery === "ozon-pvz" ? "Ozon" : "Wildberries";
  // СДЭК с точной ценой — доставка входит в оплату
  const deliveryInPay = isCdek && chosen && !chosen.approx && chosen.price !== undefined ? chosen.price : 0;
  const pickList = !!(cdekOn && delivery === "cdek-pvz");
  const pointsShown = (points ?? []).filter((p) => !pointQuery.trim() || `${p.address} ${p.name}`.toLowerCase().includes(pointQuery.trim().toLowerCase())).slice(0, 80);
  const pickedPoint = points?.find((p) => p.code === pointCode);
  // промокод и минимальная сумма — сервер проверяет то же самое
  const cartLines = items.map((i) => ({ ref: (i.ref ?? (i.slug ? { kind: "product" as const, slug: i.slug } : undefined)) as never, price: i.price, qty: i.qty }));
  const promo = applyPromoCode(promoCode, cartLines);
  const toPay = total - promo.discount + deliveryInPay;
  const belowMin = MIN_ORDER_TOTAL > 0 && total < MIN_ORDER_TOTAL;
  const applyCode = () => {
    const c = findPromoCode(promoInput);
    if (!c) {
      setPromoCode("");
      setPromoMsg("Такого промокода нет или он уже не действует");
      return;
    }
    setPromoCode(promoInput);
    setPromoMsg(applyPromoCode(promoInput, cartLines).discount > 0 ? `Промокод применён: −${c.amount} ₽ на ${c.note}` : `Промокод действует на ${c.note} — добавьте его в корзину`);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (cdekOn && isCdek && !cityCode) {
      setStatus({ type: "error", message: "Выберите город из подсказок под полем «Город»" });
      return;
    }
    if (pickList && !pointCode) {
      setStatus({ type: "error", message: "Выберите пункт выдачи СДЭК из списка" });
      return;
    }
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
          delivery: {
            method: delivery,
            city,
            cityCode: cityCode ?? undefined,
            pointCode: pickList ? (pointCode ?? undefined) : undefined,
            address: pickList ? (pickedPoint?.address ?? "") : String(form.get("address") ?? ""),
            marketplacePhone: isMarket ? String(form.get("mpPhone") ?? "") : undefined,
            quote: chosen ? quoteText(chosen) : undefined,
          },
          comment: String(form.get("comment") ?? "") || undefined,
          promoCode: promoCode || undefined,
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
        try {
          sessionStorage.setItem(PAY_KEY, JSON.stringify({ id: data.paymentId, order: data.orderId }));
        } catch {}
        window.location.href = data.paymentUrl;
        return;
      }
      clear();
      setStatus({ type: "done", orderId: data.orderId });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Ошибка" });
    }
  };

  if (status.type === "checking") {
    return (
      <div className="empty">
        <h2>Проверяем оплату…</h2>
        <p className="muted">Это займёт пару секунд.</p>
      </div>
    );
  }

  if (status.type === "done") {
    return (
      <div className="empty">
        <h2>{status.paid ? `Спасибо! Заказ №${status.orderId} оплачен` : `Спасибо, заказ №${status.orderId} принят!`}</h2>
        <p>
          {DEMO
            ? "Это демо-версия: заказ никуда не отправлен. На рабочем сайте здесь будет оплата и письмо с подтверждением."
            : status.paid
              ? "Чек придёт на почту. Мы напишем, когда заказ будет готов к отправке."
              : status.pending
                ? "Если оплата прошла, чек придёт на почту в течение нескольких минут. Если что-то пошло не так — напишите нам в Telegram."
                : "Мы свяжемся с вами, чтобы подтвердить детали и сроки изготовления."}
        </p>
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

        <div className="field city-field">
          <label htmlFor="city">Город</label>
          <input
            id="city"
            name="city"
            required
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setCityCode(null);
            }}
            onFocus={() => setSuggestOpen(true)}
            onBlur={() => setTimeout(() => setSuggestOpen(false), 150)}
            placeholder="Начните вводить, например: Москва"
            autoComplete="off"
            role="combobox"
            aria-expanded={suggestOpen && suggest.length > 0}
            aria-controls="city-list"
          />
          {suggestOpen && suggest.length > 0 && (
            <ul className="suggest" id="city-list" role="listbox">
              {suggest.map((c) => (
                <li key={c.code}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={false}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setCity(c.name);
                      setCityCode(c.code);
                      setSuggest([]);
                      setSuggestOpen(false);
                    }}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {cdekOn && !cityCode && city.trim().length >= 2 && <small className="muted">Выберите город из подсказок — так СДЭК посчитает точно</small>}
        </div>
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
        {pickList ? (
          <div className="field">
            <span>Пункт выдачи СДЭК {points && <small className="muted">· {points.length} в городе</small>}</span>
            {!cityCode ? (
              <p className="small muted">Сначала выберите город — покажем пункты выдачи списком.</p>
            ) : points === null ? (
              <p className="small muted">Загружаем пункты выдачи…</p>
            ) : pointsError ? (
              <p className="error">{pointsError}</p>
            ) : (
              <>
                <input value={pointQuery} onChange={(e) => setPointQuery(e.target.value)} placeholder="Поиск по улице или метро" aria-label="Поиск пункта выдачи" />
                <ul className="points" role="radiogroup" aria-label="Пункты выдачи">
                  {pointsShown.map((p) => (
                    <li key={p.code}>
                      <label className={`point ${p.code === pointCode ? "is-active" : ""}`}>
                        <input type="radio" name="point" value={p.code} checked={p.code === pointCode} onChange={() => setPointCode(p.code)} />
                        <span>
                          {p.address}
                          {p.workTime && <small>{p.workTime}</small>}
                        </span>
                      </label>
                    </li>
                  ))}
                  {pointsShown.length === 0 && <li className="small muted">Ничего не нашлось — попробуйте другую улицу</li>}
                </ul>
              </>
            )}
          </div>
        ) : isMarket ? (
          <>
            <label className="field">
              <span>Телефон, к которому привязано приложение {marketName}</span>
              <input name="mpPhone" type="tel" required placeholder="+7" autoComplete="off" />
            </label>
            <label className="field">
              <span>Адрес пункта выдачи {marketName}</span>
              <input name="address" required />
            </label>
          </>
        ) : (
          <label className="field">
            <span>{delivery === "cdek-courier" ? "Адрес доставки (улица, дом, квартира)" : "Адрес пункта выдачи"}</span>
            <input name="address" required />
          </label>
        )}
        <label className="field">
          <span>Комментарий</span>
          <textarea name="comment" rows={3} />
        </label>

        <div className="promo-field">
          <input value={promoInput} onChange={(e) => setPromoInput(e.target.value)} placeholder="Промокод" aria-label="Промокод" />
          <button type="button" className="btn btn--ghost btn--sm" onClick={applyCode}>
            Применить
          </button>
        </div>
        {promoMsg && <p className="small muted">{promoMsg}</p>}

        <div className="checkout__total">
          <span>Товары</span>
          <strong>{formatPrice(total)}</strong>
        </div>
        {promo.discount > 0 && (
          <div className="checkout__total checkout__total--sub">
            <span>Скидка по промокоду</span>
            <span>−{formatPrice(promo.discount)}</span>
          </div>
        )}
        {chosen && (
          <div className="checkout__total checkout__total--sub">
            <span>Доставка</span>
            <span>{quoteText(chosen)}</span>
          </div>
        )}
        <p className="muted small">
          {deliveryInPay
            ? "Доставка СДЭК входит в оплату."
            : isCdek
              ? "Стоимость доставки СДЭК появится, когда вы выберете город."
              : `Доставка ${marketName} оплачивается отдельно, сразу: после заказа напишем вам в Telegram или Instagram и оформим отправку (≈ — примерная цена).`}
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

        {belowMin && <p className="error">Минимальная сумма заказа — {formatPrice(MIN_ORDER_TOTAL)}. Добавьте ещё на {formatPrice(MIN_ORDER_TOTAL - total)}.</p>}
        <button className="btn btn--block" disabled={status.type === "sending" || belowMin}>
          {status.type === "sending" ? "Отправляем…" : `Оплатить ${formatPrice(toPay)} · карта или СБП`}
        </button>
        {status.type === "error" && <p className="error">{status.message}</p>}
      </form>
    </div>
  );
}

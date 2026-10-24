import Link from "next/link";
import { CookieSettingsButton } from "@/components/consent/CookieBanner";
import { site } from "@/lib/format";

export function Footer() {
  return (
    <footer className="footer">
      <div className="scallop-top" style={{ ["--scallop-color" as string]: "var(--choc)" }} />
      <div className="footer__body">
        <div className="container footer__grid">
          <div>
            <p className="footer__lead">
              Десертные столики и стенды, которые <span className="script">собираются</span> как конструктор
            </p>
          </div>
          <div>
            <h3>Магазин</h3>
            <Link href="/catalog">Каталог</Link>
            <Link href="/constructor">Конструктор</Link>
            <Link href="/business">Для бизнеса</Link>
            <Link href="/cart">Корзина</Link>
          </div>
          <div>
            <h3>Покупателям</h3>
            <Link href="/delivery">Доставка и оплата</Link>
            <Link href="/about">История бренда</Link>
            <Link href="/contacts">Контакты</Link>
          </div>
          <div>
            <h3>Связаться</h3>
            <a href={site.telegram} target="_blank" rel="noreferrer">
              Telegram
            </a>
            <a href={site.instagram} target="_blank" rel="noreferrer">
              Instagram*
            </a>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </div>
        <div className="container footer__legal">
          <Link href="/legal/offer">Публичная оферта</Link>
          <Link href="/legal/privacy">Политика конфиденциальности</Link>
          <Link href="/legal/consent">Согласие на обработку данных</Link>
          <Link href="/legal/cookies">Cookie</Link>
          <CookieSettingsButton />
        </div>
        <div className="container footer__note">
          <span>© {new Date().getFullYear()} Sloyka. {/* TODO: ФИО/ИНН продавца */}Самозанятый [ФИО], ИНН [—]</span>
          <span>*Instagram принадлежит компании Meta, признанной экстремистской и запрещённой на территории РФ</span>
        </div>
        {/* большой логотип во всю ширину — как сейчас модно */}
        <div className="footer__giant-wrap">
          <Link href="/" aria-label="Sloyka — на главную">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-light.svg" alt="Sloyka" className="footer__giant" width={649} height={241} loading="lazy" />
          </Link>
        </div>
      </div>
    </footer>
  );
}

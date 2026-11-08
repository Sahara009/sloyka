import Link from "next/link";
import { CookieSettingsButton } from "@/components/consent/CookieBanner";
import { site } from "@/lib/format";
import { FooterLogo } from "./FooterLogo";

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
            {site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}
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
          <span>© {new Date().getFullYear()} Sloyka. {site.seller.name}, ИНН {site.seller.inn}, плательщик НПД (самозанятый)</span>
          <span>*Instagram принадлежит компании Meta, признанной экстремистской и запрещённой на территории РФ</span>
        </div>
        {/* большой логотип во всю ширину: буквы по одной выезжают снизу, когда подвал на экране */}
        <div className="footer__giant-wrap">
          <FooterLogo />
        </div>
      </div>
    </footer>
  );
}

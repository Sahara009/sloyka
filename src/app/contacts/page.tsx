import type { Metadata } from "next";
import { RequestForm } from "@/components/ui/RequestForm";
import { site } from "@/lib/format";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = { title: "Контакты", description: "Как связаться с Sloyka: Telegram, Instagram, почта." };

export default function ContactsPage() {
  return (
    <div className="container page">
      <Reveal className="page-head">
        <h1>
          <span className="script">Напишите</span> нам
        </h1>
        <p className="muted">Ответим на вопросы о сборках, цветах и индивидуальных заказах.</p>
      </Reveal>
      <div className="contacts">
        <ul className="contact-list">
          <li className="bg-gingham">
            <span>Telegram</span>
            <a href={site.telegram} target="_blank" rel="noreferrer">
              Написать в Telegram
            </a>
          </li>
          <li className="bg-stripes-sage">
            <span>Instagram*</span>
            <a href={site.instagram} target="_blank" rel="noreferrer">
              Смотреть сторис и новинки
            </a>
          </li>
          <li className="bg-stripes-caramel">
            <span>Почта</span>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </li>
          <li className="bg-stripes-blue">
            <span>Телефон</span>
            <a href={`tel:${site.phone.replace(/[^+\d]/g, "")}`}>{site.phone}</a>
          </li>
        </ul>
        <div className="contacts__form">
          <h2>Задать вопрос</h2>
          <RequestForm topic="Вопрос с сайта" />
        </div>
      </div>
      <p className="muted small">*Instagram принадлежит компании Meta, признанной экстремистской и запрещённой на территории РФ.</p>
    </div>
  );
}

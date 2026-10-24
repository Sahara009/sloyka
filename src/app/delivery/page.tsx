import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Доставка и оплата",
  description: "Оплата картой и через СБП, доставка СДЭК и Ozon по всей России.",
};

export default function DeliveryPage() {
  return (
    <div className="container page narrow">
      <Reveal className="page-head">
        <h1>
          Доставка <span className="script">и оплата</span>
        </h1>
      </Reveal>

      <div className="info-grid">
        <section className="info-card bg-gingham">
          <div className="info-card__inner">
            <h2>Оплата</h2>
            <ul>
              <li>Банковской картой на сайте</li>
              <li>Через СБП — по QR-коду или в приложении банка</li>
              <li>Платёж проходит через защищённую страницу Т-Банка</li>
              <li>Чек приходит на email, указанный при заказе</li>
            </ul>
          </div>
        </section>
        <section className="info-card bg-stripes-sage">
          <div className="info-card__inner">
            <h2>Доставка</h2>
            <ul>
              <li>СДЭК — до пункта выдачи или курьером</li>
              <li>Ozon — до пункта выдачи</li>
              <li>Стоимость зависит от города и веса, считаем при оформлении</li>
              <li>Трек-номер отправим после передачи заказа в доставку</li>
            </ul>
          </div>
        </section>
      </div>

      <div className="accordion">
        <details open>
          <summary>Сроки изготовления</summary>
          {/* TODO: уточнить у заказчика */}
          <div>Изделия делаются под заказ в выбранных цветах. Срок изготовления — [уточнить] рабочих дней, затем передаём в доставку.</div>
        </details>
        <details>
          <summary>Возврат и обмен</summary>
          <div>
            Условия возврата описаны в <Link href="/legal/offer">публичной оферте</Link>. Если изделие пришло с браком —
            напишите нам, решим вопрос.
          </div>
        </details>
        <details>
          <summary>Цвет может отличаться</summary>
          <div>Цвета могут незначительно отличаться из-за настроек экрана и партии пластика.</div>
        </details>
      </div>
    </div>
  );
}

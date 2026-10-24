import type { Metadata } from "next";
import { Constructor } from "@/components/constructor/Constructor";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Конструктор",
  description: "Соберите свой десертный столик или стенд: подиум, ножка, детали и цвета из палитры Sloyka.",
};

export default function ConstructorPage() {
  return (
    <div className="container page">
      <Reveal className="page-head center">
        <h1>
          Соберите <span className="script">свой</span> вариант
        </h1>
        <p className="muted">Выбирайте детали — цена и превью обновляются сразу.</p>
      </Reveal>
      <Constructor />
    </div>
  );
}

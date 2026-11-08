import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { Shape } from "@/components/ui/Shape";

export const metadata: Metadata = { title: "Страница не найдена", robots: { index: false } };

/** 404: потерянная страница — столик BonBon «плывёт» в облаке, ниже — куда пойти дальше */
export default function NotFound() {
  return (
    <div className="container page empty nf">
      <div className="nf__art">
        <span className="nf__num" aria-hidden="true">
          4<span>0</span>4
        </span>
        <div className="nf__cloud">
          <Shape shape="cloud" bg="var(--blue-100)">
            <Photo src="/products/podium-bonbon.webp" alt="" className="float" />
          </Shape>
        </div>
      </div>
      <h1>
        Страница <span className="script">потерялась</span>
      </h1>
      <p className="muted">Такой страницы нет — возможно, ссылка устарела или товар переименовали. Зато в каталоге много интересного.</p>
      <div className="row-gap">
        <Link className="btn" href="/catalog">
          В каталог
        </Link>
        <Link className="btn btn--ghost" href="/constructor">
          Собрать столик
        </Link>
        <Link className="btn btn--ghost" href="/">
          На главную
        </Link>
      </div>
      <p className="small muted nf__help">
        Искали что-то конкретное? Напишите нам в <a href="https://t.me/sloykahome?direct">Telegram</a> — подскажем.
      </p>
    </div>
  );
}

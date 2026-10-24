import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { Shape } from "@/components/ui/Shape";

export default function NotFound() {
  return (
    <div className="container page empty">
      <div style={{ maxWidth: 240, margin: "0 auto 24px" }}>
        <Shape shape="cloud" bg="var(--blue-100)">
          <Photo src="/products/podium-bonbon.webp" alt="" className="float" />
        </Shape>
      </div>
      <h1>
        Страница <span className="script">потерялась</span>
      </h1>
      <p className="muted">Такой страницы нет, но в каталоге много интересного.</p>
      <Link className="btn" href="/catalog">
        В каталог
      </Link>
    </div>
  );
}

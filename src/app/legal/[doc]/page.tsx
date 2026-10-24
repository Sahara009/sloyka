import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { legalBySlug, legalDocs } from "@/data/legal";

type Params = { params: Promise<{ doc: string }> };

export function generateStaticParams() {
  return legalDocs.map((d) => ({ doc: d.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { doc } = await params;
  const d = legalBySlug(doc);
  return d ? { title: d.title } : {};
}

export default async function LegalPage({ params }: Params) {
  const { doc } = await params;
  const d = legalBySlug(doc);
  if (!d) notFound();

  return (
    <div className="container page narrow legal">
      <nav className="legal__nav">
        {legalDocs.map((x) => (
          <Link key={x.slug} href={`/legal/${x.slug}`} className={`chip ${x.slug === d.slug ? "is-active" : ""}`}>
            {x.title}
          </Link>
        ))}
      </nav>
      <h1>{d.title}</h1>
      <p className="muted small">Редакция от {d.updated}</p>
      {d.sections.map((s, i) => (
        <section key={i}>
          {s.title && <h2>{s.title}</h2>}
          {s.text.map((t, k) => (
            <p key={k}>{t}</p>
          ))}
        </section>
      ))}
    </div>
  );
}

import type { Metadata } from "next";
import { CatalogView } from "@/components/catalog/CatalogView";
import { Reveal } from "@/components/ui/Reveal";
import { getProducts } from "@/lib/server/catalog";

export const metadata: Metadata = {
  title: "Каталог",
  description: "Sloyka Podium (столики для тортов и модульные столики), Sloyka Market (стойки, вывески), Sloyka Home (вафли, шкатулки), Sloyka Topper (топперы).",
  alternates: { canonical: "/catalog" },
};

export const revalidate = 60;

export default async function CatalogPage() {
  const products = await getProducts();
  return (
    <div className="container page">
      <Reveal className="page-head">
        <h1>
          <span className="script">Наш</span> каталог
        </h1>
      </Reveal>
      <CatalogView products={products} />
    </div>
  );
}

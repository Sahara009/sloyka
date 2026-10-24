import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = { title: "Корзина", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container page">
      <Reveal className="page-head">
        <h1>Корзина</h1>
      </Reveal>
      <CartView />
    </div>
  );
}

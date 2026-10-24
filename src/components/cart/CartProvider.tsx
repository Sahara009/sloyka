"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Art } from "@/data/products";
import type { ItemRef } from "@/lib/pricing";

export type CartItem = {
  /** Уникальный ключ позиции: товар + выбранные опции */
  key: string;
  name: string;
  price: number;
  qty: number;
  details?: string[];
  art?: Art;
  /** Что это за товар — по этому сервер пересчитывает цену */
  ref?: ItemRef;
  /** Фото товара (без фона) */
  image?: string;
  slug?: string;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  total: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  /** Боковая корзина (дровер) */
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "sloyka_cart";

/**
 * Корзина хранится в localStorage браузера (это «необходимая» функция сайта,
 * согласия на аналитические cookie для неё не требуется).
 * Когда появится бэкенд — заказ уходит на /api/orders.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* пустая корзина */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* приватный режим — корзина живёт до перезагрузки */
    }
  }, [items, loaded]);

  const add = useCallback<CartCtx["add"]>((item, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.key === item.key);
      if (found) return prev.map((i) => (i.key === item.key ? { ...i, qty: i.qty + qty } : i));
      return [...prev, { ...item, qty }];
    });
    // после добавления показываем корзину сбоку
    setDrawerOpen(true);
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) => (qty <= 0 ? prev.filter((i) => i.key !== key) : prev.map((i) => (i.key === key ? { ...i, qty } : i))));
  }, []);

  const remove = useCallback((key: string) => setItems((prev) => prev.filter((i) => i.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      total: items.reduce((s, i) => s + i.qty * i.price, 0),
      add,
      setQty,
      remove,
      clear,
      drawerOpen,
      openDrawer,
      closeDrawer,
    }),
    [items, add, setQty, remove, clear, drawerOpen, openDrawer, closeDrawer],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart должен использоваться внутри CartProvider");
  return ctx;
}

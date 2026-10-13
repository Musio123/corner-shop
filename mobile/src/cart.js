import { createContext, useContext, useEffect, useState } from "react";
import * as api from "./api";

const CartContext = createContext(null);
const POLL_MS = 4000;

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], total_cents: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const data = await api.fetchCart();
      setCart(data);
    } catch {
      // ignore (e.g. signed out)
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, []);

  async function add(product) {
    // optimistic
    setCart((prev) => {
      const existing = prev.items.find((i) => i.id === product.id);
      let items;
      if (existing) {
        items = prev.items.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        items = [
          ...prev.items,
          { id: product.id, name: product.name, price_cents: product.price_cents, image: product.image, quantity: 1 },
        ];
      }
      const total_cents = items.reduce((s, i) => s + i.price_cents * i.quantity, 0);
      const count = items.reduce((s, i) => s + i.quantity, 0);
      return { items, total_cents, count };
    });
    await api.addToCart(product.id, 1);
    refresh();
  }

  async function setQty(id, quantity) {
    setCart((prev) => {
      const items =
        quantity === 0
          ? prev.items.filter((i) => i.id !== id)
          : prev.items.map((i) => (i.id === id ? { ...i, quantity } : i));
      const total_cents = items.reduce((s, i) => s + i.price_cents * i.quantity, 0);
      const count = items.reduce((s, i) => s + i.quantity, 0);
      return { items, total_cents, count };
    });
    await api.setQuantity(id, quantity);
    refresh();
  }

  async function remove(id) {
    setQty(id, 0);
  }

  return (
    <CartContext.Provider value={{ cart, loading, add, setQty, remove, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

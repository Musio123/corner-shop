"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

const CartContext = createContext(null);
const STORAGE_KEY = "corner-shop-cart";
const POLL_MS = 4000; // how often to refresh the server cart (for cross-device sync)

// Cart behaviour:
//  - Signed OUT: kept in the browser (localStorage), like before.
//  - Signed IN : kept on the server so the SAME cart shows on the website and
//                the mobile app. We poll the server every few seconds so an item
//                added on one device appears on the other almost instantly.
export function CartProvider({ children }) {
  const { data: session, status } = useSession();
  const signedIn = status === "authenticated" && !!session?.user?.email;

  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const mergedRef = useRef(false);

  // ---- Guest cart (localStorage) ----
  useEffect(() => {
    if (signedIn) return; // when signed in we use the server cart instead
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      if (Array.isArray(saved)) setItems(saved);
    } catch {
      // ignore broken data
    }
    setLoaded(true);
  }, [signedIn]);

  useEffect(() => {
    if (signedIn || !loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded, signedIn]);

  // ---- Server cart (when signed in) ----
  async function refreshServerCart() {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data.items) ? data.items : []);
      }
    } catch {
      // ignore transient errors
    }
  }

  // On first sign-in: merge any guest items into the server cart, then load it.
  useEffect(() => {
    if (!signedIn || mergedRef.current) return;
    mergedRef.current = true;

    (async () => {
      let guest = [];
      try {
        guest = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        if (!Array.isArray(guest)) guest = [];
      } catch {
        guest = [];
      }
      for (const g of guest) {
        try {
          await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_id: g.id, quantity: g.quantity || 1 }),
          });
        } catch {
          // ignore
        }
      }
      localStorage.removeItem(STORAGE_KEY);
      await refreshServerCart();
      setLoaded(true);
    })();
  }, [signedIn]);

  // Poll the server cart so changes made on the mobile app appear here.
  useEffect(() => {
    if (!signedIn) return;
    refreshServerCart();
    const id = setInterval(refreshServerCart, POLL_MS);
    return () => clearInterval(id);
  }, [signedIn]);

  // ---- Mutations ----
  async function addItem(product) {
    if (signedIn) {
      // optimistic update
      setItems((prev) => {
        const existing = prev.find((i) => i.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.id === product.id ? { ...i, quantity: Math.min(i.quantity + 1, 99) } : i
          );
        }
        return [...prev, { id: product.id, name: product.name, price_cents: product.price_cents, image: product.image, quantity: 1 }];
      });
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: product.id, quantity: 1 }),
        });
      } catch {
        // ignore
      }
      refreshServerCart();
      return;
    }
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: Math.min(i.quantity + 1, 99) } : i
        );
      }
      return [...prev, { id: product.id, name: product.name, price_cents: product.price_cents, image: product.image, quantity: 1 }];
    });
  }

  async function updateQuantity(id, quantity) {
    const q = Math.max(0, Math.min(99, Number(quantity) || 0));
    if (signedIn) {
      setItems((prev) =>
        q === 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, quantity: q } : i))
      );
      try {
        await fetch("/api/cart", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: id, quantity: q }),
        });
      } catch {
        // ignore
      }
      refreshServerCart();
      return;
    }
    setItems((prev) =>
      q === 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, quantity: q } : i))
    );
  }

  async function removeItem(id) {
    if (signedIn) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      try {
        await fetch(`/api/cart?product_id=${id}`, { method: "DELETE" });
      } catch {
        // ignore
      }
      refreshServerCart();
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function clearCart() {
    if (signedIn) {
      setItems([]);
      try {
        await Promise.all(
          items.map((i) => fetch(`/api/cart?product_id=${i.id}`, { method: "DELETE" }))
        );
      } catch {
        // ignore
      }
      refreshServerCart();
      return;
    }
    setItems([]);
  }

  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.quantity * i.price_cents, 0);

  return (
    <CartContext.Provider
      value={{ items, loaded, count, total, addItem, updateQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}


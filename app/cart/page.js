"use client";

import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, loaded, total, updateQuantity, removeItem } = useCart();

  if (!loaded) return <p>Loading cart…</p>;

  if (items.length === 0) {
    return (
      <div className="empty">
        <h1>Your cart is empty</h1>
        <Link href="/" className="btn">Continue shopping</Link>
      </div>
    );
  }

  return (
    <>
      <h1>Your cart</h1>
      <div className="panel">
        {items.map((item) => (
          <div key={item.id} className="cart-row">
            <span className="cart-emoji">{item.image}</span>
            <div className="cart-name">
              <strong>{item.name}</strong>
              <div className="muted">{formatPrice(item.price_cents)} each</div>
            </div>
            <input
              type="number"
              min="1"
              max="99"
              value={item.quantity}
              onChange={(e) => updateQuantity(item.id, e.target.value)}
              className="qty"
              aria-label={`Quantity of ${item.name}`}
            />
            <span className="cart-line">{formatPrice(item.price_cents * item.quantity)}</span>
            <button className="link-btn" onClick={() => removeItem(item.id)}>Remove</button>
          </div>
        ))}
        <div className="cart-total">
          <span>Total</span>
          <strong>{formatPrice(total)}</strong>
        </div>
      </div>
      <div className="actions">
        <Link href="/" className="btn btn-outline">Continue shopping</Link>
        <Link href="/checkout" className="btn">Go to checkout</Link>
      </div>
    </>
  );
}

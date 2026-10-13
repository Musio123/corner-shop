"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useCart } from "@/components/CartContext";
import { formatPrice } from "@/lib/format";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const { items, loaded, total, clearCart } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (status === "loading" || !loaded) return <p>Loading…</p>;

  if (!session) {
    return (
      <div className="empty">
        <h1>Please sign in to check out</h1>
        <p className="muted">We use your Google account to save your order and email you a receipt.</p>
        <button className="btn" onClick={() => signIn("google", { callbackUrl: "/checkout" })}>
          Sign in with Google
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty">
        <h1>Your cart is empty</h1>
        <Link href="/" className="btn">Go shopping</Link>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      customer_name: form.get("customer_name"),
      phone: form.get("phone"),
      address: form.get("address"),
      city: form.get("city"),
      country: form.get("country"),
      items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      clearCart();
      router.push(`/order/${data.orderId}?email=${data.emailSent ? "sent" : "failed"}`);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1>Checkout</h1>
      <div className="checkout">
        <form className="panel form" onSubmit={handleSubmit}>
          <h2>Shipping details</h2>
          <label>
            Email (receipt goes here)
            <input value={session.user.email} disabled />
          </label>
          <label>
            Full name
            <input name="customer_name" required maxLength={100} defaultValue={session.user.name ?? ""} />
          </label>
          <label>
            Phone number
            <input name="phone" type="tel" required maxLength={30} />
          </label>
          <label>
            Address
            <input name="address" required maxLength={200} />
          </label>
          <div className="row">
            <label>
              City
              <input name="city" required maxLength={100} />
            </label>
            <label>
              Country
              <input name="country" required maxLength={100} />
            </label>
          </div>

          {error && <p className="alert alert-error">{error}</p>}

          <button className="btn btn-full" type="submit" disabled={submitting}>
            {submitting ? "Placing order…" : `Place order · ${formatPrice(total)}`}
          </button>
          <p className="muted small">Demo shop: no real payment is taken.</p>
        </form>

        <aside className="panel">
          <h2>Order summary</h2>
          {items.map((i) => (
            <div key={i.id} className="summary-row">
              <span>{i.image} {i.name} × {i.quantity}</span>
              <span>{formatPrice(i.price_cents * i.quantity)}</span>
            </div>
          ))}
          <div className="cart-total">
            <span>Total</span>
            <strong>{formatPrice(total)}</strong>
          </div>
        </aside>
      </div>
    </>
  );
}

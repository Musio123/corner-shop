import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params, searchParams }) {
  const { id } = await params;
  const { email } = await searchParams;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/");

  const orderId = Number(id);
  if (!Number.isInteger(orderId)) notFound();

  const sql = getDb();
  // Only show the order if it belongs to the signed-in user.
  const [order] = await sql`
    select * from orders where id = ${orderId} and email = ${session.user.email}`;
  if (!order) notFound();

  const items = await sql`select * from order_items where order_id = ${orderId} order by id`;

  return (
    <div className="panel narrow">
      <h1>🎉 Thank you for your order!</h1>
      <p>
        Order <strong>#{order.id}</strong> has been placed.
      </p>
      {order.email_sent || email === "sent" ? (
        <p className="alert alert-success">A confirmation email has been sent to {order.email}.</p>
      ) : (
        <p className="alert alert-error">
          Your order was saved, but we couldn&apos;t send the confirmation email right now.
        </p>
      )}

      {items.map((i) => (
        <div key={i.id} className="summary-row">
          <span>{i.product_name} × {i.quantity}</span>
          <span>{formatPrice(i.unit_price_cents * i.quantity)}</span>
        </div>
      ))}
      <div className="cart-total">
        <span>Total</span>
        <strong>{formatPrice(order.total_cents)}</strong>
      </div>

      <p className="muted">
        Shipping to {order.customer_name}, {order.address}, {order.city}, {order.country}
      </p>
      <div className="actions">
        <Link href="/orders" className="btn btn-outline">View all orders</Link>
        <Link href="/" className="btn">Keep shopping</Link>
      </div>
    </div>
  );
}

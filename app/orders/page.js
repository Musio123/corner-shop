import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <div className="empty">
        <h1>Sign in to see your orders</h1>
        <Link href="/" className="btn">Back to shop</Link>
      </div>
    );
  }

  const sql = getDb();
  const orders = await sql`
    select id, total_cents, status, created_at
    from orders
    where email = ${session.user.email}
    order by created_at desc`;

  return (
    <>
      <h1>My orders</h1>
      {orders.length === 0 ? (
        <p className="muted">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="panel">
          {orders.map((o) => (
            <Link key={o.id} href={`/order/${o.id}`} className="order-row">
              <span>Order #{o.id}</span>
              <span className="muted">{new Date(o.created_at).toLocaleString()}</span>
              <span className={`status status-${o.status}`}>{o.status}</span>
              <strong>{formatPrice(o.total_cents)}</strong>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

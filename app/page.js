import { getDb } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import AddToCartButton from "@/components/AddToCartButton";

// Always load fresh products from the database.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  let products = [];
  let error = null;

  try {
    const sql = getDb();
    products = await sql`
      select id, name, description, price_cents, image
      from products
      order by id`;
  } catch (err) {
    console.error(err);
    error = "Could not load products. Check DATABASE_URL and run `npm run db:setup`.";
  }

  return (
    <>
      <section className="hero">
        <h1>Welcome to Corner Shop</h1>
        <p>Everyday essentials, delivered to your door.</p>
      </section>

      {error && <p className="alert alert-error">{error}</p>}

      {!error && products.length === 0 && (
        <p className="alert">No products yet. Run <code>npm run db:setup</code> to add some.</p>
      )}

      <div className="grid">
        {products.map((p) => (
          <div key={p.id} className="card">
            <div className="card-image">{p.image}</div>
            <h3>{p.name}</h3>
            <p className="muted">{p.description}</p>
            <p className="price">{formatPrice(p.price_cents)}</p>
            <AddToCartButton
              product={{ id: p.id, name: p.name, price_cents: p.price_cents, image: p.image }}
            />
          </div>
        ))}
      </div>
    </>
  );
}

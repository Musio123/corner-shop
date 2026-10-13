"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useCart } from "@/components/CartContext";

export default function Header() {
  const { data: session, status } = useSession();
  const { count } = useCart();

  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="logo">
          🛍️ Corner Shop
        </Link>
        <nav className="nav">
          <Link href="/">Shop</Link>
          {session && <Link href="/orders">My orders</Link>}
          <Link href="/cart" className="cart-link">
            Cart <span className="badge">{count}</span>
          </Link>
          {status === "loading" ? null : session ? (
            <div className="user">
              {session.user?.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={session.user.image} alt="" className="avatar" referrerPolicy="no-referrer" />
              )}
              <button className="btn btn-outline" onClick={() => signOut()}>
                Sign out
              </button>
            </div>
          ) : (
            <button className="btn" onClick={() => signIn("google")}>
              Sign in with Google
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}

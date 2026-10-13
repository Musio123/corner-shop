// Tiny API client + auth token storage for the mobile app.
import * as SecureStore from "expo-secure-store";
import { API_URL } from "./config";

const TOKEN_KEY = "corner_shop_token";

export async function saveToken(token) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}
export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
export async function clearToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function authHeaders() {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Sign in with Google: exchange the Google ID token for our app JWT.
export async function loginWithGoogle(idToken) {
  const res = await fetch(`${API_URL}/api/auth/mobile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id_token: idToken }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  await saveToken(data.token);
  return data.user;
}

export async function fetchProducts() {
  const res = await fetch(`${API_URL}/api/products`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not load products");
  return data.products;
}

export async function fetchCart() {
  const res = await fetch(`${API_URL}/api/cart`, { headers: await authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not load cart");
  return data; // { items, total_cents, count }
}

export async function addToCart(productId, quantity = 1) {
  const res = await fetch(`${API_URL}/api/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not update cart");
  return data;
}

export async function setQuantity(productId, quantity) {
  const res = await fetch(`${API_URL}/api/cart`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...(await authHeaders()) },
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not update cart");
  return data;
}

export async function removeFromCart(productId) {
  const res = await fetch(`${API_URL}/api/cart?product_id=${productId}`, {
    method: "DELETE",
    headers: await authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not update cart");
  return data;
}

import { createContext, useContext, useEffect, useState } from "react";
import * as api from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadFromToken() {
    const token = await api.getToken();
    if (token) {
      setUser({ signedIn: true });
    } else {
      setUser(null);
    }
  }

  useEffect(() => {
    (async () => {
      await loadFromToken();
      setLoading(false);
    })();
  }, []);

  // Re-read the stored token (used after a demo login that saved it directly).
  async function refresh() {
    await loadFromToken();
  }

  async function signIn(idToken) {
    const u = await api.loginWithGoogle(idToken);
    setUser({ ...u, signedIn: true });
    return u;
  }

  async function signOut() {
    await api.clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}


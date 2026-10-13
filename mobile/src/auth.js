import { createContext, useContext, useEffect, useState } from "react";
import * as api from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await api.getToken();
      if (token) {
        // We don't decode the token here; just mark as signed in. The cart call
        // will 401 if the token is invalid, at which point we sign out.
        setUser({ signedIn: true });
      }
      setLoading(false);
    })();
  }, []);

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
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

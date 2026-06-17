import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { getSession, login as authLogin, logout as authLogout, type AuthUser } from "@/lib/auth";

// ─── Types ────────────────────────────────────────────────────────────────────
type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getSession());

  const login = useCallback((email: string, password: string) => {
    const result = authLogin(email, password);
    if (result) {
      setUser(result);
      return { success: true };
    }
    return { success: false, error: "E-mail ou senha inválidos." };
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}

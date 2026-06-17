import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import {
  getSession,
  login as authLogin,
  logout as authLogout,
  register as authRegister,
  saveInfluencerProfile as authSaveProfile,
  setInfluencerStatus as authSetStatus,
  type AuthUser,
  type InfluencerProfile,
} from "@/lib/auth";

// ─── Types ────────────────────────────────────────────────────────────────────
type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  registerUser: (email: string, password: string, name: string) => { success: boolean; error?: string };
  saveProfile: (profile: InfluencerProfile) => void;
  updateStatus: (email: string, status: "need_profile" | "pending_approval" | "approved") => void;
  logout: () => void;
  refreshSession: () => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getSession());

  const refreshSession = useCallback(() => {
    setUser(getSession());
  }, []);

  const login = useCallback((email: string, password: string) => {
    const result = authLogin(email, password);
    if (result) {
      setUser(result);
      return { success: true };
    }
    return { success: false, error: "E-mail ou senha inválidos." };
  }, []);

  const registerUser = useCallback((email: string, password: string, name: string) => {
    return authRegister(email, password, name);
  }, []);

  const saveProfile = useCallback((profile: InfluencerProfile) => {
    if (!user) return;
    const updated = authSaveProfile(user.email, profile);
    if (updated) {
      setUser(updated);
    }
  }, [user]);

  const updateStatus = useCallback((email: string, status: "need_profile" | "pending_approval" | "approved") => {
    authSetStatus(email, status);
    // Recarrega se for o usuário logado
    const current = getSession();
    if (current && current.email.toLowerCase() === email.toLowerCase()) {
      setUser(current);
    }
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        registerUser,
        saveProfile,
        updateStatus,
        logout,
        refreshSession,
      }}
    >
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

// ─── Credenciais do Super Admin ───────────────────────────────────────────────
const SUPER_ADMIN = {
  email: "osprepara2@gmail.com",
  // Senha armazenada como referência — comparação feita diretamente (projeto local/mock)
  password: "Vitoriadaluz1#$",
  name: "Super Admin",
  role: "super_admin" as const,
};

const SESSION_KEY = "pi_auth_session";

export type AuthUser = {
  email: string;
  name: string;
  role: "super_admin";
};

export type AuthSession = {
  user: AuthUser;
  expiresAt: number; // timestamp ms
};

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 horas

// ─── Login ────────────────────────────────────────────────────────────────────
export function login(email: string, password: string): AuthUser | null {
  const emailNorm = email.trim().toLowerCase();
  if (
    emailNorm === SUPER_ADMIN.email.toLowerCase() &&
    password === SUPER_ADMIN.password
  ) {
    const user: AuthUser = {
      email: SUPER_ADMIN.email,
      name: SUPER_ADMIN.name,
      role: SUPER_ADMIN.role,
    };
    const session: AuthSession = {
      user,
      expiresAt: Date.now() + SESSION_DURATION_MS,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return user;
  }
  return null;
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

// ─── Lê sessão ────────────────────────────────────────────────────────────────
export function getSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session: AuthSession = JSON.parse(raw);
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session.user;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

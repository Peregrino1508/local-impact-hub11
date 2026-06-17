// ─── Credenciais do Super Admin ───────────────────────────────────────────────
const SUPER_ADMIN = {
  email: "osprepara2@gmail.com",
  password: "Vitoriadaluz1#$",
  name: "Super Admin",
  role: "super_admin" as const,
};

const SESSION_KEY = "pi_auth_session";
const USERS_KEY = "memoria_usuarios";

export type InfluencerProfile = {
  fullName: string;
  nickname?: string;
  whatsapp: string;
  address: string;
  cep: string;
  city: string;
  state: string;
  neighborhood: string;
  googleMapsLink?: string;
  niche?: string;
};

export type AuthUser = {
  email: string;
  name: string;
  role: "super_admin" | "influencer";
  influencerStatus?: "need_profile" | "pending_approval" | "approved";
  influencerProfile?: InfluencerProfile | null;
};

export type RegisteredUser = AuthUser & {
  passwordHash: string; // Simplificado: guardamos em texto limpo para simulação local robusta
};

export type AuthSession = {
  user: AuthUser;
  expiresAt: number;
};

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 horas

// Helper SSR-safe: só acessa localStorage no browser
const isBrowser = typeof window !== "undefined";

// Obter todos os usuários cadastrados do localStorage
export function getRegisteredUsers(): RegisteredUser[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Salvar usuários cadastrados no localStorage
function saveRegisteredUsers(users: RegisteredUser[]) {
  if (!isBrowser) return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// ─── Cadastro ─────────────────────────────────────────────────────────────────
export function register(email: string, password: string, name: string): { success: boolean; error?: string } {
  if (!isBrowser) return { success: false, error: "Ambiente inválido." };
  const emailNorm = email.trim().toLowerCase();
  
  if (emailNorm === SUPER_ADMIN.email.toLowerCase()) {
    return { success: false, error: "Este e-mail está reservado." };
  }

  const users = getRegisteredUsers();
  if (users.some(u => u.email.toLowerCase() === emailNorm)) {
    return { success: false, error: "Este e-mail já está cadastrado." };
  }

  const newUser: RegisteredUser = {
    email: emailNorm,
    name: name,
    role: "influencer",
    influencerStatus: "need_profile",
    influencerProfile: null,
    passwordHash: password, // Armazenando direto para a memória local
  };

  users.push(newUser);
  saveRegisteredUsers(users);
  return { success: true };
}

// ─── Login ────────────────────────────────────────────────────────────────────
export function login(email: string, password: string): AuthUser | null {
  if (!isBrowser) return null;
  const emailNorm = email.trim().toLowerCase();

  // 1. Tenta Super Admin
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

  // 2. Tenta Usuários Cadastrados
  const users = getRegisteredUsers();
  const found = users.find(u => u.email.toLowerCase() === emailNorm && u.passwordHash === password);
  if (found) {
    const user: AuthUser = {
      email: found.email,
      name: found.name,
      role: found.role,
      influencerStatus: found.influencerStatus,
      influencerProfile: found.influencerProfile,
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

// ─── Atualizar Perfil de Influencer ───────────────────────────────────────────
export function saveInfluencerProfile(email: string, profile: InfluencerProfile): AuthUser | null {
  if (!isBrowser) return null;
  const emailNorm = email.trim().toLowerCase();
  
  const users = getRegisteredUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === emailNorm);
  
  if (index > -1) {
    users[index].influencerProfile = profile;
    users[index].influencerStatus = "pending_approval";
    saveRegisteredUsers(users);

    const updatedUser: AuthUser = {
      email: users[index].email,
      name: users[index].name,
      role: users[index].role,
      influencerStatus: users[index].influencerStatus,
      influencerProfile: users[index].influencerProfile,
    };

    // Atualiza a sessão ativa se for o usuário logado
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    if (sessionRaw) {
      const session: AuthSession = JSON.parse(sessionRaw);
      if (session.user.email.toLowerCase() === emailNorm) {
        session.user = updatedUser;
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
    }
    return updatedUser;
  }
  return null;
}

// ─── Atualizar Status de Influencer (pelo admin) ───────────────────────────────
export function setInfluencerStatus(email: string, status: "need_profile" | "pending_approval" | "approved"): boolean {
  if (!isBrowser) return false;
  const emailNorm = email.trim().toLowerCase();
  const users = getRegisteredUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === emailNorm);
  
  if (index > -1) {
    users[index].influencerStatus = status;
    saveRegisteredUsers(users);

    // Se o usuário estiver logado atualmente, atualiza a sessão dele também
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    if (sessionRaw) {
      const session: AuthSession = JSON.parse(sessionRaw);
      if (session.user.email.toLowerCase() === emailNorm) {
        session.user.influencerStatus = status;
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
    }
    return true;
  }
  return false;
}

// ─── Atualizar Empresa da Influencer (pelo admin) ─────────────────────────────
export function adminUpdateInfluencerNiche(email: string, niche: string): boolean {
  if (!isBrowser) return false;
  const emailNorm = email.trim().toLowerCase();
  const users = getRegisteredUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === emailNorm);
  
  if (index > -1 && users[index].influencerProfile) {
    // Atualiza apenas a empresa/niche
    users[index].influencerProfile!.niche = niche;
    saveRegisteredUsers(users);

    // Se o usuário estiver logado atualmente, atualiza a sessão dele também
    const sessionRaw = localStorage.getItem(SESSION_KEY);
    if (sessionRaw) {
      const session: AuthSession = JSON.parse(sessionRaw);
      if (session.user.email.toLowerCase() === emailNorm && session.user.influencerProfile) {
        session.user.influencerProfile.niche = niche;
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
    }
    return true;
  }
  return false;
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export function logout(): void {
  if (!isBrowser) return;
  localStorage.removeItem(SESSION_KEY);
}

// ─── Lê sessão ────────────────────────────────────────────────────────────────
export function getSession(): AuthUser | null {
  if (!isBrowser) return null;
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

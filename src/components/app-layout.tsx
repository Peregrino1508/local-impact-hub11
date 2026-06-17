import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Megaphone,
  Users,
  Briefcase,
  FileBarChart,
  Wallet,
  ImageIcon,
  Settings,
  Bell,
  Search,
  Plus,
  MessageCircle,
  ShieldCheck,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

const adminNav = [
  { to: "/", label: "Área de Trabalho", icon: LayoutDashboard, exact: true },
  { to: "/campanhas", label: "Campanhas", icon: Megaphone },
  { to: "/influencers", label: "Influencers", icon: Users },
  { to: "/clientes", label: "Clientes", icon: Briefcase },
  { to: "/relatorios", label: "Relatórios", icon: FileBarChart },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/provas", label: "Provas de Entrega", icon: ImageIcon },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

const influencerNav = [
  { to: "/", label: "Meu Painel", icon: LayoutDashboard, exact: true },
  { to: "/provas", label: "Minhas Provas", icon: ImageIcon },
];

export function AppLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Guard: redireciona para login se não autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  // Enquanto verifica autenticação, não renderiza nada
  if (!isAuthenticated) return null;

  const nav = user?.role === "influencer" ? influencerNav : adminNav;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-sidebar text-sidebar-foreground flex flex-col sticky top-0 h-screen">
        <div className="px-5 py-5 flex items-center gap-2 border-b border-sidebar-border/60">
          <div className="size-9 rounded-xl bg-primary flex items-center justify-center">
            <MessageCircle className="size-5 text-primary-foreground" />
          </div>
          <div className="font-semibold text-lg leading-tight">
            Influence <span className="text-primary">Local</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border/60">
          <div className="rounded-xl bg-sidebar-accent p-4">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4 text-primary" />
              {user?.role === "influencer" ? "Painel Influencer" : "Plano Profissional"}
            </div>
            <p className="text-xs text-sidebar-foreground/70 mt-1">
              {user?.role === "influencer" ? "Conectado com sucesso" : "Sua assinatura é válida até 07/06/2026"}
            </p>
          </div>
          <div className="text-[11px] text-sidebar-foreground/50 mt-3 px-1">
            Influence Local · © 2026
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
          <div className="flex items-center gap-4 px-6 py-4">
            <div>
              <h1 className="text-xl font-bold">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            
            {user?.role !== "influencer" && (
              <div className="flex-1 max-w-md mx-auto relative">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="Buscar campanhas, influencers, clientes..."
                  className="w-full pl-9 pr-12 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/40"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground border rounded px-1.5 py-0.5">⌘K</kbd>
              </div>
            )}

            <div className="flex items-center gap-3 ml-auto">
              {actions ?? (user?.role !== "influencer" && (
                <Link
                  to="/campanhas"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90"
                >
                  <Plus className="size-4" /> Nova Campanha
                </Link>
              ))}
              <button 
                onClick={toggleTheme}
                title="Alternar Tema"
                className="relative size-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
              </button>
              {user?.role !== "influencer" && (
                <button className="relative size-10 rounded-lg border border-border flex items-center justify-center hover:bg-muted">
                  <Bell className="size-4" />
                  <span className="absolute -top-1 -right-1 size-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">3</span>
                </button>
              )}
              <div className="flex items-center gap-2 pl-2 border-l border-border">
                <div className="size-10 rounded-full bg-gradient-to-br from-sidebar to-primary" />
                <div className="text-sm leading-tight">
                  <div className="font-semibold">{user?.name ?? "Admin"}</div>
                  <div className="text-xs text-muted-foreground">
                    {user?.role === "influencer" ? "Influencer" : "Super Admin"}
                  </div>
                </div>
              </div>
              <button
                id="logout-btn"
                onClick={handleLogout}
                title="Sair"
                className="size-10 rounded-lg border border-border flex items-center justify-center hover:bg-destructive/10 hover:border-destructive/40 hover:text-destructive transition-colors"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-gradient-to-br from-card to-muted/30 rounded-2xl border-2 border-border/80 shadow-md shadow-slate-200/40 dark:shadow-none ${className}`}>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Em andamento": "bg-info/10 text-info border-info/20",
    "Concluída": "bg-primary/10 text-primary border-primary/20",
    "Planejada": "bg-muted text-muted-foreground border-border",
    "Pausada": "bg-warning/10 text-warning border-warning/20",
    "Cancelada": "bg-destructive/10 text-destructive border-destructive/20",
    "Ativa": "bg-primary/10 text-primary border-primary/20",
    "Ativo": "bg-primary/10 text-primary border-primary/20",
    "Em teste": "bg-warning/10 text-warning border-warning/20",
    "Bloqueada": "bg-destructive/10 text-destructive border-destructive/20",
    "Inativo": "bg-muted text-muted-foreground border-border",
    "Publicado": "bg-primary/10 text-primary border-primary/20",
    "Aguardando": "bg-warning/10 text-warning border-warning/20",
    "Finalizado": "bg-primary/10 text-primary border-primary/20",
    "Não postou": "bg-destructive/10 text-destructive border-destructive/20",
    "Reprovado": "bg-destructive/10 text-destructive border-destructive/20",
    "Pendente": "bg-warning/10 text-warning border-warning/20",
    "Enviada": "bg-info/10 text-info border-info/20",
    "Aprovada": "bg-primary/10 text-primary border-primary/20",
    "Reprovada": "bg-destructive/10 text-destructive border-destructive/20",
    "Pago": "bg-primary/10 text-primary border-primary/20",
    "Em análise": "bg-info/10 text-info border-info/20",
    "Cancelado": "bg-destructive/10 text-destructive border-destructive/20",
    "Alta": "bg-primary/10 text-primary border-primary/20",
    "Média": "bg-warning/10 text-warning border-warning/20",
    "Baixa": "bg-destructive/10 text-destructive border-destructive/20",
    "need_profile": "bg-warning/10 text-warning border-warning/20",
    "pending_approval": "bg-info/10 text-info border-info/20",
    "approved": "bg-primary/10 text-primary border-primary/20",
  };
  const cls = map[status] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}>
      {status}
    </span>
  );
}

export function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  return (
    <div className="size-8 rounded-full bg-gradient-to-br from-primary/70 to-info/70 text-primary-foreground text-xs font-bold flex items-center justify-center">
      {initials}
    </div>
  );
}
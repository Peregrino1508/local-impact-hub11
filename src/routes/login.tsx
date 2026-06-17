import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/hooks/useAuth";
import { MessageCircle, Eye, EyeOff, ShieldCheck, Loader2, UserPlus, LogIn } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acesso — Influence Local" },
      { name: "description", content: "Acesso ao painel administrativo e do influencer." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Estados do formulário
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // Redireciona se já autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simula pequeno delay para UX
    await new Promise((r) => setTimeout(r, 700));

    if (isRegisterMode) {
      // Validações de cadastro
      if (!name.trim()) {
        setError("O nome é obrigatório.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.");
        setLoading(false);
        return;
      }

      const result = registerUser(email, password, name);
      setLoading(false);

      if (result.success) {
        toast.success("Conta criada! Agora preencha seu cadastro de influencer após logar.");
        setIsRegisterMode(false);
        setPassword("");
        setConfirmPassword("");
      } else {
        setError(result.error ?? "Erro ao criar conta.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } else {
      // Login
      const result = login(email, password);
      setLoading(false);

      if (result.success) {
        navigate({ to: "/" });
      } else {
        setError(result.error ?? "Credenciais inválidas.");
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* ── Painel esquerdo decorativo ── */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12"
        style={{
          background: "linear-gradient(135deg, hsl(var(--sidebar)) 0%, hsl(var(--primary) / 0.85) 100%)",
        }}
      >
        {/* Círculos decorativos */}
        <div className="absolute top-[-80px] left-[-80px] size-80 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-[-60px] right-[-60px] size-60 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute top-1/3 right-1/4 size-40 rounded-full bg-white/5 blur-xl" />

        <div className="relative z-10 text-white max-w-md text-center">
          <div className="size-20 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <MessageCircle className="size-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Influence<br />
            <span className="text-white/80">Local</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed">
            Plataforma para gestão de campanhas de WhatsApp Status com influencers locais.
          </p>

          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { label: "Campanhas", value: "100+" },
              { label: "Influencers", value: "500+" },
              { label: "Views/mês", value: "2M+" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/10 backdrop-blur p-4">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-white/60 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Painel direito — formulário ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center">
              <MessageCircle className="size-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">
              Influence <span className="text-primary">Local</span>
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
              <ShieldCheck className="size-3.5" />
              {isRegisterMode ? "Cadastro de Influencer" : "Acesso à Plataforma"}
            </div>
            <h2 className="text-3xl font-bold text-foreground">
              {isRegisterMode ? "Crie sua conta" : "Bem-vindo de volta"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isRegisterMode
                ? "Cadastre seu login primeiro para ter acesso à nossa rede."
                : "Entre com suas credenciais para acessar o painel."}
            </p>
          </div>

          {/* Formulário */}
          <form
            onSubmit={handleSubmit}
            className={`space-y-5 transition-all ${shake ? "animate-shake" : ""}`}
          >
            {/* Nome Completo (Modo Cadastro) */}
            {isRegisterMode && (
              <div className="space-y-1.5 animate-fadeIn">
                <label htmlFor="reg-name" className="text-sm font-medium text-foreground">
                  Nome Completo
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            )}

            {/* E-mail */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-sm font-medium text-foreground">
                E-mail
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-sm font-medium text-foreground">
                Senha
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isRegisterMode ? "new-password" : "current-password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  id="toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Senha (Modo Cadastro) */}
            {isRegisterMode && (
              <div className="space-y-1.5 animate-fadeIn">
                <label htmlFor="reg-confirm-password" className="text-sm font-medium text-foreground">
                  Confirmar Senha
                </label>
                <input
                  id="reg-confirm-password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            )}

            {/* Erro */}
            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-destructive inline-block shrink-0" />
                {error}
              </div>
            )}

            {/* Botão */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary text-primary-foreground py-3.5 text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {isRegisterMode ? "Criando Conta..." : "Entrando..."}
                </>
              ) : isRegisterMode ? (
                <>
                  <UserPlus className="size-4" />
                  Criar Conta
                </>
              ) : (
                <>
                  <LogIn className="size-4" />
                  Entrar no Painel
                </>
              )}
            </button>
          </form>

          {/* Toggle entre Login e Cadastro */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setError("");
              }}
              className="text-sm text-primary hover:underline font-semibold"
            >
              {isRegisterMode ? "Já tenho uma conta? Faça Login" : "Não tem conta? Cadastrar-se como Influencer"}
            </button>
          </div>

          {/* Rodapé */}
          <p className="mt-10 text-center text-xs text-muted-foreground">
            Influence Local · © 2026 · Acesso restrito
          </p>
        </div>
      </div>
    </div>
  );
}

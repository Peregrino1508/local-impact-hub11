import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Card } from "@/components/app-layout";
import { useState, useEffect } from "react";
import { CheckCircle, Settings, DollarSign, Sliders, Users, Building2, Info } from "lucide-react";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Influence Local" }] }),
  component: Config,
});

// ─── Tipo das configurações globais ────────────────────────────────────────────
export type SistemaConfig = {
  // Financeiro
  cpmInterno: number;
  cpmComercial: number;
  valorMinimoInfluencer: number;
  moeda: string;
  // Operação / Campanhas
  duracaoPadraoCampanha: number;
  exigirProvaPostagem: boolean;
  exigirProvaVisualizacoes: boolean;
  aprovacaoManualProvas: boolean;
  relatorioPublicoCliente: boolean;
  // Influencers
  statusPadraoNovaInfluencer: "Ativa" | "Em teste" | "Pausada";
  confiabilidadePadrao: "Alta" | "Média" | "Baixa";
  diasDivulgacaoPadrao: number;
  // Clientes
  statusPadraoNovoCliente: "Ativo" | "Inativo";
  notificarNovoCadastro: boolean;
};

export const CONFIG_KEY = "sistema_config";

export const defaultConfig: SistemaConfig = {
  cpmInterno: 20,
  cpmComercial: 40,
  valorMinimoInfluencer: 5,
  moeda: "BRL",
  duracaoPadraoCampanha: 24,
  exigirProvaPostagem: true,
  exigirProvaVisualizacoes: true,
  aprovacaoManualProvas: true,
  relatorioPublicoCliente: false,
  statusPadraoNovaInfluencer: "Em teste",
  confiabilidadePadrao: "Média",
  diasDivulgacaoPadrao: 3,
  statusPadraoNovoCliente: "Ativo",
  notificarNovoCadastro: true,
};

export function getConfig(): SistemaConfig {
  if (typeof window === "undefined") return defaultConfig;
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) return { ...defaultConfig, ...JSON.parse(stored) };
  } catch {}
  return defaultConfig;
}

// ─── Componentes auxiliares ───────────────────────────────────────────────────

function SectionTitle({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="size-4 text-primary" />
      </div>
      <div>
        <h2 className="font-semibold text-sm">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function FieldNum({ label, hint, value, onChange, min, max, suffix }: {
  label: string; hint?: string; value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      {hint && <span className="ml-2 text-[10px] text-info opacity-70">{hint}</span>}
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number" min={min} max={max}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        {suffix && <span className="text-xs text-muted-foreground whitespace-nowrap">{suffix}</span>}
      </div>
    </label>
  );
}

function FieldSelect({ label, hint, value, onChange, options }: {
  label: string; hint?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
      {hint && <span className="ml-2 text-[10px] text-info opacity-70">{hint}</span>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

function Toggle({ label, hint, checked, onChange }: {
  label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between py-3 border-b border-border last:border-0 cursor-pointer"
      onClick={() => onChange(!checked)}
    >
      <div>
        <span className="text-sm">{label}</span>
        {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <div className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-primary" : "bg-muted"}`}>
        <div className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

function Config() {
  const [cfg, setCfg] = useState<SistemaConfig>(defaultConfig);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCfg(getConfig());
  }, []);

  function set<K extends keyof SistemaConfig>(key: K, val: SistemaConfig[K]) {
    setCfg(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  }

  function handleSave() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <AppLayout title="Configurações" subtitle="Ajustes globais que impactam todo o sistema">
      {/* Aviso de integração */}
      <div className="mb-5 flex items-start gap-3 bg-info/10 border border-info/20 rounded-xl p-4 text-sm text-info">
        <Info className="size-4 mt-0.5 shrink-0" />
        <span>
          Estas configurações são <strong>globais</strong>: o CPM interno será usado nos cálculos de campanhas, os status padrão serão aplicados nos cadastros de Influencers e Clientes, e os toggles de prova impactam o fluxo de entrega.
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ── FINANCEIRO ─────────────────────────────────────────────────── */}
        <Card className="p-6">
          <SectionTitle icon={DollarSign} title="Configurações Financeiras" subtitle="Impacta cálculos de margem e pagamento nas campanhas" />
          <div className="space-y-4">
            <FieldNum
              label="CPM interno padrão" hint="(Custo/influencer)"
              value={cfg.cpmInterno} onChange={v => set("cpmInterno", v)}
              min={1} suffix="R$ por 1.000 views"
            />
            <FieldNum
              label="CPM comercial padrão" hint="(Cobrado do cliente)"
              value={cfg.cpmComercial} onChange={v => set("cpmComercial", v)}
              min={1} suffix="R$ por 1.000 views"
            />
            <FieldNum
              label="Valor mínimo por influencer"
              value={cfg.valorMinimoInfluencer} onChange={v => set("valorMinimoInfluencer", v)}
              min={0} suffix="R$"
            />
            <FieldSelect
              label="Moeda do sistema"
              value={cfg.moeda} onChange={v => set("moeda", v)}
              options={[
                { value: "BRL", label: "Real brasileiro (BRL)" },
                { value: "USD", label: "Dólar americano (USD)" },
                { value: "EUR", label: "Euro (EUR)" },
              ]}
            />
            <div className="mt-3 p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground space-y-1">
              <p>💡 <strong>Margem estimada atual:</strong> R$ {cfg.cpmComercial - cfg.cpmInterno} / 1.000 views ({Math.round(((cfg.cpmComercial - cfg.cpmInterno) / cfg.cpmComercial) * 100)}%)</p>
              <p>📊 Se o CPM interno for alterado, <strong>novos cadastros</strong> de influencer usarão esse valor automaticamente.</p>
            </div>
          </div>
        </Card>

        {/* ── OPERAÇÃO / CAMPANHAS ─────────────────────────────────────────── */}
        <Card className="p-6">
          <SectionTitle icon={Settings} title="Configurações da Operação" subtitle="Regras padrão para campanhas e provas de entrega" />
          <div className="space-y-4">
            <FieldNum
              label="Duração padrão de campanha" hint="(usado ao criar nova campanha)"
              value={cfg.duracaoPadraoCampanha} onChange={v => set("duracaoPadraoCampanha", v)}
              min={1} max={168} suffix="horas"
            />
            <div className="pt-2">
              <p className="text-xs text-muted-foreground font-medium mb-2">Controle de provas de entrega</p>
              <Toggle label="Exigir prova de postagem" hint="Influencer deve enviar print do story publicado" checked={cfg.exigirProvaPostagem} onChange={v => set("exigirProvaPostagem", v)} />
              <Toggle label="Exigir prova de visualizações" hint="Influencer deve enviar print das views 24h depois" checked={cfg.exigirProvaVisualizacoes} onChange={v => set("exigirProvaVisualizacoes", v)} />
              <Toggle label="Aprovação manual de provas" hint="Admin aprova cada prova manualmente antes de liberar pagamento" checked={cfg.aprovacaoManualProvas} onChange={v => set("aprovacaoManualProvas", v)} />
              <Toggle label="Permitir relatório público para cliente" hint="Cliente pode ver o relatório sem precisar de login" checked={cfg.relatorioPublicoCliente} onChange={v => set("relatorioPublicoCliente", v)} />
            </div>
          </div>
        </Card>

        {/* ── INFLUENCERS ──────────────────────────────────────────────────── */}
        <Card className="p-6">
          <SectionTitle icon={Users} title="Padrões de Influencer" subtitle="Valores pré-preenchidos ao cadastrar nova influencer" />
          <div className="space-y-4">
            <FieldSelect
              label="Status padrão no cadastro" hint="(aplicado automaticamente)"
              value={cfg.statusPadraoNovaInfluencer} onChange={v => set("statusPadraoNovaInfluencer", v as any)}
              options={[
                { value: "Em teste", label: "Em teste" },
                { value: "Ativa", label: "Ativa" },
                { value: "Pausada", label: "Pausada" },
              ]}
            />
            <FieldSelect
              label="Confiabilidade padrão"
              value={cfg.confiabilidadePadrao} onChange={v => set("confiabilidadePadrao", v as any)}
              options={[
                { value: "Alta", label: "Alta" },
                { value: "Média", label: "Média" },
                { value: "Baixa", label: "Baixa" },
              ]}
            />
            <FieldNum
              label="Dias de divulgação padrão na semana"
              value={cfg.diasDivulgacaoPadrao} onChange={v => set("diasDivulgacaoPadrao", v)}
              min={1} max={7} suffix="dias"
            />
            <div className="p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground">
              📋 Estas configurações são <strong>pré-selecionadas</strong> no formulário de nova influencer, mas o cadastrador pode alterar antes de salvar.
            </div>
          </div>
        </Card>

        {/* ── CLIENTES ─────────────────────────────────────────────────────── */}
        <Card className="p-6">
          <SectionTitle icon={Building2} title="Padrões de Cliente" subtitle="Valores padrão para novos clientes cadastrados" />
          <div className="space-y-4">
            <FieldSelect
              label="Status padrão no cadastro"
              value={cfg.statusPadraoNovoCliente} onChange={v => set("statusPadraoNovoCliente", v as any)}
              options={[
                { value: "Ativo", label: "Ativo" },
                { value: "Inativo", label: "Inativo" },
              ]}
            />
            <Toggle
              label="Notificar ao cadastrar novo cliente"
              hint="Aparece um aviso no dashboard ao adicionar um novo cliente"
              checked={cfg.notificarNovoCadastro}
              onChange={v => set("notificarNovoCadastro", v)}
            />

            {/* Resumo do sistema */}
            <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2 text-xs">
              <p className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Sliders className="size-3.5 text-primary" /> Resumo das configurações ativas
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground mt-2">
                <span>CPM Interno:</span><span className="text-foreground font-medium">R$ {cfg.cpmInterno}/1k views</span>
                <span>CPM Comercial:</span><span className="text-foreground font-medium">R$ {cfg.cpmComercial}/1k views</span>
                <span>Duração campanha:</span><span className="text-foreground font-medium">{cfg.duracaoPadraoCampanha}h</span>
                <span>Aprovação provas:</span><span className="text-foreground font-medium">{cfg.aprovacaoManualProvas ? "Manual" : "Automática"}</span>
                <span>Status influencer:</span><span className="text-foreground font-medium">{cfg.statusPadraoNovaInfluencer}</span>
                <span>Dias divulgação:</span><span className="text-foreground font-medium">{cfg.diasDivulgacaoPadrao} dias/semana</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Botão Salvar */}
      <div className="flex items-center justify-between mt-6 pt-5 border-t border-border">
        <p className="text-xs text-muted-foreground">
          As configurações ficam salvas no seu navegador até a integração com o banco de dados.
        </p>
        <button
          onClick={handleSave}
          className={`inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all ${
            saved
              ? "bg-green-600 text-white"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          {saved ? <><CheckCircle className="size-4" /> Configurações salvas!</> : "Salvar configurações"}
        </button>
      </div>
    </AppLayout>
  );
}
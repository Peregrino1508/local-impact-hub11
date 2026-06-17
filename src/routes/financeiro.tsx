import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Card, StatusBadge, Avatar } from "@/components/app-layout";
import {
  campaigns as initialCampaigns,
  influencers as initialInfluencers,
  type Influencer,
} from "@/lib/mock-data";
import { Lock, TrendingUp, Eye, DollarSign, Users } from "lucide-react";
import { useState } from "react";
import { getConfig } from "./configuracoes";
import type { ProofEntry } from "./provas";

export const Route = createFileRoute("/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — Influence Local" }] }),
  component: Financeiro,
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtNum(n: number) {
  return n.toLocaleString("pt-BR");
}
function calcPag(views: number, cpm: number) {
  return (views * cpm) / 1000;
}

// ─── Página ──────────────────────────────────────────────────────────────────
function Financeiro() {
  const cfg = getConfig();
  const cpm = cfg.cpmInterno || 20;
  const cpmComercial = cfg.cpmComercial || 40;

  // Carrega dados do localStorage (inclui cadastros recentes)
  const [influencers] = useState<Influencer[]>(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("memoria_influencers");
      if (s) return JSON.parse(s);
    }
    return initialInfluencers;
  });

  const [campanhas] = useState(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("memoria_campanhas");
      if (s) return JSON.parse(s);
    }
    return initialCampaigns;
  });

  const [provas] = useState<ProofEntry[]>(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("memoria_provas");
      if (s) return JSON.parse(s);
    }
    return [];
  });

  // ── Cálculo de ganhos por influencer a partir das provas aprovadas ─────────
  const ganhosPorInfluencer = influencers.map(inf => {
    const provasAprovadas = provas.filter(
      p => p.influencerId === inf.id && p.status === "Aprovada"
    );
    const provasPagas = provasAprovadas.filter(p => p.paymentStatus === "Pago");
    const provasALiberar = provasAprovadas.filter(p => p.paymentStatus === "Liberado");

    const totalViews = provasAprovadas.reduce((s, p) => s + (p.views || 0), 0);
    const totalGanho = provasAprovadas.reduce((s, p) => s + (p.valorCalculado ?? calcPag(p.views, cpm)), 0);
    const totalPago = provasPagas.reduce((s, p) => s + (p.valorCalculado ?? 0), 0);
    const totalALiberar = provasALiberar.reduce((s, p) => s + (p.valorCalculado ?? 0), 0);
    const totalProvas = provasAprovadas.length;

    return { inf, totalViews, totalGanho, totalPago, totalALiberar, totalProvas, provasAprovadas };
  }).filter(x => x.totalProvas > 0 || x.totalViews > 0).sort((a, b) => b.totalGanho - a.totalGanho);

  // ── Receita de campanhas (CPM comercial) ───────────────────────────────────
  const receitaTotal = campanhas.reduce((s: number, c: any) => {
    const infCis = c.campaign_influencers || c.influencers || [];
    return s + infCis.reduce((ss: number, ci: any) => {
      const views = ci.views_delivered || ci.viewsDelivered || 0;
      return ss + (views * cpmComercial) / 1000;
    }, 0);
  }, 0) || campanhas.reduce((s: number, c: any) => s + (c.client_price || c.clientPrice || 0), 0);

  // Custo total com influencers (CPM interno sobre views aprovadas)
  const custoTotal = ganhosPorInfluencer.reduce((s, x) => s + x.totalGanho, 0);
  const margem = receitaTotal - custoTotal;
  const margemPct = receitaTotal > 0 ? Math.round((margem / receitaTotal) * 100) : 0;

  // Totais de pagamento
  const totalALiberar = ganhosPorInfluencer.reduce((s, x) => s + x.totalALiberar, 0);
  const totalJaPago = ganhosPorInfluencer.reduce((s, x) => s + x.totalPago, 0);

  return (
    <AppLayout
      title="Financeiro interno"
      subtitle="Visível apenas para o administrador"
      actions={
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1.5 rounded-md border border-primary/20">
          <Lock className="size-3" /> Interno
        </span>
      }
    >
      {/* ── Cards de resumo ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Big icon={DollarSign} label="Receita total (campanhas)" value={fmtBRL(receitaTotal)} color="foreground" />
        <Big icon={Users} label="Custo com influencers" value={fmtBRL(custoTotal)} color="destructive" />
        <Big icon={TrendingUp} label="Margem bruta" value={fmtBRL(margem)} color="primary" sub={`${margemPct}% de margem`} />
        <Big icon={Eye} label="CPM interno configurado" value={`R$ ${cpm}`} color="info" sub="por 1.000 views" />
      </div>

      {/* ── Pagamentos pendentes ─────────────────────────────────────────────── */}
      {(totalALiberar > 0 || totalJaPago > 0) && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Card className="p-4 border-l-4 border-l-yellow-500">
            <div className="text-xs text-muted-foreground">A liberar para influencers</div>
            <div className="text-2xl font-bold text-yellow-400 mt-1">{fmtBRL(totalALiberar)}</div>
            <div className="text-[11px] text-muted-foreground mt-1">Provas aprovadas aguardando pagamento</div>
          </Card>
          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="text-xs text-muted-foreground">Total já pago a influencers</div>
            <div className="text-2xl font-bold text-green-400 mt-1">{fmtBRL(totalJaPago)}</div>
            <div className="text-[11px] text-muted-foreground mt-1">Pagamentos confirmados pelo admin</div>
          </Card>
        </div>
      )}

      {/* ── Ranking de ganhos por influencer ─────────────────────────────────── */}
      <Card className="overflow-hidden mt-5">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-semibold">Extrato por Influencer</h2>
          <span className="text-xs text-muted-foreground">
            Base: R$ {cpm} / 1.000 views (CPM das Configurações)
          </span>
        </div>
        {ganhosPorInfluencer.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Nenhuma prova aprovada ainda. Os ganhos aparecerão aqui conforme as provas forem aprovadas na aba "Provas de Entrega".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs text-muted-foreground">
                <tr>
                  {["Influencer", "Empresa", "Provas aprovadas", "Total views", "Ganho bruto", "Já pago", "A liberar", ""].map(h =>
                    <th key={h} className="text-left font-medium px-4 py-3">{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {ganhosPorInfluencer.map(({ inf, totalViews, totalGanho, totalPago, totalALiberar: aLib, totalProvas }) => (
                  <tr key={inf.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={inf.name} />
                        <div>
                          <div className="font-medium">{inf.name}</div>
                          <div className="text-[11px] text-muted-foreground">{inf.publicName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{inf.niche}</td>
                    <td className="px-4 py-3 text-center font-semibold">{totalProvas}</td>
                    <td className="px-4 py-3 font-medium">{fmtNum(totalViews)} views</td>
                    <td className="px-4 py-3 font-bold text-primary">{fmtBRL(totalGanho)}</td>
                    <td className="px-4 py-3 text-green-400 font-medium">{fmtBRL(totalPago)}</td>
                    <td className="px-4 py-3">
                      {aLib > 0 ? (
                        <span className="text-yellow-400 font-semibold">{fmtBRL(aLib)}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {totalGanho > 0 && (
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(100, (totalGanho / (ganhosPorInfluencer[0]?.totalGanho || 1)) * 100)}%` }}
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ── Nota para painel futuro da influencer ────────────────────────────── */}
      <Card className="mt-5 p-5 border border-primary/20 bg-primary/5">
        <div className="flex items-start gap-3">
          <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
            <TrendingUp className="size-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">📌 Painel da Influencer (em breve)</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Cada influencer terá seu próprio painel personalizado, onde poderá acompanhar:
              <br />
              <strong className="text-foreground">• Histórico de ganhos por campanha</strong> (views × R$ {cpm}/1k = valor ganho)
              <br />
              <strong className="text-foreground">• Status de cada pagamento</strong> (Pendente → Liberado → Pago)
              <br />
              <strong className="text-foreground">• Evolução diária das visualizações</strong>
              <br />
              <strong className="text-foreground">• Relatório de provas enviadas e aprovadas</strong>
            </p>
            <p className="text-[11px] text-primary mt-2">
              Base de cálculo: R$ {cpm} por cada 1.000 visualizações (configurável em Configurações → CPM Interno)
            </p>
          </div>
        </div>
      </Card>
    </AppLayout>
  );
}

// ─── Componente de card grande ────────────────────────────────────────────────
function Big({ icon: Icon, label, value, color, sub }: {
  icon: any; label: string; value: string; color: string; sub?: string;
}) {
  const map: Record<string, string> = {
    foreground: "text-foreground",
    primary: "text-primary",
    info: "text-info",
    destructive: "text-destructive",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="size-4 text-muted-foreground" />
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
      <div className={`text-2xl font-bold ${map[color]}`}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-1">{sub}</div>}
    </Card>
  );
}
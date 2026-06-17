import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AppLayout, Card, StatusBadge, Avatar } from "@/components/app-layout";
import {
  getCampaigns,
  getClients,
  getInfluencers,
  getProofs,
} from "@/lib/api.functions";
import {
  Activity,
  Eye,
  Users,
  DollarSign,
  TrendingUp,
  Lock,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Influence Local" },
      { name: "description", content: "Painel administrativo para gerenciar campanhas de WhatsApp Status com influencers locais." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["campaigns"],
      queryFn: () => getCampaigns(),
    });
    await context.queryClient.ensureQueryData({
      queryKey: ["clients"],
      queryFn: () => getClients(),
    });
    await context.queryClient.ensureQueryData({
      queryKey: ["influencers"],
      queryFn: () => getInfluencers(),
    });
    await context.queryClient.ensureQueryData({
      queryKey: ["proofs"],
      queryFn: () => getProofs(),
    });
  },
  component: Dashboard,
});

function Dashboard() {
  const { data: campaigns } = useSuspenseQuery({
    queryKey: ["campaigns"],
    queryFn: () => getCampaigns(),
  });
  const { data: clients } = useSuspenseQuery({
    queryKey: ["clients"],
    queryFn: () => getClients(),
  });
  const { data: influencers } = useSuspenseQuery({
    queryKey: ["influencers"],
    queryFn: () => getInfluencers(),
  });
  const { data: proofs } = useSuspenseQuery({
    queryKey: ["proofs"],
    queryFn: () => getProofs(),
  });

  const activeCampaigns = campaigns.filter((c: any) => c.status === "Em andamento");
  const totalViews = campaigns.reduce((s: number, c: any) => {
    const ciViews = (c.campaign_influencers || []).reduce((sum: number, ci: any) => sum + (ci.views_delivered || 0), 0);
    return s + ciViews;
  }, 0);
  const revenue = campaigns
    .filter((c: any) => c.status !== "Cancelada")
    .reduce((s: number, c: any) => s + (c.client_price || 0), 0);
  const internalCost = campaigns.reduce((s: number, c: any) => {
    const ciCost = (c.campaign_influencers || []).reduce(
      (sum: number, ci: any) => sum + calcInternalCost(ci.views_delivered || 0, c.cpm_internal || 20),
      0
    );
    return s + ciCost;
  }, 0);
  const margin = revenue - internalCost;

  const stats = [
    { label: "Campanhas Ativas", value: String(activeCampaigns.length), delta: "+20%", icon: Activity, color: "primary" },
    { label: "Visualizações Entregues", value: fmtNum(totalViews), delta: "+32%", icon: Eye, color: "info" },
    { label: "Influencers Ativas", value: String(influencers.filter((i: any) => i.status === "Ativa").length), delta: "+15%", icon: Users, color: "primary" },
    { label: "Receita do Mês", value: fmtBRL(revenue), delta: "+28%", icon: DollarSign, color: "info" },
    { label: "Margem Bruta Interna", value: fmtBRL(margin), delta: "+26%", icon: TrendingUp, color: "primary" },
  ];

  const c = activeCampaigns[0] ?? campaigns[0];
  const client = clients.find((cl: any) => cl.id === c?.client_id);
  const ciList = c?.campaign_influencers || [];
  const ct = campaignTotals(c);

  return (
    <AppLayout title="Dashboard" subtitle="Bem-vindo de volta, Admin!">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-start gap-3">
                <div className={`size-11 rounded-xl flex items-center justify-center ${s.color === "primary" ? "bg-primary/10 text-primary" : "bg-info/10 text-info"}`}>
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                  <div className="text-2xl font-bold mt-0.5">{s.value}</div>
                  <div className="text-xs text-primary font-medium mt-1">↑ {s.delta} vs mês anterior</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        {/* Campaign in progress */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Campanha em Andamento</h2>
            <Link to="/campanhas/$id" params={{ id: c?.id }} className="text-sm border border-border rounded-md px-3 py-1.5 hover:bg-muted">
              Ver detalhes
            </Link>
          </div>
          <div className="flex gap-4 items-start">
            <div className="size-20 rounded-xl bg-gradient-to-br from-primary/30 to-info/30 flex items-center justify-center text-xs font-bold text-foreground/70">
              {client?.company?.slice(0, 2)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold">{c?.name}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                <span>👤 Cliente: <b className="text-foreground">{client?.company}</b></span>
                <span>📊 Status: <StatusBadge status={c?.status} /></span>
                <span>⏱ Duração: {c?.duration_hours} horas</span>
              </div>
            </div>
          </div>
          <div className="border-t border-border my-5" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-muted-foreground">Meta de visualizações</div>
              <div className="font-bold text-lg mt-1">{fmtNum(c?.views_goal || 0)} views</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Visualizações entregues</div>
              <div className="font-bold text-lg text-primary mt-1">{fmtNum(ct.viewsDelivered)} views</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Progresso da entrega</div>
              <div className="font-bold text-lg mt-1">{ct.progress}% concluído</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${ct.progress}%` }} />
            </div>
            <div className="text-right text-xs text-muted-foreground mt-1">{ct.progress}%</div>
          </div>
          <div className="flex justify-between text-sm mt-4">
            <span className="text-muted-foreground">Pacote vendido ao cliente: <b className="text-primary">{fmtBRL(c?.client_price || 0)}</b></span>
            <span className="text-muted-foreground">Status de entrega: <StatusBadge status={`${ct.progress}% concluído`} /></span>
          </div>
        </Card>

        {/* Internal summary */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Resumo Interno da Campanha</h2>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
              <Lock className="size-3" /> Interno
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Valor cobrado do cliente" value={fmtBRL(c?.client_price || 0)} color="foreground" />
            <MiniStat label="Custo estimado com influencers" value={fmtBRL(ct.internalCost)} color="destructive" />
            <MiniStat label="Margem bruta prevista" value={fmtBRL(ct.grossMargin)} color="primary" />
            <MiniStat label="CPM interno pago às influencers" value={fmtBRL(c?.cpm_internal || 20)} sub="por 1.000 views" color="foreground" />
            <MiniStat label="CPM comercial vendido ao cliente" value={fmtBRL(c?.cpm_commercial || 0)} sub="por 1.000 views" color="info" />
          </div>
          <div className="mt-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Margem bruta prevista:</span>
              <span className="font-semibold">{Math.round((ct.grossMargin / (c?.client_price || 1)) * 100)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-info rounded-full" style={{ width: `${(ct.grossMargin / (c?.client_price || 1)) * 100}%` }} />
            </div>
          </div>
        </Card>

        {/* Influencers in campaign */}
        <Card className="p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2"><Users className="size-4 text-primary" /> Influencers da Campanha</h2>
            <Link to="/campanhas/$id" params={{ id: c?.id }} className="text-sm text-primary hover:underline">Ver todas</Link>
          </div>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground text-left">
                  <th className="font-medium py-2 px-2">Influencer</th>
                  <th className="font-medium py-2 px-2">Cidade/Bairro</th>
                  <th className="font-medium py-2 px-2">Views</th>
                  <th className="font-medium py-2 px-2">Status</th>
                  <th className="font-medium py-2 px-2">Prova</th>
                  <th className="font-medium py-2 px-2">Cupom</th>
                  <th className="font-medium py-2 px-2 flex items-center gap-1">Pagto <Lock className="size-3" /></th>
                </tr>
              </thead>
              <tbody>
                {ciList.map((ci: any) => {
                  const inf = ci.influencer;
                  return (
                    <tr key={ci.id} className="border-t border-border">
                      <td className="py-2 px-2 flex items-center gap-2"><Avatar name={inf?.name || ""} />{inf?.name}</td>
                      <td className="py-2 px-2 text-muted-foreground">{inf?.neighborhood}</td>
                      <td className="py-2 px-2">{fmtNum(ci.views_delivered || 0)}</td>
                      <td className="py-2 px-2"><StatusBadge status={ci.post_status} /></td>
                      <td className="py-2 px-2"><StatusBadge status={ci.proof_status} /></td>
                      <td className="py-2 px-2 text-xs font-mono">{ci.coupon}</td>
                      <td className="py-2 px-2 font-semibold">{fmtBRL(calcInternalCost(ci.views_delivered || 0, c?.cpm_internal || 20))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Client report */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">📄 Relatório do Cliente</h2>
            <Link to="/relatorios" className="text-xs border border-border rounded-md px-3 py-1.5 hover:bg-muted">Visão do Cliente</Link>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="size-12 rounded-xl bg-gradient-to-br from-primary/30 to-info/30" />
            <div>
              <div className="font-bold">{c?.name}</div>
              <div className="text-xs text-muted-foreground">Cliente: {client?.company} · <StatusBadge status={c?.status} /></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Total de visualizações entregues" value={fmtNum(ct.viewsDelivered)} sub="views" color="primary" />
            <MiniStat label="Influencers participantes" value={String(ciList.length)} color="foreground" />
            <MiniStat label="Proofs de postagem" value={String(proofs.length)} color="foreground" />
            <MiniStat label="Horários de publicação" value="13:02 - 19:45" color="foreground" small />
            <MiniStat label="Resultado por bairro" value="Ver detalhes ›" color="info" small />
            <MiniStat label="Status final da campanha" value={c?.status} color="primary" small />
          </div>
          <div className="mt-4 bg-info/5 border border-info/20 rounded-lg p-3 text-xs text-info text-center">
            Este relatório contém apenas informações comerciais para o cliente.
          </div>
        </Card>
      </div>

      {/* Proofs */}
      <Card className="p-6 mt-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Provas de Entrega</h2>
          <Link to="/provas" className="text-sm text-primary hover:underline">Ver todas</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {proofs.slice(0, 4).map((p: any) => (
            <div key={p.id} className="border border-border rounded-xl overflow-hidden">
              <div className="flex">
                <div className="w-1/2 aspect-[9/16] bg-gradient-to-br from-sidebar to-primary/40 flex items-center justify-center text-primary-foreground text-xs">
                  Story
                </div>
                <div className="w-1/2 p-3 flex flex-col items-center justify-center bg-muted/30">
                  <div className="text-xs text-muted-foreground">Visualizações</div>
                  <div className="relative size-16 mt-1">
                    <svg viewBox="0 0 36 36" className="size-16 -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" className="stroke-muted" strokeWidth="3" />
                      <circle cx="18" cy="18" r="15" fill="none" className="stroke-primary" strokeWidth="3" strokeDasharray={`${Math.min(100, (p.views / 1500) * 100)} 100`} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="font-bold text-sm">{fmtNum(p.views)}</div>
                    </div>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">em 24h</div>
                </div>
              </div>
              <div className="p-3 flex items-center justify-between text-xs border-t border-border">
                <div>
                  <div className="text-muted-foreground">{p.published_at}</div>
                  <div className="font-medium">{p.influencer?.name}</div>
                </div>
                <StatusBadge status={p.status === "Aprovada" ? "Aprovada" : "Pendente"} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Bottom charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <Card className="p-6 lg:col-span-1">
          <h3 className="font-semibold mb-1">Desempenho da Campanha</h3>
          <div className="flex gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-info inline-block" /> Meta de views</span>
            <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-primary inline-block" /> Views entregues</span>
          </div>
          <PerformanceChart />
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Views por Bairro</h3>
          <div className="flex items-center gap-4">
            <DonutChart />
            <ul className="text-xs space-y-1.5 flex-1">
              <Legend color="bg-info" label="Centro" pct="38%" v="2.601" />
              <Legend color="bg-primary" label="Jardim Norte" pct="26%" v="1.918" />
              <Legend color="bg-chart-4" label="Vila Nova" pct="22%" v="1.507" />
              <Legend color="bg-warning" label="Outros" pct="12%" v="824" />
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Top Influencers</h3>
          <ul className="space-y-3">
            {[...influencers].sort((a: any, b: any) => (b.avg_views || 0) - (a.avg_views || 0)).map((i: any) => (
              <li key={i.id} className="flex items-center gap-3 text-sm">
                <span className="w-20 truncate">{i.name}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(i.avg_views / 1500) * 100}%` }} />
                </div>
                <span className="font-semibold text-sm w-12 text-right">{fmtNum(i.avg_views || 0)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppLayout>
  );
}

function MiniStat({ label, value, sub, color = "foreground", small = false }: { label: string; value: string; sub?: string; color?: string; small?: boolean }) {
  const colorMap: Record<string, string> = {
    foreground: "text-foreground",
    primary: "text-primary",
    info: "text-info",
    destructive: "text-destructive",
  };
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`font-bold mt-1 ${small ? "text-base" : "text-xl"} ${colorMap[color]}`}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function Legend({ color, label, pct, v }: { color: string; label: string; pct: string; v: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`size-2.5 rounded-full ${color}`} />
      <span className="flex-1">{label}</span>
      <span className="text-muted-foreground">{pct} ({v})</span>
    </li>
  );
}

function PerformanceChart() {
  const points = [0, 8, 18, 30, 42, 55, 68];
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${(i / (points.length - 1)) * 280},${100 - p}`).join(" ");
  const goal = "M 0,95 L 280,5";
  return (
    <svg viewBox="0 0 280 100" className="w-full h-44">
      <path d={goal} className="stroke-info" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
      <path d={path} className="stroke-primary" strokeWidth="2.5" fill="none" />
      <circle cx="280" cy={100 - 68} r="3" className="fill-primary" />
      <text x="260" y={100 - 75} className="fill-primary text-[8px] font-bold">6.850</text>
    </svg>
  );
}

function DonutChart() {
  const segs = [
    { v: 38, color: "var(--info)" },
    { v: 26, color: "var(--primary)" },
    { v: 22, color: "var(--chart-4)" },
    { v: 14, color: "var(--warning)" },
  ];
  let offset = 0;
  const C = 2 * Math.PI * 16;
  return (
    <svg viewBox="0 0 40 40" className="size-32 -rotate-90">
      <circle cx="20" cy="20" r="16" fill="none" className="stroke-muted" strokeWidth="6" />
      {segs.map((s, i) => {
        const len = (s.v / 100) * C;
        const el = (
          <circle key={i} cx="20" cy="20" r="16" fill="none" stroke={s.color} strokeWidth="6" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset} />
        );
        offset += len;
        return el;
      })}
    </svg>
  );
}

// Helpers
export const calcInternalCost = (views: number, cpm = 20) => (views * cpm) / 1000;
export const fmtBRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const fmtNum = (n: number) => n.toLocaleString("pt-BR");

export function campaignTotals(c: any) {
  const viewsDelivered = (c?.campaign_influencers || []).reduce((s: number, i: any) => s + (i.views_delivered || 0), 0);
  const internalCost = (c?.campaign_influencers || []).reduce((s: number, i: any) => s + calcInternalCost(i.views_delivered || 0, c?.cpm_internal || 20), 0);
  const grossMargin = (c?.client_price || 0) - internalCost;
  const progress = Math.min(100, Math.round((viewsDelivered / (c?.views_goal || 1)) * 100));
  return { viewsDelivered, internalCost, grossMargin, progress };
}

import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Card, StatusBadge, Avatar } from "@/components/app-layout";
import { campaigns, payments, getInfluencer, getCampaign, campaignTotals, fmtBRL, fmtNum } from "@/lib/mock-data";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/financeiro")({
  head: () => ({ meta: [{ title: "Financeiro — Influence Local" }] }),
  component: Financeiro,
});

function Financeiro() {
  const revenue = campaigns.reduce((s, c) => s + c.clientPrice, 0);
  const cost = campaigns.reduce((s, c) => s + campaignTotals(c).internalCost, 0);
  const margin = revenue - cost;
  const marginPct = Math.round((margin / revenue) * 100);

  return (
    <AppLayout title="Financeiro interno" subtitle="Visível apenas para o administrador" actions={
      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1.5 rounded-md border border-primary/20"><Lock className="size-3" /> Interno</span>
    }>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Big label="Receita total" value={fmtBRL(revenue)} color="foreground" />
        <Big label="Custo com influencers" value={fmtBRL(cost)} color="destructive" />
        <Big label="Margem bruta" value={fmtBRL(margin)} color="primary" />
        <Big label="Margem percentual" value={`${marginPct}%`} color="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Campanhas mais lucrativas</h2>
          <ul className="space-y-3">
            {[...campaigns].sort((a, b) => campaignTotals(b).grossMargin - campaignTotals(a).grossMargin).map(c => {
              const t = campaignTotals(c);
              return (
                <li key={c.id} className="flex items-center gap-3 text-sm">
                  <span className="flex-1 truncate">{c.name}</span>
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.max(0, (t.grossMargin / revenue) * 200)}%` }} />
                  </div>
                  <span className="font-semibold w-24 text-right text-primary">{fmtBRL(t.grossMargin)}</span>
                </li>
              );
            })}
          </ul>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Influencers com melhor entrega</h2>
          <ul className="space-y-3 text-sm">
            {payments.slice(0, 5).map(p => {
              const inf = getInfluencer(p.influencerId)!;
              return (
                <li key={p.id} className="flex items-center gap-3">
                  <Avatar name={inf.name} />
                  <span className="flex-1">{inf.name}</span>
                  <span className="text-muted-foreground">{fmtNum(p.views)} views</span>
                  <span className="font-semibold w-20 text-right">{fmtBRL(p.amount)}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>

      <Card className="overflow-hidden mt-5">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Pagamentos para influencers</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>{["Influencer", "Campanha", "Views entregues", "Valor a pagar", "Status", "Data prevista"].map(h => <th key={h} className="text-left font-medium px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {payments.map(p => {
                const inf = getInfluencer(p.influencerId)!;
                const c = getCampaign(p.campaignId)!;
                return (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-3 flex items-center gap-2"><Avatar name={inf.name} /> {inf.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.name}</td>
                    <td className="px-4 py-3">{fmtNum(p.views)}</td>
                    <td className="px-4 py-3 font-semibold">{fmtBRL(p.amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-4 py-3 text-muted-foreground">{p.dueDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
}

function Big({ label, value, color }: { label: string; value: string; color: string }) {
  const map: Record<string, string> = { foreground: "text-foreground", primary: "text-primary", info: "text-info", destructive: "text-destructive" };
  return (
    <Card className="p-5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-3xl font-bold mt-2 ${map[color]}`}>{value}</div>
    </Card>
  );
}
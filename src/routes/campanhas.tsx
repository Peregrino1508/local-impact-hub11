import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout, Card, StatusBadge } from "@/components/app-layout";
import { campaigns, getClient, campaignTotals, fmtBRL, fmtNum } from "@/lib/mock-data";
import { Plus, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/campanhas")({
  head: () => ({ meta: [{ title: "Campanhas — Influence Local" }] }),
  component: CampanhasPage,
});

function CampanhasPage() {
  return (
    <AppLayout
      title="Campanhas"
      subtitle="Gerencie todas as suas campanhas de WhatsApp Status"
      actions={
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90">
          <Plus className="size-4" /> Nova Campanha
        </button>
      }
    >
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                {[
                  "Nome da campanha",
                  "Cliente",
                  "Meta",
                  "Entregues",
                  "Progresso",
                  "Cobrado",
                  "Custo interno",
                  "Margem",
                  "Status",
                  "",
                ].map((h) => (
                  <th key={h} className="text-left font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const t = campaignTotals(c);
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">
                      <Link to="/campanhas/$id" params={{ id: c.id }} className="hover:text-primary">{c.name}</Link>
                    </td>
                    <td className="px-4 py-3">{getClient(c.clientId)?.company}</td>
                    <td className="px-4 py-3">{fmtNum(c.viewsGoal)}</td>
                    <td className="px-4 py-3 text-primary font-semibold">{fmtNum(t.viewsDelivered)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${t.progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{t.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{fmtBRL(c.clientPrice)}</td>
                    <td className="px-4 py-3 text-destructive">{fmtBRL(t.internalCost)}</td>
                    <td className="px-4 py-3 text-primary font-semibold">{fmtBRL(t.grossMargin)}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-1.5 hover:bg-muted rounded"><MoreHorizontal className="size-4" /></button>
                    </td>
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
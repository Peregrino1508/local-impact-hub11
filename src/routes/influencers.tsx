import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Card, StatusBadge, Avatar } from "@/components/app-layout";
import { influencers, fmtNum } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/influencers")({
  head: () => ({ meta: [{ title: "Influencers — Influence Local" }] }),
  component: () => (
    <AppLayout title="Influencers" subtitle="Cadastro e gestão de influencers locais" actions={
      <button className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold"><Plus className="size-4" /> Nova Influencer</button>
    }>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>{["Nome", "Cidade", "Bairro", "WhatsApp", "Média views 24h", "Nicho", "Status", "Confiabilidade", "Última campanha"].map(h => <th key={h} className="text-left font-medium px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {influencers.map(i => (
                <tr key={i.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 flex items-center gap-2"><Avatar name={i.name} /> {i.name}</td>
                  <td className="px-4 py-3">{i.city}</td>
                  <td className="px-4 py-3">{i.neighborhood}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.whatsapp}</td>
                  <td className="px-4 py-3 font-semibold">{fmtNum(i.avgViews)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.niche}</td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-4 py-3"><StatusBadge status={i.reliability} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{i.lastCampaign ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  ),
});
import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Card, StatusBadge } from "@/components/app-layout";
import { proofs, getInfluencer, getCampaign, getClient, fmtNum } from "@/lib/mock-data";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/provas")({
  head: () => ({ meta: [{ title: "Provas de Entrega — Influence Local" }] }),
  component: () => (
    <AppLayout title="Provas de Entrega" subtitle="Organize prints e visualizações enviadas pelas influencers">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {proofs.map(p => {
          const inf = getInfluencer(p.influencerId)!;
          const c = getCampaign(p.campaignId)!;
          const client = getClient(c.clientId)!;
          return (
            <Card key={p.id} className="overflow-hidden">
              <div className="aspect-[16/10] bg-gradient-to-br from-sidebar via-info/40 to-primary/40 flex items-center justify-center text-primary-foreground text-sm font-medium">
                Print da postagem
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{inf.name}</div>
                    <div className="text-xs text-muted-foreground">{c.name} · {client.company}</div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="rounded-lg bg-muted/40 p-2">
                    <div className="text-[10px] text-muted-foreground">Tipo</div>
                    <div className="text-xs font-medium mt-0.5 truncate">{p.type}</div>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-2">
                    <div className="text-[10px] text-muted-foreground">Views</div>
                    <div className="text-sm font-bold text-primary mt-0.5">{fmtNum(p.views)}</div>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-2">
                    <div className="text-[10px] text-muted-foreground">Horário</div>
                    <div className="text-xs font-medium mt-0.5">{p.publishedAt}</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-primary text-primary-foreground py-2 text-sm font-semibold"><Check className="size-4" /> Aprovar</button>
                  <button className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-destructive/30 text-destructive py-2 text-sm font-semibold hover:bg-destructive/10"><X className="size-4" /> Reprovar</button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  ),
});
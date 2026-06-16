import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Card, StatusBadge } from "@/components/app-layout";
import { campaigns, getClient, campaignTotals, fmtNum } from "@/lib/mock-data";
import { FileDown, Link2, FileText } from "lucide-react";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Influence Local" }] }),
  component: Relatorios,
});

function Relatorios() {
  const c = campaigns[0];
  const t = campaignTotals(c);
  const client = getClient(c.clientId);
  return (
    <AppLayout title="Relatório do Cliente" subtitle="Versão limpa — apenas dados comerciais" actions={
      <div className="flex gap-2">
        <button className="inline-flex items-center gap-2 text-sm border border-border rounded-lg px-3 py-2 hover:bg-muted"><Link2 className="size-4" /> Copiar link</button>
        <button className="inline-flex items-center gap-2 text-sm border border-border rounded-lg px-3 py-2 hover:bg-muted"><FileDown className="size-4" /> Exportar PDF</button>
        <button className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold"><FileText className="size-4" /> Gerar relatório</button>
      </div>
    }>
      <Card className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between border-b border-border pb-6">
          <div>
            <div className="text-xs text-muted-foreground">RELATÓRIO DE CAMPANHA</div>
            <h2 className="text-2xl font-bold mt-1">{c.name}</h2>
            <p className="text-muted-foreground text-sm mt-1">Cliente: {client?.company} · Período: {c.startDate} ({c.durationHours}h)</p>
          </div>
          <StatusBadge status={c.status} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Stat label="Total entregue" value={`${fmtNum(t.viewsDelivered)} views`} accent />
          <Stat label="Meta contratada" value={`${fmtNum(c.viewsGoal)} views`} />
          <Stat label="% de entrega" value={`${t.progress}%`} />
          <Stat label="Influencers" value={String(c.influencers.length)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          <Card className="p-5">
            <h3 className="font-semibold mb-3">Bairros alcançados</h3>
            <ul className="space-y-2 text-sm">
              {["Centro", "Jardim Norte", "Vila Nova"].map(b => (
                <li key={b} className="flex justify-between"><span>{b}</span><span className="text-muted-foreground">São Paulo</span></li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <h3 className="font-semibold mb-3">Horários de publicação</h3>
            <div className="text-3xl font-bold text-primary">13:02 — 19:45</div>
            <p className="text-xs text-muted-foreground mt-2">Janela de exposição contínua durante o dia</p>
          </Card>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-3">Provas de postagem</h3>
          <div className="grid grid-cols-4 gap-3">
            {c.influencers.map(ci => (
              <div key={ci.influencerId} className="aspect-[9/16] rounded-xl bg-gradient-to-br from-sidebar to-primary/30" />
            ))}
          </div>
        </div>

        <div className="mt-6 bg-info/5 border border-info/20 rounded-lg p-4 text-sm text-info text-center">
          Este relatório contém apenas informações comerciais para o cliente.
        </div>
      </Card>
    </AppLayout>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${accent ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}
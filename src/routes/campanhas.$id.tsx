import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppLayout, Card, StatusBadge, Avatar } from "@/components/app-layout";
import { getCampaign, getClient, getInfluencer, campaignTotals, fmtBRL, fmtNum, calcInternalCost } from "@/lib/mock-data";
import { ArrowLeft, Lock } from "lucide-react";

export const Route = createFileRoute("/campanhas/$id")({
  head: () => ({ meta: [{ title: "Detalhe da Campanha — Influence Local" }] }),
  component: CampaignDetail,
  notFoundComponent: () => <div className="p-10">Campanha não encontrada.</div>,
});

function CampaignDetail() {
  const { id } = Route.useParams();
  const c = getCampaign(id);
  if (!c) throw notFound();
  const client = getClient(c.clientId);
  const t = campaignTotals(c);

  return (
    <AppLayout title={c.name} subtitle={`Cliente: ${client?.company}`} actions={
      <Link to="/campanhas" className="inline-flex items-center gap-2 text-sm border border-border rounded-lg px-3 py-2 hover:bg-muted">
        <ArrowLeft className="size-4" /> Voltar
      </Link>
    }>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Resumo da campanha</h2>
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <Row label="Status"><StatusBadge status={c.status} /></Row>
            <Row label="Data de início">{c.startDate}</Row>
            <Row label="Duração">{c.durationHours} horas</Row>
            <Row label="Meta de visualizações">{fmtNum(c.viewsGoal)}</Row>
            <Row label="Views entregues"><span className="text-primary font-semibold">{fmtNum(t.viewsDelivered)}</span></Row>
            <Row label="Progresso">{t.progress}%</Row>
            <Row label="Valor cobrado"><span className="font-semibold">{fmtBRL(c.clientPrice)}</span></Row>
            <Row label="Cupom geral">{c.generalCoupon ?? "—"}</Row>
          </dl>
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${t.progress}%` }} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Resumo interno</h2>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20">
              <Lock className="size-3" /> Interno
            </span>
          </div>
          <dl className="grid grid-cols-2 gap-y-3 text-sm">
            <Row label="Valor cobrado do cliente">{fmtBRL(c.clientPrice)}</Row>
            <Row label="Custo total com influencers"><span className="text-destructive font-semibold">{fmtBRL(t.internalCost)}</span></Row>
            <Row label="Margem bruta prevista"><span className="text-primary font-semibold">{fmtBRL(c.clientPrice - (c.viewsGoal * c.cpmInternal) / 1000)}</span></Row>
            <Row label="Margem bruta atual"><span className="text-primary font-semibold">{fmtBRL(t.grossMargin)}</span></Row>
            <Row label="CPM interno">{fmtBRL(c.cpmInternal)} / 1.000</Row>
            <Row label="CPM comercial">{fmtBRL(c.cpmCommercial)} / 1.000</Row>
          </dl>
        </Card>
      </div>

      <Card className="p-6 mt-5">
        <h2 className="font-semibold mb-4">Influencers da Campanha</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                {["Influencer", "Cidade/Bairro", "Views em 24h", "Status da postagem", "Prova enviada", "Cupom", "Pagamento interno"].map((h) => (
                  <th key={h} className="text-left font-medium px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {c.influencers.map((ci) => {
                const inf = getInfluencer(ci.influencerId)!;
                return (
                  <tr key={ci.influencerId} className="border-t border-border">
                    <td className="px-4 py-3 flex items-center gap-2"><Avatar name={inf.name} /> {inf.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{inf.city} / {inf.neighborhood}</td>
                    <td className="px-4 py-3">{fmtNum(ci.viewsDelivered)}</td>
                    <td className="px-4 py-3"><StatusBadge status={ci.postStatus} /></td>
                    <td className="px-4 py-3"><StatusBadge status={ci.proofStatus} /></td>
                    <td className="px-4 py-3 font-mono text-xs">{ci.coupon}</td>
                    <td className="px-4 py-3 font-semibold">{fmtBRL(calcInternalCost(ci.viewsDelivered, c.cpmInternal))}</td>
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right">{children}</dd>
    </>
  );
}
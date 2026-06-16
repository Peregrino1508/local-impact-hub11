import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Card, StatusBadge } from "@/components/app-layout";
import { clients, fmtBRL } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/clientes")({
  head: () => ({ meta: [{ title: "Clientes — Influence Local" }] }),
  component: () => (
    <AppLayout title="Clientes" subtitle="Cadastro e gestão de clientes" actions={
      <button className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold"><Plus className="size-4" /> Novo Cliente</button>
    }>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>{["Responsável", "Empresa", "WhatsApp", "Cidade", "Segmento", "Campanhas", "Total investido", "Status"].map(h => <th key={h} className="text-left font-medium px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{c.responsible}</td>
                  <td className="px-4 py-3">{c.company}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.whatsapp}</td>
                  <td className="px-4 py-3">{c.city}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.segment}</td>
                  <td className="px-4 py-3">{c.campaigns}</td>
                  <td className="px-4 py-3 font-semibold">{fmtBRL(c.totalInvested)}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  ),
});
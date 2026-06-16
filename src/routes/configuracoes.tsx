import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Card } from "@/components/app-layout";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Influence Local" }] }),
  component: Config,
});

function Field({ label, defaultValue, suffix }: { label: string; defaultValue: string; suffix?: string }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="mt-1 flex">
        <input defaultValue={defaultValue} className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/40" />
        {suffix && <span className="ml-2 self-center text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </label>
  );
}

function Toggle({ label, defaultChecked = true }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="size-5 accent-[color:var(--primary)]" />
    </label>
  );
}

function Config() {
  return (
    <AppLayout title="Configurações" subtitle="Ajustes financeiros e operacionais do sistema">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Configurações financeiras</h2>
          <div className="space-y-4">
            <Field label="CPM interno padrão" defaultValue="R$ 20" suffix="por 1.000 views" />
            <Field label="CPM comercial padrão" defaultValue="R$ 40" suffix="por 1.000 views" />
            <Field label="Valor mínimo por influencer" defaultValue="R$ 5,00" />
            <Field label="Arredondamento de pagamento" defaultValue="2 casas decimais" />
            <Field label="Moeda" defaultValue="Real brasileiro (BRL)" />
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="font-semibold mb-4">Configurações da operação</h2>
          <div className="space-y-4">
            <Field label="Duração padrão da campanha" defaultValue="24" suffix="horas" />
            <div className="pt-2">
              <Toggle label="Exigir prova de postagem" />
              <Toggle label="Exigir prova de visualizações" />
              <Toggle label="Aprovação manual de provas" />
              <Toggle label="Permitir relatório público para cliente" defaultChecked={false} />
            </div>
          </div>
        </Card>
      </div>
      <div className="flex justify-end mt-5">
        <button className="rounded-lg bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold">Salvar configurações</button>
      </div>
    </AppLayout>
  );
}
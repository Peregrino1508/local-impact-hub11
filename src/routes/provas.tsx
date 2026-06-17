import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Card, StatusBadge } from "@/components/app-layout";
import {
  proofs as initialProofs,
  influencers as initialInfluencers,
  campaigns as initialCampaigns,
  clients as initialClients,
  fmtNum,
  type Proof,
} from "@/lib/mock-data";
import { Check, X, UploadCloud, Calendar, Eye, Clock, Tag } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getConfig } from "./configuracoes";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/provas")({
  head: () => ({ meta: [{ title: "Provas de Entrega — Influence Local" }] }),
  component: ProvasPage,
});

// ─── Tipo estendido para suportar métricas diárias ───────────────────────────
export type ProofEntry = Proof & {
  date?: string;          // data de envio (YYYY-MM-DD)
  valorCalculado?: number;// R$ calculado sobre as views
  paymentStatus?: "Pendente" | "Liberado" | "Processando" | "Pago";
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function calcPagamento(views: number, cpm: number) {
  return (views * cpm) / 1000;
}

function fmtBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── Página ──────────────────────────────────────────────────────────────────
function ProvasPage() {
  // Carrega influencers e campanhas do localStorage (para incluir recém-cadastrados)
  const [influencers] = useState(() => {
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

  const [clients] = useState(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("memoria_clientes");
      if (s) return JSON.parse(s);
    }
    return initialClients;
  });

  const [data, setData] = useState<ProofEntry[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("memoria_provas");
      if (saved) return JSON.parse(saved);
    }
    return initialProofs;
  });

  const [open, setOpen] = useState(false);
  const [filterInfluencer, setFilterInfluencer] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    localStorage.setItem("memoria_provas", JSON.stringify(data));
  }, [data]);

  // ── Aprovar/reprovar prova ─────────────────────────────────────────────────
  const handleStatusChange = (id: string, newStatus: "Aprovada" | "Reprovada") => {
    setData(prev => prev.map(p => {
      if (p.id !== id) return p;
      // Se aprovando, calcula e libera o valor
      const cpm = getConfig().cpmInterno;
      const valorCalculado = newStatus === "Aprovada" ? calcPagamento(p.views, cpm) : 0;
      const updated = {
        ...p,
        status: newStatus,
        valorCalculado,
        paymentStatus: newStatus === "Aprovada" ? ("Liberado" as const) : ("Pendente" as const),
      };
      return updated;
    }));
    toast.success(`Prova ${newStatus.toLowerCase()} com sucesso!${newStatus === "Aprovada" ? " Pagamento liberado." : ""}`);
  };

  // ── Iniciar processamento de pagamento ────────────────────────────────────
  function handleStartProcessing(id: string) {
    setData(prev => prev.map(p => p.id === id ? { ...p, paymentStatus: "Processando" } : p));
    toast.info("⏳ Processando pagamento... Confirme após realizar a transferência.");
  }

  // ── Confirmar pagamento efetuado ───────────────────────────────────────────
  function handleConfirmPaid(id: string) {
    setData(prev => prev.map(p => p.id === id ? { ...p, paymentStatus: "Pago" } : p));
    toast.success("✅ Pagamento confirmado e registrado!");
  }

  // ── Upload de nova prova ───────────────────────────────────────────────────
  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const views = Number(formData.get("views"));
    const cpm = getConfig().cpmInterno;

    const newProof: ProofEntry = {
      id: "p" + Date.now(),
      influencerId: formData.get("influencerId") as string,
      campaignId: formData.get("campaignId") as string,
      type: formData.get("type") as any,
      publishedAt: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      collectedAt: "—",
      views,
      imageUrl: "",
      status: "Pendente",
      date: new Date().toLocaleDateString("pt-BR"),
      valorCalculado: calcPagamento(views, cpm),
      paymentStatus: "Pendente",
    };

    initialProofs.unshift(newProof as Proof);
    setData([newProof, ...data]);
    setOpen(false);
    toast.success(`📤 Prova enviada! Previsão de pagamento: ${fmtBRL(newProof.valorCalculado ?? 0)}`);
  }

  const { user } = useAuth();
  const myInf = influencers.find(
    (i: any) => i.email?.toLowerCase() === user?.email?.toLowerCase() || i.name?.toLowerCase() === user?.name?.toLowerCase()
  );

  // Se for influencer, só vê os seus próprios dados. Se for admin, vê tudo
  const baseData = user?.role === "influencer" && myInf ? data.filter(p => p.influencerId === myInf.id) : data;

  // ── Filtros ────────────────────────────────────────────────────────────────
  const filtered = baseData.filter(p => {
    if (filterInfluencer && p.influencerId !== filterInfluencer) return false;
    if (filterStatus && p.status !== filterStatus) return false;
    return true;
  });

  // ── Totalizadores da página ────────────────────────────────────────────────
  const totalPendente = baseData.filter(p => p.status === "Pendente").length;
  const totalAprovadas = baseData.filter(p => p.status === "Aprovada").length;
  const totalALiberar = baseData
    .filter(p => p.status === "Aprovada" && p.paymentStatus === "Liberado")
    .reduce((s, p) => s + (p.valorCalculado ?? 0), 0);
  const totalProcessando = baseData
    .filter(p => p.paymentStatus === "Processando")
    .reduce((s, p) => s + (p.valorCalculado ?? 0), 0);
  const totalPago = baseData
    .filter(p => p.paymentStatus === "Pago")
    .reduce((s, p) => s + (p.valorCalculado ?? 0), 0);


  return (
    <AppLayout
      title="Provas de Entrega"
      subtitle="Métricas diárias, aprovação e cálculo de pagamento por views"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity">
              <UploadCloud className="size-4" /> Subir Prova de Entrega
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader>
              <DialogTitle>Subir Prova de Entrega</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 mt-4">
              {user?.role === "influencer" ? (
                <input type="hidden" name="influencerId" value={myInf?.id || ""} />
              ) : (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Influencer</label>
                  <select required name="influencerId" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/50 text-sm">
                    <option value="">Selecione quem está enviando...</option>
                    {influencers.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Campanha vinculada</label>
                <select required name="campaignId" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/50 text-sm">
                  <option value="">Selecione a campanha...</option>
                  {campanhas.map((c: any) => <option key={c.id} value={c.id}>{c.name || c.nome}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tipo de Prova</label>
                <select required name="type" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/50 text-sm">
                  <option value="Print das visualizações">Print das visualizações (24h)</option>
                  <option value="Print da postagem">Print da postagem</option>
                  <option value="Gravação de tela">Gravação de tela</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Total de Visualizações Atingidas</label>
                <input required type="number" name="views" min={0}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  placeholder="Ex: 1500"
                />
                <p className="text-[10px] text-muted-foreground">
                  CPM configurado: R$ {getConfig().cpmInterno}/1.000 views · Valor estimado aparecerá após salvar.
                </p>
              </div>
              <DialogFooter className="pt-2">
                <DialogClose asChild>
                  <button type="button" className="px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted">Cancelar</button>
                </DialogClose>
                <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Enviar Prova</button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {/* ── Painel de resumo ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Aguardando aprovação", value: String(totalPendente), color: "text-yellow-400" },
          { label: "Provas aprovadas", value: String(totalAprovadas), color: "text-primary" },
          { label: "Processando pagamento", value: fmtBRL(totalProcessando), color: "text-orange-400" },
          { label: "Total já pago", value: fmtBRL(totalPago), color: "text-green-400" },
        ].map(s => (
          <Card key={s.label} className="p-4">
            <div className="text-xs text-muted-foreground">{s.label}</div>
            <div className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</div>
          </Card>
        ))}
      </div>

      {/* ── Filtros ────────────────────────────────────────────────────────── */}
      <Card className="p-4 mb-5 flex flex-wrap gap-3 items-center">
        {user?.role !== "influencer" && (
          <select value={filterInfluencer} onChange={e => setFilterInfluencer(e.target.value)}
            className="px-3 py-2 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary/40">
            <option value="">Todas as influencers</option>
            {influencers.map((i: any) => <option key={i.id} value={i.id}>{i.name}</option>)}
          </select>
        )}

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary/40">
          <option value="">Todos os status</option>
          <option value="Pendente">Pendente</option>
          <option value="Aprovada">Aprovada</option>
          <option value="Reprovada">Reprovada</option>
        </select>
        {(filterInfluencer || filterStatus) && (
          <button onClick={() => { setFilterInfluencer(""); setFilterStatus(""); }}
            className="text-xs text-primary hover:underline">Limpar filtros</button>
        )}
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} registro(s)</span>
      </Card>

      {/* ── Cards de provas ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(p => {
          const inf = influencers.find((i: any) => i.id === p.influencerId);
          const camp = campanhas.find((c: any) => c.id === p.campaignId);
          const cl = clients.find((c: any) => c.id === p.campaignId || c.company === p.campaignId);
          const campaignDisplayName = camp ? (camp.name || camp.nome) : (cl ? `${cl.company} (Geral)` : "Sem campanha");
          if (!inf) return null;

          const cpm = getConfig().cpmInterno;
          const valorEstimado = p.valorCalculado ?? calcPagamento(p.views, cpm);

          return (
            <Card key={p.id} className="overflow-hidden flex flex-col">
              {/* Cabeçalho colorido */}
              <div className="aspect-[16/9] bg-gradient-to-br from-sidebar via-info/30 to-primary/40 flex flex-col items-center justify-center gap-1 text-primary-foreground">
                <Eye className="size-8 opacity-50" />
                <span className="text-3xl font-bold">{fmtNum(p.views)}</span>
                <span className="text-xs opacity-70">visualizações</span>
              </div>

              <div className="p-4 flex flex-col gap-3 flex-1">
                {/* Influencer + status */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{inf.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[160px]">
                      {campaignDisplayName}
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-muted/40 p-2">
                    <div className="text-[10px] text-muted-foreground">Tipo</div>
                    <div className="text-[11px] font-medium mt-0.5 leading-tight">{p.type?.split(" ")[0]}</div>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-2">
                    <Clock className="size-3 text-muted-foreground mx-auto" />
                    <div className="text-[11px] font-medium mt-0.5">{p.publishedAt}</div>
                  </div>
                  <div className="rounded-lg bg-muted/40 p-2">
                    <Calendar className="size-3 text-muted-foreground mx-auto" />
                    <div className="text-[11px] font-medium mt-0.5">{p.date || "—"}</div>
                  </div>
                </div>

                {/* Cálculo de pagamento */}
                <div className={`rounded-xl p-3 text-center border ${
                  p.paymentStatus === "Pago"
                    ? "bg-green-500/10 border-green-500/20"
                    : p.paymentStatus === "Processando"
                    ? "bg-orange-500/10 border-orange-500/20"
                    : p.paymentStatus === "Liberado"
                    ? "bg-primary/10 border-primary/20"
                    : "bg-muted/30 border-border"
                }`}>
                  <div className="text-[10px] text-muted-foreground">
                    Valor calculado ({fmtNum(p.views)} views × R$ {cpm}/1k)
                  </div>
                  <div className={`text-xl font-bold mt-0.5 ${
                    p.paymentStatus === "Pago" ? "text-green-400" :
                    p.paymentStatus === "Processando" ? "text-orange-400" :
                    p.paymentStatus === "Liberado" ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {fmtBRL(valorEstimado)}
                  </div>
                  <div className="text-[10px] mt-1 flex items-center justify-center gap-1">
                    {p.paymentStatus === "Processando" && <span className="animate-pulse">⏳</span>}
                    <StatusBadge status={p.paymentStatus || "Pendente"} />
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-col gap-2 mt-auto">
                  {user?.role === "influencer" ? (
                    <div className="text-center py-2 text-xs font-semibold text-muted-foreground bg-muted/20 border border-border rounded-lg">
                      {p.status === "Pendente" ? "Aguardando aprovação" : p.status === "Aprovada" ? `Status: Aprovada (${p.paymentStatus || "Pendente"})` : "Status: Reprovada"}
                    </div>
                  ) : p.status === "Pendente" ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleStatusChange(p.id, "Aprovada")}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-primary text-primary-foreground py-2 text-sm font-semibold hover:opacity-90">
                        <Check className="size-4" /> Aprovar
                      </button>
                      <button onClick={() => handleStatusChange(p.id, "Reprovada")}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-destructive/30 text-destructive py-2 text-sm font-semibold hover:bg-destructive/10">
                        <X className="size-4" /> Reprovar
                      </button>
                    </div>
                  ) : p.status === "Aprovada" && p.paymentStatus === "Liberado" ? (
                    // Etapa 1: Iniciar processamento
                    <button onClick={() => handleStartProcessing(p.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 text-white py-2 text-sm font-semibold hover:opacity-90">
                      ⚡ Processar Pagamento
                    </button>
                  ) : p.status === "Aprovada" && p.paymentStatus === "Processando" ? (
                    // Etapa 2: Confirmar após transferência real
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[11px] text-orange-400 text-center animate-pulse">
                        ⏳ Realizou a transferência? Confirme abaixo.
                      </p>
                      <button onClick={() => handleConfirmPaid(p.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-600 text-white py-2 text-sm font-semibold hover:opacity-90">
                        ✅ Confirmar Pagamento
                      </button>
                    </div>
                  ) : (
                    <button disabled
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-muted text-muted-foreground py-2 text-sm font-semibold cursor-not-allowed">
                      {p.status === "Aprovada" && p.paymentStatus === "Pago" ? "✅ Pago" : "Reprovada"}
                    </button>
                  )}
                </div>

              </div>
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <UploadCloud className="size-12 mx-auto mb-3 opacity-20" />
            <p>Nenhuma prova encontrada para os filtros selecionados.</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
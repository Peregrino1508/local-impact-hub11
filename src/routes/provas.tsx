import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Card, StatusBadge } from "@/components/app-layout";
import { proofs as initialProofs, influencers, campaigns, getInfluencer, getCampaign, getClient, fmtNum, type Proof } from "@/lib/mock-data";
import { Check, X, UploadCloud } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/provas")({
  head: () => ({ meta: [{ title: "Provas de Entrega — Influence Local" }] }),
  component: ProvasPage,
});

function ProvasPage() {
  const [data, setData] = useState<Proof[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("memoria_provas");
      if (saved) return JSON.parse(saved);
    }
    return initialProofs;
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("memoria_provas", JSON.stringify(data));
  }, [data]);

  const handleStatusChange = (id: string, newStatus: "Aprovada" | "Reprovada") => {
    // Atualiza o array global simulando o backend
    const proofIndex = initialProofs.findIndex(p => p.id === id);
    if (proofIndex > -1) {
      initialProofs[proofIndex].status = newStatus;
    }
    
    // Atualiza o estado local para re-renderizar a UI
    setData(data.map(p => p.id === id ? { ...p, status: newStatus } : p));
    toast.success(`Prova ${newStatus.toLowerCase()} com sucesso!`);
  };

  function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProof: Proof = {
      id: "p" + Date.now(),
      influencerId: formData.get("influencerId") as string,
      campaignId: formData.get("campaignId") as string,
      type: formData.get("type") as any,
      publishedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      collectedAt: "—",
      views: Number(formData.get("views")),
      imageUrl: "",
      status: "Pendente"
    };

    // Adiciona ao início do array local e global
    initialProofs.unshift(newProof);
    setData([newProof, ...data]);
    setOpen(false);
    toast.success("Prova de entrega enviada!");
  }

  return (
    <AppLayout 
      title="Provas de Entrega" 
      subtitle="Organize prints e visualizações enviadas pelas influencers"
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity">
              <UploadCloud className="size-4" /> Subir Prova de Entrega
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Subir Prova de Entrega</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Influencer</label>
                <select required name="influencerId" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/50 text-sm">
                  <option value="">Selecione quem está enviando...</option>
                  {influencers.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Campanha vinculada</label>
                <select required name="campaignId" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/50 text-sm">
                  <option value="">Selecione a empresa/campanha...</option>
                  {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Tipo de Prova</label>
                <select required name="type" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/50 text-sm">
                  <option value="Print das visualizações">Print das visualizações</option>
                  <option value="Print da postagem">Print da postagem</option>
                  <option value="Gravação de tela">Gravação de tela</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Total de Visualizações Atingidas</label>
                <input required type="number" name="views" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Ex: 1500" />
              </div>
              <DialogFooter className="pt-4">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.map(p => {
          const inf = getInfluencer(p.influencerId);
          const c = p.campaignId ? getCampaign(p.campaignId) : null;
          const client = c ? getClient(c.clientId) : null;
          
          if (!inf) return null; // Previne erro caso influencer seja excluído
          
          return (
            <Card key={p.id} className="overflow-hidden">
              <div className="aspect-[16/10] bg-gradient-to-br from-sidebar via-info/40 to-primary/40 flex items-center justify-center text-primary-foreground text-sm font-medium">
                Print da postagem
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{inf.name}</div>
                    <div className="text-xs text-muted-foreground">{c ? `${c.name} · ${client?.company}` : "Sem campanha vinculada"}</div>
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
                  {p.status === "Pendente" ? (
                    <>
                      <button onClick={() => handleStatusChange(p.id, "Aprovada")} className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-primary text-primary-foreground py-2 text-sm font-semibold hover:opacity-90"><Check className="size-4" /> Aprovar</button>
                      <button onClick={() => handleStatusChange(p.id, "Reprovada")} className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-destructive/30 text-destructive py-2 text-sm font-semibold hover:bg-destructive/10"><X className="size-4" /> Reprovar</button>
                    </>
                  ) : (
                    <button disabled className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-muted text-muted-foreground py-2 text-sm font-semibold cursor-not-allowed">
                      Já Avaliada
                    </button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
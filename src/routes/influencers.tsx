import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Card, StatusBadge, Avatar } from "@/components/app-layout";
import { influencers as initialInfluencers, proofs as initialProofs, clients as initialClients, fmtNum, type Influencer, type Client } from "@/lib/mock-data";
import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/influencers")({
  head: () => ({ meta: [{ title: "Influencers — Influence Local" }] }),
  component: InfluencersPage,
});

function InfluencersPage() {
  const [data, setData] = useState<Influencer[]>(() => {
    // Carrega do armazenamento local do navegador, ou usa os iniciais se estiver vazio
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("memoria_influencers");
      if (saved) return JSON.parse(saved);
    }
    return initialInfluencers;
  });
  
  const [clientOptions] = useState<Client[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("memoria_clientes");
      if (saved) return JSON.parse(saved);
    }
    return initialClients;
  });

  const [open, setOpen] = useState(false);

  // Toda vez que a variável 'data' mudar, salvamos no navegador
  useEffect(() => {
    localStorage.setItem("memoria_influencers", JSON.stringify(data));
  }, [data]);

  function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta influencer? Isso também apagará todas as provas de entrega dela.")) return;

    // 1. Remove do estado local e atualiza localStorage (via useEffect)
    setData(prev => prev.filter(i => i.id !== id));

    // 2. Remove do array global na memória (mock)
    const infIndex = initialInfluencers.findIndex(i => i.id === id);
    if (infIndex > -1) initialInfluencers.splice(infIndex, 1);

    // 3. Remove todas as provas de entrega associadas a essa influencer no localStorage
    if (typeof window !== "undefined") {
      const savedProofsStr = localStorage.getItem("memoria_provas");
      if (savedProofsStr) {
        const provasAtuais = JSON.parse(savedProofsStr);
        const provasLimpas = provasAtuais.filter((p: any) => p.influencerId !== id);
        localStorage.setItem("memoria_provas", JSON.stringify(provasLimpas));
      }
    }

    toast.success("Influencer e seus dados foram excluídos permanentemente.");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newInfluencer: Influencer = {
      id: "i" + Date.now(),
      name: formData.get("name") as string,
      publicName: formData.get("publicName") as string,
      city: formData.get("city") as string,
      neighborhood: formData.get("neighborhood") as string,
      whatsapp: formData.get("whatsapp") as string,
      instagram: formData.get("instagram") as string,
      niche: formData.get("niche") as string,
      divulgationDays: Number(formData.get("divulgationDays")),
      avgViews: 0, // Removido do form, enviando 0 por padrão
      cpmInternal: 20, // default
      status: "Em teste",
      reliability: "Média",
    };

    // Adiciona ao início do array global para persistir durante a navegação
    initialInfluencers.unshift(newInfluencer);
    
    // NOVIDADE: Cria a prova de entrega automaticamente zerada
    const newProof = {
      id: "p" + Date.now(),
      influencerId: newInfluencer.id,
      campaignId: "", // Sem campanha por enquanto
      type: "Print das visualizações" as any,
      publishedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      collectedAt: "—",
      views: 0, // Zerado como solicitado
      imageUrl: "",
      status: "Pendente" as any
    };

    // Puxa as provas existentes no navegador para não sobrescrever, insere a nova e salva
    if (typeof window !== "undefined") {
      const savedProofsStr = localStorage.getItem("memoria_provas");
      let provasAtuais = savedProofsStr ? JSON.parse(savedProofsStr) : [...initialProofs];
      provasAtuais.unshift(newProof);
      localStorage.setItem("memoria_provas", JSON.stringify(provasAtuais));
    }
    
    setData([newInfluencer, ...data]);
    setOpen(false);
    toast.success("Influencer cadastrada com sucesso!");
  }

  return (
    <AppLayout 
      title="Influencers" 
      subtitle="Cadastro e gestão de influencers locais" 
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity">
              <Plus className="size-4" /> Nova Influencer
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Influencer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nome Completo</label>
                  <input required name="name" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Ex: Ana Souza" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nome Público (@)</label>
                  <input required name="publicName" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Ex: @anasouza" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">WhatsApp</label>
                  <input required name="whatsapp" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="(11) 99999-9999" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Onde irá divulgar</label>
                  <input name="instagram" defaultValue="Status de Whatsapp" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Onde costuma postar" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Cidade</label>
                  <input required name="city" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Ex: São Paulo" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Bairro / Região</label>
                  <input required name="neighborhood" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Ex: Centro" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Em qual empresa</label>
                  <select required name="niche" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/50 text-sm">
                    <option value="">Selecione uma empresa...</option>
                    {clientOptions.map(c => <option key={c.id} value={c.company}>{c.company}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Dias de divulgação na semana</label>
                  <select required name="divulgationDays" defaultValue="3" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/50 text-sm">
                    <option value="3">3 dias (Mínimo)</option>
                    <option value="4">4 dias</option>
                    <option value="5">5 dias</option>
                    <option value="6">6 dias</option>
                    <option value="7">7 dias (A semana toda)</option>
                  </select>
                </div>
              </div>
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <button type="button" className="px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted">Cancelar</button>
                </DialogClose>
                <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Salvar Cadastro</button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                {["Nome", "Cidade", "Bairro", "WhatsApp", "Em qual empresa", "Dias/Semana", "Status", "Confiabilidade", "Ações"].map(h => <th key={h} className="text-left font-medium px-4 py-3">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.map(i => (
                <tr key={i.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-3 flex items-center gap-2"><Avatar name={i.name} /> {i.name}</td>
                  <td className="px-4 py-3">{i.city}</td>
                  <td className="px-4 py-3">{i.neighborhood}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.whatsapp}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.niche}</td>
                  <td className="px-4 py-3 text-muted-foreground">{i.divulgationDays ? `${i.divulgationDays} dias` : "3 dias"}</td>
                  <td className="px-4 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-4 py-3"><StatusBadge status={i.reliability} /></td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(i.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors" title="Excluir Influencer">
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppLayout>
  );
}
import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Card, StatusBadge } from "@/components/app-layout";
import { clients as initialClients, influencers as initialInfluencers, fmtBRL, type Client, type Influencer } from "@/lib/mock-data";
import { Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { getConfig } from "./configuracoes";

export const Route = createFileRoute("/clientes")({
  head: () => ({ meta: [{ title: "Empresas — Influence Local" }] }),
  component: ClientesPage,
});

function ClientesPage() {
  // Estado das empresas
  const [data, setData] = useState<Client[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("memoria_clientes");
      if (saved) return JSON.parse(saved);
    }
    return initialClients;
  });
  
  // Estado dos influencers (para calcular a contagem)
  const [influencersData] = useState<Influencer[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("memoria_influencers");
      if (saved) return JSON.parse(saved);
    }
    return initialInfluencers;
  });

  const [open, setOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("memoria_clientes", JSON.stringify(data));
  }, [data]);

  function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta empresa?")) return;
    setData(prev => prev.filter(c => c.id !== id));
    
    const index = initialClients.findIndex(c => c.id === id);
    if (index > -1) initialClients.splice(index, 1);
    
    toast.success("Empresa excluída com sucesso!");
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newClient: Client = {
      id: "c" + Date.now(),
      company: formData.get("company") as string,
      responsible: formData.get("responsible") as string,
      whatsapp: formData.get("whatsapp") as string,
      email: formData.get("email") as string,
      city: formData.get("city") as string,
      segment: formData.get("segment") as string,
      campaigns: 0,
      totalInvested: 0,
      status: getConfig().statusPadraoNovoCliente,
    };

    const cfg = getConfig();
    initialClients.unshift(newClient);
    setData([newClient, ...data]);
    setOpen(false);
    if (cfg.notificarNovoCadastro) {
      toast.success(`🏢 Novo cliente cadastrado: ${newClient.company}`);
    }
  }

  return (
    <AppLayout 
      title="Empresas" 
      subtitle="Cadastro e gestão de empresas" 
      actions={
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity">
              <Plus className="size-4" /> Nova empresa
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Empresa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nome da Empresa</label>
                  <input required name="company" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Ex: Ótica Galeão" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Pessoa Responsável</label>
                  <input required name="responsible" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Ex: João Silva" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">WhatsApp</label>
                  <input required name="whatsapp" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="(11) 99999-9999" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">E-mail</label>
                  <input required type="email" name="email" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="contato@empresa.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Cidade</label>
                  <input required name="city" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Ex: Rio de Janeiro" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Segmento / Ramo</label>
                  <input required name="segment" className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Ex: Óticas, Alimentação..." />
                </div>
              </div>
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <button type="button" className="px-4 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted">Cancelar</button>
                </DialogClose>
                <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Salvar Empresa</button>
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
              <tr>{["Responsável", "Empresa", "WhatsApp", "Cidade", "Segmento", "Campanhas", "Total investido", "Status", "Ações"].map(h => <th key={h} className="text-left font-medium px-4 py-3">{h}</th>)}</tr>
            </thead>
            <tbody>
              {data.map(c => {
                const countCampanhas = influencersData.filter(i => 
                  i.niche?.trim().toLowerCase() === c.company.trim().toLowerCase()
                ).length;
                
                return (
                  <tr key={c.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{c.responsible}</td>
                    <td className="px-4 py-3">{c.company}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.whatsapp}</td>
                    <td className="px-4 py-3">{c.city}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.segment}</td>
                    <td className="px-4 py-3 font-semibold text-primary">{countCampanhas}</td>
                    <td className="px-4 py-3 font-semibold">{fmtBRL(c.totalInvested)}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors" title="Excluir Empresa">
                        <Trash2 className="size-4" />
                      </button>
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
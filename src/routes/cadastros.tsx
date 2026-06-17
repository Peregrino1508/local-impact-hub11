import { createFileRoute } from "@tanstack/react-router";
import { AppLayout, Card, StatusBadge, Avatar } from "@/components/app-layout";
import { getRegisteredUsers, setInfluencerStatus, adminUpdateInfluencerNiche } from "@/lib/auth";
import { useState, useEffect } from "react";
import { 
  Search, 
  MapPin, 
  ExternalLink, 
  Phone, 
  Mail, 
  Calendar,
  Building,
  User,
  Map,
  X,
  Check,
  Eye,
  Edit2
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/cadastros")({
  head: () => ({ meta: [{ title: "Cadastros de Influencers — Influence Local" }] }),
  component: CadastrosPage,
});

function CadastrosPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [isEditingNiche, setIsEditingNiche] = useState(false);
  const [editedNiche, setEditedNiche] = useState("");
  const [clientOptions, setClientOptions] = useState<any[]>([]);

  const loadUsers = () => {
    const allUsers = getRegisteredUsers();
    // Filtramos apenas usuários com papel de influencer
    setUsers(allUsers.filter(u => u.role === "influencer"));
  };

  useEffect(() => {
    loadUsers();
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("memoria_clientes");
      if (saved) setClientOptions(JSON.parse(saved));
    }
  }, []);

  const handleSaveNiche = () => {
    if (!selectedUser) return;
    
    // Atualiza no auth
    adminUpdateInfluencerNiche(selectedUser.email, editedNiche);
    
    // Atualiza a memoria global de influencers (painel)
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("memoria_influencers");
      if (saved) {
        const data = JSON.parse(saved);
        const updated = data.map((inf: any) => {
          if (inf.email?.toLowerCase() === selectedUser.email.toLowerCase()) {
            return { ...inf, niche: editedNiche };
          }
          return inf;
        });
        localStorage.setItem("memoria_influencers", JSON.stringify(updated));
      }
    }

    toast.success("Empresa atualizada com sucesso!");
    setIsEditingNiche(false);
    
    // Atualiza o usuario selecionado atualmente no modal
    setSelectedUser((prev: any) => ({
      ...prev,
      influencerProfile: { ...prev.influencerProfile, niche: editedNiche }
    }));
    
    // Recarrega a tabela de fundo
    loadUsers();
  };

  const handleApprove = (email: string) => {
    setInfluencerStatus(email, "approved");
    toast.success("Influencer aprovada com sucesso!");
    loadUsers();
    
    // Atualizar no storage das influencers também para refletir nas tabelas de campanhas
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("memoria_influencers");
      if (saved) {
        const data = JSON.parse(saved);
        const updated = data.map((inf: any) => {
          if (inf.email?.toLowerCase() === email.toLowerCase()) {
            return { ...inf, status: "Ativa" };
          }
          return inf;
        });
        localStorage.setItem("memoria_influencers", JSON.stringify(updated));
      }
    }

    if (selectedUser && selectedUser.email === email) {
      setSelectedUser((prev: any) => ({ ...prev, influencerStatus: "approved" }));
    }
  };

  const handleReject = (email: string) => {
    if (!confirm("Tem certeza que deseja recusar este cadastro?")) return;
    setInfluencerStatus(email, "need_profile");
    toast.error("Cadastro recusado. O usuário precisará preencher os dados novamente.");
    loadUsers();

    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("memoria_influencers");
      if (saved) {
        const data = JSON.parse(saved);
        const updated = data.filter((inf: any) => inf.email?.toLowerCase() !== email.toLowerCase());
        localStorage.setItem("memoria_influencers", JSON.stringify(updated));
      }
    }

    if (selectedUser && selectedUser.email === email) {
      setSelectedUser((prev: any) => ({ ...prev, influencerStatus: "need_profile" }));
    }
  };

  // Filtrar lista
  const filteredUsers = users.filter(u => {
    const nameMatch = (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (u.influencerProfile?.fullName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const whatsappMatch = (u.influencerProfile?.whatsapp || "").includes(searchTerm);
    
    const matchesSearch = nameMatch || emailMatch || whatsappMatch;
    
    if (statusFilter) {
      return matchesSearch && u.influencerStatus === statusFilter;
    }
    return matchesSearch;
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved": return "Ativa / Aprovada";
      case "pending_approval": return "Aguardando Aprovação";
      case "need_profile": return "Perfil Pendente";
      default: return status || "Não iniciado";
    }
  };

  return (
    <AppLayout 
      title="Cadastros de Influencers" 
      subtitle="Dados cadastrais completos de influencers registradas pelo portal de login"
    >
      <div className="flex flex-col gap-6">
        {/* Filtros */}
        <Card className="p-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center flex-1 max-w-2xl">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, e-mail ou whatsapp..."
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-[180px]"
            >
              <option value="">Todos os status</option>
              <option value="approved">Ativa / Aprovada</option>
              <option value="pending_approval">Aguardando Aprovação</option>
              <option value="need_profile">Perfil Pendente</option>
            </select>
          </div>

          <div className="text-xs text-muted-foreground">
            Exibindo {filteredUsers.length} de {users.length} cadastros
          </div>
        </Card>

        {/* Tabela de Cadastros */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-3 font-semibold">Influencer</th>
                  <th className="px-6 py-3 font-semibold">Contato / E-mail</th>
                  <th className="px-6 py-3 font-semibold">Região (Bairro/Cidade)</th>
                  <th className="px-6 py-3 font-semibold">Empresa Pretendida</th>
                  <th className="px-6 py-3 font-semibold">Status de Aprovação</th>
                  <th className="px-6 py-3 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredUsers.map(u => {
                  const hasProfile = !!u.influencerProfile;
                  const profile = u.influencerProfile || {};
                  const displayName = profile.fullName || u.name || "Sem Nome";
                  
                  return (
                    <tr key={u.email} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={displayName} />
                          <div>
                            <div className="font-semibold text-foreground">{displayName}</div>
                            {profile.publicName && (
                              <div className="text-xs text-primary font-medium">{profile.publicName}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-foreground flex items-center gap-1">
                            <Phone className="size-3 text-muted-foreground" /> {profile.whatsapp || "—"}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="size-3" /> {u.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {hasProfile ? (
                          <div>
                            <div>{profile.neighborhood}</div>
                            <div className="text-xs">{profile.city} - {profile.state}</div>
                          </div>
                        ) : (
                          <span className="text-xs italic text-orange-400">Perfil não preenchido</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {profile.niche ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                            <Building className="size-3" /> {profile.niche}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={u.influencerStatus || "need_profile"} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setEditedNiche(u.influencerProfile?.niche || "");
                              setIsEditingNiche(false);
                              setIsDetailsOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Ver Cadastro Completo"
                          >
                            <Eye className="size-4" />
                          </button>

                          {u.influencerStatus === "pending_approval" && (
                            <>
                              <button
                                onClick={() => handleApprove(u.email)}
                                className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                                title="Aprovar Influencer"
                              >
                                <Check className="size-4" />
                              </button>
                              <button
                                onClick={() => handleReject(u.email)}
                                className="p-1.5 rounded-lg border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 transition-colors"
                                title="Recusar Cadastro"
                              >
                                <X className="size-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-muted-foreground">
                      Nenhum cadastro de influencer encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Dialog de Detalhes Completos */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="size-5 text-primary" /> Ficha Cadastral da Influencer
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6 mt-4">
              {/* Resumo Perfil */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border">
                <Avatar name={selectedUser.influencerProfile?.fullName || selectedUser.name} />
                <div>
                  <h3 className="font-bold text-base">{selectedUser.influencerProfile?.fullName || selectedUser.name}</h3>
                  <div className="text-sm text-primary font-medium">{selectedUser.influencerProfile?.publicName || `@${selectedUser.name?.toLowerCase().replace(/\s+/g, "")}`}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">E-mail: {selectedUser.email}</div>
                </div>
                <div className="ml-auto">
                  <StatusBadge status={selectedUser.influencerStatus || "need_profile"} />
                </div>
              </div>

              {/* Detalhes Endereço e Dados */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">WhatsApp</span>
                  <div className="text-sm font-medium flex items-center gap-1.5">
                    <Phone className="size-4 text-primary" />
                    {selectedUser.influencerProfile?.whatsapp ? (
                      <a 
                        href={`https://wa.me/55${selectedUser.influencerProfile.whatsapp.replace(/\D/g, "")}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="hover:underline text-primary"
                      >
                        {selectedUser.influencerProfile.whatsapp} (Conversar)
                      </a>
                    ) : (
                      <span>—</span>
                    )}
                  </div>
                </div>

                <div className="space-y-1 relative">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Empresa Selecionada</span>
                  <div className="text-sm font-medium flex items-center gap-1.5 mt-1">
                    <Building className="size-4 text-primary shrink-0" />
                    {isEditingNiche ? (
                      <div className="flex items-center gap-2 w-full">
                        <select 
                          value={editedNiche} 
                          onChange={e => setEditedNiche(e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary/40 focus:outline-none"
                        >
                          <option value="">Selecione uma empresa...</option>
                          {clientOptions.map(c => <option key={c.id} value={c.company}>{c.company}</option>)}
                        </select>
                        <button 
                          onClick={handleSaveNiche}
                          className="p-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
                          title="Salvar Empresa"
                        >
                          <Check className="size-4" />
                        </button>
                        <button 
                          onClick={() => setIsEditingNiche(false)}
                          className="p-1.5 border border-border rounded-lg hover:bg-muted"
                          title="Cancelar"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="truncate">{selectedUser.influencerProfile?.niche || "Nenhuma"}</span>
                        <button 
                          onClick={() => {
                            setEditedNiche(selectedUser.influencerProfile?.niche || "");
                            setIsEditingNiche(true);
                          }}
                          className="ml-auto p-1.5 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-lg"
                          title="Alterar Empresa"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-1 col-span-2 border-t border-border/50 pt-3">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Endereço Completo</span>
                  <div className="text-sm font-medium flex items-center gap-2 mt-1">
                    <MapPin className="size-4 text-primary shrink-0" />
                    <span>
                      {selectedUser.influencerProfile?.address || "Não preenchido"}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bairro</span>
                  <div className="text-sm font-medium">{selectedUser.influencerProfile?.neighborhood || "—"}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">CEP</span>
                  <div className="text-sm font-medium">{selectedUser.influencerProfile?.cep || "—"}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cidade</span>
                  <div className="text-sm font-medium">{selectedUser.influencerProfile?.city || "—"}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado / UF</span>
                  <div className="text-sm font-medium">{selectedUser.influencerProfile?.state || "—"}</div>
                </div>

                {selectedUser.influencerProfile?.googleMapsLink && (
                  <div className="space-y-1 col-span-2 border-t border-border/50 pt-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Localização no Google Maps</span>
                    <div className="mt-1">
                      <a 
                        href={selectedUser.influencerProfile.googleMapsLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                      >
                        <Map className="size-4" /> Abrir no Google Maps <ExternalLink className="size-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Ações dentro dos Detalhes */}
              {selectedUser.influencerStatus === "pending_approval" && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      handleApprove(selectedUser.email);
                      setIsDetailsOpen(false);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Check className="size-4" /> Aprovar Cadastro
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedUser.email);
                      setIsDetailsOpen(false);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 py-2 text-sm font-semibold transition-colors"
                  >
                    <X className="size-4" /> Recusar Cadastro
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <DialogClose asChild>
                  <button className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors">
                    Fechar
                  </button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

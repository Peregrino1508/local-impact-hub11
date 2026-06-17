export type Influencer = {
  id: string;
  name: string;
  publicName: string;
  city: string;
  neighborhood: string;
  whatsapp: string;
  instagram?: string;
  niche: string;
  avgViews: number;
  cpmInternal: number;
  status: "Ativa" | "Em teste" | "Pausada" | "Bloqueada";
  reliability: "Alta" | "Média" | "Baixa";
  lastCampaign?: string;
  notes?: string;
  divulgationDays?: number;
};

export type Client = {
  id: string;
  responsible: string;
  company: string;
  whatsapp: string;
  email: string;
  city: string;
  segment: string;
  campaigns: number;
  totalInvested: number;
  status: "Ativo" | "Inativo";
  notes?: string;
};

export type CampaignInfluencer = {
  influencerId: string;
  viewsDelivered: number;
  postStatus: "Aguardando" | "Publicado" | "Finalizado" | "Não postou" | "Reprovado";
  proofStatus: "Pendente" | "Enviada" | "Aprovada" | "Reprovada";
  coupon: string;
};

export type Campaign = {
  id: string;
  name: string;
  clientId: string;
  product: string;
  startDate: string;
  durationHours: number;
  viewsGoal: number;
  clientPrice: number;
  cpmCommercial: number;
  cpmInternal: number;
  status: "Planejada" | "Em andamento" | "Concluída" | "Pausada" | "Cancelada";
  notes?: string;
  generalCoupon?: string;
  creative?: string;
  influencers: CampaignInfluencer[];
};

export type Proof = {
  id: string;
  influencerId: string;
  campaignId: string;
  type: "Print da postagem" | "Print das visualizações" | "Gravação de tela" | "Outro";
  publishedAt: string;
  collectedAt: string;
  views: number;
  imageUrl: string;
  status: "Pendente" | "Aprovada" | "Reprovada";
};

export type Payment = {
  id: string;
  influencerId: string;
  campaignId: string;
  views: number;
  amount: number;
  status: "Pendente" | "Pago" | "Em análise" | "Cancelado";
  dueDate: string;
};

export const clients: Client[] = [
  { id: "c1", responsible: "Carla Mendes", company: "Bella Moda", whatsapp: "(11) 98888-1111", email: "carla@bellamoda.com", city: "São Paulo", segment: "Moda feminina", campaigns: 6, totalInvested: 2400, status: "Ativo" },
  { id: "c2", responsible: "Rafael Costa", company: "Império Burger", whatsapp: "(11) 97777-2222", email: "rafael@imperioburger.com", city: "Guarulhos", segment: "Hamburgueria", campaigns: 4, totalInvested: 1800, status: "Ativo" },
  { id: "c3", responsible: "Fernanda Alves", company: "Studio Glam", whatsapp: "(11) 96666-3333", email: "fer@studioglam.com", city: "Osasco", segment: "Beleza", campaigns: 3, totalInvested: 1500, status: "Ativo" },
  { id: "c4", responsible: "Diretor", company: "Galeão Óticas", whatsapp: "(11) 95555-4444", email: "contato@galeaooticas.com", city: "São Paulo", segment: "Óticas", campaigns: 0, totalInvested: 0, status: "Ativo" },
];

export const influencers: Influencer[] = [
  { id: "i1", name: "Ana Souza", publicName: "@anasouza", whatsapp: "(11) 99000-1111", instagram: "@anasouza", city: "São Paulo", neighborhood: "Centro", niche: "Moda e lifestyle", avgViews: 530, cpmInternal: 20, status: "Ativa", reliability: "Alta", lastCampaign: "Bella Moda" },
  { id: "i2", name: "Maria Lima", publicName: "@marialima", whatsapp: "(11) 99000-2222", instagram: "@marialima", city: "São Paulo", neighborhood: "Jardim Norte", niche: "Beleza", avgViews: 820, cpmInternal: 20, status: "Ativa", reliability: "Alta", lastCampaign: "Bella Moda" },
  { id: "i3", name: "Luana Reis", publicName: "@luanareis", whatsapp: "(11) 99000-3333", instagram: "@luanareis", city: "São Paulo", neighborhood: "Vila Nova", niche: "Lifestyle local", avgViews: 1200, cpmInternal: 20, status: "Ativa", reliability: "Média", lastCampaign: "Bella Moda" },
  { id: "i4", name: "Camila Rocha", publicName: "@camilarocha", whatsapp: "(11) 99000-4444", instagram: "@camilarocha", city: "São Paulo", neighborhood: "Centro", niche: "Promoções locais", avgViews: 300, cpmInternal: 20, status: "Em teste", reliability: "Média", lastCampaign: "Bella Moda" },
  { id: "i5", name: "Ivina Bruna de Sa", publicName: "@ivina.bruna", whatsapp: "(11) 99000-5555", instagram: "@ivina.bruna", city: "São Paulo", neighborhood: "Zona Leste", niche: "Galeão Óticas", avgViews: 1500, cpmInternal: 20, status: "Ativa", reliability: "Alta", lastCampaign: "Galeão Óticas" },
  { id: "i6", name: "Susan Soares", publicName: "@susan.soares", whatsapp: "(11) 99000-6666", instagram: "@susan.soares", city: "São Paulo", neighborhood: "Zona Oeste", niche: "Galeão Óticas", avgViews: 2000, cpmInternal: 20, status: "Ativa", reliability: "Alta", lastCampaign: "Galeão Óticas" },
];

export const campaigns: Campaign[] = [
  {
    id: "cmp1",
    name: "Divulgação Loja Bella Moda",
    clientId: "c1",
    product: "Coleção primavera",
    startDate: "2026-06-15",
    durationHours: 24,
    viewsGoal: 10000,
    clientPrice: 400,
    cpmCommercial: 40,
    cpmInternal: 20,
    status: "Em andamento",
    generalCoupon: "BELLA10",
    creative: "Story com look do dia + cupom",
    influencers: [
      { influencerId: "i1", viewsDelivered: 530, postStatus: "Publicado", proofStatus: "Aprovada", coupon: "ANA10" },
      { influencerId: "i2", viewsDelivered: 820, postStatus: "Publicado", proofStatus: "Aprovada", coupon: "MARIA10" },
      { influencerId: "i3", viewsDelivered: 1200, postStatus: "Publicado", proofStatus: "Pendente", coupon: "LUANA10" },
      { influencerId: "i4", viewsDelivered: 300, postStatus: "Aguardando", proofStatus: "Pendente", coupon: "CAMILA10" },
    ],
  },
  {
    id: "cmp2",
    name: "Promo Combo Império",
    clientId: "c2",
    product: "Combo duplo R$ 29,90",
    startDate: "2026-06-14",
    durationHours: 24,
    viewsGoal: 8000,
    clientPrice: 320,
    cpmCommercial: 40,
    cpmInternal: 20,
    status: "Em andamento",
    generalCoupon: "BURGER10",
    influencers: [
      { influencerId: "i2", viewsDelivered: 800, postStatus: "Publicado", proofStatus: "Aprovada", coupon: "MARIA10" },
      { influencerId: "i3", viewsDelivered: 1100, postStatus: "Publicado", proofStatus: "Aprovada", coupon: "LUANA10" },
    ],
  },
  {
    id: "cmp3",
    name: "Lançamento Studio Glam",
    clientId: "c3",
    product: "Novo serviço de spa",
    startDate: "2026-06-10",
    durationHours: 24,
    viewsGoal: 6000,
    clientPrice: 280,
    cpmCommercial: 46,
    cpmInternal: 20,
    status: "Concluída",
    influencers: [
      { influencerId: "i1", viewsDelivered: 600, postStatus: "Finalizado", proofStatus: "Aprovada", coupon: "ANA10" },
      { influencerId: "i2", viewsDelivered: 900, postStatus: "Finalizado", proofStatus: "Aprovada", coupon: "MARIA10" },
    ],
  },
  {
    id: "cmp4",
    name: "Black Friday Bella",
    clientId: "c1",
    product: "Black Friday",
    startDate: "2026-06-12",
    durationHours: 24,
    viewsGoal: 12000,
    clientPrice: 500,
    cpmCommercial: 41,
    cpmInternal: 20,
    status: "Planejada",
    influencers: [],
  },
];

export const proofs: Proof[] = [
  { id: "p1", influencerId: "i1", campaignId: "cmp1", type: "Print das visualizações", publishedAt: "13:02", collectedAt: "13:02 +24h", views: 530, imageUrl: "", status: "Aprovada" },
  { id: "p2", influencerId: "i2", campaignId: "cmp1", type: "Print das visualizações", publishedAt: "14:15", collectedAt: "14:15 +24h", views: 820, imageUrl: "", status: "Aprovada" },
  { id: "p3", influencerId: "i3", campaignId: "cmp1", type: "Print das visualizações", publishedAt: "15:30", collectedAt: "15:30 +24h", views: 1200, imageUrl: "", status: "Pendente" },
  { id: "p4", influencerId: "i4", campaignId: "cmp1", type: "Print da postagem", publishedAt: "19:45", collectedAt: "—", views: 300, imageUrl: "", status: "Pendente" },
];

// Helpers
export const calcInternalCost = (views: number, cpm = 20) => (views * cpm) / 1000;
export const fmtBRL = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const fmtNum = (n: number) => n.toLocaleString("pt-BR");

export function campaignTotals(c: Campaign) {
  const viewsDelivered = c.influencers.reduce((s, i) => s + i.viewsDelivered, 0);
  const internalCost = c.influencers.reduce((s, i) => s + calcInternalCost(i.viewsDelivered, c.cpmInternal), 0);
  const grossMargin = c.clientPrice - internalCost;
  const progress = Math.min(100, Math.round((viewsDelivered / c.viewsGoal) * 100));
  return { viewsDelivered, internalCost, grossMargin, progress };
}

export const getClient = (id: string) => clients.find((c) => c.id === id);
export const getInfluencer = (id: string) => influencers.find((i) => i.id === id);
export const getCampaign = (id: string) => campaigns.find((c) => c.id === id);

export const payments: Payment[] = campaigns.flatMap((c) =>
  c.influencers.map((ci) => ({
    id: `${c.id}-${ci.influencerId}`,
    influencerId: ci.influencerId,
    campaignId: c.id,
    views: ci.viewsDelivered,
    amount: calcInternalCost(ci.viewsDelivered, c.cpmInternal),
    status: c.status === "Concluída" ? ("Pago" as const) : ("Pendente" as const),
    dueDate: c.startDate,
  })),
);
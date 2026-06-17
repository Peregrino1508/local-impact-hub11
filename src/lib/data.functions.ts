import { createServerFn } from "@tanstack/react-start";

export const seedDatabase = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Seed clients
  const { data: clientsData, error: clientsError } = await supabaseAdmin
    .from("clients")
    .insert([
      { responsible: "Carla Mendes", company: "Bella Moda", whatsapp: "(11) 98888-1111", email: "carla@bellamoda.com", city: "São Paulo", segment: "Moda feminina", campaigns: 6, total_invested: 2400, status: "Ativo" },
      { responsible: "Rafael Costa", company: "Império Burger", whatsapp: "(11) 97777-2222", email: "rafael@imperioburger.com", city: "Guarulhos", segment: "Hamburgueria", campaigns: 4, total_invested: 1800, status: "Ativo" },
      { responsible: "Fernanda Alves", company: "Studio Glam", whatsapp: "(11) 96666-3333", email: "fer@studioglam.com", city: "Osasco", segment: "Beleza", campaigns: 3, total_invested: 1500, status: "Ativo" },
    ])
    .select();

  if (clientsError) throw clientsError;

  const c1 = clientsData[0];
  const c2 = clientsData[1];
  const c3 = clientsData[2];

  // Seed influencers
  const { data: influencersData, error: influencersError } = await supabaseAdmin
    .from("influencers")
    .insert([
      { name: "Ana Souza", public_name: "@anasouza", whatsapp: "(11) 99000-1111", instagram: "@anasouza", city: "São Paulo", neighborhood: "Centro", niche: "Moda e lifestyle", avg_views: 530, cpm_internal: 20, status: "Ativa", reliability: "Alta", last_campaign: "Bella Moda" },
      { name: "Maria Lima", public_name: "@marialima", whatsapp: "(11) 99000-2222", instagram: "@marialima", city: "São Paulo", neighborhood: "Jardim Norte", niche: "Beleza", avg_views: 820, cpm_internal: 20, status: "Ativa", reliability: "Alta", last_campaign: "Bella Moda" },
      { name: "Luana Reis", public_name: "@luanareis", whatsapp: "(11) 99000-3333", instagram: "@luanareis", city: "São Paulo", neighborhood: "Vila Nova", niche: "Lifestyle local", avg_views: 1200, cpm_internal: 20, status: "Ativa", reliability: "Média", last_campaign: "Bella Moda" },
      { name: "Camila Rocha", public_name: "@camilarocha", whatsapp: "(11) 99000-4444", instagram: "@camilarocha", city: "São Paulo", neighborhood: "Centro", niche: "Promoções locais", avg_views: 300, cpm_internal: 20, status: "Em teste", reliability: "Média", last_campaign: "Bella Moda" },
    ])
    .select();

  if (influencersError) throw influencersError;

  const i1 = influencersData[0];
  const i2 = influencersData[1];
  const i3 = influencersData[2];
  const i4 = influencersData[3];

  // Seed campaigns
  const { data: campaignsData, error: campaignsError } = await supabaseAdmin
    .from("campaigns")
    .insert([
      { name: "Divulgação Loja Bella Moda", client_id: c1.id, product: "Coleção primavera", start_date: "2026-06-15", duration_hours: 24, views_goal: 10000, client_price: 400, cpm_commercial: 40, cpm_internal: 20, status: "Em andamento", general_coupon: "BELLA10", creative: "Story com look do dia + cupom" },
      { name: "Promo Combo Império", client_id: c2.id, product: "Combo duplo R$ 29,90", start_date: "2026-06-14", duration_hours: 24, views_goal: 8000, client_price: 320, cpm_commercial: 40, cpm_internal: 20, status: "Em andamento", general_coupon: "BURGER10" },
      { name: "Lançamento Studio Glam", client_id: c3.id, product: "Novo serviço de spa", start_date: "2026-06-10", duration_hours: 24, views_goal: 6000, client_price: 280, cpm_commercial: 46, cpm_internal: 20, status: "Concluída" },
      { name: "Black Friday Bella", client_id: c1.id, product: "Black Friday", start_date: "2026-06-12", duration_hours: 24, views_goal: 12000, client_price: 500, cpm_commercial: 41, cpm_internal: 20, status: "Planejada" },
    ])
    .select();

  if (campaignsError) throw campaignsError;

  const cmp1 = campaignsData[0];
  const cmp2 = campaignsData[1];
  const cmp3 = campaignsData[2];
  const cmp4 = campaignsData[3];

  // Seed campaign_influencers
  const { error: ciError } = await supabaseAdmin
    .from("campaign_influencers")
    .insert([
      { campaign_id: cmp1.id, influencer_id: i1.id, views_delivered: 530, post_status: "Publicado", proof_status: "Aprovada", coupon: "ANA10" },
      { campaign_id: cmp1.id, influencer_id: i2.id, views_delivered: 820, post_status: "Publicado", proof_status: "Aprovada", coupon: "MARIA10" },
      { campaign_id: cmp1.id, influencer_id: i3.id, views_delivered: 1200, post_status: "Publicado", proof_status: "Pendente", coupon: "LUANA10" },
      { campaign_id: cmp1.id, influencer_id: i4.id, views_delivered: 300, post_status: "Aguardando", proof_status: "Pendente", coupon: "CAMILA10" },
      { campaign_id: cmp2.id, influencer_id: i2.id, views_delivered: 800, post_status: "Publicado", proof_status: "Aprovada", coupon: "MARIA10" },
      { campaign_id: cmp2.id, influencer_id: i3.id, views_delivered: 1100, post_status: "Publicado", proof_status: "Aprovada", coupon: "LUANA10" },
      { campaign_id: cmp3.id, influencer_id: i1.id, views_delivered: 600, post_status: "Finalizado", proof_status: "Aprovada", coupon: "ANA10" },
      { campaign_id: cmp3.id, influencer_id: i2.id, views_delivered: 900, post_status: "Finalizado", proof_status: "Aprovada", coupon: "MARIA10" },
    ]);

  if (ciError) throw ciError;

  // Seed proofs
  const { error: proofsError } = await supabaseAdmin
    .from("proofs")
    .insert([
      { influencer_id: i1.id, campaign_id: cmp1.id, type: "Print das visualizações", published_at: "13:02", collected_at: "13:02 +24h", views: 530, image_url: "", status: "Aprovada" },
      { influencer_id: i2.id, campaign_id: cmp1.id, type: "Print das visualizações", published_at: "14:15", collected_at: "14:15 +24h", views: 820, image_url: "", status: "Aprovada" },
      { influencer_id: i3.id, campaign_id: cmp1.id, type: "Print das visualizações", published_at: "15:30", collected_at: "15:30 +24h", views: 1200, image_url: "", status: "Pendente" },
      { influencer_id: i4.id, campaign_id: cmp1.id, type: "Print da postagem", published_at: "19:45", collected_at: "—", views: 300, image_url: "", status: "Pendente" },
    ]);

  if (proofsError) throw proofsError;

  // Seed payments
  const calcInternalCost = (views: number, cpm = 20) => (views * cpm) / 1000;

  const paymentsData = [
    { influencer_id: i1.id, campaign_id: cmp1.id, views: 530, amount: calcInternalCost(530), status: "Pendente", due_date: "2026-06-15" },
    { influencer_id: i2.id, campaign_id: cmp1.id, views: 820, amount: calcInternalCost(820), status: "Pendente", due_date: "2026-06-15" },
    { influencer_id: i3.id, campaign_id: cmp1.id, views: 1200, amount: calcInternalCost(1200), status: "Pendente", due_date: "2026-06-15" },
    { influencer_id: i4.id, campaign_id: cmp1.id, views: 300, amount: calcInternalCost(300), status: "Pendente", due_date: "2026-06-15" },
    { influencer_id: i2.id, campaign_id: cmp2.id, views: 800, amount: calcInternalCost(800), status: "Pendente", due_date: "2026-06-14" },
    { influencer_id: i3.id, campaign_id: cmp2.id, views: 1100, amount: calcInternalCost(1100), status: "Pendente", due_date: "2026-06-14" },
    { influencer_id: i1.id, campaign_id: cmp3.id, views: 600, amount: calcInternalCost(600), status: "Pago", due_date: "2026-06-10" },
    { influencer_id: i2.id, campaign_id: cmp3.id, views: 900, amount: calcInternalCost(900), status: "Pago", due_date: "2026-06-10" },
  ];

  const { error: paymentsError } = await supabaseAdmin
    .from("payments")
    .insert(paymentsData);

  if (paymentsError) throw paymentsError;

  return { ok: true, message: "Database seeded successfully" };
});

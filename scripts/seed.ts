import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL || "https://irewbhcnazteojoirsyg.supabase.co",
  process.env.SUPABASE_PUBLISHABLE_KEY!,
  { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } }
);


async function seed() {
  // Seed clients
  const { data: clientsData, error: clientsError } = await supabase
    .from("clients")
    .insert([
      { responsible: "Carla Mendes", company: "Bella Moda", whatsapp: "(11) 98888-1111", email: "carla@bellamoda.com", city: "São Paulo", segment: "Moda feminina", campaigns: 6, total_invested: 2400, status: "Ativo" },
      { responsible: "Rafael Costa", company: "Império Burger", whatsapp: "(11) 97777-2222", email: "rafael@imperioburger.com", city: "Guarulhos", segment: "Hamburgueria", campaigns: 4, total_invested: 1800, status: "Ativo" },
      { responsible: "Fernanda Alves", company: "Studio Glam", whatsapp: "(11) 96666-3333", email: "fer@studioglam.com", city: "Osasco", segment: "Beleza", campaigns: 3, total_invested: 1500, status: "Ativo" },
    ])
    .select();

  if (clientsError) { console.error("clients error:", clientsError); process.exit(1); }

  const [c1, c2, c3] = clientsData!;

  // Seed influencers
  const { data: influencersData, error: influencersError } = await supabase
    .from("influencers")
    .insert([
      { name: "Ana Souza", public_name: "@anasouza", whatsapp: "(11) 99000-1111", instagram: "@anasouza", city: "São Paulo", neighborhood: "Centro", niche: "Moda e lifestyle", avg_views: 530, cpm_internal: 20, status: "Ativa", reliability: "Alta", last_campaign: "Bella Moda" },
      { name: "Maria Lima", public_name: "@marialima", whatsapp: "(11) 99000-2222", instagram: "@marialima", city: "São Paulo", neighborhood: "Jardim Norte", niche: "Beleza", avg_views: 820, cpm_internal: 20, status: "Ativa", reliability: "Alta", last_campaign: "Bella Moda" },
      { name: "Luana Reis", public_name: "@luanareis", whatsapp: "(11) 99000-3333", instagram: "@luanareis", city: "São Paulo", neighborhood: "Vila Nova", niche: "Lifestyle local", avg_views: 1200, cpm_internal: 20, status: "Ativa", reliability: "Média", last_campaign: "Bella Moda" },
      { name: "Camila Rocha", public_name: "@camilarocha", whatsapp: "(11) 99000-4444", instagram: "@camilarocha", city: "São Paulo", neighborhood: "Centro", niche: "Promoções locais", avg_views: 300, cpm_internal: 20, status: "Em teste", reliability: "Média", last_campaign: "Bella Moda" },
    ])
    .select();

  if (influencersError) { console.error("influencers error:", influencersError); process.exit(1); }

  const [i1, i2, i3, i4] = influencersData!;

  // Seed campaigns
  const { data: campaignsData, error: campaignsError } = await supabase
    .from("campaigns")
    .insert([
      { name: "Divulgação Loja Bella Moda", client_id: c1.id, product: "Coleção primavera", start_date: "2026-06-15", duration_hours: 24, views_goal: 10000, client_price: 400, cpm_commercial: 40, cpm_internal: 20, status: "Em andamento", general_coupon: "BELLA10", creative: "Story com look do dia + cupom" },
      { name: "Promo Combo Império", client_id: c2.id, product: "Combo duplo R$ 29,90", start_date: "2026-06-14", duration_hours: 24, views_goal: 8000, client_price: 320, cpm_commercial: 40, cpm_internal: 20, status: "Em andamento", general_coupon: "BURGER10" },
      { name: "Lançamento Studio Glam", client_id: c3.id, product: "Novo serviço de spa", start_date: "2026-06-10", duration_hours: 24, views_goal: 6000, client_price: 280, cpm_commercial: 46, cpm_internal: 20, status: "Concluída" },
      { name: "Black Friday Bella", client_id: c1.id, product: "Black Friday", start_date: "2026-06-12", duration_hours: 24, views_goal: 12000, client_price: 500, cpm_commercial: 41, cpm_internal: 20, status: "Planejada" },
    ])
    .select();

  if (campaignsError) { console.error("campaigns error:", campaignsError); process.exit(1); }

  const [cmp1, cmp2, cmp3, cmp4] = campaignsData!;

  // Seed campaign_influencers
  const { error: ciError } = await supabase.from("campaign_influencers").insert([
    { campaign_id: cmp1.id, influencer_id: i1.id, views_delivered: 530, post_status: "Publicado", proof_status: "Aprovada", coupon: "ANA10" },
    { campaign_id: cmp1.id, influencer_id: i2.id, views_delivered: 820, post_status: "Publicado", proof_status: "Aprovada", coupon: "MARIA10" },
    { campaign_id: cmp1.id, influencer_id: i3.id, views_delivered: 1200, post_status: "Publicado", proof_status: "Pendente", coupon: "LUANA10" },
    { campaign_id: cmp1.id, influencer_id: i4.id, views_delivered: 300, post_status: "Aguardando", proof_status: "Pendente", coupon: "CAMILA10" },
    { campaign_id: cmp2.id, influencer_id: i2.id, views_delivered: 800, post_status: "Publicado", proof_status: "Aprovada", coupon: "MARIA10" },
    { campaign_id: cmp2.id, influencer_id: i3.id, views_delivered: 1100, post_status: "Publicado", proof_status: "Aprovada", coupon: "LUANA10" },
    { campaign_id: cmp3.id, influencer_id: i1.id, views_delivered: 600, post_status: "Finalizado", proof_status: "Aprovada", coupon: "ANA10" },
    { campaign_id: cmp3.id, influencer_id: i2.id, views_delivered: 900, post_status: "Finalizado", proof_status: "Aprovada", coupon: "MARIA10" },
  ]);

  if (ciError) { console.error("campaign_influencers error:", ciError); process.exit(1); }

  // Seed proofs
  const { error: proofsError } = await supabase.from("proofs").insert([
    { influencer_id: i1.id, campaign_id: cmp1.id, type: "Print das visualizações", published_at: "13:02", collected_at: "13:02 +24h", views: 530, image_url: "", status: "Aprovada" },
    { influencer_id: i2.id, campaign_id: cmp1.id, type: "Print das visualizações", published_at: "14:15", collected_at: "14:15 +24h", views: 820, image_url: "", status: "Aprovada" },
    { influencer_id: i3.id, campaign_id: cmp1.id, type: "Print das visualizações", published_at: "15:30", collected_at: "15:30 +24h", views: 1200, image_url: "", status: "Pendente" },
    { influencer_id: i4.id, campaign_id: cmp1.id, type: "Print da postagem", published_at: "19:45", collected_at: "—", views: 300, image_url: "", status: "Pendente" },
  ]);

  if (proofsError) { console.error("proofs error:", proofsError); process.exit(1); }

  // Seed payments
  const calc = (v: number) => (v * 20) / 1000;
  const { error: paymentsError } = await supabase.from("payments").insert([
    { influencer_id: i1.id, campaign_id: cmp1.id, views: 530, amount: calc(530), status: "Pendente", due_date: "2026-06-15" },
    { influencer_id: i2.id, campaign_id: cmp1.id, views: 820, amount: calc(820), status: "Pendente", due_date: "2026-06-15" },
    { influencer_id: i3.id, campaign_id: cmp1.id, views: 1200, amount: calc(1200), status: "Pendente", due_date: "2026-06-15" },
    { influencer_id: i4.id, campaign_id: cmp1.id, views: 300, amount: calc(300), status: "Pendente", due_date: "2026-06-15" },
    { influencer_id: i2.id, campaign_id: cmp2.id, views: 800, amount: calc(800), status: "Pendente", due_date: "2026-06-14" },
    { influencer_id: i3.id, campaign_id: cmp2.id, views: 1100, amount: calc(1100), status: "Pendente", due_date: "2026-06-14" },
    { influencer_id: i1.id, campaign_id: cmp3.id, views: 600, amount: calc(600), status: "Pago", due_date: "2026-06-10" },
    { influencer_id: i2.id, campaign_id: cmp3.id, views: 900, amount: calc(900), status: "Pago", due_date: "2026-06-10" },
  ]);

  if (paymentsError) { console.error("payments error:", paymentsError); process.exit(1); }

  console.log("Seed completed successfully!");
}

seed();

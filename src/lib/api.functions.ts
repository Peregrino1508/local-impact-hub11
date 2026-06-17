import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function getSupabasePublic() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    }
  );
}

export const getClients = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase.from("clients").select("*").order("company");
  if (error) throw error;
  return data;
});

export const getInfluencers = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase.from("influencers").select("*").order("name");
  if (error) throw error;
  return data;
});

export const getCampaigns = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from("campaigns")
    .select(`
      *,
      client:clients(id, company),
      campaign_influencers(*, influencer:influencers(id, name, neighborhood))
    `)
    .order("start_date", { ascending: false });
  if (error) throw error;
  return data;
});

export const getProofs = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from("proofs")
    .select(`*, influencer:influencers(id, name)`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
});

export const getPayments = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from("payments")
    .select(`*, influencer:influencers(id, name)`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
});

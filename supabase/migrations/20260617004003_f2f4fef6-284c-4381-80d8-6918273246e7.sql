CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  responsible text NOT NULL,
  company text NOT NULL,
  whatsapp text NOT NULL,
  email text NOT NULL,
  city text NOT NULL,
  segment text NOT NULL,
  campaigns integer NOT NULL DEFAULT 0,
  total_invested numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Ativo',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.influencers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  public_name text NOT NULL,
  city text NOT NULL,
  neighborhood text NOT NULL,
  whatsapp text NOT NULL,
  instagram text,
  niche text NOT NULL,
  avg_views integer NOT NULL DEFAULT 0,
  cpm_internal numeric NOT NULL DEFAULT 20,
  status text NOT NULL DEFAULT 'Ativa',
  reliability text NOT NULL DEFAULT 'Média',
  last_campaign text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  product text NOT NULL,
  start_date text NOT NULL,
  duration_hours integer NOT NULL DEFAULT 24,
  views_goal integer NOT NULL DEFAULT 0,
  client_price numeric NOT NULL DEFAULT 0,
  cpm_commercial numeric NOT NULL DEFAULT 0,
  cpm_internal numeric NOT NULL DEFAULT 20,
  status text NOT NULL DEFAULT 'Planejada',
  notes text,
  general_coupon text,
  creative text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.campaign_influencers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  influencer_id uuid NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  views_delivered integer NOT NULL DEFAULT 0,
  post_status text NOT NULL DEFAULT 'Aguardando',
  proof_status text NOT NULL DEFAULT 'Pendente',
  coupon text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, influencer_id)
);

CREATE TABLE public.proofs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id uuid NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  type text NOT NULL,
  published_at text NOT NULL,
  collected_at text NOT NULL,
  views integer NOT NULL DEFAULT 0,
  image_url text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Pendente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id uuid NOT NULL REFERENCES public.influencers(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  views integer NOT NULL DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Pendente',
  due_date text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.influencers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_influencers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proofs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;

GRANT ALL ON public.clients TO service_role;
GRANT ALL ON public.influencers TO service_role;
GRANT ALL ON public.campaigns TO service_role;
GRANT ALL ON public.campaign_influencers TO service_role;
GRANT ALL ON public.proofs TO service_role;
GRANT ALL ON public.payments TO service_role;

-- RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_influencers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies (permissive para desenvolvimento até auth ser implementado)
CREATE POLICY "Allow all" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.influencers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.campaigns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.campaign_influencers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.proofs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON public.payments FOR ALL USING (true) WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_influencers_updated_at BEFORE UPDATE ON public.influencers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_campaign_influencers_updated_at BEFORE UPDATE ON public.campaign_influencers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_proofs_updated_at BEFORE UPDATE ON public.proofs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
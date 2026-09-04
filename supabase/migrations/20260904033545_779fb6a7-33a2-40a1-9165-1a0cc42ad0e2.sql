CREATE TABLE public.brics_partners (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  country text NOT NULL,
  feed text NOT NULL,
  metric text NOT NULL DEFAULT '',
  accuracy numeric NOT NULL DEFAULT 90,
  status text NOT NULL DEFAULT 'Live',
  records_shared integer NOT NULL DEFAULT 0,
  last_sync_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.brics_partners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brics_partners TO authenticated;
GRANT ALL ON public.brics_partners TO service_role;

ALTER TABLE public.brics_partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Partners are publicly viewable" ON public.brics_partners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated staff can add partners" ON public.brics_partners FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated staff can update partners" ON public.brics_partners FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated staff can delete partners" ON public.brics_partners FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_brics_partners_updated_at BEFORE UPDATE ON public.brics_partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.brics_sync_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id uuid NOT NULL REFERENCES public.brics_partners(id) ON DELETE CASCADE,
  records_shared integer NOT NULL DEFAULT 0,
  accuracy_after numeric NOT NULL DEFAULT 0,
  note text NOT NULL DEFAULT '',
  triggered_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX brics_sync_events_partner_id_idx ON public.brics_sync_events (partner_id);

GRANT SELECT ON public.brics_sync_events TO anon;
GRANT SELECT, INSERT ON public.brics_sync_events TO authenticated;
GRANT ALL ON public.brics_sync_events TO service_role;

ALTER TABLE public.brics_sync_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sync history is publicly viewable" ON public.brics_sync_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated staff can log syncs" ON public.brics_sync_events FOR INSERT TO authenticated WITH CHECK (true);

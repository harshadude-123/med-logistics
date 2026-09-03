CREATE TABLE public.facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  district text NOT NULL,
  map_x numeric NOT NULL DEFAULT 50,
  map_y numeric NOT NULL DEFAULT 50,
  beds_total integer NOT NULL DEFAULT 0,
  beds_free integer NOT NULL DEFAULT 0,
  personnel_roster integer NOT NULL DEFAULT 0,
  personnel_present integer NOT NULL DEFAULT 0,
  stock_health integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.facilities TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.facilities TO authenticated;
GRANT ALL ON public.facilities TO service_role;

ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Facilities are publicly viewable"
  ON public.facilities FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated staff can add facilities"
  ON public.facilities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated staff can update facilities"
  ON public.facilities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated staff can delete facilities"
  ON public.facilities FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_facilities_updated_at
  BEFORE UPDATE ON public.facilities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.stock_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'Essentials',
  units integer NOT NULL DEFAULT 0,
  reorder_at integer NOT NULL DEFAULT 0,
  capacity integer NOT NULL DEFAULT 0,
  days_to_depletion integer NOT NULL DEFAULT 0,
  expiry_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_stock_items_facility ON public.stock_items(facility_id);

GRANT SELECT ON public.stock_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_items TO authenticated;
GRANT ALL ON public.stock_items TO service_role;

ALTER TABLE public.stock_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stock is publicly viewable"
  ON public.stock_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated staff can add stock"
  ON public.stock_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated staff can update stock"
  ON public.stock_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated staff can delete stock"
  ON public.stock_items FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_stock_items_updated_at
  BEFORE UPDATE ON public.stock_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
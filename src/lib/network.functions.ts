import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type FacilityRow = {
  id: string;
  code: string;
  name: string;
  district: string;
  map_x: number;
  map_y: number;
  beds_total: number;
  beds_free: number;
  personnel_roster: number;
  personnel_present: number;
  stock_health: number;
};

export type StockRow = {
  id: string;
  facility_id: string;
  name: string;
  category: string;
  units: number;
  reorder_at: number;
  capacity: number;
  days_to_depletion: number;
  expiry_date: string | null;
};

export const getNetworkData = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ facilities: FacilityRow[]; stock: StockRow[] }> => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const url = process.env["SUPABASE_URL"]!;
    const client = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const [facilitiesRes, stockRes] = await Promise.all([
      client
        .from("facilities")
        .select(
          "id, code, name, district, map_x, map_y, beds_total, beds_free, personnel_roster, personnel_present, stock_health",
        )
        .order("code"),
      client
        .from("stock_items")
        .select("id, facility_id, name, category, units, reorder_at, capacity, days_to_depletion, expiry_date")
        .order("days_to_depletion"),
    ]);

    if (facilitiesRes.error) throw new Error(facilitiesRes.error.message);
    if (stockRes.error) throw new Error(stockRes.error.message);

    return {
      facilities: (facilitiesRes.data ?? []).map((f) => ({
        ...f,
        map_x: Number(f.map_x),
        map_y: Number(f.map_y),
      })) as FacilityRow[],
      stock: (stockRes.data ?? []) as StockRow[],
    };
  },
);

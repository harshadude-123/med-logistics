import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PartnerRow = {
  id: string;
  code: string;
  country: string;
  feed: string;
  metric: string;
  accuracy: number;
  status: string;
  records_shared: number;
  last_sync_at: string | null;
};

export type SyncEventRow = {
  id: string;
  partner_id: string;
  records_shared: number;
  accuracy_after: number;
  note: string;
  created_at: string;
};

export const getBricsData = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ partners: PartnerRow[]; events: SyncEventRow[] }> => {
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

    const [partnersRes, eventsRes] = await Promise.all([
      client
        .from("brics_partners")
        .select("id, code, country, feed, metric, accuracy, status, records_shared, last_sync_at")
        .order("accuracy", { ascending: false }),
      client
        .from("brics_sync_events")
        .select("id, partner_id, records_shared, accuracy_after, note, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (partnersRes.error) throw new Error(partnersRes.error.message);
    if (eventsRes.error) throw new Error(eventsRes.error.message);

    return {
      partners: (partnersRes.data ?? []).map((p) => ({
        ...p,
        accuracy: Number(p.accuracy),
      })) as PartnerRow[],
      events: (eventsRes.data ?? []).map((e) => ({
        ...e,
        accuracy_after: Number(e.accuracy_after),
      })) as SyncEventRow[],
    };
  },
);

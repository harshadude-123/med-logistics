import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { AppShell } from "@/components/health/AppShell";
import { Panel, PageHeader } from "@/components/health/primitives";
import { networkQueryOptions } from "@/lib/network-data";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/manage")({
  head: () => ({
    meta: [
      { title: "Manage Network Records — HealthChain AI" },
      {
        name: "description",
        content:
          "Add and update live PHC facility capacity, personnel attendance and medicine stock records for the national network.",
      },
      { property: "og:title", content: "Manage Network Records — HealthChain AI" },
      {
        property: "og:description",
        content: "Coordinator tools to keep facility, bed, personnel and stock records current.",
      },
    ],
  }),
  component: Manage,
});

const inputClass =
  "w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm outline-none focus:border-primary/60";

function Manage() {
  const { session, loading } = useSession();
  const queryClient = useQueryClient();
  const { data } = useQuery(networkQueryOptions);
  const facilities = data?.facilities ?? [];
  const stock = data?.stock ?? [];
  const [busy, setBusy] = useState(false);

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["network"] });
  }

  async function addFacility(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    const { error } = await supabase.from("facilities").insert({
      code: String(fd.get("code") ?? "").trim(),
      name: String(fd.get("name") ?? "").trim(),
      district: String(fd.get("district") ?? "").trim(),
      beds_total: Number(fd.get("beds_total") ?? 0),
      beds_free: Number(fd.get("beds_free") ?? 0),
      personnel_roster: Number(fd.get("personnel_roster") ?? 0),
      personnel_present: Number(fd.get("personnel_present") ?? 0),
      stock_health: Number(fd.get("stock_health") ?? 100),
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    form.reset();
    toast.success("Facility saved");
    await refresh();
  }

  async function addStock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setBusy(true);
    const { error } = await supabase.from("stock_items").insert({
      facility_id: String(fd.get("facility_id") ?? ""),
      name: String(fd.get("name") ?? "").trim(),
      category: String(fd.get("category") ?? "").trim(),
      units: Number(fd.get("units") ?? 0),
      reorder_at: Number(fd.get("reorder_at") ?? 0),
      capacity: Number(fd.get("capacity") ?? 0),
      days_to_depletion: Number(fd.get("days_to_depletion") ?? 0),
      expiry_date: String(fd.get("expiry_date") ?? "") || null,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    form.reset();
    toast.success("Stock record saved");
    await refresh();
  }

  async function remove(table: "facilities" | "stock_items", id: string) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await refresh();
  }

  if (loading) {
    return (
      <AppShell>
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </AppShell>
    );
  }

  if (!session) {
    return (
      <AppShell>
        <PageHeader
          eyebrow="Network Records"
          title="Sign in required"
          description="Only signed-in coordinators can add or update live facility and stock records."
        />
        <Link
          to="/auth"
          className="inline-flex rounded-lg border border-primary/50 px-3 py-2 text-xs text-primary"
        >
          Go to sign in
        </Link>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Network Records"
        title="Manage live records"
        description="Values entered here drive the Command Center and Resource Tracking dashboards."
      />

      <Panel title="Add facility" subtitle="PHC capacity & attendance">
        <form onSubmit={addFacility} className="grid grid-cols-2 gap-2">
          <input name="code" required placeholder="Code (PHC-01)" className={inputClass} />
          <input name="name" required placeholder="Facility name" className={inputClass} />
          <input name="district" required placeholder="District" className={inputClass} />
          <input name="stock_health" type="number" min={0} max={100} placeholder="Stock health %" className={inputClass} />
          <input name="beds_total" type="number" min={0} placeholder="Beds total" className={inputClass} />
          <input name="beds_free" type="number" min={0} placeholder="Beds free" className={inputClass} />
          <input name="personnel_roster" type="number" min={0} placeholder="Roster" className={inputClass} />
          <input name="personnel_present" type="number" min={0} placeholder="Present" className={inputClass} />
          <button
            type="submit"
            disabled={busy}
            className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-60"
          >
            <Plus className="size-3.5" /> Save facility
          </button>
        </form>

        {facilities.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {facilities.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs"
              >
                <span className="truncate">
                  <span className="font-mono">{f.code}</span> · {f.name}
                </span>
                <button
                  type="button"
                  aria-label={`Delete ${f.name}`}
                  onClick={() => remove("facilities", f.id)}
                  className="text-muted-foreground hover:text-critical"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Add stock record" subtitle="Medicine & cold chain inventory">
        {facilities.length === 0 ? (
          <p className="text-xs text-muted-foreground">Add a facility first.</p>
        ) : (
          <form onSubmit={addStock} className="grid grid-cols-2 gap-2">
            <select name="facility_id" required className={`${inputClass} col-span-2`}>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.code} — {f.name}
                </option>
              ))}
            </select>
            <input name="name" required placeholder="Item name" className={inputClass} />
            <input name="category" required placeholder="Category" className={inputClass} />
            <input name="units" type="number" min={0} placeholder="Units" className={inputClass} />
            <input name="reorder_at" type="number" min={0} placeholder="Reorder floor" className={inputClass} />
            <input name="capacity" type="number" min={0} placeholder="Capacity" className={inputClass} />
            <input
              name="days_to_depletion"
              type="number"
              min={0}
              placeholder="Days to depletion"
              className={inputClass}
            />
            <input name="expiry_date" type="date" className={`${inputClass} col-span-2`} />
            <button
              type="submit"
              disabled={busy}
              className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-60"
            >
              <Plus className="size-3.5" /> Save stock record
            </button>
          </form>
        )}

        {stock.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {stock.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2 text-xs"
              >
                <span className="truncate">
                  {s.name} · <span className="font-mono">{s.units}</span> units
                </span>
                <button
                  type="button"
                  aria-label={`Delete ${s.name}`}
                  onClick={() => remove("stock_items", s.id)}
                  className="text-muted-foreground hover:text-critical"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}

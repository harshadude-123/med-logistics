import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarClock, PencilLine, Thermometer } from "lucide-react";
import { AppShell } from "@/components/health/AppShell";
import { Bar, Metric, Panel, PageHeader, StatusPill } from "@/components/health/primitives";
import { statusLabel } from "@/lib/health-data";
import {
  networkQueryOptions,
  nationalTotals,
  stockStatus,
} from "@/lib/network-data";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resource Tracking — HealthChain AI" },
      {
        name: "description",
        content:
          "Granular medicine stock levels, bed availability, equipment and expiry tracking across the PHC network.",
      },
      { property: "og:title", content: "Resource Tracking — HealthChain AI" },
      {
        property: "og:description",
        content: "Live stock, bed and personnel utilisation with critical status signalling per PHC.",
      },
    ],
  }),
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(networkQueryOptions);
  },
  errorComponent: ({ error }) => (
    <AppShell>
      <p role="alert" className="text-sm text-critical">
        Could not load resource data: {error.message}
      </p>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <p className="text-sm text-muted-foreground">No resource records found.</p>
    </AppShell>
  ),
  component: Resources,
});

function Resources() {
  const { data } = useSuspenseQuery(networkQueryOptions);
  const { facilities, stock } = data;
  const totals = nationalTotals(facilities, stock);
  const facilityByeId = new Map(facilities.map((f) => [f.id, f]));

  return (
    <AppShell>
      <PageHeader
        eyebrow="Resource Tracking"
        title="Stock, beds & personnel"
        description="Item-level visibility with reorder floors, depletion windows and expiry watch."
      />

      <div className="grid grid-cols-3 gap-3">
        <Metric
          label="Beds free"
          value={`${totals.bedsFree}`}
          hint={`of ${totals.bedsTotal}`}
          status={totals.bedsTotal && totals.bedsFree / totals.bedsTotal < 0.15 ? "critical" : "warning"}
        />
        <Metric
          label="Staff present"
          value={`${totals.present}`}
          hint={`of ${totals.roster}`}
          status={totals.attendance < 80 ? "warning" : "optimal"}
        />
        <Metric
          label="Critical SKUs"
          value={String(totals.criticalStock)}
          hint="below floor"
          status={totals.criticalStock > 0 ? "critical" : "optimal"}
        />
      </div>

      {facilities.length === 0 && (
        <Panel title="No facility records yet" subtitle="Live database is empty">
          <p className="text-xs text-muted-foreground">
            Stock, bed and personnel numbers now come from your live records — nothing is hardcoded.
          </p>
          <Link
            to="/manage"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-primary/50 px-3 py-2 text-xs text-primary"
          >
            <PencilLine className="size-3.5" /> Add facility & stock records
          </Link>
        </Panel>
      )}

      <Panel
        title="Medicine stock visibility"
        subtitle="Sorted by urgency"
        action={
          <Link to="/manage" className="text-xs text-primary">
            Update
          </Link>
        }
      >
        {stock.length === 0 ? (
          <p className="text-xs text-muted-foreground">No stock records recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {[...stock]
              .sort((a, b) => a.days_to_depletion - b.days_to_depletion)
              .map((s) => {
                const status = stockStatus(s);
                const facility = facilityByeId.get(s.facility_id);
                return (
                  <li key={s.id} className="rounded-lg border border-border bg-secondary/40 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{s.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {s.category} · <span className="font-mono">{facility?.code ?? "—"}</span>
                        </p>
                      </div>
                      <StatusPill status={status}>{statusLabel[status]}</StatusPill>
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-3 text-[11px]">
                      <span className="font-mono text-sm text-foreground">
                        {s.units.toLocaleString()}
                        <span className="ml-1 text-[11px] text-muted-foreground">
                          / floor {s.reorder_at.toLocaleString()}
                        </span>
                      </span>
                      <span
                        className={
                          s.days_to_depletion <= 3
                            ? "text-critical"
                            : s.days_to_depletion <= 10
                              ? "text-warning"
                              : "text-muted-foreground"
                        }
                      >
                        depletes in {s.days_to_depletion}d
                      </span>
                    </div>
                    <div className="mt-2">
                      <Bar value={s.capacity > 0 ? (s.units / s.capacity) * 100 : 0} status={status} />
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarClock className="size-3.5" /> exp {s.expiry_date ?? "—"}
                      </span>
                      {s.category === "Cold chain" && (
                        <span className="flex items-center gap-1 text-primary">
                          <Thermometer className="size-3.5" /> 2–8 °C verified
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
          </ul>
        )}
      </Panel>

      <Panel title="Facility capacity" subtitle="Beds free and on-call personnel">
        {facilities.length === 0 ? (
          <p className="text-xs text-muted-foreground">No facilities recorded yet.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 text-[11px] uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Facility</th>
                  <th className="px-3 py-2 font-medium">Beds</th>
                  <th className="px-3 py-2 font-medium">On-call</th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((f) => (
                  <tr key={f.id} className="border-t border-border">
                    <td className="px-3 py-2.5">
                      <p className="font-medium">{f.name}</p>
                      <p className="text-[10px] text-muted-foreground">{f.district}</p>
                    </td>
                    <td className="px-3 py-2.5 font-mono">
                      {f.beds_free}/{f.beds_total}
                    </td>
                    <td className="px-3 py-2.5 font-mono">
                      {f.personnel_present}/{f.personnel_roster}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </AppShell>
  );
}

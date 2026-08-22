import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Thermometer } from "lucide-react";
import { AppShell } from "@/components/health/AppShell";
import { Bar, Metric, Panel, PageHeader, StatusPill } from "@/components/health/primitives";
import { NODES, STOCK, statusLabel } from "@/lib/health-data";

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
  component: Resources,
});

function Resources() {
  const totalBedsFree = NODES.reduce((s, n) => s + n.beds.free, 0);
  const totalBeds = NODES.reduce((s, n) => s + n.beds.total, 0);
  const staffPresent = NODES.reduce((s, n) => s + n.personnel.present, 0);
  const staffRoster = NODES.reduce((s, n) => s + n.personnel.roster, 0);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Resource Tracking"
        title="Stock, beds & personnel"
        description="Item-level visibility with reorder floors, depletion windows and expiry watch."
      />

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Beds free" value={`${totalBedsFree}`} hint={`of ${totalBeds}`} status="warning" />
        <Metric label="Staff present" value={`${staffPresent}`} hint={`of ${staffRoster}`} status="warning" />
        <Metric label="Critical SKUs" value="2" hint="below floor" status="critical" />
      </div>

      <Panel title="Medicine stock visibility" subtitle="Sorted by urgency">
        <ul className="space-y-3">
          {[...STOCK]
            .sort((a, b) => a.daysToDepletion - b.daysToDepletion)
            .map((s) => (
              <li key={s.name} className="rounded-lg border border-border bg-secondary/40 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {s.category} · <span className="font-mono">{s.node}</span>
                    </p>
                  </div>
                  <StatusPill status={s.status}>{statusLabel[s.status]}</StatusPill>
                </div>

                <div className="mt-3 flex items-end justify-between gap-3 text-[11px]">
                  <span className="font-mono text-sm text-foreground">
                    {s.units.toLocaleString()}
                    <span className="ml-1 text-[11px] text-muted-foreground">
                      / floor {s.reorderAt.toLocaleString()}
                    </span>
                  </span>
                  <span
                    className={
                      s.daysToDepletion <= 3
                        ? "text-critical"
                        : s.daysToDepletion <= 10
                          ? "text-warning"
                          : "text-muted-foreground"
                    }
                  >
                    depletes in {s.daysToDepletion}d
                  </span>
                </div>
                <div className="mt-2">
                  <Bar value={(s.units / s.capacity) * 100} status={s.status} />
                </div>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarClock className="size-3.5" /> exp {s.expiry}
                  </span>
                  {s.category === "Cold chain" && (
                    <span className="flex items-center gap-1 text-primary">
                      <Thermometer className="size-3.5" /> 2–8 °C verified
                    </span>
                  )}
                </div>
              </li>
            ))}
        </ul>
      </Panel>

      <Panel title="Facility capacity" subtitle="Beds free and on-call personnel">
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
              {NODES.map((n) => (
                <tr key={n.id} className="border-t border-border">
                  <td className="px-3 py-2.5">
                    <p className="font-medium">{n.name}</p>
                    <p className="text-[10px] text-muted-foreground">{n.district}</p>
                  </td>
                  <td className="px-3 py-2.5 font-mono">
                    {n.beds.free}/{n.beds.total}
                  </td>
                  <td className="px-3 py-2.5 font-mono">
                    {n.personnel.present}/{n.personnel.roster}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AppShell>
  );
}

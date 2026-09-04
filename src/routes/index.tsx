import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AlertTriangle, ArrowRight, Users, BedDouble, PackageCheck } from "lucide-react";
import { AppShell } from "@/components/health/AppShell";
import { SignInDialog } from "@/components/health/SignInDialog";
import { Bar, Metric, Panel, PageHeader, StatusDot, StatusPill } from "@/components/health/primitives";
import { statusLabel } from "@/lib/health-data";
import {
  networkQueryOptions,
  nationalTotals,
  facilityStatus,
  stockStatus,
  type FacilityRow,
  type StockRow,
} from "@/lib/network-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HealthChain AI — National PHC Command Center" },
      {
        name: "description",
        content:
          "Real-time national visibility into medicine stocks, bed availability and personnel attendance across the PHC network.",
      },
      { property: "og:title", content: "HealthChain AI — National PHC Command Center" },
      {
        property: "og:description",
        content:
          "Federated AI command center for medicine stock, bed and personnel visibility across a nation's PHC network.",
      },
    ],
  }),
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(networkQueryOptions);
  },
  errorComponent: ({ error }) => (
    <AppShell>
      <p role="alert" className="text-sm text-critical">
        Could not load network telemetry: {error.message}
      </p>
    </AppShell>
  ),
  component: CommandCenter,
});

function NetworkMap({ facilities, online }: { facilities: FacilityRow[]; online: number }) {
  const links = facilities
    .slice(1)
    .map((f, i) => ({ from: facilities[i]!, to: f }))
    .slice(0, 8);

  return (
    <div className="relative h-56 overflow-hidden rounded-xl border border-border grid-mesh bg-secondary/30">
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {links.map(({ from, to }) => (
          <line
            key={`${from.id}-${to.id}`}
            x1={from.map_x}
            y1={from.map_y}
            x2={to.map_x}
            y2={to.map_y}
            className="route-flow stroke-primary/60"
            strokeWidth={0.4}
          />
        ))}
      </svg>
      {facilities.map((f) => {
        const status = facilityStatus(f);
        return (
          <div
            key={f.id}
            title={`${f.code} · ${f.name}`}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${f.map_x}%`, top: `${f.map_y}%` }}
          >
            <StatusDot status={status} pulse={status !== "optimal"} />
          </div>
        );
      })}
      <div className="absolute bottom-2 left-2 flex flex-wrap gap-2 rounded-lg bg-background/70 px-2 py-1.5 backdrop-blur">
        {(["optimal", "warning", "critical"] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <StatusDot status={s} />
            {statusLabel[s]}
          </span>
        ))}
      </div>
      <p className="absolute right-2 top-2 rounded-lg bg-background/70 px-2 py-1 font-mono text-[10px] text-primary backdrop-blur">
        {online.toLocaleString()} nodes live
      </p>
    </div>
  );
}

function buildAlerts(facilities: FacilityRow[], stock: StockRow[]) {
  const byId = new Map(facilities.map((f) => [f.id, f]));
  const stockAlerts = stock
    .filter((s) => stockStatus(s) !== "optimal")
    .sort((a, b) => a.days_to_depletion - b.days_to_depletion)
    .slice(0, 5)
    .map((s) => {
      const facility = byId.get(s.facility_id);
      const severity = stockStatus(s);
      return {
        id: `STK-${s.id.slice(0, 4).toUpperCase()}`,
        severity,
        title: `${s.name} stock-out in ${s.days_to_depletion}d`,
        node: `${facility?.code ?? "—"} · ${facility?.name ?? "Unknown facility"}`,
        detail: `${s.units.toLocaleString()} units on hand against a reorder floor of ${s.reorder_at.toLocaleString()}. Redistribution recommended.`,
      };
    });

  const bedAlerts = facilities
    .filter((f) => f.beds_total > 0 && f.beds_free / f.beds_total < 0.15)
    .slice(0, 3)
    .map((f) => ({
      id: `BED-${f.code}`,
      severity: "critical" as const,
      title: `Bed capacity critical (${f.beds_free}/${f.beds_total})`,
      node: `${f.code} · ${f.name}`,
      detail: `Only ${Math.round((f.beds_free / f.beds_total) * 100)}% of beds free. Prepare overflow referral to the nearest hub.`,
    }));

  return [...stockAlerts, ...bedAlerts];
}

function CommandCenter() {
  const { data } = useSuspenseQuery(networkQueryOptions);
  const { facilities, stock } = data;
  const totals = nationalTotals(facilities, stock);
  const alerts = buildAlerts(facilities, stock);

  return (
    <AppShell>
      <SignInDialog />
      <PageHeader
        eyebrow="Command Center"
        title="National situation view"
        description="Live telemetry from every Primary Health Centre on the federated network."
      />

      <div className="grid grid-cols-2 gap-3">
        <Metric
          label="PHC nodes online"
          value={totals.onlineCount.toLocaleString()}
          hint={`of ${totals.facilityCount.toLocaleString()} registered`}
          status={totals.criticalFacilities > 0 ? "warning" : "optimal"}
        />
        <Metric
          label="Active alerts"
          value={String(totals.activeAlerts)}
          hint={`${totals.criticalStock} critical · ${totals.warningStock} warning`}
          status={totals.criticalStock > 0 ? "critical" : "warning"}
        />
        <Metric
          label="Personnel attendance"
          value={`${totals.attendance.toFixed(0)}%`}
          hint={`${totals.present} of ${totals.roster} on shift`}
          status={totals.attendance < 80 ? "warning" : "optimal"}
        />
        <Metric
          label="Stock health index"
          value={`${totals.stockHealth.toFixed(0)}%`}
          hint="Weighted essential-drug coverage"
          status={totals.stockHealth < 60 ? "critical" : totals.stockHealth < 75 ? "warning" : "optimal"}
        />
      </div>

      {facilities.length === 0 && (
        <Panel title="No facility records yet" subtitle="Live database is empty">
          <p className="text-xs text-muted-foreground">
            Add facilities and stock records to populate the national view.
          </p>
          <Link
            to="/manage"
            className="mt-3 inline-flex rounded-lg border border-primary/50 px-3 py-2 text-xs text-primary"
          >
            Manage records
          </Link>
        </Panel>
      )}

      <Panel title="PHC network map" subtitle="Node status by district">
        <NetworkMap facilities={facilities} online={totals.onlineCount} />
      </Panel>

      <Panel
        title="Early warnings"
        subtitle="Predicted stock-outs and capacity risks"
        action={
          <Link to="/forecasts" className="inline-flex items-center gap-1 text-xs text-primary">
            Forecasts <ArrowRight className="size-3.5" />
          </Link>
        }
      >
        {alerts.length === 0 ? (
          <p className="text-xs text-muted-foreground">No active stock-out or capacity risks detected.</p>
        ) : (
          <ul className="space-y-2.5">
            {alerts.map((a) => (
              <li key={a.id} className="rounded-lg border border-border bg-secondary/40 p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    className={
                      a.severity === "critical" ? "mt-0.5 size-4 text-critical" : "mt-0.5 size-4 text-warning"
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{a.title}</p>
                      <span className="font-mono text-[10px] text-muted-foreground">{a.id}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-primary">{a.node}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{a.detail}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Facility snapshot" subtitle="Beds, personnel and stock per node">
        {facilities.length === 0 ? (
          <p className="text-xs text-muted-foreground">No facilities recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {facilities.map((f) => {
              const status = facilityStatus(f);
              return (
                <li key={f.id} className="rounded-lg border border-border bg-secondary/40 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{f.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {f.district} · <span className="font-mono">{f.code}</span>
                      </p>
                    </div>
                    <StatusPill status={status}>{statusLabel[status]}</StatusPill>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <BedDouble className="size-3.5 text-primary" />
                      {f.beds_free}/{f.beds_total} beds
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="size-3.5 text-primary" />
                      {f.personnel_present}/{f.personnel_roster} staff
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <PackageCheck className="size-3.5 text-primary" />
                      {f.stock_health}% stock
                    </span>
                  </div>
                  <div className="mt-2">
                    <Bar value={f.stock_health} status={status} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}

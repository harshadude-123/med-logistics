import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Users, BedDouble, PackageCheck } from "lucide-react";
import { AppShell } from "@/components/health/AppShell";
import { Bar, Metric, Panel, PageHeader, StatusDot, StatusPill } from "@/components/health/primitives";
import { ALERTS, NATIONAL_KPIS, NODES, statusLabel } from "@/lib/health-data";

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
  component: CommandCenter,
});

function NetworkMap() {
  return (
    <div className="relative h-56 overflow-hidden rounded-xl border border-border grid-mesh bg-secondary/30">
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {(
          [
            [46, 38, 62, 22],
            [46, 38, 28, 62],
            [28, 62, 40, 84],
            [62, 22, 82, 34],
            [74, 55, 82, 34],
            [36, 18, 62, 22],
          ] as const
        ).map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className="route-flow stroke-primary/60"
            strokeWidth={0.4}
          />
        ))}
      </svg>
      {NODES.map((n) => (
        <div
          key={n.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          <StatusDot status={n.status} pulse={n.status !== "optimal"} />
        </div>
      ))}
      <div className="absolute bottom-2 left-2 flex flex-wrap gap-2 rounded-lg bg-background/70 px-2 py-1.5 backdrop-blur">
        {(["optimal", "warning", "critical"] as const).map((s) => (
          <span key={s} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <StatusDot status={s} />
            {statusLabel[s]}
          </span>
        ))}
      </div>
      <p className="absolute right-2 top-2 rounded-lg bg-background/70 px-2 py-1 font-mono text-[10px] text-primary backdrop-blur">
        {NATIONAL_KPIS.onlineNodes.toLocaleString()} nodes live
      </p>
    </div>
  );
}

function CommandCenter() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Command Center"
        title="National situation view"
        description="Live telemetry from every Primary Health Centre on the federated network."
      />

      <div className="grid grid-cols-2 gap-3">
        <Metric
          label="PHC nodes online"
          value={`${NATIONAL_KPIS.onlineNodes.toLocaleString()}`}
          hint={`of ${NATIONAL_KPIS.phcNodes.toLocaleString()} registered`}
          status="optimal"
        />
        <Metric
          label="Active alerts"
          value={String(NATIONAL_KPIS.activeAlerts)}
          hint="6 critical · 21 warning"
          status="critical"
        />
        <Metric
          label="Personnel attendance"
          value={`${NATIONAL_KPIS.personnelAttendance}%`}
          hint="Biometric roll-call, last shift"
          status="warning"
        />
        <Metric
          label="Stock health index"
          value={`${NATIONAL_KPIS.stockHealth}%`}
          hint="Weighted essential-drug coverage"
          status="optimal"
        />
      </div>

      <Panel title="PHC network map" subtitle="Node status by district">
        <NetworkMap />
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
        <ul className="space-y-2.5">
          {ALERTS.map((a) => (
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
      </Panel>

      <Panel title="Facility snapshot" subtitle="Beds, personnel and stock per node">
        <ul className="space-y-3">
          {NODES.map((n) => (
            <li key={n.id} className="rounded-lg border border-border bg-secondary/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{n.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {n.district} · <span className="font-mono">{n.id}</span>
                  </p>
                </div>
                <StatusPill status={n.status}>{statusLabel[n.status]}</StatusPill>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <BedDouble className="size-3.5 text-primary" />
                  {n.beds.free}/{n.beds.total} beds
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Users className="size-3.5 text-primary" />
                  {n.personnel.present}/{n.personnel.roster} staff
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <PackageCheck className="size-3.5 text-primary" />
                  {n.stockHealth}% stock
                </span>
              </div>
              <div className="mt-2">
                <Bar value={n.stockHealth} status={n.status} />
              </div>
            </li>
          ))}
        </ul>
      </Panel>
    </AppShell>
  );
}

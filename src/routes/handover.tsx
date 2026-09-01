import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/health/AppShell";
import { Bar, Metric, Panel, PageHeader, StatusPill } from "@/components/health/primitives";
import { MODULE_STATUS, NATIONAL_KPIS, ROADMAP } from "@/lib/health-data";

export const Route = createFileRoute("/handover")({
  head: () => ({
    meta: [
      { title: "Deployment Handover — HealthChain AI" },
      {
        name: "description",
        content:
          "Rollout roadmap, module readiness and national deployment status for the HealthChain AI PHC resilience network.",
      },
      { property: "og:title", content: "Deployment Handover — HealthChain AI" },
      {
        property: "og:description",
        content: "Track pilot validation and national rollout readiness across every HealthChain AI module.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Handover,
});

function Handover() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Deployment"
        title="Rollout & handover status"
        description="Readiness of every subsystem ahead of national deployment."
      />

      <div className="grid grid-cols-2 gap-3">
        <Metric
          label="Nodes synchronised"
          value={NATIONAL_KPIS.onlineNodes.toLocaleString()}
          hint="Streaming live telemetry"
          status="optimal"
        />
        <Metric label="Modules operational" value="4 / 4" hint="No degraded services" status="optimal" />
      </div>

      <Panel title="Rollout roadmap" subtitle="Phase completion">
        <ul className="space-y-3">
          {ROADMAP.map((p) => (
            <li key={p.phase}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{p.phase}</p>
                <span className="font-mono text-[11px] text-muted-foreground">{p.pct}%</span>
              </div>
              <div className="mt-1.5">
                <Bar value={p.pct} status={p.pct === 100 ? "optimal" : p.pct > 50 ? "warning" : "critical"} />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{p.note}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Module status" subtitle="Core subsystem health">
        <ul className="space-y-2.5">
          {MODULE_STATUS.map((m) => (
            <li
              key={m.name}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-secondary/40 p-3"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <CheckCircle2 className="size-3.5 text-optimal" />
                  {m.name}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{m.detail}</p>
              </div>
              <StatusPill status="optimal">{m.state}</StatusPill>
            </li>
          ))}
        </ul>
      </Panel>
    </AppShell>
  );
}

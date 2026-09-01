import { createFileRoute } from "@tanstack/react-router";
import { Share2 } from "lucide-react";
import { AppShell } from "@/components/health/AppShell";
import { Bar, Panel, PageHeader, StatusPill } from "@/components/health/primitives";
import { PARTNERS, PATHOGEN_SIGNALS } from "@/lib/health-data";

export const Route = createFileRoute("/brics")({
  head: () => ({
    meta: [
      { title: "BRICS Network Insights — HealthChain AI" },
      {
        name: "description",
        content:
          "Federated learning across BRICS partner nodes: shared datasets, model accuracy and cross-border pathogen signals.",
      },
      { property: "og:title", content: "BRICS Network Insights — HealthChain AI" },
      {
        property: "og:description",
        content: "Collaborative predictive modelling across India, Brazil, Russia, China and South Africa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Brics,
});

function Brics() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Federated Intelligence"
        title="BRICS network insights"
        description="Shared model contributions across five sovereign health networks."
      />

      <Panel title="Partner contributions" subtitle="Datasets shared into the federated model">
        <ul className="space-y-3">
          {PARTNERS.map((p) => (
            <li key={p.code} className="rounded-lg border border-border bg-secondary/40 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    <span className="font-mono text-primary">{p.code}</span> · {p.country}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Share2 className="size-3.5 text-primary" />
                    {p.feed}
                  </p>
                </div>
                <StatusPill status={p.status === "Live" ? "optimal" : p.status === "Active" ? "warning" : "critical"}>
                  {p.status}
                </StatusPill>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{p.metric}</p>
              <div className="mt-2">
                <Bar value={p.accuracy} status={p.accuracy >= 94 ? "optimal" : "warning"} />
              </div>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                Model accuracy {p.accuracy}% · synced {p.sync}
              </p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Cross-border signals" subtitle="Pathogen surveillance deltas">
        <ul className="space-y-2.5">
          {PATHOGEN_SIGNALS.map((s) => (
            <li
              key={s.region}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-secondary/40 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{s.signal}</p>
                <p className="text-[11px] text-muted-foreground">{s.region}</p>
              </div>
              <StatusPill status={s.level}>{s.delta}</StatusPill>
            </li>
          ))}
        </ul>
      </Panel>
    </AppShell>
  );
}

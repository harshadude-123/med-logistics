import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Plane, Truck, Train, UserCog } from "lucide-react";
import { AppShell } from "@/components/health/AppShell";
import { Metric, Panel, PageHeader, StatusPill } from "@/components/health/primitives";
import { MOVES, PERSONNEL_MOVES, statusLabel } from "@/lib/health-data";

export const Route = createFileRoute("/redistribution")({
  head: () => ({
    meta: [
      { title: "Automated Redistribution — HealthChain AI" },
      {
        name: "description",
        content:
          "AI-recommended cross-district transfers of medicines, equipment and personnel with live supply-route tracking.",
      },
      { property: "og:title", content: "Automated Redistribution — HealthChain AI" },
      {
        property: "og:description",
        content: "Cross-district resource redistribution recommendations driven by forecasted demand.",
      },
    ],
  }),
  component: Redistribution,
});

const modeIcon = {
  "Refrigerated van": Truck,
  "Drone dispatch": Plane,
  "Rail cargo": Train,
} as const;

function SupplyRoutes() {
  return (
    <div className="relative h-48 overflow-hidden rounded-xl border border-border grid-mesh bg-secondary/30">
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 60">
        <path d="M12 46 C 34 10, 60 52, 88 14" className="route-flow stroke-primary" strokeWidth={0.7} fill="none" />
        <path d="M12 46 C 40 44, 58 20, 88 34" className="route-flow stroke-accent" strokeWidth={0.6} fill="none" />
        {[
          [12, 46, "Hub · NCR"],
          [88, 14, "PHC-1042"],
          [88, 34, "PHC-6673"],
        ].map(([x, y, label]) => (
          <g key={String(label)}>
            <circle cx={x as number} cy={y as number} r={1.6} className="fill-primary" />
            <circle cx={x as number} cy={y as number} r={3.2} className="fill-primary/20" />
          </g>
        ))}
      </svg>
      <div className="absolute left-3 top-3 rounded-lg bg-background/75 px-2 py-1.5 backdrop-blur">
        <p className="font-mono text-[10px] uppercase tracking-wide text-primary">Payloads in transit</p>
        <p className="font-display text-lg font-semibold leading-tight">18</p>
      </div>
      <div className="absolute bottom-3 right-3 space-y-1 rounded-lg bg-background/75 px-2 py-1.5 text-[10px] backdrop-blur">
        <p className="text-muted-foreground">Route optimisation: <span className="text-primary">active</span></p>
        <p className="text-muted-foreground">Drone dispatch: <span className="text-optimal">3 airborne</span></p>
      </div>
    </div>
  );
}

function Redistribution() {
  const [approved, setApproved] = useState<string[]>([]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Redistribution Hub"
        title="Recommended moves"
        description="Cross-district transfers ranked by forecast shortfall, donor buffer and transit time."
      />

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Open recommendations" value={String(MOVES.length - approved.length)} hint="awaiting approval" status="warning" />
        <Metric label="Approved today" value={String(approved.length + 6)} hint="incl. auto-executed" status="optimal" />
        <Metric label="Avg. confidence" value="90%" hint="model certainty" status="optimal" />
      </div>

      <Panel title="Interactive supply routes" subtitle="Live payload tracking and route optimisation">
        <SupplyRoutes />
      </Panel>

      <Panel title="Resource transfers" subtitle="Generated from the latest forecast cycle">
        <ul className="space-y-3">
          {MOVES.map((m) => {
            const Icon = modeIcon[m.mode];
            const done = approved.includes(m.id);
            return (
              <li key={m.id} className="rounded-lg border border-border bg-secondary/40 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{m.item}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{m.id} · {m.qty}</p>
                  </div>
                  <StatusPill status={m.priority}>{statusLabel[m.priority]}</StatusPill>
                </div>

                <div className="mt-2.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="truncate">{m.from}</span>
                  <ArrowRight className="size-3.5 shrink-0 text-primary" />
                  <span className="truncate">{m.to}</span>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">{m.rationale}</p>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon className="size-3.5 text-primary" /> {m.mode}
                    </span>
                    <span>ETA {m.eta}</span>
                    <span className="font-mono">{m.confidence}%</span>
                  </div>
                  <button
                    disabled={done}
                    onClick={() => {
                      setApproved((p) => [...p, m.id]);
                      toast.success(`${m.id} approved`, {
                        description: "Submitted to smart contract for node consensus.",
                      });
                    }}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:bg-optimal/20 disabled:text-optimal"
                  >
                    {done ? "Queued" : "Approve"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="Personnel deployment" subtitle="Attendance-gap driven reassignments">
        <ul className="space-y-2.5">
          {PERSONNEL_MOVES.map((p) => (
            <li key={p.role + p.to} className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/40 p-3">
              <UserCog className="mt-0.5 size-4 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">
                  {p.count}× {p.role}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {p.from} → {p.to}
                </p>
              </div>
              <span className="shrink-0 text-[11px] text-primary">{p.window}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </AppShell>
  );
}

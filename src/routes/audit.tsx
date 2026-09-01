import { createFileRoute } from "@tanstack/react-router";
import { Lock, ShieldCheck, Timer } from "lucide-react";
import { AppShell } from "@/components/health/AppShell";
import { Bar, Metric, Panel, PageHeader, StatusPill } from "@/components/health/primitives";
import { BOOST_RULES, LEDGER, TRIGGERS, TRIGGER_HISTORY } from "@/lib/health-data";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Blockchain Audit & Smart Triggers — HealthChain AI" },
      {
        name: "description",
        content:
          "Immutable ledger of redistribution decisions, consensus states and adaptive time-lock triggers across the PHC network.",
      },
      { property: "og:title", content: "Blockchain Audit & Smart Triggers — HealthChain AI" },
      {
        property: "og:description",
        content: "Every supply decision recorded on a federated ledger with consensus and time-lock traceability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Audit,
});

function Audit() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Trust Layer"
        title="Ledger & smart triggers"
        description="Consensus-verified record of every automated supply action."
      />

      <div className="grid grid-cols-2 gap-3">
        <Metric label="Latest block" value="8,412,907" hint="5 sovereign validator nodes" status="optimal" />
        <Metric label="Armed triggers" value="2 / 3" hint="Emergency override disarmed" status="warning" />
      </div>

      <Panel title="Smart trigger rules" subtitle="Consensus and adaptive time-locks">
        <ul className="space-y-3">
          {TRIGGERS.map((t) => {
            const pct = Math.round((t.consensus.have / t.consensus.need) * 100);
            const lockTotal = t.timeLock.reducedTo ?? t.timeLock.total;
            const lockPct = lockTotal ? Math.min(100, Math.round((t.timeLock.elapsed / lockTotal) * 100)) : 100;
            return (
              <li key={t.id} className="rounded-lg border border-border bg-secondary/40 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{t.id}</p>
                  </div>
                  <StatusPill status={t.active ? "optimal" : "warning"}>
                    {t.active ? "Armed" : "Disarmed"}
                  </StatusPill>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{t.condition}</p>
                <div className="mt-3 space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5 text-primary" /> Consensus
                      </span>
                      <span className="font-mono">
                        {t.consensus.have}/{t.consensus.need}
                      </span>
                    </div>
                    <Bar value={pct} status={pct === 100 ? "optimal" : "warning"} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Timer className="size-3.5 text-primary" /> Time-lock
                      </span>
                      <span className="font-mono">
                        {t.timeLock.reducedTo
                          ? `${t.timeLock.elapsed}h / ${t.timeLock.reducedTo}h (boosted)`
                          : `${t.timeLock.elapsed}h / ${t.timeLock.total}h`}
                      </span>
                    </div>
                    <Bar value={lockPct} status={lockPct === 100 ? "optimal" : "warning"} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel title="Demand-spike boosters" subtitle="AI intensity to lock-release mapping">
        <ul className="space-y-2.5">
          {BOOST_RULES.map((r) => (
            <li key={r.level} className="rounded-lg border border-border bg-secondary/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  {r.level} · <span className="text-muted-foreground">{r.label}</span>
                </p>
                <StatusPill status={r.enabled ? "optimal" : "critical"}>
                  {r.enabled ? "Enabled" : "Off"}
                </StatusPill>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{r.threshold}</p>
              <p className="mt-1 text-[11px] text-primary">{r.effect}</p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Immutable ledger" subtitle="Most recent verified blocks">
        <ul className="space-y-2.5">
          {LEDGER.map((l) => (
            <li key={l.hash} className="rounded-lg border border-border bg-secondary/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <Lock className="size-3.5 text-primary" />
                  {l.action}
                </p>
                <span className="font-mono text-[10px] text-muted-foreground">{l.hash}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{l.detail}</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                Block {l.block.toLocaleString()} · {l.ts} · nodes {l.nodes}
              </p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Trigger history" subtitle="Recent automated decisions">
        <ul className="space-y-2">
          {TRIGGER_HISTORY.map((h) => (
            <li key={h.id} className="flex gap-2 text-xs text-muted-foreground">
              <span className="font-mono text-[10px] text-primary">{h.id}</span>
              <span className="flex-1">{h.text}</span>
              <span className="font-mono text-[10px]">{h.ts}</span>
            </li>
          ))}
        </ul>
      </Panel>
    </AppShell>
  );
}

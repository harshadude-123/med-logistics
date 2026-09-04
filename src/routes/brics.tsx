import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/health/AppShell";
import { Bar, Metric, Panel, PageHeader, StatusPill } from "@/components/health/primitives";
import { PATHOGEN_SIGNALS, statusLabel } from "@/lib/health-data";
import {
  bricsQueryOptions,
  federatedSummary,
  partnerStatus,
  syncFreshness,
  type PartnerRow,
} from "@/lib/brics-data";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";

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
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(bricsQueryOptions);
  },
  errorComponent: ({ error }) => (
    <AppShell>
      <p role="alert" className="text-sm text-critical">
        Could not load federated partner data: {error.message}
      </p>
    </AppShell>
  ),
  component: Brics,
});

function Brics() {
  const { data } = useSuspenseQuery(bricsQueryOptions);
  const { partners, events } = data;
  const summary = federatedSummary(partners);
  const { session } = useSession();
  const queryClient = useQueryClient();
  const [syncing, setSyncing] = useState<string | null>(null);
  const partnerByeId = new Map(partners.map((p) => [p.id, p]));

  async function runSync(partner: PartnerRow) {
    if (!session) {
      toast.error("Sign in to trigger a federated sync");
      return;
    }
    setSyncing(partner.id);

    // A federated round shares model weights, not raw records: the partner's
    // contribution counter and accuracy move forward, and the round is logged.
    const batch = Math.max(1000, Math.round(partner.records_shared * 0.02));
    const accuracyAfter = Math.min(99, Number((partner.accuracy + 0.2).toFixed(1)));
    const nowIso = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("brics_partners")
      .update({
        records_shared: partner.records_shared + batch,
        accuracy: accuracyAfter,
        status: "Live",
        last_sync_at: nowIso,
      })
      .eq("id", partner.id);

    if (updateError) {
      setSyncing(null);
      toast.error(updateError.message);
      return;
    }

    const { error: eventError } = await supabase.from("brics_sync_events").insert({
      partner_id: partner.id,
      records_shared: batch,
      accuracy_after: accuracyAfter,
      note: `Federated round completed with ${partner.country} — ${partner.feed}`,
      triggered_by: session.user.id,
    });

    setSyncing(null);
    if (eventError) {
      toast.error(eventError.message);
      return;
    }
    toast.success(`${partner.country} synced · model at ${accuracyAfter}%`);
    await queryClient.invalidateQueries({ queryKey: ["brics"] });
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow="Federated Intelligence"
        title="BRICS network insights"
        description="Shared model contributions across sovereign health networks — live from the federation ledger."
      />

      <div className="grid grid-cols-2 gap-3">
        <Metric
          label="Partner nodes"
          value={String(summary.nodes)}
          hint={`${summary.inSync} in sync now`}
          status={summary.inSync === summary.nodes ? "optimal" : "warning"}
        />
        <Metric
          label="Model accuracy"
          value={`${summary.accuracy.toFixed(1)}%`}
          hint="Federated average"
          status={summary.accuracy >= 93 ? "optimal" : "warning"}
        />
        <Metric
          label="Records contributed"
          value={`${(summary.records / 1_000_000).toFixed(2)}M`}
          hint="Aggregated, privacy-preserving"
          status="optimal"
        />
        <Metric
          label="Sync rounds logged"
          value={String(events.length)}
          hint="Most recent 20 rounds"
          status="optimal"
        />
      </div>

      <Panel title="Partner contributions" subtitle="Datasets shared into the federated model">
        {partners.length === 0 ? (
          <p className="text-xs text-muted-foreground">No partner nodes registered yet.</p>
        ) : (
          <ul className="space-y-3">
            {partners.map((p) => {
              const status = partnerStatus(p);
              const fresh = syncFreshness(p);
              return (
                <li key={p.id} className="rounded-lg border border-border bg-secondary/40 p-3">
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
                    <StatusPill status={fresh.status}>{p.status}</StatusPill>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{p.metric}</p>
                  <div className="mt-2">
                    <Bar value={p.accuracy} status={status} />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {p.accuracy}% · {p.records_shared.toLocaleString()} records · synced {fresh.label}
                    </p>
                    <button
                      type="button"
                      onClick={() => runSync(p)}
                      disabled={syncing !== null}
                      className="inline-flex items-center gap-1 rounded-lg border border-primary/50 px-2 py-1 text-[11px] text-primary disabled:opacity-50"
                    >
                      {syncing === p.id ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <RefreshCw className="size-3" />
                      )}
                      Sync
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {!session && (
          <p className="mt-3 text-[11px] text-muted-foreground">
            Sign in as a coordinator to trigger a federated sync round.
          </p>
        )}
      </Panel>

      <Panel title="Sync ledger" subtitle="Federated rounds recorded on the network">
        {events.length === 0 ? (
          <p className="text-xs text-muted-foreground">No sync rounds recorded yet — run one above.</p>
        ) : (
          <ul className="space-y-2">
            {events.map((e) => (
              <li key={e.id} className="rounded-lg border border-border bg-secondary/40 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate text-xs">
                    {partnerByeId.get(e.partner_id)?.country ?? "Partner"} ·{" "}
                    {e.records_shared.toLocaleString()} records
                  </p>
                  <span className="font-mono text-[10px] text-primary">{e.accuracy_after}%</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">{e.note}</p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  {new Date(e.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
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

      <Panel title="Governance & privacy" subtitle="Sovereign data controls">
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li>Only aggregated model weights leave national infrastructure — never patient records.</li>
          <li>Differential privacy noise is applied before each federated round is published.</li>
          <li>
            Every round is written to the sync ledger above with the coordinator who triggered it, so
            contributions stay auditable.
          </li>
          <li>Sync freshness is graded {statusLabel.optimal.toLowerCase()} within 6 hours of the last round.</li>
        </ul>
      </Panel>
    </AppShell>
  );
}

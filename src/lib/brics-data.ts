import { queryOptions } from "@tanstack/react-query";
import { getBricsData, type PartnerRow, type SyncEventRow } from "@/lib/brics.functions";
import type { Status } from "@/lib/health-data";

export const bricsQueryOptions = queryOptions({
  queryKey: ["brics"],
  queryFn: () => getBricsData(),
});

export function partnerStatus(p: PartnerRow): Status {
  if (p.accuracy >= 94) return "optimal";
  if (p.accuracy >= 90) return "warning";
  return "critical";
}

export function syncFreshness(p: PartnerRow): { label: string; status: Status } {
  if (!p.last_sync_at) return { label: "never synced", status: "critical" };
  const hours = (Date.now() - new Date(p.last_sync_at).getTime()) / 3_600_000;
  const label =
    hours < 1
      ? `${Math.max(1, Math.round(hours * 60))}m ago`
      : hours < 48
        ? `${Math.round(hours)}h ago`
        : `${Math.round(hours / 24)}d ago`;
  return { label, status: hours <= 6 ? "optimal" : hours <= 72 ? "warning" : "critical" };
}

export function federatedSummary(partners: PartnerRow[]) {
  const accuracy =
    partners.length > 0 ? partners.reduce((s, p) => s + p.accuracy, 0) / partners.length : 0;
  return {
    nodes: partners.length,
    accuracy,
    records: partners.reduce((s, p) => s + p.records_shared, 0),
    inSync: partners.filter((p) => syncFreshness(p).status === "optimal").length,
  };
}

export type { PartnerRow, SyncEventRow };

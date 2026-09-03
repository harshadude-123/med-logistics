import { queryOptions } from "@tanstack/react-query";
import { getNetworkData, type FacilityRow, type StockRow } from "@/lib/network.functions";
import type { Status } from "@/lib/health-data";

export const networkQueryOptions = queryOptions({
  queryKey: ["network"],
  queryFn: () => getNetworkData(),
});

export function facilityStatus(f: FacilityRow): Status {
  const bedRatio = f.beds_total > 0 ? f.beds_free / f.beds_total : 1;
  if (f.stock_health < 45 || bedRatio < 0.1) return "critical";
  if (f.stock_health < 70 || bedRatio < 0.25) return "warning";
  return "optimal";
}

export function stockStatus(s: StockRow): Status {
  if (s.units < s.reorder_at * 0.5 || s.days_to_depletion <= 3) return "critical";
  if (s.units < s.reorder_at || s.days_to_depletion <= 10) return "warning";
  return "optimal";
}

export function nationalTotals(facilities: FacilityRow[], stock: StockRow[]) {
  const bedsFree = facilities.reduce((s, f) => s + f.beds_free, 0);
  const bedsTotal = facilities.reduce((s, f) => s + f.beds_total, 0);
  const present = facilities.reduce((s, f) => s + f.personnel_present, 0);
  const roster = facilities.reduce((s, f) => s + f.personnel_roster, 0);
  const statuses = facilities.map(facilityStatus);
  const criticalStock = stock.filter((s) => stockStatus(s) === "critical").length;
  const warningStock = stock.filter((s) => stockStatus(s) === "warning").length;

  return {
    facilityCount: facilities.length,
    onlineCount: statuses.filter((s) => s !== "critical").length,
    criticalFacilities: statuses.filter((s) => s === "critical").length,
    warningFacilities: statuses.filter((s) => s === "warning").length,
    bedsFree,
    bedsTotal,
    bedOccupancy: bedsTotal > 0 ? ((bedsTotal - bedsFree) / bedsTotal) * 100 : 0,
    present,
    roster,
    attendance: roster > 0 ? (present / roster) * 100 : 0,
    stockHealth:
      facilities.length > 0
        ? facilities.reduce((s, f) => s + f.stock_health, 0) / facilities.length
        : 0,
    criticalStock,
    warningStock,
    activeAlerts: criticalStock + warningStock + statuses.filter((s) => s !== "optimal").length,
  };
}

export type { FacilityRow, StockRow };

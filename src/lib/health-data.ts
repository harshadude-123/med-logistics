export type Status = "optimal" | "warning" | "critical";

export const NATIONAL_KPIS = {
  phcNodes: 12_486,
  onlineNodes: 12_301,
  activeAlerts: 27,
  personnelAttendance: 91.4,
  bedOccupancy: 78.2,
  stockHealth: 86.5,
  modelAccuracy: 94.2,
};

export type Node = {
  id: string;
  name: string;
  district: string;
  status: Status;
  x: number;
  y: number;
  beds: { free: number; total: number };
  personnel: { present: number; roster: number };
  stockHealth: number;
};

export const NODES: Node[] = [
  { id: "PHC-1042", name: "Central District PHC", district: "Noida Sector 12", status: "critical", x: 46, y: 38, beds: { free: 3, total: 40 }, personnel: { present: 9, roster: 14 }, stockHealth: 34 },
  { id: "PHC-2210", name: "Northside Clinic", district: "Ghaziabad North", status: "warning", x: 62, y: 22, beds: { free: 11, total: 32 }, personnel: { present: 12, roster: 13 }, stockHealth: 61 },
  { id: "PHC-3381", name: "Riverbank Health Post", district: "Patna East", status: "optimal", x: 74, y: 55, beds: { free: 22, total: 28 }, personnel: { present: 10, roster: 10 }, stockHealth: 92 },
  { id: "PHC-4127", name: "Western Hub PHC", district: "Pune West", status: "optimal", x: 28, y: 62, beds: { free: 34, total: 60 }, personnel: { present: 21, roster: 22 }, stockHealth: 88 },
  { id: "PHC-5509", name: "Highland Clinic", district: "Shimla Rural", status: "warning", x: 36, y: 18, beds: { free: 6, total: 18 }, personnel: { present: 5, roster: 8 }, stockHealth: 57 },
  { id: "PHC-6673", name: "Coastal PHC", district: "Kochi South", status: "critical", x: 40, y: 84, beds: { free: 1, total: 24 }, personnel: { present: 6, roster: 12 }, stockHealth: 29 },
  { id: "PHC-7788", name: "Eastern Node PHC", district: "Guwahati Central", status: "optimal", x: 82, y: 34, beds: { free: 18, total: 30 }, personnel: { present: 13, roster: 14 }, stockHealth: 84 },
];

export type StockItem = {
  name: string;
  category: string;
  units: number;
  reorderAt: number;
  capacity: number;
  status: Status;
  daysToDepletion: number;
  expiry: string;
  node: string;
};

export const STOCK: StockItem[] = [
  { name: "Insulin (Human, 100IU)", category: "Cold chain", units: 420, reorderAt: 1200, capacity: 4000, status: "critical", daysToDepletion: 2, expiry: "2026-11-04", node: "PHC-1042" },
  { name: "Medical Oxygen (D-type)", category: "Gases", units: 88, reorderAt: 150, capacity: 600, status: "critical", daysToDepletion: 2, expiry: "—", node: "PHC-6673" },
  { name: "Amoxicillin 500mg", category: "Antibiotics", units: 6_400, reorderAt: 5_000, capacity: 20_000, status: "warning", daysToDepletion: 9, expiry: "2027-02-18", node: "PHC-2210" },
  { name: "ORS Sachets", category: "Essentials", units: 24_800, reorderAt: 8_000, capacity: 40_000, status: "optimal", daysToDepletion: 41, expiry: "2028-01-09", node: "PHC-4127" },
  { name: "Anti-Rabies Vaccine", category: "Cold chain", units: 310, reorderAt: 400, capacity: 1_500, status: "warning", daysToDepletion: 7, expiry: "2026-09-30", node: "PHC-5509" },
  { name: "Paracetamol 650mg", category: "Essentials", units: 51_200, reorderAt: 12_000, capacity: 80_000, status: "optimal", daysToDepletion: 63, expiry: "2027-08-22", node: "PHC-3381" },
  { name: "IV Fluids (NS 500ml)", category: "Consumables", units: 3_900, reorderAt: 4_500, capacity: 15_000, status: "warning", daysToDepletion: 6, expiry: "2027-05-11", node: "PHC-7788" },
];

export const ALERTS = [
  { id: "ALT-8841", severity: "critical" as Status, title: "Insulin stock-out in 48h", node: "PHC-1042 · Central District", detail: "Consumption up 38% vs 14-day baseline. Cold-chain buffer exhausted." },
  { id: "ALT-8836", severity: "critical" as Status, title: "Oxygen cylinders below floor", node: "PHC-6673 · Coastal PHC", detail: "Monsoon respiratory surge; 88 cylinders against 150 reorder floor." },
  { id: "ALT-8829", severity: "warning" as Status, title: "Personnel attendance 50%", node: "PHC-6673 · Coastal PHC", detail: "6 of 12 rostered staff present for 3 consecutive shifts." },
  { id: "ALT-8814", severity: "warning" as Status, title: "Bed capacity nearing limit", node: "PHC-5509 · Highland Clinic", detail: "6 of 18 beds free; paediatric ward at 89% occupancy." },
];

export const FORECAST_SERIES = [
  { day: "D-0", actual: 1180, forecast: 1180, upper: 1180, lower: 1180 },
  { day: "D+3", actual: null, forecast: 1265, upper: 1360, lower: 1170 },
  { day: "D+6", actual: null, forecast: 1390, upper: 1520, lower: 1260 },
  { day: "D+9", actual: null, forecast: 1560, upper: 1740, lower: 1380 },
  { day: "D+12", actual: null, forecast: 1745, upper: 1980, lower: 1510 },
  { day: "D+15", actual: null, forecast: 1890, upper: 2180, lower: 1600 },
  { day: "D+18", actual: null, forecast: 1960, upper: 2300, lower: 1620 },
  { day: "D+21", actual: null, forecast: 1885, upper: 2240, lower: 1530 },
  { day: "D+24", actual: null, forecast: 1740, upper: 2100, lower: 1380 },
  { day: "D+30", actual: null, forecast: 1610, upper: 1990, lower: 1230 },
];

export const HISTORY_SERIES = [
  { day: "W-8", demand: 940 },
  { day: "W-7", demand: 985 },
  { day: "W-6", demand: 1010 },
  { day: "W-5", demand: 1075 },
  { day: "W-4", demand: 1040 },
  { day: "W-3", demand: 1120 },
  { day: "W-2", demand: 1155 },
  { day: "W-1", demand: 1180 },
];

export const RISK_SECTORS = [
  { sector: "Zone A · NCR", risk: 88 },
  { sector: "Zone B · Kerala Coast", risk: 81 },
  { sector: "Zone C · Himachal", risk: 62 },
  { sector: "Zone D · Maharashtra", risk: 41 },
  { sector: "Zone E · Assam", risk: 33 },
  { sector: "Zone F · Bihar", risk: 55 },
];

export type Move = {
  id: string;
  item: string;
  qty: string;
  from: string;
  to: string;
  eta: string;
  priority: Status;
  confidence: number;
  mode: "Refrigerated van" | "Drone dispatch" | "Rail cargo";
  rationale: string;
};

export const MOVES: Move[] = [
  { id: "RD-4471", item: "Insulin (Human, 100IU)", qty: "900 vials", from: "Regional Hub · Delhi NCR", to: "PHC-1042 Central District", eta: "4h 20m", priority: "critical", confidence: 96, mode: "Refrigerated van", rationale: "Forecast shortfall of 780 vials within 48h; hub holds 210% buffer." },
  { id: "RD-4468", item: "Medical Oxygen (D-type)", qty: "140 cylinders", from: "PHC-4127 Western Hub", to: "PHC-6673 Coastal PHC", eta: "9h 05m", priority: "critical", confidence: 93, mode: "Rail cargo", rationale: "Respiratory admissions +41%; donor node above safety floor." },
  { id: "RD-4459", item: "Anti-Rabies Vaccine", qty: "260 doses", from: "State Store · Chandigarh", to: "PHC-5509 Highland Clinic", eta: "2h 40m", priority: "warning", confidence: 88, mode: "Drone dispatch", rationale: "Expiry-optimised pull: nearest lot expires in 39 days." },
  { id: "RD-4451", item: "Amoxicillin 500mg", qty: "500 strips", from: "PHC-3381 Riverbank", to: "PHC-2210 Northside Clinic", eta: "6h 15m", priority: "warning", confidence: 84, mode: "Refrigerated van", rationale: "Paediatric outpatient footfall up 22% week-on-week." },
];

export const PERSONNEL_MOVES = [
  { role: "ANM / Staff Nurse", count: 4, from: "Pune West pool", to: "PHC-6673 Coastal PHC", window: "Next 24h" },
  { role: "Medical Officer", count: 1, from: "Shimla district reserve", to: "PHC-5509 Highland Clinic", window: "Next 12h" },
  { role: "Pharmacist", count: 2, from: "NCR float staff", to: "PHC-1042 Central District", window: "Next 8h" },
];

export const PARTNERS = [
  { code: "IN", country: "India", feed: "Vaccination logistics", metric: "1.2M tracked doses", status: "Live", accuracy: 95.1, sync: "12s ago" },
  { code: "BR", country: "Brazil", feed: "Demand spike patterns", metric: "480 outbreak signatures", status: "Live", accuracy: 93.4, sync: "48s ago" },
  { code: "RU", country: "Russia", feed: "Hospital capacity AI", metric: "92% bed-allocation efficiency", status: "Active", accuracy: 92.8, sync: "6m ago" },
  { code: "CN", country: "China", feed: "Pathogen sequencing", metric: "3,410 genomes shared", status: "Active", accuracy: 96.2, sync: "14m ago" },
  { code: "ZA", country: "South Africa", feed: "Cold-chain telemetry", metric: "18k sensor hours / week", status: "Weekly", accuracy: 90.6, sync: "2d ago" },
];

export const PATHOGEN_SIGNALS = [
  { region: "Kerala Coast, IN", signal: "Influenza-like illness", delta: "+34%", level: "critical" as Status },
  { region: "São Paulo, BR", signal: "Dengue serotype-2", delta: "+21%", level: "warning" as Status },
  { region: "Guangdong, CN", signal: "Respiratory syncytial", delta: "+12%", level: "warning" as Status },
  { region: "Gauteng, ZA", signal: "Cholera watch", delta: "+4%", level: "optimal" as Status },
];

export const LEDGER = [
  { hash: "0x7f3a…c91b", action: "Redistribution executed", detail: "RD-4433 · 620 vials Insulin → PHC-2210", block: 8_412_907, ts: "08:41:22 UTC", nodes: "5/5" },
  { hash: "0x1b8e…4d02", action: "Stock reconciliation", detail: "PHC-4127 physical count matched ledger", block: 8_412_884, ts: "08:22:10 UTC", nodes: "5/5" },
  { hash: "0xa42c…77f5", action: "Time-lock reduced", detail: "RD-4471 lock 6h → 2h (Level 2 demand spike)", block: 8_412_851, ts: "07:58:47 UTC", nodes: "4/5" },
  { hash: "0x93d1…2ea8", action: "Personnel attendance batch", detail: "12,301 nodes signed biometric roll-call", block: 8_412_802, ts: "07:30:03 UTC", nodes: "5/5" },
];

export const TRIGGERS = [
  {
    id: "SC-01",
    name: "Critical Stock-out Trigger",
    condition: "Projected supply < 48h at any PHC node → auto-draft redistribution order",
    consensus: { have: 4, need: 5 },
    timeLock: { total: 6, elapsed: 6, reducedTo: null as number | null },
    active: true,
  },
  {
    id: "SC-02",
    name: "Redistribution Consensus",
    condition: "3 of 5 regional nodes verify payload + district admin signature",
    consensus: { have: 3, need: 5 },
    timeLock: { total: 6, elapsed: 4.1, reducedTo: 2 },
    active: true,
  },
  {
    id: "SC-03",
    name: "Emergency Override",
    condition: "Regional Admin Key + dual-node validation; bypasses standard lock",
    consensus: { have: 2, need: 2 },
    timeLock: { total: 0, elapsed: 0, reducedTo: null },
    active: false,
  },
];

export const BOOST_RULES = [
  { level: "Level 1", label: "Moderate surge", threshold: "Demand +15% over baseline", effect: "Time-lock 6h → 4h", enabled: true },
  { level: "Level 2", label: "Acute spike", threshold: "Demand +30% or supply < 72h", effect: "Time-lock 6h → 2h", enabled: true },
  { level: "Level 3", label: "Emergency outbreak", threshold: "Demand +50% or declared health emergency", effect: "Immediate execution (0h)", enabled: false },
];

export const TRIGGER_HISTORY = [
  { id: "TX-9921", text: "RD-4433 executed after 2h lock (Level 2 reduction) · consensus 5/5", ts: "Today 08:41" },
  { id: "TX-9908", text: "RD-4419 held for full 6h observation window · consensus 4/5", ts: "Today 02:15" },
  { id: "TX-9890", text: "Emergency Override requested and declined — admin key absent", ts: "Yesterday 21:04" },
];

export const ROADMAP = [
  { phase: "Network stabilisation", pct: 100, note: "Cryptographic testing complete across 5 sovereign nodes" },
  { phase: "Node synchronisation", pct: 100, note: "12,301 PHC endpoints streaming telemetry" },
  { phase: "Regional pilot · Zones A & B", pct: 68, note: "Live validation of adaptive time-lock logic" },
  { phase: "Full national rollout", pct: 12, note: "Target: 15 Nov · pending pilot sign-off" },
];

export const MODULE_STATUS = [
  { name: "Federated AI Engine", state: "Operational", detail: "94.2% model accuracy" },
  { name: "Blockchain Ledger", state: "Operational", detail: "Block 8,412,907" },
  { name: "Smart Triggers", state: "Operational", detail: "2 of 3 rules armed" },
  { name: "Logistics Map", state: "Operational", detail: "18 payloads in transit" },
];

export const statusLabel: Record<Status, string> = {
  optimal: "Optimal",
  warning: "Warning",
  critical: "Critical",
};

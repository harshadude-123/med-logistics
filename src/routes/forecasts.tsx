import { createFileRoute, Link } from "@tanstack/react-router";
import { Area, AreaChart, Bar as RBar, BarChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/health/AppShell";
import { Metric, Panel, PageHeader, StatusPill } from "@/components/health/primitives";
import { ALERTS, FORECAST_SERIES, HISTORY_SERIES, NATIONAL_KPIS, RISK_SECTORS } from "@/lib/health-data";

export const Route = createFileRoute("/forecasts")({
  head: () => ({
    meta: [
      { title: "AI Demand Forecasts — HealthChain AI" },
      {
        name: "description",
        content:
          "Federated 30-day demand forecasts, stock-out early warnings and geographic shortage risk topology.",
      },
      { property: "og:title", content: "AI Demand Forecasts — HealthChain AI" },
      {
        property: "og:description",
        content: "Predict shortfalls before they happen with federated modelling across BRICS nodes.",
      },
    ],
  }),
  component: Forecasts,
});

const tooltipStyle = {
  background: "oklch(0.215 0.03 249)",
  border: "1px solid oklch(0.33 0.03 248)",
  borderRadius: 12,
  fontSize: 12,
  color: "oklch(0.965 0.008 220)",
};

function Forecasts() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Predictive Forecaster"
        title="30-day demand outlook"
        description="Federated model trained locally per node; only gradients leave sovereign borders."
      />

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Model accuracy" value={`${NATIONAL_KPIS.modelAccuracy}%`} hint="MAPE-derived" status="optimal" />
        <Metric label="Peak demand" value="1,960" hint="units/day @ D+18" status="warning" />
        <Metric label="Shortfall risk" value="High" hint="2 zones" status="critical" />
      </div>

      <Panel title="Forecast with confidence interval" subtitle="Essential-drug demand, national aggregate">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={FORECAST_SERIES} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="ci" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 4" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="upper" stroke="none" fill="url(#ci)" name="Upper CI" />
              <Area type="monotone" dataKey="lower" stroke="none" fill="var(--color-background)" fillOpacity={0.6} name="Lower CI" />
              <Line type="monotone" dataKey="forecast" stroke="var(--color-chart-1)" strokeWidth={2.4} dot={false} name="Forecast" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Sparkles className="size-3.5 text-primary" />
          Includes shared BRICS outbreak signatures — India, Brazil and China feeds active.
        </p>
      </Panel>

      <Panel title="Observed demand baseline" subtitle="Last 8 weeks, units/day">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={HISTORY_SERIES} margin={{ top: 8, right: 6, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 4" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <RBar dataKey="demand" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} name="Demand" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      <Panel title="Shortage risk topology" subtitle="Probability of acute shortage per zone">
        <ul className="space-y-2.5">
          {[...RISK_SECTORS]
            .sort((a, b) => b.risk - a.risk)
            .map((r) => (
              <li key={r.sector} className="flex items-center gap-3">
                <span className="w-36 shrink-0 text-xs text-muted-foreground">{r.sector}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${r.risk}%`,
                      background:
                        r.risk >= 75
                          ? "var(--color-critical)"
                          : r.risk >= 50
                            ? "var(--color-warning)"
                            : "var(--color-optimal)",
                    }}
                  />
                </span>
                <span className="w-9 text-right font-mono text-xs">{r.risk}%</span>
              </li>
            ))}
        </ul>
      </Panel>

      <Panel
        title="Predicted stock-outs"
        subtitle="Early warnings with lead time"
        action={
          <Link to="/redistribution" className="inline-flex items-center gap-1 text-xs text-primary">
            Act now <ArrowRight className="size-3.5" />
          </Link>
        }
      >
        <ul className="space-y-2">
          {ALERTS.filter((a) => a.severity === "critical").map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-3 rounded-lg border border-critical/30 bg-critical/10 p-3">
              <div>
                <p className="text-sm font-medium">{a.title}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{a.node}</p>
              </div>
              <StatusPill status="critical">48h</StatusPill>
            </li>
          ))}
        </ul>
      </Panel>
    </AppShell>
  );
}

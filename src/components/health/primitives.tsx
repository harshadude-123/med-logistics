import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/health-data";

const statusStyles: Record<Status, string> = {
  optimal: "bg-optimal/15 text-optimal border-optimal/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  critical: "bg-critical/20 text-critical border-critical/40",
};

const dotStyles: Record<Status, string> = {
  optimal: "bg-optimal text-optimal",
  warning: "bg-warning text-warning",
  critical: "bg-critical text-critical",
};

export function StatusPill({
  status,
  children,
  className,
}: {
  status: Status;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        statusStyles[status],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotStyles[status])} />
      {children}
    </span>
  );
}

export function StatusDot({ status, pulse }: { status: Status; pulse?: boolean }) {
  return (
    <span
      className={cn("inline-block size-2.5 rounded-full", dotStyles[status], pulse && "pulse-node")}
    />
  );
}

export function Panel({
  children,
  className,
  title,
  subtitle,
  action,
}: {
  children?: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <section className={cn("panel p-4", className)}>
      {(title || action) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold tracking-tight">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function Metric({
  label,
  value,
  hint,
  status,
}: {
  label: string;
  value: string;
  hint?: string;
  status?: Status;
}) {
  return (
    <div className="panel p-3">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-display text-xl font-semibold",
          status === "critical" && "text-critical",
          status === "warning" && "text-warning",
          status === "optimal" && "text-optimal",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Bar({ value, status = "optimal" }: { value: number; status?: Status }) {
  const fill: Record<Status, string> = {
    optimal: "bg-optimal",
    warning: "bg-warning",
    critical: "bg-critical",
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn("h-full rounded-full transition-all", fill[status])}
        style={{ width: `${Math.min(100, Math.max(2, value))}%` }}
      />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className="space-y-1">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h1 className="font-display text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </header>
  );
}

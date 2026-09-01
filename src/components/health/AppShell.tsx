import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  Boxes,
  BrainCircuit,
  Globe2,
  ShieldCheck,
  Rocket,
  Bell,
  LogIn,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NATIONAL_KPIS } from "@/lib/health-data";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";

const TABS = [
  { to: "/", label: "Command", icon: Activity },
  { to: "/resources", label: "Resources", icon: Boxes },
  { to: "/forecasts", label: "Forecast", icon: BrainCircuit },
  { to: "/redistribution", label: "Redistribute", icon: Globe2 },
  { to: "/audit", label: "Audit", icon: ShieldCheck },
  { to: "/handover", label: "Deploy", icon: Rocket },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { session } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }


  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
      <div className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-3">
          <span className="relative grid size-9 place-items-center rounded-xl bg-primary/15 text-primary shadow-glow">
            <Activity className="size-5" strokeWidth={2.4} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold leading-tight">HealthChain AI</p>
            <p className="truncate text-[11px] text-muted-foreground">
              Federated PHC resilience network · BRICS
            </p>
          </div>
          <Link
            to="/brics"
            className={cn(
              "rounded-lg border border-border bg-secondary/60 px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground",
              pathname === "/brics" && "border-primary/50 text-primary",
            )}
          >
            BRICS
          </Link>
          {session ? (
            <button
              type="button"
              onClick={handleSignOut}
              aria-label="Sign out"
              title={session.user.email ?? "Sign out"}
              className="grid size-9 place-items-center rounded-xl border border-border bg-secondary/60 text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="size-4" />
            </button>
          ) : (
            <Link
              to="/auth"
              aria-label="Sign in"
              className="grid size-9 place-items-center rounded-xl border border-border bg-secondary/60 text-muted-foreground transition-colors hover:text-primary"
            >
              <LogIn className="size-4" />
            </Link>
          )}
          <span className="relative grid size-9 place-items-center rounded-xl border border-border bg-secondary/60">
            <Bell className="size-4 text-muted-foreground" />
            <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-critical text-[9px] font-semibold text-critical-foreground">
              {NATIONAL_KPIS.activeAlerts > 9 ? "9+" : NATIONAL_KPIS.activeAlerts}
            </span>
          </span>
        </div>
      </div>

      <main className="flex-1 space-y-5 px-4 pb-28 pt-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto grid max-w-3xl grid-cols-6">
          {TABS.map(({ to, label, icon: Icon }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("size-5", active && "text-glow")} strokeWidth={active ? 2.4 : 1.9} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Activity, Loader2, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — HealthChain AI Operations Console" },
      {
        name: "description",
        content:
          "Secure access for PHC coordinators and field officers to the HealthChain AI supply resilience console.",
      },
      { property: "og:title", content: "Sign in — HealthChain AI Operations Console" },
      {
        property: "og:description",
        content: "Authenticate to access national PHC stock, bed and personnel telemetry.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

const credentialsSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(72),
});

const signUpSchema = credentialsSchema.extend({
  fullName: z.string().trim().min(2, { message: "Enter your full name" }).max(100),
  facility: z.string().trim().max(120).optional(),
  district: z.string().trim().max(120).optional(),
});

function AuthPage() {
  const navigate = useNavigate();
  const { session, loading } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [fields, setFields] = useState({
    email: "",
    password: "",
    fullName: "",
    facility: "",
    district: "",
  });

  useEffect(() => {
    if (!loading && session) navigate({ to: "/", replace: true });
  }, [loading, session, navigate]);

  const set = (key: keyof typeof fields) => (e: { target: { value: string } }) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signin") {
        const parsed = credentialsSchema.safeParse(fields);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0]?.message ?? "Invalid credentials");
          return;
        }
        const { error } = await supabase.auth.signInWithPassword(parsed.data);
        if (error) {
          toast.error(error.message);
          return;
        }
        toast.success("Signed in");
        navigate({ to: "/", replace: true });
      } else {
        const parsed = signUpSchema.safeParse(fields);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0]?.message ?? "Invalid details");
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              full_name: parsed.data.fullName,
              facility: parsed.data.facility ?? "",
              district: parsed.data.district ?? "",
            },
          },
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        if (data.session) {
          toast.success("Account created");
          navigate({ to: "/", replace: true });
        } else {
          toast.success("Check your email to confirm your account");
        }
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="mb-7 flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary shadow-glow">
          <Activity className="size-6" strokeWidth={2.4} />
        </span>
        <div>
          <h1 className="font-display text-lg font-semibold leading-tight">HealthChain AI</h1>
          <p className="text-[11px] text-muted-foreground">Federated PHC resilience network</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/70 p-5 backdrop-blur">
        <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg border border-border bg-secondary/40 p-1">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={
                mode === m
                  ? "rounded-md bg-primary/15 py-1.5 text-xs font-medium text-primary"
                  : "rounded-md py-1.5 text-xs font-medium text-muted-foreground"
              }
            >
              {m === "signin" ? "Sign in" : "Request access"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" value={fields.fullName} onChange={set("fullName")} maxLength={100} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="facility">PHC / facility</Label>
                  <Input id="facility" value={fields.facility} onChange={set("facility")} maxLength={120} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="district">District</Label>
                  <Input id="district" value={fields.district} onChange={set("district")} maxLength={120} />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={fields.email}
              onChange={set("email")}
              maxLength={255}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={fields.password}
              onChange={set("password")}
              maxLength={72}
            />
          </div>

          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3 text-[10px] uppercase tracking-wide text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          or
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
          Continue with Google
        </Button>

        <p className="mt-4 flex items-start gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
          Access is role-scoped. New accounts start as field officers until a coordinator elevates them.
        </p>
      </div>
    </div>
  );
}

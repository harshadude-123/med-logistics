import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Activity, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const credentialsSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(72),
});

export function SignInDialog() {
  const { session, loading } = useSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState({ email: "", password: "" });

  useEffect(() => {
    if (loading) return;
    setOpen(!session && !dismissed);
  }, [loading, session, dismissed]);

  const set = (key: keyof typeof fields) => (e: { target: { value: string } }) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = credentialsSchema.safeParse(fields);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid credentials");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in");
    setDismissed(true);
    setOpen(false);
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
    setBusy(false);
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setDismissed(true);
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary shadow-glow">
            <Activity className="size-5" strokeWidth={2.4} />
          </span>
          <DialogTitle className="font-display text-base">Sign in to HealthChain AI</DialogTitle>
          <DialogDescription className="text-xs">
            Sign in for role-scoped operations, or keep browsing the national overview.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="modal-email">Work email</Label>
            <Input
              id="modal-email"
              type="email"
              autoComplete="email"
              value={fields.email}
              onChange={set("email")}
              maxLength={255}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="modal-password">Password</Label>
            <Input
              id="modal-password"
              type="password"
              autoComplete="current-password"
              value={fields.password}
              onChange={set("password")}
              maxLength={72}
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
            Sign in
          </Button>
        </form>

        <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={busy}>
          Continue with Google
        </Button>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <Link to="/auth" className="text-primary hover:underline" onClick={() => setDismissed(true)}>
            Request access
          </Link>
          <button
            type="button"
            className="hover:text-foreground"
            onClick={() => {
              setDismissed(true);
              setOpen(false);
            }}
          >
            Continue without signing in
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

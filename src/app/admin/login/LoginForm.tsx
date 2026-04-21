"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = useMemo(() => searchParams.get("next") ?? "/admin/surveys", [searchParams]);
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(() => {
    if (errorParam === "forbidden") return "אין הרשאה לחשבון זה.";
    if (errorParam === "auth") return "ההתחברות נכשלה. נסו שוב.";
    if (errorParam === "config") return "השרת לא מוגדר ל‑Supabase Auth.";
    return null;
  });

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  async function onEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        return;
      }
      router.push(next.startsWith("/") ? next : "/admin/surveys");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setMessage(null);
    setLoading(true);
    const origin = window.location.origin;
    const redirectTo = `${origin}/admin/auth/callback?next=${encodeURIComponent(next)}`;
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-border/80 shadow-sm">
      <CardHeader className="space-y-1 text-right">
        <CardTitle className="text-2xl font-semibold">כניסה לניהול</CardTitle>
        <CardDescription>סקרי לקוחות — גישה למורשים בלבד</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message ? (
          <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-right text-sm text-destructive">
            {message}
          </p>
        ) : null}
        <form onSubmit={onEmailLogin} className="space-y-4">
          <div className="space-y-2 text-right">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              dir="ltr"
              className="text-left"
            />
          </div>
          <div className="space-y-2 text-right">
            <Label htmlFor="password">סיסמה</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              dir="ltr"
              className="text-left"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "מתחבר…" : "התחברות"}
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">או</span>
          </div>
        </div>
        <Button type="button" variant="outline" className="w-full" disabled={loading} onClick={onGoogle}>
          התחברות עם Google
        </Button>
      </CardContent>
    </Card>
  );
}

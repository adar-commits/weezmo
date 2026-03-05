"use client";

import { useState } from "react";
import Link from "next/link";
import { BRAND_LINKS } from "@/config/links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface NewsletterFormProps {
  documentId: string;
  branchName: string;
}

export function NewsletterForm({ documentId, branchName }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !consent) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          consentPrivacy: consent,
          documentId,
          branchName: branchName || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setEmail("");
        setConsent(false);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="newsletter-email" className="sr-only">
          דואר אלקטרוני
        </Label>
        <Input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="דואר אלקטרוני"
          className="max-w-xs"
          required
        />
      </div>
      <div className="flex items-start gap-3 space-y-0">
        <Checkbox
          id="newsletter-consent"
          checked={consent}
          onCheckedChange={(v) => setConsent(v === true)}
          required
          className="mt-0.5"
        />
        <Label
          htmlFor="newsletter-consent"
          className="text-sm font-normal text-muted-foreground leading-relaxed cursor-pointer"
        >
          הריני מאשר/ת כי קראתי והבנתי את{" "}
          <Link
            href={BRAND_LINKS.privacyPolicyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-90"
          >
            מדיניות הפרטיות וה&quot;עוגיות&quot;
          </Link>
          , ואני מאשר/ת קבלת מידע ו/או דברי פרסומת מ-{" "}
          <Link
            href={BRAND_LINKS.privacyPolicyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2 hover:opacity-90"
          >
            השטיח האדום
          </Link>{" "}
          בדואר אלקטרוני ו/או סמס.
        </Label>
      </div>
      <Button
        type="submit"
        disabled={status === "loading"}
        className="bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white"
      >
        {status === "loading" ? "שולח..." : "צרפו אותי!"}
      </Button>
      {status === "success" && (
        <p className={cn("text-sm font-medium text-green-600 dark:text-green-400")}>נרשמת בהצלחה!</p>
      )}
      {status === "error" && (
        <p className={cn("text-sm font-medium text-destructive")}>אירעה שגיאה. נסו שוב.</p>
      )}
    </form>
  );
}

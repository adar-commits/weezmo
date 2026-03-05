"use client";

import { useState } from "react";
import Link from "next/link";
import { BRAND_LINKS } from "@/config/links";

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
      <div>
        <label htmlFor="newsletter-email" className="sr-only">
          דואר אלקטרוני
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="דואר אלקטרוני"
          className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          required
        />
      </div>
      <label className="flex items-start gap-3 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-500"
          required
        />
        <span>
          הריני מאשר/ת כי קראתי והבנתי את{" "}
          <Link href={BRAND_LINKS.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline underline-offset-1 hover:text-blue-700">
            מדיניות הפרטיות וה&quot;עוגיות&quot;
          </Link>
          , ואני מאשר/ת קבלת מידע ו/או דברי פרסומת מ-{" "}
          <Link href={BRAND_LINKS.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline underline-offset-1 hover:text-blue-700">
            השטיח האדום
          </Link>{" "}
          בדואר אלקטרוני ו/או סמס.
        </span>
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-60 transition-colors"
      >
        {status === "loading" ? "שולח..." : "צרפו אותי!"}
      </button>
      {status === "success" && <p className="text-sm text-emerald-600 font-medium">נרשמת בהצלחה!</p>}
      {status === "error" && <p className="text-sm text-red-600">אירעה שגיאה. נסו שוב.</p>}
    </form>
  );
}

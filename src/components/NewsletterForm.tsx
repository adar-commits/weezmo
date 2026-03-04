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
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
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
          className="w-full max-w-sm rounded-lg border border-stone-300 px-4 py-3 text-base mt-2"
          required
        />
      </div>
      <label className="flex items-start gap-2 text-sm text-stone-600">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
          required
        />
        <span>
          הריני מאשר/ת כי קראתי והבנתי את{" "}
          <Link href={BRAND_LINKS.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            מדיניות הפרטיות וה&quot;עוגיות&quot;
          </Link>
          , ואני מאשר/ת קבלת מידע ו/או דברי פרסומת מ-{" "}
          <Link href={BRAND_LINKS.privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            השטיח האדום
          </Link>{" "}
          בדואר אלקטרוני ו/או סמס.
        </span>
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-lg bg-[#a61a21] px-6 py-3 text-base font-semibold text-white disabled:opacity-70 mt-4"
      >
        {status === "loading" ? "שולח..." : "צרפו אותי!"}
      </button>
      {status === "success" && <p className="text-sm text-green-700">נרשמת בהצלחה!</p>}
      {status === "error" && <p className="text-sm text-red-700">אירעה שגיאה. נסו שוב.</p>}
    </form>
  );
}

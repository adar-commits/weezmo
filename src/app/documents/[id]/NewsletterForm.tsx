"use client";

import { useState } from "react";
import { BRAND_LINKS } from "@/config/links";

interface NewsletterFormProps {
  documentId: string;
  branchName?: string;
}

export function NewsletterForm({ documentId, branchName }: NewsletterFormProps) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("נא להזין כתובת אימייל תקינה.");
      setStatus("error");
      return;
    }
    if (!consent) {
      setErrorMessage("נא לאשר את תנאי הפרטיות.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          consentPrivacy: consent,
          documentId,
          branchName: branchName ?? null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMessage(typeof data.message === "string" ? data.message : "אירעה שגיאה. נסו שוב.");
        setStatus("error");
        return;
      }
      setStatus("success");
    } catch {
      setErrorMessage("אירעה שגיאה. נסו שוב.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="nl-success show">
        ✅ נרשמת בהצלחה!
      </div>
    );
  }

  return (
    <form id="nl-form" onSubmit={handleSubmit}>
      <input
        className="nl-input"
        id="nl-email"
        type="email"
        placeholder="דואר אלקטרוני"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "loading"}
      />
      <div className="nl-consent">
        <input
          type="checkbox"
          id="nl-consent-cb"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          disabled={status === "loading"}
        />
        <span>
          <a href={BRAND_LINKS.privacyPolicyUrl} target="_blank" rel="noopener">
            הריני מאשר/ת כי קראתי והבנתי את מדיניות הפרטיות וה&quot;עוגיות&quot; (&quot;COOKIES&quot;), ואני מאשר/ת קבלת מידע ו/או דברי פרסומת מ- השטיח האדום בדואר אלקטרוני ו/או סמס.
          </a>
        </span>
      </div>
      <p className={`nl-error-msg ${errorMessage ? "show" : ""}`} id="nl-err">
        {errorMessage}
      </p>
      <button type="submit" className="nl-submit" id="nl-btn" disabled={status === "loading"}>
        {status === "loading" ? (
          <>
            שולח... <span className="spinner" />
          </>
        ) : (
          "צרפו אותי!"
        )}
      </button>
    </form>
  );
}

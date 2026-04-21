"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Link from "next/link";
import { BRAND_LINKS } from "@/config/links";

const STORAGE_KEY = "weezmo_customer_club_modal_v1";

export function CustomerClubModal() {
  const titleId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY)) {
        return;
      }
    } catch {
      return;
    }
    const t = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(t);
  }, []);

  const close = useCallback((value: "yes" | "skip") => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore quota / private mode */
    }
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="club-modal-root" role="presentation">
      <div className="club-modal-backdrop" aria-hidden />
      <div
        className="club-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        dir="rtl"
      >
        <header className="club-modal-header">
          <h2 id={titleId} className="club-modal-title">
            הצטרפו למועדון הלקוחות
          </h2>
        </header>
        <div className="club-modal-body">
          <p className="club-modal-text">
            בלחיצה על &quot;כן&quot; אני מאשר/ת קבלת מידע שיווקי, מבצעים והטבות מ<strong>הום קמעונאות</strong> בדוא״ל
            ו/או ב-SMS, בהתאם לתקנון המועדון ול
            <Link href={BRAND_LINKS.privacyPolicyUrl} className="club-modal-link" target="_blank" rel="noopener noreferrer">
              מדיניות הפרטיות
            </Link>
            . ייתכן שימוש במידע לצורך התאמת קהלים ברשתות חברתיות, כפי שמפורט במדיניות.
          </p>
        </div>
        <footer className="club-modal-footer">
          <button type="button" className="club-modal-btn club-modal-btn--secondary" onClick={() => close("skip")}>
            דלג
          </button>
          <button type="button" className="club-modal-btn club-modal-btn--primary" onClick={() => close("yes")}>
            כן
          </button>
        </footer>
      </div>
    </div>
  );
}

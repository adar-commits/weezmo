"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CustomerSurveyPayload } from "@/types/customer-survey";

const DEFAULT_LOGO =
  "https://cdn.shopify.com/s/files/1/0594/9839/7887/files/img.png?v=1772750312";

/** Visual order RTL: inline-start (right) = happiest (5) … lowest (1) on the left. */
const LIKERT_LEVELS = [5, 4, 3, 2, 1] as const;

const LEVEL_EMOJI: Record<number, string> = {
  5: "\u{1F60D}",
  4: "\u{1F60A}",
  3: "\u{1F610}",
  2: "\u{1F615}",
  1: "\u{1F622}",
};

const LABELS_HE: Record<number, string> = {
  5: "מצוין",
  4: "טוב",
  3: "בינוני",
  2: "לא טוב",
  1: "גרוע",
};

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function lightConfetti(container: HTMLElement | null) {
  if (!container || prefersReducedMotion()) return;
  const colors = ["#b30103", "#ffffff", "#ff6b6b", "#ffd4d4"];
  const pieces = 18;
  const rect = container.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  for (let i = 0; i < pieces; i++) {
    const el = document.createElement("span");
    el.className = "survey-confetti-piece";
    el.style.background = colors[i % colors.length];
    el.style.left = `${cx}px`;
    el.style.top = `${cy}px`;
    el.style.setProperty("--dx", `${(Math.random() - 0.5) * 220}px`);
    el.style.setProperty("--dy", `${-80 - Math.random() * 160}px`);
    el.style.setProperty("--rot", `${Math.random() * 540 - 270}deg`);
    document.body.appendChild(el);
    window.setTimeout(() => el.remove(), 2200);
  }
}

export function CustomerSurveyView({
  documentId,
  payload,
}: {
  documentId: string;
  payload: CustomerSurveyPayload;
}) {
  const logoSrc = payload.logoUrl ?? DEFAULT_LOGO;
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  const setRating = useCallback((questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const submit = useCallback(async () => {
    setError(null);
    const missing = payload.questions.filter(
      (q) => q.required && answers[q.id] === undefined
    );
    if (missing.length > 0) {
      setError("נא לדרג את כל השאלות המסומנות בכוכבית");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/survey-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, answers }),
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setError(typeof data.message === "string" ? data.message : "שליחה נכשלה");
        return;
      }
      setDone(true);
    } catch {
      setError("שגיאת רשת, נסו שוב");
    } finally {
      setSubmitting(false);
    }
  }, [answers, documentId, payload.questions]);

  useEffect(() => {
    if (done) {
      lightConfetti(successRef.current);
    }
  }, [done]);

  if (done) {
    return (
      <div className="survey-success" ref={successRef} role="status" aria-live="polite">
        <div className="survey-success-icon" aria-hidden>
          <svg viewBox="0 0 52 52" className="survey-check-svg">
            <circle className="survey-check-circle" cx="26" cy="26" r="24" fill="none" />
            <path className="survey-check-mark" fill="none" d="M14 27l8 8 16-18" />
          </svg>
        </div>
        <h2 className="survey-success-title">תודה רבה!</h2>
        <p className="survey-success-text">קיבלנו את תשובותיכם — תודה על הזמן שנתתם.</p>
      </div>
    );
  }

  return (
    <div className="survey-shell">
      <header className="survey-header">
        <img className="survey-logo" src={logoSrc} alt="" width={220} height={80} />
        <h1 className="survey-title">{payload.title}</h1>
        {payload.subtitle ? (
          <p className="survey-subtitle">{payload.subtitle}</p>
        ) : null}
      </header>

      <form
        className="survey-form"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="survey-questions">
          {payload.questions.map((q, index) => (
            <fieldset
              key={q.id}
              className="survey-q survey-q-enter"
              style={{ animationDelay: prefersReducedMotion() ? "0ms" : `${index * 55}ms` }}
            >
              <legend id={`survey-legend-${q.id}`} className="survey-q-text">
                {q.text}
                {q.required ? <span className="survey-required"> *</span> : null}
              </legend>
              <div
                className="survey-likert-row"
                role="radiogroup"
                aria-labelledby={`survey-legend-${q.id}`}
              >
                  {LIKERT_LEVELS.map((level) => {
                    const selected = answers[q.id] === level;
                    return (
                      <label
                        key={level}
                        className={`survey-face ${selected ? "survey-face-selected" : ""}`}
                      >
                        <input
                          type="radio"
                          className="survey-radio"
                          name={`rating-${q.id}`}
                          value={level}
                          checked={selected}
                          onChange={() => setRating(q.id, level)}
                        />
                        <span className="survey-emoji" aria-hidden>
                          {LEVEL_EMOJI[level]}
                        </span>
                        <span className="sr-only">{LABELS_HE[level]}</span>
                      </label>
                    );
                  })}
              </div>
            </fieldset>
          ))}
        </div>

        {error ? (
          <p className="survey-error" role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          className="survey-submit"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? (
            <span className="survey-submit-inner">
              <span className="survey-spinner" aria-hidden />
              שולחים…
            </span>
          ) : (
            "שליחה"
          )}
        </button>
      </form>
    </div>
  );
}

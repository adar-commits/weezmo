"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_DELIVERY_ADDRESS_SUBTITLE,
  DEFAULT_DELIVERY_ADDRESS_TITLE,
  deliveryAddressInitialValues,
  type DeliveryAddressFormValues,
  type DeliveryAddressPayload,
} from "@/types/delivery-address";

const DEFAULT_LOGO =
  "https://cdn.shopify.com/s/files/1/0594/9839/7887/files/img.png?v=1772750312";

type FieldKey = keyof DeliveryAddressFormValues;

const FIELDS: {
  key: FieldKey;
  label: string;
  required?: boolean;
  type?: "text" | "tel" | "textarea";
  autoComplete?: string;
  half?: boolean;
}[] = [
  { key: "full_name", label: "שם מלא", required: true, autoComplete: "name" },
  { key: "street", label: "רחוב", required: true, autoComplete: "street-address" },
  { key: "house_number", label: "מס׳ בית", required: true, half: true, autoComplete: "off" },
  { key: "city", label: "עיר", required: true, half: true, autoComplete: "address-level2" },
  { key: "floor", label: "קומה", half: true, autoComplete: "off" },
  { key: "apartment", label: "דירה", half: true, autoComplete: "off" },
  { key: "phone", label: "טלפון", required: true, type: "tel", autoComplete: "tel" },
  {
    key: "delivery_instructions",
    label: "הוראות לשליח",
    type: "textarea",
    autoComplete: "off",
  },
];

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
    el.className = "da-confetti-piece";
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

function validate(values: DeliveryAddressFormValues): string | null {
  if (!values.full_name.trim()) return "נא למלא שם מלא";
  if (!values.street.trim()) return "נא למלא רחוב";
  if (!values.house_number.trim()) return "נא למלא מספר בית";
  if (!values.city.trim()) return "נא למלא עיר";
  if (!values.phone.trim()) return "נא למלא טלפון";
  return null;
}

export function DeliveryAddressView({
  documentId,
  payload,
  /** When true, submit only shows success locally (no API). */
  previewMode = false,
}: {
  documentId: string;
  payload: DeliveryAddressPayload;
  previewMode?: boolean;
}) {
  const logoSrc = payload.logoUrl ?? DEFAULT_LOGO;
  const title =
    payload.title && payload.title.trim() ? payload.title : DEFAULT_DELIVERY_ADDRESS_TITLE;
  const subtitle =
    payload.subtitle && payload.subtitle.trim()
      ? payload.subtitle
      : DEFAULT_DELIVERY_ADDRESS_SUBTITLE;

  const [values, setValues] = useState<DeliveryAddressFormValues>(() =>
    deliveryAddressInitialValues(payload)
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  const setField = useCallback((key: FieldKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const submit = useCallback(async () => {
    setError(null);
    const validationError = validate(values);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (previewMode) {
      setDone(true);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/delivery-address-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, address: values }),
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
  }, [documentId, previewMode, values]);

  useEffect(() => {
    if (done) {
      lightConfetti(successRef.current);
    }
  }, [done]);

  if (done) {
    return (
      <div className="da-success" ref={successRef} role="status" aria-live="polite">
        <div className="da-success-icon" aria-hidden>
          <svg viewBox="0 0 52 52" className="da-check-svg">
            <circle className="da-check-circle" cx="26" cy="26" r="24" fill="none" />
            <path className="da-check-mark" fill="none" d="M14 27l8 8 16-18" />
          </svg>
        </div>
        <h2 className="da-success-title">תודה רבה!</h2>
        <p className="da-success-text">קיבלנו את פרטי המשלוח — נעדכן את ההזמנה בהקדם.</p>
      </div>
    );
  }

  return (
    <div className="da-shell">
      {previewMode ? (
        <p className="da-preview-banner" role="note">
          תצוגת עיצוב מקומית — להפצה באמת יוצרים מסמך דרך POST /api/documents ומקבלים קישור ייחודי.
        </p>
      ) : null}
      <header className="da-header">
        <img className="da-logo" src={logoSrc} alt="" width={220} height={80} />
        <h1 className="da-title">{title}</h1>
        <p className="da-subtitle">{subtitle}</p>
      </header>

      <form
        className="da-form"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        noValidate
      >
        <div className="da-fields">
          {FIELDS.map((field, index) => {
            const id = `da-${field.key}`;
            const value = values[field.key];
            const isTextarea = field.type === "textarea";

            return (
              <div
                key={field.key}
                className={`da-field ${field.half ? "da-field--half" : ""} da-field-enter`}
                style={{ animationDelay: prefersReducedMotion() ? "0ms" : `${index * 40}ms` }}
              >
                <label htmlFor={id} className="da-label">
                  {field.label}
                  {field.required ? <span className="da-required"> *</span> : null}
                </label>
                {isTextarea ? (
                  <textarea
                    id={id}
                    className="da-input da-textarea"
                    value={value}
                    onChange={(e) => setField(field.key, e.target.value)}
                    rows={3}
                    autoComplete={field.autoComplete}
                    dir="rtl"
                  />
                ) : (
                  <input
                    id={id}
                    className="da-input"
                    type={field.type ?? "text"}
                    value={value}
                    onChange={(e) => setField(field.key, e.target.value)}
                    autoComplete={field.autoComplete}
                    dir={field.key === "phone" || field.key === "house_number" ? "ltr" : "rtl"}
                  />
                )}
              </div>
            );
          })}
        </div>

        {error ? (
          <p className="da-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="da-submit-wrap">
          <button
            type="submit"
            className="da-submit"
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting ? (
              <span className="da-submit-inner">
                <span className="da-spinner" aria-hidden />
                שולחים…
              </span>
            ) : (
              "שליחה"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

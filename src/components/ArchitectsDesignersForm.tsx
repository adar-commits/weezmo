"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import confetti from "canvas-confetti";
import { BRAND_LINKS } from "@/config/links";

const HOM_GROUP_LOGO = "/images/hom-group-logo-light.png";
const ENTRANCE_MIN_MS = 900;

const ACTIVITY_TYPE_OPTIONS = [
  "אדריכל/ית",
  "מעצב/ת פנים",
  "מעצב/ת רהיטים",
  "יועץ/ת עיצוב",
  "אחר",
] as const;

const DESIGN_TYPE_OPTIONS = [
  "מודרני",
  "קלאסי",
  "סקנדינавי",
  "מעורב",
  "מינימליסטי",
  "אחר",
] as const;

const SPECIALIZATION_OPTIONS = [
  "פרטי",
  "מוסדי",
  "פרטי + מוסדי",
  "מסחרי",
  "אחר",
] as const;

const SENIORITY_OPTIONS = [
  "פחות מ-2 שנים",
  "2-5 שנים",
  "5-10 שנים",
  "10-20 שנים",
  "מעל 20 שנים",
] as const;

const HEAR_ABOUT_OPTIONS = [
  "המלצה מחבר",
  "אינטרנט",
  "רשתות חברתיות",
  "תערוכה / אירוע",
  "סניף / חנות",
  "אחר",
] as const;

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  businessName: string;
  activityType: string;
  vatNo: string;
  businessAdress: string;
  city: string;
  designType: string;
  specializationType: string;
  professionalSeniority: string;
  birthDate: string;
  designerOrigin: string;
  consent: boolean;
};

const INITIAL_STATE: FormState = {
  fullName: "",
  phone: "",
  email: "",
  businessName: "",
  activityType: "",
  vatNo: "",
  businessAdress: "",
  city: "",
  designType: "",
  specializationType: "",
  professionalSeniority: "",
  birthDate: "",
  designerOrigin: "",
  consent: false,
};

function fireConfetti() {
  const duration = 2800;
  const end = Date.now() + duration;
  const colors = ["#e30613", "#1a1a1a", "#0d6efd", "#f2f2f2", "#ffd700"];

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.65 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.65 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  confetti({
    particleCount: 120,
    spread: 90,
    origin: { y: 0.6 },
    colors,
  });
  frame();
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`architects-form__field ${className ?? ""}`.trim()}>
      <label className="architects-form__label">{label}</label>
      {children}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "בחר",
  className,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Field label={label} className={className}>
      <select
        className="architects-form__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </Field>
  );
}

function ArchitectsEntranceLoader({ hidden }: { hidden: boolean }) {
  return (
    <div
      className={`architects-entrance ${hidden ? "is-hidden" : ""}`.trim()}
      role="status"
      aria-live="polite"
      aria-busy={!hidden}
    >
      <Image
        src={HOM_GROUP_LOGO}
        alt="HōM GROUP"
        width={561}
        height={243}
        className="architects-entrance__logo"
        priority
      />
      <div className="architects-entrance__spinner" aria-hidden />
      <span className="sr-only">טוען את הטופס</span>
    </div>
  );
}

export function ArchitectsDesignersForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [entranceReady, setEntranceReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setEntranceReady(true), ENTRANCE_MIN_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status === "success") {
      fireConfetti();
    }
  }, [status]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    if (!form.fullName.trim()) return "נא למלא שם מלא.";
    if (!form.phone.trim()) return "נא למלא טלפון נייד.";
    if (!form.email.trim() || !form.email.includes("@")) return "נא למלא כתובת אי-מייל תקינה.";
    if (!form.businessName.trim()) return "נא למלא שם העסק.";
    if (!form.activityType) return "נא לבחור סוג העסק.";
    if (!form.vatNo.trim()) return "נא למלא ח.פ / ת.ז.";
    if (!form.businessAdress.trim()) return "נא למלא כתובת העסק.";
    if (!form.city.trim()) return "נא למלא עיר.";
    if (!form.designType) return "נא לבחור סוג עיצוב.";
    if (!form.specializationType) return "נא לבחור סוג התמחות.";
    if (!form.consent) return "נא לאשר את הצהרת הפרטיות לפני שליחת הטופס.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      setStatus("error");
      return;
    }

    setStatus("loading");

    const payload: Record<string, string> = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      businessName: form.businessName.trim(),
      vatNo: form.vatNo.trim(),
      businessAdress: form.businessAdress.trim(),
      city: form.city.trim(),
      activityType: form.activityType,
      designType: form.designType,
      specializationType: form.specializationType,
    };

    if (form.professionalSeniority.trim()) {
      payload.professionalSeniority = form.professionalSeniority;
    }
    if (form.birthDate.trim()) {
      payload.birthDate = form.birthDate.trim();
    }
    if (form.designerOrigin.trim()) {
      payload.designerOrigin = form.designerOrigin;
    }

    try {
      const res = await fetch("/api/architects-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([payload]),
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
      <div className="architects-page">
        <div className="architects-page__inner">
          <div className="architects-page__logo-wrap">
            <Image
              src={HOM_GROUP_LOGO}
              alt="HōM GROUP"
              width={561}
              height={243}
              className="architects-page__logo"
              priority
            />
          </div>
          <div
            className="architects-form__alert architects-form__alert--success is-visible"
            role="alert"
          >
            הטופס נשלח בהצלחה!
            <br />
            תודה על ההצטרפות לרשימת האדריכלים והמעצבים שלנו.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ArchitectsEntranceLoader hidden={entranceReady} />

      <div className={`architects-page ${entranceReady ? "is-ready" : ""}`.trim()}>
        <div className="architects-page__inner">
          <div className="architects-page__logo-wrap">
            <Image
              src={HOM_GROUP_LOGO}
              alt="HōM GROUP"
              width={561}
              height={243}
              className="architects-page__logo"
              priority
            />
          </div>

          <h1 className="architects-page__title">הצטרפו לרשימת האדריכלים והמעצבים שלנו</h1>

          <form className="architects-form" onSubmit={handleSubmit} noValidate>
            <div className="architects-form__grid">
              <div className="architects-form__row architects-form__row--3">
                <Field label="שם מלא">
                  <input
                    className="architects-form__input"
                    type="text"
                    autoComplete="name"
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    disabled={status === "loading"}
                  />
                </Field>
                <Field label="טלפון נייד">
                  <input
                    className="architects-form__input"
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    disabled={status === "loading"}
                  />
                </Field>
                <Field label="כתובת אי-מייל">
                  <input
                    className="architects-form__input"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    disabled={status === "loading"}
                  />
                </Field>
              </div>

              <div className="architects-form__row architects-form__row--3">
                <Field label="שם העסק">
                  <input
                    className="architects-form__input"
                    type="text"
                    autoComplete="organization"
                    value={form.businessName}
                    onChange={(e) => updateField("businessName", e.target.value)}
                    disabled={status === "loading"}
                  />
                </Field>
                <SelectField
                  label="סוג העסק"
                  value={form.activityType}
                  onChange={(value) => updateField("activityType", value)}
                  options={ACTIVITY_TYPE_OPTIONS}
                  disabled={status === "loading"}
                />
                <Field label="ח.פ / ת.ז (עוסק פטור)">
                  <input
                    className="architects-form__input"
                    type="text"
                    value={form.vatNo}
                    onChange={(e) => updateField("vatNo", e.target.value)}
                    disabled={status === "loading"}
                  />
                </Field>
              </div>

              <div className="architects-form__row architects-form__row--4">
                <Field label="כתובת העסק">
                  <input
                    className="architects-form__input"
                    type="text"
                    autoComplete="street-address"
                    value={form.businessAdress}
                    onChange={(e) => updateField("businessAdress", e.target.value)}
                    disabled={status === "loading"}
                  />
                </Field>
                <Field label="עיר">
                  <input
                    className="architects-form__input"
                    type="text"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    disabled={status === "loading"}
                  />
                </Field>
                <SelectField
                  label="סוג עיצוב"
                  value={form.designType}
                  onChange={(value) => updateField("designType", value)}
                  options={DESIGN_TYPE_OPTIONS}
                  disabled={status === "loading"}
                />
                <SelectField
                  label="סוג התמחות"
                  value={form.specializationType}
                  onChange={(value) => updateField("specializationType", value)}
                  options={SPECIALIZATION_OPTIONS}
                  disabled={status === "loading"}
                />
              </div>

              <div className="architects-form__row architects-form__row--1-quarter">
                <SelectField
                  label="וותק במקצוע"
                  value={form.professionalSeniority}
                  onChange={(value) => updateField("professionalSeniority", value)}
                  options={SENIORITY_OPTIONS}
                  className="architects-form__field--quarter"
                  disabled={status === "loading"}
                />
              </div>

              <div className="architects-form__row architects-form__row--2">
                <Field label="תאריך לידה (רשות)">
                  <div className="architects-form__date-wrap">
                    <svg
                      className="architects-form__date-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      aria-hidden
                    >
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M8 3v4M16 3v4M3 10h18" />
                    </svg>
                    <input
                      className="architects-form__input"
                      type="date"
                      value={form.birthDate}
                      onChange={(e) => updateField("birthDate", e.target.value)}
                      disabled={status === "loading"}
                    />
                  </div>
                </Field>
                <SelectField
                  label="איך שמעת עלינו"
                  value={form.designerOrigin}
                  onChange={(value) => updateField("designerOrigin", value)}
                  options={HEAR_ABOUT_OPTIONS}
                  disabled={status === "loading"}
                />
              </div>
            </div>

            <div className="architects-form__consent">
              <input
                type="checkbox"
                id="architects-consent"
                checked={form.consent}
                onChange={(e) => updateField("consent", e.target.checked)}
                disabled={status === "loading"}
              />
              <label htmlFor="architects-consent" className="architects-form__consent-text">
                אני מאשר/ת קבלת דיוור ומידע פרסומי בדוא&quot;ל ו/או מסרונים וכיוצ&quot;ב מרשת השטיח
                האדום בע&quot;מ ומאשר שקראתי את{" "}
                <a href={BRAND_LINKS.privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
                  הצהרת הפרטיות, דיוור ומידע פרסומי
                </a>
              </label>
            </div>

            <div
              className={`architects-form__alert architects-form__alert--error ${errorMessage ? "is-visible" : ""}`}
              role="alert"
            >
              {errorMessage}
            </div>

            <button
              type="submit"
              className="architects-form__submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <span className="architects-form__submit-spinner" aria-hidden />
                  שולח...
                </>
              ) : (
                "שלח טופס"
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

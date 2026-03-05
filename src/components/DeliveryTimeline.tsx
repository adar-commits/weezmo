"use client";

import { motion } from "framer-motion";

const STEPS = [
  { key: "placed", label: "ההזמנה נרשמה" },
  { key: "prepared", label: "מוכן על ידי האומנים" },
  { key: "shipping", label: "על השטיח האדום (משלוח)" },
  { key: "arrival", label: "הגעה" },
] as const;

export function DeliveryTimeline() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      aria-label="מעקב משלוח"
    >
      <h3 className="text-base font-semibold text-slate-800">מה קורה עכשיו?</h3>
      <p className="mt-1 text-sm text-slate-600">הדרך מההזמנה עד אליכם הביתה</p>
      <div className="mt-6 flex items-center justify-between gap-2">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div
                  className="h-0.5 flex-1 bg-slate-200"
                  aria-hidden
                />
              )}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.1 * i,
                  duration: 0.3,
                  ease: "easeOut",
                }}
                className={`
                  flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium
                  ${i === 0 ? "bg-[#a61a21] text-white ring-2 ring-[#a61a21]/20" : "bg-slate-100 text-slate-500"}
                `}
                aria-current={i === 0 ? "step" : undefined}
              >
                {i + 1}
              </motion.div>
              {i < STEPS.length - 1 && (
                <div
                  className="h-0.5 flex-1 bg-slate-200"
                  aria-hidden
                />
              )}
            </div>
            <p
              className={`mt-2 text-center text-xs leading-tight ${i === 0 ? "font-medium text-slate-800" : "text-slate-500"}`}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

#!/usr/bin/env node
/**
 * Creates one customer_survey document via POST /api/documents and prints the public link.
 *
 * Usage (from repo root):
 *   node --env-file=.env.local scripts/create-sample-survey.mjs
 *
 * Requires in .env.local:
 *   DOCUMENTS_API_KEY
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (API route needs Supabase)
 *
 * Optional:
 *   SAMPLE_API_BASE=http://localhost:3000   (default)
 */

const base =
  process.env.SAMPLE_API_BASE?.replace(/\/$/, "") || "http://127.0.0.1:3000";
const key = process.env.DOCUMENTS_API_KEY;

const payload = {
  template_id: "customer_survey",
  title: "סקר שביעות רצון",
  subtitle: "נשמח לדעת איך נוכל להשתפר, דעתך חשובה לנו ❤️",
  order_id: `sample-${Date.now()}`,
  branch_id: "3000",
  customer_name: "דוגמה סקר",
  customer_phone: "0501234567",
  questions: [
    {
      id: "q_service",
      text: "דרג את שביעות רצונך מהשירות שקיבלת",
      required: true,
    },
    {
      id: "q_rep",
      text: "דרג את שביעות רצונך מאדיבות ומקצועיות הנציג",
      required: true,
    },
    {
      id: "q_speed",
      text: "דרג את שביעות רצונך ממהירות התגובה",
      required: true,
    },
    {
      id: "q_solution",
      text: "דרג באיזו מידה הפתרון שקיבלת היה ברור, יעיל ומספק",
      required: true,
    },
  ],
  metadata: { source: "create-sample-survey.mjs" },
};

async function main() {
  if (!key) {
    console.error(
      "Missing DOCUMENTS_API_KEY. Create .env.local from .env.example or run: vercel link && vercel env pull .env.local"
    );
    process.exit(1);
  }

  const res = await fetch(`${base}/api/documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error("Non-JSON response:", res.status, text.slice(0, 500));
    process.exit(1);
  }

  if (!res.ok || json.status !== "success") {
    console.error("API error:", res.status, JSON.stringify(json, null, 2));
    process.exit(1);
  }

  const link = json?.data?.link;
  const id = json?.data?.data?.id;
  console.log("");
  console.log("Created survey document.");
  console.log("id:  ", id);
  console.log("open:", link);
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

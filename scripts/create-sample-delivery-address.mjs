#!/usr/bin/env node
/**
 * Creates one delivery_address document via POST /api/documents and prints the public link.
 *
 * Usage (from repo root):
 *   node --env-file=.env.local scripts/create-sample-delivery-address.mjs
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

/** Partial pre-fill — customer can edit every field before submit. */
const payload = {
  template_id: "delivery_address",
  title: "פרטי משלוח",
  subtitle: "נראה שחסרים לנו פרטי כתובת למשלוח — נשמח שתמלאו את הטופס",
  order_id: `sample-address-${Date.now()}`,
  branch_id: "3000",
  full_name: "תמר שני",
  street: "הרצל",
  house_number: "12",
  city: "תל אביב",
  floor: "3",
  apartment: "7",
  phone: "0501234567",
  delivery_instructions: "להשאיר ליד הדלת",
  metadata: { source: "create-sample-delivery-address.mjs" },
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
  console.log("Created delivery address document.");
  console.log("id:  ", id);
  console.log("open:", link);
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

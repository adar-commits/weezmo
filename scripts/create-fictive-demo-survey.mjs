#!/usr/bin/env node
/**
 * Creates one customer_survey row via POST /api/documents (fictive Hebrew demo data).
 * Optionally posts synthetic responses to /api/survey-submit for admin KPI demos.
 *
 * Usage (repo root):
 *   node --env-file=.env.local scripts/create-fictive-demo-survey.mjs
 *
 * Against production:
 *   SAMPLE_API_BASE=https://weezmo.vercel.app node --env-file=.env.local scripts/create-fictive-demo-survey.mjs
 *
 * Env:
 *   DOCUMENTS_API_KEY (required)
 *   SAMPLE_API_BASE (optional, default http://127.0.0.1:3000)
 *   SEED_RESPONSES (optional, default 0) — number of POSTs to /api/survey-submit for this document
 */

const base =
  process.env.SAMPLE_API_BASE?.replace(/\/$/, "") || "http://127.0.0.1:3000";
const key = process.env.DOCUMENTS_API_KEY;
const seedCount = Math.max(
  0,
  Math.min(500, Number.parseInt(String(process.env.SEED_RESPONSES ?? "0"), 10) || 0)
);

const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");

const payload = {
  template_id: "customer_survey",
  title: "סקר שביעות רצון — חנות ריהוט דמו",
  subtitle: "נשמח לשמוע איך הייתה החוויה אצלנו (נתוני דמו בלבד)",
  order_id: `demo-ORD-${stamp}-${Math.floor(Math.random() * 9000 + 1000)}`,
  branch_id: "7700",
  customer_name: "נועם בדיקה",
  customer_phone: "052-5550147",
  questions: [
    {
      id: "q_cleanliness",
      text: "דרג את ניקיון הסניף וסדר התצוגה",
      required: true,
    },
    {
      id: "q_staff",
      text: "דרג את אדיבות הצוות והמקצועיות",
      required: true,
    },
    {
      id: "q_wait",
      text: "דרג את זמן ההמתנה לשירות",
      required: true,
    },
    {
      id: "q_value",
      text: "דרג את יחס המחיר לתמורה",
      required: true,
    },
    {
      id: "q_recommend",
      text: "באיזו מידה תמליץ/י עלינו לחבר/ה?",
      required: true,
    },
  ],
  metadata: {
    source: "create-fictive-demo-survey.mjs",
    demo: true,
    store_label: "עירון ריהוט — סניף דמו",
  },
};

function randomRating() {
  return Math.floor(Math.random() * 5) + 1;
}

function buildAnswers() {
  return {
    q_cleanliness: randomRating(),
    q_staff: randomRating(),
    q_wait: randomRating(),
    q_value: randomRating(),
    q_recommend: randomRating(),
  };
}

async function postJson(url, body, headers = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = null;
  }
  return { res, text, json };
}

async function main() {
  if (!key) {
    console.error(
      "Missing DOCUMENTS_API_KEY. Add it to .env.local (e.g. vercel env pull .env.local) and rerun."
    );
    process.exit(1);
  }

  const { res, text, json } = await postJson(
    `${base}/api/documents`,
    payload,
    { Authorization: `Bearer ${key}` }
  );

  if (!res.ok || !json || json.status !== "success") {
    console.error("Create failed:", res.status, json ?? text.slice(0, 800));
    process.exit(1);
  }

  const link = json?.data?.link;
  const id = json?.data?.data?.id;

  console.log("");
  console.log("Created fictive survey document.");
  console.log("id:  ", id);
  console.log("open:", link);
  console.log("");

  if (!id || seedCount === 0) return;

  console.log(`Seeding ${seedCount} synthetic responses (public /api/survey-submit)…`);

  let ok = 0;
  for (let i = 0; i < seedCount; i++) {
    const r = await postJson(`${base}/api/survey-submit`, {
      documentId: id,
      answers: buildAnswers(),
    });
    if (r.res.ok && r.json?.success) ok++;
    else
      console.warn(
        "  submit",
        i + 1,
        "failed:",
        r.res.status,
        r.json?.message ?? r.text.slice(0, 200)
      );
  }
  console.log(`Done. Successful submits: ${ok}/${seedCount}.`);
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

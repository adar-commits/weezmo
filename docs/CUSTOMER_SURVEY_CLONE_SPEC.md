# BUILD SPEC: Customer Satisfaction Survey System (clone of Weezmo `customer_survey`)

You are building a complete customer satisfaction survey product for a Hebrew RTL rug/home retail brand ("השטיח האדום" / HōM GROUP). Replicate the full end-to-end flow: API creates a unique survey link → customer fills Likert survey on mobile → response persisted in Postgres → optional outbound webhook → admin dashboard with KPIs, filters, tables, CSV export, webhook retry.

**Production reference app:** https://weezmo.vercel.app  
**Live survey example:** https://weezmo.vercel.app/documents/7ce5806f-8e08-4416-81c3-d5abb0b1229f  
**Static UI preview (no DB):** https://weezmo.vercel.app/sample-survey

---

## 1. GOAL & SUMMARY

**Goal:** After a purchase or service interaction, send the customer a unique link (SMS/email/automation). They rate 4 mandatory questions on a 1–5 emoji Likert scale. Results are stored for analytics and optionally forwarded to Make/Zapier/Shopify automation via webhook using `order_id` as the join key.

**What to build:**

1. **Survey creation API** (server-authenticated) → inserts document row → returns public URL
2. **Public survey page** at `/documents/{uuid}` (RTL Hebrew, mobile-first)
3. **Survey submit API** (public, UUID is the secret) → validates → inserts response → fires webhook
4. **Admin dashboard** at `/admin/surveys` (authenticated + email allowlist) with KPIs, branch/question breakdowns, searchable/sortable responses table, CSV export, webhook retry
5. **Postgres schema + RPC aggregations** (Supabase-compatible)

**What does NOT exist:** No cron jobs, no scheduled tasks, no background workers. Webhooks fire synchronously on submit. Admin retry is manual via button/API.

---

## 2. END-TO-END FLOW

```
[External system: Shopify/Make/POS]
    │ POST /api/documents  (Bearer API key)
    │ body: customer_survey payload + order_id, branch_id, customer_*
    ▼
[DB: documents row]  template_id = "customer_survey"
    │ returns link: {APP_URL}/documents/{uuid}
    ▼
[Customer opens link in browser]
    │ fills 4 Likert questions (emoji 1–5)
    │ POST /api/survey-submit  { documentId, answers }
    ▼
[DB: survey_responses row]  (always inserted first)
    │ if SURVEY_SUBMIT_WEBHOOK_URL set → POST JSON webhook
    ▼
[Automation receives order_id + answers + avg_score]
    │
[Admin opens /admin/surveys]
    │ reads survey_responses + RPC aggregates
    │ export CSV, retry failed webhooks
```

---

## 3. CONTENT & COPY (Hebrew — use exactly unless overridden in payload)

### Default survey content

| Field | Default value |
|-------|---------------|
| **title** | `סקר שביעות רצון` |
| **subtitle** | `נשמח לדעת איך נוכל להשתפר, דעתך חשובה לנו ❤️` |

### Default 4 questions (all `required: true`)

| id | text |
|----|------|
| `q_service` | `דרג את שביעות רצונך מהשירות שקיבלת` |
| `q_rep` | `דרג את שביעות רצונך מאדיבות ומקצועיות הנציג` |
| `q_speed` | `דרג את שביעות רצונך ממהירות התגובה` |
| `q_solution` | `דרג באיזו מידה הפתרון שקיבלת היה ברור, יעיל ומספק` |

### Likert scale (visual order LTR: best on left)

| Value | Emoji | Hebrew label (screen reader) |
|-------|-------|------------------------------|
| 5 | 😍 | מצוין |
| 4 | 😊 | טוב |
| 3 | 😐 | בינוני |
| 2 | 😕 | לא טוב |
| 1 | 😢 | גרוע |

### UI strings

| Context | Text |
|---------|------|
| Submit button | `שליחה` |
| Submitting | `שולחים…` |
| Validation error | `נא לדרג את כל השאלות המסומנות בכוכבית` |
| Network error | `שגיאת רשת, נסו שוב` |
| Generic submit fail | `שליחה נכשלה` |
| Success title | `תודה רבה!` |
| Success body | `קיבלנו את תשובותיכם — תודה על הזמן שנתתם.` |
| Preview mode banner | `תצוגת עיצוב מקומית — להפצה באמת יוצרים מסמך דרך POST /api/documents ומקבלים קישור ייחודי.` |

Page: **RTL**, `lang="he"`, `dir="rtl"` on shell (Likert row uses `dir="ltr"` for emoji order).

---

## 4. MEDIA URLs (Shopify CDN — use as defaults)

**Shopify files base:** `https://cdn.shopify.com/s/files/1/0594/9839/7887/files`

| Asset | URL | Usage |
|-------|-----|-------|
| **Logo** (default) | `https://cdn.shopify.com/s/files/1/0594/9839/7887/files/img.png?v=1772750312` | Header `<img>`; override via payload `logoUrl` |
| **Survey full-page background** | `https://cdn.shopify.com/s/files/1/0594/9839/7887/files/banner1_jpg.jpg?v=1772750312&width=1080&height=2200&crop=entropy` | Fixed/drifting ambient backdrop behind frosted panel |
| **Banner source (uncropped)** | `https://cdn.shopify.com/s/files/1/0594/9839/7887/files/banner1_jpg.jpg?v=1772750312` | Same image file, no crop params |

**Non-image UI:** Success checkmark = inline SVG. Confetti = CSS divs (colors `#b30103`, `#ffffff`, `#ff6b6b`, `#ffd4d4`). Emojis = Unicode, not images.

**Font:** Google Fonts `Open Sans Hebrew` (400–800).

```css
@import url("https://fonts.googleapis.com/css2?family=Open+Sans+Hebrew:wght@400;500;600;700;800&display=swap");
```

---

## 5. DESIGN TOKENS & SURVEY UI BEHAVIOR

### CSS variables (document theme)

```css
--doc-red: #b30103;
--doc-red-dark: #8f0102;
--doc-ink: #1a1a1a;
--doc-muted: #555;
--doc-border: #e4e1dc;
--doc-font: "Open Sans Hebrew", "Arial Hebrew", Arial, sans-serif;
```

### Survey page layout

- **Outer page** (`.doc-page--survey`): dark base `#1a1816`, full viewport
- **Ambient background layer**: cover image from CDN, `brightness(0.92) saturate(1.06)`, slow drift animation (52s scale/translate) unless `prefers-reduced-motion: reduce`
- **Dark gradient overlay** on ambient layer (top→bottom rgba darkening)
- **Content panel** (`.doc-body--survey`): max-width `min(32rem, 100%)`, centered, frosted white `rgba(255,252,250,0.93)`, `backdrop-filter: blur(12px)`, safe-area padding
- **Question cards**: white, rounded 14px, border, subtle shadow
- **Selected emoji**: scale up, full color, red ring `rgba(179,1,3,0.35)`
- **Submit button**: red gradient `#c41418 → #b30103 → #8f0102`, pulse shadow animation
- **Success state**: animated SVG checkmark + confetti burst (18 pieces, 2.2s)

### Interactions

- Client validates all `required` questions answered before submit
- `previewMode`: submit shows success locally only (no API call) — for `/sample-survey`
- **No duplicate-submit prevention** in DB (same document can receive multiple responses unless you add a unique constraint later)

---

## 6. DATABASE SCHEMA (Postgres / Supabase)

### Table: `documents` (existing; extend for surveys)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | auto-generated |
| `type` | text | Surveys stored as `"receipt"` (legacy quirk) |
| `template_id` | text NOT NULL default `'receipt'` | **`'customer_survey'`** for surveys |
| `payload` | jsonb | Full survey payload (see §7) |
| `branch_id` | text nullable | Denormalized from create payload |
| `customer_name` | text nullable | Denormalized |
| `customer_phone` | text nullable | Denormalized |
| `created_at` | timestamptz | optional but used for completion-rate KPI |

**Indexes:** `template_id`, `branch_id`, `created_at`

**RLS:** Public read by `id` only (for rendering survey page). No anon write. All writes via service role.

**Minimal migration (if `template_id` missing):**

```sql
alter table documents add column if not exists template_id text not null default 'receipt';
create index if not exists documents_template_id_idx on documents (template_id);
```

### Table: `survey_responses` (one row per submit)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | response id |
| `document_id` | uuid FK → documents(id) ON DELETE CASCADE | |
| `submitted_at` | timestamptz NOT NULL default now() | |
| `answers` | jsonb NOT NULL | `{ "q_service": 5, "q_rep": 4, ... }` integers 1–5 |
| `avg_score` | numeric(4,2) NOT NULL | mean of numeric answers, rounded 2 decimals |
| `order_id` | text nullable | external correlation (Shopify order) |
| `branch_id` | text nullable | |
| `customer_name` | text nullable | |
| `customer_phone` | text nullable | |
| `webhook_status` | text NOT NULL default `'pending'` | `pending` \| `ok` \| `failed` \| `skipped` |
| `webhook_error` | text nullable | truncated HTTP error |
| `created_at` | timestamptz NOT NULL default now() | |

**Indexes:** `submitted_at DESC`, `branch_id`, `avg_score`, `order_id`, `customer_phone`, `document_id`, GIN trigram on `customer_name` (requires `pg_trgm` extension)

**RLS enabled, no public policies** — service role only.

**Full migration file in Weezmo repo:** `supabase/migrations/20260422000000_survey_backoffice.sql`

Run via Supabase SQL editor, `npm run db:migrate` (with `DATABASE_URL`), or `npx supabase db push`.

### Postgres RPC functions (for dashboard)

All accept: `p_from`, `p_to` (timestamptz), `p_score_min`, `p_score_max` (1–5), `p_branch_id` (text or null), `p_search` (text or null — ILIKE on name/phone/order_id)

1. **`survey_stats_pack`** → jsonb:
   - `response_count`, `avg_score`, `five_star_pct`, `docs_issued`
   - `five_star_pct` = % of responses where `avg_score >= 4.99`
   - `docs_issued` = count of `documents` where `template_id = 'customer_survey'` and `created_at` in window

2. **`survey_agg_by_branch`** → rows: `branch_id`, `response_count`, `avg_score`, `pct_five_star`, `last_submitted`

3. **`survey_agg_by_question`** → rows: `question_id`, `avg_rating`, `cnt_1`…`cnt_5`, `response_count` (unpivot `answers` jsonb)

4. **`survey_daily_submissions`** → rows: `day` (date), `cnt` (for sparkline chart)

---

## 7. DATA MODELS & VALIDATION

### Template ID constant

```ts
template_id: "customer_survey"
```

### TypeScript interfaces

```ts
interface CustomerSurveyQuestion {
  id: string;      // min 1 char
  text: string;    // min 1 char
  required: boolean;
}

interface CustomerSurveyPayload {
  template_id: "customer_survey";  // REQUIRED discriminator
  title: string;                   // REQUIRED
  subtitle?: string;
  logoUrl?: string;                // valid URL
  order_id?: string;               // max 256 — Shopify order id/name for webhook join
  branch_id?: string;              // max 120
  customer_name?: string;          // max 200
  customer_phone?: string;         // max 40
  questions: CustomerSurveyQuestion[];  // min 1, max 20
  metadata?: Record<string, unknown>;
}
```

### JSON Schema

See `docs/schemas/customer-survey-payload.json` in Weezmo repo.

### Denormalization resolution (on submit & webhook)

Priority for identity fields:

1. `documents` row columns (`branch_id`, `customer_name`, `customer_phone`)
2. Else payload top-level fields
3. For `order_id`: payload `order_id` OR `metadata.order_id` OR `metadata.orderId`
4. For `branch_id` fallback: `metadata.branch_id` OR `metadata.branchId`

### Average score algorithm

```ts
function computeSurveyAverageScore(answers: Record<string, unknown>): number {
  const vals = Object.values(answers).filter(
    (v) => typeof v === "number" && v >= 1 && v <= 5
  );
  if (vals.length === 0) return 0;
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
}
```

---

## 8. API SPECIFICATION

### 8.1 Create survey document

**`POST /api/documents`**

**Auth:** `Authorization: Bearer {DOCUMENTS_API_KEY}` OR header `x-api-key: {DOCUMENTS_API_KEY}`

**Body:** full `CustomerSurveyPayload`

**Success 200:**

```json
{
  "status": "success",
  "data": {
    "data": { "...payload fields...", "id": "<uuid>" },
    "link": "https://{APP_URL}/documents/<uuid>"
  }
}
```

**Errors:** `401` bad key, `400` validation, `500` DB error

**Server side on insert:**

- Set `template_id = "customer_survey"`
- Set `type = "receipt"` (legacy)
- Copy `branch_id`, `customer_name`, `customer_phone` to document columns
- Store full payload in `payload` jsonb
- Build link using env `NEXT_PUBLIC_APP_URL` (never use preview deployment URLs in prod)

**Example create body:**

```json
{
  "template_id": "customer_survey",
  "title": "סקר שביעות רצון",
  "subtitle": "נשמח לדעת איך נוכל להשתפר, דעתך חשובה לנו ❤️",
  "order_id": "shopify-order-5678901234",
  "branch_id": "3000",
  "customer_name": "תמר שני",
  "customer_phone": "0501234567",
  "questions": [
    { "id": "q_service", "text": "דרג את שביעות רצונך מהשירות שקיבלת", "required": true },
    { "id": "q_rep", "text": "דרג את שביעות רצונך מאדיבות ומקצועיות הנציג", "required": true },
    { "id": "q_speed", "text": "דרג את שביעות רצונך ממהירות התגובה", "required": true },
    { "id": "q_solution", "text": "דרג באיזו מידה הפתרון שקיבלת היה ברור, יעיל ומספק", "required": true }
  ],
  "metadata": { "channel": "sms_post_purchase" }
}
```

**curl:**

```bash
curl -sS -X POST "https://{APP_URL}/api/documents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOCUMENTS_API_KEY" \
  -d @docs/example-customer-survey-payload.json
```

**Local script (Weezmo):**

```bash
node --env-file=.env.local scripts/create-sample-survey.mjs
```

---

### 8.2 Render survey page

**`GET /documents/{id}`** — no auth

1. Load document by UUID
2. If `template_id === "customer_survey"` → render survey UI with `payload`
3. Else 404 or render other template
4. Logo: `payload.logoUrl ?? DEFAULT_LOGO_URL`
5. Subtitle: `payload.subtitle ?? DEFAULT_SUBTITLE`

**Also build:** `GET /sample-survey` — static demo with `previewMode=true`, fake document id, no DB

**PDF:** `GET /documents/{id}/pdf` returns **404 for surveys** (receipts only)

---

### 8.3 Submit survey response

**`POST /api/survey-submit`** — **no API key** (UUID secrecy model)

**Body:**

```json
{
  "documentId": "<uuid>",
  "answers": {
    "q_service": 5,
    "q_rep": 4,
    "q_speed": 5,
    "q_solution": 3
  }
}
```

**Validation:**

- `documentId` required
- Document must exist and be `customer_survey`
- Every `required` question must have integer rating 1–5

**Processing order (critical):**

1. INSERT `survey_responses` with `webhook_status: "pending"`
2. If `SURVEY_SUBMIT_WEBHOOK_URL` unset → UPDATE status `skipped`, return **200** `{ "success": true, "responseId", "webhookStatus": "skipped" }`
3. If webhook URL set → POST JSON (see §9)
4. Webhook success → UPDATE `webhook_status: "ok"`, return **200** `{ "success": true, "responseId", "webhookStatus": "ok" }`
5. Webhook HTTP failure → UPDATE `failed` + error text, return **502** `{ "success": false, "responseId", "webhookStatus": "failed" }` — **response row is NOT rolled back**

**Errors:** `400` invalid/missing answers, `404` unknown document, `500` insert failure

---

### 8.4 Admin: CSV export

**`GET /api/admin/surveys/export?{same query params as dashboard}`**

**Auth:** Supabase session cookie + email in `ADMIN_EMAIL_ALLOWLIST`

**Response:** CSV UTF-8 BOM, filename `survey-responses.csv`, max 5000 rows

**Columns:** `id`, `document_id`, `submitted_at`, `avg_score`, `order_id`, `branch_id`, `customer_name`, `customer_phone`, `webhook_status`, `answers_json`

---

### 8.5 Admin: Retry webhook

**`POST /api/admin/surveys/retry-webhook`**

**Auth:** admin session

**Body:**

```json
{ "responseId": "<uuid>" }
```

**Requires:** `SURVEY_SUBMIT_WEBHOOK_URL` configured

Re-builds same webhook payload from stored response + document, POSTs again, updates `webhook_status`.

---

## 9. WEBHOOK (outbound — NOT inbound cron)

**Env:** `SURVEY_SUBMIT_WEBHOOK_URL` (e.g. Make.com scenario URL)

**Trigger:** Synchronously on each successful `survey_responses` insert

**Method:** POST `Content-Type: application/json`

**Payload shape:**

```json
{
  "templateId": "customer_survey",
  "documentId": "<uuid>",
  "responseId": "<uuid>",
  "submittedAt": "2026-04-21T12:00:00.000Z",
  "order_id": "shopify-order-5678901234",
  "branch_id": "3000",
  "customer_name": "תמר שני",
  "customer_phone": "0501234567",
  "avg_score": 4.25,
  "answers": {
    "q_service": 5,
    "q_rep": 4,
    "q_speed": 5,
    "q_solution": 3
  },
  "metadata": {},
  "surveyTitle": "סקר שביעות רצון"
}
```

**No auth headers** in v1 — URL secrecy only.

**Status values in DB:** `pending` → `ok` | `failed` | `skipped`

---

## 10. ADMIN DASHBOARD (`/admin/surveys`)

### Auth

- Supabase Auth (email/password + optional Google OAuth)
- After login, check `ADMIN_EMAIL_ALLOWLIST` (comma-separated lowercase emails; `*` = allow all in dev only)
- Middleware protects `/admin/*` routes
- Admin APIs use session cookie (`credentials: "include"`)
- Redirect URL must include `https://<domain>/admin/auth/callback` (and localhost for dev)

**Create admin user (Weezmo):**

```bash
node --env-file=.env.local scripts/create-supabase-auth-user.mjs "you@example.com" "your-secure-password"
```

### Dashboard URL query params

| Param | Values | Default |
|-------|--------|---------|
| `period` | `yesterday`, `today`, `week`, `month`, `year`, `custom` | `week` |
| `from`, `to` | `yyyy-MM-dd` | required when `period=custom` |
| `q` | free text | searches name, phone, order_id (ILIKE) |
| `branch_id` | branch code or omit | |
| `score_min`, `score_max` | 1–5 | 1 and 5 |
| `page` | int | 1 |
| `sort` | `submitted_at`, `avg_score`, `customer_name`, `customer_phone`, `order_id`, `branch_id` | `submitted_at` |
| `dir` | `asc`, `desc` | `desc` |

**Previous-period comparison:** For any window `[from, to]`, previous window = same duration immediately before `from`.

**Page size:** 50 responses per page.

### KPI cards (Hebrew labels)

1. **סה״כ תגובות** — count + % delta vs previous period + daily sparkline area chart
2. **ציון ממוצע** — avg_score /5 + delta
3. **שיעור 5 כוכבים** — % where avg_score >= 4.99 + delta
4. **שיעור השלמה** — `responses / docs_issued` in period + delta
5. **סניף מוביל** — branch with highest response_count (label "ללא סניף" if empty)
6. **השאלה עם הדירוג הנמוך ביותר** — question_id with lowest avg_rating

### Period tabs (Hebrew)

| id | label |
|----|-------|
| `yesterday` | אתמול |
| `today` | היום |
| `week` | השבוע |
| `month` | החודש |
| `year` | השנה |
| `custom` | מותאם |

Custom range: date pickers + **החל** button; params `from=yyyy-MM-dd&to=yyyy-MM-dd&period=custom`.

### Dashboard sections

- **Control bar:** search box, branch dropdown, score min/max filters, CSV export link
- **Branch breakdown table:** per-branch counts, avg, % five-star, last submission
- **Question breakdown table:** per question_id avg + distribution cnt_1…cnt_5
- **Responses table ("תגובות אחרונות"):** sortable columns — תאריך, לקוח, טלפון, הזמנה, סניף, ממוצע, Webhook status badge (`ok` / `failed` / `skipped` / `pending`)
- **Row detail sheet:** full answers JSON, link to public document, retry webhook button if failed/skipped
- **Pagination:** prev/next with page numbers

### Optional: documents admin page

**`/admin/documents?template=customer_survey`** — list all issued survey documents with columns: תאריך, תבנית, סניף, id, **פתח מסמך** (opens public viewer). Page size 40.

---

## 11. ENVIRONMENT VARIABLES

| Variable | Required | Purpose |
|----------|----------|---------|
| `DOCUMENTS_API_KEY` | Yes | Auth for POST /api/documents |
| `NEXT_PUBLIC_APP_URL` | Yes | Base URL in returned links (e.g. `https://weezmo.vercel.app`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Postgres/API |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server writes (documents, responses, RPC) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Admin auth client |
| `ADMIN_EMAIL_ALLOWLIST` | Yes | Comma-separated admin emails |
| `SURVEY_SUBMIT_WEBHOOK_URL` | Optional | Outbound webhook on submit |

---

## 12. INTEGRATION PATTERN (external app / Shopify / Make)

Typical automation:

1. **Order fulfilled / ticket closed** → Make/Zapier/custom backend calls `POST /api/documents` with `order_id`, customer phone/name, `branch_id`
2. Receive `link` in response
3. Send SMS/WhatsApp with link
4. Customer submits → app stores response + fires webhook back to Make
5. Make uses `order_id` to tag Shopify order / notify Slack / update CRM
6. **Separate analytics app** connects to same Supabase (read-only service role or replica) and implements §10 dashboard OR calls admin APIs

### Dashboard-only variant

If the other app shares the **same Supabase project** as Weezmo:

- Skip building §5 (public survey UI) and §8.1–8.3
- Implement §6, §10, §8.4, §8.5 against existing `documents` and `survey_responses` tables
- Point `NEXT_PUBLIC_SUPABASE_*` at the shared project

---

## 13. SECURITY NOTES

- Survey link security = unguessable UUID (no sequential ids)
- Submit endpoint is public — do not expose admin data
- Create endpoint requires API key — never expose to browser
- Admin routes require auth + allowlist
- Service role key server-only
- Survey PDF download intentionally disabled (404)

---

## 14. ACCEPTANCE CRITERIA

- [ ] Create survey via API → get working Hebrew RTL link
- [ ] Mobile survey: 4 emoji questions, validation, success animation
- [ ] Submit persists row with correct avg_score and denormalized fields
- [ ] Webhook fires with order_id when configured; skipped gracefully when not
- [ ] Admin dashboard shows KPIs, filters, branch/question tables, paginated responses
- [ ] CSV export works with Hebrew UTF-8
- [ ] Webhook retry works for failed rows
- [ ] `/sample-survey` works without DB for design QA
- [ ] Uses exact Shopify CDN logo + background URLs unless payload overrides logo

---

## 15. REFERENCE IMPLEMENTATION FILES (Weezmo repo)

| Area | Path |
|------|------|
| Types & defaults | `src/types/customer-survey.ts` |
| Survey UI | `src/app/documents/[id]/CustomerSurveyView.tsx` |
| Survey CSS | `src/app/documents/[id]/survey-page.css` |
| Page shell / background | `src/components/DocumentPageShell.tsx` |
| CDN URLs | `src/config/document-branding.ts` |
| Document route | `src/app/documents/[id]/page.tsx` |
| Sample preview | `src/app/sample-survey/page.tsx` |
| Create API | `src/app/api/documents/route.ts` |
| Submit API | `src/app/api/survey-submit/route.ts` |
| Webhook builder | `src/lib/survey-webhook-payload.ts` |
| Webhook HTTP helper | `src/lib/webhook-forward.ts` |
| Scoring | `src/lib/survey-score.ts` |
| Denormalization | `src/lib/survey-denorm.ts` |
| Payload validation | `src/lib/templates/schemas.ts` |
| Template registry | `src/lib/templates/registry.ts` |
| Admin page | `src/app/admin/(dashboard)/surveys/page.tsx` |
| Admin queries | `src/app/admin/surveys/queries.ts` |
| Admin filters | `src/app/admin/surveys/filters.ts` |
| Admin components | `src/app/admin/surveys/_components/*` |
| CSV export API | `src/app/api/admin/surveys/export/route.ts` |
| Retry webhook API | `src/app/api/admin/surveys/retry-webhook/route.ts` |
| DB migration | `supabase/migrations/20260422000000_survey_backoffice.sql` |
| JSON Schema | `docs/schemas/customer-survey-payload.json` |
| Example payload | `docs/example-customer-survey-payload.json` |
| Create sample script | `scripts/create-sample-survey.mjs` |

---

## 16. QUICK LINKS

| Resource | URL |
|----------|-----|
| Production app | https://weezmo.vercel.app |
| Live survey | https://weezmo.vercel.app/documents/7ce5806f-8e08-4416-81c3-d5abb0b1229f |
| Design preview | https://weezmo.vercel.app/sample-survey |
| Admin dashboard | https://weezmo.vercel.app/admin/surveys |
| Logo CDN | https://cdn.shopify.com/s/files/1/0594/9839/7887/files/img.png?v=1772750312 |
| Background CDN | https://cdn.shopify.com/s/files/1/0594/9839/7887/files/banner1_jpg.jpg?v=1772750312&width=1080&height=2200&crop=entropy |

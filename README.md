This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

- **Production:** [weezmo.vercel.app](https://weezmo.vercel.app)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Digital Documents API

Create a digital document (receipt/invoice or customer survey) and get a public URL. Documents are stored in Supabase and viewable at `https://weezmo.vercel.app/documents/{id}`. The URL uses a UUID so it is not guessable.

**Important:** Set `NEXT_PUBLIC_APP_URL=https://weezmo.vercel.app` in Vercel (and in production) so the API always returns document links with your production domain, not preview deployment URLs.

### Supabase migration (templates)

Run once in the Supabase SQL editor (adds `template_id` for multi-template rows):

```sql
alter table documents add column if not exists template_id text not null default 'receipt';
create index if not exists documents_template_id_idx on documents (template_id);
```

Without this column, inserts that set `template_id` will fail until the migration is applied.

### Create document

**`POST /api/documents`**

- **Auth:** `Authorization: Bearer <DOCUMENTS_API_KEY>` or header `x-api-key: <DOCUMENTS_API_KEY>`.

#### Receipt / invoice (default)

- **Body (JSON):** Either omit `template_id` or set `"template_id": "receipt"`. Required: `Items` (array). Recommended: `InvoiceNumber`, `BranchID`, `BranchName`, `PrintDate`, `SalesRepresentative`, `CustomerName`, `TotalPrice`, `type` (e.g. "חשבונית מס"), `paymentType`, `VAT`, `discount`, `CustomerPhone`, `CustomerEmail`, `coupons`, `BranchFeedbackUrl`.

Example:

```json
{
  "InvoiceNumber": "IN264004805",
  "BranchID": "3000",
  "BranchName": "סגולה",
  "PrintDate": "03/03/2026 11:35",
  "SalesRepresentative": "מוכרן אתר אנטרנט",
  "CustomerName": "תמר שני",
  "Items": [
    { "ItemQTY": 1, "ItemSKU": "20903008-240340", "ItemPrice": 3952.8, "ItemDescription": "נירוונה 12 גרז 340*240 NIRVANA" }
  ],
  "TotalPrice": 5288,
  "type": "חשבונית מס",
  "paymentType": "כרטיס אשראי",
  "discount": -0.01,
  "VAT": 951.84,
  "BranchFeedbackUrl": "https://example.com/feedback"
}
```

- **Response (success):** `{ "status": "success", "data": { "data": { ...payload, "id": "<uuid>" }, "link": "https://weezmo.vercel.app/documents/<uuid>" } }`
- **Errors:** `401` missing/invalid API key, `400` invalid body.

#### Customer survey template

- **Body (JSON):** `"template_id": "customer_survey"` (required). Also required: `title`, `questions` (array of `{ id, text, required }`). Optional: `subtitle`, `logoUrl`, `metadata`.
- **JSON Schema:** [docs/schemas/customer-survey-payload.json](docs/schemas/customer-survey-payload.json)
- **Example file:** [docs/example-customer-survey-payload.json](docs/example-customer-survey-payload.json)

Full HTTP example (same auth headers as receipts):

```bash
curl -sS -X POST "https://weezmo.vercel.app/api/documents" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DOCUMENTS_API_KEY" \
  -d @docs/example-customer-survey-payload.json
```

### Document URLs

- **View — receipt:** `GET https://weezmo.vercel.app/documents/{id}` — RTL Hebrew layout, items table, VAT/total, thank-you, newsletter form, footer with social links, care tips.
- **View — customer survey:** same path; renders the Likert survey when the row's `template_id` is `customer_survey`.
- **Download PDF:** `GET https://weezmo.vercel.app/documents/{id}/pdf` — PDF for receipt/invoice payloads only; survey documents return `404`.

### Survey submit webhook

When a user submits the survey, the browser **POST**s to **`/api/survey-submit`** (no API key; the document id is the secret). The server forwards a JSON payload to **`SURVEY_SUBMIT_WEBHOOK_URL`** (plain JSON in v1, no signature). If the env var is unset, submit returns `503`.

Shape sent to your webhook:

```json
{
  "templateId": "customer_survey",
  "documentId": "<uuid>",
  "submittedAt": "2026-04-21T12:00:00.000Z",
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

### Newsletter webhook

When a user submits the newsletter form on a document page, the app sends a **POST** request to `NEWSLETTER_WEBHOOK_URL` with:

```json
{
  "email": "user@example.com",
  "consentPrivacy": true,
  "documentId": "<document-uuid>",
  "branchName": "סגולה"
}
```

Set `NEWSLETTER_WEBHOOK_URL` in the environment to enable this; otherwise the form returns 503.

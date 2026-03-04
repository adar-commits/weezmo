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

Create a digital document (receipt/invoice) and get a public URL. Documents are stored in Supabase and viewable at `https://weezmo.vercel.app/documents/{id}`. The URL uses a UUID so it is not guessable.

**Important:** Set `NEXT_PUBLIC_APP_URL=https://weezmo.vercel.app` in Vercel (and in production) so the API always returns document links with your production domain, not preview deployment URLs.

### Create document

**`POST /api/documents`**

- **Auth:** `Authorization: Bearer <DOCUMENTS_API_KEY>` or header `x-api-key: <DOCUMENTS_API_KEY>`.
- **Body (JSON):** Order payload. Required: `Items` (array). Recommended: `InvoiceNumber`, `BranchID`, `BranchName`, `PrintDate`, `SalesRepresentative`, `CustomerName`, `TotalPrice`, `type` (e.g. "חשבונית מס"), `paymentType`, `VAT`, `discount`, `CustomerPhone`, `CustomerEmail`, `coupons`, `BranchFeedbackUrl`.

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

### Document URLs

- **View:** `GET https://weezmo.vercel.app/documents/{id}` — RTL Hebrew layout, items table, VAT/total, thank-you, newsletter form, footer with social links, care tips.
- **Download PDF:** `GET https://weezmo.vercel.app/documents/{id}/pdf` — PDF with only fields present in the create payload (business name, branch, date, customer, items table, total, VAT).

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

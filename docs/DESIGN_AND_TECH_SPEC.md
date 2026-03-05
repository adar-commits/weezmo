# Weezmo Receipt — Design & Tech Specification

> **Version:** 1.0  
> **Date:** 2026-03-05  
> **Scope:** Receipt page (`/documents/[id]`) only  

---

## 1. Purpose and Audience

| Key | Detail |
|---|---|
| **Purpose** | Specify the current digital receipt experience and its technical context so a design AI can propose UX / visual improvements; then serve as the single source of truth for implementation. |
| **Primary audience** | Design-specialist AI (will propose improvements). |
| **Secondary audience** | Implementation AI and human developers (will execute changes). |
| **Scope** | Receipt page only — the view at `/documents/[id]`. Home page and PDF export are out of scope for this design pass unless explicitly noted. |

---

## 2. Product and Flow Context

### What is Weezmo?

Weezmo is a digital document hub. Its primary flow:

1. A POS / back-office system creates a receipt via `POST /api/documents` with a JSON payload (items, totals, branch info, etc.).
2. The API returns a public link, e.g. `https://weezmo.vercel.app/documents/{uuid}`.
3. The link is sent to the customer (typically via SMS).
4. The customer opens the link in a mobile browser and sees a single long receipt page (RTL, Hebrew). **No login is required; the page is public and read-only by ID.**

### Brands

The receipt serves two brands under the HōM GROUP umbrella:

- **השטיח האדום** (The Red Carpet) — carpets, rugs, home textiles.
- **פוזיטיב** (Pozitive) — bean bags and casual furniture.

### Success Criteria

- Receipt is **readable and trustworthy** on mobile (the dominant device).
- Key actions — **download PDF**, **branch feedback**, **newsletter signup** — are clear, discoverable, and thumb-friendly.
- The page feels **on-brand** and professional.

---

## 3. Technical Constraints (Do Not Change)

| Constraint | Detail |
|---|---|
| **Stack** | Next.js 16 (App Router), React 19.2, Tailwind CSS 4. No other UI framework. |
| **RTL** | The page wrapper renders `dir="rtl"`; all layout and text are RTL / Hebrew. Design must respect RTL (alignment, icon mirroring, spacing). |
| **Data flow** | Receipt content is fetched server-side in `src/app/documents/[id]/page.tsx` from Supabase, then passed as props to `<DocumentView>`. No client-side auth or routing changes. |
| **Section order** | Existing sections and their order **must be kept** (see Section 5). Design can change look and feel but must **not remove or reorder** sections. |
| **Links** | External URLs (feedback, care guide, privacy, social) are defined in `src/config/links.ts`. URLs must remain unchanged; labels and styling can change. |
| **Assets** | Logo and banner currently use external URLs (`receipts.carpetshop.co.il`); avatar and social icons reference local files under `public/images/`. Design can specify different assets; implementation will place them under `public/` and reference by path. Note: `public/images/` directory does not currently contain the social SVGs — they need to be created or sourced. |

---

## 4. Tech Summary for Implementers

### File Map

| File | Role |
|---|---|
| `src/app/documents/[id]/page.tsx` | Server component. Fetches document by ID from Supabase, sets `dir="rtl"`, renders `<DocumentView>`. Also exports `generateMetadata`. |
| `src/components/DocumentView.tsx` | Main receipt UI. One component, all sections. Tailwind-only styling (inline classes). Renders static + dynamic content. |
| `src/components/NewsletterForm.tsx` | Client component (`"use client"`). Email input + consent checkbox + submit button. Posts to `POST /api/newsletter`. States: idle, loading, success, error. |
| `src/components/ReceiptPdfDocument.tsx` | `@react-pdf/renderer` layout for PDF export. **Out of scope** for this design pass; can note "align PDF with web later". |
| `src/app/documents/document.css` | CSS custom properties and class-based styles for an alternative "production parity" design. Defines `--doc-red: #a61a21`, `--doc-green: #059669`, `--doc-grey-bg: #2a2a2a`, etc. Currently **not imported** by `DocumentView.tsx` (which uses Tailwind inline classes exclusively). |
| `src/config/links.ts` | All external brand URLs (social, care guide, privacy policy). Exported as `BRAND_LINKS`. |
| `src/config/assets.ts` | Local asset path constants (`DOCUMENT_ASSETS`). Currently defines `/images/logo.svg`, `/images/banner.svg`, `/images/avatar.svg`. Note: `DocumentView.tsx` does not currently import this; it has its own inline `ASSETS` object with external URLs. |
| `src/types/document.ts` | TypeScript types: `DocumentItem`, `CreateDocumentPayload`, `payloadTypeToDbType()`. |
| `src/app/globals.css` | Tailwind import, CSS variables for `--background`/`--foreground`, body font `Arial, Helvetica, sans-serif`. |
| `src/app/layout.tsx` | Root layout. Loads Geist + Geist_Mono via `next/font/google`. Sets CSS variables `--font-geist-sans`, `--font-geist-mono`. |

### Fonts

- **Root layout** loads `Geist` (sans) and `Geist_Mono` via CSS variables.
- **`globals.css`** overrides body `font-family` to `Arial, Helvetica, sans-serif`.
- **Document page** uses `font-sans` class (inherits Geist / Arial stack).
- **No dedicated Hebrew-optimized font** is loaded. Design may specify one (e.g. Heebo, Assistant, Rubik) and where it applies.

### Dependencies

```json
{
  "next": "16.1.6",
  "react": "19.2.3",
  "@react-pdf/renderer": "^4.3.2",
  "@supabase/supabase-js": "^2.98.0",
  "tailwindcss": "^4"
}
```

### API Routes (context only — not in scope for design)

| Route | Method | Purpose |
|---|---|---|
| `/api/documents` | POST | Creates a document in Supabase. Requires `Bearer` / `x-api-key` auth. Returns `{ link }`. |
| `/api/newsletter` | POST | Forwards email + consent to an external webhook (`NEWSLETTER_WEBHOOK_URL` env var). |
| `/documents/[id]/pdf` | GET | Streams the PDF version of the receipt (via `@react-pdf/renderer`). |

---

## 5. Current Experience — Section by Section

Below is every section in `DocumentView.tsx` **in render order**. For each: purpose, content type (dynamic vs. static), current layout / UX, interactions, and responsive notes.

---

### 5.1 Header

| Aspect | Detail |
|---|---|
| **Purpose** | Brand identity + document identification. |
| **Content** | Logo image (external URL `receipts.carpetshop.co.il/img/img.png`), static heading `"מסמך דיגיטלי"`, dynamic subtitle `"{docType} {InvoiceNumber}"`. |
| **Layout** | Centered. Logo `h-11` auto width. Heading `text-xl`/`sm:text-2xl` bold. Subtitle `text-sm` muted. `border-b border-slate-100` below. |
| **Interactions** | None (no links). |
| **Responsive** | Padding increases at `sm:` breakpoint (`px-5` → `sm:px-8`, `pt-6` → `sm:pt-8`). |

### 5.2 Banner

| Aspect | Detail |
|---|---|
| **Purpose** | Decorative brand banner. |
| **Content** | Single image (external URL `receipts.carpetshop.co.il/img/banner1.jpg`). |
| **Layout** | Full-width, `aspect-[2/1]`, `max-h-56`/`sm:max-h-64`, `object-cover`. Grey placeholder background. |
| **Interactions** | None. |
| **Responsive** | Max height increases at `sm:`. |

### 5.3 Meta Block

| Aspect | Detail |
|---|---|
| **Purpose** | Show transaction metadata (branch, date, sales rep). |
| **Content** | Dynamic: `BranchName` (or `BranchID`), `PrintDate`, `SalesRepresentative`. |
| **Layout** | 2-column CSS grid (`grid-cols-2`). Label left (muted `text-slate-500`), value right (bold `text-slate-800`). `text-sm`. |
| **Interactions** | None. |
| **Responsive** | Padding `px-5 py-5` → `sm:px-8 sm:py-6`. |

### 5.4 Product Table

| Aspect | Detail |
|---|---|
| **Purpose** | Itemized list of purchased products. |
| **Content** | Dynamic: `Items[]` — each with `ItemDescription`, `ItemQTY`, `ItemPrice`. Computed line total per row. |
| **Layout** | HTML `<table>`, `min-w-[280px]`, `text-sm`. Three columns: תיאור מוצר (right-aligned), כמות (center), סכום (left-aligned). Header row has `border-b-2`. Body rows have `border-b border-slate-100`. |
| **Interactions** | Horizontal scroll on overflow (negative margin trick `-mx-5`/`sm:-mx-8`). |
| **Responsive** | Scroll container allows table to exceed card width on small screens. |

### 5.5 Summary

| Aspect | Detail |
|---|---|
| **Purpose** | Show VAT, optional discount, and total price. |
| **Content** | Dynamic: `VAT` (labeled "חייב מע״מ 18%"), `discount` (shown only if non-zero, labeled "הנחה"), `TotalPrice` (labeled "סהכ קנייה"). All formatted as `₪ X.XX`. |
| **Layout** | Stacked rows in a `rounded-lg` container with `border border-slate-200`. VAT row: `bg-slate-700`, white text. Discount row: `bg-slate-600`. Total row: `bg-slate-800`, `font-semibold`. Each row is `grid-cols-2` (value left, label right — RTL). |
| **Interactions** | None. |
| **Responsive** | Inherits parent padding. |

### 5.6 Download Link

| Aspect | Detail |
|---|---|
| **Purpose** | Link to download the original document as PDF. |
| **Content** | Static label `"להורדת מסמך המקור"`, links to `/documents/{id}/pdf`. |
| **Layout** | `text-blue-600`, `text-sm`, `font-medium`, underline. |
| **Interactions** | Opens PDF in new tab (`target="_blank"`). |
| **Responsive** | No special handling. |

### 5.7 Thank-You Block

| Aspect | Detail |
|---|---|
| **Purpose** | Express gratitude and drive branch feedback. |
| **Content** | Static heading `"תודה שבחרתם בנו!"`, static subheading `"איזה כיף!"`, dynamic paragraph referencing `SalesRepresentative` and `BranchName`, avatar image (`/images/avatar.svg`), optional CTA button linking to `BranchFeedbackUrl`. |
| **Layout** | Light background `bg-slate-50/80`, `border-t`. Heading `text-lg`/`sm:text-xl` bold. Avatar `h-14 w-14` centered. CTA button: `rounded-lg bg-slate-800` dark, white text, `px-5 py-2.5`. |
| **Interactions** | CTA opens feedback URL in new tab. |
| **Responsive** | Padding `py-6` → `sm:py-8`. |

### 5.8 Newsletter

| Aspect | Detail |
|---|---|
| **Purpose** | Collect email for marketing newsletter. |
| **Content** | Static heading `"דברים טובים בדרך אליך ❤️"`, static body copy about trends and exclusive deals, static CTA line `"זה הזמן להצטרף לניוזלטר שלנו"`. Form (rendered by `<NewsletterForm>`): email input, consent checkbox with privacy policy link, submit button `"צרפו אותי!"`. |
| **Layout** | `border-t`. Heading `text-lg`/`sm:text-xl` bold. Form: `space-y-4`; input `max-w-xs rounded-lg border-slate-300`; checkbox + label inline; button `rounded-lg bg-slate-800`. |
| **Interactions** | Form submit → POST `/api/newsletter`. States: idle, loading (`"שולח..."`), success (`"נרשמת בהצלחה!"` in emerald), error (`"אירעה שגיאה. נסו שוב."` in red). Button disabled during loading. |
| **Responsive** | Input max-width caps at `max-w-xs`. |

### 5.9 Care Guide

| Aspect | Detail |
|---|---|
| **Purpose** | Link to external carpet care article. |
| **Content** | Static label `"המדריך המלא לטיפול ושמירה על שטיח <<"`, links to `BRAND_LINKS.careGuideUrl`. |
| **Layout** | `border-t`, small padding. `text-sm`, `font-semibold`, underline. |
| **Interactions** | Opens external URL in new tab. |
| **Responsive** | No special handling. |

### 5.10 Footer

| Aspect | Detail |
|---|---|
| **Purpose** | Brand social links and closing brand copy. |
| **Content** | Two brand blocks: **השטיח האדום** (Facebook, WhatsApp, Website, Instagram, YouTube — 5 icons) and **פוזיטיב** (Facebook, WhatsApp, Website, Instagram — 4 icons). Static brand paragraph with hashtags (`#carpet_shop`, `#pozitiebeanbags`). |
| **Layout** | `border-t`. Brand names `text-sm font-bold`. Social icons in `flex gap-2` rows; each icon is a `h-9 w-9 rounded-full bg-slate-800` circle with a white SVG icon (`h-4 w-4`) inside. Brand copy `text-sm text-slate-600`, `max-w-prose`. |
| **Interactions** | Each social icon opens its URL in new tab. |
| **Responsive** | `flex-wrap` with `gap-8`/`sm:gap-10` between brand blocks. |

### 5.11 Care Tips

| Aspect | Detail |
|---|---|
| **Purpose** | Educate customer about product care (carpet / bean bag) in a friendly first-person "product voice". |
| **Content** | Static intro sentence, then 4 tip blocks (title + body), separated by `<hr>`. All text is hardcoded Hebrew. |
| **Layout** | Dark outer band `bg-slate-800`, `px-5 py-8`/`sm:px-8 sm:py-10`. Inner white card `rounded-xl bg-white p-5`/`sm:p-6`, `shadow-lg`. Tips: title `text-sm font-semibold`, body `text-sm text-slate-600 leading-relaxed`. Dividers `border-slate-200`. |
| **Interactions** | None (static content). |
| **Responsive** | Padding scales at `sm:`. |

---

## 6. Current Visual Design (Baseline for Replacement)

### Layout

- Single column, `max-w-xl` (~36 rem / 576 px).
- White card with `shadow-sm`/`sm:shadow-md`, `sm:rounded-lg`, `sm:my-6`.
- Sections stack vertically; separated by `border-t border-slate-100` or background color changes.

### Colors

| Token | Value | Usage |
|---|---|---|
| Page background | `bg-slate-50` (#f8fafc) | Behind the card |
| Card background | `bg-white` (#ffffff) | Main content area |
| Primary text | `text-slate-800` (#1e293b) | Headings, values |
| Secondary text | `text-slate-600`/`700` (#475569 / #334155) | Body copy, labels |
| Muted text | `text-slate-500` (#64748b) | Meta labels |
| Accent (links) | `text-blue-600` (#2563eb) | Download link, privacy link |
| Buttons / dark bands | `bg-slate-800` (#1e293b) | CTA buttons, summary rows, social circles, care-tips band |
| Summary mid-row | `bg-slate-700` / `bg-slate-600` | VAT row / discount row |
| Success | `text-emerald-600` | Newsletter success message |
| Error | `text-red-600` | Newsletter error message |
| Thank-you bg | `bg-slate-50/80` | Subtle tint behind thank-you block |

**Note:** The `document.css` file defines an alternative palette with brand red (`#a61a21`) and green (`#059669`) that is **not currently applied** in the Tailwind-based `DocumentView.tsx`.

### Typography

- **Font stack:** Geist (via `--font-geist-sans`) falling back to `Arial, Helvetica, sans-serif` (set in `globals.css`).
- **Sizes:** `text-sm` (0.875 rem) for most content; `text-lg`/`text-xl`/`text-2xl` for headings.
- **Weights:** `font-medium`, `font-semibold`, `font-bold`.
- **No dedicated Hebrew-optimized font.**

### Spacing

- Horizontal padding: `px-5` (1.25 rem) → `sm:px-8` (2 rem).
- Vertical padding: `py-4` to `py-8` depending on section.
- Gaps between sections via `border-t` dividers or padding.

### Component Patterns

| Component | Style |
|---|---|
| Buttons | `rounded-lg bg-slate-800 text-white px-5 py-2.5 font-semibold` |
| Links | `text-blue-600 underline underline-offset-2` |
| Form input | `rounded-lg border border-slate-300 px-4 py-2.5 text-sm` |
| Checkbox | `h-4 w-4 rounded border-slate-300` |
| Table | Bordered rows, right-aligned description, center qty, left-aligned amount |
| Social icons | `h-9 w-9 rounded-full bg-slate-800`, white SVG `h-4 w-4` inside |

### Assets

| Asset | Current source | Notes |
|---|---|---|
| Logo | `https://receipts.carpetshop.co.il/img/img.png` | External URL, no local copy |
| Banner | `https://receipts.carpetshop.co.il/img/banner1.jpg` | External URL, no local copy |
| Avatar | `/images/avatar.svg` | Referenced but file does not exist in `public/images/` |
| Social icons | `/images/{web,facebook,instagram,youtube,whatsapp}.svg` | Referenced but files do not exist in `public/images/` |

---

## 7. Data and Content Reference

### Dynamic Data (from Supabase payload)

| Field | Type | Used In |
|---|---|---|
| `InvoiceNumber` | `string` | Header subtitle |
| `type` | `string` | Header subtitle, metadata title |
| `BranchName` / `BranchID` | `string` | Meta block, thank-you text, newsletter context |
| `PrintDate` | `string` | Meta block |
| `SalesRepresentative` | `string` | Meta block, thank-you text |
| `CustomerName` | `string` | Available in payload; **not currently rendered** |
| `Items[]` | `Array<{ ItemDescription, ItemQTY, ItemPrice, ItemSKU }>` | Product table |
| `TotalPrice` | `number` | Summary total row |
| `VAT` | `number` | Summary VAT row |
| `discount` | `number` | Summary discount row (shown if non-zero) |
| `paymentType` | `string` | Available in payload; **not currently rendered** |
| `BranchFeedbackUrl` | `string` | Thank-you CTA button (shown if present) |

### Static Copy (Hebrew strings in components)

All static Hebrew strings are hardcoded in `DocumentView.tsx` and `NewsletterForm.tsx`. Key strings:

| Location | String |
|---|---|
| Header heading | `"מסמך דיגיטלי"` |
| Meta labels | `"סניף"`, `"תאריך"`, `"נציג מכירות"` |
| Table headers | `"תיאור מוצר"`, `"כמות"`, `"סכום"` |
| Summary labels | `"חייב מע״מ 18%"`, `"הנחה"`, `"סהכ קנייה"` |
| Download link | `"להורדת מסמך המקור"` |
| Thank-you heading | `"תודה שבחרתם בנו!"` |
| Thank-you sub | `"איזה כיף!"` |
| Thank-you body | `"מקווים שניהנת מהשירות של {rep}... לחצו על הלינק ותחממו לנו את הלב."` |
| Newsletter heading | `"דברים טובים בדרך אליך ❤️"` |
| Newsletter body | `"רוצים לדעת לפני כולם על הטרנדים החמים..."` |
| Newsletter CTA line | `"זה הזמן להצטרף לניוזלטר שלנו"` |
| Newsletter button | `"צרפו אותי!"` / `"שולח..."` |
| Newsletter success | `"נרשמת בהצלחה!"` |
| Newsletter error | `"אירעה שגיאה. נסו שוב."` |
| Care guide | `"המדריך המלא לטיפול ושמירה על שטיח <<"` |
| Footer brand names | `"השטיח האדום"`, `"פוזיטיב"` |
| Footer copy | `"אנחנו שמחים שהמוצרים שלנו הפכו לחלק מהעיצוב שלך..."` |
| Care tips intro | `"סוף סוף אנחנו נפתחים אל העולם..."` |
| Care tips (4 blocks) | Each has a title and body (see Section 5.11) |
| Email placeholder | `"דואר אלקטרוני"` |
| Consent text | `"הריני מאשר/ת כי קראתי והבנתי את מדיניות הפרטיות..."` |

Design AI can propose revised copy; implementation will replace the exact strings.

### Config-Driven URLs

All external URLs are in `src/config/links.ts`:

```
BRAND_LINKS.carpet.{youtube, instagram, website, whatsapp, facebook}
BRAND_LINKS.pozitive.{instagram, website, whatsapp, facebook}
BRAND_LINKS.careGuideUrl
BRAND_LINKS.privacyPolicyUrl
```

**URLs must not change.** Link styling and placement within the existing structure can change.

---

## 8. Responsiveness and Accessibility

### Current State

| Area | Status |
|---|---|
| **Breakpoints** | Single `sm:` breakpoint (640 px) for padding, font size, and shadow changes. |
| **Table overflow** | Horizontal scroll via `overflow-x-auto` with negative margin. |
| **Stacking** | All sections stack vertically; no multi-column layouts. |
| **Touch targets** | Buttons and social circles are adequately sized (36 px+). |
| **Focus styles** | `focus:ring` on form input and button only. No `focus-visible` on links or social icons. |
| **Reduced motion** | Not addressed. |
| **Screen reader** | Email label uses `sr-only`. Social icons have `aria-label`. No landmark roles (`role="region"`, etc.). Alt text on logo; decorative images have `alt=""`. |
| **Contrast** | Generally good (dark text on white). Summary section (white on dark slate) likely passes WCAG AA. Blue links on white pass. |
| **RTL** | `dir="rtl"` on outer wrapper. Tailwind handles RTL flow. Table alignment is manually set (right / center / left). |

### Design Expectations

- **Mobile-first**: Receipt is most often viewed on a phone. Design should prioritize readability and thumb-friendly CTAs on screens 360–414 px wide.
- **Breakpoints**: Specify any additional breakpoints beyond `sm:` (e.g. `md:` for tablet) and what changes at each.
- **Font scaling**: If introducing a new type scale, specify sizes per breakpoint.
- **Spacing**: Specify any spacing changes per breakpoint.
- **RTL**: All designs must be RTL-native. Note any icon flipping, alignment exceptions, or bidirectional text handling.
- **Accessibility**: Ensure WCAG 2.1 AA contrast (4.5:1 for text, 3:1 for large text). Add `focus-visible` to all interactive elements. Consider `prefers-reduced-motion`.

---

## 9. Out of Scope / Fixed

- **Backend and API contracts** — unchanged.
- **Section order and presence** — fixed. No removing or merging sections without an explicit product decision.
- **PDF layout** — separate (`ReceiptPdfDocument.tsx`). Optional: "align PDF with web design" in a later phase.
- **Home page** (`/`) — not in scope.
- **Authentication / authorization** — none; receipt is public by UUID.

---

## 10. Expected Deliverables from Design AI

The design AI should produce the following (appended to this document or in a companion file):

### 10.1 Visual Direction

- **Color palette**: Primary brand color(s), neutrals, accents, semantic colors (success, error, warning). Provide hex values and Tailwind class mappings.
- **Type scale**: Font families (with Hebrew support), sizes, weights, line heights. Tailwind-compatible values preferred.
- **Spacing system**: Base unit, section padding, component gaps. Tailwind scale preferred.

### 10.2 Section-Level Specs

For each of the 11 sections (5.1–5.11):

- Layout (including mobile vs. desktop differences)
- Typography (font, size, weight, color)
- Colors (backgrounds, borders, text)
- Component styles (buttons, links, inputs, table, icons)
- Any new or replaced assets (with suggested filenames and placement under `public/`)

### 10.3 Copy Changes

Any revised Hebrew (or English) strings with:

- Exact replacement text
- Location (section and component)

### 10.4 Asset List

New or replaced images / SVGs:

| Asset | Description | Filename | Used In |
|---|---|---|---|
| *(to be filled by design AI)* | | | |

### 10.5 Responsiveness Rules

- Breakpoints and layout/visibility changes at each.
- Font size adjustments.
- Spacing adjustments.

### 10.6 Accessibility Notes

- Focus styles for all interactive elements.
- Contrast ratios for any new color combinations.
- RTL-specific considerations (icon flip, alignment, bidirectional text).
- `prefers-reduced-motion` handling if animations are introduced.

### 10.7 Optional

- Wireframes or reference screens (as descriptions or links) that the implementation AI can follow.
- Mood board references for visual tone.

---

## Appendix A: File Tree (Relevant)

```
src/
├── app/
│   ├── documents/
│   │   └── [id]/
│   │       ├── page.tsx          ← Server component, data fetch, renders DocumentView
│   │       └── pdf/
│   │           └── route.tsx     ← PDF stream endpoint
│   ├── api/
│   │   ├── documents/
│   │   │   └── route.ts         ← POST: create document
│   │   └── newsletter/
│   │       └── route.ts         ← POST: newsletter signup
│   ├── globals.css
│   ├── layout.tsx
│   └── documents/
│       └── document.css          ← Alternative CSS (not currently imported)
├── components/
│   ├── DocumentView.tsx          ← Main receipt UI (all 11 sections)
│   ├── NewsletterForm.tsx        ← Client component for email signup
│   └── ReceiptPdfDocument.tsx    ← PDF layout (out of scope)
├── config/
│   ├── links.ts                  ← Brand URLs
│   └── assets.ts                 ← Asset path constants (not currently used by DocumentView)
├── types/
│   └── document.ts               ← TypeScript interfaces
└── lib/
    └── supabase/
        ├── client.ts
        └── server.ts
```

---

## Appendix B: `document.css` Brand Tokens (Reference)

The file `src/app/documents/document.css` defines an alternative CSS class-based design with these brand tokens:

```css
--doc-red: #a61a21;        /* Primary brand red */
--doc-red-dark: #8b1520;   /* Hover state for red */
--doc-green: #059669;       /* Accent green (top stripe) */
--doc-grey-bg: #2a2a2a;    /* Dark background for summary values */
--doc-content-bg: #f0f0ef; /* Page background */
--doc-white: #ffffff;
--doc-text: #1a1a1a;       /* Primary text */
--doc-text-muted: #4a4a4a; /* Secondary text */
--doc-link: #2563eb;       /* Link blue */
```

This represents the "production parity" target from `receipts.carpetshop.co.il` and may serve as a useful reference for the design AI's color direction.

---

*End of specification. Design AI: please append your proposed design below or in a separate `docs/DESIGN_PROPOSAL.md` file.*

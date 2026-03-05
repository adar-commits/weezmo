# UX Brief: Digital Receipt — Full Front-End Element Inventory

**Purpose of this brief:** Give a design-focused AI everything it needs to fully redesign the app from a user-experience standpoint. Ignore backend and tech; focus only on what the user sees, does, and feels.

**Product context:** This is a **post-purchase digital receipt** for a luxury carpet brand ("השטיח האדום" / The Red Carpet). The user receives a link (e.g. by SMS) after buying, opens it on their phone or desktop, and sees a single long page: part confirmation, part reassurance, part marketing. The goal is to build trust, reduce buyer's remorse, and encourage care, sharing, and future purchases. The page is **RTL**, **Hebrew**, and **mobile-first** (many users check the receipt on their phone while waiting for delivery).

---

## 1. Overall experience

- **One scrollable page** — no tabs, no steps, no navigation. Everything lives on one vertical flow.
- **RTL layout** — all text and alignment are right-to-left; any icons or progress should respect RTL (e.g. timeline flows right-to-left).
- **Language:** Hebrew. All copy is Hebrew unless noted.
- **Entry:** User lands on the page via a unique link. No login; no back button to "app"; this page is the whole experience for this visit.
- **Trust and tone:** The experience should feel premium, warm, and editorial (like an "unboxing"), not like a generic order confirmation.

---

## 2. Element-by-element inventory

Below, every UI block is listed with: **purpose**, **content**, **user action**, and **UX notes** for the design AI.

---

### 2.1 Celebration header (top of page)

**Purpose:** First impression. Celebrate the purchase and set a warm, premium tone. Confirm "your order is in."

**Content:**

- **Logo:** Brand logo (image), centered. Alt: "לוגו השטיח האדום".
- **Headline:** "תודה שבחרתם בנו" (Thank you for choosing us).
- **Personalization (optional):** If we have the customer's name, show "{שם} יקר/ה," (e.g. "תמר יקר/ה,").
- **Supporting line:** "ההזמנה שלכם התקבלה. אנחנו מתחילים להכין אותה בקפידה — ומחכים לכם על השטיח האדום."
- **Doc reference:** Small text: document type + invoice number (e.g. "חשבונית מס IN-TEST-001").

**User action:** None; read-only.

**UX notes:** This is the "unboxing" moment. Plenty of white space, clear hierarchy (logo → thank you → personalization → reassurance → doc number). The design AI can suggest a different headline or supporting copy; keep the same information hierarchy.

---

### 2.2 Banner image

**Purpose:** Visual mood; reinforce brand and lifestyle (home, carpet, quality).

**Content:** One full-width image (currently a lifestyle/interior image). Aspect ratio about 2:1; capped height on larger screens.

**User action:** None; decorative.

**UX notes:** Treat as editorial imagery. No overlay text required. Consider how it behaves on very small screens (e.g. cropping, aspect ratio).

---

### 2.3 Meta card (order context)

**Purpose:** Answer "where/when/who" for the order at a glance.

**Content:** One card containing three label–value pairs (RTL: label on right, value on left in a 2-column grid):

- **סניף** (Branch) → branch name or ID
- **תאריך** (Date) → print/order date
- **נציג מכירות** (Sales representative) → rep name

**User action:** None; read-only.

**UX notes:** Compact but scannable. Design AI can change card style, typography, or layout (e.g. list vs grid) as long as the three pieces of info remain.

---

### 2.4 Section title: "פירוט ההזמנה" (Order details)

**Purpose:** Introduce the list of purchased items.

**Content:** A single heading: "פירוט ההזמנה".

**User action:** None.

**UX notes:** Clear hierarchy before the item cards. Design can merge with the first item card or keep as separate heading.

---

### 2.5 Order line items (one card per product)

**Purpose:** Show what was bought: product, quantity, and line total. Build trust through clarity.

**Content (per item):**

- **Main line:** Product description (e.g. "נירוונה 12 גרז 340*240 NIRVANA") and line total in currency (e.g. "3,952.80 ₪").
- **Secondary line:** "כמות: X" (quantity) and optionally product SKU/code.

**User action:** None; read-only.

**UX notes:** Currently one card per item; design AI can keep cards or use another pattern (e.g. a single card with a list, or a subtle table). Must support multiple items; each item must show description, quantity, and line total. Prices in ₪, Hebrew locale formatting.

---

### 2.6 Totals card

**Purpose:** Summarize VAT, any discount, and grand total. Final "receipt math."

**Content:**

- Row: "חייב מע״מ 18%" + VAT amount.
- Row (if discount exists): "הנחה" + discount amount.
- Row (emphasized): "סהכ קנייה" + total amount.

**User action:** None; read-only.

**UX notes:** Total row should feel like the conclusion (e.g. bolder, larger, or separated). Design can use a card, a simple list, or a compact block.

---

### 2.7 Download PDF button

**Purpose:** Let the user save an official PDF of the receipt (for records, accounting, returns).

**Content:** One primary button: "להורדת מסמך המקור (PDF)". Opens the PDF in a new tab (user can then save or print).

**User action:** Tap/click → new tab with PDF.

**UX notes:** Primary CTA at this point in the flow. Should look clickable and trustworthy. Consider loading state if PDF generation is slow (e.g. "מוריד…").

---

### 2.8 Delivery timeline ("מה קורה עכשיו?")

**Purpose:** Turn "waiting for delivery" into a positive, anticipatory experience. Show the journey: order placed → preparation → shipping → arrival.

**Content:**

- **Title:** "מה קורה עכשיו?"
- **Subtitle:** "הדרך מההזמנה עד אליכם הביתה"
- **Four steps** (RTL order):  
  1. ההזמנה נרשמה (Order registered)
  2. מוכן על ידי האומנים (Being prepared by artisans)
  3. על השטיח האדום (משלוח) (On the Red Carpet / Shipping)
  4. הגעה (Arrival)

**User action:** None; read-only. Step 1 is "current"; others are upcoming (visual distinction).

**UX notes:** Design AI can reimagine this as a horizontal stepper, vertical timeline, or progress bar. Keep four stages and the idea that the first is "done" and the rest "to come." RTL: flow should read naturally right-to-left.

---

### 2.9 Care & Love card

**Purpose:** Encourage post-purchase care; link to care guide (blog/tips). Positions the brand as helpful.

**Content:**

- **Title:** "טיפול ואהבה"
- **Body:** "איך לשמור על השטיח שלכם כמו חדש? המדריך המלא לטיפול ושמירה."
- **CTA:** "המדריך המלא לטיפול ושמירה על שטיח" (link to external care guide).

**User action:** Tap CTA → open care guide in new tab.

**UX notes:** Can be a card, a banner, or an inline block. CTA can be button or text link; should feel supportive, not pushy.

---

### 2.10 "אולי תאהבו גם" (You might also like) — upsell

**Purpose:** Soft cross-sell: suggest browsing more products. Subtle, not spammy.

**Content:**

- **Title:** "אולי תאהבו גם"
- **Body:** "מגוון שטיחים ואביזרים שישתלבו עם ההזמנה שלכם."
- **Link:** "לגלות עוד באתר" → main brand site.

**User action:** Tap link → open website in new tab.

**UX notes:** Keep it light: one short line of copy and one link. No product grid or images required unless the design AI wants to add a small "teaser" strip.

---

### 2.11 "תהיו הראשונים לשתף את המראה החדש" (Share your style)

**Purpose:** Ask for UGC: photos, tags, reviews. Social proof and community.

**Content:**

- **Title:** "תהיו הראשונים לשתף את המראה החדש"
- **Body:** "צלמו את השטיח chez vous, שתפו ותייגו אותנו — נשמח לראות איך נכנס אליכם הביתה."
- **CTA button:** "שתפו את הסגנון שלכם" → review/social page (e.g. review form or Instagram).

**User action:** Tap CTA → open review/social destination in new tab.

**UX notes:** Feel inviting and celebratory ("you're the first to share"). Design can add a small illustration or icon. CTA should feel primary or secondary depending on overall hierarchy.

---

### 2.12 AR reminder

**Purpose:** Promote the AR placement tool for users who haven't decided where to put the rug.

**Content:**

- **Line:** "עדיין מתלבטים איפה לשים? נסו את כלי ה-AR שלנו"
- **Button/link:** "להשתמש בכלי AR" → AR tool URL.

**User action:** Tap → open AR tool (new tab or in-app).

**UX notes:** Visually distinct (e.g. dashed border, lighter background) so it feels optional and exploratory. Design can make it a small card or a slim banner.

---

### 2.13 Thank-you + feedback block ("איזה כיף!")

**Purpose:** Personal thank-you and request for feedback on the purchase experience (branch/rep).

**Content:**

- **Heading:** "איזה כיף!"
- **Body:** "מקווים שנהנית מהשירות של {נציג} … נשמח לשמוע על חווית הקניה בסניף {סניף}. לחצו על הלינק ותחממו לנו את הלב."
- **Avatar:** Small graphic (decorative; e.g. heart or face).
- **Button (if feedback URL exists):** "{סניף}" or "משוב" → opens feedback form/survey.

**User action:** Tap button (if present) → open feedback in new tab.

**UX notes:** Warm, human tone. Avatar is decorative. If no feedback URL, only heading + body + avatar are shown. Design can make the button primary or secondary.

---

### 2.14 Newsletter section ("דברים טובים בדרך אליך")

**Purpose:** Capture email for marketing (with consent). Optional; user can skip.

**Content:**

- **Heading:** "דברים טובים בדרך אליך"
- **Body:** "רוצים לדעת לפני כולם על טרנדים, מבצעים והצצה לפרויקטים? הצטרפו לניוזלטר."
- **Form:**
  - **Email field:** placeholder "דואר אלקטרוני", type email, required.
  - **Checkbox + consent text:** "הריני מאשר/ת כי קראתי והבנתי את [מדיניות הפרטיות וה״עוגיות״], ואני מאשר/ת קבלת מידע ו/או דברי פרסומת מ- [השטיח האדום] בדואר אלקטרוני ו/או סמס." (Links go to privacy policy; both open in new tab.)
  - **Submit button:** "צרפו אותי!"
  - **States:** Idle / Loading ("שולח…") / Success ("נרשמת בהצלחה!") / Error ("אירעה שגיאה. נסו שוב.")

**User action:** Enter email, check consent, submit. On success, show message; on error, show message and let user retry.

**UX notes:** Form must stay accessible (labels, focus states, error visibility). Design AI can restyle the block, button, and messages; consent text and links must remain. Consider disabled state and loading state on the button.

---

### 2.15 Footer (brands + social)

**Purpose:** Brand presence and channels. Two brands under the same group.

**Content:**

- **Brand 1 — "השטיח האדום":** Label + row of icon links (Facebook, WhatsApp, Website, Instagram, YouTube). Each icon opens the brand's page in a new tab; icons are recognizable (e.g. standard social icons).
- **Brand 2 — "פוזיטיב":** Label + row of icon links (Facebook, WhatsApp, Website, Instagram). Same behavior.
- **Paragraph:** "אנחנו שמחים שהמוצרים שלנו הפכו לחלק מהעיצוב שלך. כל פריט אצלנו נבחר ומיוצר בקפידה. צלמו, שתפו, ותייגו אותנו ב #carpet_shop או #pozitiebeanbags"

**User action:** Tap any icon or read copy. Hashtags are copy-only (no link).

**UX notes:** Clear separation between the two brands; equal weight or hierarchy as desired. Icons should have hover/focus states. Paragraph is short and on-brand; design can adjust typography and spacing.

---

### 2.16 Care tips (dark band)

**Purpose:** Set expectations after delivery: smell, creases, color, "settling in." First-person "product voice" for empathy.

**Content:**

- **Intro (one sentence):** "סוף סוף אנחנו נפתחים אל העולם. הדרך שלנו לבית שלך הייתה ארוכה — אשמח למעט סבלנות בזמן שאנחנו מתרעננים."
- **Four tips,** each with a title and body:
  1. **כן, זה הריח של שטיח חדש...** — About smell fading with time and air.
  2. **גם אתה תהיה קצת מקומט...** — About creases from shipping and relaxing over time.
  3. **הצבעים וההצללות שלי יכולים להיות בהירים או כהים יותר...** — About light and room orientation.
  4. **תן לי רגע להתעורר...** — About unpacking, fluffing, and giving the product time to take shape (with a light tone).

**User action:** Read-only.

**UX notes:** Visually distinct (e.g. dark background, white inner card). First-person voice is intentional. Design can change layout (e.g. accordion, cards) but keep the four tips and the intro. Dividers between tips are optional.

---

## 3. Shared UI elements (design system)

The design AI can define these consistently across the page:

- **Primary button:** Used for "Download PDF," "Share your style," "Branch feedback." Should feel like the main action (e.g. solid color, clear hover/active).
- **Secondary button / outline:** Used for "Care guide" CTA or "AR tool." Less prominent than primary.
- **Text link:** Used for "לגלות עוד באתר," privacy links in newsletter. Underline or distinct color; hover state.
- **Cards:** Several sections are "cards" (meta, each line item, totals, care, upsell, share). Design can unify border, shadow, radius, and padding.
- **Form controls:** Email input and checkbox in newsletter. Need clear focus, error, and disabled states.
- **Social icons:** Small, tappable, with hover/focus. RTL: order can be right-to-left.
- **Section spacing:** Consistent vertical rhythm between sections so the scroll feels calm and editorial.

---

## 4. Copy and content inventory (Hebrew)

All user-facing strings the design AI can refine (tone, length, or wording):

| Location   | Current copy (Hebrew)                                                                  |
| ---------- | -------------------------------------------------------------------------------------- |
| Header     | תודה שבחרתם בנו                                                                        |
| Header     | {שם} יקר/ה,                                                                            |
| Header     | ההזמנה שלכם התקבלה. אנחנו מתחילים להכין אותה בקפידה — ומחכים לכם על השטיח האדום.       |
| Section    | פירוט ההזמנה                                                                           |
| Meta       | סניף, תאריך, נציג מכירות                                                               |
| Totals     | חייב מע״מ 18%, הנחה, סהכ קנייה                                                         |
| PDF        | להורדת מסמך המקור (PDF)                                                                |
| Timeline   | מה קורה עכשיו?                                                                         |
| Timeline   | ההדרך מההזמנה עד אליכם הביתה                                                           |
| Timeline   | ההזמנה נרשמה, מוכן על ידי האומנים, על השטיח האדום (משלוח), הגעה                        |
| Care card  | טיפול ואהבה                                                                            |
| Care card  | איך לשמור על השטיח שלכם כמו חדש? …                                                     |
| Care card  | המדריך המלא לטיפול ושמירה על שטיח                                                      |
| Upsell     | אולי תאהבו גם                                                                          |
| Upsell     | מגוון שטיחים ואביזרים…                                                                 |
| Upsell     | לגלות עוד באתר                                                                         |
| Share      | תהיו הראשונים לשתף את המראה החדש                                                       |
| Share      | צלמו את השטיח…                                                                         |
| Share      | שתפו את הסגנון שלכם                                                                    |
| AR         | עדיין מתלבטים איפה לשים? נסו את כלי ה-AR שלנו                                          |
| AR         | להשתמש בכלי AR                                                                         |
| Thank you  | איזה כיף!                                                                              |
| Thank you  | מקווים שנהנית…                                                                         |
| Thank you  | משוב / {סניף}                                                                          |
| Newsletter | דברים טובים בדרך אליך                                                                  |
| Newsletter | רוצים לדעת לפני כולם…                                                                  |
| Newsletter | דואר אלקטרוני, צרפו אותי!, consent text, שולח..., נרשמת בהצלחה!, אירעה שגיאה. נסו שוב. |
| Footer     | השטיח האדום, פוזיטיב                                                                   |
| Footer     | אנחנו שמחים… #carpet_shop #pozitiebeanbags                                             |
| Care tips  | Intro sentence + 4 tip titles and bodies (see 2.16)                                    |

---

## 5. What the design AI is free to change

- **Visual design:** Colors, typography (Hebrew-friendly), spacing, shadows, borders, radii.
- **Layout:** Card vs list vs table for items and totals; horizontal vs vertical timeline; grouping of sections.
- **Hierarchy:** Which sections feel "primary" vs "secondary"; size and weight of headings.
- **Copy:** Wording and tone of all Hebrew strings above; keep the same meaning and legal/consent content where required.
- **Assets:** Logo, banner, avatar, social icons — suggest new assets or placements.
- **Motion:** What animates on load or scroll (e.g. cards, timeline); keep it subtle and fast.
- **Responsiveness:** Breakpoints, font sizes, and spacing for mobile vs desktop; RTL preserved.
- **Accessibility:** Contrast, focus styles, touch targets, and ARIA/labels as part of the design.

---

## 6. What must stay (constraints)

- **All sections present** in some form (no removing blocks).
- **Order of sections** can be refined (e.g. move AR or upsell) but the flow should still make sense: celebration → receipt facts → actions (PDF, care, share, AR) → thank you → newsletter → footer → care tips.
- **RTL and Hebrew** for the whole receipt experience.
- **Data shown:** Document type + number; branch; date; sales rep; per-item description, qty, price, line total; VAT; discount (if any); total; optional customer name. No new data fields required.
- **Links:** Care guide, main site, review/social, AR tool, privacy policy, feedback URL, social links — destinations stay; labels and styling can change.
- **Newsletter:** Email + consent checkbox + submit; success and error states; consent text must still link to privacy policy and name the brand.

---

## 7. Optional: home page (root URL)

The app has a **root page** ("/") that is currently a generic Next.js placeholder (logo, "To get started…", Templates/Docs links). It is **not** part of the receipt flow. If the design AI is asked to design the "whole app," it can treat the home page as a separate screen (e.g. minimal landing or redirect); the receipt remains the main experience described above.

---

**End of brief.** The design AI can use this as the single source of truth for every front-end element and produce a new visual and UX specification (or component-level specs) that an implementation AI can then code against.

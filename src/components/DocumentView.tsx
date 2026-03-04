import Image from "next/image";
import Link from "next/link";
import { BRAND_LINKS } from "@/config/links";
import { DOCUMENT_ASSETS } from "@/config/assets";
import { NewsletterForm } from "./NewsletterForm";

interface DocumentViewProps {
  documentId: string;
  payload: {
    type?: string;
    InvoiceNumber?: string;
    BranchName?: string;
    BranchID?: string;
    PrintDate?: string;
    SalesRepresentative?: string;
    CustomerName?: string;
    Items?: Array<{ ItemDescription?: string; ItemQTY?: number; ItemPrice?: number; ItemSKU?: string }>;
    TotalPrice?: number;
    VAT?: number;
    paymentType?: string;
    discount?: number;
    BranchFeedbackUrl?: string;
  };
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("he-IL", { style: "decimal", minimumFractionDigits: 2 }).format(n) + " ₪";
}

export function DocumentView({ documentId, payload }: DocumentViewProps) {
  const items = payload.Items ?? [];
  const totalPrice = payload.TotalPrice ?? 0;
  const vat = payload.VAT ?? 0;
  const discount = payload.discount ?? 0;
  const docType = payload.type ?? "מסמך דיגיטלי";
  const branchName = payload.BranchName ?? payload.BranchID ?? "";

  return (
    <div className="doc-frame">
      <div className="doc-green-stripe" />
      <div className="flex">
        <div className="doc-red-side" aria-hidden />
        <div className="flex-1 min-w-0">
          <main className="doc-main px-6 md:px-10 py-8 md:py-10">
            {/* Brand header – production parity: logo + text */}
            <header className="text-center doc-header">
              <Image
                src={DOCUMENT_ASSETS.logo}
                alt="לוגו השטיח האדום"
                width={180}
                height={48}
                className="doc-logo mx-auto"
                unoptimized
              />
              <p className="doc-brand-main mt-3">
                <span className="hom">HōM</span> GROUP
              </p>
              <div className="doc-sub-brands">
                <span>ELITE RUGS</span>
                <span>השטיח האדום</span>
                <span>Pozitive HōM</span>
                <span>HōM BUSINESS</span>
              </div>
            </header>

            {/* Document title */}
            <div className="text-center doc-title-block">
              <h1 className="doc-title-main">מסמך דיגיטלי</h1>
              <p className="doc-title-sub">
                {docType} {payload.InvoiceNumber ?? ""}
              </p>
            </div>

            {/* Hero / banner – production asset */}
            <div className="doc-banner-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={DOCUMENT_ASSETS.banner}
                alt=""
                className="doc-banner-img"
              />
            </div>

            {/* Meta: Branch, Date, Sales rep – production layout */}
            <div className="doc-meta grid grid-cols-2 gap-y-3 text-base">
              <div className="text-left text-stone-500">סניף</div>
              <div className="text-right font-medium text-stone-900">{branchName}</div>
              <div className="text-left text-stone-500">תאריך</div>
              <div className="text-right font-medium text-stone-900">{payload.PrintDate ?? ""}</div>
              <div className="text-left text-stone-500">נציג מכירות</div>
              <div className="text-right font-medium text-stone-900">{payload.SalesRepresentative ?? ""}</div>
            </div>

            {/* Items table – production alignment */}
            <div className="doc-table-wrap">
              <table className="doc-table w-full border-collapse text-base">
                <thead>
                  <tr className="border-b-2 border-stone-200">
                    <th className="py-3 pr-4 text-right font-bold text-stone-800">תיאור מוצר</th>
                    <th className="w-16 py-3 text-center font-bold text-stone-800">כמות</th>
                    <th className="w-28 py-3 text-left font-bold text-stone-800">סכום</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-stone-100">
                      <td className="py-3 pr-4 text-right text-stone-800">{item.ItemDescription ?? ""}</td>
                      <td className="py-3 text-center text-stone-800">{item.ItemQTY ?? 0}</td>
                      <td className="py-3 text-left text-stone-800">{formatPrice((item.ItemPrice ?? 0) * (item.ItemQTY ?? 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary rows – production: dark grey (value) | red (label) */}
            <div className="doc-summary">
              <div className="doc-summary-row">
                <div className="doc-summary-value">{formatPrice(vat)}</div>
                <div className="doc-summary-label">חייב מע״מ 18%</div>
              </div>
              {discount !== 0 && (
                <div className="doc-summary-row">
                  <div className="doc-summary-value">{formatPrice(discount)}</div>
                  <div className="doc-summary-label">הנחה</div>
                </div>
              )}
              <div className="doc-summary-row">
                <div className="doc-summary-value font-semibold">{formatPrice(totalPrice)}</div>
                <div className="doc-summary-label">סהכ קנייה</div>
              </div>
            </div>

            {/* Download original – production: blue link */}
            <div className="doc-download">
              <Link
                href={`/documents/${documentId}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="doc-link-primary"
              >
                להורדת מסמך המקור
              </Link>
            </div>

            {/* Thank you + feedback – production: heading, sub, paragraph, avatar img, branch button */}
            <section className="doc-thank-you">
              <h2 className="doc-thank-you-title">תודה שבחרתם בנו!</h2>
              <p className="doc-thank-you-sub">איזה כיף!</p>
              <p className="doc-thank-you-text">
                מקווים שניהנת מהשירות של {payload.SalesRepresentative ?? ""}
                {branchName && ` נשמח לשמוע על חווית הקניה שלך בסניף ${branchName},`} לחצו על הלינק ותחממו לנו את הלב.
              </p>
              <div className="doc-thank-you-cta">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={DOCUMENT_ASSETS.avatar}
                  alt=""
                  className="doc-avatar"
                />
                {payload.BranchFeedbackUrl && (
                  <a
                    href={payload.BranchFeedbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="doc-btn-branch"
                  >
                    {branchName || "משוב"}
                  </a>
                )}
              </div>
            </section>

            {/* Newsletter – production hierarchy */}
            <section className="doc-newsletter">
              <h2 className="doc-newsletter-title">דברים טובים בדרך אליך ❤️</h2>
              <p className="doc-newsletter-desc">
                רוצים לדעת לפני כולם על הטרנדים החמים מעולם העיצוב? מבצעים בלעדיים והצצה לפרוייקטים מסקרנים?
              </p>
              <p className="doc-newsletter-cta">זה הזמן להצטרף לניוזלטר שלנו</p>
              <NewsletterForm documentId={documentId} branchName={branchName} />
            </section>

            {/* Care guide link – production styling */}
            <div className="doc-care-guide">
              <a
                href={BRAND_LINKS.careGuideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="doc-care-guide-link"
              >
                המדריך המלא לטיפול ושמירה על שטיח &lt;&lt;
              </a>
            </div>

            {/* Footer: brands + social – production */}
            <footer className="doc-footer">
              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="font-bold text-stone-900 text-lg">השטיח האדום</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <a href={BRAND_LINKS.carpet.facebook} target="_blank" rel="noopener noreferrer" className="doc-social-circle" aria-label="Facebook">f</a>
                    <a href={BRAND_LINKS.carpet.whatsapp} target="_blank" rel="noopener noreferrer" className="doc-social-circle" aria-label="WhatsApp">WA</a>
                    <a href={BRAND_LINKS.carpet.website} target="_blank" rel="noopener noreferrer" className="doc-social-circle" aria-label="Website">🌐</a>
                    <a href={BRAND_LINKS.carpet.instagram} target="_blank" rel="noopener noreferrer" className="doc-social-circle" aria-label="Instagram">IG</a>
                    <a href={BRAND_LINKS.carpet.youtube} target="_blank" rel="noopener noreferrer" className="doc-social-circle" aria-label="YouTube">YT</a>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-stone-900 text-lg">פוזיטיב</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    <a href={BRAND_LINKS.pozitive.facebook} target="_blank" rel="noopener noreferrer" className="doc-social-circle" aria-label="Facebook">f</a>
                    <a href={BRAND_LINKS.pozitive.whatsapp} target="_blank" rel="noopener noreferrer" className="doc-social-circle" aria-label="WhatsApp">WA</a>
                    <a href={BRAND_LINKS.pozitive.website} target="_blank" rel="noopener noreferrer" className="doc-social-circle" aria-label="Website">🌐</a>
                    <a href={BRAND_LINKS.pozitive.instagram} target="_blank" rel="noopener noreferrer" className="doc-social-circle" aria-label="Instagram">IG</a>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-stone-600 text-sm leading-relaxed max-w-xl">
                אנחנו שמחים שהמוצרים שלנו הפכו לחלק מהעיצוב שלך. כל פריט אצלנו נבחר ומיוצר בקפידה, מתוך תשוקה לעיצוב, איכות ואהבה לפרטים הקטנים. נשמח לראות איך בחרת לשלב אותם אצלך בבית! צלמו, שתפו, ותייגו אותנו ב #carpet_shop או #pozitiebeanbags
              </p>
            </footer>
          </main>

          {/* Care tips - red background, white inner card */}
          <div className="bg-[#a61a21] py-10 md:py-12 px-6 md:px-10">
            <div className="doc-care-card p-6 md:p-8">
              <p className="text-stone-700 leading-relaxed">
                סוף סוף אנחנו נפתחים אל העולם, הדרך שלנו לבית שלך היתה ארוכה, אז אשמח למעט סבלנות בזמן שאנחנו מתרעננים
              </p>

              <hr className="doc-care-divider" />
              <div className="flex gap-4">
                <span className="doc-care-tip-icon" aria-hidden>〰️</span>
                <div>
                  <p className="font-bold text-stone-900">כן, זה הריח של שטיח חדש...</p>
                  <p className="mt-1 text-stone-600 text-sm leading-relaxed">
                    הריח נובע בעיקר מהחוטים שלי שהתהדקו כל כך חזק במהלך המשלוח. תנו לי קצת זמן באוויר הפתוח ובקרוב הריח יעלם לחלוטין.
                  </p>
                </div>
              </div>

              <hr className="doc-care-divider" />
              <div className="flex gap-4">
                <span className="doc-care-tip-icon" aria-hidden>↕️</span>
                <div>
                  <p className="font-bold text-stone-900">גם אתה תהיה קצת מקומט...</p>
                  <p className="mt-1 text-stone-600 text-sm leading-relaxed">
                    אם תהיה מגולגל, ארוז ותישלח מסביב לעולם. זה הזמן שלי להימתח ולהירגע. מבטיח שבתוך זמן קצר אהיה מושלם לתמונה!
                  </p>
                </div>
              </div>

              <hr className="doc-care-divider" />
              <div className="flex gap-4">
                <span className="doc-care-tip-icon" aria-hidden>☀️</span>
                <div>
                  <p className="font-bold text-stone-900">הצבעים וההצללות שלי יכולים להיות בהירים או כהים יותר...</p>
                  <p className="mt-1 text-stone-600 text-sm leading-relaxed">
                    תלוי בחשיפה שלי לאור יום ולתאורת החדר. נסו לסובב אותי כדי להוציא את המראה הכי טוב שלי בחלל.
                  </p>
                </div>
              </div>

              <hr className="doc-care-divider" />
              <div className="flex gap-4">
                <span className="doc-care-tip-icon" aria-hidden>💤</span>
                <div>
                  <p className="font-bold text-stone-900">תן לי רגע להתעורר...</p>
                  <p className="mt-1 text-stone-600 text-sm leading-relaxed">
                    גם אני הייתי דחוס בשק, מגולגל ומכווץ – עכשיו זה הזמן שלי לתפוס צורה! תנער אותי, תטפח בעדינות, תעזור לי להתמתח – ותוך זמן קצר, אהיה בדיוק כמו שתכננת. רק תזכור – פופים, בדיוק כמו אנשים, צריכים רגע להתאפס 😉
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="doc-red-side" aria-hidden />
      </div>
    </div>
  );
}

import Link from "next/link";
import { BRAND_LINKS } from "@/config/links";
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
            {/* Brand header */}
            <header className="text-center pb-6 border-b border-stone-200">
              <p className="doc-brand-main">
                <span className="hom">HōM</span> GROUP
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-4 md:gap-6 text-sm font-medium text-stone-700">
                <span>ELITE RUGS</span>
                <span>השטיח האדום</span>
                <span>Pozitive HōM</span>
                <span>HōM BUSINESS</span>
              </div>
            </header>

            {/* Document title */}
            <div className="text-center py-6">
              <h1 className="doc-title-main">מסמך דיגיטלי</h1>
              <p className="mt-2 text-base text-stone-800">
                {docType} {payload.InvoiceNumber ?? ""}
              </p>
            </div>

            {/* Hero image */}
            <div className="w-full aspect-[2/1] max-h-72 bg-stone-200 rounded-lg overflow-hidden mb-8" />

            {/* Meta: Branch, Date, Sales rep - two columns RTL style */}
            <div className="grid grid-cols-2 gap-y-4 mb-8 text-base">
              <div className="text-left text-stone-500">סניף</div>
              <div className="text-right font-medium text-stone-900">{branchName}</div>
              <div className="text-left text-stone-500">תאריך</div>
              <div className="text-right font-medium text-stone-900">{payload.PrintDate ?? ""}</div>
              <div className="text-left text-stone-500">נציג מכירות</div>
              <div className="text-right font-medium text-stone-900">{payload.SalesRepresentative ?? ""}</div>
            </div>

            {/* Items table */}
            <div className="overflow-x-auto -mx-6 md:-mx-10">
              <table className="w-full border-collapse text-base">
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

            {/* Summary rows: label (red) | value (dark grey) - RTL so value on left, label on right */}
            <div className="mt-4 overflow-hidden rounded-lg">
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

            {/* Download original */}
            <div className="mt-6">
              <Link
                href={`/documents/${documentId}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline font-medium"
              >
                להורדת מסמך המקור
              </Link>
            </div>

            {/* Thank you + feedback */}
            <div className="mt-10 pt-8 border-t border-stone-200">
              <h2 className="text-xl md:text-2xl font-bold text-[#a61a21]">תודה שבחרתם בנו!</h2>
              <p className="mt-2 text-lg font-bold text-stone-900">איזה כיף!</p>
              <p className="mt-4 text-stone-700 leading-relaxed">
                מקווים שניהנת מהשירות של {payload.SalesRepresentative ?? ""}
                {branchName && ` בסניף ${branchName}`}, לחצו על הלינק ותחממו לנו את הלב.
              </p>
              <div className="flex flex-col items-center mt-6">
                <div className="w-16 h-16 rounded-full bg-stone-300 flex items-center justify-center" aria-hidden />
                {payload.BranchFeedbackUrl && (
                  <a
                    href={payload.BranchFeedbackUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block rounded-lg bg-[#a61a21] px-6 py-3 text-white font-semibold"
                  >
                    {branchName || "משוב"}
                  </a>
                )}
              </div>
            </div>

            {/* Newsletter */}
            <div className="mt-12 pt-8 border-t border-stone-200">
              <h2 className="text-xl md:text-2xl font-bold text-stone-900">דברים טובים בדרך אליך ❤️</h2>
              <p className="mt-3 text-stone-700 leading-relaxed">
                רוצים לדעת לפני כולם על הטרנדים החמים מעולם העיצוב? מבצעים בלעדיים והצצה לפרוייקטים מסקרנים?
              </p>
              <p className="mt-2 text-base font-bold text-[#a61a21]">זה הזמן להצטרף לניוזלטר שלנו</p>
              <NewsletterForm documentId={documentId} branchName={branchName} />
            </div>

            {/* Care guide link */}
            <div className="mt-10 pt-6 border-t border-b-2 border-[#a61a21]">
              <a
                href={BRAND_LINKS.careGuideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-bold text-stone-900 block"
              >
                המדריך המלא לטיפול ושמירה על שטיח &lt;&lt;
              </a>
            </div>

            {/* Footer: brands + social (black circles, white icons) */}
            <footer className="mt-10 pt-8">
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

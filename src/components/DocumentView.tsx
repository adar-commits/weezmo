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
    <div className="mx-auto max-w-2xl bg-white shadow-sm">
      {/* Green top stripe */}
      <div className="h-1 bg-emerald-600" />
      <div className="flex">
        {/* Red left border */}
        <div className="w-2 bg-red-700" />
        <div className="flex-1">
          {/* Header logos - text placeholders */}
          <header className="border-b border-stone-200 px-6 py-4 text-center">
            <p className="text-lg font-bold text-stone-800">HōM GROUP</p>
            <div className="mt-1 flex flex-wrap justify-center gap-3 text-xs text-stone-500">
              <span>ELITE RUGS</span>
              <span>השטיח האדום</span>
              <span>Pozitive HōM</span>
              <span>HōM BUSINESS</span>
            </div>
          </header>

          {/* Document title */}
          <div className="border-b border-stone-200 px-6 py-3">
            <h1 className="text-xl font-bold text-red-700">מסמך דיגיטלי</h1>
            <p className="mt-0.5 text-sm text-stone-600">
              {docType} {payload.InvoiceNumber ?? ""}
            </p>
          </div>

          {/* Hero image - static placeholder (add /public/images/hero-default.jpg for custom image) */}
          <div className="relative h-48 w-full bg-stone-300 bg-gradient-to-b from-stone-300 to-stone-400" />

          {/* Meta: Branch, Date, Sales rep */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-6 py-4 text-sm">
            <div className="text-left text-stone-500">סניף</div>
            <div className="text-right">{branchName}</div>
            <div className="text-left text-stone-500">תאריך</div>
            <div className="text-right">{payload.PrintDate ?? ""}</div>
            <div className="text-left text-stone-500">נציג מכירות</div>
            <div className="text-right">{payload.SalesRepresentative ?? ""}</div>
          </div>

          {/* Items table */}
          <div className="overflow-x-auto px-6">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-stone-300 bg-stone-50">
                  <th className="py-2 pr-2 text-right">תיאור מוצר</th>
                  <th className="w-14 py-2 text-center">כמות</th>
                  <th className="w-24 py-2 text-left">סכום</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-stone-200">
                    <td className="py-2 pr-2 text-right">{item.ItemDescription ?? ""}</td>
                    <td className="py-2 text-center">{item.ItemQTY ?? 0}</td>
                    <td className="py-2 text-left">{formatPrice((item.ItemPrice ?? 0) * (item.ItemQTY ?? 0))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-2 px-6">
            <div className="bg-stone-700 text-red-400">
              <div className="flex justify-between px-4 py-2 text-sm">
                <span>חייב מע״מ 18%</span>
                <span>{formatPrice(vat)}</span>
              </div>
              {discount !== 0 && (
                <div className="flex justify-between px-4 py-1 text-sm">
                  <span>הנחה</span>
                  <span>{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between px-4 py-2 text-sm font-medium">
                <span>סהכ קנייה</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Download original */}
          <div className="px-6 py-3">
            <Link
              href={`/documents/${documentId}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              להורדת מסמך המקור
            </Link>
          </div>

          {/* Thank you + feedback */}
          <div className="border-t border-stone-200 bg-stone-50 px-6 py-6">
            <h2 className="text-lg font-bold text-red-700">תודה שבחרתם בנו!</h2>
            <p className="mt-1 text-sm text-stone-700">איזה כיף!</p>
            {payload.SalesRepresentative && (
              <p className="mt-2 text-sm text-stone-600">
                מקווים שניהנת מהשירות של {payload.SalesRepresentative}
                {branchName && ` בסניף ${branchName}`}.
              </p>
            )}
            <p className="mt-1 text-sm text-stone-600">לחצו על הלינק ותחממו לנו את הלב.</p>
            {payload.BranchFeedbackUrl && (
              <a
                href={payload.BranchFeedbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block rounded bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                {branchName || "משוב"}
              </a>
            )}
          </div>

          {/* Newsletter */}
          <div className="border-t border-stone-200 px-6 py-6">
            <h2 className="text-lg font-bold text-red-700">דברים טובים בדרך אליך ❤️</h2>
            <p className="mt-2 text-sm text-stone-600">
              רוצים לדעת לפני כולם על הטרנדים החמים מעולם העיצוב? מבצעים בלעדיים והצצה לפרוייקטים מסקרנים?
            </p>
            <p className="mt-1 text-sm font-medium text-red-700">זה הזמן להצטרף לניוזלטר שלנו</p>
            <NewsletterForm documentId={documentId} branchName={branchName} />
          </div>

          {/* Care guide link */}
          <div className="border-y border-amber-800/30 bg-amber-50/50 px-6 py-3">
            <a
              href={BRAND_LINKS.careGuideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-red-700"
            >
              המדריך המלא לטיפול ושמירה על שטיח &lt;&lt;
            </a>
          </div>

          {/* Footer: brands + social */}
          <footer className="bg-white px-6 py-6">
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="font-semibold text-stone-800">השטיח האדום</p>
                <div className="mt-2 flex gap-2">
                  <a href={BRAND_LINKS.carpet.facebook} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-stone-700" aria-label="Facebook">f</a>
                  <a href={BRAND_LINKS.carpet.whatsapp} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-stone-700" aria-label="WhatsApp">WA</a>
                  <a href={BRAND_LINKS.carpet.website} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-stone-700" aria-label="Website">🌐</a>
                  <a href={BRAND_LINKS.carpet.instagram} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-stone-700" aria-label="Instagram">IG</a>
                  <a href={BRAND_LINKS.carpet.youtube} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-stone-700" aria-label="YouTube">YT</a>
                </div>
              </div>
              <div>
                <p className="font-semibold text-stone-800">פוזיטיב</p>
                <div className="mt-2 flex gap-2">
                  <a href={BRAND_LINKS.pozitive.facebook} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-stone-700" aria-label="Facebook">f</a>
                  <a href={BRAND_LINKS.pozitive.whatsapp} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-stone-700" aria-label="WhatsApp">WA</a>
                  <a href={BRAND_LINKS.pozitive.website} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-stone-700" aria-label="Website">🌐</a>
                  <a href={BRAND_LINKS.pozitive.instagram} target="_blank" rel="noopener noreferrer" className="text-stone-500 hover:text-stone-700" aria-label="Instagram">IG</a>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-stone-500">
              אנחנו שמחים שהמוצרים שלנו הפכו לחלק מהעיצוב שלך. כל פריט אצלנו נבחר ומיוצר בקפידה, מתוך תשוקה לעיצוב, איכות ואהבה לפרטים הקטנים. נשמח לראות איך בחרת לשלב אותם אצלך בבית! צלמו, שתפו, ותייגו אותנו ב #carpet_shop או #pozitiebeanbags
            </p>
          </footer>

          {/* Care tips - red background block */}
          <div className="bg-red-800 px-6 py-6 text-white">
            <p className="text-sm font-medium">סוף סוף אנחנו נפתחים אל העולם, הדרך שלנו לבית שלך היתה ארוכה, אז אשמח למעט סבלנות בזמן שאנחנו מתרעננים</p>
            <div className="mt-4 space-y-3 text-sm">
              <p><strong>כן, זה הריח של שטיח חדש...</strong> הריח נובע בעיקר מהחוטים שלי שהתהדקו כל כך חזק במהלך המשלוח. תנו לי קצת זמן באוויר הפתוח ובקרוב הריח יעלם לחלוטין.</p>
              <p><strong>גם אתה תהיה קצת מקומט...</strong> אם תהיה מגולגל, ארוז ותישלח מסביב לעולם. זה הזמן שלי להימתח ולהירגע. מבטיח שבתוך זמן קצר אהיה מושלם לתמונה!</p>
              <p><strong>הצבעים וההצללות שלי יכולים להיות בהירים או כהים יותר...</strong> תלוי בחשיפה שלי לאור יום ולתאורת החדר. נסו לסובב אותי כדי להוציא את המראה הכי טוב שלי בחלל.</p>
              <p><strong>תן לי רגע להתעורר...</strong> גם אני הייתי דחוס בשק, מגולגל ומכווץ – עכשיו זה הזמן שלי לתפוס צורה! תנער אותי, תטפח בעדינות, תעזור לי להתמתח – ותוך זמן קצר, אהיה בדיוק כמו שתכננת. רק תזכור – פופים, בדיוק כמו אנשים, צריכים רגע להתאפס 😉</p>
            </div>
          </div>
        </div>
        {/* Red right border */}
        <div className="w-2 bg-red-700" />
      </div>
    </div>
  );
}

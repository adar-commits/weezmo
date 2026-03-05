import Link from "next/link";
import { BRAND_LINKS } from "@/config/links";
import { NewsletterForm } from "./NewsletterForm";

const ASSETS = {
  banner: "https://receipts.carpetshop.co.il/img/banner1.jpg",
  logo: "https://receipts.carpetshop.co.il/img/img.png",
  avatar: "https://receipts.carpetshop.co.il/img/avatar.svg",
};

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
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-xl bg-white shadow-sm sm:shadow-md sm:rounded-lg sm:my-6 overflow-hidden">
        {/* Header: logo + document title */}
        <header className="px-5 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-6 border-b border-slate-100">
          <img
            src={ASSETS.logo}
            alt="לוגו השטיח האדום"
            className="mx-auto h-11 w-auto object-contain"
          />
          <div className="mt-5 text-center">
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">מסמך דיגיטלי</h1>
            <p className="mt-1 text-sm text-slate-600">
              {docType} {payload.InvoiceNumber ?? ""}
            </p>
          </div>
        </header>

        {/* Banner */}
        <div className="relative w-full aspect-[2/1] max-h-56 sm:max-h-64 bg-slate-200">
          <img
            src={ASSETS.banner}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        {/* Meta: branch, date, sales rep */}
        <section className="px-5 py-5 sm:px-8 sm:py-6">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <dt className="text-slate-500">סניף</dt>
            <dd className="text-right font-medium text-slate-800">{branchName}</dd>
            <dt className="text-slate-500">תאריך</dt>
            <dd className="text-right font-medium text-slate-800">{payload.PrintDate ?? ""}</dd>
            <dt className="text-slate-500">נציג מכירות</dt>
            <dd className="text-right font-medium text-slate-800">{payload.SalesRepresentative ?? ""}</dd>
          </dl>
        </section>

        {/* Product table */}
        <section className="px-5 sm:px-8">
          <div className="overflow-x-auto -mx-5 sm:-mx-8">
            <table className="w-full min-w-[280px] text-sm">
              <thead>
                <tr className="border-b-2 border-slate-200">
                  <th className="py-3 pr-3 text-right font-semibold text-slate-700">תיאור מוצר</th>
                  <th className="w-14 py-3 text-center font-semibold text-slate-700">כמות</th>
                  <th className="w-24 py-3 text-left font-semibold text-slate-700">סכום</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-3 pr-3 text-right text-slate-800">{item.ItemDescription ?? ""}</td>
                    <td className="py-3 text-center text-slate-800">{item.ItemQTY ?? 0}</td>
                    <td className="py-3 text-left text-slate-800">
                      {formatPrice((item.ItemPrice ?? 0) * (item.ItemQTY ?? 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Summary: VAT, discount, total */}
        <section className="px-5 py-4 sm:px-8">
          <div className="rounded-lg overflow-hidden border border-slate-200">
            <div className="grid grid-cols-2 bg-slate-700 text-white">
              <div className="py-3 pl-4 text-left text-sm">{formatPrice(vat)}</div>
              <div className="py-3 pr-4 text-right text-sm font-medium">חייב מע״מ 18%</div>
            </div>
            {discount !== 0 && (
              <div className="grid grid-cols-2 bg-slate-600 text-white">
                <div className="py-2 pl-4 text-left text-sm">{formatPrice(discount)}</div>
                <div className="py-2 pr-4 text-right text-sm font-medium">הנחה</div>
              </div>
            )}
            <div className="grid grid-cols-2 bg-slate-800 text-white">
              <div className="py-3 pl-4 text-left text-sm font-semibold">{formatPrice(totalPrice)}</div>
              <div className="py-3 pr-4 text-right text-sm font-semibold">סהכ קנייה</div>
            </div>
          </div>
        </section>

        {/* Download link */}
        <section className="px-5 pb-5 sm:px-8 sm:pb-6">
          <Link
            href={`/documents/${documentId}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm font-medium underline underline-offset-2 hover:text-blue-700"
          >
            להורדת מסמך המקור
          </Link>
        </section>

        {/* Thank you + feedback */}
        <section className="px-5 py-6 sm:px-8 sm:py-8 bg-slate-50/80 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 sm:text-xl">תודה שבחרתם בנו!</h2>
          <p className="mt-1 font-semibold text-slate-700">איזה כיף!</p>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            מקווים שניהנת מהשירות של {payload.SalesRepresentative ?? ""}
            {branchName && ` נשמח לשמוע על חווית הקניה שלך בסניף ${branchName},`} לחצו על הלינק ותחממו לנו את הלב.
          </p>
          <div className="mt-6 flex flex-col items-center gap-4">
            <img src={ASSETS.avatar} alt="" className="h-14 w-14 object-contain" />
            {payload.BranchFeedbackUrl && (
              <a
                href={payload.BranchFeedbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition-colors"
              >
                {branchName || "משוב"}
              </a>
            )}
          </div>
        </section>

        {/* Newsletter */}
        <section className="px-5 py-6 sm:px-8 sm:py-8 border-t border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 sm:text-xl">דברים טובים בדרך אליך ❤️</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            רוצים לדעת לפני כולם על הטרנדים החמים מעולם העיצוב? מבצעים בלעדיים והצצה לפרוייקטים מסקרנים?
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-700">זה הזמן להצטרף לניוזלטר שלנו</p>
          <NewsletterForm documentId={documentId} branchName={branchName} />
        </section>

        {/* Care guide link */}
        <section className="px-5 py-4 sm:px-8 border-t border-slate-100">
          <a
            href={BRAND_LINKS.careGuideUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-slate-700 hover:text-slate-900 underline underline-offset-2"
          >
            המדריך המלא לטיפול ושמירה על שטיח &lt;&lt;
          </a>
        </section>

        {/* Footer: brands + social */}
        <footer className="px-5 py-6 sm:px-8 sm:py-8 border-t border-slate-100 bg-white">
          <div className="flex flex-wrap gap-8 sm:gap-10">
            <div>
              <p className="text-sm font-bold text-slate-800">השטיח האדום</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a href={BRAND_LINKS.carpet.facebook} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white text-xs font-medium hover:bg-slate-700 transition-colors" aria-label="Facebook">f</a>
                <a href={BRAND_LINKS.carpet.whatsapp} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white text-xs hover:bg-slate-700 transition-colors" aria-label="WhatsApp">WA</a>
                <a href={BRAND_LINKS.carpet.website} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white text-xs hover:bg-slate-700 transition-colors" aria-label="Website">🌐</a>
                <a href={BRAND_LINKS.carpet.instagram} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white text-xs hover:bg-slate-700 transition-colors" aria-label="Instagram">IG</a>
                <a href={BRAND_LINKS.carpet.youtube} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white text-xs hover:bg-slate-700 transition-colors" aria-label="YouTube">YT</a>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">פוזיטיב</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a href={BRAND_LINKS.pozitive.facebook} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white text-xs hover:bg-slate-700 transition-colors" aria-label="Facebook">f</a>
                <a href={BRAND_LINKS.pozitive.whatsapp} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white text-xs hover:bg-slate-700 transition-colors" aria-label="WhatsApp">WA</a>
                <a href={BRAND_LINKS.pozitive.website} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white text-xs hover:bg-slate-700 transition-colors" aria-label="Website">🌐</a>
                <a href={BRAND_LINKS.pozitive.instagram} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white text-xs hover:bg-slate-700 transition-colors" aria-label="Instagram">IG</a>
              </div>
            </div>
          </div>
          <p className="mt-5 text-sm text-slate-600 leading-relaxed max-w-prose">
            אנחנו שמחים שהמוצרים שלנו הפכו לחלק מהעיצוב שלך. כל פריט אצלנו נבחר ומיוצר בקפידה, מתוך תשוקה לעיצוב, איכות ואהבה לפרטים הקטנים. נשמח לראות איך בחרת לשלב אותם אצלך בבית! צלמו, שתפו, ותייגו אותנו ב #carpet_shop או #pozitiebeanbags
          </p>
        </footer>

        {/* Care tips */}
        <section className="bg-slate-800 px-5 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-2xl rounded-xl bg-white p-5 shadow-lg sm:p-6">
            <p className="text-sm text-slate-600 leading-relaxed">
              סוף סוף אנחנו נפתחים אל העולם, הדרך שלנו לבית שלך היתה ארוכה, אז אשמח למעט סבלנות בזמן שאנחנו מתרעננים
            </p>
            <hr className="my-5 border-slate-200" />
            {[
              {
                title: "כן, זה הריח של שטיח חדש...",
                body: "הריח נובע בעיקר מהחוטים שלי שהתהדקו כל כך חזק במהלך המשלוח. תנו לי קצת זמן באוויר הפתוח ובקרוב הריח יעלם לחלוטין.",
              },
              {
                title: "גם אתה תהיה קצת מקומט...",
                body: "אם תהיה מגולגל, ארוז ותישלח מסביב לעולם. זה הזמן שלי להימתח ולהירגע. מבטיח שבתוך זמן קצר אהיה מושלם לתמונה!",
              },
              {
                title: "הצבעים וההצללות שלי יכולים להיות בהירים או כהים יותר...",
                body: "תלוי בחשיפה שלי לאור יום ולתאורת החדר. נסו לסובב אותי כדי להוציא את המראה הכי טוב שלי בחלל.",
              },
              {
                title: "תן לי רגע להתעורר...",
                body: "גם אני הייתי דחוס בשק, מגולגל ומכווץ – עכשיו זה הזמן שלי לתפוס צורה! תנער אותי, תטפח בעדינות, תעזור לי להתמתח – ותוך זמן קצר, אהיה בדיוק כמו שתכננת. רק תזכור – פופים, בדיוק כמו אנשים, צריכים רגע להתאפס 😉",
              },
            ].map((tip, i) => (
              <div key={i}>
                <p className="text-sm font-semibold text-slate-800">{tip.title}</p>
                <p className="mt-1 text-sm text-slate-600 leading-relaxed">{tip.body}</p>
                {i < 3 && <hr className="my-5 border-slate-200" />}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BRAND_LINKS } from "@/config/links";
import { NewsletterForm } from "./NewsletterForm";
import { DeliveryTimeline } from "./DeliveryTimeline";
import { ReceiptCard } from "./ReceiptCard";

// Use absolute production URLs so assets never break (per UX brief / Creative Freedom)
const ASSETS = {
  banner: "https://receipts.carpetshop.co.il/img/banner1.jpg",
  logo: "https://receipts.carpetshop.co.il/img/img.png",
  avatar: "https://receipts.carpetshop.co.il/img/avatar.svg",
};
const SOCIAL_ICONS = {
  web: "/images/web.svg",
  facebook: "/images/facebook.svg",
  instagram: "/images/instagram.svg",
  youtube: "/images/youtube.svg",
  whatsapp: "/images/whatsapp.svg",
};

const btnPrimary =
  "rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a61a21] active:scale-[0.98] bg-[#a61a21] hover:bg-[#8a161c]";

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
  const customerName = payload.CustomerName ?? "";

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-xl overflow-hidden bg-white shadow-sm sm:my-8 sm:rounded-2xl sm:shadow-md">
        {/* Celebration Header – premium, unboxing vibe */}
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="px-6 pt-10 pb-8 text-center sm:px-10 sm:pt-14 sm:pb-12"
        >
          <img
            src={ASSETS.logo}
            alt="לוגו השטיח האדום"
            className="mx-auto h-10 w-auto object-contain sm:h-12"
          />
          <div className="mt-8 sm:mt-12">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              תודה שבחרתם בנו
            </h1>
            {customerName && (
              <p className="mt-2 text-lg text-slate-600 sm:text-xl">{customerName} יקר/ה,</p>
            )}
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
              ההזמנה שלכם התקבלה. אנחנו מתחילים להכין אותה בקפידה — ומחכים לכם על השטיח האדום.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {docType} {payload.InvoiceNumber ?? ""}
            </p>
          </div>
        </motion.header>

        {/* Banner – editorial */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative w-full aspect-[2/1] max-h-52 bg-slate-200 sm:max-h-64"
        >
          <img
            src={ASSETS.banner}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </motion.div>

        {/* Meta card – branch, date, rep (4px grid: p-4 = 16px) */}
        <section className="px-4 pt-6 sm:px-8 sm:pt-8">
          <ReceiptCard index={0}>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              <dt className="text-slate-500">סניף</dt>
              <dd className="text-right font-medium text-slate-800">{branchName}</dd>
              <dt className="text-slate-500">תאריך</dt>
              <dd className="text-right font-medium text-slate-800">{payload.PrintDate ?? ""}</dd>
              <dt className="text-slate-500">נציג מכירות</dt>
              <dd className="text-right font-medium text-slate-800">{payload.SalesRepresentative ?? ""}</dd>
            </dl>
          </ReceiptCard>
        </section>

        {/* Order summary – card-based list (not table) */}
        <section className="px-4 py-4 sm:px-8 sm:py-6">
          <h2 className="mb-4 text-base font-semibold text-slate-800 sm:text-lg">פירוט ההזמנה</h2>
          <div className="space-y-3">
            {items.map((item, i) => (
              <ReceiptCard key={i} index={i + 1}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-right text-sm font-medium text-slate-800 sm:text-base">
                    {item.ItemDescription ?? ""}
                  </p>
                  <p className="text-left text-sm font-semibold text-slate-900">
                    {formatPrice((item.ItemPrice ?? 0) * (item.ItemQTY ?? 0))}
                  </p>
                </div>
                <div className="mt-2 flex justify-between text-xs text-slate-500">
                  <span>כמות: {item.ItemQTY ?? 0}</span>
                  {item.ItemSKU && <span>{item.ItemSKU}</span>}
                </div>
              </ReceiptCard>
            ))}
          </div>
        </section>

        {/* Totals card */}
        <section className="px-4 pb-4 sm:px-8 sm:pb-6">
          <ReceiptCard index={items.length + 2}>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">חייב מע״מ 18%</span>
                <span className="font-medium text-slate-800">{formatPrice(vat)}</span>
              </div>
              {discount !== 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">הנחה</span>
                  <span className="font-medium text-slate-800">{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-semibold text-slate-900">
                <span>סהכ קנייה</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </ReceiptCard>
        </section>

        {/* Download PDF CTA */}
        <section className="px-4 pb-6 sm:px-8 sm:pb-8">
          <Link
            href={`/documents/${documentId}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center ${btnPrimary}`}
          >
            להורדת מסמך המקור (PDF)
          </Link>
        </section>

        {/* Delivery timeline */}
        <section className="px-4 pb-6 sm:px-8 sm:pb-8">
          <DeliveryTimeline />
        </section>

        {/* Care & Love card */}
        <section className="px-4 pb-6 sm:px-8 sm:pb-8">
          <ReceiptCard index={0}>
            <h3 className="text-base font-semibold text-slate-800">טיפול ואהבה</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              איך לשמור על השטיח שלכם כמו חדש? המדריך המלא לטיפול ושמירה.
            </p>
            <a
              href={BRAND_LINKS.careGuideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center rounded-lg border-2 border-slate-800 bg-transparent px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 active:scale-[0.98]"
            >
              המדריך המלא לטיפול ושמירה על שטיח
            </a>
          </ReceiptCard>
        </section>

        {/* Personalized upsell – subtle */}
        <section className="px-4 pb-6 sm:px-8 sm:pb-8">
          <ReceiptCard index={0}>
            <h3 className="text-base font-semibold text-slate-800">אולי תאהבו גם</h3>
            <p className="mt-1 text-sm text-slate-600">
              מגוון שטיחים ואביזרים שישתלבו עם ההזמנה שלכם.
            </p>
            <a
              href={BRAND_LINKS.carpet.website}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-medium text-[#a61a21] underline underline-offset-2 hover:text-[#8a161c] focus:outline-none focus:ring-2 focus:ring-[#a61a21]/30 focus:ring-offset-2 rounded"
            >
              לגלות עוד באתר
            </a>
          </ReceiptCard>
        </section>

        {/* Share your style / Review */}
        <section className="px-4 pb-6 sm:px-8 sm:pb-8">
          <ReceiptCard index={0}>
            <h3 className="text-base font-semibold text-slate-800">תהיו הראשונים לשתף את המראה החדש</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              צלמו את השטיח chez vous, שתפו ותייגו אותנו — נשמח לראות איך נכנס אליכם הביתה.
            </p>
            <a
              href={BRAND_LINKS.reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-4 inline-flex items-center ${btnPrimary}`}
            >
              שתפו את הסגנון שלכם
            </a>
          </ReceiptCard>
        </section>

        {/* AR reminder */}
        <section className="px-4 pb-6 sm:px-8 sm:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-center sm:p-6"
          >
            <p className="text-sm font-medium text-slate-700">
              עדיין מתלבטים איפה לשים? נסו את כלי ה-AR שלנו
            </p>
            <a
              href={BRAND_LINKS.arToolUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition-colors hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 active:scale-[0.98]"
            >
              להשתמש בכלי AR
            </a>
          </motion.div>
        </section>

        {/* Thank you + feedback */}
        <section className="border-t border-slate-100 bg-slate-50/60 px-4 py-8 sm:px-8 sm:py-10">
          <h2 className="text-lg font-bold text-slate-800 sm:text-xl">איזה כיף!</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
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
                className={`inline-flex items-center justify-center shadow-sm ${btnPrimary}`}
              >
                {branchName || "משוב"}
              </a>
            )}
          </div>
        </section>

        {/* Newsletter */}
        <section className="border-t border-slate-100 px-4 py-8 sm:px-8 sm:py-10">
          <h2 className="text-lg font-bold text-slate-800 sm:text-xl">דברים טובים בדרך אליך ❤️</h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            רוצים לדעת לפני כולם על הטרנדים החמים מעולם העיצוב? מבצעים בלעדיים והצצה לפרויקטים מסקרנים?
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-700">זה הזמן להצטרף לניוזלטר שלנו</p>
          <NewsletterForm documentId={documentId} branchName={branchName} />
        </section>

        {/* Footer: brands + social */}
        <footer className="border-t border-slate-100 bg-white px-4 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-wrap gap-8 sm:gap-10">
            <div>
              <p className="text-sm font-bold text-slate-800">השטיח האדום</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a href={BRAND_LINKS.carpet.facebook} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" aria-label="Facebook">
                  <img src={SOCIAL_ICONS.facebook} alt="" className="h-4 w-4" />
                </a>
                <a href={BRAND_LINKS.carpet.whatsapp} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" aria-label="WhatsApp">
                  <img src={SOCIAL_ICONS.whatsapp} alt="" className="h-4 w-4" />
                </a>
                <a href={BRAND_LINKS.carpet.website} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" aria-label="Website">
                  <img src={SOCIAL_ICONS.web} alt="" className="h-4 w-4" />
                </a>
                <a href={BRAND_LINKS.carpet.instagram} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" aria-label="Instagram">
                  <img src={SOCIAL_ICONS.instagram} alt="" className="h-4 w-4" />
                </a>
                <a href={BRAND_LINKS.carpet.youtube} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" aria-label="YouTube">
                  <img src={SOCIAL_ICONS.youtube} alt="" className="h-4 w-4" />
                </a>
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">פוזיטיב</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <a href={BRAND_LINKS.pozitive.facebook} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" aria-label="Facebook">
                  <img src={SOCIAL_ICONS.facebook} alt="" className="h-4 w-4" />
                </a>
                <a href={BRAND_LINKS.pozitive.whatsapp} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" aria-label="WhatsApp">
                  <img src={SOCIAL_ICONS.whatsapp} alt="" className="h-4 w-4" />
                </a>
                <a href={BRAND_LINKS.pozitive.website} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" aria-label="Website">
                  <img src={SOCIAL_ICONS.web} alt="" className="h-4 w-4" />
                </a>
                <a href={BRAND_LINKS.pozitive.instagram} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-white transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2" aria-label="Instagram">
                  <img src={SOCIAL_ICONS.instagram} alt="" className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm text-slate-600 leading-relaxed max-w-prose">
            אנחנו שמחים שהמוצרים שלנו הפכו לחלק מהעיצוב שלך. כל פריט אצלנו נבחר ומיוצר בקפידה, מתוך תשוקה לעיצוב, איכות ואהבה לפרטים הקטנים. נשמח לראות איך בחרת לשלב אותם אצלך בבית! צלמו, שתפו, ותייגו אותנו ב #carpet_shop או #pozitiebeanbags
          </p>
        </footer>

        {/* Care tips – dark band */}
        <section className="bg-slate-800 px-4 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-2xl rounded-xl bg-white p-5 shadow-lg sm:p-6">
            <p className="text-sm text-slate-600 leading-relaxed">
              סוף סוף אנחנו נפתחים אל העולם. הדרך שלנו לבית שלך הייתה ארוכה — אשמח למעט סבלנות בזמן שאנחנו מתרעננים.
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

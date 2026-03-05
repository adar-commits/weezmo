"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BRAND_LINKS } from "@/config/links";
import { NewsletterForm } from "./NewsletterForm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

const DELIVERY_STEPS = [
  { key: "placed", label: "ההזמנה נרשמה" },
  { key: "prepared", label: "מוכן על ידי האומנים" },
  { key: "shipping", label: "על השטיח האדום (משלוח)" },
  { key: "arrival", label: "הגעה" },
] as const;

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

const cardMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

export function DocumentView({ documentId, payload }: DocumentViewProps) {
  const items = payload.Items ?? [];
  const totalPrice = payload.TotalPrice ?? 0;
  const vat = payload.VAT ?? 0;
  const discount = payload.discount ?? 0;
  const docType = payload.type ?? "מסמך דיגיטלי";
  const branchName = payload.BranchName ?? payload.BranchID ?? "";
  const customerName = payload.CustomerName ?? "";

  return (
    <div className="min-h-screen bg-muted/40">
      <main className="mx-auto max-w-xl overflow-hidden bg-background shadow-sm sm:my-8 sm:rounded-2xl sm:shadow-md">
        {/* Celebration Header */}
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
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div className="mt-8 sm:mt-12">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              תודה שבחרתם בנו
            </h1>
            {customerName && (
              <p className="mt-2 text-lg text-muted-foreground sm:text-xl">{customerName} יקר/ה,</p>
            )}
            <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              ההזמנה שלכם התקבלה. אנחנו מתחילים להכין אותה בקפידה — ומחכים לכם על השטיח האדום.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {docType} {payload.InvoiceNumber ?? ""}
            </p>
          </div>
        </motion.header>

        {/* Banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative w-full aspect-[2/1] max-h-52 bg-muted sm:max-h-64"
        >
          <img
            src={ASSETS.banner}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        </motion.div>

        {/* Meta card */}
        <section className="px-4 pt-6 sm:px-8 sm:pt-8">
          <motion.div {...cardMotion}>
            <Card>
              <CardContent className="pt-6">
                <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                  <dt className="text-muted-foreground">סניף</dt>
                  <dd className="text-right font-medium">{branchName}</dd>
                  <dt className="text-muted-foreground">תאריך</dt>
                  <dd className="text-right font-medium">{payload.PrintDate ?? ""}</dd>
                  <dt className="text-muted-foreground">נציג מכירות</dt>
                  <dd className="text-right font-medium">{payload.SalesRepresentative ?? ""}</dd>
                </dl>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Order summary */}
        <section className="px-4 py-4 sm:px-8 sm:py-6">
          <h2 className="mb-4 text-base font-semibold sm:text-lg">פירוט ההזמנה</h2>
          <div className="space-y-3">
            {items.map((item, i) => (
              <motion.div key={i} {...cardMotion} transition={{ ...cardMotion.transition, delay: i * 0.06 }}>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-right text-sm font-medium sm:text-base">
                        {item.ItemDescription ?? ""}
                      </p>
                      <p className="text-left text-sm font-semibold">
                        {formatPrice((item.ItemPrice ?? 0) * (item.ItemQTY ?? 0))}
                      </p>
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                      <span>כמות: {item.ItemQTY ?? 0}</span>
                      {item.ItemSKU && <span>{item.ItemSKU}</span>}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Totals */}
        <section className="px-4 pb-4 sm:px-8 sm:pb-6">
          <motion.div {...cardMotion}>
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">חייב מע״מ 18%</span>
                  <span className="font-medium">{formatPrice(vat)}</span>
                </div>
                {discount !== 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">הנחה</span>
                    <span className="font-medium">{formatPrice(discount)}</span>
                  </div>
                )}
                <Separator className="my-3" />
                <div className="flex justify-between text-base font-semibold">
                  <span>סהכ קנייה</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Download PDF */}
        <section className="px-4 pb-6 sm:px-8 sm:pb-8">
          <Button
            asChild
            className="bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white"
          >
            <Link href={`/documents/${documentId}/pdf`} target="_blank" rel="noopener noreferrer">
              להורדת מסמך המקור (PDF)
            </Link>
          </Button>
        </section>

        {/* Delivery timeline */}
        <section className="px-4 pb-6 sm:px-8 sm:pb-8">
          <motion.div {...cardMotion}>
            <Card>
              <CardHeader>
                <CardTitle>מה קורה עכשיו?</CardTitle>
                <CardDescription>הדרך מההזמנה עד אליכם הביתה</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-2">
                  {DELIVERY_STEPS.map((step, i) => (
                    <div key={step.key} className="flex flex-1 flex-col items-center">
                      <div className="flex w-full items-center">
                        {i > 0 && <div className="h-0.5 flex-1 bg-border" aria-hidden />}
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                            i === 0
                              ? "bg-[var(--brand)] text-white ring-2 ring-[var(--brand)]/20"
                              : "bg-muted text-muted-foreground"
                          )}
                          aria-current={i === 0 ? "step" : undefined}
                        >
                          {i + 1}
                        </div>
                        {i < DELIVERY_STEPS.length - 1 && (
                          <div className="h-0.5 flex-1 bg-border" aria-hidden />
                        )}
                      </div>
                      <p
                        className={cn(
                          "mt-2 text-center text-xs leading-tight",
                          i === 0 ? "font-medium" : "text-muted-foreground"
                        )}
                      >
                        {step.label}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Care & Love */}
        <section className="px-4 pb-6 sm:px-8 sm:pb-8">
          <motion.div {...cardMotion}>
            <Card>
              <CardHeader>
                <CardTitle>טיפול ואהבה</CardTitle>
                <CardDescription>
                  איך לשמור על השטיח שלכם כמו חדש? המדריך המלא לטיפול ושמירה.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="outline" asChild>
                  <a
                    href={BRAND_LINKS.careGuideUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    המדריך המלא לטיפול ושמירה על שטיח
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </section>

        {/* Upsell */}
        <section className="px-4 pb-6 sm:px-8 sm:pb-8">
          <motion.div {...cardMotion}>
            <Card>
              <CardHeader>
                <CardTitle>אולי תאהבו גם</CardTitle>
                <CardDescription>
                  מגוון שטיחים ואביזרים שישתלבו עם ההזמנה שלכם.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="link" className="text-[var(--brand)] px-0" asChild>
                  <a
                    href={BRAND_LINKS.carpet.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    לגלות עוד באתר
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </section>

        {/* Share */}
        <section className="px-4 pb-6 sm:px-8 sm:pb-8">
          <motion.div {...cardMotion}>
            <Card>
              <CardHeader>
                <CardTitle>תהיו הראשונים לשתף את המראה החדש</CardTitle>
                <CardDescription>
                  צלמו את השטיח chez vous, שתפו ותייגו אותנו — נשמח לראות איך נכנס אליכם הביתה.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button
                  className="bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white"
                  asChild
                >
                  <a
                    href={BRAND_LINKS.reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    שתפו את הסגנון שלכם
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </section>

        {/* AR */}
        <section className="px-4 pb-6 sm:px-8 sm:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Card className="border-dashed bg-muted/50">
              <CardContent className="pt-6 text-center">
                <p className="text-sm font-medium">
                  עדיין מתלבטים איפה לשים? נסו את כלי ה-AR שלנו
                </p>
                <Button variant="outline" size="sm" className="mt-3" asChild>
                  <a
                    href={BRAND_LINKS.arToolUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    להשתמש בכלי AR
                  </a>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        {/* Thank you + feedback */}
        <section className="border-t bg-muted/30 px-4 py-8 sm:px-8 sm:py-10">
          <h2 className="text-lg font-bold sm:text-xl">איזה כיף!</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            מקווים שניהנת מהשירות של {payload.SalesRepresentative ?? ""}
            {branchName && ` נשמח לשמוע על חווית הקניה שלך בסניף ${branchName},`} לחצו על הלינק ותחממו לנו את הלב.
          </p>
          <div className="mt-6 flex flex-col items-center gap-4">
            <img src={ASSETS.avatar} alt="" className="h-14 w-14 object-contain" />
            {payload.BranchFeedbackUrl && (
              <Button
                className="bg-[var(--brand)] hover:bg-[var(--brand-hover)] text-white"
                asChild
              >
                <a
                  href={payload.BranchFeedbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {branchName || "משוב"}
                </a>
              </Button>
            )}
          </div>
        </section>

        {/* Newsletter */}
        <section className="border-t px-4 py-8 sm:px-8 sm:py-10">
          <h2 className="text-lg font-bold sm:text-xl">דברים טובים בדרך אליך ❤️</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            רוצים לדעת לפני כולם על הטרנדים החמים מעולם העיצוב? מבצעים בלעדיים והצצה לפרויקטים מסקרנים?
          </p>
          <p className="mt-1 text-sm font-semibold">זה הזמן להצטרף לניוזלטר שלנו</p>
          <NewsletterForm documentId={documentId} branchName={branchName} />
        </section>

        {/* Footer */}
        <footer className="border-t bg-background px-4 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-wrap gap-8 sm:gap-10">
            <div>
              <p className="text-sm font-bold">השטיח האדום</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { href: BRAND_LINKS.carpet.facebook, icon: SOCIAL_ICONS.facebook, label: "Facebook" },
                  { href: BRAND_LINKS.carpet.whatsapp, icon: SOCIAL_ICONS.whatsapp, label: "WhatsApp" },
                  { href: BRAND_LINKS.carpet.website, icon: SOCIAL_ICONS.web, label: "Website" },
                  { href: BRAND_LINKS.carpet.instagram, icon: SOCIAL_ICONS.instagram, label: "Instagram" },
                  { href: BRAND_LINKS.carpet.youtube, icon: SOCIAL_ICONS.youtube, label: "YouTube" },
                ].map(({ href, icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label={label}
                  >
                    <img src={icon} alt="" className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold">פוזיטיב</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  { href: BRAND_LINKS.pozitive.facebook, icon: SOCIAL_ICONS.facebook, label: "Facebook" },
                  { href: BRAND_LINKS.pozitive.whatsapp, icon: SOCIAL_ICONS.whatsapp, label: "WhatsApp" },
                  { href: BRAND_LINKS.pozitive.website, icon: SOCIAL_ICONS.web, label: "Website" },
                  { href: BRAND_LINKS.pozitive.instagram, icon: SOCIAL_ICONS.instagram, label: "Instagram" },
                ].map(({ href, icon, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    aria-label={label}
                  >
                    <img src={icon} alt="" className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm text-muted-foreground leading-relaxed max-w-prose">
            אנחנו שמחים שהמוצרים שלנו הפכו לחלק מהעיצוב שלך. כל פריט אצלנו נבחר ומיוצר בקפידה, מתוך תשוקה לעיצוב, איכות ואהבה לפרטים הקטנים. נשמח לראות איך בחרת לשלב אותם אצלך בבית! צלמו, שתפו, ותייגו אותנו ב #carpet_shop או #pozitiebeanbags
          </p>
        </footer>

        {/* Care tips */}
        <section className="bg-primary text-primary-foreground px-4 py-8 sm:px-8 sm:py-10">
          <div className="mx-auto max-w-2xl rounded-xl bg-card text-card-foreground p-5 shadow-lg sm:p-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              סוף סוף אנחנו נפתחים אל העולם. הדרך שלנו לבית שלך הייתה ארוכה — אשמח למעט סבלנות בזמן שאנחנו מתרעננים.
            </p>
            <Separator className="my-5" />
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
                <p className="text-sm font-semibold">{tip.title}</p>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{tip.body}</p>
                {i < 3 && <Separator className="my-5" />}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

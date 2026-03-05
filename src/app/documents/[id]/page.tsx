import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { BRAND_LINKS } from "@/config/links";
import type { CreateDocumentPayload } from "@/types/document";
import { NewsletterForm } from "./NewsletterForm";
import "./document-page.css";

const IMG_BASE = "/images";
const LOGO_URL = "https://cdn.shopify.com/s/files/1/0594/9839/7887/files/img.png?v=1772750312";
const BANNER_URL = "https://cdn.shopify.com/s/files/1/0594/9839/7887/files/banner1_jpg.jpg?v=1772750312";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDocSub(payload: CreateDocumentPayload): string {
  const type = payload.type === "invoice" ? "חשבונית" : "קבלה";
  const num = payload.InvoiceNumber ?? "";
  return num ? `${type} ${num}` : type;
}

export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("documents")
    .select("payload")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  const payload = data.payload as CreateDocumentPayload;
  const branchName = payload.BranchName ?? "";
  const repName = payload.SalesRepresentative ?? "";
  const printDate = payload.PrintDate ?? "";
  const feedbackUrl = payload.BranchFeedbackUrl ?? BRAND_LINKS.reviewUrl;
  const totalPrice = payload.TotalPrice ?? 0;
  const vat = payload.VAT ?? 0;
  const items = payload.Items ?? [];

  return (
    <div className="doc-page" dir="rtl" lang="he">
      <div className="doc-body">
      {/* Header */}
      <header className="header">
        <img
          className="logo"
          src={LOGO_URL}
          alt="HōM GROUP"
        />
        <h1>מסמך דיגיטלי</h1>
        <div className="doc-sub">{formatDocSub(payload)}</div>
      </header>

      {/* Banner */}
      <div className="banner-wrap">
        <img
          className="banner"
          src={BANNER_URL}
          alt="השטיח האדום"
        />
      </div>

      {/* Meta */}
      <section className="meta">
        <div className="meta-row">
          <span className="meta-label">סניף</span>
          <span className="meta-value">{branchName}</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">תאריך</span>
          <span className="meta-value">{printDate}</span>
        </div>
        <div className="meta-row">
          <span className="meta-label">נציג מכירות</span>
          <span className="meta-value">{repName}</span>
        </div>
      </section>

      {/* Items */}
      <div className="items-wrap">
        <table className="items-table">
          <thead>
            <tr>
              <th>תיאור מוצר</th>
              <th style={{ textAlign: "center" }}>כמות</th>
              <th style={{ textAlign: "right" }}>סכום</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{item.ItemDescription}</td>
                <td style={{ textAlign: "center" }}>{item.ItemQTY}</td>
                <td style={{ textAlign: "right", direction: "ltr" }}>
                  ₪ {formatPrice(item.ItemPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals — reference: row1 dark grey strip, row2 red strip */}
      <div className="totals">
        <div className="totals-row totals-row-vat">
          <div className="t-label">חייב מע״מ 18%</div>
          <div className="t-val">₪ {formatPrice(vat)}</div>
        </div>
        <div className="totals-row totals-row-total">
          <div className="t-label">סהכ קנייה</div>
          <div className="t-val">₪ {formatPrice(totalPrice)}</div>
        </div>
      </div>

      {/* PDF */}
      <div className="pdf-link">
        <Link href={`/documents/${id}/pdf`} target="_blank" rel="noopener">
          הורדת מספר המקור
        </Link>
      </div>

      {/* Thank-you */}
      <div className="thankyou">
        <h2>תודה שבחרתם בנו!</h2>
        <h3>איזה כיף!</h3>
        <p>
          מקווים שניהנת מהשירות של {repName}
          <br />
          נשמח לשמוע על חווית הקניה שלך בסניף {branchName},
          <br />
          לחצו על הלינק ותחממו לנו את הלב.
        </p>
        <div className="thankyou-cta">
          <img
            className="avatar"
            src={`${IMG_BASE}/avatar.svg`}
            alt="נציג"
          />
          <a
            className="btn-feedback"
            href={feedbackUrl}
            target="_blank"
            rel="noopener"
          >
            {branchName}
          </a>
        </div>
      </div>

      {/* Newsletter */}
      <div className="newsletter">
        <h3>דברים טובים בדרך אליך</h3>
        <p className="nl-sub">
          רוצים לדעת לפני כולם על הטרנדים החמים מעולם העיצוב? מבצעים בלעדיים והצצה לפרוייקטים מסקרנים?
        </p>
        <p className="nl-cta">זה הזמן להצטרף לניוזלטר שלנו</p>
        <NewsletterForm documentId={id} branchName={branchName || undefined} />
      </div>

      {/* Care banner — headline image */}
      <div className="care-banner">
        <Link href={BRAND_LINKS.careGuideUrl} target="_blank" rel="noopener">
          <img src={`${IMG_BASE}/care-guide-headline.png`} alt="המדריך המלא לטיפול ושמירה על שטיח" className="care-guide-headline" />
        </Link>
      </div>

      {/* Footer brands */}
      <div className="footer-brands">
        <div className="brand-block">
          <div className="brand-name">השטיח האדום</div>
          <div className="social-icons">
            <a href={BRAND_LINKS.carpet.youtube} target="_blank" rel="noopener" aria-label="YouTube"><img src={`${IMG_BASE}/youtube.svg`} alt="" /></a>
            <a href={BRAND_LINKS.carpet.instagram} target="_blank" rel="noopener" aria-label="Instagram"><img src={`${IMG_BASE}/instagram.svg`} alt="" /></a>
            <a href={BRAND_LINKS.carpet.website} target="_blank" rel="noopener" aria-label="אתר"><img src={`${IMG_BASE}/web.svg`} alt="" /></a>
            <a href={BRAND_LINKS.carpet.whatsapp} target="_blank" rel="noopener" aria-label="WhatsApp"><img src={`${IMG_BASE}/whatsapp.svg`} alt="" /></a>
            <a href={BRAND_LINKS.carpet.facebook} target="_blank" rel="noopener" aria-label="Facebook"><img src={`${IMG_BASE}/facebook.svg`} alt="" /></a>
          </div>
        </div>
        <div className="brand-block">
          <div className="brand-name">פוזיטיב</div>
          <div className="social-icons">
            <a href={BRAND_LINKS.pozitive.instagram} target="_blank" rel="noopener" aria-label="Instagram"><img src={`${IMG_BASE}/instagram.svg`} alt="" /></a>
            <a href={BRAND_LINKS.pozitive.website} target="_blank" rel="noopener" aria-label="אתר"><img src={`${IMG_BASE}/web.svg`} alt="" /></a>
            <a href={BRAND_LINKS.pozitive.whatsapp} target="_blank" rel="noopener" aria-label="WhatsApp"><img src={`${IMG_BASE}/whatsapp.svg`} alt="" /></a>
            <a href={BRAND_LINKS.pozitive.facebook} target="_blank" rel="noopener" aria-label="Facebook"><img src={`${IMG_BASE}/facebook.svg`} alt="" /></a>
          </div>
        </div>
      </div>

      {/* Footer copy */}
      <div className="footer-copy">
        <p>אנחנו שמחים שהמוצרים שלנו הפכו לחלק מהעיצוב שלך.</p>
        <p>כל פריט אצלנו נבחר ומיוצר בקפידה, מתוך תשוקה לעיצוב, איכות ואהבה לפרטים הקטנים.</p>
        <p>נשמח לראות איך בחרת לשלב אותם אצלך בבית!</p>
        <p>צלמו, שתפו, ותייגו אותנו ב</p>
        <p className="hashtags">#carpet_shop או #pozitiebeanbags</p>
        <p>אנחנו בטוחים שהסטייל שלכם יכבוש גם את אחרים ❤️</p>
      </div>

      {/* Care tips */}
      <div className="care-tips">
        <p className="intro">
          סוף סוף אנחנו נפתחים אל העולם, הדרך שלנו לבית שלך היתה ארוכה, אז
          <br />
          אשמח למעט סבלנות בזמן שאנחנו מתרעננים
        </p>
        <div className="tip">
          <div className="tip-icon">
            <img src={`${IMG_BASE}/tip1.png`} alt="" />
          </div>
          <div className="tip-body">
            <div className="tip-title">כן, זה הריח של שטיח חדש...</div>
            <div className="tip-text">
              הריח נובע בעיקר מהחוטים שלי שהתהדקו כל כך חזק במהלך המשלוח. תנו לי קצת זמן באוויר הפתוח ובקרוב הריח יעלם לחלוטין.
            </div>
          </div>
        </div>
        <div className="tip">
          <div className="tip-icon">
            <img src={`${IMG_BASE}/tip2.png`} alt="" />
          </div>
          <div className="tip-body">
            <div className="tip-title">גם אתה תהיה קצת מקומט...</div>
            <div className="tip-text">
              אם תהיה מגולגל, ארוז ותישלח מסביב לעולם. זה הזמן שלי להימתח ולהירגע. מבטיח שבתוך זמן קצר אהיה מושלם לתמונה!
            </div>
          </div>
        </div>
        <div className="tip">
          <div className="tip-icon">
            <img src={`${IMG_BASE}/tip3.png`} alt="" />
          </div>
          <div className="tip-body">
            <div className="tip-title">הצבעים וההצללות שלי יכולים להיות בהירים או כהים יותר...</div>
            <div className="tip-text">
              תלוי בחשיפה שלי לאור יום ולתאורת החדר. נסו לסובב אותי כדי להוציא את המראה הכי טוב שלי בחלל.
            </div>
          </div>
        </div>
        <div className="tip">
          <div className="tip-icon">
            <img src={`${IMG_BASE}/tip4.png`} alt="" />
          </div>
          <div className="tip-body">
            <div className="tip-title">תן לי רגע להתעורר...</div>
            <div className="tip-text">
              גם אני הייתי דחוס בשק, מגולגל ומכווץ – עכשיו זה הזמן שלי לתפוס צורה! תנער אותי, תטפח בעדינות, תעזור לי להתמתח – ותוך זמן קצר, אהיה בדיוק כמו שתכננת: נוח, רך ויפה כמו בתמונה. רק תזכור – פופים, בדיוק כמו אנשים, צריכים רגע להתאפס 😉
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

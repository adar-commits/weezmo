import Link from "next/link";
import { CustomerClubModal } from "@/components/CustomerClubModal";
import { BRAND_LINKS } from "@/config/links";
import type { CreateDocumentPayload } from "@/types/document";
import { NewsletterForm } from "@/app/documents/[id]/NewsletterForm";

const IMG_BASE = "/images";
const LOGO_URL = `${IMG_BASE}/hom-group-logo.png`;
const BANNER_URL = `${IMG_BASE}/banner1.jpg`;

const HEART_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden>
    <path d="M45.5,4A18.53,18.53,0,0,0,32,9.86,18.5,18.5,0,0,0,0,22.5C0,40.92,29.71,59,31,59.71a2,2,0,0,0,2.06,0C34.29,59,64,40.92,64,22.5A18.52,18.52,0,0,0,45.5,4ZM32,55.64C26.83,52.34,4,36.92,4,22.5a14.5,14.5,0,0,1,26.36-8.33,2,2,0,0,0,3.27,0A14.5,14.5,0,0,1,60,22.5C60,36.91,37.17,52.33,32,55.64Z" />
  </svg>
);

function formatPrice(value: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDocSub(payload: CreateDocumentPayload): string {
  const type = payload.type === "invoice" ? "חשבונית" : "קבלה";
  const num = payload.InvoiceNumber ?? "";
  return num ? `${type} ${num}` : type;
}

export function ReceiptDocumentView({
  documentId,
  payload,
}: {
  documentId: string;
  payload: CreateDocumentPayload;
}) {
  const branchName = payload.BranchName ?? "";
  const repName = payload.SalesRepresentative ?? "";
  const printDate = payload.PrintDate ?? "";
  const feedbackUrl = payload.BranchFeedbackUrl ?? BRAND_LINKS.reviewUrl;
  const totalPrice = payload.TotalPrice ?? 0;
  const vat = payload.VAT ?? 0;
  const items = payload.Items ?? [];

  return (
    <>
      <CustomerClubModal />
      <header className="header">
        <div className="img logo-wrap">
          <img className="logo" src={LOGO_URL} alt="HōM GROUP" />
        </div>
        <h1 className="text-danger">מסמך דיגיטלי</h1>
        <h4 className="doc-sub">{formatDocSub(payload)}</h4>
        <div className="header-inner">
          <div className="banner-wrap">
            <img src={BANNER_URL} className="img-fluid" alt="לוגו השטיח האדום" />
          </div>

          <section className="meta">
            <div className="meta-row">
              <div>
                <p className="meta-label">סניף</p>
              </div>
              <div>
                <p className="meta-value">{branchName}</p>
              </div>
            </div>
            <div className="meta-row">
              <div>
                <p className="meta-label">תאריך</p>
              </div>
              <div>
                <p className="meta-value">{printDate}</p>
              </div>
            </div>
            <div className="meta-row">
              <div>
                <p className="meta-label">נציג מכירות</p>
              </div>
              <div>
                <p className="meta-value">{repName}</p>
              </div>
            </div>
          </section>
        </div>
      </header>

      <div className="items-wrap">
        <table className="items-table">
          <thead>
            <tr>
              <th scope="col">תיאור מוצר</th>
              <th scope="col">כמות</th>
              <th scope="col">סכום</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{item.ItemDescription}</td>
                <td>{item.ItemQTY}</td>
                <td>{formatPrice(item.ItemPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="branches">
        <div className="branches-inner">
          <div className="totals">
            <div className="totals-row totals-row-vat">
              <div className="t-label">חייב מע״מ 18%</div>
              <div className="t-val">{formatPrice(vat)}</div>
            </div>
            <div className="totals-row totals-row-total">
              <div className="t-label">סהכ קנייה</div>
              <div className="t-val">{formatPrice(totalPrice)}</div>
            </div>
          </div>

          <div className="pdf-link">
            <Link href={`/documents/${documentId}/pdf`} target="_blank" rel="noopener">
              <span lang="he" dir="rtl" className="pdf-link-label">
                להורדת מסמך המקור
              </span>
            </Link>
          </div>

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
              <img className="avatar" src={`${IMG_BASE}/avatar.svg`} alt="" />
              {branchName ? (
                <a className="btn-feedback" href={feedbackUrl} target="_blank" rel="noopener">
                  {branchName}
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="newsletter">
          <h3>
            דברים טובים בדרך אליך
            {HEART_SVG}
          </h3>
          <p className="nl-sub">
            רוצים לדעת לפני כולם על הטרנדים החמים מעולם העיצוב? מבצעים בלעדיים והצצה לפרוייקטים מסקרנים?
          </p>
          <p className="nl-cta">זה הזמן להצטרף לניוזלטר שלנו</p>
          <NewsletterForm documentId={documentId} branchName={branchName || undefined} />
        </div>
      </section>

      <footer className="doc-footer">
        <div className="doc-footer-inner">
          <div className="care-banner">
            <Link href={BRAND_LINKS.careGuideUrl} target="_blank" rel="noopener">
              <img
                src={`${IMG_BASE}/care-guide-headline.png`}
                alt="המדריך המלא לטיפול ושמירה על שטיח"
                className="care-guide-headline"
              />
            </Link>
          </div>

          <div className="footer-brands">
            <div className="brand-block">
              <h5 className="brand-name">השטיח האדום</h5>
              <div className="social-icons">
                <a href={BRAND_LINKS.carpet.youtube} target="_blank" rel="noopener" aria-label="YouTube">
                  <img src={`${IMG_BASE}/youtube.svg`} alt="" />
                </a>
                <a href={BRAND_LINKS.carpet.instagram} target="_blank" rel="noopener" aria-label="Instagram">
                  <img src={`${IMG_BASE}/instagram.svg`} alt="" />
                </a>
                <a href={BRAND_LINKS.carpet.website} target="_blank" rel="noopener" aria-label="אתר">
                  <img src={`${IMG_BASE}/web.svg`} alt="" />
                </a>
                <a href={BRAND_LINKS.carpet.whatsapp} target="_blank" rel="noopener" aria-label="WhatsApp">
                  <img src={`${IMG_BASE}/whatsapp.svg`} alt="" />
                </a>
                <a href={BRAND_LINKS.carpet.facebook} target="_blank" rel="noopener" aria-label="Facebook">
                  <img src={`${IMG_BASE}/facebook.svg`} alt="" />
                </a>
              </div>
            </div>
            <div className="brand-block">
              <h5 className="brand-name">פוזיטיב</h5>
              <div className="social-icons">
                <a href={BRAND_LINKS.pozitive.instagram} target="_blank" rel="noopener" aria-label="Instagram">
                  <img src={`${IMG_BASE}/instagram.svg`} alt="" />
                </a>
                <a href={BRAND_LINKS.pozitive.website} target="_blank" rel="noopener" aria-label="אתר">
                  <img src={`${IMG_BASE}/web.svg`} alt="" />
                </a>
                <a href={BRAND_LINKS.pozitive.whatsapp} target="_blank" rel="noopener" aria-label="WhatsApp">
                  <img src={`${IMG_BASE}/whatsapp.svg`} alt="" />
                </a>
                <a href={BRAND_LINKS.pozitive.facebook} target="_blank" rel="noopener" aria-label="Facebook">
                  <img src={`${IMG_BASE}/facebook.svg`} alt="" />
                </a>
              </div>
            </div>
          </div>

          <div className="footer-copy">
            <div className="mb-2">אנחנו שמחים שהמוצרים שלנו הפכו לחלק מהעיצוב שלך.</div>
            <div className="mb-3">כל פריט אצלנו נבחר ומיוצר בקפידה, מתוך תשוקה לעיצוב, איכות ואהבה לפרטים הקטנים.</div>
            <div className="mb-2">נשמח לראות איך בחרת לשלב אותם אצלך בבית!</div>
            <div className="mb-2">צלמו, שתפו, ותייגו אותנו ב #carpet_shop או #pozitiebeanbags</div>
            <div className="mb-2">אנחנו בטוחים שהסטייל שלכם יכבוש גם את אחרים 🖤</div>
          </div>

          <div className="care-bar" aria-hidden />

          <div className="care-tips">
            <p className="intro">
              סוף סוף אנחנו נפתחים אל העולם, הדרך שלנו לבית שלך היתה ארוכה, אז
              <br /> אשמח למעט סבלנות בזמן שאנחנו מתרעננים
            </p>
            <div className="tip">
              <div className="tip-icon">
                <img src={`${IMG_BASE}/tip1.png`} alt="" />
              </div>
              <div className="tip-body">
                <strong className="tip-title">כן, זה הריח של שטיח חדש... </strong>
                <br />
                <span className="tip-text">
                  הריח נובע בעיקר מהחוטים שלי שהתהדקו כל כך חזק במהלך המשלוח. תנו לי קצת זמן באוויר הפתוח ובקרוב הריח
                  יעלם לחלוטין.
                </span>
              </div>
            </div>
            <div className="tip">
              <div className="tip-icon">
                <img src={`${IMG_BASE}/tip2.png`} alt="" />
              </div>
              <div className="tip-body">
                <strong className="tip-title">גם אתה תהיה קצת מקומט...</strong>
                <br />
                <span className="tip-text">
                  אם תהיה מגולגל, ארוז ותישלח מסביב לעולם. זה הזמן שלי להימתח ולהירגע. מבטיח שבתוך זמן קצר אהיה מושלם
                  לתמונה!
                </span>
              </div>
            </div>
            <div className="tip">
              <div className="tip-icon">
                <img src={`${IMG_BASE}/tip3.png`} alt="" />
              </div>
              <div className="tip-body">
                <strong className="tip-title">הצבעים וההצללות שלי יכולים להיות בהירים או כהים יותר... </strong>
                <br />
                <span className="tip-text">
                  תלוי בחשיפה שלי לאור יום ולתאורת החדר. נסו לסובב אותי כדי להוציא את המראה הכי טוב שלי בחלל.
                </span>
              </div>
            </div>
            <div className="tip">
              <div className="tip-icon">
                <img src={`${IMG_BASE}/tip4.png`} alt="" />
              </div>
              <div className="tip-body">
                <strong className="tip-title">תן לי רגע להתעורר... </strong>
                <br />
                <span className="tip-text">
                  גם אני הייתי דחוס בשק, מגולגל ומכווץ – עכשיו זה הזמן שלי לתפוס צורה! תנער אותי, תטפח בעדינות, תעזור לי
                  להתמתח – ותוך זמן קצר, אהיה בדיוק כמו שתכננת: נוח, רך ויפה כמו בתמונה. רק תזכור – פופים, בדיוק כמו
                  אנשים, צריכים רגע להתאפס 😉
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

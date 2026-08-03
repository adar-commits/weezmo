import { PDF_HEBREW_FONT_FAMILY } from "@/lib/pdf/register-noto-hebrew-pdf";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const LOGO_URL =
  "https://cdn.shopify.com/s/files/1/0594/9839/7887/files/img.png?v=1772750312";

const VAT_RATE = 0.18;

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontFamily: PDF_HEBREW_FONT_FAMILY,
    fontSize: 9,
    direction: "rtl",
    color: "#1a1a1a",
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    gap: 20,
  },
  logoWrap: {
    width: 130,
    alignItems: "flex-end",
  },
  logo: {
    width: 120,
    objectFit: "contain",
  },
  businessBlock: {
    flex: 1,
    textAlign: "right",
    fontSize: 9,
    lineHeight: 1.55,
  },
  businessTitle: {
    fontWeight: 700,
    fontSize: 11,
    marginBottom: 5,
    color: "#000",
  },
  businessLine: {
    marginBottom: 1,
  },
  siteLine: {
    marginTop: 4,
    fontSize: 8.5,
    color: "#444",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 24,
    marginBottom: 12,
  },
  metaCol: {
    flex: 1,
    textAlign: "right",
    fontSize: 9,
    lineHeight: 1.6,
  },
  metaColCustomer: {
    flex: 1,
    textAlign: "right",
    fontSize: 9,
    lineHeight: 1.6,
    paddingRight: 8,
  },
  metaLabel: {
    color: "#555",
    fontWeight: 500,
  },
  customerName: {
    fontWeight: 700,
    fontSize: 10,
    marginTop: 2,
    marginBottom: 2,
  },
  docTitle: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: 700,
    textDecoration: "underline",
    marginTop: 4,
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  table: {
    borderWidth: 1,
    borderColor: "#333",
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#333",
    backgroundColor: "#ececec",
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontWeight: 700,
    fontSize: 8.5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#bbb",
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontSize: 8.5,
  },
  tableRowLast: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontSize: 8.5,
  },
  tableRowAlt: {
    backgroundColor: "#fafafa",
  },
  colIdx: { width: "6%", textAlign: "center" },
  colSku: { width: "13%", textAlign: "right", paddingHorizontal: 2 },
  colDesc: { width: "36%", textAlign: "right", paddingHorizontal: 4 },
  colUnit: { width: "17%", textAlign: "left", paddingHorizontal: 2 },
  colQty: { width: "8%", textAlign: "center" },
  colLine: { width: "20%", textAlign: "left", paddingHorizontal: 2 },
  amount: {
    direction: "ltr",
    fontVariantNumeric: "tabular-nums",
  },
  summaryWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 14,
    gap: 24,
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: "#333",
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 175,
    backgroundColor: "#fafafa",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    fontSize: 8.5,
    gap: 12,
  },
  summaryTotal: {
    fontWeight: 700,
    marginTop: 2,
    marginBottom: 0,
    paddingTop: 6,
    borderTopWidth: 1,
    borderColor: "#999",
    fontSize: 9.5,
  },
  sideMeta: {
    flex: 1,
    textAlign: "right",
    fontSize: 8.5,
    lineHeight: 1.6,
    paddingTop: 4,
  },
  footer: {
    marginTop: 20,
    textAlign: "right",
    fontSize: 8,
    lineHeight: 1.55,
    color: "#333",
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#ccc",
  },
  footerHead: {
    fontWeight: 700,
    marginBottom: 5,
    fontSize: 8.5,
  },
  footerBullet: {
    marginBottom: 2,
    paddingRight: 4,
  },
  footnote: {
    marginTop: 16,
    fontSize: 7,
    color: "#666",
    textAlign: "center",
    lineHeight: 1.45,
  },
  ltr: {
    direction: "ltr",
  },
});

interface Item {
  ItemSKU?: string;
  ItemDescription?: string;
  ItemPrice?: number;
  ItemQTY?: number;
}

interface Payload {
  type?: string;
  InvoiceNumber?: string;
  BranchID?: string;
  BranchName?: string;
  PrintDate?: string;
  CustomerName?: string;
  CustomerPhone?: string;
  SalesRepresentative?: string;
  Items?: Item[];
  TotalPrice?: number;
  VAT?: number;
  discount?: number;
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatMoneyIls(n: number): string {
  const formatted = n.toLocaleString("he-IL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `₪${formatted}`;
}

function resolveTotals(total: number, vatFromPayload?: number) {
  if (vatFromPayload != null && vatFromPayload > 0) {
    return {
      vat: roundMoney(vatFromPayload),
      subtotal: roundMoney(Math.max(0, total - vatFromPayload)),
    };
  }
  // Israeli retail totals are typically VAT-inclusive when VAT is omitted.
  const subtotal = roundMoney(total / (1 + VAT_RATE));
  const vat = roundMoney(total - subtotal);
  return { vat, subtotal };
}

function docTypeLabel(type?: string) {
  if (!type) return "קבלה";
  const t = type.toLowerCase();
  if (t === "invoice") return "חשבונית";
  return "קבלה";
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <Text>
      <Text style={styles.metaLabel}>{label}: </Text>
      <Text>{value}</Text>
    </Text>
  );
}

export function ReceiptPdfDocument({ payload }: { payload: Payload }) {
  const items = payload.Items ?? [];
  const total = payload.TotalPrice ?? 0;
  const { vat, subtotal } = resolveTotals(total, payload.VAT);
  const docType = docTypeLabel(payload.type);
  const docNumber = payload.InvoiceNumber ?? "";
  const printDate = payload.PrintDate ?? "";
  const branch = payload.BranchName ?? "";
  const rep = payload.SalesRepresentative ?? "";
  const customer = payload.CustomerName ?? "";
  const phone = payload.CustomerPhone ?? "";

  const now = new Date();
  const printDateStr = now.toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
  const printTimeStr = now.toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const docTitle = docNumber
    ? `העתק - ${docType} ${docNumber}`
    : `העתק - ${docType}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.logoWrap}>
            <Image style={styles.logo} src={LOGO_URL} />
          </View>
          <View style={styles.businessBlock}>
            <Text style={styles.businessTitle}>קבוצת הום קמעונאות בע״מ</Text>
            <Text style={styles.businessLine}>
              השטיח האדום{branch ? ` — ${branch}` : ""}
            </Text>
            <Text style={styles.businessLine}>
              <Text style={styles.metaLabel}>טלפון: </Text>
              <Text style={styles.ltr}>*3076</Text>
            </Text>
            <Text style={styles.businessLine}>
              <Text style={styles.metaLabel}>עוסק מורשה: </Text>
              <Text style={styles.ltr}>515713212</Text>
            </Text>
            <Text style={styles.businessLine}>
              <Text style={styles.metaLabel}>מספר תיק במע״מ: </Text>
              <Text style={styles.ltr}>515713212</Text>
            </Text>
            <Text style={styles.siteLine}>
              <Text style={styles.metaLabel}>אתר: </Text>
              <Text style={styles.ltr}>www.carpetshop.co.il</Text>
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaColCustomer}>
            <Text style={styles.metaLabel}>לכבוד:</Text>
            <Text style={styles.customerName}>{customer || "—"}</Text>
            {phone ? (
              <Text>
                <Text style={styles.metaLabel}>טלפון: </Text>
                <Text style={styles.ltr}>{phone}</Text>
              </Text>
            ) : null}
          </View>
          <View style={styles.metaCol}>
            <MetaLine label="תאריך הקבלה" value={printDate || "—"} />
            <MetaLine label="תאריך הדפסה" value={printDateStr} />
            <MetaLine label="שעת הדפסה" value={printTimeStr} />
            <MetaLine label="נציג מכירות" value={rep || "—"} />
          </View>
        </View>

        <Text style={styles.docTitle}>{docTitle}</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colIdx}>שורה</Text>
            <Text style={styles.colSku}>מק״ט</Text>
            <Text style={styles.colDesc}>תיאור פריט</Text>
            <Text style={styles.colUnit}>מחיר ליחידה</Text>
            <Text style={styles.colQty}>כמות</Text>
            <Text style={styles.colLine}>לתשלום</Text>
          </View>
          {items.map((item, i) => {
            const qty = item.ItemQTY ?? 0;
            const price = item.ItemPrice ?? 0;
            const lineTotal = roundMoney(qty * price);
            const isLast = i === items.length - 1;
            const rowStyle =
              i % 2 === 1
                ? [isLast ? styles.tableRowLast : styles.tableRow, styles.tableRowAlt]
                : isLast
                  ? styles.tableRowLast
                  : styles.tableRow;
            return (
              <View key={i} style={rowStyle}>
                <Text style={styles.colIdx}>{i + 1}</Text>
                <Text style={styles.colSku}>{item.ItemSKU ?? "—"}</Text>
                <Text style={styles.colDesc}>{item.ItemDescription ?? "—"}</Text>
                <Text style={[styles.colUnit, styles.amount]}>
                  {formatMoneyIls(price)}
                </Text>
                <Text style={styles.colQty}>{qty}</Text>
                <Text style={[styles.colLine, styles.amount]}>
                  {formatMoneyIls(lineTotal)}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.summaryWrap}>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text>סה״כ ללא מע״מ</Text>
              <Text style={styles.amount}>{formatMoneyIls(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>מע״מ ({Math.round(VAT_RATE * 100)}%)</Text>
              <Text style={styles.amount}>{formatMoneyIls(vat)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text>סה״כ לתשלום</Text>
              <Text style={styles.amount}>{formatMoneyIls(total)}</Text>
            </View>
          </View>
          <View style={styles.sideMeta}>
            <MetaLine label="סניף" value={branch || "—"} />
            {payload.BranchID != null && payload.BranchID !== "" ? (
              <Text>
                <Text style={styles.metaLabel}>מזהה סניף: </Text>
                <Text style={styles.ltr}>{String(payload.BranchID)}</Text>
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerHead}>לקוחות יקרים:</Text>
          <Text style={styles.footerBullet}>
            • בכפוף לנוהל החזרת מוצרים התלוי בכל סניפי הרשת ובאתר האינטרנט.
          </Text>
          <Text style={styles.footerBullet}>• בימי שישי לא יתאפשרו החזרות בסניפים.</Text>
        </View>

        <Text style={styles.footnote}>
          מסמך זה הינו מסמך ממוחשב חתום בחתימה אלקטרונית בהתאם להוראות סעיף 18 ב׳ להוראות ניהול ספרים.
        </Text>
      </Page>
    </Document>
  );
}

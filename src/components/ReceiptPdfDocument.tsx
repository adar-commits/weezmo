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

/** react-pdf flex ignores page direction — use LTR rows + DOM order for RTL visuals. */
const ROW = "row" as const;

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontFamily: PDF_HEBREW_FONT_FAMILY,
    fontSize: 9,
    color: "#1a1a1a",
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: ROW,
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
    alignItems: "flex-end",
    fontSize: 9,
    lineHeight: 1.55,
  },
  businessTitle: {
    fontWeight: 700,
    fontSize: 11,
    marginBottom: 5,
    color: "#000",
    textAlign: "right",
  },
  businessLine: {
    marginBottom: 1,
    textAlign: "right",
  },
  siteLine: {
    marginTop: 4,
    fontSize: 8.5,
    color: "#444",
    textAlign: "right",
  },
  metaRow: {
    flexDirection: ROW,
    justifyContent: "space-between",
    gap: 24,
    marginBottom: 12,
  },
  metaCol: {
    flex: 1,
    alignItems: "flex-end",
    fontSize: 9,
    lineHeight: 1.65,
  },
  metaLabel: {
    color: "#555",
    fontWeight: 500,
    textAlign: "right",
  },
  rtlLine: {
    flexDirection: ROW,
    justifyContent: "flex-end",
    alignItems: "baseline",
    width: "100%",
    gap: 4,
  },
  customerName: {
    fontWeight: 700,
    fontSize: 10,
    marginTop: 2,
    marginBottom: 3,
    textAlign: "right",
    width: "100%",
  },
  docTitle: {
    flexDirection: ROW,
    justifyContent: "center",
    alignItems: "baseline",
    fontSize: 12,
    fontWeight: 700,
    textDecoration: "underline",
    marginTop: 4,
    marginBottom: 14,
    gap: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: "#333",
    marginTop: 2,
  },
  tableHeader: {
    flexDirection: ROW,
    borderBottomWidth: 1,
    borderColor: "#333",
    backgroundColor: "#ececec",
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontWeight: 700,
    fontSize: 8.5,
  },
  tableRow: {
    flexDirection: ROW,
    borderBottomWidth: 0.5,
    borderColor: "#bbb",
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontSize: 8.5,
  },
  tableRowLast: {
    flexDirection: ROW,
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
    flexDirection: ROW,
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
    flexDirection: ROW,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
    fontSize: 8.5,
    gap: 16,
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
    alignItems: "flex-end",
    fontSize: 8.5,
    lineHeight: 1.6,
    paddingTop: 4,
  },
  footer: {
    marginTop: 20,
    alignItems: "flex-end",
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
    textAlign: "right",
    width: "100%",
  },
  footerBullet: {
    marginBottom: 2,
    textAlign: "right",
    width: "100%",
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

/** Label on the right, value to its left — correct Hebrew line layout. */
function RtlField({
  label,
  value,
  valueLtr = false,
}: {
  label: string;
  value: string;
  valueLtr?: boolean;
}) {
  return (
    <View style={styles.rtlLine}>
      <Text style={valueLtr ? styles.ltr : undefined}>{value}</Text>
      <Text style={styles.metaLabel}>{label}:</Text>
    </View>
  );
}

function TableColumns({
  row,
  idx,
  sku,
  desc,
  unit,
  qty,
  line,
}: {
  row: number;
  idx: number;
  sku: string;
  desc: string;
  unit: string;
  qty: number | string;
  line: string;
}) {
  return (
    <>
      <Text style={styles.colLine}>{line}</Text>
      <Text style={styles.colQty}>{qty}</Text>
      <Text style={[styles.colUnit, styles.amount]}>{unit}</Text>
      <Text style={styles.colDesc}>{desc}</Text>
      <Text style={styles.colSku}>{sku}</Text>
      <Text style={styles.colIdx}>{idx}</Text>
    </>
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.businessBlock}>
            <Text style={styles.businessTitle}>קבוצת הום קמעונאות בע״מ</Text>
            <Text style={styles.businessLine}>
              השטיח האדום{branch ? ` — ${branch}` : ""}
            </Text>
            <RtlField label="טלפון" value="*3076" valueLtr />
            <RtlField label="עוסק מורשה" value="515713212" valueLtr />
            <RtlField label="מספר תיק במע״מ" value="515713212" valueLtr />
            <View style={styles.siteLine}>
              <RtlField label="אתר" value="www.carpetshop.co.il" valueLtr />
            </View>
          </View>
          <View style={styles.logoWrap}>
            <Image style={styles.logo} src={LOGO_URL} />
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <RtlField label="תאריך הקבלה" value={printDate || "—"} />
            <RtlField label="תאריך הדפסה" value={printDateStr} />
            <RtlField label="שעת הדפסה" value={printTimeStr} />
            <RtlField label="נציג מכירות" value={rep || "—"} />
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>לכבוד:</Text>
            <Text style={styles.customerName}>{customer || "—"}</Text>
            {phone ? <RtlField label="טלפון" value={phone} valueLtr /> : null}
          </View>
        </View>

        <View style={styles.docTitle}>
          {docNumber ? (
            <>
              <Text>העתק</Text>
              <Text> - </Text>
              <Text>{docType} </Text>
              <Text style={styles.ltr}>{docNumber}</Text>
            </>
          ) : (
            <Text>העתק - {docType}</Text>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colLine}>לתשלום</Text>
            <Text style={styles.colQty}>כמות</Text>
            <Text style={styles.colUnit}>מחיר ליחידה</Text>
            <Text style={styles.colDesc}>תיאור פריט</Text>
            <Text style={styles.colSku}>מק״ט</Text>
            <Text style={styles.colIdx}>שורה</Text>
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
                <TableColumns
                  row={i}
                  idx={i + 1}
                  sku={item.ItemSKU ?? "—"}
                  desc={item.ItemDescription ?? "—"}
                  unit={formatMoneyIls(price)}
                  qty={qty}
                  line={formatMoneyIls(lineTotal)}
                />
              </View>
            );
          })}
        </View>

        <View style={styles.summaryWrap}>
          <View style={styles.sideMeta}>
            <RtlField label="סניף" value={branch || "—"} />
            {payload.BranchID != null && payload.BranchID !== "" ? (
              <RtlField label="מזהה סניף" value={String(payload.BranchID)} valueLtr />
            ) : null}
          </View>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.amount}>{formatMoneyIls(subtotal)}</Text>
              <Text>סה״כ ללא מע״מ</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.amount}>{formatMoneyIls(vat)}</Text>
              <Text>מע״מ ({Math.round(VAT_RATE * 100)}%)</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={styles.amount}>{formatMoneyIls(total)}</Text>
              <Text>סה״כ לתשלום</Text>
            </View>
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

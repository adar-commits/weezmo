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

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 36,
    fontFamily: PDF_HEBREW_FONT_FAMILY,
    fontSize: 9,
    direction: "rtl",
  },
  headerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
    gap: 12,
  },
  businessBlock: {
    flex: 1,
    textAlign: "right",
    fontSize: 9,
    lineHeight: 1.45,
  },
  businessTitle: {
    fontWeight: 700,
    fontSize: 10,
    marginBottom: 4,
  },
  logo: {
    width: 120,
    objectFit: "contain",
  },
  siteLine: {
    marginTop: 6,
    fontSize: 8,
    color: "#333",
    textAlign: "right",
  },
  metaRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 10,
  },
  metaCol: {
    flex: 1,
    textAlign: "right",
    fontSize: 9,
    lineHeight: 1.5,
  },
  metaLabel: {
    color: "#333",
  },
  docTitle: {
    textAlign: "center",
    fontSize: 11,
    fontWeight: 700,
    textDecoration: "underline",
    marginTop: 6,
    marginBottom: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: "#000",
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderColor: "#000",
    backgroundColor: "#f5f5f5",
    paddingVertical: 5,
    paddingHorizontal: 4,
    fontWeight: 700,
    fontSize: 8,
  },
  tableRow: {
    flexDirection: "row-reverse",
    borderBottomWidth: 1,
    borderColor: "#000",
    paddingVertical: 5,
    paddingHorizontal: 4,
    fontSize: 8,
  },
  tableRowLast: {
    flexDirection: "row-reverse",
    paddingVertical: 5,
    paddingHorizontal: 4,
    fontSize: 8,
  },
  colIdx: { width: "6%", textAlign: "center" },
  colSku: { width: "14%", textAlign: "right" },
  colDesc: { width: "38%", textAlign: "right", paddingHorizontal: 2 },
  colUnit: { width: "16%", textAlign: "right" },
  colQty: { width: "8%", textAlign: "center" },
  colLine: { width: "18%", textAlign: "right" },
  amountLtr: {
    direction: "ltr",
    textAlign: "right",
    fontVariantNumeric: "tabular-nums",
  },
  summaryWrap: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    marginTop: 12,
    gap: 20,
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: "#000",
    padding: 8,
    minWidth: 160,
  },
  summaryRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 4,
    fontSize: 8,
  },
  summaryTotal: {
    fontWeight: 700,
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderColor: "#999",
  },
  sideMeta: {
    flex: 1,
    textAlign: "right",
    fontSize: 8,
    lineHeight: 1.55,
  },
  footer: {
    marginTop: 18,
    textAlign: "right",
    fontSize: 7.5,
    lineHeight: 1.45,
    color: "#222",
  },
  footerHead: {
    fontWeight: 700,
    marginBottom: 4,
  },
  footnote: {
    marginTop: 14,
    fontSize: 7,
    color: "#555",
    textAlign: "right",
    lineHeight: 1.4,
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

function formatMoneyIls(n: number) {
  const s = n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `ILS ${s}`;
}

function docTypeLabel(type?: string) {
  if (!type) return "קבלה";
  const t = type.toLowerCase();
  if (t === "invoice") return "חשבונית";
  return "קבלה";
}

export function ReceiptPdfDocument({ payload }: { payload: Payload }) {
  const items = payload.Items ?? [];
  const total = payload.TotalPrice ?? 0;
  const vat = payload.VAT ?? 0;
  const totalWithoutVat = Math.max(0, total - vat);
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
            <Text>השטיח האדום — סניף: {branch || "—"}</Text>
            <Text>טלפון: 3076*</Text>
            <Text>עוסק מורשה: 515713212</Text>
            <Text>מספר תיק במע״מ: 515713212</Text>
            <Text style={styles.siteLine}>אתר: www.carpetshop.co.il</Text>
          </View>
          <Image style={styles.logo} src={LOGO_URL} />
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text>
              <Text style={styles.metaLabel}>תאריך הקבלה: </Text>
              {printDate || "—"}
            </Text>
            <Text>
              <Text style={styles.metaLabel}>תאריך הדפסה: </Text>
              {printDateStr}
            </Text>
            <Text>
              <Text style={styles.metaLabel}>שעת הדפסה: </Text>
              {printTimeStr}
            </Text>
            <Text>
              <Text style={styles.metaLabel}>נציג מכירות: </Text>
              {rep || "—"}
            </Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={{ fontWeight: 700 }}>לכבוד:</Text>
            <Text>{customer || "—"}</Text>
            {phone ? (
              <Text>
                <Text style={styles.metaLabel}>טלפון: </Text>
                {phone}
              </Text>
            ) : null}
          </View>
        </View>

        <Text style={styles.docTitle}>
          {docNumber ? `${docType} ${docNumber} - העתק` : docType}
        </Text>

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
            const lineTotal = qty * price;
            const isLast = i === items.length - 1;
            return (
              <View key={i} style={isLast ? styles.tableRowLast : styles.tableRow}>
                <Text style={styles.colIdx}>{i + 1}</Text>
                <Text style={styles.colSku}>{item.ItemSKU ?? ""}</Text>
                <Text style={styles.colDesc}>{item.ItemDescription ?? ""}</Text>
                <Text style={[styles.colUnit, styles.amountLtr]}>
                  {formatMoneyIls(price)}
                </Text>
                <Text style={styles.colQty}>{qty}</Text>
                <Text style={[styles.colLine, styles.amountLtr]}>
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
              <Text style={styles.amountLtr}>{formatMoneyIls(totalWithoutVat)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>מע״מ (18%)</Text>
              <Text style={styles.amountLtr}>{formatMoneyIls(vat)}</Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text>סה״כ לתשלום</Text>
              <Text style={styles.amountLtr}>{formatMoneyIls(total)}</Text>
            </View>
          </View>
          <View style={styles.sideMeta}>
            <Text>
              <Text style={styles.metaLabel}>סניף: </Text>
              {branch || "—"}
            </Text>
            {payload.BranchID != null && payload.BranchID !== "" ? (
              <Text>
                <Text style={styles.metaLabel}>מזהה סניף: </Text>
                {String(payload.BranchID)}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerHead}>לקוחות יקרים:</Text>
          <Text>• בכפוף לנוהל החזרת מוצרים התלוי בכל סניפי הרשת ובאתר האינטרנט.</Text>
          <Text>• בימי שישי לא יתאפשרו החזרות בסניפים.</Text>
        </View>

        <Text style={styles.footnote}>
          מסמך זה הינו מסמך ממוחשב חתום בחתימה אלקטרונית בהתאם להוראות סעיף 18 ב׳ להוראות ניהול ספרים.
        </Text>
      </Page>
    </Document>
  );
}

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// RTL-friendly: use a font that supports Hebrew (built-in Helvetica does)
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  title: { fontSize: 14, marginBottom: 8 },
  row: { flexDirection: "row", marginBottom: 4 },
  label: { width: 120 },
  table: { marginTop: 12 },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, paddingVertical: 4 },
  tableHeader: { flexDirection: "row", borderBottomWidth: 1, paddingVertical: 4, fontWeight: "bold" },
  col1: { width: 24 },
  col2: { width: 80 },
  col3: { width: 200 },
  col4: { width: 70 },
  col5: { width: 40 },
  col6: { width: 70 },
  totals: { marginTop: 12 },
  thankYou: { marginTop: 16, fontSize: 11 },
  footnote: { marginTop: 20, fontSize: 8, color: "#666" },
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
  Items?: Item[];
  TotalPrice?: number;
  VAT?: number;
  discount?: number;
}

function formatNum(n: number) {
  return n.toLocaleString("he-IL", { minimumFractionDigits: 2 });
}

export function ReceiptPdfDocument({ payload }: { payload: Payload }) {
  const items = payload.Items ?? [];
  const total = payload.TotalPrice ?? 0;
  const vat = payload.VAT ?? 0;
  const totalWithoutVat = total - vat;
  const docType = payload.type ?? "קבלה";
  const docNumber = payload.InvoiceNumber ?? "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>מסמך ממוחשב</Text>
        <View style={styles.row}>
          <Text style={styles.label}>שם עסק:</Text>
          <Text>השטיח האדום</Text>
        </View>
        {payload.BranchID != null && (
          <View style={styles.row}>
            <Text style={styles.label}>מספר סניף:</Text>
            <Text>{payload.BranchID}</Text>
          </View>
        )}
        {payload.BranchName != null && payload.BranchName !== "" && (
          <View style={styles.row}>
            <Text style={styles.label}>שם סניף:</Text>
            <Text>{payload.BranchName}</Text>
          </View>
        )}
        {payload.PrintDate != null && payload.PrintDate !== "" && (
          <View style={styles.row}>
            <Text style={styles.label}>תאריך קניה:</Text>
            <Text>{payload.PrintDate}</Text>
          </View>
        )}
        {payload.CustomerName != null && payload.CustomerName !== "" && (
          <View style={styles.row}>
            <Text style={styles.label}>שם לקוח:</Text>
            <Text>{payload.CustomerName}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>{docNumber} {docType} :</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>#</Text>
            <Text style={styles.col2}>מק&quot;ט</Text>
            <Text style={styles.col3}>תיאור פריט</Text>
            <Text style={styles.col4}>מחיר ליחידה</Text>
            <Text style={styles.col5}>כמות</Text>
            <Text style={styles.col6}>לתשלום</Text>
          </View>
          {items.map((item, i) => {
            const qty = item.ItemQTY ?? 0;
            const price = item.ItemPrice ?? 0;
            const lineTotal = qty * price;
            return (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.col1}>{i + 1}</Text>
                <Text style={styles.col2}>{item.ItemSKU ?? ""}</Text>
                <Text style={styles.col3}>{item.ItemDescription ?? ""}</Text>
                <Text style={styles.col4}>₪ {formatNum(price)}</Text>
                <Text style={styles.col5}>{qty}</Text>
                <Text style={styles.col6}>₪ {formatNum(lineTotal)}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.totals}>
          <View style={styles.row}>
            <Text style={styles.label}>סה&quot;כ:</Text>
            <Text>₪ {formatNum(total)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>סה&quot;כ ללא מע&quot;מ:</Text>
            <Text>₪ {formatNum(totalWithoutVat)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>מע&quot;מ (18%):</Text>
            <Text>₪ {formatNum(vat)}</Text>
          </View>
        </View>

        <Text style={styles.thankYou}>תודה שקניתם בשטיח האדום</Text>
        <Text style={styles.footnote}>
          מסמך זה הינו מסמך ממוחשב חתום בחתימה אלקטרונית בהתאם להוראות סעיף 18 ב. להוראות ניהול ספרים.
        </Text>
      </Page>
    </Document>
  );
}

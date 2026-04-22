import Link from "next/link";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TEMPLATE_IDS } from "@/constants/templates";
import {
  ADMIN_DOCUMENTS_PAGE_SIZE,
  getPublicDocumentUrl,
  listAdminDocuments,
  type AdminDocumentTemplateFilter,
} from "@/app/admin/documents/queries";

export const dynamic = "force-dynamic";

function parseParams(sp: Record<string, string | string[] | undefined>) {
  const page = Math.max(1, parseInt(String(sp.page ?? "1"), 10) || 1);
  const t = String(sp.template ?? "receipt");
  const template: AdminDocumentTemplateFilter =
    t === "all" || t === TEMPLATE_IDS.customerSurvey || t === TEMPLATE_IDS.receipt
      ? (t as AdminDocumentTemplateFilter)
      : "receipt";
  return { page, template };
}

function templateLabel(t: string): string {
  if (t === TEMPLATE_IDS.receipt) return "קבלה / מסמך";
  if (t === TEMPLATE_IDS.customerSurvey) return "סקר לקוחות";
  return t;
}

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const { page, template } = parseParams(sp);

  const { rows, total } = await listAdminDocuments(page, template);
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_DOCUMENTS_PAGE_SIZE));

  const mkHref = (p: { page?: number; template?: AdminDocumentTemplateFilter }) => {
    const u = new URLSearchParams();
    u.set("template", p.template ?? template);
    u.set("page", String(p.page ?? page));
    return `/admin/documents?${u.toString()}`;
  };

  return (
    <div className="space-y-6 p-4 pb-10 md:space-y-8 md:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-right">
          <h2 className="text-lg font-semibold">מסמכים דיגיטליים</h2>
          <p className="text-sm text-muted-foreground">
            עיון בקישורי מסמכים (כגון קבלות) בדומה לתצוגת הלקוח
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="text-xs text-muted-foreground">סינון:</span>
          {(
            [
              ["receipt" as const, "קבלות"],
              [TEMPLATE_IDS.customerSurvey, "סקרים"],
              ["all" as const, "הכול"],
            ] as const
          ).map(([key, label]) => (
            <Button
              key={key}
              variant={template === key ? "default" : "outline"}
              size="sm"
              className="rounded-xl"
              asChild
            >
              <Link href={mkHref({ page: 1, template: key })} prefetch={false}>
                {label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <Card className="border-0">
        <CardHeader className="border-b border-border/40 text-right">
          <CardTitle className="flex items-center justify-end gap-2 text-lg font-semibold">
            <FileText className="size-5 opacity-80" />
            רשימת מסמכים
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader className="bg-muted/35">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="text-right">נוצר</TableHead>
                <TableHead className="text-right">תבנית</TableHead>
                <TableHead className="text-right">סניף</TableHead>
                <TableHead className="text-right font-mono" dir="ltr">
                  id
                </TableHead>
                <TableHead className="text-center">קישור ציבורי</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    אין מסמכים להצגה
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => {
                  const href = getPublicDocumentUrl(r.id);
                  return (
                    <TableRow key={r.id} className="odd:bg-muted/25">
                      <TableCell className="text-right text-xs text-muted-foreground" dir="ltr">
                        {new Date(r.created_at).toLocaleString("he-IL")}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {templateLabel(r.template_id)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {r.branch_id ? r.branch_id : "—"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate font-mono text-xs" dir="ltr" title={r.id}>
                        {r.id}
                      </TableCell>
                      <TableCell className="text-center">
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                        >
                          פתח מסמך
                        </a>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          <div className="flex items-center justify-between border-t border-border/40 px-4 py-3">
            <p className="text-sm text-muted-foreground">
              עמוד {page} מתוך {totalPages} · {total} מסמכים
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" asChild disabled={page <= 1}>
                {page > 1 ? (
                  <Link href={mkHref({ page: page - 1 })} prefetch={false}>
                    הקודם
                  </Link>
                ) : (
                  <span>הקודם</span>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                asChild
                disabled={page >= totalPages}
              >
                {page < totalPages ? (
                  <Link href={mkHref({ page: page + 1 })} prefetch={false}>
                    הבא
                  </Link>
                ) : (
                  <span>הבא</span>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

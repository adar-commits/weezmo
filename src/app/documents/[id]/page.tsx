import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DocumentView } from "@/components/DocumentView";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from("documents").select("payload").eq("id", id).single();
  const payload = data?.payload as { type?: string; InvoiceNumber?: string } | null;
  const title = payload?.InvoiceNumber
    ? `${payload.type || "מסמך"} ${payload.InvoiceNumber}`
    : "מסמך דיגיטלי";
  return { title: `${title} | Weezmo` };
}

export default async function DocumentPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.from("documents").select("id, type, payload, created_at").eq("id", id).single();

  if (error || !data) notFound();

  const payload = data.payload as Record<string, unknown> & {
    Items?: Array<{ ItemDescription?: string; ItemQTY?: number; ItemPrice?: number; ItemSKU?: string }>;
    TotalPrice?: number;
    VAT?: number;
    type?: string;
    InvoiceNumber?: string;
    BranchName?: string;
    BranchID?: string;
    PrintDate?: string;
    SalesRepresentative?: string;
    CustomerName?: string;
    paymentType?: string;
    discount?: number;
    BranchFeedbackUrl?: string;
  };

  return (
    <div dir="rtl" className="min-h-screen bg-stone-100 font-sans">
      <DocumentView documentId={id} payload={payload} />
    </div>
  );
}

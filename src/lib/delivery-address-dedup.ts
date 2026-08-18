import type { SupabaseClient } from "@supabase/supabase-js";
import { TEMPLATE_IDS } from "@/constants/templates";
import { phoneDedupCandidates } from "@/lib/phone-normalize";

type ExistingDeliveryAddressRow = {
  id: string;
  created_at: string;
  template_id: string | null;
  branch_id: string | null;
  customer_phone: string | null;
  payload: unknown;
};

/**
 * Returns the most recent delivery_address document for any phone format variant.
 */
export async function findExistingDeliveryAddressByPhone(
  supabase: SupabaseClient,
  phone: string
): Promise<ExistingDeliveryAddressRow | null> {
  const candidates = phoneDedupCandidates(phone);
  if (candidates.length === 0) return null;

  for (const candidate of candidates) {
    const { data, error } = await supabase
      .from("documents")
      .select("id, created_at, template_id, branch_id, customer_phone, payload")
      .eq("template_id", TEMPLATE_IDS.deliveryAddress)
      .eq("customer_phone", candidate)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("delivery address dedup lookup (customer_phone):", error.message);
      continue;
    }
    if (data) return data as ExistingDeliveryAddressRow;
  }

  for (const candidate of candidates) {
    const { data, error } = await supabase
      .from("documents")
      .select("id, created_at, template_id, branch_id, customer_phone, payload")
      .eq("template_id", TEMPLATE_IDS.deliveryAddress)
      .eq("payload->>phone", candidate)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("delivery address dedup lookup (payload.phone):", error.message);
      continue;
    }
    if (data) return data as ExistingDeliveryAddressRow;
  }

  return null;
}

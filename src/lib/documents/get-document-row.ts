import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const getDocumentRow = cache(async (id: string) => {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("documents")
    .select("template_id, payload")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
});

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseCreateDocumentBody } from "@/lib/templates/registry";

function getApiKey(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return req.headers.get("x-api-key");
}

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL;
  if (url && url.trim()) return url.startsWith("http") ? url.trim() : `https://${url.trim()}`;
  return "https://weezmo.vercel.app";
}

export async function POST(req: NextRequest) {
  const apiKey = getApiKey(req);
  const expectedKey = process.env.DOCUMENTS_API_KEY;
  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json(
      { status: "error", message: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { status: "error", message: "Invalid JSON" },
      { status: 400 }
    );
  }

  const parsed = parseCreateDocumentBody(body);
  if (!parsed.ok) {
    return NextResponse.json(
      { status: "error", message: parsed.message },
      { status: 400 }
    );
  }

  let supabase;
  try {
    supabase = createServerSupabaseClient();
  } catch (e) {
    console.error("Supabase client init failed:", e);
    return NextResponse.json(
      { status: "error", message: "Server configuration error (Supabase not configured)" },
      { status: 500 }
    );
  }

  const insertRow = {
    template_id: parsed.templateId,
    type: parsed.dbType,
    payload: parsed.payload as unknown as Record<string, unknown>,
  };

  const { data: row, error } = await supabase
    .from("documents")
    .insert(insertRow)
    .select("id")
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to create document" },
      { status: 500 }
    );
  }

  const baseUrl = getBaseUrl();
  const link = `${baseUrl}/documents/${row.id}`;

  return NextResponse.json({
    status: "success",
    data: {
      data: {
        ...(parsed.payload as object),
        id: row.id,
      },
      link,
    },
  });
}

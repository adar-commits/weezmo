import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CreateDocumentPayload } from "@/types/document";
import { payloadTypeToDbType } from "@/types/document";

function getApiKey(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) return authHeader.slice(7);
  return req.headers.get("x-api-key");
}

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  if (url) return url.startsWith("http") ? url : `https://${url}`;
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

  const payload = body as CreateDocumentPayload;
  if (!payload || !Array.isArray(payload.Items)) {
    return NextResponse.json(
      { status: "error", message: "Missing or invalid body (Items required)" },
      { status: 400 }
    );
  }

  const dbType = payloadTypeToDbType(payload.type);

  const supabase = createServerSupabaseClient();
  const { data: row, error } = await supabase
    .from("documents")
    .insert({
      type: dbType,
      payload: payload as unknown as Record<string, unknown>,
    })
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
        ...payload,
        id: row.id,
      },
      link,
    },
  });
}

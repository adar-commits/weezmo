#!/usr/bin/env node
/**
 * Create a Supabase Auth user (email + password), email pre-confirmed.
 *
 * Usage (from repo root):
 *   node --env-file=.env.local scripts/create-supabase-auth-user.mjs "you@example.com" "your-password"
 *
 * Requires:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Also add the same email to ADMIN_EMAIL_ALLOWLIST on Vercel for /admin access.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const email = process.argv[2]?.trim();
const password = process.argv[3];

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}
if (!email || !password) {
  console.error('Usage: node scripts/create-supabase-auth-user.mjs "<email>" "<password>"');
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  console.error("createUser failed:", error.message);
  process.exit(1);
}

console.log("Created user:", data.user?.id, data.user?.email);
console.log("Add to ADMIN_EMAIL_ALLOWLIST on Vercel if you use the admin dashboard:", email);

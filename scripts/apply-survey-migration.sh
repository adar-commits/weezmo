#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SQL="$ROOT/supabase/migrations/20260422000000_survey_backoffice.sql"

if [[ ! -f "$SQL" ]]; then
  echo "Missing migration file: $SQL" >&2
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set." >&2
  echo "" >&2
  echo "Use your Supabase Postgres URI (Dashboard → Project Settings → Database → Connection string → URI)." >&2
  echo "Prefer Session mode (port 5432) or Transaction pooler (6543) with sslmode=require." >&2
  echo "" >&2
  echo "Example:" >&2
  echo "  export DATABASE_URL='postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require'" >&2
  echo "  npm run db:migrate" >&2
  exit 1
fi

if command -v psql >/dev/null 2>&1; then
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$SQL"
else
  echo "psql not found. Install PostgreSQL client tools or run the SQL file in the Supabase SQL Editor." >&2
  exit 1
fi

echo "Done: survey backoffice migration applied."

-- Survey backoffice: denormalized columns on documents + survey_responses + aggregations + RLS

-- 0) template_id on documents (required by API + this migration; may be missing on older DBs)
alter table documents add column if not exists template_id text not null default 'receipt';

-- Legacy rows: template only lived under payload.template_id
update documents
set template_id = 'customer_survey'
where coalesce(trim(payload ->> 'template_id'), '') = 'customer_survey';

-- 1) Documents: indexable identity (customer survey create payload)
alter table documents add column if not exists branch_id text;
alter table documents add column if not exists customer_name text;
alter table documents add column if not exists customer_phone text;

create index if not exists idx_documents_template on documents (template_id);
create index if not exists idx_documents_branch_id on documents (branch_id);

-- created_at is optional on older installs; only index when present
do $create_idx$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'documents'
      and column_name = 'created_at'
  ) then
    execute 'create index if not exists idx_documents_created_at on documents (created_at)';
  end if;
end
$create_idx$;

-- 2) Responses (persisted on submit; webhook is secondary)
create extension if not exists pg_trgm;

create table if not exists survey_responses (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents (id) on delete cascade,
  submitted_at timestamptz not null default now(),
  answers jsonb not null,
  avg_score numeric(4, 2) not null,
  order_id text,
  branch_id text,
  customer_name text,
  customer_phone text,
  webhook_status text not null default 'pending',
  webhook_error text,
  created_at timestamptz not null default now()
);

create index if not exists idx_sr_submitted_at on survey_responses (submitted_at desc);
create index if not exists idx_sr_branch on survey_responses (branch_id);
create index if not exists idx_sr_avg on survey_responses (avg_score);
create index if not exists idx_sr_order on survey_responses (order_id);
create index if not exists idx_sr_phone on survey_responses (customer_phone);
create index if not exists idx_sr_document on survey_responses (document_id);

create index if not exists idx_sr_name_trgm on survey_responses using gin (customer_name gin_trgm_ops);

alter table survey_responses enable row level security;

-- No policies: only service role bypasses RLS in this project.

-- 3) RPC: branch aggregates (same filter semantics as dashboard)
create or replace function public.survey_agg_by_branch(
  p_from timestamptz,
  p_to timestamptz,
  p_score_min numeric,
  p_score_max numeric,
  p_branch_id text,
  p_search text
)
returns table (
  branch_id text,
  response_count bigint,
  avg_score numeric,
  pct_five_star numeric,
  last_submitted timestamptz
)
language sql
stable
as $$
  select
    coalesce(sr.branch_id, '') as branch_id,
    count(*)::bigint as response_count,
    round(avg(sr.avg_score)::numeric, 2) as avg_score,
    case
      when count(*) = 0 then 0::numeric
      else round(
        (100.0 * count(*) filter (where sr.avg_score >= 4.99)::numeric / count(*)::numeric),
        1
      )
    end as pct_five_star,
    max(sr.submitted_at) as last_submitted
  from survey_responses sr
  where sr.submitted_at >= p_from
    and sr.submitted_at < p_to
    and sr.avg_score >= p_score_min
    and sr.avg_score <= p_score_max
    and (p_branch_id is null or p_branch_id = '' or sr.branch_id = p_branch_id)
    and (
      p_search is null
      or trim(p_search) = ''
      or sr.customer_name ilike '%' || p_search || '%'
      or sr.customer_phone ilike '%' || p_search || '%'
      or sr.order_id ilike '%' || p_search || '%'
    )
  group by coalesce(sr.branch_id, '')
  order by response_count desc;
$$;

-- 4) RPC: per-question aggregates from answers jsonb
create or replace function public.survey_agg_by_question(
  p_from timestamptz,
  p_to timestamptz,
  p_score_min numeric,
  p_score_max numeric,
  p_branch_id text,
  p_search text
)
returns table (
  question_id text,
  avg_rating numeric,
  cnt_1 bigint,
  cnt_2 bigint,
  cnt_3 bigint,
  cnt_4 bigint,
  cnt_5 bigint,
  response_count bigint
)
language sql
stable
as $$
  with filtered as (
    select sr.answers
    from survey_responses sr
    where sr.submitted_at >= p_from
      and sr.submitted_at < p_to
      and sr.avg_score >= p_score_min
      and sr.avg_score <= p_score_max
      and (p_branch_id is null or p_branch_id = '' or sr.branch_id = p_branch_id)
      and (
        p_search is null
        or trim(p_search) = ''
        or sr.customer_name ilike '%' || p_search || '%'
        or sr.customer_phone ilike '%' || p_search || '%'
        or sr.order_id ilike '%' || p_search || '%'
      )
  ),
  pairs as (
    select kv.key as qid, (kv.value #>> '{}')::numeric as rating
    from filtered f,
    lateral jsonb_each(f.answers) as kv(key, value)
    where jsonb_typeof(kv.value) = 'number'
      and (kv.value #>> '{}')::numeric between 1 and 5
  )
  select
    p.qid as question_id,
    round(avg(p.rating)::numeric, 2) as avg_rating,
    count(*) filter (where p.rating = 1)::bigint as cnt_1,
    count(*) filter (where p.rating = 2)::bigint as cnt_2,
    count(*) filter (where p.rating = 3)::bigint as cnt_3,
    count(*) filter (where p.rating = 4)::bigint as cnt_4,
    count(*) filter (where p.rating = 5)::bigint as cnt_5,
    count(*)::bigint as response_count
  from pairs p
  group by p.qid
  order by response_count desc;
$$;

-- 5) Daily submission counts for KPI sparkline
create or replace function public.survey_daily_submissions(
  p_from timestamptz,
  p_to timestamptz,
  p_score_min numeric,
  p_score_max numeric,
  p_branch_id text,
  p_search text
)
returns table (day date, cnt bigint)
language sql
stable
as $$
  select
    (sr.submitted_at at time zone 'UTC')::date as day,
    count(*)::bigint as cnt
  from survey_responses sr
  where sr.submitted_at >= p_from
    and sr.submitted_at < p_to
    and sr.avg_score >= p_score_min
    and sr.avg_score <= p_score_max
    and (p_branch_id is null or p_branch_id = '' or sr.branch_id = p_branch_id)
    and (
      p_search is null
      or trim(p_search) = ''
      or sr.customer_name ilike '%' || p_search || '%'
      or sr.customer_phone ilike '%' || p_search || '%'
      or sr.order_id ilike '%' || p_search || '%'
    )
  group by 1
  order by 1;
$$;

-- 6) Single-call KPI stats for current window (and reuse filters)
create or replace function public.survey_stats_pack(
  p_from timestamptz,
  p_to timestamptz,
  p_score_min numeric,
  p_score_max numeric,
  p_branch_id text,
  p_search text
)
returns jsonb
language sql
stable
as $$
  with f as (
    select sr.*
    from survey_responses sr
    where sr.submitted_at >= p_from
      and sr.submitted_at < p_to
      and sr.avg_score >= p_score_min
      and sr.avg_score <= p_score_max
      and (p_branch_id is null or p_branch_id = '' or sr.branch_id = p_branch_id)
      and (
        p_search is null
        or trim(p_search) = ''
        or sr.customer_name ilike '%' || p_search || '%'
        or sr.customer_phone ilike '%' || p_search || '%'
        or sr.order_id ilike '%' || p_search || '%'
      )
  )
  select jsonb_build_object(
    'response_count', coalesce((select count(*)::bigint from f), 0),
    'avg_score', coalesce((select round(avg(f2.avg_score)::numeric, 2) from f f2), 0),
    'five_star_pct',
      coalesce(
        (
          select
            case
              when count(*) = 0 then 0::numeric
              else round(
                (100.0 * count(*) filter (where f3.avg_score >= 4.99)::numeric / count(*)::numeric),
                1
              )
            end
          from f f3
        ),
        0
      ),
    'docs_issued',
      coalesce(
        (
          select count(*)::bigint
          from documents d
          where coalesce(d.template_id, d.payload ->> 'template_id') = 'customer_survey'
            and d.created_at >= p_from
            and d.created_at < p_to
        ),
        0
      )
  );
$$;

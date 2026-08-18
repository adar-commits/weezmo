-- Delivery address form responses (customer fills missing shipping details)

create table if not exists delivery_address_responses (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents (id) on delete cascade,
  submitted_at timestamptz not null default now(),
  address jsonb not null,
  order_id text,
  branch_id text,
  customer_name text,
  customer_phone text,
  webhook_status text not null default 'pending',
  webhook_error text,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_dar_document on delivery_address_responses (document_id);
create index if not exists idx_dar_submitted_at on delivery_address_responses (submitted_at desc);
create index if not exists idx_dar_order on delivery_address_responses (order_id);
create index if not exists idx_dar_branch on delivery_address_responses (branch_id);
create index if not exists idx_dar_phone on delivery_address_responses (customer_phone);

alter table delivery_address_responses enable row level security;

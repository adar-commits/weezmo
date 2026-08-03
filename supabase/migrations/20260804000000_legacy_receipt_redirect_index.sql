-- Fast lookup for old receipts.carpetshop.co.il/{mongoId} → documents.id redirects
create index if not exists idx_documents_legacy_mongo_id
  on documents ((payload->>'legacy_mongo_id'))
  where coalesce(payload->>'legacy_mongo_id', '') <> '';

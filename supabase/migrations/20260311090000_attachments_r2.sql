-- Add R2 storage fields to attachments
-- Date: 2026-03-11

begin;

alter table public.attachments
  add column if not exists storage_provider text default 'supabase',
  add column if not exists storage_key text;

commit;

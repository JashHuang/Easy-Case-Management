-- AI workflow migration for Easy Case Management
-- Date: 2026-03-06
-- Purpose:
-- 1) Extend attachments with AI processing fields
-- 2) Create ai_results draft table for human review flow
-- 3) Add indexes and RLS policies

begin;

-- 1) Extend attachments table for AI lifecycle
alter table public.attachments
  add column if not exists status text default 'uploaded',
  add column if not exists ai_processed_at timestamptz,
  add column if not exists ai_error text;

-- Backfill null status rows (safe for existing data)
update public.attachments
set status = 'uploaded'
where status is null;

-- Add status constraint (idempotent-safe pattern)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'attachments_status_check'
  ) then
    alter table public.attachments
      add constraint attachments_status_check
      check (status in (
        'uploaded',
        'pending_ai',
        'processing',
        'review_ready',
        'approved',
        'rejected',
        'failed'
      ));
  end if;
end
$$;

-- 2) Create ai_results table for AI draft output and review decisions
create table if not exists public.ai_results (
  id uuid primary key default gen_random_uuid(),
  attachment_id uuid not null references public.attachments(id) on delete cascade,
  case_id uuid not null references public.cases(id) on delete cascade,
  raw_output jsonb not null default '{}'::jsonb,
  normalized_output jsonb not null default '{}'::jsonb,
  review_status text not null default 'pending',
  model_name text,
  avg_confidence numeric(5,4),
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_results_review_status_check
    check (review_status in ('pending', 'approved', 'rejected')),
  constraint ai_results_avg_confidence_check
    check (avg_confidence is null or (avg_confidence >= 0 and avg_confidence <= 1))
);

-- Helpful indexes for common reads
create index if not exists idx_ai_results_attachment_id on public.ai_results (attachment_id);
create index if not exists idx_ai_results_case_id on public.ai_results (case_id);
create index if not exists idx_ai_results_review_status on public.ai_results (review_status);
create index if not exists idx_attachments_status on public.attachments (status);

-- 3) RLS
alter table public.ai_results enable row level security;

-- Policies are permissive for authenticated users to match current MVP security style.
-- Tighten later if ownership columns are introduced.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ai_results'
      and policyname = 'ai_results_select_authenticated'
  ) then
    create policy ai_results_select_authenticated
      on public.ai_results
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ai_results'
      and policyname = 'ai_results_insert_authenticated'
  ) then
    create policy ai_results_insert_authenticated
      on public.ai_results
      for insert
      to authenticated
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ai_results'
      and policyname = 'ai_results_update_authenticated'
  ) then
    create policy ai_results_update_authenticated
      on public.ai_results
      for update
      to authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'ai_results'
      and policyname = 'ai_results_delete_authenticated'
  ) then
    create policy ai_results_delete_authenticated
      on public.ai_results
      for delete
      to authenticated
      using (true);
  end if;
end
$$;

-- Optional trigger to keep updated_at fresh
create or replace function public.set_ai_results_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_ai_results_set_updated_at on public.ai_results;
create trigger trg_ai_results_set_updated_at
before update on public.ai_results
for each row
execute function public.set_ai_results_updated_at();

commit;

-- AI security hardening + observability views
-- Date: 2026-03-06

begin;

-- RLS hardening for ai_results
-- Replace permissive policies with active-user checks.
drop policy if exists ai_results_select_authenticated on public.ai_results;
drop policy if exists ai_results_insert_authenticated on public.ai_results;
drop policy if exists ai_results_update_authenticated on public.ai_results;
drop policy if exists ai_results_delete_authenticated on public.ai_results;

create policy ai_results_select_active_user
  on public.ai_results
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.status = 'active'
    )
  );

create policy ai_results_insert_active_user
  on public.ai_results
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.status = 'active'
    )
  );

create policy ai_results_update_active_user
  on public.ai_results
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.status = 'active'
    )
  )
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.status = 'active'
    )
  );

create policy ai_results_delete_active_user
  on public.ai_results
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.status = 'active'
    )
  );

-- Observability views
create or replace view public.ai_processing_metrics_daily as
select
  date(ar.created_at) as metric_date,
  count(*) as total_jobs,
  count(*) filter (where ar.error_message is not null) as failed_jobs,
  count(*) filter (where ar.error_message is null) as succeeded_jobs,
  round(avg(ar.avg_confidence)::numeric, 4) as avg_confidence,
  round(avg((ar.raw_output #>> '{metrics,total_ms}')::numeric)::numeric, 2) as avg_total_ms,
  round(avg((ar.raw_output #>> '{metrics,parse_ms}')::numeric)::numeric, 2) as avg_parse_ms,
  round(avg((ar.raw_output #>> '{metrics,extract_ms}')::numeric)::numeric, 2) as avg_extract_ms,
  round(avg((ar.raw_output #>> '{metrics,validate_ms}')::numeric)::numeric, 2) as avg_validate_ms
from public.ai_results ar
group by date(ar.created_at)
order by metric_date desc;

create or replace view public.ai_review_metrics_daily as
select
  date(ar.updated_at) as metric_date,
  count(*) filter (where ar.review_status = 'approved') as approved_count,
  count(*) filter (where ar.review_status = 'rejected') as rejected_count,
  round(
    (
      count(*) filter (where ar.review_status = 'rejected')::numeric /
      nullif(count(*) filter (where ar.review_status in ('approved', 'rejected')), 0)::numeric
    ),
    4
  ) as rejection_rate
from public.ai_results ar
group by date(ar.updated_at)
order by metric_date desc;

commit;

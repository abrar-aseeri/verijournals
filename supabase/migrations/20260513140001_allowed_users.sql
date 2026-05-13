-- Closed-beta: invitation allowlist. Magic-link login requires that the
-- email be present here with revoked_at IS NULL.
--
-- NOT YET APPLIED TO PRODUCTION.
--
-- Depends on access_requests (FK approved_from_request → access_requests.id),
-- so the access_requests migration MUST run first. The filename timestamp
-- 20260513140001 is one second after 20260513140000 to enforce that order
-- under Supabase CLI's lexicographic apply.

create table public.allowed_users (
  email text primary key,
  approved_from_request uuid references public.access_requests(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz not null default now(),
  activated_at timestamptz,
  revoked_at timestamptz,
  notes text,
  geo_exempt boolean not null default false
);

create index idx_allowed_users_active
  on public.allowed_users(email)
  where revoked_at is null;

alter table public.allowed_users enable row level security;

-- Service-role-only. /api/auth/send-magic-link, /auth/callback, and the
-- admin server actions all use the service-role client; no
-- client-session can read or write this table.
create policy "service_role_only_allowed_users"
  on public.allowed_users for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

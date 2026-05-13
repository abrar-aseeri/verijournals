-- Closed-beta: public access requests from the landing page form.
--
-- NOT YET APPLIED TO PRODUCTION. Apply via Supabase MCP / dashboard once
-- the closed-beta cutover is approved.

create table public.access_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  institution text not null,
  specialty text not null,
  reason text not null,
  saudi_residence_confirmed boolean not null,
  pdpl_acknowledged boolean not null,
  ip_address inet,
  user_agent text,
  requested_at timestamptz not null default now(),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  review_notes text
);

create index idx_access_requests_status
  on public.access_requests(status);

alter table public.access_requests enable row level security;

-- Service-role-only. /api/request-access (server route) and the admin
-- review server actions both use the service-role client; no
-- client-session can read or write this table.
create policy "service_role_only_access_requests"
  on public.access_requests for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

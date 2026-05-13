-- PDPL Article 6 consent capture — append-only audit ledger.
--
-- NOT YET APPLIED TO PRODUCTION. Apply via Supabase MCP / dashboard after
-- legal review of the consent texts in src/app/(auth)/register/page.tsx.
--
-- Withdrawal semantics: do NOT update existing rows. Insert a new row with
-- granted=false and set withdrawn_at on the prior row in a separate audit
-- query, OR insert a new row referencing the same consent_type. Treat the
-- table as append-only (no UPDATE policy below).

create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  consent_type text not null check (consent_type in (
    'terms_and_privacy',
    'pdpl_acknowledgment',
    'cross_border_transfer',
    'marketing_emails',
    'anonymized_analytics'
  )),
  granted boolean not null,
  privacy_notice_version text not null,
  granted_at timestamptz not null default now(),
  withdrawn_at timestamptz,
  ip_address inet,
  user_agent text,
  withdrawal_reason text
);

create index idx_consent_user
  on public.consent_records(user_id);

create index idx_consent_active
  on public.consent_records(user_id, consent_type, withdrawn_at)
  where withdrawn_at is null;

alter table public.consent_records enable row level security;

-- Read: every user can read only their own consent history.
create policy "users_read_own_consents"
  on public.consent_records for select
  using (auth.uid() = user_id);

-- Insert: restricted to service_role. The /api/auth/register-with-consent
-- route uses the service-role client (src/lib/supabase.ts:getAdmin); client
-- sessions cannot insert.
--
-- NOTE: spec source listed the policy as `with check (true)` without role
-- qualifier. Tightened here to `to service_role` because the spec comment
-- "INSERT routed through server-side API only; client cannot insert" is
-- contradicted by an unqualified policy (which would permit authenticated
-- clients to insert). Defense-in-depth: rely on the policy in addition to
-- the API route's use of the service-role client.
create policy "service_role_insert_consents"
  on public.consent_records for insert
  to service_role
  with check (true);

-- No UPDATE policy. Consent records are append-only.
-- No DELETE policy. Auditability requires the ledger be immutable.

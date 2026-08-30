-- ============================================================
-- Admin Auth Migration
-- Stores admin credentials in a dedicated Supabase table and
-- validates logins via a SECURITY DEFINER function using bcrypt
-- (pgcrypto). Credentials are never kept in application code.
-- ============================================================

-- 1. Enable bcrypt support
create extension if not exists pgcrypto;

-- 2. Dedicated admin table (locked down: no public RLS policies,
--    only reachable via service role / SECURITY DEFINER functions).
create table if not exists public.admin_users (
    id            uuid primary key default gen_random_uuid(),
    email         text not null unique,
    password_hash text not null,
    created_at    timestamptz not null default now()
);

alter table public.admin_users enable row level security;

-- No RLS policies are created on purpose: anon/authenticated roles
-- cannot read admin rows. The service role (used server-side only)
-- bypasses RLS, so login validation works while the table stays
-- invisible to the public API.

-- 3. Seed the default owner account.
--    Change this email/password and re-run (or update the row in the
--    Supabase Table Editor afterwards). Use a strong password.
--    (Runs dynamically so pgcrypto is resolved regardless of schema.)
do $BODY$
declare
    v_schema text;
begin
    select n.nspname into v_schema
    from pg_catalog.pg_extension e
    join pg_catalog.pg_namespace n on n.oid = e.extnamespace
    where e.extname = 'pgcrypto';

    if v_schema is null then
        raise exception 'pgcrypto extension is not installed';
    end if;

    execute format(
        'insert into public.admin_users (email, password_hash)
         select %L, %I.crypt(%L, %I.gen_salt(%L, 10))
         on conflict (email) do nothing',
        'admin@example.com', v_schema, 'changeme123', v_schema, 'bf'
    );
end;
$BODY$;

-- 4. Login verification function. Runs as the table owner (SECURITY
--    DEFINER), so it bypasses RLS. Returns true only when the email
--    exists and the bcrypt hash matches.
--    pgcrypto is resolved dynamically: on Supabase its functions live
--    in the "extensions" schema, but they may be in another schema on
--    other hosts, so a fixed search_path would break them.
create or replace function public.authenticate_admin(
    p_email text,
    p_password text
) returns boolean
language plpgsql
security definer
set search_path = ''
as $BODY$
declare
    v_schema text;
    v_ok boolean;
begin
    select n.nspname into v_schema
    from pg_catalog.pg_extension e
    join pg_catalog.pg_namespace n on n.oid = e.extnamespace
    where e.extname = 'pgcrypto';

    if v_schema is null then
        raise exception 'pgcrypto extension is not installed';
    end if;

    execute format(
        'select exists (
            select 1
            from public.admin_users
            where email = lower(trim($1))
              and password_hash = %I.crypt($2, password_hash)
        )',
        v_schema
    ) into v_ok using lower(trim(p_email)), p_password;

    return coalesce(v_ok, false);
end;
$BODY$;
-- CzechPal: a live directory of Prague GPs, dentists, children's doctors and gynaecologists.
--
-- The list comes from the official National Register of Healthcare Providers (NRPZS, ÚZIS ČR,
-- CC BY 4.0), imported by scripts/import-providers.mjs. What makes it useful for foreigners comes
-- from CzechPal users: whether a practice is taking new patients, how good its English is, and
-- whether it charges foreigners extra, each with the date it was reported.
--
-- Reports hold no free text (no reviews, nothing defamatory, no health details) and are never
-- shown individually: only the summary on the provider row is public.

create table public.providers (
  id bigint primary key,                 -- ZZ_ID in the register
  name text not null,
  provider_name text not null,
  kinds text[] not null check (cardinality(kinds) > 0 and kinds <@ array['gp', 'dentist', 'children', 'gynecology']::text[]),
  specialties text[] not null default '{}',
  district text,                         -- 'Praha 1' … 'Praha 22'
  street text,
  house_number text,
  postcode text,
  lat double precision,
  lng double precision,
  phone text,
  email text,
  website text,
  search text not null default '',       -- lowercase, without diacritics (the importer builds it)
  register_updated date not null,
  removed boolean not null default false, -- no longer in the register

  -- Community status, recomputed from provider_reports by refresh_provider_status().
  new_patients text check (new_patients in ('yes', 'no')),
  new_patients_at timestamptz,
  new_patients_yes integer not null default 0, -- reports in the last 90 days
  new_patients_no integer not null default 0,
  english text check (english in ('good', 'basic', 'none')),
  english_at timestamptz,
  extra_fee text check (extra_fee in ('yes', 'no')),
  extra_fee_at timestamptz,
  insurers text[] not null default '{}',
  reports integer not null default 0,
  last_report_at timestamptz
);

create index providers_kinds on public.providers using gin (kinds);
create index providers_district on public.providers (district);
create index providers_accepting on public.providers (new_patients_at desc) where new_patients = 'yes';

alter table public.providers enable row level security;

-- A public directory: anyone may read it; only the importer and server functions write.
create policy "Anyone can read the directory"
  on public.providers for select
  to anon, authenticated
  using (not removed);

create table public.provider_reports (
  id bigint generated always as identity primary key,
  provider_id bigint not null references public.providers (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  report_day date not null default (now() at time zone 'utc')::date,
  new_patients text check (new_patients in ('yes', 'no')),
  english text check (english in ('good', 'basic', 'none')),
  extra_fee text check (extra_fee in ('yes', 'no')),
  insurer text check (insurer in ('111', '201', '205', '207', '209', '211', '213')),
  check (new_patients is not null or english is not null or extra_fee is not null),
  -- One report per person per practice per day; reporting again that day corrects it.
  unique (provider_id, user_id, report_day)
);

create index provider_reports_provider on public.provider_reports (provider_id, created_at desc);
create index provider_reports_user on public.provider_reports (user_id, created_at desc);

-- No policies: individual reports are private. The report-provider function writes them.
alter table public.provider_reports enable row level security;

-- Recomputes the public summary of one provider from its reports.
-- New-patient status ages fastest: the latest answer from the last 180 days, with yes/no counts
-- from the last 90. English and fees change slowly: the latest answer from the last year.
create function public.refresh_provider_status(p_provider bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- Plain variables: a SELECT … INTO that finds no rows simply leaves them null.
  v_np text;
  v_np_at timestamptz;
  v_en text;
  v_en_at timestamptz;
  v_fee text;
  v_fee_at timestamptz;
begin
  select r.new_patients, r.created_at into v_np, v_np_at
  from public.provider_reports r
  where r.provider_id = p_provider and r.new_patients is not null and r.created_at > now() - interval '180 days'
  order by r.created_at desc limit 1;

  select r.english, r.created_at into v_en, v_en_at
  from public.provider_reports r
  where r.provider_id = p_provider and r.english is not null and r.created_at > now() - interval '365 days'
  order by r.created_at desc limit 1;

  select r.extra_fee, r.created_at into v_fee, v_fee_at
  from public.provider_reports r
  where r.provider_id = p_provider and r.extra_fee is not null and r.created_at > now() - interval '365 days'
  order by r.created_at desc limit 1;

  update public.providers p set
    new_patients = v_np,
    new_patients_at = v_np_at,
    new_patients_yes = (select count(*) from public.provider_reports r where r.provider_id = p_provider and r.new_patients = 'yes' and r.created_at > now() - interval '90 days'),
    new_patients_no = (select count(*) from public.provider_reports r where r.provider_id = p_provider and r.new_patients = 'no' and r.created_at > now() - interval '90 days'),
    english = v_en,
    english_at = v_en_at,
    extra_fee = v_fee,
    extra_fee_at = v_fee_at,
    insurers = coalesce((
      select array_agg(distinct r.insurer order by r.insurer) from public.provider_reports r
      where r.provider_id = p_provider and r.insurer is not null and r.created_at > now() - interval '365 days'
    ), '{}'),
    reports = (select count(*) from public.provider_reports r where r.provider_id = p_provider),
    last_report_at = (select max(r.created_at) from public.provider_reports r where r.provider_id = p_provider)
  where p.id = p_provider;
end;
$$;

revoke all on function public.refresh_provider_status(bigint) from public, anon, authenticated;
grant execute on function public.refresh_provider_status(bigint) to service_role;

-- The directory search. Practices recently reported as taking new patients come first, then
-- those reported to speak English, then alphabetical. Runs with the caller's rights, so the
-- read policy above applies.
create function public.search_providers(
  p_kind text,
  p_district text default null,
  p_query text default null,
  p_new_patients boolean default false,
  p_english boolean default false,
  p_limit integer default 40,
  p_offset integer default 0
)
returns setof public.providers
language sql
stable
security invoker
set search_path = ''
as $$
  select p.*
  from public.providers p
  where p_kind = any (p.kinds)
    and not p.removed
    and (p_district is null or p.district = p_district)
    and (p_query is null or p.search like '%' || p_query || '%')
    and (not p_new_patients or (p.new_patients = 'yes' and p.new_patients_at > now() - interval '90 days'))
    and (not p_english or p.english in ('good', 'basic'))
  order by
    (p.new_patients = 'yes' and p.new_patients_at > now() - interval '90 days') desc nulls last,
    (p.english = 'good') desc nulls last,
    (p.english = 'basic') desc nulls last,
    p.name
  limit least(greatest(p_limit, 1), 100)
  offset greatest(p_offset, 0);
$$;

grant execute on function public.search_providers(text, text, text, boolean, boolean, integer, integer) to anon, authenticated;

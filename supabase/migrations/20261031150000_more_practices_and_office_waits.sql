-- CzechPal: more kinds of practice in the directory, and live waiting times at immigration offices.

-- 1. Pharmacies, psychiatrists and psychologists join the directory (same register, same import).
alter table public.providers drop constraint providers_kinds_check;
alter table public.providers add constraint providers_kinds_check check (
  cardinality(kinds) > 0
  and kinds <@ array['gp', 'dentist', 'children', 'gynecology', 'psychiatry', 'psychology', 'pharmacy']::text[]
);

-- 2. Waiting times at the Ministry of the Interior's offices for foreigners in Prague, as reported
-- by people who are there. The office list itself is official data shipped with the app
-- (src/lib/visa/offices.ts); this table only holds the reports. Reports are private; the app
-- reads today's summary through office_waits_today().
create table public.office_reports (
  id bigint generated always as identity primary key,
  office_id text not null check (office_id in ('zukovskeho', 'chodov', 'hladkov', 'kolbenova', 'pekarska', 'specialised')),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  booked boolean not null,                         -- had an appointment
  wait text check (wait in ('under30', '30to60', '1to2h', 'over2h')),
  tickets_gone boolean not null default false,     -- walk-in tickets had run out
  check (wait is not null or tickets_gone)
);

create index office_reports_recent on public.office_reports (office_id, created_at desc);
create index office_reports_user on public.office_reports (user_id, created_at desc);

-- No policies: individual reports are private. The report-office function writes them.
alter table public.office_reports enable row level security;

-- Today's reports per office (Prague time): the latest one for booked and for walk-in visitors,
-- and how many there were. Waiting times only mean something on the day they happen.
create function public.office_waits_today()
returns table (
  office_id text,
  reports integer,
  walk_in_wait text,
  walk_in_at timestamptz,
  booked_wait text,
  booked_at timestamptz,
  tickets_gone_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  with today as (
    select r.*
    from public.office_reports r
    where (r.created_at at time zone 'Europe/Prague')::date = (now() at time zone 'Europe/Prague')::date
  )
  select
    t.office_id,
    count(*)::integer,
    (select w.wait from today w where w.office_id = t.office_id and not w.booked and w.wait is not null order by w.created_at desc limit 1),
    (select max(w.created_at) from today w where w.office_id = t.office_id and not w.booked and w.wait is not null),
    (select w.wait from today w where w.office_id = t.office_id and w.booked and w.wait is not null order by w.created_at desc limit 1),
    (select max(w.created_at) from today w where w.office_id = t.office_id and w.booked and w.wait is not null),
    (select max(w.created_at) from today w where w.office_id = t.office_id and w.tickets_gone)
  from today t
  group by t.office_id;
$$;

revoke all on function public.office_waits_today() from public;
grant execute on function public.office_waits_today() to anon, authenticated;

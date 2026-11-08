-- CzechPal: official contacts beyond healthcare, for the Find tab.
--
-- Imported by scripts/import-places.mjs from public official sources:
-- - town halls (Prague district offices) and notaries: the list of public authorities
--   (Seznam orgánů veřejné moci, open data published daily on czechpoint.cz);
-- - embassies and consulates: the Ministry of Foreign Affairs directory of foreign missions
--   (mzv.gov.cz, "Adresář diplomatických misí").
-- Only office details are kept (address, phone, e-mail, website, hours). Named people, such as
-- an embassy's head of mission, are left out.

create table public.places (
  id text primary key,                   -- '<source>:<id in that source>'
  kind text not null check (kind in ('town_hall', 'notary', 'embassy', 'consulate')),
  name text not null,
  country text,                          -- embassies and consulates: the country, in English
  address text,                          -- one line, as published
  district text,                         -- 'Praha 6'
  lat double precision,
  lng double precision,
  phone text,
  email text,
  website text,
  data_box text,                         -- datová schránka ID
  hours text[] not null default '{}',    -- display lines, e.g. 'Mon 08:00–17:00'
  extra jsonb not null default '{}',     -- e.g. an embassy's consular section
  search text not null default '',       -- lowercase, without diacritics (built by the importer)
  source text not null check (source in ('ovm', 'mzv')),
  source_url text,
  checked_on date not null,
  removed boolean not null default false -- no longer in the source
);

create index places_kind on public.places (kind) where not removed;

alter table public.places enable row level security;

-- A public directory: anyone may read it; only the importer writes.
create policy "Anyone can read places"
  on public.places for select
  to anon, authenticated
  using (not removed);

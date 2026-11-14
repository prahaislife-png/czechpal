-- CzechLocal: every public outdoor place in Prague, for the Explore map.
--
-- Imported by scripts/import-explore.mts from OpenStreetMap (© OpenStreetMap contributors,
-- ODbL 1.0): parks, public gardens, playgrounds, outdoor gyms, sports pitches, running tracks,
-- viewpoints, nature reserves, named woods, dog parks and swimming spots. Private and
-- school-only places are left out. Places CzechLocal wrote up by hand ('curated') carry its own
-- description. Only lasting facts are stored: no opening hours, prices or live information.

create table public.explore_places (
  id text primary key,                   -- 'osm:w123' (OpenStreetMap way 123) or 'cz:<slug>'
  name text not null,                    -- the real name, or a plain label for unnamed places
  name_cs text,                          -- Czech name, when the English one differs
  named boolean not null default true,   -- false when `name` is a label like 'Playground in Žižkov'
  category text not null check (category in ('park', 'viewpoint', 'sports', 'garden', 'playground', 'leisure', 'nature', 'hidden')),
  district text not null,                -- municipal district: 'Praha 7', 'Praha-Troja'
  quarter text,                          -- neighbourhood: 'Holešovice'
  lat double precision not null check (lat between 49.9 and 50.2),
  lng double precision not null check (lng between 14.2 and 14.8),
  area_ha real,                          -- parks, gardens and woods
  activities text[] not null default '{}' check (activities <@ array['walk', 'viewpoint', 'workout', 'cycling', 'sport', 'kids', 'nature', 'garden', 'hidden']),
  attributes text[] not null default '{}',
  description text not null,
  photo_url text,
  photo_credit text,
  source text not null check (source in ('osm', 'curated')),
  source_url text,                       -- the place on openstreetmap.org
  search text not null default '',       -- lowercase, without diacritics (built by the importer)
  checked_on date not null,
  removed boolean not null default false, -- gone from OpenStreetMap at the last import
  check ((photo_url is null) = (photo_credit is null))
);

alter table public.explore_places enable row level security;

-- Public reference data: anyone may read it; only the importer writes.
create policy "Anyone can read explore places"
  on public.explore_places for select
  to anon, authenticated
  using (not removed);

-- CzechPal: a retry of an explanation the user was charged for but never received is free.
--
-- If the connection dies after the server finished, the user saw nothing but the explanation
-- was counted. When the app retries the same case with the same content within 15 minutes,
-- it isn't counted again.
--
-- Privacy: only the app's request id (the case id) and a SHA-256 fingerprint of the input are
-- stored, never the content. The fingerprint also stops a reused id from explaining new text for free.

create table public.analysis_charges (
  user_id uuid not null references auth.users (id) on delete cascade,
  request_id text not null check (char_length(request_id) between 1 and 64),
  input_hash text not null check (input_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  primary key (user_id, request_id)
);

-- No policies: only server functions (secret key) use it.
alter table public.analysis_charges enable row level security;

-- True when this exact request was charged in the last 15 minutes.
create function public.already_charged(p_user uuid, p_request text, p_hash text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.analysis_charges
    where user_id = p_user
      and request_id = p_request
      and input_hash = p_hash
      and created_at > now() - interval '15 minutes'
  );
$$;

-- Remembers a successful, charged explanation; clears this user's stale entries on the way.
create function public.record_charge(p_user uuid, p_request text, p_hash text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.analysis_charges
  where user_id = p_user and created_at < now() - interval '1 day';
  insert into public.analysis_charges (user_id, request_id, input_hash)
  values (p_user, p_request, p_hash)
  on conflict (user_id, request_id) do update
    set input_hash = excluded.input_hash, created_at = now();
$$;

-- Forgets a charge that was refunded, so a later retry is charged normally.
create function public.forget_charge(p_user uuid, p_request text)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.analysis_charges where user_id = p_user and request_id = p_request;
$$;

-- Explanations left this month, without reserving one (for a free retry's response).
create function public.remaining_analyses(p_user uuid, p_limit integer)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select greatest(p_limit - coalesce((
    select used from public.usage
    where user_id = p_user and month = to_char(now() at time zone 'utc', 'YYYY-MM')
  ), 0), 0);
$$;

revoke all on function public.already_charged(uuid, text, text) from public, anon, authenticated;
revoke all on function public.record_charge(uuid, text, text) from public, anon, authenticated;
revoke all on function public.forget_charge(uuid, text) from public, anon, authenticated;
revoke all on function public.remaining_analyses(uuid, integer) from public, anon, authenticated;
grant execute on function public.already_charged(uuid, text, text) to service_role;
grant execute on function public.record_charge(uuid, text, text) to service_role;
grant execute on function public.forget_charge(uuid, text) to service_role;
grant execute on function public.remaining_analyses(uuid, integer) to service_role;

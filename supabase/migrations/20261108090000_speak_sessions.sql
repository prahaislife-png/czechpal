-- Speak Czech: voice conversation sessions, the daily allowance, and the server's time limit.
-- No audio and no transcript is stored here: only who, when, which situation and for how long.

create table public.speak_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  situation text not null,
  model text not null,
  -- The longest this session may run; the server hangs up after it.
  limit_seconds integer not null check (limit_seconds > 0),
  provider_session_id text,
  status text not null default 'starting' check (status in ('starting', 'active', 'ended', 'failed')),
  ended_at timestamptz,
  -- Seconds counted against the allowance (and the voice cost log).
  billed_seconds integer check (billed_seconds >= 0),
  end_reason text,
  hangup_confirmed boolean
);

create index speak_sessions_user_recent on public.speak_sessions (user_id, created_at desc);
create index speak_sessions_open on public.speak_sessions (created_at) where status in ('starting', 'active');

-- No policies: clients can neither read nor write. Only server functions (secret key) use it.
alter table public.speak_sessions enable row level security;

-- Seconds used today (Prague calendar day): finished sessions as billed, open ones at their full limit.
create function public.speak_seconds_used(p_user uuid)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(case when s.status in ('ended', 'failed') then coalesce(s.billed_seconds, 0) else s.limit_seconds end), 0)::integer
  from public.speak_sessions s
  where s.user_id = p_user
    and s.created_at >= (date_trunc('day', now() at time zone 'Europe/Prague') at time zone 'Europe/Prague');
$$;

-- Reserve a session atomically: one open session per user, within today's allowance.
-- out_used = -1 means another session is still open; out_session null otherwise means no time left.
create function public.reserve_speak_session(p_user uuid, p_situation text, p_model text, p_daily integer, p_max integer, p_min integer)
returns table (out_session uuid, out_limit integer, out_used integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_used integer;
  v_limit integer;
  v_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user::text, 7));
  if exists (select 1 from public.speak_sessions s where s.user_id = p_user and s.status in ('starting', 'active')) then
    return query select null::uuid, 0, -1;
    return;
  end if;
  v_used := public.speak_seconds_used(p_user);
  v_limit := least(p_max, p_daily - v_used);
  if v_limit < p_min then
    return query select null::uuid, 0, v_used;
    return;
  end if;
  insert into public.speak_sessions (user_id, situation, model, limit_seconds)
  values (p_user, p_situation, p_model, v_limit)
  returning id into v_id;
  return query select v_id, v_limit, v_used;
end;
$$;

revoke all on function public.speak_seconds_used(uuid) from public, anon, authenticated;
revoke all on function public.reserve_speak_session(uuid, text, text, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.speak_seconds_used(uuid) to service_role;
grant execute on function public.reserve_speak_session(uuid, text, text, integer, integer, integer) to service_role;

-- Meanings, typed replies and the review after a conversation are logged as 'speak' AI calls.
alter table public.ai_calls drop constraint if exists ai_calls_kind_check;
alter table public.ai_calls
  add constraint ai_calls_kind_check check (kind in ('analyze', 'reply', 'compose', 'translate', 'learn', 'speak'));

-- Every minute, hang up any session that has run past its limit (the app normally ends it first).
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'speak-sweep',
  '* * * * *',
  $$select net.http_post(
      url := 'https://utsmmdggvbsyelcsmvyo.supabase.co/functions/v1/speak-sweep',
      headers := '{"Content-Type": "application/json", "apikey": "sb_publishable_YoS-WJsCQWtaGSg2mPC7Rg_RnELHjXB"}'::jsonb,
      body := '{}'::jsonb
    )$$
);

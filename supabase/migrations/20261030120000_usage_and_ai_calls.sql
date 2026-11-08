-- CzechPal: server-side free allowance and AI cost log.
-- Document content is never stored here: only who, when, which model, and token counts.

-- Free explanations per user per calendar month (UTC). Only the server changes this table.
create table public.usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  month text not null check (month ~ '^\d{4}-\d{2}$'),
  used integer not null default 0 check (used >= 0),
  primary key (user_id, month)
);

alter table public.usage enable row level security;

create policy "Users can read their own usage"
  on public.usage for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- One row per AI call, for cost tracking and rate limiting.
create table public.ai_calls (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  kind text not null check (kind in ('analyze', 'reply')),
  model text not null,
  input_tokens integer,
  output_tokens integer,
  cache_read_tokens integer,
  ok boolean not null,
  error text
);

create index ai_calls_user_recent on public.ai_calls (user_id, created_at desc);

-- No policies: clients can neither read nor write. Only server functions (secret key) use it.
alter table public.ai_calls enable row level security;

-- Atomically reserve one explanation. Returns how many are left after this one,
-- or -1 when the month's allowance is already used up.
create function public.reserve_analysis(p_user uuid, p_limit integer)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_month text := to_char(now() at time zone 'utc', 'YYYY-MM');
  v_used integer;
begin
  insert into public.usage as u (user_id, month, used)
  values (p_user, v_month, 1)
  on conflict (user_id, month) do update
    set used = u.used + 1
    where u.used < p_limit
  returning used into v_used;

  if v_used is null then
    return -1;
  end if;
  return p_limit - v_used;
end;
$$;

-- Give a reserved explanation back when the AI call fails or the photo is unreadable.
create function public.refund_analysis(p_user uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.usage
  set used = greatest(used - 1, 0)
  where user_id = p_user
    and month = to_char(now() at time zone 'utc', 'YYYY-MM');
$$;

revoke all on function public.reserve_analysis(uuid, integer) from public, anon, authenticated;
revoke all on function public.refund_analysis(uuid) from public, anon, authenticated;
grant execute on function public.reserve_analysis(uuid, integer) to service_role;
grant execute on function public.refund_analysis(uuid) to service_role;

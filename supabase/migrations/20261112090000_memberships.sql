-- CzechLocal Plus: who has it, as the store last confirmed.
--
-- The app buys Plus through the App Store (RevenueCat). The server never takes the app's word for
-- it: the `membership` function asks the store itself and writes the answer here. Explanations
-- and form guides skip the monthly count while plus_until is in the future. When a period ends
-- and nothing renews it, the date simply passes; nothing has to be cleaned up.
--
-- Nothing about the purchase is stored beyond which product and until when.

create table public.memberships (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- The end of the paid period (or of its grace period). Null: no Plus.
  plus_until timestamptz,
  product text,
  checked_at timestamptz not null default now()
);

-- Only the service role (the Edge Functions) reads or writes this table.
alter table public.memberships enable row level security;

create function public.has_plus(p_user uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships m
    where m.user_id = p_user and m.plus_until is not null and m.plus_until > now()
  );
$$;

revoke all on function public.has_plus(uuid) from public, anon, authenticated;
grant execute on function public.has_plus(uuid) to service_role;

-- Form guides are logged as their own kind of AI call.
alter table public.ai_calls drop constraint if exists ai_calls_kind_check;
alter table public.ai_calls
  add constraint ai_calls_kind_check check (kind in ('analyze', 'reply', 'compose', 'translate', 'learn', 'speak', 'form'));

-- CzechLocal: AI calls are counted when they start, not when they finish.
--
-- Until now the limits were checked against calls that had already been logged, and a call is
-- logged only once Claude has answered. Requests sent together all passed the check before any of
-- them was counted, so the per-minute and per-day limits could be skipped by sending in parallel.
--
-- claim_ai_call checks the limits and writes the call's row in one step, one user at a time, and
-- returns the row's id (or -1: too many this minute, -2: too many today). The function that makes
-- the call fills the row in when it ends. A call that never reports back stays as 'started', and
-- still counts.
--
-- Nothing about the content is stored, as before: who, when, which kind, which model.

create function public.claim_ai_call(
  p_user uuid,
  p_kind text,
  p_model text,
  p_per_minute integer,
  -- The kinds that share the per-minute limit (explanations, replies and messages share one).
  p_minute_kinds text[],
  -- Calls of this kind allowed in 24 hours; null for no daily limit.
  p_per_day integer default null
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
  v_id bigint;
begin
  -- One claim at a time per user, so two requests can't both see room for one more.
  perform pg_advisory_xact_lock(hashtextextended(p_user::text, 11));

  select count(*) into v_count
  from public.ai_calls c
  where c.user_id = p_user
    and c.kind = any (p_minute_kinds)
    and c.created_at > now() - interval '1 minute';
  if v_count >= p_per_minute then
    return -1;
  end if;

  if p_per_day is not null then
    select count(*) into v_count
    from public.ai_calls c
    where c.user_id = p_user
      and c.kind = p_kind
      and c.created_at > now() - interval '1 day';
    if v_count >= p_per_day then
      return -2;
    end if;
  end if;

  insert into public.ai_calls (user_id, kind, model, ok, error)
  values (p_user, p_kind, p_model, false, 'started')
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.claim_ai_call(uuid, text, text, integer, text[], integer) from public, anon, authenticated;
grant execute on function public.claim_ai_call(uuid, text, text, integer, text[], integer) to service_role;

-- The daily count looks up one user's calls of one kind over a day.
create index ai_calls_user_kind_recent on public.ai_calls (user_id, kind, created_at desc);

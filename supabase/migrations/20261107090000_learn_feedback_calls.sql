-- A2 Academy writing feedback is logged like other AI calls (size and result, never the text),
-- for cost and its own rate limits. It doesn't use the free explanations.
alter table public.ai_calls drop constraint ai_calls_kind_check;
alter table public.ai_calls add constraint ai_calls_kind_check check (kind in ('analyze', 'reply', 'compose', 'translate', 'learn'));

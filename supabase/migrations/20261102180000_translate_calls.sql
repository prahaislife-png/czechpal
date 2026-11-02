-- Quick translations from Home's camera are logged like other AI calls, for cost and their own rate limits.
alter table public.ai_calls drop constraint ai_calls_kind_check;
alter table public.ai_calls add constraint ai_calls_kind_check check (kind in ('analyze', 'reply', 'compose', 'translate'));

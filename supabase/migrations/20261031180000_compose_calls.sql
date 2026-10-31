-- Messages written from scratch ("Write in Czech") are logged and rate-limited like replies.
alter table public.ai_calls drop constraint ai_calls_kind_check;
alter table public.ai_calls add constraint ai_calls_kind_check check (kind in ('analyze', 'reply', 'compose'));

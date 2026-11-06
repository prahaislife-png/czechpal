# A2 Academy: migration plan

## Principle

Nothing a learner already has is rewritten. New data goes into a new store; existing stores only gain
optional fields.

## Existing store `czechpal-learn` (version 1) – unchanged version

| Change | Why it's safe |
|---|---|
| `profile.minutes` may also be 20 or 30 | Existing values (5/10/15) stay valid; readers fall back to 5 for unknown values |
| `profile` gains optional `level: 'unsure'`, `target`, `difficulty` | Optional; absent means "not answered" |

No `migrate` function is needed. Rollback: older builds ignore unknown fields; a minutes value of 20/30
in an older build is read through the existing `as DailyMinutes` cast and sizes fall back via `?? 5`.

## New store `czechpal-academy` (version 1)

Holds: onboarding answers specific to the Academy, diagnostic result, learning attempts (capped),
lesson completion, and (Phase 2) mistakes and writing attempts. Created empty on first use.

- Each record has a stable content id **and** the content version it was made against, so a later
  content change doesn't silently reinterpret old attempts.
- A `migrate(persisted, version)` function is defined from version 1 on; future versions add steps.
- **Delete everything** clears it together with the other stores.
- Rollback: an older build never reads this key; the data is left in place and picked up again.

## Remote data

None in Phase 1. Learning data stays on the phone, as today. If a later phase adds AI feedback, only
the text the learner submits (after consent) is sent, and nothing is stored server-side beyond the
existing usage log (kind of request, no content).

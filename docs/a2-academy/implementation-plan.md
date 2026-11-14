# A2 Academy: implementation plan

Principle: TEACH → PRACTISE → CHECK → EXPLAIN → RETEST → TRACK. Vertical slices, each tested before the next.

## Architecture

```
src/lib/academy/           pure TypeScript, tested with node:test
  content/                 public curriculum data (versioned, with provenance)
    topics.ts              14 topics → objectives, vocabulary ids, linked texts/situations
    grammar.ts             grammar foundations (short explanation + examples, tagged)
    lessons/*.ts           lessons: goal → introduce → context → recall → feedback → independent task
    diagnostic.ts          the diagnostic items (original)
    types.ts               ContentMeta (id, version, level, topic, objectives, skill, task type,
                           difficulty, review status, provenance, licence) + item types
  evidence.ts              attempts → per-skill and per-objective evidence (counts, recency,
                           independent vs assisted, unseen vs seen)
  readiness.ts             evidence → readiness status per skill and overall; thresholds from exam.ts
  roadmap.ts               evidence → topic state NOT_STARTED | LEARNING | PRACTISED | MASTERED
  mistakes.ts              mistake patterns → explanation, remediation, retest schedule   (Phase 2)
  plan.ts                  today's plan: rule-based, from weakness, backlog, minutes, exam date
src/store/academy.ts       new persisted store `czechlocal-academy` (attempts, mistakes, onboarding,
                           diagnostic result); cleared by Delete everything
src/app/academy/*          screens (stack inside Learn)
src/lib/learn/exam.ts      the single source of exam rules (extended from exam-spec-2026.md)
```

Rules are deterministic. AI never decides mastery; it only writes feedback and estimates against a
declared rubric (Phase 2+), clearly marked as an estimate.

## Phase 1 – Foundation (this delivery)

1. Exam rules in `exam.ts`: tasks, points, timings, word minimums, Task 2 zero rule, both thresholds.
2. Curriculum data model + 14 topics (proposed teaching taxonomy) mapped to existing texts,
   situations and vocabulary; first lessons for topics 1–3.
3. Grammar foundations: navigable list of 18 items with short explanations and examples.
4. Evidence store and readiness/mastery rules (unit-tested).
5. Onboarding: level (Beginner/A1/Some A2/Unsure), target, exam date, 5–30 min, main difficulty.
   Explanation language reuses the app setting.
6. Diagnostic (original items): vocabulary, present and past tense, short reading, listening (when a
   Czech voice exists), a short written answer with word count and checklist. No speaking item until
   recording exists. Results show evidence limits ("not enough assessed practice yet").
7. A2 Academy home in Learn: Continue learning, Today's plan, Your readiness, What needs work; the
   other destinations grouped below (only those that work).
8. Verified exam information screen with both thresholds explained.
9. Daily plan extended: 20/30 minutes; weakest skill first; links only to working activities.

Gate: unit tests for exam rules, evidence, readiness, roadmap, plan; typecheck; lint; web walkthrough
of onboarding → diagnostic → plan → lesson → progress saved after reload; regression smoke of Home,
Find, Explore, existing Learn.

## Phase 2 – Training engines

Reading trainer (formats 1–5, learn and exam modes), listening trainer (TTS-based, formats 1–5),
Writing coach (Task 1 and Task 2 with live word count, checklist, Task 2 zero rule, saved attempts;
AI feedback via a new `learn-feedback` Edge Function with rubric + own quota — **needs approval to
deploy**), speaking recording + replay + self-review (`expo-audio`, microphone permission, privacy
policy update), Mistake memory.

## Phase 3 – Exam preparation

Speaking tasks 2–4 as guided practice; transcription once a speech-to-text route is approved;
timed section simulations; full mock exam with separate written and oral results; post-exam plan.

## Phase 4 – Content and polish

Topics 4–14 lessons, more original items, holdout pools, accessibility and performance passes.

## Decisions needed from the owner (later phases)

1. Speech-to-text: Apple on-device recognition (free, iPhone builds only) or a cloud provider
   (paid, new data processor).
2. Deploying the `learn-feedback` Edge Function and its daily limit.
3. Recorded human audio for listening (cost, voices).

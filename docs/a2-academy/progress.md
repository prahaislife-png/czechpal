# A2 Academy – progress

Last updated 6 November 2026 (Phase 2).

## Phase 0 – Audit and verified exam spec: done

- `repository-audit.md`, `implementation-plan.md`, `migration-plan.md`, `exam-spec-2026.md`.
- Exam facts checked against the organiser's own pages and PDFs (sources S1–S5 in the spec).

## Phase 1 – Foundation: done

| Item | Where | State |
|---|---|---|
| Exam rules: tasks, points, timings, word minimums, e-mail zero rule, both pass marks | `src/lib/learn/exam.ts` | Done, tested |
| Curriculum model with provenance and versions | `src/lib/academy/types.ts`, `make.ts` | Done |
| 14 topics mapped to existing texts, situations and grammar | `src/lib/academy/topics.ts` | Done, links tested |
| Lessons for topics 1–3 (6 lessons, 46 exercises) | `src/lib/academy/lessons.ts` | Done, AI-checked |
| Grammar foundations (18 items) | `src/lib/academy/grammar.ts`, `(tabs)/learn/grammar/*` | Done, AI-checked |
| Starting check (12 items; listening only with a Czech voice; no speaking) | `src/lib/academy/diagnostic.ts`, `src/app/diagnostic.tsx` | Done |
| Deterministic marking (choices, typed answers, written-answer rules) | `src/lib/academy/grade.ts` | Done, tested |
| Evidence, readiness per skill, what needs work | `src/lib/academy/evidence.ts` | Done, tested |
| Roadmap and mastery (two passes ≥ 2 days apart) | `src/lib/academy/roadmap.ts` | Done, tested |
| Rule-based daily plan, 5–30 minutes, hardest skill first | `src/lib/academy/plan.ts`, `use-plan.ts` | Done, tested |
| Private store, cleared by Delete everything | `src/store/academy.ts` (`czechpal-academy` v1) | Done |
| Setup (level, exam date, minutes, hardest skill) | `src/app/a2-setup.tsx` | Done |
| A2 Academy home, Learn card, topics, topic, lesson player, exam info | `src/app/...` | Done |

### Rules as built

- **Evidence that counts:** first answers to an item version, in a check or the starting check, that
  can be marked. Practice (hints and retries), repeats and self-checked writing never count.
- **Readiness:** not assessed (0 items) → shown as "Not enough assessed practice yet" under 8 items →
  building (< 40%), developing (< 60%), getting close (≥ 60%) over the latest 30. A drop of 25 points
  in the latest 8 against the 8 before shows "Needs practice". There is no "Ready" state: it needs a
  full exam-format practice test (Phase 3). Speaking shows "Comes with recording".
- **Topic states:** not started → learning (any lesson activity) → practised (every lesson done) →
  mastered (every lesson's check passed at 80% twice, at least two calendar days apart).
- **Check comes back:** two days after its first pass, or the next day after a check that didn't pass.
- **Daily plan order:** starting check → due checks (max 2) → next lesson → the hardest skill's
  activity → grammar missed lately → due words → a story from the topic → listening (with a voice).
  Fits the minutes; always at least one step.
- **Options** in multiple choice are shown in a stable shuffled order per item.

### Quality gate

- `npx tsc --noEmit`: passes (app and tests).
- `npx expo lint`: no warnings or errors.
- `npm test`: 155 tests pass, 34 of them new for the Academy (exam rules, word counts, pass logic,
  content integrity, marking, evidence, readiness, roadmap, plan).
- Web walkthrough (375 × 812): setup → starting check → plan → lesson → reload: progress, roadmap,
  readiness and plan all restored. Home, Find and Explore render with no console errors.
- Not tested on an iPhone yet, and not with a Czech voice (the web browser had none, so listening
  items were correctly left out).

### Known limits

- Every lesson, exercise and grammar page is checked by AI, not by a teacher, and says so.
- Lessons are explained in English only; the app's explanation language isn't used for them yet.
- Topics 4–14 show their grammar, texts and phrases, but no lessons yet.
- No speaking practice or scoring: recording and speech-to-text need an owner decision (see the plan).

## Phase 2 – Training engines: done (except AI writing feedback)

| Item | Where | State |
|---|---|---|
| Reading practice, tasks 1–5 (one original set each, 25 items) | `src/lib/academy/tasks/reading.ts` | Done, AI-checked |
| Listening practice, tasks 1–5 (one original set each, 25 items, device voice) | `src/lib/academy/tasks/listening.ts` | Done, AI-checked |
| Task player: learn mode (marked at once, replay, slower) and exam mode (two plays per recording, marked at the end, answers changeable until Next) | `src/app/a2-task/[id].tsx` | Done |
| Marking of written information (case, punctuation, "Kč" = "korun"; accents count) | `src/lib/academy/tasks/index.ts` | Done, tested |
| Writing coach: 2 forms, 2 e-mails; live word count, 35-word zero rule, greeting, closing, signature, sentences per picture; checklist and model answer; attempts saved | `src/app/a2-writing/[id].tsx` | Done, no score given |
| Mistake memory: items whose latest answer was wrong, from lessons, the starting check and exam tasks; put right in review | `src/app/a2-mistakes.tsx`, `evidence.ts`, `catalog.ts` | Done, tested |
| Exam practice hub | `(tabs)/learn/practice.tsx` | Done |
| Daily plan: mistakes (3 or more), exam practice in the hardest skill once a lesson is done, least-done set first | `src/lib/academy/plan.ts` | Done, tested |
| Lessons for topics 4–8 (one each: my day, free time, work, health, shopping) | `src/lib/academy/lessons.ts` | Done, AI-checked |

Store: `czechpal-academy` stays version 1; `tasks` and `writing` were added as fields that default to
empty, so existing progress loads unchanged.

### Quality gate

- Typecheck (app and tests) and lint: clean.
- `npm test`: 170 pass (15 new: task formats against the exam's items, answer validity and spread,
  written-information marking, scoring, mistakes, writing rules, plan rules).
- Web walkthrough (375 × 812): practice hub; reading 2 and 5 in exam mode, including changing an
  answer; the e-mail coach with live checks and the model answer; mistake review; Academy home with
  the new plan steps. No console errors.
- Not tested on an iPhone, and listening tasks not heard (no Czech voice in the browser; they
  correctly show "Needs a Czech voice").

### Not done in Phase 2, waiting on the owner

- **Speaking recording**: approved by the owner on 2026-11-06 and added (see below).
- **AI writing feedback** (a `learn-feedback` Edge Function with its own limit): needs approval to
  deploy and costs API usage.

### Known limits

- All content is AI-checked, not teacher-reviewed, and says so.
- One set per exam task so far; repeating a set shows memory more than skill. More sets are Phase 4.
- Pictures in listening 4 and the e-mail are icons with captions, not drawings.
- One device voice reads every speaker in a dialogue.
- Topics 9–14 have no lessons yet.

## Phase 2b – Speaking practice with recording: done

Approved by the owner on 2026-11-06.

| Item | Where | State |
|---|---|---|
| Speaking tasks 1–4, two original sets each: 8 questions on 2 topics; 2 dialogues with 3 card cues and 1 own question (vy); a 4-picture story in the past; agreeing with a friend on 1 of 3 pictures (ty) | `src/lib/academy/tasks/speaking.ts` | Done, AI-checked |
| Speaking player: the examiner's or friend's lines read by the device voice (or shown when there's none), record each answer, play it back, one good answer to compare, the examiner's reply, self-check list at the end | `src/app/a2-speaking/[id].tsx` | Done, no score given |
| Recordings: one per prompt, a new take replaces the old, kept in the app's documents folder only, never uploaded; mono 64 kbit/s; a take stops by itself after 2 minutes; deleted per task or with Delete everything | `src/lib/academy/recordings.ts`, Settings | Done |
| Microphone permission: asked only when you first tap Record; without it the practice still works (say it aloud, compare) | `app.json` (`expo-audio` plugin; the same text for image picker and camera so none removes it) | Done |
| Privacy policy: microphone section, recordings stay on the phone | `docs/privacy.html` | Done |
| Daily plan: speaking practice for learners who find speaking hardest, and in the least-practised rotation | `src/lib/academy/plan.ts` | Done, tested |

Store: `speaking` (runs: how many answers were recorded) added within version 1, defaulting to empty.
New dependency: `expo-audio` (~58.0.11), included in Expo Go; a new TestFlight build is needed for
the microphone permission text and module. No background audio mode is added.

Quality gate: typecheck, lint and 176 tests pass (6 new: task shapes against the exam, ids,
provenance, the voice's reading of "rád/a", plan rotation). Web walkthrough of all four tasks with
the microphone blocked (the fallback path); no console errors. Not tested: an actual recording and
playback on an iPhone.

Limits: nothing is scored, since CzechPal can't yet judge speech; the examiner's lines use one
device voice; written questions show both forms ("bydlel/a") and the voice reads the first.

## Next: Phase 3 – Exam preparation

Timed section simulations, a full mock exam with separate written and oral results (speaking
self-reviewed), and a guided run through all four speaking tasks.

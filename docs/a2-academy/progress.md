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

## Phase 3 – Exam preparation: done

| Item | Where | State |
|---|---|---|
| Mock exam content kept unseen: one set for each reading and listening task (50 items) and a form and an e-mail, marked `pool: 'mock'` and left out of Exam practice and the daily plan | `src/lib/academy/tasks/mock.ts` | Done, AI-checked |
| Mock model: the four parts in the exam's order and times; reading and listening marked one point an item, per task; writing checked by the exam's hard rules only (form answers under 10 words, the e-mail's 35-word zero rule); speaking runs all four tasks, one set each, the one practised least | `src/lib/academy/mock.ts` | Done, tested |
| Written-part outlook without a writing score: reading + listening against 42 of 70 gives "reached", "writing needs at least N of M" or "out of reach"; an e-mail under 35 words leaves only the form's 8 points | `writtenOutlook` in `mock.ts` | Done, tested |
| Mock hub: start, parts with status, results so far, the 3 weakest tasks linked to practice, earlier mocks, discard | `(tabs)/learn/mock.tsx` | Done |
| Timed sections: reading 40:00 and writing 25:00 count down (wall clock, so leaving the app doesn't stop it), a 5-minute warning, answers locked when time is up; listening follows its recordings, two plays each; an answer sheet to jump between questions; answers change until hand-in; a handed-in part can't be redone by accident | `src/app/a2-mock/[section].tsx` | Done |
| Speaking run: the four speaking tasks one after another, saved to the mock; earlier takes aren't counted | `src/app/a2-speaking/[id].tsx` (`mock` param) | Done |
| Mock answers are evidence (source `mock`: fresh, independent) and wrong ones come back in mistake review | `evidence.ts`, `catalog.ts` | Done, tested |
| After the exam: once the exam date has passed, Academy home asks how it went; passed (certificate within 30 days), waiting, or not this time (whole exam again, at the earliest 3 months later, at most 3 times a year; set a new date, take a mock) | `academy.tsx`, `afterExam` in `exam.ts` (handbook S3 p.10–11) | Done |
| Shared task parts (passage, recording, answers, review) for practice and the mock | `src/components/academy/task-parts.tsx` | Done |

Store: `mocks` (last 10) and `examResult` added within version 1, defaulting to empty.
No new dependencies, no server changes.

Quality gate: typecheck, lint and 189 tests pass (13 new: mock content against the exam, the pool kept
out of practice and the plan, marking, the zero rule, the written outlook, weakest tasks, the speaking
run, the clock). Web walkthrough at 375 × 812: start a mock, reading with changed answers, the answer
sheet and a typed answer, hand in with unanswered questions, writing with the rule checks, listening
without a voice (correct message), results with a simulated listening score, the speaking run from
task 1 to task 2, the "already handed in" guard, and the after-exam card. No console errors.

Not tested: listening heard aloud, recording on an iPhone, the timer running out in real time
(40 minutes), or leaving the app mid-section (a section in progress isn't saved; leaving it loses
the answers).

Limits: there is one mock so far; a second run repeats the same questions, and the hub says so.
Writing and speaking aren't scored. A mock shows one day's performance; it isn't a prediction.

## Phase 4 – Content and polish: done

| Item | Where | State |
|---|---|---|
| Lessons for topics 9–14, one each: at the station, courses and school, at the office, help and emergencies, the weather, neighbours and ty/vy (6 lessons, 54 exercises); every topic now has a lesson | `src/lib/academy/lessons-more.ts`, `topics.ts` | Done, AI-checked |
| A second practice set for every reading and listening task (10 sets, 50 items), listed next to the first in Exam practice | `src/lib/academy/tasks/practice-b.ts` | Done, AI-checked |
| A second unseen mock exam (10 sets, 50 items, a form and an e-mail), kept out of practice; a new mock takes the one done least, and the hub says when all have been taken | `src/lib/academy/tasks/mock-2.ts`, `mock.ts` (`variant`, `nextVariant`) | Done, tested |
| "Practise next" after a mock opens the practice set for that task done fewest times | `(tabs)/learn/mock.tsx` | Done |
| Accessibility: the mock's answer sheet is a bar ("N of 25 answered") that opens 44 pt cells showing the chosen letter (they were 24 pt); larger hit areas for the speaking review's play buttons and model answers; "Recording" is announced when a take starts | `a2-mock/[section].tsx`, `a2-speaking/[id].tsx` | Done |

Store: mock runs record `variant`; runs saved before there were two count as mock 1. No new
dependencies, no server changes.

Content now: 17 lessons across 14 topics; 20 practice sets (100 items); 2 mocks (100 items, 2 forms,
2 e-mails); 8 speaking tasks; 4 writing tasks for practice.

Quality gate: typecheck, lint and 192 tests pass (3 new; the existing content checks now also cover
the 150 new items and 54 lesson exercises: valid answers, varied answer positions, provenance,
accepted model answers, form and e-mail samples meeting the exam's rules). Web walkthrough at
375 × 812: the new travel lesson (intro, scene, shuffled options), Exam practice with two sets per
task, starting mock 2 after mock 1, its reading questions and the new answer sheet (44 pt cells,
jump and close), no overflow, no console errors.

Performance: no changes were needed; plan, readiness and roadmap are memoised, catalogue lookups
are maps built once, and the mock timer re-renders only its own section.

Not done: AI writing feedback (needs the owner's approval to deploy the Edge Function and its
cost). Not tested on an iPhone; listening not heard (no Czech voice in the browser).

Limits: all content is AI-checked, not teacher-reviewed. Pictures are icons. One device voice reads
every speaker.

## AI writing feedback: built (approved by the owner on 2026-11-07)

| Item | Where | State |
|---|---|---|
| `learn-feedback` Edge Function: Claude (Sonnet 5.5) judges a form or e-mail against the exam's published requirements and returns an estimate of the points, each requirement judged, up to 8 corrections and a corrected version. Its own limits (3 a minute, 10 a day); doesn't use the 20 free explanations; the text isn't stored, only the call's size and result, as for every AI call | `supabase/functions/learn-feedback`, `_shared/feedback.ts` | Built; deploy pending |
| Hard rules in code, not left to the model: points kept whole and within 0–8 / 0–12; an e-mail under 35 words scores 0; one corrected text per answer | `_shared/feedback-rules.ts` | Done, tested |
| `ai_calls.kind` allows `learn` | `supabase/migrations/20261107090000_learn_feedback_calls.sql` | Written; push pending |
| "Get feedback from AI" after the writing coach and the mock's writing: the same consent as explanations, labelled "an estimate, not an exam score" everywhere; saved on the phone with the attempt; the demo build says it needs the server instead of inventing feedback | `src/components/academy/writing-feedback.tsx`, `a2-writing/[id].tsx`, `a2-mock/[section].tsx`, `src/lib/ai` | Done |
| Privacy policy: writing feedback added to what is sent to the AI and to the usage log | `docs/privacy.html` | Done |

Also fixed while checking: `expo-asset`, a required peer of `expo-audio`, was missing (expo-doctor:
the app could crash outside Expo Go). Installed; expo-doctor passes 20 of 20.

To go live (needs the owner's terminal; the agent's production-deploy step was blocked):
`npx supabase db push --remote`, then `npx supabase functions deploy learn-feedback`.

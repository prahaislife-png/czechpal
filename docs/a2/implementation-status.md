# A2 Academy: implementation status

Updated 2026-11-09. Honest status against the master implementation prompt. Content counts are
taken from the code, not from targets.

## Content by review status

| Content | Count now | Long-term target | Review status |
|---|---|---|---|
| Curriculum topics | 14 | ~14 | AI-checked |
| Micro-lessons | 56: all 14 topics have 4 each | 80–120 | AI-checked |
| Vocabulary (lexicon with forms) | 303 lemmas | 1,500–2,000 | Reviewed by a native Czech teacher with the library texts (2026-11-03) |
| Situation phrases | 81 (7 situations) | — | Shown without a review claim |
| Grammar explanations | 18 | 40–60 | AI-checked |
| Reading practice | 15 sets (3 per exam task), 75 items | 500 items | AI-checked |
| Listening practice | 15 sets (3 per exam task), 75 items, phone's own Czech voice | 300–400 with real audio | AI-checked; no recorded audio |
| Writing tasks | 10 (5 forms, 5 e-mails) + 2 per mock | 150–250 | AI-checked |
| Speaking tasks | 12 (3 per exam task) + Speak Czech tutor | 500+ prompts | AI-checked |
| Mock exams | 2 complete forms (100 items, 2 forms, 2 e-mails) | 10–15 | AI-checked |
| Diagnostic | 1 starting check (written, no longer shown in the app) | 1 | AI-checked |
| Library stories and dialogues | 9 | — | Teacher-reviewed (2026-11-03) |

Nothing is shown as teacher-reviewed unless it was. No audio is claimed that doesn't exist.

## Features

| Area | Status |
|---|---|
| Verified exam specification (format + practical) | **Done** (`docs/a2/exam-specification-2026.md`) |
| In-app "Everything about the A2 exam" guide | **Done** 2026-11-09: who needs it, exemptions, registering with deadlines, bookable dates, fee, exam day, tasks, passing, after the exam, official links |
| Setup and starting check | **Removed** 2026-11-11: nothing to set up, no test first; the journey starts at lesson one |
| The A2 journey | **Done** 2026-11-11: 14 units; each has its 4 lessons, then one exam task from each part (108 steps), with mock exams after units 5, 10 and 14. Learn is built around it |
| Daily plan | Done: the journey's next steps plus what needs going over (due checks, mistakes, words, weak grammar), sized to the day's minutes, ticked off as done |
| Readiness by skill, weak areas, topic roadmap | Done, from real answers only |
| Lessons with exercises, retests | Done: 4 lessons in every topic. Since 2026-11-12 each is taught in small steps: one phrase at a time with audio, a quick pick, a matching game, the dialogue as chat bubbles, practice, then a short check. Answers are built from word tiles (the keyboard is optional; a missing accent isn't marked wrong). One slip passes the check, and it can be retried straight away |
| Exam practice: learn mode and exam mode | Done |
| Mistake memory and review | Done (objective-level, no full error taxonomy yet) |
| Writing coach with AI feedback (estimate) | Done, live |
| Speaking: recording practice + Speak Czech tutor (GPT-Live) | Done, live; not yet one combined skill score |
| Mock exams, timed, scored by official rules | Done (2) |
| After-exam check-in | Done |
| Real audio for listening | **Built, waiting for the owner's Azure key**: generator (`scripts/audio/generate.ps1`), 161 recordings with every speaker's voice checked against the Czech, playback with the phone voice as fallback; no audio files yet |
| Pictures for picture tasks | **Not done**: icons with captions |
| Week-by-week study plan to the exam date | **Not done**: the journey shows steps left and days to the exam, but doesn't pace one against the other yet |
| Full mistake taxonomy with scheduled retests | Partial |
| Content pipeline with review states | Partial: every item carries version, author, licence, review; no draft → publish tooling |
| Teacher-calibrated writing/speaking scores | **Not done** (no teacher review planned); AI scores are labelled estimates |

## Next, in order

1. **Generate the audio**: the owner runs `scripts/audio/generate.ps1` with an Azure Speech key
   (free tier; about 13,000 characters).
2. **Content depth, topic by topic** (every topic at 4 lessons, 2026-11-09; next: a 5th and 6th lesson where the exam leans hardest): 4 lessons per topic with vocabulary, dialogue, reading,
   listening, writing and speaking, and more practice sets per task so nothing repeats in a week.
3. **More mock exams** (towards 5), including a speaking mock with the AI examiner.
4. **Study plan to the exam date**, and one merged daily plan in Learn.
5. Pictures for the picture tasks.

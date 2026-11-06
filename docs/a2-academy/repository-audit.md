# A2 Academy: repository audit

Audited 2026-11-06 on branch `feature/live-backend` (= `master` at 0e7b14e + nothing pending in Learn).
Product name in code, store listing and website: **CzechPal** (the brief says "CzechLocal"; same app).

## Stack

| Area | Finding |
|---|---|
| Framework | Expo SDK 58 (`expo ~58.0.23`), React Native 0.88, React 19.3, TypeScript 6, React Compiler on |
| Navigation | Expo Router, typed routes, `src/app/`. Tabs: NativeTabs (iOS/Android), custom tab bar on web (`src/components/app-tabs*.tsx`): Home `(home)`, Learn `learn`, Find `help`, Explore `explore` |
| Learn routes | `(tabs)/learn/{index,words,missions,progress}`, `lesson/[id]`, `mission/[id]`, `flashcards` (full-screen modal), `listen` (full-screen modal), `learn-plan` (modal), `session` (full-screen modal), `prepare/[id]` |
| State | zustand 5 + `persist` on AsyncStorage. Stores: `czechpal` (cases, settings, About you, reminders, AI consent), `czechpal-learn` (Learn, version 1), `czechpal-explore` (saved places), `czechpal-explore-places-v2` (cached place list) |
| Backend | Supabase (project utsmmdggvbsyelcsmvyo): anonymous auth; Edge Functions `analyze`, `reply`, `compose`, `translate`, `allowance`, `delete-account`, `report-office`, `report-provider`; tables for usage/allowance, places, practices, explore_places. Secrets server-side only; the app ships the publishable key |
| AI | Anthropic Claude via Edge Functions only (`supabase/functions/_shared/claude.ts`), Haiku 5.5 by default, per-user rate limits (`isRateLimited`), 20 free explanations/month (`_shared/allowance.ts`, `FREE_ANALYSES_PER_MONTH`); Translate has its own limits and doesn't count |
| Consent | `aiConsent` in the `czechpal` store; asked before the first AI request (Home, review, reply, compose); withdrawable in Settings; privacy policy names Anthropic |
| Deletion | Settings → Delete everything: clears all stores (Learn's `clear()` included) and calls `delete-account` |
| Audio | **Playback only**: `expo-speech` (device text-to-speech, Czech voice when installed: `src/lib/learn/voice.ts`). **No recording library** (no expo-audio/expo-av), **no speech-to-text** |
| Design | Tokens in `src/theme/tokens.ts` (cool palette + Explore's warm palette), `Text`/`Button`/`Card`/`List`/`Row`/`Chip`/`Icon` in `src/components/ui`, Reanimated 4, Gesture Handler 3 (hook API) |
| Tests | Node test runner via tsx, `tests/**/*.test.ts`, 121 passing (Learn 5 files). No component tests, no CI. Commands: `npm test`, `npm run typecheck`, `npx expo lint`, `npx expo-doctor` |
| Release | EAS Build in the cloud (no Mac), `eas.json` production/preview, App Store Connect app 6831040644, TestFlight builds 1 and 2 |
| Dev workflow | Windows + Expo Go over LAN; web build for quick checks (`npx expo start --web`) |

## Existing Learn features (verified in code)

| Feature | Where | Reuse in A2 Academy |
|---|---|---|
| 9 texts (stories, dialogues, a serial), A1–A2, reviewed by a native teacher, with questions, vocabulary, senses | `src/lib/learn/content/stories.ts`, `types.ts` | Reading practice inside topics; story integration |
| Dictionary of lemmas and forms, tap-to-look-up with grammar notes | `lexicon.ts`, `text.ts`, `components/learn/word-sheet.tsx` | Vocabulary for topics and lessons |
| FSRS flashcards (ts-fsrs), own cards, saved words | `srs.ts`, `deck.ts`, `app/flashcards.tsx` | The single vocabulary scheduler; no second engine |
| Reading progress and quizzes | `progress.ts`, `app/lesson/[id].tsx` | Evidence for reading |
| Listening quiz with device TTS, seeded | `listening.ts`, `app/listen.tsx` | Listening practice (TTS) and evidence |
| 9 missions, steps derived from data | `missions.ts` | Kept as is |
| Situations (7) with phrases, Get ready from permit/reminders/letters | `situations.ts`, `upcoming.ts`, `app/prepare/[id].tsx` | Topic mapping; speaking prep later |
| Daily session (words → phrases → listening), 5/10/15 min | `session.ts`, `app/session.tsx` | Becomes the daily A2 session (extended) |
| Plan: goal, level, minutes, topics, exam date | `profile.ts`, `app/learn-plan.tsx` | Extended for A2 onboarding |
| Day log, streak, stats, exam facts | `activity.ts`, `stats.ts`, `exam.ts`, `(tabs)/learn/progress.tsx` | Kept; exam facts become the full verified spec |

## What's missing for the brief

- A structured curriculum (topics → objectives → lessons → activities) with provenance metadata.
- An evidence model: attempts by skill, objective, assisted vs independent, seen vs unseen items.
- Readiness and mastery rules; topic states NOT STARTED → LEARNING → PRACTISED → MASTERED.
- Onboarding questions beyond the current plan (Unsure level, target, main difficulty, 20/30 min).
- A diagnostic.
- Exam-format exercises: reading tasks 1–5, listening tasks 1–5, writing Task 1/Task 2 with word
  counts, speaking tasks 1–4.
- Mistake memory with remediation and retests.
- **Recording** (needs `expo-audio`, which is in Expo Go and EAS builds; adds a microphone permission).
- **Speech-to-text**: the Claude API accepts text, images and PDFs but no audio, so transcription needs
  either Apple's on-device recognition (a native module, so TestFlight builds only, not Expo Go) or a
  new cloud provider (a new paid processor: needs the owner's decision).
- **AI writing/speaking feedback**: a new Edge Function with rubrics and its own quota (a deploy:
  needs the owner's approval).
- Original audio for listening beyond device TTS (TTS is fine for practice; exam-like audio would need
  recorded voices).

## Risks

| Risk | Mitigation |
|---|---|
| Migrating the persisted Learn store loses progress | New data goes in a **new** store (`czechpal-academy`); the Learn store only gains optional fields, so its version stays 1 |
| Unreviewed AI-written Czech presented as checked | Every content item carries `review: 'ai-checked' \| 'teacher-reviewed'`; only the 9 stories are teacher-reviewed; the UI never claims a review that didn't happen |
| Exam claims that aren't true | All exam rules live in `exam.ts`, sourced from `exam-spec-2026.md`; unverified details aren't encoded |
| Fake "AI examiner" | Speaking is shipped as record/replay/self-review until real transcription exists; no score is shown without a rubric and evidence |
| Cost | Static content and answer keys offline; AI only for writing/speaking feedback, with per-user daily limits separate from the 20 explanations |
| Privacy | Recordings stay on the phone unless the learner opts in to analysis; consent and the privacy policy are updated before anything audio leaves the phone |
| App Review | Unfinished destinations are hidden or clearly labelled with what works today; no "coming soon" tabs |

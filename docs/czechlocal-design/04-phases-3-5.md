# CzechLocal 2.0: phases 3 to 5

Branch `feature/czechlocal-phases-3-5`, from `master` at 9b0cda1 (2026-11-08).

## Phase 3: Learn

| Change | Where |
|---|---|
| Learn home opens with "A little Czech every day", then in order: **Today's practice** (sage card: the day's minutes, situation, streak), Continue reading, **My A2 journey** (lavender A2 Academy card, real next step and exam countdown), **Speak Czech** (coral), **My words** (sky), then Get ready, Missions, Progress, Plan and the library further down. Nothing removed. | `src/app/(tabs)/learn/index.tsx`, `academy-card.tsx`, `speak-card.tsx` |
| A2 Academy shows the **next recommended lesson**, a swipeable **topic roadmap** (14 topics, each tinted by its real state: not started, learning, practised, secure, with lessons done), and **Practice mode / Exam mode** cards (Exam practice, Mock exam). Readiness per skill and weak areas stay as they were, from real answers only. | `src/app/(tabs)/learn/academy.tsx` |
| Flashcards: the Czech word in Newsreader, examples in Newsreader italic, a 350 ms flip spring, pastel "Good"/"Again" swipe hints, pastel answer buttons (again coral, hard lavender, good sky, easy sage). Same FSRS deck and engine. | `src/components/learn/flashcard.tsx`, `src/app/flashcards.tsx` |
| Speak Czech orb with eight states, all from the real session: idle, connecting, listening, user speaking (learner transcript arriving), thinking (learner finished, partner not started), speaking (partner transcript or audio), muted, error (disconnected). It moves only during a live session; idle orbs hold still. | `src/components/speak/orb.tsx`, `use-conversation.ts`, `app/speak/[situation].tsx` |

## Phase 4: Help and You

- Help: "Share from other apps" now explains how sharing works (Photos, Files, Mail, Messages, WhatsApp → Share → CzechLocal).
- You and Help landings from phase 1 kept; no playful motion on Help.

## Phase 5: quality (tested in the web build, 2026-11-08)

| Check | Result |
|---|---|
| Typecheck (app and tests), lint, `npm test` | Clean, 216 pass |
| expo-doctor | 19/20: `react-native-webrtc` is untested on the New Architecture (known, Speak Czech) |
| 320 × 568 (smallest iPhone): Learn, A2 Academy, Help, You, Explore, Speak Czech | No sideways overflow outside the deliberate horizontal scrollers |
| Dark mode: every text element on Learn, A2 Academy, Help, You, Speak Czech | All pass 4.5:1 against their real background |
| VoiceOver names: every control on Explore, Learn, A2 Academy, Help, You, Speak hub, conversation, camera | No unnamed controls; one small "Not now" link in the camera panel (existing) |
| Reduce Motion | Orb holds its shape; presses dim instead of scaling; sheets settle with a short fade |
| Old palette leftovers | Splash screen, web background and Android notification colour moved to the new palette |

Not done here: screenshots from a real iPhone (needs the TestFlight build), Dynamic Type at the
largest sizes on device, performance profiling on device.

## App icon

Redesigned for 2.0 (see the design system): Newsreader "Č", coral háček, sky disc, paper. Checked
at 29, 40, 60 and 90 pt in light, dark and tinted; the in-app mark renders with the new colours.

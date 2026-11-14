# CzechLocal 2.0 redesign: audit and migration plan

Branch: the 2.0 redesign branch (from `master` at a3ba305, 2026-11-08). The app took the name
**CzechLocal** on 2026-11-08 (display name and all text). On 2026-11-14, before launch, the
internal names followed: the bundle id is `com.czechlocal.app`, the URL scheme `czechlocal`, the
Plus entitlement `czechlocal_pro`, and storage keys start with `czechlocal`. Only the Expo slug stays
`czechpal`: an EAS project's slug can never change, and users never see it.

## 1. Repository audit

| Area | Finding |
|---|---|
| Expo / RN | Expo SDK 58, React Native 0.88, React 19.3, React Compiler on, New Architecture. |
| Navigation | Expo Router, typed routes. Tabs are `NativeTabs` (`src/components/app-tabs.tsx`), with an `expo-router/ui` stand-in on web. Four tabs today: Home `(home)` · Learn `learn` · Find `help` · Explore `explore`. Root stack holds ~30 modal/full-screen routes (scan, review, case, reply, compose, lessons, A2 Academy, Speak Czech…). |
| Maps | `react-native-maps` (Apple Maps on iOS), MapLibre GL 5 + OpenFreeMap on web. ~4,960 real OSM places in Supabase `explore_places`, cached on the phone. |
| Explore today | Already full screen, with an "I want to [activity] in [area]" sentence, search, locate, a custom three-stop sheet on Gesture Handler 3 + Reanimated 4 (Gorhom 5 is incompatible with GH3), pins with importance culling, pin ↔ card sync, saved places, place details, directions. |
| Camera panel | Home is the camera (`(home)/index.tsx` + `home-camera.tsx`): live camera, quick Translate, Explain, a three-height panel with Photo/PDF/Type and recent items. A separate full-screen scanner `/scan` handles multi-page capture. |
| Animation | Reanimated 4.7 + react-native-worklets, Gesture Handler 3, expo-haptics. Reduce Motion respected through `useReducedMotion`. |
| Fonts / icons | System font only (web: a CSS stack). Icons through `src/components/ui/icon.tsx` (SF Symbols on iOS, Material on Android/web). `expo-font` installed, no custom font loaded. |
| Tokens | `src/theme/tokens.ts`: one cool-grey palette with a Czech-cobalt accent (light/dark/high contrast), a separate warm Explore palette, type ramp, spacing, radii, motion. Screens read colours only through `useTheme()`, so a palette change restyles the whole app. |
| Storage | zustand + AsyncStorage, local first: `czechlocal` (items, reminders, consent, About you), `czechlocal-learn`, `czechlocal-academy`, `czechlocal-speak`, Explore saved places and cache. Settings → Delete everything clears all. |
| Learn | Learn home (A2 Academy card, Speak Czech card, daily session, situations, missions, words/FSRS flashcards, progress, library); A2 Academy (plan, readiness, roadmap, practice, mocks, writing coach with AI feedback, speaking); Speak Czech tutor (GPT-Live). |
| AI consent / share | AI consent stored on the phone and asked before the first send; Speak Czech has its own consent. Share extension → `+native-intent.ts` → `/handle-share`. Reminders deep-link to `/case/[id]` or `/about`. |

## 2. Final navigation

**Explore | Learn | Help | You**, native tabs, in that order. URLs are kept wherever anything links to them.

| Tab | Route group | What it holds |
|---|---|---|
| Explore | `explore` (unchanged URLs) | Full-screen map, discovery sheet, saved places, place details. |
| Learn | `learn` (unchanged) | Learn home, A2 Academy, Speak Czech, words, stories. |
| Help | `help` (unchanged URLs) | New landing "What do you need help with?": understand Czech text (camera, image/PDF, type/paste, share), write in Czech, doctors, offices, checklists, all services. The old Find list moves to `/help/services`. |
| You | `(home)` group, now the You tab | Reminders, recent history, saved places, your permit, learning and language preferences, privacy and data (Delete everything). `/history` and `/settings` keep their URLs. |

- The camera moves from the Home tab root to a full-screen route `/camera` (same screen and features: live camera, Translate, Explain, the panel), opened in one tap from Help.
- Launch: `/` becomes the You screen's URL, so a root redirect sends a cold start to **Explore**, or to **Learn** when the learner's plan goal is the A2 exam. Deep links (reminders, shared content, `/case/[id]`) keep working because they never used `/` as a destination except as a fallback, which now lands on You (history).
- "Go to Home" after a failed share goes to Help.

## 3. Phases

1. **Foundation**: new palette and semantic roles (light, dark, increase contrast), Newsreader headings, motion tokens, shared components, the four tabs and start screen. Every route kept.
2. **Explore**: floating top controls (wordmark, search, locate), the sheet at about 28 / 56 / 86 % of the real viewport, restyled sentence chips, place cards and pins in the new palette.
3. **Learn**: Learn home and A2 Academy presentation, flashcards, the Speak Czech orb in the new identity with its real states.
4. **Help and You**: landing polish, You consolidation.
5. **Quality**: dark mode, accessibility, safe areas, gestures, performance, device screenshots, TestFlight.

Each phase is finished and tested before the next. Nothing unfinished is shown as working.

# CzechReply

Understand Czech. Reply with confidence. An AI assistant for foreigners in Czechia: photograph or paste a Czech
letter, get a plain-English explanation with the next steps, and copy a polite Czech reply.

Expo SDK 58 · Expo Router · React Native · TypeScript · Reanimated · Zustand.

## Run it

```bash
npm install
npx expo start
```

Press `w` for the browser, or scan the QR code with a development build on your phone.

## What's in this build

- **Welcome**: a one-way onboarding door.
- **Home**: scan, photo, PDF and paste capture, built-in example letters, and recent cases.
- **Check your message**: a preview plus an optional topic hint.
- **Analysis**: a verdict, "In short", numbered next steps, source-quoted key details, what it means, what the letter doesn't say, and an official-matter notice. It also has English and Czech views.
- **Write a reply**: choose an intent and a tone (formal, friendly or short), edit the Czech draft, see its English meaning, then copy it or open it in email.
- **History and Profile**: a local case history, the free allowance, and privacy controls.

The AI is **mocked** in `src/lib/ai/mock-client.ts`. Every screen goes through the `AIClient` interface in
`src/lib/ai/types.ts`, so the Supabase Edge Function backend replaces it in `src/lib/ai/index.ts` without touching the UI.

## Project map

```
src/app/            routes (Expo Router)
src/components/     screen-level components; ui/ holds the design-system primitives
src/lib/ai/         AI boundary, sample letters, mock client
src/store/          persisted client state (Zustand + AsyncStorage)
src/theme/          tokens, theme hook, navigator options
design-system/      MASTER.md, the design rules every screen follows
.claude/skills/     Appllama design skills (installed with `npx skills add appllama/appllama-skills`)
```

## Checks

```bash
npx tsc --noEmit
npx expo lint
```

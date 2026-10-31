# CzechPal

Point your phone at anything written in Czech (a sign, a menu, a medicine label, a chat, a letter) and get
what it says, what it means for you and, when it's a message, a polite reply in Czech.

Expo SDK 58 · Expo Router · React Native · TypeScript · Reanimated · Zustand.

## Run it

```bash
npm install
npx expo start
```

Press `w` for the browser, or scan the QR code with a development build on your phone.

## What's in this build

- **Welcome**: a one-way onboarding door.
- **Home**: a viewfinder hero that opens the scanner, Photo, PDF and Type sources, "Try it on" examples, and recent items.
- **Scanner**: a full-screen camera with the permission request shown at the moment you open it, a shutter haptic and torch, plus Liquid Glass controls on iOS 26.
- **Results that adapt to what you scanned**:
  - Signs, menus and labels get a line-by-line translation and a Copy translation button.
  - Messages get a suggested reply.
  - Letters get a verdict, numbered steps, quoted key details and a notice for official matters.
- **Write a reply**: choose an intent and a tone, edit the Czech draft, see its English meaning, then copy it or open it in email.
- **Share to CzechPal**: share text, screenshots, photos or PDFs from WhatsApp, Mail or Photos straight into the app. This needs a development or store build; it doesn't work in Expo Go or on the web.
- **Pay a bill by QR code**: builds a QR Platba code your Czech banking app scans, with the account checked against the bank's own checksum, plus copy buttons for each field.
- **Write in Czech**: messages and phone call scripts (with pronunciation, and a play-aloud button) for landlords, doctors and tradespeople.
- **Help**: English-speaking providers with a verification status on each listing, filters, and emergency numbers. The current listings are clearly marked samples.
- **History and Profile**: a virtualized local history, the free allowance, and privacy controls.

Design commitments live in `MOBILE-DESIGN.md`, visual tokens in `design-system/MASTER.md`, and the audit
before and after the redesign in `design-baseline.json`.

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

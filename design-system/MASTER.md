# CzechReply design system — master rules

Source of truth for every screen. Tokens live in `src/theme/tokens.ts`; this file states the rules they encode.
Built to the Appllama app-design skill (`.claude/skills/appllama-app-design-skill`) and the ui-ux-pro-max
recommendation for a trustworthy document-utility product ("document grey + scan blue").

## Product principle

CzechReply is a personal assistant, not a chatbot. Every analysis answers two questions before anything else:
**What happened?** (verdict + "In short") and **What should I do?** (numbered steps). Everything else is secondary.

## Colour

- **One accent:** Czech cobalt — `#2251D1` light / `#86A2FF` text and `#3A64EA` fills in dark. Spent only on the
  primary action, active/selected state and progress. Never decorative.
- **One grey family:** cool slate. Labels `label` / `label2` / `label3`, surfaces `background` / `surface` / `surfaceMuted`.
- **Status colours** (`success`, `warning`, `danger` + `*Soft`) always travel with a word and usually an icon.
- **Flag colours** (`flag.*`) are for the brand mark only, never UI state.
- No gradients, glassmorphism or sparkles. Light and dark are designed together.

## Shape

| Element | Radius |
| --- | --- |
| Icon wells | 10 |
| Inputs, document previews, inner tiles | 14 |
| Cards, lists | 20 |
| Actions, chips, badges | pill |

All rounded rectangles use `borderCurve: 'continuous'`. One elevation (`shadow`) plus `shadowRaised` for the hero
card on a screen. Dark mode relies on surface contrast, not shadow.

## Type

System font, iOS ramp (`type.*` in tokens): one display size per screen. Tabular numerals for amounts, counts
and dates. Data users may copy (facts, translations, originals, replies) is `selectable`.

## Spacing

Base unit 4. Screen gutter 20. Section gap 24–32. Use `gap`, not margin stacks.

## Icons

One vocabulary in `src/components/ui/icon.tsx`: SF Symbols on iOS, Material Symbols on Android and web.
No emoji in UI chrome.

## Motion

- Press feedback on press-in: scale 0.97 for buttons/cards, background highlight for list rows, 120 ms ease-out.
- Ease-out curve `bezier(0.23, 1, 0.32, 1)`; everything under 300 ms except first-run moments.
- Choreography only where it explains: Welcome (letter → answer, first run only) and an analysis finishing while
  the user watches (sections in reading order, 40 ms apart). Reopening a saved case shows it instantly.
- Tabs never animate between each other; screen transitions are native. Reduce Motion is respected.

## Navigation

| Screen | Presentation | Back |
| --- | --- | --- |
| Welcome | Protected one-way door | Cannot be re-entered after Get started |
| Home / History / Profile | Native tabs, each its own stack | — |
| Check your message | Push | Discards the draft |
| Analysis | `replace` from Check — returning to a stale review is impossible | Home or History |
| Write a reply | Modal with Close | Back to analysis |
| Paste a message | Modal with Cancel | Home |

## Copy

One label per intent: "Explain this message", "Write a reply", "Copy Czech reply", "Get started".
Demo results are always labelled as demo. Official matters always show the "Official matter" notice.

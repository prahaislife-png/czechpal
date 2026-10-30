# CzechReply: mobile design commitments

Read this before any UI decision. Tokens and visual rules: `design-system/MASTER.md`.
Audit baseline the redesign is measured against: `design-baseline.json`.

## App Read

APP READ: camera-first translation and explanation utility for foreigners living in Czechia,
calm premium language, leaning iOS-native chrome + branded content (StyleSheet tokens, SF Symbols / Material Symbols).
platforms: iOS first-class · Android first-class · web best-effort (demo and testing)
posture: per-platform-native chrome, unified-brand content
offline: N/A for history (local-first); analysis needs network once the backend is live

**What it does:** point the camera at anything written in Czech (a sign, a menu, a label, a chat, a letter, a form)
and get what it says, what it means for you and, when it is a message, a reply in Czech.

## Dials

| Dial | Value | Why |
| --- | --- | --- |
| DESIGN_EXPRESSION | 5 | Branded-native: cobalt accent, flag mark and a viewfinder hero; navigation chrome stays native (1.C) |
| MOTION_INTENSITY | 4 | Utility used in the street: press feedback, a reveal when a result lands, shutter feedback. Nothing decorative |
| VISUAL_DENSITY | 3 | Read one-handed on the go; generous type, few items per screen |

**Signature element per screen (1.E):** Home = the viewfinder card · Scanner = full-bleed camera · Result = the
"In short" hero set directly on the page · Reply = the editable Czech draft. Everything else stays quiet.

## Result types

| Kind | Examples | Result shows | Primary action |
| --- | --- | --- | --- |
| `text` | sign, menu, label, notice | line-by-line translation, meaning, key facts | Copy translation |
| `message` | chat, SMS, email | meaning, suggested replies | Write a reply |
| `document` | letter, bill, official form | verdict, numbered steps, source-quoted facts, official notice | Write a reply |

## Nav Read

```
NAV READ
platforms: iOS + Android (web: best-effort)
tabs (3): Home · History · Profile
src/app/
  welcome                      protected one-way door (Stack.Protected), replace into tabs
  (tabs)/
    (home)/index    Home       → scan (fullscreen) · paste (modal) · review/[id] (push)
    history/index   History    → push case/[id]
    profile/index   Profile    (settings live here; no settings tab)
  scan                         fullScreenModal, explicit Close; camera permission primed here
  paste                        modal (pageSheet), explicit Cancel
  review/[id]                  push; leaving discards the draft
  case/[id]                    push via replace from review (a stale review is never re-entered)
  reply/[id]                   modal, explicit Close
anchor: (tabs)                 deep links to case/review/reply land with Home underneath
sheets: none
deep links: /case/:id, /reply/:id
android back: default pop everywhere
max taps to any core screen: 2
```

## Standing rules from the audit

- No icon chips: rows lead with a naked icon at fixed width, or nothing.
- Grouping by whitespace and inset-grouped lists; cards only for discrete objects.
- No em/en dashes in English UI copy (Czech source text and Czech drafts keep Czech typography).
- `Alert` only for destructive confirmations; everything else is inline.
- Custom chrome text caps font scaling at 1.4; body text is unbounded.

# CzechPal: mobile design commitments

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
| DESIGN_EXPRESSION | 5 | Branded-native: cobalt accent, a Č-in-viewfinder mark and a viewfinder hero; navigation chrome stays native (1.C) |
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
tabs (2): Home · Find
src/app/
  welcome                      protected one-way door (Stack.Protected), replace into tabs
  (tabs)/
    (home)/index    Home       → scan (fullscreen) · paste, compose (modals) · review/[id] (push)
    (home)/history  History    push from Home's "See all" → push case/[id]
    (home)/settings Settings   push from Home's header
    help/index      Find       search · area tiles → push help/area/[area] → its lists:
                               help/[category] (doctors, trades, lawyers, accountants) → help/find/[kind] → help/practice/[id]
                               help/places/[kind] (town halls, notaries, embassies, offices) → help/place/[id]
                               help/offices, help/checklists, help/translators, help/urgent
  scan                         fullScreenModal, explicit Close; camera permission primed here
  paste                        modal, explicit Cancel
  compose                      modal, explicit Close; ?recipient&to&phone prefill from Find help
  pay                          modal, explicit Close; ?caseId prefills from a scanned bill
  handle-share                 landing for the share extension; replaces itself with review/[id]
  review/[id]                  push; leaving discards the draft
  case/[id]                    push via replace from review (a stale review is never re-entered)
  reply/[id]                   modal, explicit Close
anchors: root (tabs) · home stack index · help stack index   deep links always land with a back stack
sheets: none
deep links: /case/:id, /reply/:id, /help/:category, /help/area/:area, /help/places/:kind, /help/place/:id, /pay, /compose
android back: default pop everywhere
max taps to any core screen: 2
```

## Trust rules for the new tools

- **QR payments:** SPAYD built from bill data only, ASCII-only, validated (Czech mod-11 + IBAN mod-97). Example
  bills never render a scannable code. The app never moves money.
- **Find help:** every listing shows its verification status (verified with date / unverified / sample).
  Sample listings have no phone number and can't be contacted. Rankings are never sold.
- **Write in Czech:** hand-written templates, formal register, gender-neutral first person, user text inserted
  verbatim. Tested across every option combination.

## Standing rules from the audit

- No icon chips: rows lead with a naked icon at fixed width, or nothing.
- Grouping by whitespace and inset-grouped lists; cards only for discrete objects.
- No em/en dashes in English UI copy (Czech source text and Czech drafts keep Czech typography).
- `Alert` only for destructive confirmations; everything else is inline.
- Custom chrome text caps font scaling at 1.4; body text is unbounded.

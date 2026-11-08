# CzechLocal 2.0 design system

Source of truth: `src/theme/tokens.ts`. Screens read colours through `useTheme()` (and Explore
through `useExploreTheme()`), so these roles restyle the whole app.

## Colour

Starting swatches (`swatch`): paper `#F7F3EB`, charcoal `#252522`, sky `#BCE8F0`, sage `#B8D2BA`,
coral `#FF986E`, lavender `#DCD4F5`.

| Role | Light | Dark | Use |
|---|---|---|---|
| background | paper | `#161614` | Every screen |
| surface / surfaceMuted | `#FFFDF8` / `#EFE9DD` | `#20201D` / `#292926` | Cards, inputs |
| label / label2 / label3 | charcoal / `#57544C` / `#6B675D` | `#F3EFE6` / `#BCB6A9` / `#999387` | Text; label3 passes 4.5:1 |
| accent | `#1F5C67` Vltava teal | `#9ED8E2` | Links, active state, small emphasis |
| accentFill / onAccent | charcoal / paper | `#F3EFE6` / `#1B1B19` | Primary pills, the main button |
| sky · sage · coral(Soft) · lavender | the swatches | muted dark tints | Surface tints only |
| skyInk · sageInk · coralInk · lavenderInk | deep partners | light partners | Text and icons on a tint |
| success · warning · danger (+ Soft) | `#2F6B3C` · `#9A4318` · `#B3261E` | lighter | Status, never decoration |

Rules: pastels are surfaces, never text. Charcoal pills carry the one primary action per screen.
Increase Contrast darkens label2/label3/separator/accent. The camera keeps its own black chrome.
The app icon (brand mark) is unchanged in this phase.

Tones (`src/components/design/tone.ts`): sky (understanding, maps, Explore chips), sage (progress,
nature), coral (warmth, Speak Czech), lavender (writing, words), neutral.

## Type

- Display (`largeTitle` 36, `title1` 30, `title2` 24): **Newsreader** SemiBold, loaded with
  `expo-font` from `@expo-google-fonts/newsreader` (three files: 500, 500 italic, 600). Full Czech
  diacritics (Latin Extended). Native large titles use it too.
- Everything else: the system font (SF Pro on iPhone), sizes unchanged (17 body, 13 footnote).
- One display size per screen. Chrome text caps Dynamic Type at 200 %; body text doesn't.

## Shape and space

Spacing base 4 (`space`). Radii: wells 10, tiles 14, cards 22, sheets 28, pills. Shadows are warm
and soft in light mode; dark mode uses surface steps instead of shadows.

## Shared components (`src/components/design/`)

| Component | What it is |
|---|---|
| `EditorialHeading` | Eyebrow, Newsreader headline, optional lead. One per screen. |
| `FloatingIconButton` | 44 pt round paper control over the map; `active` fills charcoal. |
| `CategoryChip` | Pill that fills with its pastel tone when selected (colour transition, 180 ms). |
| `LearningCard` | Large tinted card: eyebrow, Newsreader title, detail, icon. |
| `ProgressCard` | Progress from real data; `value: null` draws no bar and says why. |
| `EmptyState` | Calm icon, one line, one way to start. |
| Existing, kept | `Button` (PrimaryAction), `SectionHeader`, `List`/`Row`, `Chip`, `PressableScale`, `Card`, Explore's `PlaceCard`/`PlaceList`. |

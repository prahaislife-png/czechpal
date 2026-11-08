# CzechPal 2.0 motion

Tokens: `motion` in `src/theme/tokens.ts`. Tools: Reanimated 4 (UI thread), Gesture Handler 3,
expo-haptics, native navigation transitions. No Skia, Rive or 3D.

| Moment | Target | Token | Notes |
|---|---|---|---|
| Button / card press | 80–130 ms | `press` 100 ms, ease-out | Scale 0.97 (chips 0.95, round buttons 0.92); spring back on release. |
| Chip selection | 150–220 ms | `chip` 180 ms | Colour fill only, so it holds with Reduce Motion. Selection haptic. |
| Card reveal | 220–320 ms | `reveal` 260 ms | Fade + 8 pt rise. |
| Flashcard flip | 300–400 ms | `flip` 350 ms | Phase 3. |
| Bottom sheet | spring | `sheet` (damping 32, stiffness 320) | No overshoot; follows a flick's velocity. |
| Tactile bounce | spring | `tactile` | Cards that answer a drag. |
| Tabs, pushes, modals | platform | native | Native tabs and stack transitions. |

Rules:
- Motion explains a change; nothing loops for decoration. The only continuous animation is the
  Speak Czech orb during a live session, and it follows real audio levels.
- Reduce Motion: movement becomes a fade or an instant change (PressableScale dims instead of
  scaling; sheets settle with a short timing).
- No playful motion on Help's documents, medical or legal warnings.
- Haptics: selection for chips and floating controls, light impact for snaps, success for results.

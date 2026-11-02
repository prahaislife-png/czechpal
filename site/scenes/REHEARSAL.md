# Rehearsal: CzechPal website scenes

Built with the Stageshow kit and filmed with its film tool at both widths, light and dark.

| Scene | Started from | Story |
|---|---|---|
| `czechpal-hero` | `device-pair` | A Czech electricity bill; the phone shows the app reading a photo of it (scan line, three steps), then the explanation in reading order: the verdict and what you need to do. A line ties the bill's figures to the English verdict. |
| `czechpal-reply` | `phone-touch` | Write in Czech: plain English typed, Write it in Czech tapped, a polite Czech message written out word by word. |
| `czechpal-anything` | `choreography` (content changing in place) | A conveyor of a door notice, a menu and a medicine label; the app's answer card beside it changes to say what each means. |
| `czechpal-find` | `phone-touch` | The Find tab: India typed, the Indian embassy found, its address, phone and hours from the official list. |

The screens copy the app's real ones (`src/app/case/[id].tsx`, `src/components/analysis.tsx`, `src/app/compose.tsx`, `src/app/(tabs)/help/`) with the app's own tokens. The embassy's details are the ones in CzechPal's `places` table.

## Film lines left on purpose

- `uneven gutters` on the bill's figures box and the medicine sticker: tables and labels inside a document, set at the document's own margins.
- `framing` lines that take the hero phone's top as the gutter: there the phone is the satellite and the bill the hero.
- `clipped` while the place screen pushes in on Find: the outgoing screen slides under the new one, as on iOS.
- `kit override` when filming the built page: the kit's own CSS is bundled with the scenes' CSS, so the tool can't tell them apart.

## Not checked

- Safari and Firefox (filmed in Chrome only), and a real iPhone's browser.

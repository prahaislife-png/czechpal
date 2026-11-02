# Rehearsal: CzechPal website hero

**Started from:** the `device-pair` gold example (a window with a phone straddling its right edge).
The "window" became a sheet of paper, a Czech electricity bill, and the phone shows CzechPal's
real result screen (the type row, the summary, the verdict, the Pay this bill row), copied from
`src/app/case/[id].tsx` and `src/components/analysis.tsx` with the app's own tokens.

**Story (about 10.5 s, loops):** the app's viewfinder corners close in on the amount and due date
on the bill → a line ties them to the English verdict "Pay 1,840 Kč by 15 Nov" → a tap on Pay
pushes the QR screen, held for 2.8 s → Back pops it and the corners lift. The poster (reduced
motion, thumbnails) is the frame with corners and line on.

**Compact (below 600 px):** the bill's header is dropped so the title, amount and due date sit
above the phone; the phone is wider (326) so its smallest text stays at about 10 px; no line.

**The QR code is real** but harmless: it opens the CzechPal website, not a payment.

## Film lines left on purpose

- `uneven gutters` on the bill's amount box: it is a table inside a document, set at the
  document's own margin, not a card in the frame.
- `framing` lines that take the phone's top as the gutter: here the phone is the satellite and
  the bill the hero. In compact the phone's top is set by the bill's due date above it.
- `clipped` while the QR screen pushes in: the outgoing screen sliding left under the new one is
  the iOS push, clipped by the screen as on a device.

## Not checked

- Safari and Firefox (filmed in Chrome only).
- A real iPhone's browser.

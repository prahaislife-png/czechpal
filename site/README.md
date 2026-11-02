# CzechPal website hero

The animated scene at the top of https://prahaislife-png.github.io/czechpal/: a Czech bill, the
app's explanation on a phone, and Pay by QR. It is built with the Stageshow kit (`kit/`, MIT,
by Benji Taylor; see `kit/LICENSE`) and compiled into `docs/hero/`, which GitHub Pages serves.

```bash
cd site
npm install
npm run build   # writes docs/hero/hero.js and hero.css
```

`npm run dev` serves it alone for editing. The scene is `hero/index.tsx`; its notes on framing and
what was checked are in `hero/REHEARSAL.md`.

# CzechPal website hero

The animated scenes on https://prahaislife-png.github.io/czechpal/: the hero (a Czech bill and the
app explaining it) and one for each feature (writing in Czech, signs and menus, Find). It is built with the Stageshow kit (`kit/`, MIT,
by Benji Taylor; see `kit/LICENSE`) and compiled into `docs/hero/`, which GitHub Pages serves.

```bash
cd site
npm install
npm run build   # writes docs/hero/hero.js and hero.css (every scene, one bundle)
```

Each scene is a folder in `scenes/`; `main.tsx` mounts it into its slot on `docs/index.html`
(`#hero`, `#demo-reply`, `#demo-anything`, `#demo-find`). What was checked is in
`scenes/REHEARSAL.md`.

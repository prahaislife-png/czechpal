// Builds every CzechLocal icon file (assets/images) and the in-app mark data from one definition.
// Usage, from a scratch folder with the tools installed:
//   npm i opentype.js@1.3.4 @resvg/resvg-js@2.6.2
//   node build.mjs <project root> [out folder for previews]
// The font comes from the project's own @expo-google-fonts/newsreader (SIL Open Font Licence).
import fs from 'node:fs';
import path from 'node:path';
import { background, markParts, markSVG, png, svg, useFont } from './mark.mjs';

const root = process.argv[2];
const out = process.argv[3]; // optional: write previews here instead of the project
const img = (f) => (out ? path.join(out, f) : path.join(root, 'assets', 'images', f));
const T = 1024;

useFont(path.join(root, 'node_modules', '@expo-google-fonts', 'newsreader', '600SemiBold', 'Newsreader_600SemiBold.ttf'));

// The design (CzechLocal 2.0): an editorial Newsreader "Č" in charcoal with a coral háček, on a
// soft sky disc, on paper. The disc is Prague's river and sky, the map and the voice orb at once.
const PAPER = '#F7F3EB';
const CHARCOAL = '#252522';
const SKY = '#BCE8F0';
const CORAL = '#F2784B'; // the brief's coral, a step deeper so the háček holds at 29 pt
const MARK = { glyphHeight: 0.54, disc: { r: 0.385, cx: 0.5, cy: 0.5 }, shiftX: 0.006, dropY: 0.012 };
const onPaper = { ...MARK, glyph: CHARCOAL, caron: CORAL, discColour: SKY };
const onCharcoal = { ...MARK, glyph: PAPER, caron: '#FF986E', discColour: '#2E5A61' };
const mono = { ...MARK, glyph: '#FFFFFF', caron: '#FFFFFF', discColour: '#FFFFFF', discOpacity: 0.28 };

// iOS: full-bleed squares, no transparency; the system rounds the corners.
png(svg(T, background(T, PAPER) + markSVG(T, onPaper)), img('icon.png'), 1024);
png(svg(T, background(T, '#1B1B19') + markSVG(T, onCharcoal)), img('icon-dark.png'), 1024);
// Tinted (iOS 18+): a greyscale image the system colours; the disc stays a faint field.
png(svg(T, background(T, '#000000') + markSVG(T, mono)), img('icon-tinted.png'), 1024);

// Android adaptive icon: 108dp canvas, only the centre 66dp circle is always visible.
const androidMark = (o) => markSVG(T, { ...o, glyphHeight: 0.34, disc: { r: 0.25, cx: 0.5, cy: 0.5 } });
png(svg(T, androidMark(onPaper)), img('android-icon-foreground.png'), 1024);
png(svg(T, background(T, PAPER)), img('android-icon-background.png'), 1024);
png(svg(T, androidMark(mono)), img('android-icon-monochrome.png'), 1024);

// Splash: the mark alone on the app's background (paper, or charcoal in dark mode).
const splash = (o) => svg(T, markSVG(T, { ...o, glyphHeight: 0.68, disc: { r: 0.48, cx: 0.5, cy: 0.5 } }));
png(splash(onPaper), img('splash-icon.png'), 600);
png(splash(onCharcoal), img('splash-icon-dark.png'), 600);

// Web: a rounded tile, readable at 48px (a bigger letter).
png(svg(T, background(T, PAPER) + markSVG(T, { ...onPaper, glyphHeight: 0.6, disc: { r: 0.42, cx: 0.5, cy: 0.5 } }), { rounded: true }), img('favicon.png'), 48);

if (!out) {
  // The same mark for the app itself (react-native-svg), on a 100-unit canvas, a little bigger for
  // header sizes (~24 pt).
  const m = markParts(100, { ...MARK, glyphHeight: 0.58, disc: { r: 0.42, cx: 0.5, cy: 0.5 } });
  const ts = `/**
 * The CzechLocal mark as vector data, generated with the app icon (scripts/icons): a Newsreader "Č"
 * (SIL Open Font Licence, converted to outlines) on a sky disc. Draw on a 100 × 100 viewBox.
 */
export const brandMark = {
  disc: { cx: ${m.disc.cx.toFixed(2)}, cy: ${m.disc.cy.toFixed(2)}, r: ${m.disc.r.toFixed(2)} },
  glyphTransform: 'translate(${m.tx.toFixed(3)} ${m.ty.toFixed(3)}) scale(${m.k.toFixed(6)})',
  body: '${m.body}',
  caron: '${m.caron}',
};
`;
  fs.writeFileSync(path.join(root, 'src', 'components', 'ui', 'brand-mark-data.ts'), ts);
}
console.log('built', out ? `previews in ${out}` : 'into the project');

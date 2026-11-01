// Builds every CzechPal icon file (assets/images) and the in-app mark data from one definition.
// Usage, from a scratch folder with the tools installed:
//   npm i opentype.js@1.3.4 @resvg/resvg-js@2.6.2 @fontsource/plus-jakarta-sans@5.1.0
//   node build.mjs <project root>
import fs from 'node:fs';
import path from 'node:path';
import { background, markParts, markSVG, png, svg } from './mark.mjs';

const root = process.argv[2];
const img = (f) => path.join(root, 'assets', 'images', f);
const T = 1024;

// The design: Plus Jakarta Sans ExtraBold "Č", white with a Czech-red háček, inside light-cobalt
// viewfinder corners, on the app's ink. White, blue and red, without being a flag.
const MARK = { fontKey: 'jakarta', scale: 0.68, stroke: 0.05, arm: 0.2, radius: 0.13, glyphHeight: 0.75, drop: 0.03 };
const INK = ['#1B2333', '#0B1019'];
const onInk = { ...MARK, glyph: '#FFFFFF', caron: '#E8333A', bracket: '#7F9DFF', bracketOpacity: 1 };
const onLight = { ...MARK, glyph: '#0E1420', caron: '#D7141A', bracket: '#2251D1', bracketOpacity: 1 };
const mono = { ...MARK, glyph: '#FFFFFF', caron: '#FFFFFF', bracket: '#FFFFFF', bracketOpacity: 0.7 };

// iOS: full-bleed squares, no transparency; the system rounds the corners.
png(svg(T, background(T, INK) + markSVG(T, onInk)), img('icon.png'), 1024);
png(svg(T, background(T, '#0B1019') + markSVG(T, onInk)), img('icon-dark.png'), 1024);
// Tinted (iOS 18+): a greyscale image the system colours; the háček stays lighter than the corners.
png(svg(T, background(T, '#000000') + markSVG(T, { ...mono, bracketOpacity: 0.55 })), img('icon-tinted.png'), 1024);

// Android adaptive icon: 108dp canvas, only the centre 66dp circle is always visible, so the mark
// (corners included) is scaled to sit inside it.
const androidMark = (o) => markSVG(T, { ...o, scale: 0.44 });
png(svg(T, androidMark(onInk)), img('android-icon-foreground.png'), 1024);
png(svg(T, background(T, INK)), img('android-icon-background.png'), 1024);
png(svg(T, androidMark(mono)), img('android-icon-monochrome.png'), 1024);

// Splash: the mark alone, in ink on the light background and in white on the dark one.
const splash = (o) => svg(T, markSVG(T, { ...o, scale: 0.92 }));
png(splash(onLight), img('splash-icon.png'), 600);
png(splash(onInk), img('splash-icon-dark.png'), 600);

// Web: a rounded tile, readable at 48px.
png(svg(T, background(T, INK) + markSVG(T, { ...onInk, stroke: 0.07, glyphHeight: 0.8 }), { rounded: true }), img('favicon.png'), 48);

// The same mark for the app itself (react-native-svg), on a 100-unit canvas.
// Small sizes (the header logo is ~26pt) need heavier corners and a bigger letter, like the favicon.
const m = markParts(100, { ...MARK, stroke: 0.07, glyphHeight: 0.8 });
const ts = `/**
 * The CzechPal mark as vector data, generated with the app icon (Plus Jakarta Sans ExtraBold "Č",
 * SIL Open Font Licence, converted to outlines). Draw on a 100 × 100 viewBox.
 */
export const brandMark = {
  corners: '${m.corners}',
  stroke: ${m.stroke.toFixed(3)},
  glyphTransform: 'translate(${m.tx.toFixed(3)} ${m.ty.toFixed(3)}) scale(${m.k.toFixed(6)})',
  body: '${m.body}',
  caron: '${m.caron}',
};
`;
fs.writeFileSync(path.join(root, 'src', 'components', 'ui', 'brand-mark-data.ts'), ts);
console.log('built');

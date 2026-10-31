// The CzechPal mark: a bold "Č" inside viewfinder corner marks.
// Glyphs come from open-licence fonts (SIL OFL) and are converted to outlines,
// so the finished artwork has no font dependency.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import { Resvg } from '@resvg/resvg-js';

const here = path.dirname(fileURLToPath(import.meta.url));
const fontFile = (pkg, file) => path.join(here, 'node_modules', '@fontsource', pkg, 'files', file);

export const FONTS = {
  jakarta: fontFile('plus-jakarta-sans', 'plus-jakarta-sans-latin-ext-800-normal.woff'),
};

const loaded = {};
const font = (key) => (loaded[key] ??= opentype.parse(fs.readFileSync(FONTS[key]).buffer));

/** Splits "Č" into the C and the háček, each as SVG path data in font units scaled to `size`. */
function glyphParts(key, size) {
  const f = font(key);
  const p = f.getPath('Č', 0, 0, size);
  // Split into contours at each moveTo.
  const contours = [];
  for (const cmd of p.commands) {
    if (cmd.type === 'M') contours.push([]);
    contours[contours.length - 1].push(cmd);
  }
  const bboxOf = (cmds) => {
    const xs = [], ys = [];
    for (const c of cmds) for (const [x, y] of [[c.x, c.y], [c.x1, c.y1], [c.x2, c.y2]]) if (x !== undefined) { xs.push(x); ys.push(y); }
    return { x1: Math.min(...xs), y1: Math.min(...ys), x2: Math.max(...xs), y2: Math.max(...ys) };
  };
  const withBox = contours.map((cmds) => ({ cmds, box: bboxOf(cmds) }));
  // The C is the contour reaching lowest (largest y); the háček sits entirely above the C's top.
  const lowest = withBox.reduce((a, b) => (b.box.y2 > a.box.y2 ? b : a));
  const isCaron = (c) => c.box.y2 < lowest.box.y1 + 1;
  const toD = (list) => {
    const pathObj = new opentype.Path();
    pathObj.commands = list.flatMap((c) => c.cmds);
    return pathObj.toPathData(2);
  };
  const body = withBox.filter((c) => !isCaron(c));
  const caron = withBox.filter(isCaron);
  const all = bboxOf(withBox.flatMap((c) => c.cmds));
  return { body: toD(body), caron: toD(caron), box: all, bodyBox: bboxOf(body.flatMap((c) => c.cmds)) };
}

/** Rounded viewfinder corners as one stroked path, around a square from `a` to `b`. */
function corners(a, b, arm, r) {
  const seg = (x, y, dx, dy) =>
    // From the end of the vertical arm, round the corner, out along the horizontal arm.
    `M${x} ${y + dy * arm} L${x} ${y + dy * r} Q${x} ${y} ${x + dx * r} ${y} L${x + dx * arm} ${y}`;
  return [seg(a, a, 1, 1), seg(b, a, -1, 1), seg(a, b, 1, -1), seg(b, b, -1, -1)].join(' ');
}

/**
 * The mark on a `size` canvas.
 * opts: fontKey, glyph (colour), caron (colour), bracket (colour), bracketOpacity, scale (0..1 of canvas the
 * bracket square takes), stroke, arm, radius (all relative to the bracket square), glyphHeight (relative).
 */
export function markParts(size, o) {
  const sq = size * o.scale; // bracket square side
  const a = (size - sq) / 2;
  const b = a + sq;
  const stroke = sq * o.stroke;
  const arm = sq * o.arm;
  const r = sq * o.radius;
  const g = glyphParts(o.fontKey, 1000);
  // Fit the whole Č (with háček) to glyphHeight of the square, centred optically (a touch low,
  // because the háček makes the top visually lighter).
  const targetH = sq * o.glyphHeight;
  const k = targetH / (g.box.y2 - g.box.y1);
  const w = (g.box.x2 - g.box.x1) * k;
  const tx = size / 2 - w / 2 - g.box.x1 * k;
  const ty = size / 2 - targetH / 2 - g.box.y1 * k + targetH * (o.drop ?? 0.02);
  return { corners: corners(a + stroke / 2, b - stroke / 2, arm, r), stroke, tx, ty, k, body: g.body, caron: g.caron };
}

export function markSVG(size, o) {
  const m = markParts(size, o);
  return `
  <g>
    <path d="${m.corners}" fill="none" stroke="${o.bracket}" stroke-opacity="${o.bracketOpacity}" stroke-width="${m.stroke}" stroke-linecap="round" stroke-linejoin="round"/>
    <g transform="translate(${m.tx} ${m.ty}) scale(${m.k})">
      <path d="${m.body}" fill="${o.glyph}"/>
      <path d="${m.caron}" fill="${o.caron}"/>
    </g>
  </g>`;
}

let uid = 0;
export function background(size, bg) {
  if (!bg) return '';
  if (typeof bg === 'string') return `<rect width="${size}" height="${size}" fill="${bg}"/>`;
  const id = `bg${uid++}`;
  return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs>
  <rect width="${size}" height="${size}" fill="url(#${id})"/>`;
}

export function svg(size, inner, { rounded } = {}) {
  const id = `tile${uid++}`;
  const clip = rounded ? `<clipPath id="${id}"><rect width="${size}" height="${size}" rx="${size * 0.2237}"/></clipPath>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${clip}<g${rounded ? ` clip-path="url(#${id})"` : ''}>${inner}</g></svg>`;
}

export function png(svgText, out, width) {
  const r = new Resvg(svgText, { fitTo: { mode: 'width', value: width }, background: 'rgba(0,0,0,0)' });
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, r.render().asPng());
}

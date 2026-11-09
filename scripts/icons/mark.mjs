// The CzechLocal mark: a Newsreader "Č" with a coral háček, on a soft sky disc.
// The glyph comes from an open-licence font (Newsreader, SIL OFL) and is converted to outlines,
// so the finished artwork has no font dependency.
import fs from 'node:fs';
import path from 'node:path';
import opentype from 'opentype.js';
import { Resvg } from '@resvg/resvg-js';

let font = null;
/** The font file to draw the Č from (a .ttf or .woff path). */
export function useFont(file) {
  font = opentype.parse(fs.readFileSync(file).buffer);
}

/** Splits "Č" into the C and the háček, each as SVG path data, with their bounding boxes. */
function glyphParts(size) {
  const p = font.getPath('Č', 0, 0, size);
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
  return {
    body: toD(body),
    caron: toD(caron),
    box: bboxOf(withBox.flatMap((c) => c.cmds)),
    bodyBox: bboxOf(body.flatMap((c) => c.cmds)),
  };
}

/**
 * The mark on a `size` canvas.
 * opts: glyphHeight (the whole Č, relative to the canvas), disc { r, cx, cy } (relative), shiftX
 * (relative; serif C's are optically heavy on the left), glyph / caron / discColour.
 */
export function markParts(size, o) {
  const g = glyphParts(1000);
  const targetH = size * o.glyphHeight;
  const k = targetH / (g.box.y2 - g.box.y1);
  // Centre the whole Č (háček included) inside the disc, nudged by shiftX/dropY for optical balance.
  const w = (g.box.x2 - g.box.x1) * k;
  const cx = size * o.disc.cx;
  const cy = size * o.disc.cy;
  const tx = cx - w / 2 - g.box.x1 * k + size * (o.shiftX ?? 0);
  const ty = cy - targetH / 2 - g.box.y1 * k + size * (o.dropY ?? 0);
  return { tx, ty, k, body: g.body, caron: g.caron, disc: { cx, cy, r: size * o.disc.r } };
}

export function markSVG(size, o) {
  const m = markParts(size, o);
  return `
  <g>
    ${o.discColour ? `<circle cx="${m.disc.cx}" cy="${m.disc.cy}" r="${m.disc.r}" fill="${o.discColour}" fill-opacity="${o.discOpacity ?? 1}"/>` : ''}
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

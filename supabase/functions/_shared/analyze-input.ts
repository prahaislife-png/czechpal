import type Anthropic from 'npm:@anthropic-ai/sdk@1.3.0';

import { fail } from './claude.ts';

/**
 * What /analyze accepts:
 * { kind: 'image', mediaType: 'image/jpeg' | 'image/png' | 'image/webp', data: base64 }
 * { kind: 'images', images: [{ mediaType, data }, …] }   pages of one document, in order
 * { kind: 'pdf', data: base64 }
 * { kind: 'text', text: string }
 */

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // Claude's per-image limit
const MAX_PAGES = 5; // must match MAX_PAGES in src/store/cases.ts
const MAX_TOTAL_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_PDF_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_CHARS = 20_000;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

type Image = { mediaType: (typeof IMAGE_TYPES)[number]; data: string };

export type Input =
  | { kind: 'images'; images: Image[] }
  | { kind: 'pdf'; data: string }
  | { kind: 'text'; text: string };

const base64Bytes = (b64: string) => Math.floor((b64.length * 3) / 4);
const isBase64 = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && /^[A-Za-z0-9+/]+=*$/.test(v);

function parseImage(v: unknown): Image | Response {
  const img = (v ?? {}) as Record<string, unknown>;
  if (!isBase64(img.data)) return fail(400, 'bad_request', 'A photo couldn’t be read. Please try again.');
  const mediaType = IMAGE_TYPES.find((t) => t === img.mediaType);
  if (!mediaType) return fail(400, 'bad_request', 'This image type isn’t supported. Use a photo or a screenshot.');
  if (base64Bytes(img.data) > MAX_IMAGE_BYTES) return fail(413, 'too_large', 'A photo is too large. Please try again.');
  return { mediaType, data: img.data };
}

export function parseInput(body: Record<string, unknown>): Input | Response {
  if (body.kind === 'text') {
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    if (text.length < 20) return fail(400, 'too_short', 'This text is too short to explain. Paste all of it, including any greeting or heading.');
    if (text.length > MAX_TEXT_CHARS) return fail(413, 'too_large', 'This text is too long. Paste one letter or message at a time.');
    return { kind: 'text', text };
  }
  if (body.kind === 'pdf') {
    if (!isBase64(body.data)) return fail(400, 'bad_request', 'The file couldn’t be read. Please try again.');
    if (base64Bytes(body.data) > MAX_PDF_BYTES) return fail(413, 'too_large', 'This PDF is too large. Try a photo of the page instead.');
    return { kind: 'pdf', data: body.data };
  }
  if (body.kind === 'image' || body.kind === 'images') {
    const raw = body.kind === 'image' ? [body] : Array.isArray(body.images) ? body.images : [];
    if (raw.length === 0) return fail(400, 'bad_request', 'Nothing to explain was sent.');
    if (raw.length > MAX_PAGES) return fail(413, 'too_large', `Add up to ${MAX_PAGES} pages at a time.`);
    const images: Image[] = [];
    for (const v of raw) {
      const img = parseImage(v);
      if (img instanceof Response) return img;
      images.push(img);
    }
    if (images.reduce((n, i) => n + base64Bytes(i.data), 0) > MAX_TOTAL_IMAGE_BYTES) {
      return fail(413, 'too_large', 'These photos are too large together. Try fewer pages.');
    }
    return { kind: 'images', images };
  }
  return fail(400, 'bad_request', 'Nothing to explain was sent.');
}

export function userContent(input: Input, hint: string | undefined, language: string): Anthropic.Beta.BetaContentBlockParam[] {
  // Spelled out field by field: with a language close to Czech (Ukrainian, Polish, Russian) a short
  // "write in X" lets the model slide back into Czech for labels and line translations.
  const instruction =
    `Explain this for the reader. The reader's language is ${language}. ` +
    `Write typeLabel, title, inShort, verdict, every lines[].translated, meaning, keyFacts labels and values, nextSteps, notStated, translation and replyIntents in ${language}, not in Czech. ` +
    `Only originalText, evidence, lines[].cs and payment stay in Czech.` +
    (hint ? ` The reader says it is about: ${hint}.` : '');
  switch (input.kind) {
    case 'images': {
      const n = input.images.length;
      if (n === 1) {
        const [img] = input.images;
        return [
          { type: 'image', source: { type: 'base64', media_type: img.mediaType, data: img.data } },
          { type: 'text', text: instruction },
        ];
      }
      // Each photo is labelled so the order survives; the deadline is often on page 2.
      return [
        ...input.images.flatMap((img, i): Anthropic.Beta.BetaContentBlockParam[] => [
          { type: 'text', text: `Page ${i + 1} of ${n}:` },
          { type: 'image', source: { type: 'base64', media_type: img.mediaType, data: img.data } },
        ]),
        {
          type: 'text',
          text: `${instruction} The ${n} photos are the pages of one document, in order. Explain the document as a whole, and transcribe every page into originalText in order, with a blank line between pages.`,
        },
      ];
    }
    case 'pdf':
      return [
        { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: input.data } },
        { type: 'text', text: instruction },
      ];
    case 'text':
      return [
        { type: 'text', text: `<czech_text>\n${input.text}\n</czech_text>` },
        {
          type: 'text',
          text: `${instruction} The Czech text is between the czech_text markers above. The reader pasted it, so set originalText to an empty string.`,
        },
      ];
  }
}

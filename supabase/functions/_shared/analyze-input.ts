import type Anthropic from 'npm:@anthropic-ai/sdk@1.3.0';

import { fail } from './claude.ts';

/**
 * What /analyze accepts:
 * { kind: 'image', mediaType: 'image/jpeg' | 'image/png' | 'image/webp', data: base64 }
 * { kind: 'pdf', data: base64 }
 * { kind: 'text', text: string }
 */

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // Claude's per-image limit
const MAX_PDF_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_CHARS = 20_000;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type Input =
  | { kind: 'image'; mediaType: (typeof IMAGE_TYPES)[number]; data: string }
  | { kind: 'pdf'; data: string }
  | { kind: 'text'; text: string };

const base64Bytes = (b64: string) => Math.floor((b64.length * 3) / 4);

export function parseInput(body: Record<string, unknown>): Input | Response {
  if (body.kind === 'text') {
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    if (text.length < 20) return fail(400, 'too_short', 'This text is too short to explain. Paste all of it, including any greeting or heading.');
    if (text.length > MAX_TEXT_CHARS) return fail(413, 'too_large', 'This text is too long. Paste one letter or message at a time.');
    return { kind: 'text', text };
  }
  if (body.kind === 'image' || body.kind === 'pdf') {
    const data = typeof body.data === 'string' ? body.data : '';
    if (!data || !/^[A-Za-z0-9+/]+=*$/.test(data)) return fail(400, 'bad_request', 'The file couldn’t be read. Please try again.');
    if (body.kind === 'pdf') {
      if (base64Bytes(data) > MAX_PDF_BYTES) return fail(413, 'too_large', 'This PDF is too large. Try a photo of the page instead.');
      return { kind: 'pdf', data };
    }
    const mediaType = IMAGE_TYPES.find((t) => t === body.mediaType);
    if (!mediaType) return fail(400, 'bad_request', 'This image type isn’t supported. Use a photo or a screenshot.');
    if (base64Bytes(data) > MAX_IMAGE_BYTES) return fail(413, 'too_large', 'This image is too large. Please try again.');
    return { kind: 'image', mediaType, data };
  }
  return fail(400, 'bad_request', 'Nothing to explain was sent.');
}

export function userContent(input: Input, hint: string | undefined, language: string): Anthropic.Beta.BetaContentBlockParam[] {
  const instruction =
    `Explain this for the reader. Write all explanations in ${language}.` +
    (hint ? ` The reader says it is about: ${hint}.` : '');
  switch (input.kind) {
    case 'image':
      return [
        { type: 'image', source: { type: 'base64', media_type: input.mediaType, data: input.data } },
        { type: 'text', text: instruction },
      ];
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

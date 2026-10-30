import { matchSample, sampleById, samples } from './samples';
import {
  AnalyzeError,
  type AIClient,
  type AnalyzeInput,
  type AnalyzeResult,
  type ReplyDraft,
  type ReplyInput,
} from './types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const ANALYZE_DURATION_MS = 2600;

/**
 * Demo implementation of the AI boundary. It never reads the user's document:
 * built-in examples and recognisable pasted text get their matching sample; anything
 * else gets a clearly labelled sample result.
 */
export const mockClient: AIClient = {
  async analyzeDocument(input: AnalyzeInput): Promise<AnalyzeResult> {
    if (input.kind === 'text' && !input.sampleId && (input.text ?? '').trim().length < 20) {
      await wait(400);
      throw new AnalyzeError('too_short', 'This message is too short to explain. Paste the whole message, including the greeting.');
    }

    await wait(ANALYZE_DURATION_MS);

    const exact = sampleById(input.sampleId);
    if (exact) return { analysis: exact.analysis, originalText: exact.original, demo: null, sampleId: exact.id };

    const matched = input.kind === 'text' ? matchSample(input.text ?? '') : undefined;
    if (matched) {
      return { analysis: matched.analysis, originalText: input.text ?? matched.original, demo: 'matched', sampleId: matched.id };
    }

    const fallback = samples.find((s) => s.category === input.hint) ?? samples[0];
    return { analysis: fallback.analysis, originalText: fallback.original, demo: 'sample', sampleId: fallback.id };
  },

  async generateReply({ sampleId, intentId, tone }: ReplyInput): Promise<ReplyDraft> {
    await wait(700);
    const sample = sampleById(sampleId) ?? samples[0];
    const template = sample.replies[intentId] ?? Object.values(sample.replies)[0];
    const greeting = sample.greeting ?? { cs: 'Dobrý den,', en: 'Hello,' };
    const name = sample.signature ?? { cs: '[Vaše jméno]', en: '[Your name]' };

    const frame = {
      formal: {
        cs: `${greeting.cs}\n\n${template.body.cs}\n\nS pozdravem\n${name.cs}`,
        en: `${greeting.en}\n\n${template.body.en}\n\nKind regards\n${name.en}`,
      },
      friendly: {
        cs: `${greeting.cs}\n\n${template.body.cs}\n\nDěkuji a přeji hezký den\n${name.cs}`,
        en: `${greeting.en}\n\n${template.body.en}\n\nThank you and have a nice day\n${name.en}`,
      },
      short: {
        cs: `${greeting.cs}\n${template.short.cs}\n\nDěkuji\n${name.cs}`,
        en: `${greeting.en}\n${template.short.en}\n\nThank you\n${name.en}`,
      },
    }[tone];

    return { intentId, tone, czech: frame.cs, english: frame.en };
  },
};

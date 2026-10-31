import { matchSample, sampleById, samples } from './samples';
import {
  AnalyzeError,
  type AIClient,
  type AnalyzeInput,
  type AnalyzeResult,
  type ComposeInput,
  type ComposeResult,
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
      throw new AnalyzeError('too_short', 'This text is too short to explain. Paste all of it, including any greeting or heading.');
    }

    await wait(ANALYZE_DURATION_MS);

    const exact = sampleById(input.sampleId);
    if (exact) return { analysis: exact.analysis, originalText: exact.original, demo: null, sampleId: exact.id };

    const matched = input.kind === 'text' ? matchSample(input.text ?? '') : undefined;
    if (matched) {
      return { analysis: matched.analysis, originalText: input.text ?? matched.original, demo: 'matched', sampleId: matched.id };
    }

    // A photo of an unknown text demos best as a street sign; a topic hint picks a closer sample.
    const fallback = samples.find((s) => s.category === input.hint) ?? samples[0];
    return { analysis: fallback.analysis, originalText: fallback.original, demo: 'sample', sampleId: fallback.id };
  },

  async generateReply({ sampleId, intentId }: ReplyInput): Promise<ReplyDraft> {
    await wait(700);
    const sample = sampleById(sampleId) ?? samples[0];
    const template = sample.replies[intentId] ?? Object.values(sample.replies)[0];
    const greeting = sample.greeting ?? { cs: 'Dobrý den,', en: 'Hello,' };
    const name = sample.signature ?? { cs: '[Vaše jméno]', en: '[Your name]' };
    return {
      intentId,
      czech: `${greeting.cs}\n\n${template.body.cs}\n\nS pozdravem\n${name.cs}`,
      english: `${greeting.en}\n\n${template.body.en}\n\nKind regards\n${name.en}`,
    };
  },

  // Without the server nothing can be written from the reader's words: say so plainly.
  async composeMessage({ details }: ComposeInput): Promise<ComposeResult> {
    await wait(700);
    const demo = '[Demo: CzechPal writes your message here when it is connected to the server.]';
    return {
      czech: `Dobrý den,\n\n${demo}\n\nČesky mluvím jen trochu, proto prosím o odpověď písemně.\n\nS pozdravem\n${details.name?.trim() || '[Vaše jméno]'}`,
      english: `Hello,\n\n${demo}\n\nI only speak a little Czech, so please reply in writing.\n\nKind regards\n${details.name?.trim() || '[Your name]'}`,
      call: { say: [], hear: [] },
    };
  },
};

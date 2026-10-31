import { isBackendConfigured } from '@/lib/supabase';

import { liveClient } from './live-client';
import { mockClient } from './mock-client';
import type { AIClient } from './types';

/** Live Claude via Supabase when the backend is configured; the built-in samples otherwise. */
export const ai: AIClient = isBackendConfigured ? liveClient : mockClient;

export const isDemoMode = ai === mockClient;

/** Built-in examples always use their sample result: instant, free, and no allowance used. */
export const analyzerFor = (item: { source: string }): AIClient => (item.source === 'example' ? mockClient : ai);

/** Replies to a sample come from the sample's templates; everything else goes to the live AI. */
export const replierFor = (item: { sampleId?: string }): AIClient => (item.sampleId ? mockClient : ai);

export * from './types';
export type { PartialAnalysis } from './partial-analysis';
export * from './languages';

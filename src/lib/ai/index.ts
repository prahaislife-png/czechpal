import { mockClient } from './mock-client';
import type { AIClient } from './types';

/**
 * Swap point for the real backend. When the Supabase Edge Function is ready:
 *   export const ai: AIClient = createSupabaseClient(supabase);
 * Screens only ever import `ai` from here.
 */
export const ai: AIClient = mockClient;

export const isDemoMode = ai === mockClient;

export * from './types';

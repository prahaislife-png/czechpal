import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';

/**
 * Czech audio from the device's own voice (text-to-speech), until recorded narration exists.
 * Not every phone has a Czech voice installed, so the app checks first and says so.
 */

export type VoiceState = 'checking' | 'available' | 'missing';

let cached: { state: VoiceState; voice?: string } | null = null;

async function findCzechVoice() {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const czech = voices.filter((v) => v.language?.toLowerCase().startsWith('cs'));
    // Prefer a higher-quality voice when the phone has one.
    const best = czech.find((v) => v.quality === Speech.VoiceQuality.Enhanced) ?? czech[0];
    return best ? { state: 'available' as const, voice: best.identifier } : { state: 'missing' as const };
  } catch {
    return { state: 'missing' as const };
  }
}

export function useCzechVoice() {
  const [voice, setVoice] = useState(cached ?? { state: 'checking' as VoiceState });
  useEffect(() => {
    if (cached) return;
    let active = true;
    findCzechVoice().then((v) => {
      // A list can come back empty while the system is still loading voices; don't keep "missing" for good.
      if (v.state === 'available') cached = v;
      if (active) setVoice(v);
    });
    return () => {
      active = false;
    };
  }, []);
  return voice;
}

export function speak(text: string, opts: { voice?: string; rate: number; onDone?: () => void }) {
  void Speech.stop();
  Speech.speak(text, {
    language: 'cs-CZ',
    voice: opts.voice,
    rate: opts.rate,
    onDone: opts.onDone,
    onStopped: undefined,
  });
}

export const stopSpeaking = () => void Speech.stop();

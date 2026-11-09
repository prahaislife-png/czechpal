import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useCallback, useEffect } from 'react';

import type { TaskSet } from '@/lib/academy/types';
import { speak, stopSpeaking } from '@/lib/learn/voice';

import { audioHash } from './audio-key';
import { recordings } from './audio-manifest';

/**
 * Recorded Czech for listening (Azure neural voices, generated once and shipped with the app). A
 * file plays only when it was made from exactly the text the app has now; otherwise, or when there
 * is no file, the phone's own Czech voice reads the text, as before.
 */

const byHash = new Map(Object.values(recordings).map((r) => [r.hash, r.src]));

/** The recording of exactly this text, or null. */
export const recordingFor = (text: string): number | null => byHash.get(audioHash(text)) ?? null;

/** True when every one of these texts plays from a recording, so the phone's voice isn't needed. */
export const allRecorded = (texts: string[]) => texts.length > 0 && texts.every((t) => recordingFor(t) !== null);

/** The texts a listening set plays: its voice message and each item's recording. */
export const setTexts = (set: TaskSet): string[] => [set.audio, ...set.items.map((i) => i.audio)].filter((t): t is string => !!t);

/** Slower playback in learn mode: 80 %, with pitch kept natural. */
const SLOW = 0.8;

/**
 * One player for a screen. `play(text)` uses the recording when there is one, else the phone's
 * Czech voice (with the learner's `voice` and `rate`, as before).
 */
export function useRecordingPlayer(voice: { voice?: string; rate: number }) {
  const player = useAudioPlayer(null);

  useEffect(
    () => () => {
      stopSpeaking();
    },
    [],
  );

  const play = useCallback(
    (text: string, slow = false) => {
      const src = recordingFor(text);
      stopSpeaking();
      if (src === null) {
        player.pause();
        speak(text, { voice: voice.voice, rate: slow ? voice.rate * 0.75 : voice.rate });
        return;
      }
      // Play through the speaker even with the ringer switch on silent, as listening practice should.
      setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false }).catch(() => {});
      player.replace(src);
      // 'high' keeps the pitch natural when slowed down.
      player.setPlaybackRate(slow ? SLOW : 1, 'high');
      void player.seekTo(0);
      player.play();
    },
    [player, voice.voice, voice.rate],
  );

  const stop = useCallback(() => {
    player.pause();
    stopSpeaking();
  }, [player]);

  return { play, stop };
}

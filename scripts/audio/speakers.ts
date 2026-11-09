// Speaker voices for each recording, and a check that they agree with the Czech: a speaker who
// says "chtěl bych" or "byl jsem" must have a male voice, "chtěla bych" or "byla jsem" a female one.
import voicesFile from './voices.json';

import { turnsOf } from '../../src/lib/academy/audio-key';

export type Speaker = 'F' | 'M' | 'F2' | 'M2';
export const SPEAKERS: Speaker[] = ['F', 'M', 'F2', 'M2'];

/** Azure neural voices for Czech, and how the second speaker of a gender is made to sound different. */
export const VOICE: Record<Speaker, { name: string; pitch: string }> = {
  F: { name: 'cs-CZ-VlastaNeural', pitch: '+0%' },
  F2: { name: 'cs-CZ-VlastaNeural', pitch: '-9%' },
  M: { name: 'cs-CZ-AntoninNeural', pitch: '+0%' },
  M2: { name: 'cs-CZ-AntoninNeural', pitch: '+10%' },
};

const voices = voicesFile as unknown as Record<string, string>;

export function speakersFor(key: string): Speaker[] | null {
  const v = voices[key];
  return v ? (v.split(/\s+/) as Speaker[]) : null;
}

/** First-person gender the speaker shows in this turn, if any. */
export function genderCue(turn: string): 'M' | 'F' | null {
  const t = turn.toLocaleLowerCase('cs');
  const fem = /\b\p{L}+la (jsem|bych)\b|\b(jsem|bych) \p{L}+la\b|\b(ráda bych|mám ráda|nemám ráda|jsem ráda)\b/u;
  const masc = /\b\p{L}+l (jsem|bych)\b|\b(jsem|bych) \p{L}+l\b|\b(rád bych|mám rád|nemám rád|jsem rád)\b|^(jasně|ano|jo),? rád\b/u;
  if (fem.test(t)) return 'F';
  if (masc.test(t)) return 'M';
  return null;
}

/** Problems with the voices for one recording: missing, the wrong number of turns, or a voice that contradicts the Czech. */
export function checkVoices(key: string, text: string): string[] {
  const speakers = speakersFor(key);
  const turns = turnsOf(text);
  if (!speakers) return [`${key}: no voices assigned`];
  const problems: string[] = [];
  if (speakers.length !== turns.length) problems.push(`${key}: ${turns.length} turns but ${speakers.length} voices`);
  for (const s of speakers) if (!SPEAKERS.includes(s)) problems.push(`${key}: unknown voice "${s}"`);
  turns.forEach((turn, i) => {
    const cue = genderCue(turn);
    const s = speakers[i];
    if (cue && s && s[0] !== cue) problems.push(`${key}: turn ${i + 1} sounds ${cue === 'F' ? 'female' : 'male'} ("${turn.slice(0, 40)}") but has voice ${s}`);
  });
  return problems;
}

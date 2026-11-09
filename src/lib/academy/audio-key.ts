/**
 * A short fingerprint of a recording's Czech text. A recorded file is played only when its
 * fingerprint matches the text in the app now, so an edited text never plays an old recording
 * (the phone's voice reads it until the audio is regenerated).
 */
export function audioHash(text: string): string {
  const s = text.normalize('NFC').replace(/\s+/g, ' ').trim();
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

/** A recording's turns: " – " (a spaced en dash) marks a new speaker. */
export const turnsOf = (text: string) => text.split(/\s+–\s+/).map((t) => t.trim()).filter(Boolean);

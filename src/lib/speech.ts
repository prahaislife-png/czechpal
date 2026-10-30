import * as Speech from 'expo-speech';

/** Reads Czech aloud with the device's Czech voice, slightly slower than normal speech. */
export function speakCzech(text: string) {
  void Speech.stop();
  Speech.speak(text, { language: 'cs-CZ', rate: 0.85 });
}

export function stopSpeaking() {
  void Speech.stop();
}

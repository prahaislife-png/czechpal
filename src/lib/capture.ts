import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

import { sampleById } from '@/lib/ai/samples';
import { useStore } from '@/store/cases';

/** Pickers create a draft and return its id (null when cancelled); callers decide how to navigate. */

export async function pickImage(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
  if (result.canceled) return null;
  return useStore.getState().createDraft({ source: 'library', imageUri: result.assets[0].uri });
}

export async function pickPdf(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
  if (result.canceled) return null;
  return useStore.getState().createDraft({ source: 'pdf', fileName: result.assets[0].name });
}

export function draftFromPhoto(uri: string) {
  return useStore.getState().createDraft({ source: 'camera', imageUri: uri });
}

export function draftFromText(text: string) {
  return useStore.getState().createDraft({ source: 'text', text });
}

export function draftFromExample(sampleId: string) {
  const sample = sampleById(sampleId);
  if (!sample) return null;
  return useStore.getState().createDraft({ source: 'example', sampleId, text: sample.original, hint: sample.category });
}

const review = (id: string) => ({ pathname: '/review/[id]', params: { id } }) as const;

export const openReview = (id: string | null) => {
  if (id) router.push(review(id));
};

/**
 * From a modal (scanner, paste): close it, then continue in the main stack.
 * Opened from a deep link there is nothing underneath to dismiss to, so take its place instead.
 */
export function leaveModalForReview(id: string | null) {
  if (!id) return;
  if (router.canDismiss()) {
    router.dismiss();
    router.push(review(id));
  } else {
    router.replace(review(id));
  }
}

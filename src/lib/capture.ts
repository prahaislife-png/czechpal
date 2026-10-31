import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import type { ResolvedSharePayload } from 'expo-sharing';

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
  const file = result.assets[0];
  return useStore.getState().createDraft({ source: 'pdf', fileUri: file.uri, fileName: file.name });
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

export type SharedItem =
  | { kind: 'text'; text: string }
  | { kind: 'image'; uri: string }
  | { kind: 'pdf'; uri: string; name: string }
  | { kind: 'link'; url: string };

/**
 * Picks what to read from content shared by another app (WhatsApp, Mail, Photos, Files):
 * text first, then an image, then a PDF, then a link. Null when nothing usable arrived.
 */
export function pickSharedItem(payloads: ResolvedSharePayload[]): SharedItem | null {
  const text = payloads.find((p) => p.shareType === 'text' && p.value.trim());
  if (text) return { kind: 'text', text: text.value.trim() };
  const image = payloads.find((p) => p.contentType === 'image' && p.contentUri);
  if (image?.contentUri) return { kind: 'image', uri: image.contentUri };
  const pdf = payloads.find((p) => p.contentMimeType === 'application/pdf' && p.contentUri);
  if (pdf?.contentUri) return { kind: 'pdf', uri: pdf.contentUri, name: pdf.originalName ?? 'Shared document.pdf' };
  const link = payloads.find((p) => p.shareType === 'url' && p.value.trim());
  if (link) return { kind: 'link', url: link.value.trim() };
  return null;
}

export function draftFromShare(item: SharedItem): string {
  const { createDraft } = useStore.getState();
  switch (item.kind) {
    case 'text':
      return draftFromText(item.text);
    case 'image':
      return createDraft({ source: 'library', imageUri: item.uri });
    case 'pdf':
      return createDraft({ source: 'pdf', fileUri: item.uri, fileName: item.name });
    case 'link':
      return draftFromText(item.url);
  }
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

import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import type { ResolvedSharePayload } from 'expo-sharing';

import { sampleById } from '@/lib/ai/samples';
import { MAX_PAGES, useStore } from '@/store/cases';

/** Pickers create a draft and return its id (null when cancelled); callers decide how to navigate. */

/** Photos from the library, in the order picked. Several photos are pages of one document. */
async function pickPhotos(limit: number): Promise<string[]> {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsMultipleSelection: limit > 1,
    selectionLimit: limit,
    orderedSelection: true,
  });
  if (result.canceled) return [];
  return result.assets.slice(0, limit).map((a) => a.uri);
}

export async function pickImage(): Promise<string | null> {
  const [first, ...more] = await pickPhotos(MAX_PAGES);
  if (!first) return null;
  return useStore.getState().createDraft({ source: 'library', imageUri: first, morePages: more });
}

/** Adds pages from the library to a draft. Returns false when the user cancelled. */
export async function pickMorePages(id: string, limit: number): Promise<boolean> {
  const uris = await pickPhotos(limit);
  if (!uris.length) return false;
  useStore.getState().addPages(id, uris);
  return true;
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
  | { kind: 'image'; uris: string[] }
  | { kind: 'pdf'; uri: string; name: string }
  | { kind: 'link'; url: string };

/**
 * Picks what to read from content shared by another app (WhatsApp, Mail, Photos, Files):
 * text first, then images (several are pages of one document), then a PDF, then a link.
 * Null when nothing usable arrived.
 */
export function pickSharedItem(payloads: ResolvedSharePayload[]): SharedItem | null {
  const text = payloads.find((p) => p.shareType === 'text' && p.value.trim());
  if (text) return { kind: 'text', text: text.value.trim() };
  const images = payloads.flatMap((p) => (p.contentType === 'image' && p.contentUri ? [p.contentUri] : []));
  if (images.length) return { kind: 'image', uris: images.slice(0, MAX_PAGES) };
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
      return createDraft({ source: 'library', imageUri: item.uris[0], morePages: item.uris.slice(1) });
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

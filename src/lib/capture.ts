import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

import { notify } from '@/lib/dialogs';
import { sampleById } from '@/lib/ai/samples';
import { useStore } from '@/store/cases';

const openReview = (id: string) => router.push({ pathname: '/review/[id]', params: { id } });

export async function captureWithCamera() {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    notify('Camera access is off', 'Allow camera access in Settings to scan letters, or choose a photo instead.');
    return;
  }
  const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
  if (result.canceled) return;
  openReview(useStore.getState().createDraft({ source: 'camera', imageUri: result.assets[0].uri }));
}

export async function pickFromLibrary() {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
  if (result.canceled) return;
  openReview(useStore.getState().createDraft({ source: 'library', imageUri: result.assets[0].uri }));
}

export async function pickPdf() {
  const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
  if (result.canceled) return;
  const file = result.assets[0];
  openReview(useStore.getState().createDraft({ source: 'pdf', fileName: file.name }));
}

export function openExample(sampleId: string) {
  const sample = sampleById(sampleId);
  if (!sample) return;
  openReview(
    useStore.getState().createDraft({ source: 'example', sampleId, text: sample.original, hint: sample.category }),
  );
}

export function submitPastedText(text: string) {
  return useStore.getState().createDraft({ source: 'text', text });
}

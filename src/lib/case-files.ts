import { Directory, File, Paths } from 'expo-file-system';

import { CASE_FILES_FOLDER, keptParts, pageFileName, PDF_FILE_NAME } from './case-file-names';

/**
 * A saved letter's own files. The camera, the photo picker and the share sheet all hand over
 * files in the app's cache, which the phone may empty at any time; and a saved address stops
 * working when an update moves the app's folder. So when a letter is kept, its pages (or PDF) are
 * copied into the app's documents, one folder per letter, and addresses saved earlier are pointed
 * at wherever the documents folder is today. Deleting a letter deletes its folder.
 *
 * On the web there are no files to keep: addresses stay as they are.
 */

const web = process.env.EXPO_OS === 'web';

const root = () => new Directory(Paths.document, CASE_FILES_FOLDER);
const folderFor = (caseId: string) => new Directory(root(), caseId);

type Files = { imageUri?: string; morePages?: string[]; fileUri?: string };

/** Where a kept file is now; any other address comes back unchanged. */
export function currentUri(uri: string): string;
export function currentUri(uri: string | undefined): string | undefined;
export function currentUri(uri: string | undefined) {
  if (web || !uri) return uri;
  const kept = keptParts(uri);
  if (!kept) return uri;
  try {
    return new File(folderFor(kept.caseId), kept.name).uri;
  } catch {
    return uri;
  }
}

/** A letter's saved addresses, pointed at today's documents folder. The same object when nothing moved. */
export function currentFiles<T extends Files>(item: T): T {
  const imageUri = currentUri(item.imageUri);
  const fileUri = currentUri(item.fileUri);
  const morePages = item.morePages?.map((p) => currentUri(p));
  const moved = imageUri !== item.imageUri || fileUri !== item.fileUri || !!morePages?.some((p, i) => p !== item.morePages![i]);
  return moved ? { ...item, imageUri, fileUri, morePages } : item;
}

/** Copies one file into the letter's folder and returns its new address; on any failure, the old one. */
async function keep(caseId: string, uri: string, name: string): Promise<string> {
  if (keptParts(uri)?.caseId === caseId) return currentUri(uri);
  try {
    const source = new File(uri);
    // A file the phone has already cleared away can't be kept; leave the letter as it is.
    if (!source.exists) return uri;
    const dir = folderFor(caseId);
    if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
    const dest = new File(dir, name);
    if (dest.exists) dest.delete();
    await source.copy(dest);
    // The copy in the cache (from the camera or a picker) isn't needed any more.
    if (uri.startsWith(Paths.cache.uri)) {
      try {
        source.delete();
      } catch {
        // Already gone, or not ours to delete.
      }
    }
    return dest.uri;
  } catch {
    return uri;
  }
}

/**
 * Keeps a letter's pages or PDF. Returns only what changed (nothing on the web, or when
 * everything is already kept), ready to be saved on the letter.
 */
export async function keepCaseFiles(caseId: string, item: Files): Promise<Files> {
  if (web) return {};
  const change: Files = {};
  if (item.imageUri) {
    const first = await keep(caseId, item.imageUri, pageFileName(0, item.imageUri));
    if (first !== item.imageUri) change.imageUri = first;
    if (item.morePages?.length) {
      const more: string[] = [];
      for (const [i, uri] of item.morePages.entries()) more.push(await keep(caseId, uri, pageFileName(i + 1, uri)));
      if (more.some((uri, i) => uri !== item.morePages![i])) change.morePages = more;
    }
  }
  if (item.fileUri) {
    const file = await keep(caseId, item.fileUri, PDF_FILE_NAME);
    if (file !== item.fileUri) change.fileUri = file;
  }
  return change;
}

/** Deletes one letter's kept files. */
export function deleteCaseFiles(caseId: string) {
  if (web) return;
  try {
    const dir = folderFor(caseId);
    if (dir.exists) dir.delete();
  } catch {
    // Nothing kept, or already gone.
  }
}

/** Deletes every kept file (Settings → Delete everything). */
export function deleteAllCaseFiles() {
  if (web) return;
  try {
    const dir = root();
    if (dir.exists) dir.delete();
  } catch {
    // Nothing kept, or already gone.
  }
}

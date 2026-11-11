/**
 * Names for the files a saved letter keeps (its photographed pages or its PDF). No imports, so the
 * tests can run it. The files themselves are handled in case-files.ts.
 */

/** The folder, inside the app's documents, that holds one sub-folder per saved letter. */
export const CASE_FILES_FOLDER = 'case-files';

const KEPT = /\/case-files\/([A-Za-z0-9_-]+)\/([A-Za-z0-9._-]+)$/;

/** The letter and file name of a kept file's address, or null when the address is somewhere else. */
export function keptParts(uri: string | undefined): { caseId: string; name: string } | null {
  const m = uri ? KEPT.exec(uri.split('?')[0]) : null;
  return m ? { caseId: m[1], name: m[2] } : null;
}

const IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp'];

/** "page-1.jpg": the page's place in the document, with the photo's own type when it's a known one. */
export function pageFileName(index: number, uri: string) {
  const ext = /\.([A-Za-z0-9]+)$/.exec(uri.split('?')[0])?.[1]?.toLowerCase();
  return `page-${index + 1}.${ext && IMAGE_TYPES.includes(ext) ? ext : 'jpg'}`;
}

export const PDF_FILE_NAME = 'document.pdf';

import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Speaking recordings, kept on this phone only: one file per prompt (a new take replaces the old
 * one) in the app's own documents folder. Never uploaded. Settings → Delete everything removes the
 * folder. On the web they live in memory until the page closes.
 */

const web = Platform.OS === 'web';
const memory = new Map<string, string>();

const folder = () => new Directory(Paths.document, 'speaking');
const fileFor = (id: string) => new File(folder(), `${id}.m4a`);

/** Moves a finished take into the recordings folder and returns where it is now. */
export async function keepRecording(id: string, uri: string): Promise<string> {
  if (web) {
    const old = memory.get(id);
    if (old?.startsWith('blob:') && old !== uri) URL.revokeObjectURL(old);
    memory.set(id, uri);
    return uri;
  }
  const dir = folder();
  if (!dir.exists) dir.create({ intermediates: true, idempotent: true });
  const dest = fileFor(id);
  if (dest.exists) dest.delete();
  await new File(uri).move(dest);
  memory.set(id, dest.uri);
  return dest.uri;
}

/** The saved take for a prompt, if there is one. */
export function recordingFor(id: string): string | undefined {
  if (web) return memory.get(id);
  try {
    const f = fileFor(id);
    return f.exists ? f.uri : undefined;
  } catch {
    return undefined;
  }
}

/** Deletes the takes for these prompts, or every take when none are named. */
export function deleteRecordings(ids?: string[]) {
  if (web) {
    for (const [id, uri] of memory) if (!ids || ids.includes(id)) {
      if (uri.startsWith('blob:')) URL.revokeObjectURL(uri);
      memory.delete(id);
    }
    return;
  }
  try {
    if (!ids) {
      const dir = folder();
      if (dir.exists) dir.delete();
    } else
      for (const id of ids) {
        const f = fileFor(id);
        if (f.exists) f.delete();
      }
  } catch {
    // Nothing to delete, or already gone.
  }
  for (const id of ids ?? [...memory.keys()]) memory.delete(id);
}

import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/**
 * Claude reads images up to about 1568px on the long edge without downscaling them itself,
 * so anything larger is resized here: faster uploads, same accuracy, lower cost.
 */
const MAX_EDGE = 1568;

const stripDataUrl = (b64: string) => b64.replace(/^data:[^,]*,/, '');

/** `maxEdge` and `compress` go lower for a quick translation, where speed matters more than detail. */
export async function imageForUpload(uri: string, maxEdge = MAX_EDGE, compress = 0.8): Promise<{ data: string; mediaType: 'image/jpeg' }> {
  // The photo is decoded once: this render gives its size, and the resize starts from it.
  const original = await ImageManipulator.manipulate(uri).renderAsync();
  const rendered =
    Math.max(original.width, original.height) > maxEdge
      ? await ImageManipulator.manipulate(original)
          .resize(original.width >= original.height ? { width: maxEdge } : { height: maxEdge })
          .renderAsync()
      : original;
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress, base64: true });
  if (!saved.base64) throw new Error('Image could not be encoded');
  return { data: stripDataUrl(saved.base64), mediaType: 'image/jpeg' };
}

/** PDFs go up as they are; the server rejects anything over its size limit. */
export async function fileAsBase64(uri: string): Promise<string> {
  if (process.env.EXPO_OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(stripDataUrl(String(reader.result)));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  }
  return new File(uri).base64();
}

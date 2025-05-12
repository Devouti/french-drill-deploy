import { get, set, del, keys } from 'idb-keyval';

// Save a set of audio files (keyed by filename)
export async function saveAudioFiles(files: Record<string, File>) {
  await Promise.all(
    Object.entries(files).map(([name, file]) => set(name, file))
  );
}

// Load all saved audio files from IndexedDB
export async function loadAudioFiles(): Promise<Record<string, File>> {
  const map: Record<string, File> = {};
  const fileKeys = await keys();

  for (const key of fileKeys) {
    const value = await get(key);
    if (value instanceof File) {
      map[key as string] = value;
    }
  }

  return map;
}

// Wipe all audio files
export async function clearAudioFiles() {
  const fileKeys = await keys();
  await Promise.all(fileKeys.map(del));
}
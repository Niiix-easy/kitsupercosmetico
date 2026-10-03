// Utility for image compression and quota-safe IndexedDB storage

const DB_NAME = 'DyusarCustomImagesDB';
const DB_VERSION = 1;
const STORE_NAME = 'caseImages';

// Open or initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Compress an uploaded image file on Canvas to max dimensions and 0.82 JPEG quality.
 * Reduces 5MB-10MB images down to ~100KB-200KB.
 */
export function compressImage(file: File, maxDimension = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Save custom case image into IndexedDB and localStorage (safely).
 */
export async function saveCustomCaseImage(index: number, dataUrl: string): Promise<void> {
  // 1. Save in IndexedDB (Unlimited quota)
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(dataUrl, index.toString());
  } catch (err) {
    console.warn('IndexedDB save warning:', err);
  }

  // 2. Safe localStorage fallback (catches QuotaExceededError)
  try {
    const saved = localStorage.getItem('dyusar_custom_case_images');
    const dict = saved ? JSON.parse(saved) : {};
    dict[index] = dataUrl;
    localStorage.setItem('dyusar_custom_case_images', JSON.stringify(dict));
  } catch (err) {
    console.warn('LocalStorage QuotaExceededError suppressed safely. Using IndexedDB storage.', err);
  }
}

/**
 * Load all custom case images from IndexedDB or localStorage.
 */
export async function loadCustomCaseImages(): Promise<Record<number, string>> {
  const result: Record<number, string> = {};

  // Try loading from IndexedDB first
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve) => {
      const request = store.openCursor();
      request.onsuccess = (e) => {
        const cursor = (e.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const keyNum = parseInt(cursor.key as string, 10);
          if (!isNaN(keyNum)) {
            result[keyNum] = cursor.value as string;
          }
          cursor.continue();
        } else {
          resolve(result);
        }
      };
      request.onerror = () => resolve(loadFromLocalStorageFallback());
    });
  } catch (e) {
    return loadFromLocalStorageFallback();
  }
}

function loadFromLocalStorageFallback(): Record<number, string> {
  try {
    const saved = localStorage.getItem('dyusar_custom_case_images');
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    return {};
  }
}

/**
 * Delete custom case image.
 */
export async function removeCustomCaseImage(index: number): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(index.toString());
  } catch (err) {
    console.warn('IndexedDB delete error:', err);
  }

  try {
    const saved = localStorage.getItem('dyusar_custom_case_images');
    if (saved) {
      const dict = JSON.parse(saved);
      delete dict[index];
      localStorage.setItem('dyusar_custom_case_images', JSON.stringify(dict));
    }
  } catch (err) {
    console.warn('LocalStorage delete error:', err);
  }
}

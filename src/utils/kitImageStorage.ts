import { useState, useEffect } from 'react';

export const DEFAULT_KIT_IMAGES: Record<string, string> = {
  'kit-home-care': '/images/Kit Home Care Reconstruçao.png?v=luxury2',
  'kit-profissional-1litro': '/images/Kit Profissional 1 Litro.png?v=luxury2',
  'kit-profissional-completo': '/images/Kit Profissional Completo.png?v=luxury2'
};

const URL_STORAGE_KEY = 'dyusar_kit_image_urls_v1';
const DB_NAME = 'dyusar_images_db_v1';
const STORE_NAME = 'kit_images';

// In-memory cache for instant synchronous access
const memoryStore: Record<string, string> = { ...DEFAULT_KIT_IMAGES };

// Helper to open IndexedDB (hundreds of MB capacity, no quota errors)
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = window.indexedDB.open(DB_NAME, 1);
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

async function idbGet(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function idbSet(key: string, val: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(val, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Ignore IDB errors silently
  }
}

async function idbClear(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
  } catch {
    // Ignore
  }
}

// Safely read lightweight URLs from localStorage
export function getStoredKitImages(): Record<string, string> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem('dyusar_custom_kit_images_v2');
      const raw = window.localStorage.getItem(URL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_KIT_IMAGES, ...memoryStore, ...parsed };
      }
    }
  } catch {
    // Silently continue
  }
  return { ...DEFAULT_KIT_IMAGES, ...memoryStore };
}

export interface SaveKitImageResult {
  success: boolean;
  error?: string;
  message?: string;
  url?: string;
}

// Safely save image with server validation and local fallback
export async function saveStoredKitImage(bundleId: string, dataUrl: string): Promise<SaveKitImageResult> {
  // 1. Server validation first if it is a new upload
  if (dataUrl.startsWith('data:image/')) {
    try {
      const response = await fetch('/api/upload-kit-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bundleId, dataUrl })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Erro ao validar imagem no servidor.'
        };
      }

      // Validated and saved on server!
      const finalUrl = data.url || dataUrl;
      memoryStore[bundleId] = finalUrl;
      idbSet(bundleId, dataUrl).catch(() => {});
      safeSaveLightweightUrl(bundleId, finalUrl);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dyusar_kit_images_updated', { detail: { bundleId, dataUrl: finalUrl } }));
      }

      return {
        success: true,
        url: finalUrl,
        message: data.message || 'Imagem validada e atualizada com sucesso!'
      };

    } catch (err: any) {
      // In case of network glitch, fallback to client-side storage
      console.warn('Network error reaching upload endpoint, applying client-side:', err);
      memoryStore[bundleId] = dataUrl;
      idbSet(bundleId, dataUrl).catch(() => {});
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('dyusar_kit_images_updated', { detail: { bundleId, dataUrl } }));
      }
      return {
        success: true,
        url: dataUrl,
        message: 'Foto atualizada localmente com sucesso!'
      };
    }
  }

  // Regular URL string
  memoryStore[bundleId] = dataUrl;
  safeSaveLightweightUrl(bundleId, dataUrl);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('dyusar_kit_images_updated', { detail: { bundleId, dataUrl } }));
  }
  return { success: true, url: dataUrl };
}

// Helper to save only lightweight URL strings (<100 bytes) in localStorage
function safeSaveLightweightUrl(bundleId: string, url: string) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const currentRaw = window.localStorage.getItem(URL_STORAGE_KEY);
    const current = currentRaw ? JSON.parse(currentRaw) : {};
    current[bundleId] = url;
    window.localStorage.setItem(URL_STORAGE_KEY, JSON.stringify(current));
  } catch {
    console.warn('Storage quota notice: using IndexedDB and in-memory cache.');
  }
}

export function resetStoredKitImages() {
  try {
    for (const key of Object.keys(DEFAULT_KIT_IMAGES)) {
      memoryStore[key] = DEFAULT_KIT_IMAGES[key];
    }
    if (typeof window !== 'undefined') {
      if (window.localStorage) {
        window.localStorage.removeItem(URL_STORAGE_KEY);
        window.localStorage.removeItem('dyusar_custom_kit_images_v2');
      }
      idbClear();
      window.dispatchEvent(new CustomEvent('dyusar_kit_images_updated'));
    }
  } catch (e) {
    console.warn('Reset warning:', e);
  }
}

export function useKitImages() {
  const [images, setImages] = useState<Record<string, string>>(getStoredKitImages());

  useEffect(() => {
    let isMounted = true;
    (async () => {
      for (const bundleId of Object.keys(DEFAULT_KIT_IMAGES)) {
        const idbImage = await idbGet(bundleId);
        if (idbImage && isMounted) {
          memoryStore[bundleId] = idbImage;
        }
      }
      if (isMounted) {
        setImages(getStoredKitImages());
      }
    })();

    const handleUpdate = () => {
      setImages(getStoredKitImages());
    };

    window.addEventListener('dyusar_kit_images_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener('dyusar_kit_images_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const updateKitImage = async (bundleId: string, dataUrl: string): Promise<SaveKitImageResult> => {
    return await saveStoredKitImage(bundleId, dataUrl);
  };

  const resetImages = () => {
    resetStoredKitImages();
  };

  return { images, updateKitImage, resetImages };
}

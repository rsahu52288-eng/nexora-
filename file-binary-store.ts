/**
 * Nexora Binary IndexedDB Store
 * High-performance, offline-first client storage for exact file binaries.
 * Preserves 100% byte fidelity for any file size and type.
 */

const DB_NAME = "nexora_binary_vault";
const STORE_NAME = "file_blobs";
const DB_VERSION = 1;

// In-memory L1 cache for synchronous instant access within session
const memoryBlobCache = new Map<string, Blob>();

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined" || !window.indexedDB) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

export async function storeFileBinary(fileId: string, blob: Blob): Promise<boolean> {
  if (!fileId || !blob) return false;
  memoryBlobCache.set(fileId, blob);

  try {
    const db = await openDB();
    if (!db) return false;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, fileId);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function getFileBinary(fileId: string): Promise<Blob | null> {
  if (!fileId) return null;

  // Check L1 memory cache first
  const cached = memoryBlobCache.get(fileId);
  if (cached && cached.size > 0) {
    return cached;
  }

  try {
    const db = await openDB();
    if (!db) return null;

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(fileId);

      req.onsuccess = () => {
        const result = req.result;
        if (result instanceof Blob && result.size > 0) {
          memoryBlobCache.set(fileId, result);
          resolve(result);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function deleteFileBinary(fileId: string): Promise<void> {
  if (!fileId) return;
  memoryBlobCache.delete(fileId);

  try {
    const db = await openDB();
    if (!db) return;
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(fileId);
  } catch {}
}

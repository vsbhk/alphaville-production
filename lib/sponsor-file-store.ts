export type StoredSponsorFile = {
  id: string;
  file: Blob;
  name: string;
  type: string;
  lastModified: number;
};

const databaseName = "alphaville-personal-workspace";
const filesStoreName = "sponsor-files";
const recordsStoreName = "sponsor-records";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("This browser does not support local file storage."));
      return;
    }
    const request = indexedDB.open(databaseName, 2);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(filesStoreName)) database.createObjectStore(filesStoreName, { keyPath: "id" });
      if (!database.objectStoreNames.contains(recordsStoreName)) database.createObjectStore(recordsStoreName, { keyPath: "key" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open local file storage."));
  });
}

export async function saveSponsorFile(file: File, id: string): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(filesStoreName, "readwrite");
    transaction.objectStore(filesStoreName).put({ id, file, name: file.name, type: file.type, lastModified: file.lastModified } satisfies StoredSponsorFile);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not save this file in the browser."));
    transaction.onabort = () => reject(transaction.error ?? new Error("File storage was interrupted."));
  }).finally(() => database.close());
}

export async function loadSponsorFile(id: string): Promise<StoredSponsorFile | null> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(filesStoreName, "readonly");
    const request = transaction.objectStore(filesStoreName).get(id);
    request.onsuccess = () => resolve((request.result as StoredSponsorFile | undefined) ?? null);
    request.onerror = () => reject(request.error ?? new Error("Could not read a saved file."));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => database.close();
  });
}

export async function deleteSponsorFile(id: string): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(filesStoreName, "readwrite");
    transaction.objectStore(filesStoreName).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not remove this saved file."));
  }).finally(() => database.close());
}

export async function saveLocalSponsorRecord<T>(key: string, record: T): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(recordsStoreName, "readwrite");
    transaction.objectStore(recordsStoreName).put({ key, record });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Could not save a local sponsor draft."));
  }).finally(() => database.close());
}

export async function loadLocalSponsorRecord<T>(key: string): Promise<T | null> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(recordsStoreName, "readonly");
    const request = transaction.objectStore(recordsStoreName).get(key);
    request.onsuccess = () => resolve((request.result as { key: string; record: T } | undefined)?.record ?? null);
    request.onerror = () => reject(request.error ?? new Error("Could not read the local sponsor draft."));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => database.close();
  });
}

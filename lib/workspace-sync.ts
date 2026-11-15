const pendingWrites = new Map<string, Promise<void>>();

export async function loadWorkspaceData<T>(key: string): Promise<T | null> {
  const response = await fetch(`/api/workspace-data?key=${encodeURIComponent(key)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Shared Google Workspace storage is unavailable");
  const result = await response.json() as { payload: T | null };
  return result.payload;
}

export async function saveWorkspaceData(key: string, payload: unknown): Promise<void> {
  const previous = pendingWrites.get(key) ?? Promise.resolve();
  const write = previous.catch(() => undefined).then(async () => {
    const response = await fetch("/api/workspace-data", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ key, payload }),
    });
    if (!response.ok) throw new Error("Could not save to shared Google Workspace storage");
  });

  pendingWrites.set(key, write);
  try {
    await write;
  } finally {
    if (pendingWrites.get(key) === write) pendingWrites.delete(key);
  }
}

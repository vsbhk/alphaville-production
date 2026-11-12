export async function loadWorkspaceData<T>(key: string): Promise<T | null> {
  const response = await fetch(`/api/workspace-data?key=${encodeURIComponent(key)}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Shared Google Workspace storage is unavailable");
  const result = await response.json() as { payload: T | null };
  return result.payload;
}

export async function saveWorkspaceData(key: string, payload: unknown): Promise<void> {
  const response = await fetch("/api/workspace-data", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ key, payload }),
  });
  if (!response.ok) throw new Error("Could not save to shared Google Workspace storage");
}

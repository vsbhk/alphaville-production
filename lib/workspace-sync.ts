/** Shared Google Workspace storage is not configured yet. */
export async function loadWorkspaceData<T>(_key: string): Promise<T | null> {
  throw new Error("Shared Google Workspace storage is not configured");
}

export async function saveWorkspaceData(_key: string, _payload: unknown): Promise<void> {
  throw new Error("Shared Google Workspace storage is not configured");
}

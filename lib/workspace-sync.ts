import { createClient } from "@/lib/supabase/browser";

const projectId = "hkdw-2027";

export async function loadWorkspaceData<T>(key: string): Promise<T | null> {
  const supabase = createClient();
  if (!supabase) return null;
  const { data, error } = await supabase.from("project_workspace_data").select("payload").eq("project_id", projectId).eq("record_key", key).maybeSingle();
  if (error) throw error;
  return (data?.payload as T | undefined) ?? null;
}

export async function saveWorkspaceData(key: string, payload: unknown) {
  const supabase = createClient();
  if (!supabase) throw new Error("Supabase is not configured");
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from("project_workspace_data").upsert({ project_id: projectId, record_key: key, payload, updated_at: new Date().toISOString(), updated_by: user?.id }, { onConflict: "project_id,record_key" });
  if (error) throw error;
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import { loadWorkspaceData, saveWorkspaceData } from "@/lib/workspace-sync";

type ChecklistTask = { id: string; title: string; done: boolean };

const STORAGE_KEY = "hkdw-2027-overview-tasks-v1";
const initialTasks: ChecklistTask[] = [
  { id: "sponsor-chaser", title: "Review sponsor pages for missing information and prepare copy-and-paste chaser emails", done: false },
  { id: "xpeng-follow-up", title: "Remind XPENG to confirm the interview time and meeting point", done: false },
  { id: "daily-plans", title: "Complete daily activity plans", done: false },
  { id: "sponsor-approval", title: "Track sponsor material approvals", done: false },
];

export function ProjectActionChecklist({ editable }: { editable: boolean }) {
  const [tasks, setTasks] = useState<ChecklistTask[]>(initialTasks);
  const [ready, setReady] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [syncMessage, setSyncMessage] = useState("Loading saved checklist…");

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      try {
        const shared = await loadWorkspaceData<ChecklistTask[]>("overview-tasks");
        if (cancelled) return;
        if (Array.isArray(shared)) {
          setTasks(shared);
          setSyncMessage("Shared project checklist loaded.");
        } else {
          try {
            const local = window.localStorage.getItem(STORAGE_KEY);
            if (local) setTasks(JSON.parse(local) as ChecklistTask[]);
          } catch { /* Keep the starter tasks if the browser copy cannot be read. */ }
          setSyncMessage("Checklist ready. Changes will be shared when saved.");
        }
        setCloudReady(true);
      } catch {
        if (cancelled) return;
        try {
          const local = window.localStorage.getItem(STORAGE_KEY);
          if (local) setTasks(JSON.parse(local) as ChecklistTask[]);
        } catch { /* Keep the starter tasks if the browser copy cannot be read. */ }
        setSyncMessage("Cloud storage is unavailable. Checklist changes stay in this browser.");
        setCloudReady(false);
      }
      if (!cancelled) setReady(true);
    }
    void initialize();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready || !editable) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch { /* Keep the checklist usable in memory. */ }
    if (!cloudReady) return;
    const timeout = window.setTimeout(() => {
      void saveWorkspaceData("overview-tasks", tasks)
        .then(() => setSyncMessage("Checklist saved to your private workspace."))
        .catch(() => {
          setCloudReady(false);
          setSyncMessage("Cloud storage is unavailable. Checklist changes stay in this browser.");
        });
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [tasks, ready, editable, cloudReady]);

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTask.trim();
    if (!title) return;
    setTasks((current) => [...current, { id: globalThis.crypto.randomUUID(), title, done: false }]);
    setNewTask("");
  }

  return (
    <div>
      <ul className="divide-y divide-[var(--line)] rounded-lg border border-[var(--line)] bg-[var(--surface)]">
        {tasks.map((task) => (
          <li key={task.id} className="flex min-h-16 items-center gap-3 px-4 py-3 sm:px-5">
            <input
              type="checkbox"
              checked={task.done}
              disabled={!ready || !editable}
              onChange={() => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, done: !item.done } : item))}
              aria-label={`${task.done ? "Reopen" : "Complete"}: ${task.title}`}
              className="h-5 w-5 shrink-0 accent-[var(--accent)]"
            />
            <span className={`min-w-0 flex-1 text-sm leading-6 ${task.done ? "text-[var(--muted)] line-through" : "text-[var(--foreground)]"}`}>{task.title}</span>
            {editable && <button type="button" disabled={!ready} onClick={() => setTasks((current) => current.filter((item) => item.id !== task.id))} className="min-h-10 shrink-0 px-2 text-xs font-semibold text-[var(--muted)] underline underline-offset-4 disabled:opacity-50" aria-label={`Remove task: ${task.title}`}>Remove</button>}
          </li>
        ))}
        {tasks.length === 0 && <li className="px-4 py-5 text-sm text-[var(--muted)]">No tasks yet. Add one below.</li>}
      </ul>
      {editable && <form onSubmit={addTask} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="overview-new-task" className="sr-only">New checklist task</label>
        <input id="overview-new-task" value={newTask} onChange={(event) => setNewTask(event.target.value)} disabled={!ready} placeholder="Add a task" className="h-11 min-w-0 flex-1 rounded-md border border-[var(--line-strong)] bg-white px-3 text-base outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 disabled:opacity-60" />
        <button type="submit" disabled={!ready || !newTask.trim()} className="min-h-11 rounded-md bg-[var(--foreground)] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Add task</button>
      </form>}
      <p role="status" className="mt-3 text-xs leading-5 text-[var(--muted)]">{editable ? syncMessage : "Read-only project view. Checklist editing is reserved for Alphaville project staff."}</p>
    </div>
  );
}

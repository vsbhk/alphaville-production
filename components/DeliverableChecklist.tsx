"use client";

import { useEffect, useState } from "react";
import { loadWorkspaceData, saveWorkspaceData } from "@/lib/workspace-sync";

export type Deliverable = {
  title: string;
  detail: string;
  timing: string;
};

const STORAGE_KEY = "hkdw-2027-deliverables-delivered-v1";

export function DeliverableChecklist({
  items,
  group,
  editable = true,
}: {
  items: Deliverable[];
  group: string;
  editable?: boolean;
}) {
  const [delivered, setDelivered] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);
  const [syncMessage, setSyncMessage] = useState("Loading shared delivery status…");

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      try {
        const shared = await loadWorkspaceData<Record<string, boolean>>("deliverables");
        const local = window.localStorage.getItem(STORAGE_KEY);
        if (cancelled) return;
        if (shared) setDelivered(shared);
        else if (local) setDelivered(JSON.parse(local) as Record<string, boolean>);
        setSyncMessage(shared ? "Shared delivery status loaded." : "No shared delivery status found yet.");
      } catch {
        if (!cancelled) {
          try {
            const saved = window.localStorage.getItem(STORAGE_KEY);
            if (saved) setDelivered(JSON.parse(saved) as Record<string, boolean>);
          } catch { /* Keep the checklist available in this page session. */ }
          setSyncMessage("Shared Google Workspace storage is not configured. Status changes stay in this browser.");
        }
      }
      if (!cancelled) setReady(true);
    }
    void initialize();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready || !editable) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(delivered)); } catch { /* This page still reflects current edits. */ }
    const timer = window.setTimeout(() => {
      void saveWorkspaceData("deliverables", delivered)
        .then(() => setSyncMessage("Delivery status saved to shared project storage."))
        .catch(() => setSyncMessage("Shared Google Workspace storage is not configured. Status changes stay in this browser."));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [delivered, editable, ready]);

  function toggle(id: string) {
    setDelivered((current) => {
      const next = { ...current, [id]: !current[id] };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // The current page still reflects the updated state if storage is unavailable.
      }
      return next;
    });
  }

  return (
    <div>
    <p role="status" className="mb-3 rounded-md bg-amber-50 p-3 text-xs leading-5 text-amber-950">{syncMessage}</p>
    <div className="divide-y divide-[var(--line)] rounded-lg border border-[var(--line)] bg-[var(--surface)]">
      {items.map((item, index) => {
        const id = `${group}-${index}`;
        const isDelivered = Boolean(delivered[id]);
        return (
          <article key={id} className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_220px] sm:gap-8 sm:p-6">
            <div>
              <h3 className="text-base font-semibold tracking-[-0.02em]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.detail}</p>
            </div>
            <div className="space-y-4 sm:border-l sm:border-[var(--line)] sm:pl-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Contract timing</p>
                <p className="mt-2 text-sm font-medium leading-6">{item.timing}</p>
              </div>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={isDelivered}
                  disabled={!ready || !editable}
                  onChange={() => toggle(id)}
                  className="h-5 w-5 accent-[var(--accent)]"
                  aria-label={`${isDelivered ? "Mark not delivered" : "Mark delivered"}: ${item.title}`}
                />
                {isDelivered ? "Marked delivered" : editable ? "Mark delivered" : "Not marked delivered"}
              </label>
            </div>
          </article>
        );
      })}
    </div>
    </div>
  );
}

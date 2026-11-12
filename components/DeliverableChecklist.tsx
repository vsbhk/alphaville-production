"use client";

import { useEffect, useState } from "react";

export type Deliverable = {
  title: string;
  detail: string;
  timing: string;
};

const STORAGE_KEY = "hkdw-2027-deliverables-delivered-v1";

export function DeliverableChecklist({
  items,
  group,
}: {
  items: Deliverable[];
  group: string;
}) {
  const [delivered, setDelivered] = useState<Record<string, boolean>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setDelivered(JSON.parse(saved) as Record<string, boolean>);
    } catch {
      // Keep the checklist usable for this page session if browser storage is unavailable.
    }
    setReady(true);
  }, []);

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
                  disabled={!ready}
                  onChange={() => toggle(id)}
                  className="h-5 w-5 accent-[var(--accent)]"
                  aria-label={`${isDelivered ? "Clear local preview status" : "Record as delivered in this browser preview"}: ${item.title}`}
                />
                {isDelivered ? "Marked delivered · this browser only" : "Record delivered · this browser only"}
              </label>
            </div>
          </article>
        );
      })}
    </div>
  );
}

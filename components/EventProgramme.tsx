"use client";

import { useEffect, useRef, useState } from "react";
import { loadWorkspaceData, saveWorkspaceData } from "@/lib/workspace-sync";

export type CalendarRunOfShowItem = { time?: string; title: string; detail?: string };
export type CalendarAgendaItem = { title: string; time?: string; location?: string; runOfShow?: CalendarRunOfShowItem[] };
export type CalendarDay = { event: string; date: string; activities: CalendarAgendaItem[] };

const STORAGE_KEY = "hkdw-2027-event-coverage-v1";
const suppliers = ["ICARUS Sports", "Kevin Rio", "Takumi Images", "Graham Uden"];

function dayKey(day: CalendarDay) {
  return `${day.event}|${day.date}`;
}

export function EventProgramme({ days, editable = false }: { days: CalendarDay[]; editable?: boolean }) {
  const [view, setView] = useState<"vertical" | "panels">("vertical");
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});
  const [ready, setReady] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [syncMessage, setSyncMessage] = useState("Loading supplier assignments…");
  const panelsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      try {
        const shared = await loadWorkspaceData<Record<string, string[]>>("event-coverage");
        if (cancelled) return;
        if (shared) setAssignments(shared);
        else {
          try {
            const local = window.localStorage.getItem(STORAGE_KEY);
            if (local) setAssignments(JSON.parse(local) as Record<string, string[]>);
          } catch { /* Use the unassigned event list if the browser copy cannot be read. */ }
        }
        setCloudReady(true);
        setSyncMessage(shared ? "Supplier assignments loaded." : "Assign a supplier to each event that needs coverage.");
      } catch {
        if (cancelled) return;
        try {
          const local = window.localStorage.getItem(STORAGE_KEY);
          if (local) setAssignments(JSON.parse(local) as Record<string, string[]>);
        } catch { /* Keep the events available without saved assignments. */ }
        setSyncMessage("Cloud storage is unavailable. Supplier assignments stay in this browser.");
      }
      if (!cancelled) setReady(true);
    }
    void initialize();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready || !editable) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments)); } catch { /* Keep the current assignments in memory. */ }
    if (!cloudReady) return;
    const timeout = window.setTimeout(() => {
      void saveWorkspaceData("event-coverage", assignments)
        .then(() => setSyncMessage("Supplier assignments saved to your private workspace."))
        .catch(() => {
          setCloudReady(false);
          setSyncMessage("Cloud storage is unavailable. Supplier assignments stay in this browser.");
        });
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [assignments, ready, editable, cloudReady]);

  function addSupplier(eventId: string, supplier: string) {
    if (!supplier) return;
    setAssignments((current) => ({
      ...current,
      [eventId]: current[eventId]?.includes(supplier) ? current[eventId] : [...(current[eventId] ?? []), supplier],
    }));
  }

  function removeSupplier(eventId: string, supplier: string) {
    setAssignments((current) => ({ ...current, [eventId]: (current[eventId] ?? []).filter((name) => name !== supplier) }));
  }

  function movePanels(direction: -1 | 1) {
    const panels = panelsRef.current;
    if (!panels) return;
    panels.scrollLeft += direction * Math.max(300, Math.round(panels.clientWidth * 0.8));
  }

  return (
    <section aria-label="Championship programme">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Programme view</p>
        <div className="inline-flex rounded-md border border-[var(--line)] bg-[var(--surface)] p-1" role="group" aria-label="Programme layout">
          <button type="button" aria-pressed={view === "vertical"} onClick={() => setView("vertical")} className={`min-h-9 rounded px-3 text-sm font-semibold ${view === "vertical" ? "bg-[var(--foreground)] text-white" : "text-[var(--muted)]"}`}>Day by day</button>
          <button type="button" aria-pressed={view === "panels"} onClick={() => setView("panels")} className={`min-h-9 rounded px-3 text-sm font-semibold ${view === "panels" ? "bg-[var(--foreground)] text-white" : "text-[var(--muted)]"}`}>Sideways panels</button>
        </div>
      </div>

      {view === "vertical" ? (
        <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]">
          <div className="grid grid-cols-[minmax(0,1fr)] border-b border-[var(--line)] bg-[var(--background)] px-4 py-3 sm:px-5">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Schedule by day</p>
          </div>
          <ol className="divide-y divide-[var(--line)]">
            {days.map((day) => (
              <li key={`${day.event}-${day.date}`}>
                <details className="group">
                  <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)] [&::-webkit-details-marker]:hidden sm:px-5">
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[var(--foreground)]">{day.date}</span>
                      <span className="mt-1 block text-xs font-medium text-[var(--muted)]">{day.event}</span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3 text-xs font-medium text-[var(--muted)]">
                      <span>{day.activities.length} {day.activities.length === 1 ? "schedule item" : "schedule items"}</span>
                      <span aria-hidden="true" className="text-base text-[var(--foreground)] group-open:hidden">+</span>
                      <span aria-hidden="true" className="hidden text-base text-[var(--foreground)] group-open:inline">−</span>
                    </span>
                  </summary>
                  <div className="border-t border-[var(--line)] px-4 py-4 sm:pl-[calc(180px+1.25rem)] sm:pr-5 sm:py-5">
                <AgendaItems dayKey={dayKey(day)} activities={day.activities} assignments={assignments} editable={editable} ready={ready} onAddSupplier={addSupplier} onRemoveSupplier={removeSupplier} />
                  </div>
                </details>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div>
          <div className="mb-2 flex justify-end gap-2">
            <button type="button" onClick={() => movePanels(-1)} aria-label="Scroll to earlier programme panels" className="min-h-10 min-w-10 rounded-md border border-[var(--line-strong)] text-lg font-semibold text-[var(--foreground)]">‹</button>
            <button type="button" onClick={() => movePanels(1)} aria-label="Scroll to later programme panels" className="min-h-10 min-w-10 rounded-md border border-[var(--line-strong)] text-lg font-semibold text-[var(--foreground)]">›</button>
          </div>
          <div ref={panelsRef} className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3" aria-label="Programme panels">
            {days.map((day) => (
              <article key={`${day.event}-${day.date}`} className="w-[min(86vw,22rem)] shrink-0 snap-start rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 sm:w-[22rem] sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">{day.event}</p>
                <h3 className="mt-2 border-b border-[var(--line)] pb-3 text-lg font-semibold leading-6 text-[var(--foreground)]">{day.date}</h3>
                <AgendaItems dayKey={dayKey(day)} activities={day.activities} assignments={assignments} editable={editable} ready={ready} onAddSupplier={addSupplier} onRemoveSupplier={removeSupplier} compact />
              </article>
            ))}
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">Scroll sideways or use the arrows to move between dates.</p>
        </div>
      )}
      <p role="status" className="mt-3 text-xs leading-5 text-[var(--muted)]">{editable ? syncMessage : "Supplier assignments are read-only."}</p>
    </section>
  );
}

function AgendaItems({
  activities,
  dayKey: day,
  assignments,
  editable,
  ready,
  onAddSupplier,
  onRemoveSupplier,
  compact = false,
}: {
  activities: CalendarAgendaItem[];
  dayKey: string;
  assignments: Record<string, string[]>;
  editable: boolean;
  ready: boolean;
  onAddSupplier: (eventId: string, supplier: string) => void;
  onRemoveSupplier: (eventId: string, supplier: string) => void;
  compact?: boolean;
}) {
  return (
    <ul className={`space-y-3 ${compact ? "mt-4" : ""}`}>
      {activities.map((activity, index) => (
        <li key={`${activity.title}-${index}`} className={`${compact ? "border-l-2 border-[var(--line-strong)] pl-3" : "grid gap-1 border-l-2 border-[var(--line-strong)] pl-3 sm:grid-cols-[115px_minmax(0,1fr)] sm:gap-4"}`}>
          <p className="text-sm font-semibold tabular-nums text-[var(--foreground)]">{activity.time ?? "Time not listed"}</p>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-6 text-[var(--foreground)]">{activity.title}</p>
            {activity.location && <p className="text-sm leading-5 text-[var(--muted)]">{activity.location}</p>}
            {activity.runOfShow && <details className="mt-2 rounded-md border border-[var(--line)] bg-[var(--surface)] p-3">
              <summary className="min-h-8 cursor-pointer text-xs font-semibold text-[var(--accent)]">View detailed event rundown</summary>
              <ol className="mt-3 space-y-3">
                {activity.runOfShow.map((item, rundownIndex) => <li key={`${item.time ?? "step"}-${rundownIndex}`} className="grid gap-1 border-l-2 border-[var(--line-strong)] pl-3 sm:grid-cols-[110px_minmax(0,1fr)] sm:gap-3">
                  <span className="text-xs font-semibold tabular-nums text-[var(--foreground)]">{item.time ?? "After previous item"}</span>
                  <span className="text-xs leading-5 text-[var(--foreground)]"><strong>{item.title}</strong>{item.detail && <span className="block text-[var(--muted)]">{item.detail}</span>}</span>
                </li>)}
              </ol>
            </details>}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-[var(--muted)]">Coverage:</span>
              {(assignments[`${day}|${activity.title}|${index}`] ?? []).map((supplier) => (
                <span key={supplier} className="inline-flex min-h-8 items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--background)] px-2.5 text-xs font-medium text-[var(--foreground)]">
                  {supplier}
                  {editable && <button type="button" onClick={() => onRemoveSupplier(`${day}|${activity.title}|${index}`, supplier)} aria-label={`Remove ${supplier} from ${activity.title}`} className="font-semibold text-[var(--muted)]">×</button>}
                </span>
              ))}
              {editable ? <label className="sr-only" htmlFor={`supplier-${encodeURIComponent(day)}-${index}`}>Add supplier to {activity.title}</label> : null}
              {editable && <select id={`supplier-${encodeURIComponent(day)}-${index}`} defaultValue="" onChange={(event) => { onAddSupplier(`${day}|${activity.title}|${index}`, event.target.value); event.currentTarget.value = ""; }} disabled={!ready} className="min-h-9 max-w-full rounded-md border border-[var(--line-strong)] bg-white px-2 text-xs font-semibold text-[var(--foreground)] disabled:opacity-50">
                <option value="">Add supplier</option>
                {suppliers.map((supplier) => <option key={supplier} value={supplier}>{supplier}</option>)}
              </select>}
              {!editable && !(assignments[`${day}|${activity.title}|${index}`] ?? []).length && <span className="text-xs text-[var(--muted)]">Not assigned</span>}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

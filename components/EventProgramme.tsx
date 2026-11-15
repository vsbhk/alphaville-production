"use client";

import { useRef, useState } from "react";

export type CalendarAgendaItem = { title: string; time?: string; location?: string };
export type CalendarDay = { event: string; date: string; activities: CalendarAgendaItem[] };

export function EventProgramme({ days }: { days: CalendarDay[] }) {
  const [view, setView] = useState<"vertical" | "panels">("vertical");
  const panelsRef = useRef<HTMLDivElement>(null);

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
                    <AgendaItems activities={day.activities} />
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
                <AgendaItems activities={day.activities} compact />
              </article>
            ))}
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">Scroll sideways or use the arrows to move between dates.</p>
        </div>
      )}
    </section>
  );
}

function AgendaItems({ activities, compact = false }: { activities: CalendarAgendaItem[]; compact?: boolean }) {
  return (
    <ul className={`space-y-3 ${compact ? "mt-4" : ""}`}>
      {activities.map((activity, index) => (
        <li key={`${activity.title}-${index}`} className={`${compact ? "border-l-2 border-[var(--line-strong)] pl-3" : "grid gap-1 border-l-2 border-[var(--line-strong)] pl-3 sm:grid-cols-[115px_minmax(0,1fr)] sm:gap-4"}`}>
          <p className="text-sm font-semibold tabular-nums text-[var(--foreground)]">{activity.time ?? "Time not listed"}</p>
          <div>
            <p className="text-sm font-medium leading-6 text-[var(--foreground)]">{activity.title}</p>
            {activity.location && <p className="text-sm leading-5 text-[var(--muted)]">{activity.location}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}

"use client";

import { useEffect, useState } from "react";
import { loadWorkspaceData, saveWorkspaceData } from "@/lib/workspace-sync";

type Activity = {
  id: string;
  task: string;
  start: string;
  end: string;
  lead: string;
  meetingPoint: string;
  language: string;
  languageNotes: string;
  translationNeeded: string;
  translationTo: string;
  sourceNote?: string;
};

type ViewMode = "day" | "week" | "month";

const STORAGE_KEY = "hkdw-2027-production-calendar-v1";
const FIRST_DATE = "2026-11-17";
const CONTRACT_DEADLINE = "2026-12-29";

const initialActivities: Record<string, Activity[]> = {
  "2026-11-22": [
    {
      id: "xpeng-interview",
      task: "XPENG interview - Jerry Tam",
      start: "",
      end: "",
      lead: "",
      meetingPoint: "",
      language: "",
      languageNotes: "",
      translationNeeded: "",
      translationTo: "",
      sourceNote: "Source notes a preference to film beside the vehicle models, weather permitting. This is not an agreed meeting point.",
    },
  ],
};

type Field = "task" | "start" | "end" | "lead" | "meetingPoint" | "language" | "languageNotes" | "translationNeeded" | "translationTo";

function dateFromISO(value: string) {
  return new Date(`${value}T12:00:00Z`);
}

function toISO(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

function addDays(value: string, amount: number) {
  const date = dateFromISO(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return toISO(date);
}

function formatDay(value: string, options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-GB", { ...options, timeZone: "UTC" }).format(dateFromISO(value));
}

function mondayOf(value: string) {
  const date = dateFromISO(value);
  const offset = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - offset);
  return toISO(date);
}

function getInitialMonth(value: string) {
  const date = dateFromISO(value);
  date.setUTCDate(1);
  return date;
}

function calendarDays(start: string, end: string) {
  const days: string[] = [];
  for (let day = start; day <= end; day = addDays(day, 1)) days.push(day);
  return days;
}

export function DayPlanner({ editable = true }: { editable?: boolean }) {
  const [activities, setActivities] = useState<Record<string, Activity[]>>(initialActivities);
  const [view, setView] = useState<ViewMode>("week");
  const [selectedDate, setSelectedDate] = useState(FIRST_DATE);
  const [monthCursor, setMonthCursor] = useState(getInitialMonth(FIRST_DATE));
  const [calendarEnd, setCalendarEnd] = useState(CONTRACT_DEADLINE);
  const [calendarStart, setCalendarStart] = useState(FIRST_DATE);
  const [ready, setReady] = useState(false);
  const [syncMessage, setSyncMessage] = useState("Checking shared project storage…");

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      try {
        const shared = await loadWorkspaceData<{ activities?: Record<string, Activity[]>; calendarEnd?: string; calendarStart?: string }>("production-calendar");
        const local = window.localStorage.getItem(STORAGE_KEY);
        const parsed = (shared ?? (local ? JSON.parse(local) : null)) as { activities?: Record<string, Activity[]>; calendarEnd?: string; calendarStart?: string } | null;
        if (cancelled) return;
        if (parsed) {
        if (parsed.activities) {
          const migrated = Object.fromEntries(Object.entries(parsed.activities).map(([date, entries]) => [
            date,
            entries.map((activity) => ({
              ...activity,
              language: activity.language ?? "",
              languageNotes: activity.languageNotes ?? "",
              translationNeeded: activity.translationNeeded ?? "",
              translationTo: activity.translationTo ?? "",
            })),
          ]));
          setActivities(migrated);
        }
        if (parsed.calendarEnd && parsed.calendarEnd >= CONTRACT_DEADLINE) setCalendarEnd(parsed.calendarEnd);
        if (parsed.calendarStart && parsed.calendarStart <= FIRST_DATE) setCalendarStart(parsed.calendarStart);
        }
        setSyncMessage(shared ? "Shared project plan loaded." : "No shared plan found yet; local browser copy loaded if available.");
      } catch {
        if (!cancelled) setSyncMessage("Shared storage unavailable. Changes may stay in this browser only.");
      }
      if (!cancelled) setReady(true);
    }
    void initialize();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!ready || !editable) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ activities, calendarEnd, calendarStart }));
    } catch {
      // The current page still reflects edits if browser storage is unavailable.
    }
    const timeout = window.setTimeout(() => {
      void saveWorkspaceData("production-calendar", { activities, calendarEnd, calendarStart })
        .then(() => setSyncMessage("Changes saved to shared project storage."))
        .catch(() => setSyncMessage("Could not save to shared storage. Changes remain only in this browser."));
    }, 600);
    return () => window.clearTimeout(timeout);
  }, [activities, calendarEnd, calendarStart, ready, editable]);

  function update(day: string, id: string, field: Field, value: string) {
    setActivities((current) => ({
      ...current,
      [day]: (current[day] ?? []).map((activity) => activity.id === id ? { ...activity, [field]: value } : activity),
    }));
  }

  function addActivity(day: string) {
    const newActivity: Activity = {
      id: `${day}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      task: "",
      start: "",
      end: "",
      lead: "",
      meetingPoint: "",
      language: "",
      languageNotes: "",
      translationNeeded: "",
      translationTo: "",
    };
    setActivities((current) => ({ ...current, [day]: [...(current[day] ?? []), newActivity] }));
  }

  function removeActivity(day: string, id: string) {
    setActivities((current) => ({ ...current, [day]: (current[day] ?? []).filter((activity) => activity.id !== id) }));
  }

  const allDates = calendarDays(calendarStart, calendarEnd);
  const weekStart = mondayOf(selectedDate);
  const weekDates = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
    .filter((date) => date >= calendarStart && date <= calendarEnd);
  const monthStart = toISO(monthCursor);
  const monthEndDate = new Date(Date.UTC(monthCursor.getUTCFullYear(), monthCursor.getUTCMonth() + 1, 0, 12));
  const monthEnd = toISO(monthEndDate);
  const gridStart = mondayOf(monthStart);
  const gridEnd = addDays(mondayOf(monthEnd), 6);
  const monthDates = calendarDays(gridStart, gridEnd);
  const visibleDates = view === "day" ? [selectedDate] : view === "week" ? weekDates : allDates;

  function moveSelection(direction: -1 | 1) {
    if (view === "month") {
      const next = new Date(monthCursor);
      next.setUTCMonth(next.getUTCMonth() + direction);
      setMonthCursor(next);
      return;
    }
    const next = addDays(selectedDate, direction * (view === "week" ? 7 : 1));
    if (next >= calendarStart && next <= calendarEnd) {
      setSelectedDate(next);
      setMonthCursor(getInitialMonth(next));
    }
  }

  function renderDay(day: string, open = false) {
    const dayActivities = activities[day] ?? [];
    const hasInvalidTime = (activity: Activity) =>
      (activity.start && (activity.start < "09:00" || activity.start >= "21:00")) ||
      (activity.end && (activity.end <= "09:00" || activity.end > "21:00")) ||
      (activity.start && activity.end && activity.start >= activity.end);
    const completedCount = dayActivities.filter((activity) => {
      const validStart = activity.start >= "09:00" && activity.start < "21:00";
      const validEnd = activity.end > activity.start && activity.end <= "21:00";
      return Boolean(activity.task && validStart && validEnd && activity.lead && activity.meetingPoint);
    }).length;
    const hasOutOfWindowTime = dayActivities.some(hasInvalidTime);
    const status = dayActivities.length === 0
      ? "No activities recorded"
      : hasOutOfWindowTime
        ? `${dayActivities.length} activity · check time window`
        : completedCount === dayActivities.length
          ? `${dayActivities.length} ${dayActivities.length === 1 ? "activity" : "activities"} ready`
          : `${dayActivities.length} ${dayActivities.length === 1 ? "activity" : "activities"} · details incomplete`;

    return (
      <details key={day} open={open} className="group rounded-lg border border-[var(--line)] bg-[var(--surface)]">
        <summary className="flex min-h-16 cursor-pointer list-none flex-wrap items-center justify-between gap-2 p-4 [&::-webkit-details-marker]:hidden sm:px-5">
          <span className="font-semibold">{formatDay(day)} </span>
          <span className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--background)] px-3 py-1 text-xs font-medium text-[var(--foreground)]">09:00–21:00 HKT</span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${dayActivities.length > 0 && completedCount === dayActivities.length ? "bg-emerald-50 text-emerald-900" : "bg-[var(--background)] text-[var(--muted)]"}`}>{status}</span>
          </span>
        </summary>

        <div className="space-y-4 border-t border-[var(--line)] p-4 sm:p-5">
          <p className="rounded-md bg-[var(--background)] p-3 text-sm leading-6">Planning window: <strong>09:00–21:00 HKT</strong>. Use this for filming and post-production activity planning.</p>
          {dayActivities.map((activity, index) => (
            <fieldset key={activity.id} disabled={!editable} className="rounded-lg border border-[var(--line)] p-4 disabled:opacity-75">
              <legend className="px-2 text-sm font-semibold">Activity {index + 1}</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor={`${activity.id}-task`} className="mb-1.5 block text-sm font-medium">Task or activity</label>
                  <input id={`${activity.id}-task`} value={activity.task} onChange={(event) => update(day, activity.id, "task", event.target.value)} placeholder="For example, race coverage, interview, editing or delivery" className="h-11 w-full rounded-md border border-[var(--line-strong)] bg-white px-3 text-base outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10" />
                </div>
                <div>
                  <label htmlFor={`${activity.id}-start`} className="mb-1.5 block text-sm font-medium">Start time (HKT)</label>
                  <input id={`${activity.id}-start`} type="time" min="09:00" max="20:59" value={activity.start} onChange={(event) => update(day, activity.id, "start", event.target.value)} className="h-11 w-full rounded-md border border-[var(--line-strong)] bg-white px-3 text-base outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10" />
                </div>
                <div>
                  <label htmlFor={`${activity.id}-end`} className="mb-1.5 block text-sm font-medium">End time (HKT)</label>
                  <input id={`${activity.id}-end`} type="time" min="09:01" max="21:00" value={activity.end} onChange={(event) => update(day, activity.id, "end", event.target.value)} className="h-11 w-full rounded-md border border-[var(--line-strong)] bg-white px-3 text-base outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10" />
                </div>
                <div>
                  <label htmlFor={`${activity.id}-lead`} className="mb-1.5 block text-sm font-medium">Responsible person or team</label>
                  <input id={`${activity.id}-lead`} value={activity.lead} onChange={(event) => update(day, activity.id, "lead", event.target.value)} placeholder="Name or team" className="h-11 w-full rounded-md border border-[var(--line-strong)] bg-white px-3 text-base outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10" />
                </div>
                <div>
                  <label htmlFor={`${activity.id}-meeting`} className="mb-1.5 block text-sm font-medium">Agreed location / meeting point</label>
                  <input id={`${activity.id}-meeting`} value={activity.meetingPoint} onChange={(event) => update(day, activity.id, "meetingPoint", event.target.value)} placeholder="Enter the agreed point" className="h-11 w-full rounded-md border border-[var(--line-strong)] bg-white px-3 text-base outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10" />
                </div>
                <div>
                  <label htmlFor={`${activity.id}-language`} className="mb-1.5 block text-sm font-medium">Interview / working language</label>
                  <select id={`${activity.id}-language`} value={activity.language} onChange={(event) => update(day, activity.id, "language", event.target.value)} className="h-11 w-full rounded-md border border-[var(--line-strong)] bg-white px-3 text-base outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10">
                    <option value="">Not confirmed</option>
                    <option value="English">English</option>
                    <option value="Cantonese">Cantonese</option>
                    <option value="Mandarin">Mandarin</option>
                    <option value="English and Cantonese">English and Cantonese</option>
                    <option value="English and Mandarin">English and Mandarin</option>
                    <option value="Other or multiple languages">Other or multiple languages</option>
                  </select>
                </div>
                {activity.language === "Other or multiple languages" && (
                  <div>
                    <label htmlFor={`${activity.id}-language-notes`} className="mb-1.5 block text-sm font-medium">Specify language(s)</label>
                    <input id={`${activity.id}-language-notes`} value={activity.languageNotes} onChange={(event) => update(day, activity.id, "languageNotes", event.target.value)} placeholder="Enter language(s)" className="h-11 w-full rounded-md border border-[var(--line-strong)] bg-white px-3 text-base outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10" />
                  </div>
                )}
                <div>
                  <label htmlFor={`${activity.id}-translation`} className="mb-1.5 block text-sm font-medium">Translation needed?</label>
                  <select id={`${activity.id}-translation`} value={activity.translationNeeded} onChange={(event) => update(day, activity.id, "translationNeeded", event.target.value)} className="h-11 w-full rounded-md border border-[var(--line-strong)] bg-white px-3 text-base outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10">
                    <option value="">To be confirmed</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                {activity.translationNeeded === "yes" && (
                  <div>
                    <label htmlFor={`${activity.id}-translation-to`} className="mb-1.5 block text-sm font-medium">Translate into</label>
                    <input id={`${activity.id}-translation-to`} value={activity.translationTo} onChange={(event) => update(day, activity.id, "translationTo", event.target.value)} placeholder="Target language(s)" className="h-11 w-full rounded-md border border-[var(--line-strong)] bg-white px-3 text-base outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10" />
                  </div>
                )}
              </div>
              {hasInvalidTime(activity) && <p role="alert" className="mt-3 text-sm font-medium text-red-800">Activity times must fit within 09:00–21:00 HKT and end after they start.</p>}
              {activity.sourceNote && <p className="mt-3 rounded-md bg-amber-50 p-3 text-sm leading-6 text-amber-950">{activity.sourceNote}</p>}
              <button type="button" onClick={() => removeActivity(day, activity.id)} className="mt-3 min-h-11 px-1 text-sm font-medium text-[var(--muted)] underline underline-offset-4 hover:text-[var(--foreground)]">Remove activity</button>
            </fieldset>
          ))}

          {dayActivities.length === 0 && <p className="text-sm leading-6 text-[var(--muted)]">No task or location has been supplied for this day.</p>}
          {editable && <button type="button" onClick={() => addActivity(day)} className="min-h-11 rounded-md border border-[var(--line-strong)] px-4 text-sm font-semibold hover:border-[var(--accent)]">Add activity</button>}
        </div>
      </details>
    );
  }

  return (
    <section className="border-t border-[var(--line)] py-8" aria-labelledby="day-planner-title">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Production calendar · HKT</p>
        <h2 id="day-planner-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Production and delivery plan</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">Plan filming from 17 to 29 November, then keep recording editing, review, distribution and delivery work until all deliverables are complete.</p>
      </div>

      <div className="mb-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Calendar period</p>
            <p className="mt-1 text-sm font-semibold">{formatDay(calendarStart, { day: "numeric", month: "long", year: "numeric" })} to {formatDay(calendarEnd, { day: "numeric", month: "long", year: "numeric" })}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--muted)]">Includes the contract’s one-month unused-footage handover deadline. Extend the calendar if production or delivery work continues.</p>
          </div>
          {editable && <>
            <button type="button" onClick={() => setCalendarEnd((end) => addDays(end, 7))} className="min-h-11 rounded-md border border-[var(--line-strong)] px-4 text-sm font-semibold hover:border-[var(--accent)]">Extend 7 days</button>
            <button type="button" onClick={() => { const start = addDays(calendarStart, -7); setCalendarStart(start); setSelectedDate(start); setMonthCursor(getInitialMonth(start)); }} className="min-h-11 rounded-md border border-[var(--line-strong)] px-4 text-sm font-semibold hover:border-[var(--accent)]">Add 7 earlier days</button>
          </>}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-[var(--line)] bg-[var(--surface)] p-1" role="group" aria-label="Calendar view">
          {(["day", "week", "month"] as const).map((mode) => (
            <button key={mode} type="button" aria-pressed={view === mode} onClick={() => setView(mode)} className={`min-h-10 rounded-md px-4 text-sm font-semibold capitalize ${view === mode ? "bg-[var(--foreground)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}>
              {mode === "day" ? "Day by day" : mode}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => moveSelection(-1)} aria-label="Previous period" className="min-h-11 min-w-11 rounded-md border border-[var(--line-strong)] text-lg font-semibold hover:border-[var(--accent)]">‹</button>
          <p className="min-w-44 text-center text-sm font-semibold">
            {view === "month" ? new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(monthCursor) : view === "week" ? `${formatDay(weekDates[0] ?? selectedDate, { day: "numeric", month: "short" })} to ${formatDay(weekDates[weekDates.length - 1] ?? selectedDate, { day: "numeric", month: "short", year: "numeric" })}` : formatDay(selectedDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <button type="button" onClick={() => moveSelection(1)} aria-label="Next period" className="min-h-11 min-w-11 rounded-md border border-[var(--line-strong)] text-lg font-semibold hover:border-[var(--accent)]">›</button>
        </div>
      </div>

      {view === "month" ? (
        <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]">
          <div className="grid grid-cols-7 border-b border-[var(--line)] bg-[var(--background)]">
            {(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]).map((name) => <p key={name} className="p-2 text-center text-xs font-semibold text-[var(--muted)] sm:p-3">{name}</p>)}
          </div>
          <div className="grid grid-cols-7">
            {monthDates.map((day) => {
              const inMonth = dateFromISO(day).getUTCMonth() === monthCursor.getUTCMonth();
              const inRange = day >= calendarStart && day <= calendarEnd;
              const dayActivities = activities[day] ?? [];
              return (
                <button key={day} type="button" disabled={!inRange} onClick={() => { setSelectedDate(day); setView("day"); }} className={`min-h-20 border-b border-r border-[var(--line)] p-2 text-left sm:min-h-28 sm:p-3 ${inMonth ? "" : "bg-[var(--background)] text-[var(--muted)]"} ${inRange ? "hover:bg-amber-50" : "opacity-45"} ${day === selectedDate ? "ring-2 ring-inset ring-[var(--accent)]" : ""}`}>
                  <span className="text-sm font-semibold">{dateFromISO(day).getUTCDate()}</span>
                  {inRange && <span className="mt-2 block text-[10px] leading-4 text-[var(--muted)] sm:text-xs">{dayActivities.length ? `${dayActivities.length} ${dayActivities.length === 1 ? "activity" : "activities"}` : "No activities"}</span>}
                  {inRange && dayActivities.slice(0, 2).map((activity) => activity.task && <span key={activity.id} className="mt-1 hidden truncate rounded bg-amber-50 px-1.5 py-1 text-[10px] leading-4 sm:block">{activity.task}</span>)}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-3">{visibleDates.map((date) => renderDay(date, view === "day" || date === "2026-11-22"))}</div>
      )}

      <p role="status" className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-xs leading-5 text-amber-950">{editable ? syncMessage : "Read-only project view. Editing is reserved for Alphaville project staff."}</p>
    </section>
  );
}

import { ProjectNav } from "@/components/ProjectNav";
import { DayPlanner } from "@/components/DayPlanner";
import { EventProgramme, type CalendarDay } from "@/components/EventProgramme";
import { auth } from "@/auth";
import { AlphavilleHeader } from "@/components/AlphavilleBrand";

const eventCalendar: CalendarDay[] = [
  { event: "Asia Pacific Championship", date: "Tue 17–Wed 18 Nov", activities: [
    { title: "Registration, measurement and equipment inspection", time: "09:00–17:30", location: "Clearwater Bay Golf & Country Club Marina" },
    { title: "Crew weigh-in", time: "Until 18:00" },
  ] },
  { event: "Asia Pacific Championship", date: "Wed 18 Nov", activities: [
    { title: "Skippers’ briefing", time: "18:00–19:00", location: "RHKYC Kellett Island" },
    { title: "Opening ceremony", time: "19:00–21:30", location: "RHKYC poolside" },
  ] },
  { event: "Asia Pacific Championship", date: "Thu 19 Nov", activities: [
    { title: "Championship racing begins" },
    { title: "After-sailing drinks", time: "17:00–18:30", location: "Clearwater Bay Golf & Country Club" },
  ] },
  { event: "Asia Pacific Championship", date: "Fri 20 Nov", activities: [
    { title: "Championship racing" },
    { title: "After-sailing drinks", time: "17:00–18:30", location: "Clearwater Bay Golf & Country Club" },
  ] },
  { event: "Asia Pacific Championship", date: "Sat 21 Nov", activities: [
    { title: "Final races and prizegiving" },
    { title: "Prizegiving ceremony", time: "18:00–21:00", location: "Clearwater Bay Golf & Country Club" },
  ] },
  { event: "World Championship", date: "21–22 November", activities: [
    { title: "Registration, measurement and equipment inspection" },
  ] },
  { event: "World Championship", date: "22 November", activities: [
    { title: "Skippers’ briefing and opening ceremony" },
  ] },
  { event: "World Championship", date: "23–25 November", activities: [
    { title: "Championship racing" },
  ] },
  { event: "World Championship", date: "26 November", activities: [
    { title: "Lay day; racing only if needed" },
  ] },
  { event: "World Championship", date: "27–29 November", activities: [
    { title: "Championship racing, final races and prizegiving" },
  ] },
];

const actions = [
  {
    title: "Complete daily activity plans",
    detail: "The filming period and daily 09:00–21:00 HKT window are set. Add each day’s task, responsible person or team, activity time, and agreed meeting point.",
    state: "Task, team and place needed",
  },
  {
    title: "Confirm the XPENG interview slot",
    detail: "The source records 22 November for Jerry Tam’s interview. Exact time and meeting point still need confirmation. The requested vehicle display location is a preference, weather permitting.",
    state: "Time and place not confirmed",
  },
  {
    title: "Sponsor material approval",
    detail: "Keep a private note of each sponsor item and its approval status.",
    state: "Personal reference",
  },
];

export default async function ProjectOverviewPage() {
  const session = await auth();
  const canEdit = session?.user.role === "admin" || session?.user.role === "editor";
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <AlphavilleHeader label="HKDW 2027" />
      <ProjectNav current="overview" />

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="grid gap-6 border-b border-[var(--line)] pb-8 md:grid-cols-[minmax(0,1fr)_300px] md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Project overview · Design preview</p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-5xl">HKDW 2027</h1>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">Royal Hong Kong Yacht Club</p>
          </div>
          <aside className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950">
            <p className="text-xs font-semibold uppercase tracking-[0.12em]">Owner access</p>
            <p className="mt-2 text-sm font-semibold">Private to the Alphaville owner account</p>
            <p className="mt-2 text-xs leading-5">{canEdit ? "Your private project plan and records are ready to use." : "Sign in with the owner account to open this private workspace."}</p>
          </aside>
        </section>

        <section className="py-8" aria-labelledby="actions-title">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Task list · action points</p>
            <h2 id="actions-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Open items</h2>
          </div>
          <ul className="space-y-3">
            {actions.map((action) => (
              <li key={action.title} className="grid gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-start sm:gap-6">
                <div>
                  <h3 className="text-sm font-semibold">{action.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{action.detail}</p>
                </div>
                <p className="rounded-md bg-[var(--background)] px-3 py-2 text-sm font-medium">{action.state}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-[var(--line)] py-8" aria-labelledby="calendar-title">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Calendar</p>
              <h2 id="calendar-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Championship programme and interview slot</h2>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <a href="https://www.dragonworld2027.com/for-visitors" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--accent)] underline decoration-[var(--line-strong)] underline-offset-4">Live public calendar</a>
              <a href="https://www.dragonworld2027.com/for-competitors" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--accent)] underline decoration-[var(--line-strong)] underline-offset-4">Competitor information</a>
              <a href="https://www.racingrulesofsailing.org/documents/13241/event" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--accent)] underline decoration-[var(--line-strong)] underline-offset-4">APC Official Notice Board</a>
            </div>
          </div>
          <p className="mb-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">Published event dates and times are shown in Hong Kong time (HKT) as a reference for production planning, not as supplier bookings. Work bookings belong in the private production calendar below, visible only to approved project members; supplier accounts are read-only.</p>
          <div className="mb-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Filming period</p>
            <p className="mt-2 text-lg font-semibold">Tuesday 17 November – Sunday 29 November 2026</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Daily filming window: 09:00–21:00 HKT. Activity-specific times, responsible people or teams, and meeting points still need to be entered.</p>
          </div>
          <EventProgramme days={eventCalendar} />
          <p className="mt-3 text-xs leading-5 text-[var(--muted)]">Check the live calendar for changes. Racing documents and notices on the APC Official Notice Board prevail over this summary.</p>
          <article className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-5 text-amber-950">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">Interview slot · XPENG</h3>
              <span className="rounded-full border border-amber-400 px-3 py-1 text-xs font-semibold">Time and meeting point need confirmation</span>
            </div>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
              <div><dt className="font-medium">Date</dt><dd className="mt-1">22 November 2026</dd></div>
              <div><dt className="font-medium">Interviewee</dt><dd className="mt-1">Jerry Tam</dd></div>
              <div><dt className="font-medium">Location preference</dt><dd className="mt-1">Beside the vehicle models, weather permitting</dd></div>
            </dl>
            <p className="mt-4 border-t border-amber-300 pt-3 text-sm leading-6">Do not treat the location preference as an agreed meeting point. The exact time and agreed point are not recorded in the source.</p>
          </article>
        </section>

        <DayPlanner editable={canEdit} />

      </main>

      <footer className="border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center px-5 sm:px-8"><p className="text-xs text-[var(--muted)]">prod.alphaville.hk</p></div>
      </footer>
    </div>
  );
}

import { ProjectNav } from "@/components/ProjectNav";
import { DayPlanner } from "@/components/DayPlanner";
import { auth } from "@/auth";

const eventCalendar = [
  { event: "Asia Pacific Championship", date: "Tue 17–Wed 18 Nov", activity: "Registration, measurement and equipment inspection · 09:00–17:30 at Clearwater Bay Golf & Country Club Marina. Crew weigh-in runs until 18:00." },
  { event: "Asia Pacific Championship", date: "Wed 18 Nov", activity: "Skippers’ briefing · 18:00–19:00 at RHKYC Kellett Island. Opening ceremony · 19:00–21:30 at the RHKYC poolside." },
  { event: "Asia Pacific Championship", date: "Thu 19 Nov", activity: "Championship racing begins. After-sailing drinks · 17:00–18:30 at Clearwater Bay Golf & Country Club." },
  { event: "Asia Pacific Championship", date: "Fri 20 Nov", activity: "Championship racing. After-sailing drinks · 17:00–18:30 at Clearwater Bay Golf & Country Club." },
  { event: "Asia Pacific Championship", date: "Sat 21 Nov", activity: "Final races and prizegiving. Prizegiving ceremony · 18:00–21:00 at Clearwater Bay Golf & Country Club." },
  { event: "World Championship", date: "21–22 November", activity: "Registration, measurement and equipment inspection" },
  { event: "World Championship", date: "22 November", activity: "Skippers’ briefing and opening ceremony" },
  { event: "World Championship", date: "23–25 November", activity: "Championship racing" },
  { event: "World Championship", date: "26 November", activity: "Lay day; racing only if needed" },
  { event: "World Championship", date: "27–29 November", activity: "Championship racing, final races and prizegiving" },
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
      <header className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex min-h-[68px] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <a href="/" className="text-[17px] font-semibold tracking-[-0.04em]" aria-label="Alphaville workspace sign in">Alphaville<span className="ml-1 text-[var(--accent)]">.</span></a>
          <p className="text-right text-xs font-medium text-[var(--muted)]">Private production workspace</p>
        </div>
      </header>
      <ProjectNav current="overview" />

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <section className="grid gap-6 border-b border-[var(--line)] pb-8 md:grid-cols-[minmax(0,1fr)_300px] md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Project overview · Design preview</p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-5xl">HKDW 2027</h1>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">Royal Hong Kong Yacht Club</p>
          </div>
          <aside className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-950">
            <p className="text-xs font-semibold uppercase tracking-[0.12em]">Personal workspace</p>
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
          <ol className="divide-y divide-[var(--line)] rounded-lg border border-[var(--line)] bg-[var(--surface)]">
            {eventCalendar.map((item) => (
              <li key={`${item.event}-${item.date}`} className="grid gap-1 p-4 sm:grid-cols-[190px_minmax(0,1fr)] sm:gap-5 sm:p-5">
                <div>
                  <p className="text-sm font-semibold">{item.date}</p>
                  <p className="mt-1 text-xs font-medium text-[var(--muted)]">{item.event}</p>
                </div>
                <p className="text-sm leading-6 text-[var(--muted)]">{item.activity}</p>
              </li>
            ))}
          </ol>
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

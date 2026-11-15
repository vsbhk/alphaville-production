import { ProjectNav } from "@/components/ProjectNav";
import { DayPlanner } from "@/components/DayPlanner";
import { EventProgramme, type CalendarDay } from "@/components/EventProgramme";
import { ProjectActionChecklist } from "@/components/ProjectActionChecklist";
import { InformationFollowUpTracker } from "@/components/InformationFollowUpTracker";
import { auth } from "@/auth";
import { AlphavilleHeader } from "@/components/AlphavilleBrand";

const dailyMediaDeadlines = [
  { title: "Provisional results publication", time: "Within 30 minutes of the final boat finishing", location: "Official Notice Board and Media Centre" },
  { title: "Daily race report publication deadline", time: "By 17:00 HKT", location: "Championship Media Centre" },
  { title: "Captioned photo gallery publication deadline · 8–12 images", time: "By 21:00 HKT", location: "Championship Media Centre" },
  { title: "Daily recap video publication", time: "Each evening", location: "Championship social channels" },
];

const eventCalendar: CalendarDay[] = [
  { event: "Asia Pacific Championship", date: "Tue 17 Nov", activities: [
    { title: "Registration, measurement and equipment inspection", time: "09:00–17:30", location: "Clearwater Bay Golf & Country Club Marina" },
    { title: "Final registration and weigh-in after inspection", location: "Regatta Office, Clearwater Bay Golf & Country Club Marina" },
  ] },
  { event: "Asia Pacific Championship", date: "Wed 18 Nov", activities: [
    { title: "Registration, measurement and equipment inspection", time: "09:00–17:30", location: "Clearwater Bay Golf & Country Club Marina" },
    { title: "Final registration and weigh-in after inspection", location: "Regatta Office, Clearwater Bay Golf & Country Club Marina" },
    { title: "Skippers’ briefing", time: "18:00–19:00", location: "RHKYC Kellett Island" },
    { title: "Opening ceremony", time: "19:00–21:00", location: "Royal Hong Kong Yacht Club poolside", runOfShow: [
      { title: "Event attendance", detail: "64 entries and about 200 sailors are expected." },
      { title: "Welcome speeches", detail: "David Norton (RHKYC Commodore) and Martin Cresswell (HKDA Class Captain) are intended invitees for the speeches." },
      { title: "Sponsor arrangements", detail: "SHK & Co. sponsors Bimbadgen wines; wine-tasting note stands will be displayed. Sponsor representatives Anita and Alison Yeung are expected to attend." },
    ] },
  ] },
  { event: "Asia Pacific Championship", date: "Thu 19 Nov", activities: [
    { title: "Championship racing · first warning signal", time: "11:00", location: "Waters off the Ninepins" },
    { title: "After-sailing drinks", time: "17:00–18:30", location: "Clearwater Bay Golf & Country Club" },
    ...dailyMediaDeadlines,
  ] },
  { event: "Asia Pacific Championship", date: "Fri 20 Nov", activities: [
    { title: "Championship racing · first warning signal", time: "11:00", location: "Waters off the Ninepins" },
    { title: "After-sailing drinks", time: "17:00–18:30", location: "Clearwater Bay Golf & Country Club" },
    ...dailyMediaDeadlines,
  ] },
  { event: "Asia Pacific Championship", date: "Sat 21 Nov", activities: [
    { title: "Final races · first warning signal", time: "11:00", location: "Waters off the Ninepins" },
    { title: "Asia Pacific Championship prizegiving ceremony", time: "18:30–21:00", location: "Clearwater Bay Golf & Country Club marina lawn", runOfShow: [
      { title: "Timing to confirm", detail: "The preparation note gives 18:00; the public visitor programme lists 18:30–21:00. Confirm the MC call time with the organiser." },
      { title: "Prize presenters", detail: "Ian Flemming (RHKYC) and Bram Van Olphen (IDA)." },
      { title: "McLeod Asia Pacific Dragon Championship Trophy", detail: "Overall Open division: gold, silver and bronze medals for the first three teams (four medals of each colour)." },
      { title: "Gordon Ingate Asia Pacific Dragon Championship Trophy", detail: "Corinthian division: the note lists two bottles of white and two bottles of red Bimbadgen wine for the first three teams." },
    ] },
    ...dailyMediaDeadlines,
  ] },
  { event: "World Championship", date: "Sat 21 Nov", activities: [
    { title: "Registration, measurement and equipment inspection", time: "09:00–17:30", location: "Clearwater Bay Golf & Country Club Marina" },
  ] },
  { event: "World Championship", date: "Sun 22 Nov", activities: [
    { title: "Registration, measurement and equipment inspection", time: "09:00–17:30", location: "Clearwater Bay Golf & Country Club Marina" },
    { title: "World Championship crew weighing deadline", time: "By 17:30", location: "Regatta Office, Clearwater Bay Golf & Country Club Marina" },
    { title: "Skippers’ briefing", time: "18:00–19:00", location: "RHKYC Kellett Island" },
    { title: "World Championship press conference · tentative rundown", time: "18:15–19:00", location: "Regatta Room, RHKYC Kellett Island", runOfShow: [
      { time: "18:15", title: "MC arrival and briefing; media reception", detail: "The tentative rundown lists Wincy / PR, Lung / PR and Tim Pearson." },
      { time: "18:20", title: "Sponsor and sailors arrive", detail: "Stella / Sponsorship in the tentative rundown." },
      { time: "18:25", title: "MC asks guests to be seated", detail: "Tim Pearson." },
      { time: "18:30–18:33", title: "Welcome remarks", detail: "Tim Pearson." },
      { time: "18:33–18:35", title: "Dragon Association welcome speech", detail: "Speaker name is still shown as XXX in the script and needs confirmation." },
      { time: "18:35–18:45", title: "Sailor sharing session", detail: "Andy Beadsworth (Provezza Dragon, Turkey) and Graham Bailey (Bluebottle, Great Britain)." },
      { time: "18:45–18:47", title: "Group photo", detail: "The number of people is to be confirmed." },
      { time: "18:47–18:50", title: "Close and direct media to the Turning Circle", detail: "Tim Pearson and PR team." },
      { time: "18:50–18:55", title: "Media transition to the Turning Circle", detail: "The tentative rundown says the opening ceremony will begin after media arrive." },
      { title: "Timing and schedule checks", detail: "This rundown is marked tentative and spans 18:15–19:00. The separate press factsheet lists 18:30–19:00; the MC script runs the conference from 18:30–18:50. The official skippers’ briefing is also scheduled for 18:00–19:00. Confirm the final media call and who covers each location." },
    ] },
    { title: "Opening reception", time: "19:00–21:00", location: "Royal Hong Kong Yacht Club", runOfShow: [
      { time: "18:15–19:00", title: "Related press conference · tentative", detail: "Regatta Room, RHKYC. See the separate press-conference event for the MC rundown. Its tentative media transfer to the Turning Circle overlaps the 19:00 opening reception arrival." },
      { time: "19:00", title: "Guest arrival", detail: "The ceremony is planned to begin when all guest speakers have arrived." },
      { time: "19:00–19:15", title: "Welcome speeches and Sail Onward cheque presentation", detail: "Bram Van Olphen; Rosanna Law, JP; David Norton; Meihan Cheung; and Tony Leung (confirmation pending). Tony Leung is also due to present a cheque to the local school sailing programme Sail Onward." },
      { time: "19:15", title: "Eye-dotting ceremony", detail: "Eight honorary guests: Timothy Fok Tsun Ting, Rosanna Law, Karl Kwok, David Norton, Tony Edwards, Meihan Cheung, Tony Leung and Bram Van Olphen. Dragon: Tony Leung and Bram Van Olphen. Lion 1: Timothy Fok and Rosanna Law. Lion 2: Karl Kwok and David Norton. Lion 3: Meihan Cheung and Tony Edwards." },
      { time: "19:20–19:30", title: "Lion dance" },
      { time: "19:30–19:40", title: "Dragon dance" },
      { title: "Organiser announcements and group photo", detail: "Hong Kong Sailing Federation; RHKYC; Hong Kong Dragon Association; Clearwater Bay Golf & Country Club; Hong Kong Tourism Board." },
      { title: "Sponsor announcements and group photo", detail: "SHK & Co.; SHK Capital Partners; Lee Kum Kee; Central Oceans; Code Zero; Hopewell Hotel; Brugse Zot; Chalmers; XPENG; Cathay Pacific; North Sails; Oakley; EVY; Tsit Wing Group; Pocari Sweat / Otsuka; and Sail Onward." },
      { time: "20:00", title: "Ceremony closes; buffet follows", detail: "Buffet for sailors and paid guests begins after the ceremony." },
      { title: "Schedule note", detail: "The preparation note gives a 20:00 ceremony close; the public visitor programme lists the opening reception through 21:00." },
    ] },
  ] },
  { event: "World Championship", date: "Mon 23 Nov", activities: [
    { title: "Championship racing · first warning signal", time: "11:00", location: "Waters off the Ninepins" },
    { title: "Day prizegiving · presented by Code Zero", time: "17:00–18:00", location: "Clearwater Bay Golf & Country Club" },
    ...dailyMediaDeadlines,
  ] },
  { event: "World Championship", date: "Tue 24 Nov", activities: [
    { title: "Championship racing · first warning signal", time: "11:00", location: "Waters off the Ninepins" },
    { title: "Day prizegiving · presented by SHK Capital Partners", time: "17:00–18:00", location: "Clearwater Bay Golf & Country Club" },
    ...dailyMediaDeadlines,
  ] },
  { event: "World Championship", date: "Wed 25 Nov", activities: [
    { title: "Championship racing · first warning signal", time: "11:00", location: "Waters off the Ninepins" },
    { title: "Championship gala dinner", time: "19:00–22:00", location: "Crystal Ballroom, Hopewell Hotel" },
    ...dailyMediaDeadlines,
  ] },
  { event: "World Championship", date: "Thu 26 Nov", activities: [
    { title: "Lay day · racing only if required to complete the series", location: "Waters off the Ninepins", runOfShow: [
      { title: "Conditional media deadlines", detail: "Only if the Race Committee schedules racing, apply the standard race-day deadlines: provisional results within 30 minutes of the final boat finishing, race report by 17:00 HKT, captioned gallery by 21:00 HKT, and recap video that evening." },
    ] },
  ] },
  { event: "World Championship", date: "Fri 27 Nov", activities: [
    { title: "Championship racing · first warning signal", time: "11:00", location: "Waters off the Ninepins" },
    { title: "Day prizegiving · presented by XPENG", time: "18:00–20:00", location: "Royal Hong Kong Yacht Club" },
    ...dailyMediaDeadlines,
  ] },
  { event: "World Championship", date: "Sat 28 Nov", activities: [
    { title: "Championship racing · first warning signal", time: "11:00", location: "Waters off the Ninepins" },
    { title: "Day prizegiving · presented by Lee Kum Kee", time: "17:00–18:00", location: "Clearwater Bay Golf & Country Club" },
    ...dailyMediaDeadlines,
  ] },
  { event: "World Championship", date: "Sun 29 Nov", activities: [
    { title: "Final races · first warning signal", time: "11:00", location: "Waters off the Ninepins" },
    { title: "Prizegiving and closing ceremony · approximate start", time: "Approx. 18:00", location: "Clearwater Bay Golf & Country Club" },
    ...dailyMediaDeadlines,
  ] },
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
            <h2 id="actions-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">To-do checklist</h2>
          </div>
          <ProjectActionChecklist editable={canEdit} />
        </section>

        <section className="border-t border-[var(--line)] py-8" aria-labelledby="follow-ups-title">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Outstanding information</p>
            <h2 id="follow-ups-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Who owes what</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">Track missing information by sponsor or provider, update chase status, and copy a draft to review and send from your email.</p>
          </div>
          <InformationFollowUpTracker editable={canEdit} />
        </section>

        <section className="border-t border-[var(--line)] py-8" aria-labelledby="calendar-title">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Calendar</p>
              <h2 id="calendar-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Official programme and coverage plan</h2>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <a href="https://www.dragonworld2027.com/for-visitors" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--accent)] underline decoration-[var(--line-strong)] underline-offset-4">Live public calendar</a>
              <a href="https://www.dragonworld2027.com/for-competitors" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--accent)] underline decoration-[var(--line-strong)] underline-offset-4">Competitor information</a>
              <a href="https://www.racingrulesofsailing.org/documents/13241/event" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--accent)] underline decoration-[var(--line-strong)] underline-offset-4">APC Official Notice Board</a>
            </div>
          </div>
          <p className="mb-4 max-w-3xl text-sm leading-6 text-[var(--muted)]">Published programme times are shown in Hong Kong time (HKT). Expand a day to assign a service provider, set their coverage times, and enter the agreed meeting point beside each activity. These are planning assignments, not confirmed bookings; use the production calendar below for any further shoot details.</p>
          <div className="mb-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Filming period</p>
            <p className="mt-2 text-lg font-semibold">Tuesday 17 November – Sunday 29 November 2026</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Daily filming window: 09:00–21:00 HKT. Activity-specific times, responsible people or teams, and meeting points still need to be entered.</p>
          </div>
          <EventProgramme days={eventCalendar} editable={canEdit} />
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

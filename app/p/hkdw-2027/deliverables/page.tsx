import { ProjectNav } from "@/components/ProjectNav";
import { DeliverableChecklist, type Deliverable } from "@/components/DeliverableChecklist";
import { auth } from "@/auth";
import { AlphavilleHeader } from "@/components/AlphavilleBrand";

const videoProduction: Deliverable[] = [
  {
    title: "TV news raw cuts",
    detail: "3 × 4-minute cuts, with at least 15 interviews.",
    timing: "During the Event",
  },
  {
    title: "Documentary",
    detail: "1 × 15-minute film.",
    timing: "15 days after the Event",
  },
  {
    title: "Documentary",
    detail: "1 × 3-minute film.",
    timing: "3 days after the Event",
  },
  {
    title: "Documentary",
    detail: "1 × 1-minute film.",
    timing: "Last day of the Event",
  },
  {
    title: "Sponsor signage film",
    detail: "1 × 90-second film.",
    timing: "Last day of the Event",
  },
  {
    title: "Sponsor videos",
    detail:
      "9 videos. Each is supplied in three lengths (60–90 seconds, 30 seconds and 15 seconds), in landscape, portrait and square formats, plus a caption-free version of each. Written permission is supplied for each sponsor to use their video.",
    timing: "15 days after the closing ceremony",
  },
  {
    title: "Ceremony coverage",
    detail: "Filming coverage of the prize-giving, closing ceremony and official dinner.",
    timing: "Timing not specified in the recap",
  },
  {
    title: "Unused footage",
    detail: "Unused footage is labelled and handed over.",
    timing: "Within one month of the Event",
  },
];

const distribution: Deliverable[] = [
  {
    title: "Online alerts",
    detail: "9 alerts to digital media. Distribution is guaranteed; usage is not guaranteed.",
    timing: "Not specified in the recap",
  },
  {
    title: "Inside Sailing highlights",
    detail: "1 × 3-minute highlights segment, with guaranteed inclusion and distribution.",
    timing: "Not specified in the recap",
  },
  {
    title: "VNR raw footage",
    detail: "3 distributions to national and international TV stations and agencies.",
    timing: "Not specified in the recap",
  },
  {
    title: "15-minute documentary distribution",
    detail: "Distribution to TV channels and OTT platforms.",
    timing: "Not specified in the recap",
  },
  {
    title: "Inside Sailing highlights distribution",
    detail: "Distribution to inflight entertainment platforms.",
    timing: "Not specified in the recap",
  },
  {
    title: "Sponsor media report",
    detail:
      "One report for all 9 sponsors. The body content is identical, with each sponsor’s logo on its own front page.",
    timing: "One month after the Event",
  },
];

export default async function DeliverablesPage() {
  const session = await auth();
  const canEdit = session?.user.role === "admin" || session?.user.role === "editor";
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <AlphavilleHeader label="HKDW 2027" />
      <ProjectNav current="deliverables" />

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[var(--muted)]">
          <a className="underline decoration-[var(--line-strong)] underline-offset-4 hover:text-[var(--foreground)]" href="/">Workspace</a>
          <span className="px-2" aria-hidden="true">/</span>
          <span>HKDW 2027</span>
          <span className="px-2" aria-hidden="true">/</span>
          <span className="text-[var(--foreground)]">Deliverables</span>
        </nav>

        <section className="border-b border-[var(--line)] pb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Contract recap · Shared tracking setup</p>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-5xl">Deliverables</h1>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">HKDW 2027 - Royal Hong Kong Yacht Club</p>
          <p className="mt-5 max-w-3xl rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 text-sm leading-6">
            This page records the deliverables in the supplied contract recap. Relative deadlines remain relative to the Event. Delivery status is ready to save to shared project storage when the Google Sheet is configured; until then, changes stay in this browser.
          </p>
        </section>

        <section className="py-8" aria-labelledby="video-title">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Production</p>
              <h2 id="video-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Video production</h2>
            </div>
          </div>
          <DeliverableChecklist items={videoProduction} group="production" editable={canEdit} />
        </section>

        <section className="border-t border-[var(--line)] py-8" aria-labelledby="distribution-title">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Distribution</p>
              <h2 id="distribution-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Media distribution</h2>
            </div>
          </div>
          <DeliverableChecklist items={distribution} group="distribution" editable={canEdit} />
        </section>

        <section className="border-t border-[var(--line)] py-8" aria-labelledby="providers-title">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Provider assignments</p>
          <h2 id="providers-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Separate teams</h2>
          <div className="mt-5 space-y-3">
            <article className="grid gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Video production</p>
                <h3 className="mt-2 text-base font-semibold">ICARUS Sports</h3>
              </div>
              <p className="text-sm leading-6 text-[var(--muted)]">Production service provider. This team is listed separately from Kevin Rio’s daily recap work.</p>
            </article>
            <article className="grid gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Video daily recaps</p>
                <h3 className="mt-2 text-base font-semibold">Kevin Rio</h3>
              </div>
              <p className="text-sm leading-6 text-[var(--muted)]">Separate team assignment for video daily recaps.</p>
            </article>
            <article className="grid gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">Photography</p>
                <h3 className="mt-2 text-base font-semibold">Takumi Images</h3>
              </div>
              <p className="text-sm leading-6 text-[var(--muted)]">Photography provider.</p>
            </article>
          </div>
        </section>

        <p className="border-t border-[var(--line)] py-6 text-sm leading-6 text-[var(--muted)]">Delivery owners, review history, destinations and actual delivery dates still need to be added to the shared project tracking workflow.</p>
      </main>

      <footer className="border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center px-5 sm:px-8">
          <p className="text-xs text-[var(--muted)]">prod.alphaville.hk</p>
        </div>
      </footer>
    </div>
  );
}

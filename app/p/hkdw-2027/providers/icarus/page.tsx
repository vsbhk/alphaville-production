import { ProjectNav } from "@/components/ProjectNav";
import { AlphavilleHeader } from "@/components/AlphavilleBrand";

const lifecycle = [
  { label: "Empty", current: true },
  { label: "Supplied", current: false },
  { label: "Awaiting review", current: false },
  { label: "Changes requested", current: false },
  { label: "Approved", current: false },
];

export default function IcarusProductionPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <AlphavilleHeader label="HKDW 2027" />
      <ProjectNav current="production" />

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[var(--muted)]">
          <a className="underline decoration-[var(--line-strong)] underline-offset-4 hover:text-[var(--foreground)]" href="/">
            Workspace
          </a>
          <span className="px-2" aria-hidden="true">/</span>
          <span>HKDW 2027</span>
          <span className="px-2" aria-hidden="true">/</span>
          <span className="text-[var(--foreground)]">Production provider</span>
        </nav>

        <section className="grid gap-8 border-b border-[var(--line)] pb-9 md:grid-cols-[1fr_280px] md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Production provider · Design preview</p>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-5xl">Production brief</h1>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">HKDW 2027 - Royal Hong Kong Yacht Club</p>
          </div>
          <div className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Workspace state</p>
            <p className="mt-2 flex items-center gap-2 text-sm font-medium">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Setup in progress
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">This preview has no connected project records or sign-in.</p>
          </div>
        </section>

        <section className="grid gap-4 border-b border-[var(--line)] py-7 sm:grid-cols-2">
          <article className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Filming calendar</p>
            <p className="mt-3 text-lg font-semibold tracking-[-0.03em]">Daily window: 09:00–21:00 HKT</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Activity-specific times, responsible teams and meeting points remain to be entered before bookings are shown.</p>
          </article>
          <article className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Approved sponsor material</p>
            <p className="mt-3 text-lg font-semibold tracking-[-0.03em]">Nothing loaded in this preview</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Only material approved for production belongs in this area.</p>
          </article>
        </section>

        <div className="grid gap-10 py-9 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-10">
            <section aria-labelledby="slots-title">
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Schedule</p>
                  <h2 id="slots-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Filming windows</h2>
                </div>
                <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">Needs input</span>
              </div>
              <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--surface)]">
                <div className="grid gap-4 border-b border-[var(--line)] p-5 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-[var(--muted)]">Activity type</p>
                    <p className="mt-1 text-sm font-medium">Not set</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)]">Daily filming window</p>
                    <p className="mt-1 text-sm font-medium">09:00–21:00 HKT</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted)]">Location / meeting point</p>
                    <p className="mt-1 text-sm font-medium">Not confirmed</p>
                  </div>
                </div>
                <p className="p-5 text-sm leading-6 text-[var(--muted)]">The filming period is 17–29 November 2026. Daily availability is 09:00–21:00 HKT; each activity’s exact time and agreed meeting point still need to be recorded.</p>
              </div>
            </section>

            <section aria-labelledby="approval-title">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Material review</p>
              <h2 id="approval-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">One approval gate</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">Approval means the provider may use the current version. If an item is replaced, it returns to review.</p>
              <ol className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-3" aria-label="Approval lifecycle">
                {lifecycle.map((step, index) => (
                  <li key={step.label} className={`flex min-h-14 items-center gap-3 rounded-lg border px-4 py-3 text-sm ${step.current ? "border-[var(--accent)] bg-white font-semibold" : "border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"}`}>
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${step.current ? "bg-[var(--accent)] text-white" : "bg-[var(--background)]"}`}>{index + 1}</span>
                    {step.label}
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="access-title">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Venue access</p>
              <h2 id="access-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Access and accreditation</h2>
              <div className="mt-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
                <p className="text-sm leading-6">Visa and accreditation details are held in the organiser’s spreadsheet.</p>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">This workspace should not contain passport numbers or other unnecessary identity details.</p>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Public media cadence</p>
              <h2 className="mt-2 text-lg font-semibold tracking-[-0.03em]">Reference schedule</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <div className="border-t border-[var(--line)] pt-3">
                  <dt className="font-medium">By 17:00 HKT</dt>
                  <dd className="mt-1 leading-5 text-[var(--muted)]">Daily race report</dd>
                </div>
                <div className="border-t border-[var(--line)] pt-3">
                  <dt className="font-medium">By 21:00 HKT</dt>
                  <dd className="mt-1 leading-5 text-[var(--muted)]">Captioned gallery of 8–12 photos</dd>
                </div>
                <div className="border-t border-[var(--line)] pt-3">
                  <dt className="font-medium">Each evening</dt>
                  <dd className="mt-1 leading-5 text-[var(--muted)]">Daily recap video on championship social channels</dd>
                </div>
              </dl>
              <a className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-[var(--accent)] underline decoration-[var(--line-strong)] underline-offset-4 hover:decoration-current" href="https://www.dragonworld2027.com/media" target="_blank" rel="noreferrer">Open Media Centre</a>
              <p className="mt-2 text-xs leading-5 text-[var(--muted)]">Public publication cadence; production assignments and delivery owners are not set here.</p>
            </section>

            <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Project</p>
              <p className="mt-2 text-sm font-medium">HKDW 2027 - Royal Hong Kong Yacht Club</p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Filming period: 17–29 November 2026, 09:00–21:00 HKT daily.</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)]">World Championship dates: 21–29 November 2026.</p>
            </section>
          </aside>
        </div>
      </main>

      <footer className="border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center px-5 sm:px-8">
          <p className="text-xs text-[var(--muted)]">prod.alphaville.hk</p>
        </div>
      </footer>
    </div>
  );
}

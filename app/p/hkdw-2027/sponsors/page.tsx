import { ProjectNav } from "@/components/ProjectNav";
import { SponsorAssetIntake } from "@/components/SponsorAssetIntake";
import { projectSponsors } from "@/lib/sponsors";

export default function SponsorsPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex min-h-[68px] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <a href="/" className="text-[17px] font-semibold tracking-[-0.04em]" aria-label="Alphaville workspace sign in">Alphaville<span className="ml-1 text-[var(--accent)]">.</span></a>
          <p className="text-right text-xs font-medium text-[var(--muted)]">Private production workspace</p>
        </div>
      </header>
      <ProjectNav current="sponsors" />

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[var(--muted)]">
          <a className="underline decoration-[var(--line-strong)] underline-offset-4 hover:text-[var(--foreground)]" href="/p/hkdw-2027">HKDW 2027</a>
          <span className="px-2" aria-hidden="true">/</span>
          <span className="text-[var(--foreground)]">Sponsors</span>
        </nav>

        <section className="border-b border-[var(--line)] pb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Sponsor workspaces · Design preview</p>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-5xl">Sponsors</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">A separate workspace is intended for each sponsor. Approved contacts should only see their own organisation’s material and review notes.</p>
          <p className="mt-5 max-w-3xl rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">Privacy is not enforced in this preview: sign-in and project-scoped storage are not connected. No sponsor submissions, files, emails or review histories have been imported.</p>
        </section>

        <section className="py-8" aria-labelledby="roster-title">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Source roster</p>
              <h2 id="roster-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Sponsor organisations</h2>
            </div>
              <span className="rounded-full border border-[var(--line-strong)] px-3 py-1 text-xs font-medium text-[var(--muted)]">{projectSponsors.length} names · statuses not imported</span>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projectSponsors.map((sponsor) => (
              <li key={sponsor.slug}>
                <a href={`/p/hkdw-2027/sponsors/${sponsor.slug}`} className="flex min-h-20 items-center justify-between gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-4 transition hover:border-[var(--accent)]">
                  <span className="text-sm font-semibold">{sponsor.name}</span>
                  <span className="shrink-0 rounded-full bg-[var(--background)] px-2.5 py-1 text-[11px] font-medium text-[var(--muted)]">Open preview</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-t border-[var(--line)] py-8">
          <SponsorAssetIntake sponsors={projectSponsors.map(({ name }) => name)} />
        </section>

        <section className="border-t border-[var(--line)] py-8" aria-labelledby="review-model-title">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Sponsor review</p>
          <h2 id="review-model-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Private, organisation-specific review</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <article className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
              <h3 className="text-sm font-semibold">Sponsor contact</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Reviews and updates their organisation’s own submission, sees feedback on its items, and cannot see another sponsor’s page.</p>
            </article>
            <article className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
              <h3 className="text-sm font-semibold">Project team</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">The coordinator manages intake and review. Only specifically approved material is released to the production workspace.</p>
            </article>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center px-5 sm:px-8"><p className="text-xs text-[var(--muted)]">prod.alphaville.hk</p></div>
      </footer>
    </div>
  );
}

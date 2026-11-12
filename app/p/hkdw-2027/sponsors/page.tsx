import { ProjectNav } from "@/components/ProjectNav";
import { SponsorAssetIntake } from "@/components/SponsorAssetIntake";
import { projectSponsors } from "@/lib/sponsors";
import { auth } from "@/auth";

export default async function SponsorsPage() {
  const session = await auth();
  const canManage = session?.user.role === "admin" || session?.user.role === "editor";
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
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Personal project records</p>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.05em] sm:text-5xl">Sponsors</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--muted)]">Keep sponsor references and review notes in your private project workspace. No sponsor accounts or shared folders are connected.</p>
          <p className="mt-5 max-w-3xl rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">These are project reference records only. No sponsor submissions, files, emails or review histories have been imported.</p>
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

        {canManage && <section className="border-t border-[var(--line)] py-8">
          <SponsorAssetIntake sponsors={projectSponsors.map(({ name }) => name)} />
        </section>}

        <section className="border-t border-[var(--line)] py-8" aria-labelledby="review-model-title">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Personal use</p>
          <h2 id="review-model-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Private notes for your own reference</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">Links and notes are saved to the connected project data sheet for your account. This site does not invite sponsors or grant access to their Drive folders.</p>
        </section>
      </main>

      <footer className="border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center px-5 sm:px-8"><p className="text-xs text-[var(--muted)]">prod.alphaville.hk</p></div>
      </footer>
    </div>
  );
}

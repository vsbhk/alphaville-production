import { notFound } from "next/navigation";
import { ProjectNav } from "@/components/ProjectNav";
import { projectSponsors } from "@/lib/sponsors";

export function generateStaticParams() {
  return projectSponsors.map(({ slug }) => ({ sponsor: slug }));
}

export default async function SponsorWorkspacePage({
  params,
}: {
  params: Promise<{ sponsor: string }>;
}) {
  const { sponsor: sponsorSlug } = await params;
  const sponsor = projectSponsors.find(({ slug }) => slug === sponsorSlug);
  if (!sponsor) notFound();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex min-h-[68px] max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <a href="/" className="text-[17px] font-semibold tracking-[-0.04em]" aria-label="Alphaville workspace sign in">Alphaville<span className="ml-1 text-[var(--accent)]">.</span></a>
          <p className="text-right text-xs font-medium text-[var(--muted)]">Private production workspace</p>
        </div>
      </header>
      <ProjectNav current="sponsors" />

      <main className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-[var(--muted)]">
          <a className="underline decoration-[var(--line-strong)] underline-offset-4 hover:text-[var(--foreground)]" href="/p/hkdw-2027">HKDW 2027</a>
          <span className="px-2" aria-hidden="true">/</span>
          <a className="underline decoration-[var(--line-strong)] underline-offset-4 hover:text-[var(--foreground)]" href="/p/hkdw-2027/sponsors">Sponsors</a>
          <span className="px-2" aria-hidden="true">/</span>
          <span className="text-[var(--foreground)]">{sponsor.name}</span>
        </nav>

        <section className="border-b border-[var(--line)] pb-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Sponsor workspace · Records setup</p>
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-[-0.05em]">{sponsor.name}</h1>
          <p className="mt-4 text-base leading-7 text-[var(--muted)]">HKDW 2027 - Royal Hong Kong Yacht Club</p>
        </section>

        <aside className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          <p className="font-semibold">Sponsor-specific access is enforced for approved accounts.</p>
          <p className="mt-2">Google OAuth credentials are present in Vercel Production, but end-to-end sign-in still needs verification. Sponsor submissions, files, contact information and review notes have not been connected to project storage.</p>
        </aside>

        <section className="mt-8 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Submission</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Sponsor organisation’s materials</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Submission records are not connected yet. Once storage is configured, this page will contain only this sponsor’s contact details, assets, filming information and approval feedback.</p>
        </section>

        <section className="mt-5 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Review</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em]">Sponsor submission review</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">No review status or notes are loaded. The intended review flow uses one approval state for each current item; replacements return to awaiting review.</p>
        </section>

        <div className="mt-8">
          <a href="/p/hkdw-2027/sponsors" className="inline-flex min-h-11 items-center rounded-md border border-[var(--line-strong)] bg-[var(--surface)] px-4 text-sm font-semibold hover:border-[var(--accent)]">Back to sponsor directory</a>
        </div>
      </main>

      <footer className="border-t border-[var(--line)] bg-[var(--surface)]">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center px-5 sm:px-8"><p className="text-xs text-[var(--muted)]">prod.alphaville.hk</p></div>
      </footer>
    </div>
  );
}

import { notFound } from "next/navigation";
import { ProjectNav } from "@/components/ProjectNav";
import { AlphavilleHeader } from "@/components/AlphavilleBrand";
import { SponsorWorkspace } from "@/components/SponsorWorkspace";
import { projectSponsors } from "@/lib/sponsors";
import { auth } from "@/auth";

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
  const session = await auth();
  const canEdit = session?.user.role === "admin" || session?.user.role === "editor";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <AlphavilleHeader label="HKDW 2027" />
      <ProjectNav current="sponsors" />

      <main className="mx-auto w-full min-w-0 max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
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

        <aside className="mt-6 border border-[var(--line)] bg-[var(--surface)] p-5 text-sm leading-6">
          <p className="font-semibold">Private sponsor collection</p>
          <p className="mt-2 break-words text-[var(--muted)]">Collect this sponsor’s information and files here. When it is complete, download a ZIP and share it with Icarus yourself.</p>
        </aside>

        <SponsorWorkspace key={sponsor.slug} sponsorSlug={sponsor.slug} sponsorName={sponsor.name} editable={canEdit} />

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

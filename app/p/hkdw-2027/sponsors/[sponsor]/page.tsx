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

        {sponsor.slug === "yanmar" && (
          <article className="border-b border-[var(--line)] py-8" aria-labelledby="yanmar-announcement-title">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Draft press release</p>
            <h2 id="yanmar-announcement-title" className="max-w-3xl text-2xl font-semibold leading-tight tracking-[-0.04em] sm:text-3xl">
              Yanmar strengthens longstanding Dragon class relationship as Supporting Partner of the 2027 Hong Kong Dragon World Championship
            </h2>

            <div className="mt-6 space-y-5 text-sm leading-7 text-[var(--foreground)] sm:text-base">
              <p><span className="font-semibold">Hong Kong, [issue date] —</span> Yanmar Holdings Co., Ltd. will join the 2027 Hong Kong Dragon World Championship as a Supporting Partner, extending its longstanding relationship with the International Dragon class and its wider commitment to sailing. The partnership celebrates a shared passion for sailing as the Dragon World Championship comes to Asia for the first time.</p>

              <p>Yanmar’s involvement in the Dragon class goes beyond sponsorship. Its own sailing team, YANMAR Racing, began competing in the class in 2018, with a line-up bringing together America’s Cup veteran Peter Gilmour, Sam Gilmour and experienced sailor and team director Yasuhiro Yaji. Through its participation, Yanmar has built a direct connection with the sailors and competition at the heart of the class. That commitment has been reinforced by Yanmar’s continuous support of the Dragon Gold Cup since 2019. Becoming a Supporting Partner of the Hong Kong championship continues this relationship, extending its support to a significant new chapter for Dragon sailing in Asia.</p>

              <blockquote className="border-l-2 border-[var(--line-strong)] pl-5 text-[var(--muted)]">
                <p>“Our relationship with the Dragon class is built on a shared passion for sailing and a deep respect for the skill, teamwork and dedication it demands. Through YANMAR Racing and our support of international regattas, we are proud to be part of this community, not simply as a sponsor, but as fellow enthusiasts of the sport. Supporting the Hong Kong championship is a natural continuation of that commitment. We look forward to celebrating the Dragon’s enduring appeal, welcoming the international fleet to Asia and helping more people discover the enjoyment and sense of connection that sailing brings.”</p>
                <footer className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--foreground)]">Taro KITAMURA, Director of Yanmar Holdings Co., Ltd.</footer>
              </blockquote>

              <p>Yanmar’s relationship with sailing extends well beyond the Dragon fleet. Its America’s Cup involvement has included technical support for ORACLE TEAM USA in 2013 and subsequent event partnerships, including its role as an Official Sponsor of the 37th America’s Cup in 2024. Together with its own racing programme, these activities reflect a sustained commitment to the people, technology and teamwork behind the sport.</p>

              <blockquote className="border-l-2 border-[var(--line-strong)] pl-5 text-[var(--muted)]">
                <p>“Yanmar has earned a special place in the Dragon community through the consistency of its support and its active involvement on the racecourse. This is a relationship built over years, with a genuine understanding of what makes our class special: close competition, lasting friendships and a passion for sailing that crosses generations and borders. We are delighted to welcome Yanmar as a Supporting Partner. Bringing the Dragon World Championship to Asia for the first time is an important milestone, and having a longstanding friend of the class alongside us makes it all the more meaningful. Together, we look forward to delivering a memorable championship and encouraging the continued growth of Dragon sailing in the region.”</p>
                <footer className="mt-3 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--foreground)]">Abraham van Olphen, speaking on behalf of the event organiser</footer>
              </blockquote>

              <p>The championship fleet will be hosted at The Clearwater Bay Golf &amp; Country Club marina, with racing on the open waters near Hong Kong’s Ninepins Islands. The event carries the 2027 championship title as the opening event of the 2027 Dragon season.</p>

              <section className="border-t border-[var(--line)] pt-5" aria-labelledby="about-yanmar-title">
                <h3 id="about-yanmar-title" className="mb-2 text-xs font-semibold uppercase tracking-[0.12em]">About Yanmar</h3>
                <p>Founded in Osaka, Japan, in 1912, Yanmar provides technology and equipment across sectors including marine, agriculture, construction and energy systems. Its longstanding marine activities encompass both engineering and support for marine sports, reflecting its commitment to enriching life on the water and its vision of “A Sustainable Future”.</p>
              </section>
            </div>
          </article>
        )}

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

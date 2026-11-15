import { SessionSafetyControls } from "@/components/SessionSafetyControls";

type ProjectSection = "overview" | "sponsors" | "production" | "deliverables";

const links: { id: ProjectSection; label: string; href: string }[] = [
  { id: "overview", label: "Overview", href: "/p/hkdw-2027" },
  { id: "sponsors", label: "Sponsors", href: "/p/hkdw-2027/sponsors" },
  { id: "production", label: "Production preview", href: "/p/hkdw-2027/providers/icarus" },
  { id: "deliverables", label: "Deliverables", href: "/p/hkdw-2027/deliverables" },
];

export function ProjectNav({ current }: { current: ProjectSection }) {
  return (
    <div className="border-b border-white/15 bg-black">
      <nav aria-label="Project sections" className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 px-5 sm:px-8">
        <div className="flex flex-wrap gap-x-6">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              aria-current={current === link.id ? "page" : undefined}
              className={`inline-flex min-h-12 items-center border-b-2 text-sm font-medium ${current === link.id ? "border-[var(--accent)] text-white" : "border-transparent text-white/70 hover:text-white"}`}
            >
              {link.label}
            </a>
          ))}
        </div>
        <SessionSafetyControls />
      </nav>
    </div>
  );
}

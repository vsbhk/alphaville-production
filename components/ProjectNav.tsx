type ProjectSection = "overview" | "sponsors" | "production" | "deliverables";

const links: { id: ProjectSection; label: string; href: string }[] = [
  { id: "overview", label: "Overview", href: "/p/hkdw-2027" },
  { id: "sponsors", label: "Sponsors", href: "/p/hkdw-2027/sponsors" },
  { id: "production", label: "Production preview", href: "/p/hkdw-2027/providers/icarus" },
  { id: "deliverables", label: "Deliverables", href: "/p/hkdw-2027/deliverables" },
];

export function ProjectNav({ current }: { current: ProjectSection }) {
  return (
    <div className="border-b border-white/15 bg-[var(--foreground)]">
      <nav aria-label="Project sections" className="mx-auto flex max-w-6xl flex-wrap gap-1 px-5 sm:px-8">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.href}
            aria-current={current === link.id ? "page" : undefined}
            className={`inline-flex min-h-12 items-center border-b-2 px-3 text-sm font-medium ${current === link.id ? "border-[var(--accent)] text-white" : "border-transparent text-white/70 hover:text-white"}`}
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
}

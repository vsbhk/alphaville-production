export type ProjectRole = "admin" | "editor" | "viewer" | "sponsor-viewer";

export type ProjectAccess = { role: ProjectRole; sponsorSlug?: string };

// Approved external project viewers. Authentication must still be completed
// before these entries grant access.
const externalViewers = new Set([
  "koko.mueller@rhkyc.org.hk",
  "wincy.hon@rhkyc.org.hk",
  "nikki.claringbold@rhkyc.org.hk",
  "stella.ko@rhkyc.org.hk",
  "stzanis@icarus-sports.com",
  "favramakou@icarus-sports.com",
  "istef@icarus-sports.com",
  "panpac@icarus-sports.com",
  "kpap@icarus-sports.com",
  "jason@icarus-sports.com",
  "lili.t@icarus-sports.com",
  "admin@icarus-sports.com",
]);

const sponsorViewers = new Map([
  ["bram.van.olphen@centraloceans.com", "central-oceans"],
]);

export function getProjectAccess(email: string | null | undefined): ProjectAccess | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  if (externalViewers.has(normalized)) return { role: "viewer" };
  const sponsorSlug = sponsorViewers.get(normalized);
  if (sponsorSlug) return { role: "sponsor-viewer", sponsorSlug };
  const domain = process.env.ALPHAVILLE_WORKSPACE_DOMAIN?.trim().toLowerCase();
  if (domain && normalized.endsWith(`@${domain}`)) return { role: "editor" };
  return null;
}

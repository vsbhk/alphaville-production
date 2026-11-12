export type ProjectRole = "admin" | "editor" | "viewer" | "sponsor-viewer";

export type ProjectAccess = { role: ProjectRole; sponsorSlug?: string };

const personalWorkspaceOwner = "alpha@alphaville.hk";

export function getProjectAccess(email: string | null | undefined): ProjectAccess | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return normalized === personalWorkspaceOwner ? { role: "editor" } : null;
}

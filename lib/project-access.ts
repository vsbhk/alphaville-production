export type ProjectRole = "editor";

export type ProjectAccess = { role: ProjectRole };

const personalWorkspaceOwner = "alpha@alphaville.hk";

export function getProjectAccess(email: string | null | undefined): ProjectAccess | null {
  if (!email) return null;
  const normalized = email.trim().toLowerCase();
  return normalized === personalWorkspaceOwner ? { role: "editor" } : null;
}

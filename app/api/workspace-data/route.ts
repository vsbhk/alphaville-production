import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProjectAccess } from "@/lib/project-access";
import { getWorkspaceRecord, putWorkspaceRecord } from "@/lib/google-workspace";
import { projectSponsors } from "@/lib/sponsors";

const allowedKeys = new Set(["production-calendar", "deliverables"]);

function permittedKey(key: string, role: string, sponsorSlug?: string) {
  if (allowedKeys.has(key)) return role === "admin" || role === "editor" || role === "viewer";
  const requestedSponsor = key.startsWith("sponsor:") ? key.slice("sponsor:".length) : "";
  if (!projectSponsors.some((sponsor) => sponsor.slug === requestedSponsor)) return false;
  return role === "admin" || role === "editor" || (role === "sponsor-viewer" && sponsorSlug === requestedSponsor);
}

export async function GET(request: Request) {
  const session = await auth();
  const access = getProjectAccess(session?.user.email);
  if (!session?.user.email || !access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const key = new URL(request.url).searchParams.get("key") ?? "";
  if (!permittedKey(key, access.role, access.sponsorSlug)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const payload = await getWorkspaceRecord(key);
    return NextResponse.json({ payload });
  } catch {
    return NextResponse.json({ error: "Google Workspace storage is not configured" }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  const access = getProjectAccess(session?.user.email);
  if (!session?.user.email || !access) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(access.role === "admin" || access.role === "editor")) return NextResponse.json({ error: "Read-only access" }, { status: 403 });

  let body: { key?: unknown; payload?: unknown };
  try { body = await request.json() as { key?: unknown; payload?: unknown }; }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }
  const key = typeof body.key === "string" ? body.key : "";
  if (!permittedKey(key, access.role, access.sponsorSlug)) return NextResponse.json({ error: "Invalid record key" }, { status: 400 });
  const serialized = JSON.stringify(body.payload);
  if (serialized === undefined) return NextResponse.json({ error: "Missing record payload" }, { status: 400 });
  if (serialized.length > 500_000) return NextResponse.json({ error: "Record is too large" }, { status: 413 });

  try {
    await putWorkspaceRecord(key, body.payload, session.user.email);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Google Workspace storage is not configured" }, { status: 503 });
  }
}

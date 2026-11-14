import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProjectAccess } from "@/lib/project-access";
import { getWorkspaceRecord, putWorkspaceRecord } from "@/lib/google-workspace";
import { projectSponsors } from "@/lib/sponsors";

const allowedKeys = new Set(["production-calendar", "deliverables"]);
const privateHeaders = { "Cache-Control": "private, no-store, max-age=0, must-revalidate" };

function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: privateHeaders });
}

function permittedKey(key: string) {
  if (allowedKeys.has(key)) return true;
  const requestedSponsor = key.startsWith("sponsor:") ? key.slice("sponsor:".length) : "";
  return projectSponsors.some((sponsor) => sponsor.slug === requestedSponsor);
}

export async function GET(request: Request) {
  const session = await auth();
  const access = getProjectAccess(session?.user.email);
  if (!session?.user.email || !access) return privateJson({ error: "Unauthorized" }, 401);

  const key = new URL(request.url).searchParams.get("key") ?? "";
  if (!permittedKey(key)) return privateJson({ error: "Forbidden" }, 403);

  try {
    const payload = await getWorkspaceRecord(key);
    return privateJson({ payload });
  } catch {
    return privateJson({ error: "Private project storage is temporarily unavailable" }, 503);
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  const access = getProjectAccess(session?.user.email);
  if (!session?.user.email || !access) return privateJson({ error: "Unauthorized" }, 401);

  let body: { key?: unknown; payload?: unknown };
  try { body = await request.json() as { key?: unknown; payload?: unknown }; }
  catch { return privateJson({ error: "Invalid JSON body" }, 400); }
  const key = typeof body.key === "string" ? body.key : "";
  if (!permittedKey(key)) return privateJson({ error: "Invalid record key" }, 400);
  const serialized = JSON.stringify(body.payload);
  if (serialized === undefined) return privateJson({ error: "Missing record payload" }, 400);
  if (serialized.length > 500_000) return privateJson({ error: "Record is too large" }, 413);

  try {
    await putWorkspaceRecord(key, body.payload, session.user.email);
    return privateJson({ ok: true });
  } catch {
    return privateJson({ error: "Private project storage is temporarily unavailable" }, 503);
  }
}

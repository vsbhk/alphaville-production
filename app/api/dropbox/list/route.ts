import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProjectAccess } from "@/lib/project-access";
import { isDropboxConfigured, listSponsorDropboxFiles, sponsorDropboxPath } from "@/lib/dropbox";

export async function GET(request: Request) {
  const session = await auth();
  const access = getProjectAccess(session?.user.email);
  if (!session?.user.email || !access || !["admin", "editor"].includes(access.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  }

  const slug = new URL(request.url).searchParams.get("sponsor") ?? "";
  try { sponsorDropboxPath(slug); }
  catch { return NextResponse.json({ error: "Unknown sponsor" }, { status: 400, headers: { "Cache-Control": "private, no-store" } }); }
  if (!isDropboxConfigured()) return NextResponse.json({ error: "Dropbox is not configured" }, { status: 503, headers: { "Cache-Control": "private, no-store" } });

  try {
    const entries = await listSponsorDropboxFiles(slug);
    return NextResponse.json({ entries }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Dropbox folder could not be read. Try again later." }, { status: 502, headers: { "Cache-Control": "private, no-store" } });
  }
}

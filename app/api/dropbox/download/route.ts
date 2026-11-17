import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProjectAccess } from "@/lib/project-access";
import { getDropboxTemporaryLink, sponsorDropboxPath } from "@/lib/dropbox";

export async function GET(request: Request) {
  const session = await auth();
  const access = getProjectAccess(session?.user.email);
  if (!session?.user.email || !access) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });

  const params = new URL(request.url).searchParams;
  const slug = params.get("sponsor") ?? "";
  const path = params.get("path") ?? "";
  let folder: string;
  try { folder = sponsorDropboxPath(slug); }
  catch { return NextResponse.json({ error: "Unknown sponsor" }, { status: 400 }); }
  if (!path.startsWith(`${folder}/`) || path.includes("..")) return NextResponse.json({ error: "Invalid file path" }, { status: 400 });

  try {
    const link = await getDropboxTemporaryLink(path);
    const file = await fetch(link, { cache: "no-store" });
    if (!file.ok || !file.body) return NextResponse.json({ error: "Dropbox file is unavailable" }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
    const filename = path.split("/").pop() ?? "asset";
    return new Response(file.body, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": file.headers.get("Content-Type") ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Dropbox file is unavailable" }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProjectAccess } from "@/lib/project-access";
import { getDropboxAccessToken, sponsorDropboxPath } from "@/lib/dropbox";

const maxChunkBytes = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const session = await auth();
  const access = getProjectAccess(session?.user.email);
  if (!session?.user.email || !access || !["admin", "editor"].includes(access.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  }

  const params = new URL(request.url).searchParams;
  const action = params.get("action");
  let folder: string;
  try { folder = sponsorDropboxPath(params.get("sponsor") ?? ""); }
  catch { return NextResponse.json({ error: "Unknown sponsor" }, { status: 400 }); }
  const data = await request.arrayBuffer();
  if (data.byteLength > maxChunkBytes) return NextResponse.json({ error: "Upload chunk is too large" }, { status: 413 });
  const token = await getDropboxAccessToken().catch(() => null);
  if (!token) return NextResponse.json({ error: "Dropbox is not configured or authorization failed" }, { status: 503, headers: { "Cache-Control": "private, no-store" } });

  let endpoint: string;
  let args: Record<string, unknown>;
  if (action === "start") {
    const folderResponse = await fetch("https://api.dropboxapi.com/2/files/create_folder_v2", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ path: folder, autorename: false }),
      cache: "no-store",
    });
    if (!folderResponse.ok && folderResponse.status !== 409) {
      return NextResponse.json({ error: "Dropbox sponsor folder could not be created" }, { status: 502, headers: { "Cache-Control": "private, no-store" } });
    }
    endpoint = "https://content.dropboxapi.com/2/files/upload_session/start";
    args = { close: false };
  } else if (action === "append") {
    const sessionId = params.get("session");
    const offset = Number(params.get("offset"));
    if (!sessionId || !Number.isSafeInteger(offset) || offset < 0) return NextResponse.json({ error: "Invalid upload session" }, { status: 400 });
    endpoint = "https://content.dropboxapi.com/2/files/upload_session/append_v2";
    args = { cursor: { session_id: sessionId, offset }, close: false };
  } else if (action === "finish") {
    const sessionId = params.get("session");
    const offset = Number(params.get("offset"));
    const name = params.get("name")?.replace(/[\\/\u0000-\u001f]/g, "_").trim();
    if (!sessionId || !Number.isSafeInteger(offset) || offset < 0 || !name || name === "." || name === "..") return NextResponse.json({ error: "Invalid upload details" }, { status: 400 });
    endpoint = "https://content.dropboxapi.com/2/files/upload_session/finish";
    args = { cursor: { session_id: sessionId, offset }, commit: { path: `${folder}/${name}`, mode: "add", autorename: true, mute: true } };
  } else {
    return NextResponse.json({ error: "Unknown upload action" }, { status: 400 });
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Dropbox-API-Arg": JSON.stringify(args), "Content-Type": "application/octet-stream" },
      body: data,
      cache: "no-store",
    });
    if (!response.ok) return NextResponse.json({ error: "Dropbox rejected this upload chunk" }, { status: 502, headers: { "Cache-Control": "private, no-store" } });
    if (action === "start") {
      const result = await response.json() as { session_id?: string };
      return NextResponse.json({ sessionId: result.session_id }, { headers: { "Cache-Control": "private, no-store" } });
    }
    if (action === "finish") {
      const result = await response.json() as { path_display?: string; name?: string; size?: number };
      if (!result.path_display) return NextResponse.json({ error: "Dropbox did not return the saved file path" }, { status: 502 });
      return NextResponse.json({ path: result.path_display, name: result.name, size: result.size }, { headers: { "Cache-Control": "private, no-store" } });
    }
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ error: "Dropbox upload failed" }, { status: 502, headers: { "Cache-Control": "private, no-store" } });
  }
}

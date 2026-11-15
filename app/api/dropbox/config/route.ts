import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProjectAccess } from "@/lib/project-access";
import { isDropboxConfigured } from "@/lib/dropbox";

export async function GET() {
  const configured = isDropboxConfigured();
  if (!configured) {
    console.error("[dropbox-config] Credential presence", {
      appKey: Boolean(process.env.DROPBOX_APP_KEY),
      appSecret: Boolean(process.env.DROPBOX_APP_SECRET),
      refreshToken: Boolean(process.env.DROPBOX_REFRESH_TOKEN),
    });
  }
  const session = await auth();
  const access = getProjectAccess(session?.user.email);
  if (!session?.user.email || !access || !["admin", "editor"].includes(access.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  }
  return NextResponse.json({ configured }, { headers: { "Cache-Control": "private, no-store" } });
}

import { projectSponsors } from "@/lib/sponsors";

const appKey = process.env.DROPBOX_APP_KEY;
const appSecret = process.env.DROPBOX_APP_SECRET;
const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
let cachedToken: string | null = null;
let cachedTokenUntil = 0;

export function isDropboxConfigured() {
  return Boolean(appKey && appSecret && refreshToken);
}

export function sponsorDropboxPath(slug: string) {
  if (!projectSponsors.some((sponsor) => sponsor.slug === slug)) throw new Error("Unknown sponsor");
  return `/Sponsor Files/${slug}`;
}

export type DropboxSponsorFile = { id: string; name: string; path: string; size: number; serverModified?: string };

export async function listSponsorDropboxFiles(slug: string): Promise<DropboxSponsorFile[]> {
  const folder = sponsorDropboxPath(slug);
  const token = await getDropboxAccessToken();
  const files: DropboxSponsorFile[] = [];
  let cursor: string | undefined;
  let hasMore = false;
  do {
    const endpoint = cursor
      ? "https://api.dropboxapi.com/2/files/list_folder/continue"
      : "https://api.dropboxapi.com/2/files/list_folder";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(cursor ? { cursor } : { path: folder, recursive: true, include_deleted: false, limit: 2000 }),
      cache: "no-store",
    });
    if (!response.ok) {
      if (!cursor && response.status === 409) {
        const error = await response.json().catch(() => ({})) as { error_summary?: string };
        if (error.error_summary?.includes("path/not_found")) return [];
      }
      throw new Error("Dropbox folder could not be read");
    }
    const result = await response.json() as {
      entries?: Array<{ ".tag"?: string; id?: string; name?: string; path_display?: string; size?: number; server_modified?: string }>;
      cursor?: string;
      has_more?: boolean;
    };
    for (const entry of result.entries ?? []) {
      if (entry[".tag"] !== "file" || !entry.name || !entry.path_display) continue;
      files.push({ id: entry.id ?? entry.path_display, name: entry.name, path: entry.path_display, size: entry.size ?? 0, serverModified: entry.server_modified });
    }
    cursor = result.cursor;
    hasMore = Boolean(result.has_more);
    if (hasMore && !cursor) throw new Error("Dropbox returned an incomplete folder listing");
  } while (hasMore);
  return files;
}

export async function getDropboxAccessToken(): Promise<string> {
  if (!appKey || !appSecret || !refreshToken) throw new Error("Dropbox is not configured");
  if (cachedToken && Date.now() < cachedTokenUntil) return cachedToken;
  const basic = Buffer.from(`${appKey}:${appSecret}`).toString("base64");
  const response = await fetch("https://api.dropbox.com/oauth2/token", {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Dropbox authorization failed");
  const payload = await response.json() as { access_token?: string };
  if (!payload.access_token) throw new Error("Dropbox did not return an access token");
  cachedToken = payload.access_token;
  cachedTokenUntil = Date.now() + 3_000_000;
  return cachedToken;
}

export async function getDropboxTemporaryLink(path: string): Promise<string> {
  const token = await getDropboxAccessToken();
  const response = await fetch("https://api.dropboxapi.com/2/files/get_temporary_link", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ path }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Dropbox file link is unavailable");
  const payload = await response.json() as { link?: string };
  if (!payload.link) throw new Error("Dropbox did not return a file link");
  return payload.link;
}

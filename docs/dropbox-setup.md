# Dropbox sponsor uploads

The sponsor workspace sends selected files to Dropbox in resumable 4 MiB chunks. Files go under `Sponsor Files/<sponsor slug>` in the Dropbox app folder. The app stores file metadata and the private Dropbox path in the sponsor record; it does not embed large file contents in the ZIP export.

## Dropbox app setup

1. Create a Dropbox API app with **Scoped access** and **App folder** access. Keep the app private to the organization.
2. Enable the `files.content.read` and `files.content.write` scopes, then submit the permission changes.
3. Register `http://localhost:53682/callback` as an OAuth redirect URI in the Dropbox app settings.
4. From this project's directory, run `node scripts/dropbox-refresh-token.mjs --configure-vercel` in a terminal. Enter the app key and secret when prompted, then open the printed Dropbox authorization URL. After you approve access, the helper adds all three credentials as sensitive Vercel Production variables.
5. Redeploy the production project after the helper finishes. Keep the app secret and refresh token server-side; never add them to `NEXT_PUBLIC_*` variables or commit them.

The helper script issues a refresh token through Dropbox OAuth with offline access (`token_access_type=offline`) and sends it directly to Vercel as a sensitive variable. The runtime exchanges it for a short-lived access token when an editor or admin starts an upload. The upload UI remains disabled until all three variables are present.

## Access model

The Dropbox app folder is private to the connected Dropbox account. Only signed-in project editors and admins can upload or request an open link through the app. Dropbox temporary links expire after four hours; anyone who receives a temporary link can use it while it is valid. The sponsor workspace does not create permanent shared links.

If the Dropbox app is reauthorized, revoked, or its scopes change, update the environment values and redeploy. Existing metadata continues to point to the Dropbox paths.

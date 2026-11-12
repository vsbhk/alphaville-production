# prod.alphaville.hk

Private production workspace for Alphaville client projects.

## What's on the site

### Pages
- **Sign-in page** (`/`) - Opens the private workspace with the owner’s Alphaville Google account.
- **Project overview** (`/p/hkdw-2027`) - Shows the project action points, filming period, daily activity plan, event calendar and interview slot for personal reference.
- **Sponsors** (`/p/hkdw-2027/sponsors`) - Shows the source roster and a drag-and-drop intake preview for sponsor material, including a Google Drive path for large files.
- **Sponsor workspaces** (`/p/hkdw-2027/sponsors/{sponsor}`) - Separate page paths for each source-roster sponsor. The personal workspace owner can manage links and approval notes stored in Google Sheets. Sponsor folders are not connected or shared by this personal tool.
- **ICARUS production brief** (`/p/hkdw-2027/providers/icarus`) - Preview of provider-facing production information, with filming windows held for coordinator input, the single approval lifecycle, a safe venue-access reference, and the public media publication cadence.
- **Deliverables** (`/p/hkdw-2027/deliverables`) - Contract recap for video production and distribution, with relative deadlines and separate provider assignments for ICARUS Sports, Kevin Rio and Takumi Images. Checklist status is wired to shared Google Sheets storage, with browser-only fallback until the sheet is configured.

### Shared elements
- **Header** - Alphaville wordmark and private workspace label.
- **Footer** - prod.alphaville.hk identity.
- **Project label** - HKDW 2027 - Royal Hong Kong Yacht Club.

## Recent changes
- 12 November 2026: Restricted website access to the personal Alphaville owner account. Collaborator and sponsor access was removed from the app allowlist; no collaborator notifications or Drive folder grants were made.
- 12 November 2026: Added an environment-variable example and corrected workspace notes to distinguish completed role checks and shared-record wiring from the Google Sheet and sponsor-specific records still needed. Confirmed that Google OAuth variables are present in Vercel Production; end-to-end sign-in still needs verification. Updated sponsor and deliverables page messages to match the current code.
- 12 November 2026: Added an explicit authenticated role gate for project routes. Alphaville editors can manage the planner and intake; project viewers are read-only; sponsor viewers are limited to their assigned sponsor path. Google OAuth and external password sign-in now show as unavailable until Vercel credentials and external password hashes are configured.
- 12 November 2026: Removed the stale Supabase data client from planner persistence. The planner now reports that shared Google Workspace storage is not configured instead of attempting writes to Supabase.
- 12 November 2026: Deployed the access-control update to the Vercel production project. Sign-in remains inactive until OAuth credentials are configured in Vercel.
- 12 November 2026: Added a server-only Google Sheets data adapter and authenticated API with role-based read/write checks. Production uses keyless Vercel OIDC with a Google service account limited to the project sheet; configure the project’s workload identity and Vercel environment values to activate it.
- 12 November 2026: Connected each sponsor workspace to its sponsor-scoped shared record. Editors can save material links, notes and approval state; sponsor viewers can only read their assigned sponsor record. Actual file upload and sponsor-submitted changes remain unimplemented.
- 12 November 2026: Added alpha@alphaville.hk as an explicitly approved Alphaville editor. Google sign-in verifies the alphaville.hk Workspace domain; production OAuth credentials still need configuration in Vercel.
- 12 November 2026: Began replacing Supabase-only sign-in with Google Workspace sign-in for Alphaville and individual password sign-in for approved external viewers. Credentials and Google OAuth settings are not configured; Google Drive/Sheets storage and role enforcement are still incomplete.
- 12 November 2026: Added Supabase email-link sign-in plumbing, a callback route, and server-side protection for project pages. Live sign-in remains disabled until Supabase credentials and approved-user settings are configured.
- 12 November 2026: Added a Supabase SQL schema for project membership and shared workspace records, with row-level policies. The production calendar now loads and saves the shared record when the database schema and membership are configured; browser storage remains a fallback.
- 12 November 2026: Recorded Koko Mueller and Wincy Hon as intended read-only external project viewers. This is an access-list entry only; no account is active until authentication is implemented and configured.
- 12 November 2026: Recorded Bram van Olphen as an intended read-only viewer for the Central Oceans sponsor workspace only. This is an access-list entry; it is not active until authentication and sponsor-level access enforcement are implemented.
- 12 November 2026: Added the supplied RHKYC and ICARUS email addresses as intended read-only project viewers. All external access remains inactive until authentication and server-side role enforcement are implemented.
- 12 November 2026: Enforced the 30-file sponsor intake cap in the browser preview, added per-sponsor staged counts, made it possible to extend the production calendar earlier as well as later, and clarified that delivery statuses are local to this browser.
- 12 November 2026: Replaced the starter page with the production workspace sign-in screen and the project identity from the build brief. The email sign-in service is not connected in this preview.
- 12 November 2026: Added a provider production-brief preview using the new project route pattern. It contains no migrated sponsor records or sign-in protection yet; unknown filming windows and meeting points remain unconfirmed.
- 12 November 2026: Added the deliverables page from the supplied contract recap. Relative deadlines are preserved, while unspecified owners, rounds, destinations and current statuses are left unrecorded.
- 12 November 2026: Separated ICARUS Sports’ video production assignment from Kevin Rio’s daily recap assignment; Takumi Images remains a distinct photography provider.
- 12 November 2026: Added project overview, task and calendar information, a project contact directory, sponsor roster, drag-and-drop intake, and project navigation. Sponsor uploads and project privacy remain preview-only until authentication and storage are connected.
- 12 November 2026: Added a separate sponsor workspace preview for each of the nine roster names, linked from the directory. No sponsor materials or review data are loaded on these routes.
- 12 November 2026: Recorded the confirmed filming period as Tuesday 17 to Sunday 29 November 2026. Per-day times and meeting points remain unconfirmed.
- 12 November 2026: Added the daily 09:00–21:00 HKT filming window and an editable day planner for activities, responsible teams, task times and agreed meeting points. Changes remain local to the preview until storage is connected.
- 12 November 2026: Added an action point for connecting the Alphaville email account to sponsor intake. Email access is not connected in this preview.

## Quick guide
- To change the displayed project name, update the project labels in `app/page.tsx`.
- To change the page colors, update the color values near the top of `app/globals.css`.
- To add a page, create a folder under `app` with a `page.tsx` file inside it.
- For local or Vercel configuration, use `.env.example` as the variable checklist. Add `https://prod.alphaville.hk/api/auth/callback/google` to the Google OAuth client’s authorized redirect URIs and set `AUTH_URL` to `https://prod.alphaville.hk`.

## Remaining setup
- Verify Google sign-in end to end with alpha@alphaville.hk. Vercel now reports the OAuth provider as configured.
- The production Google Sheets adapter uses Vercel OIDC workload identity and the project data sheet is shared with the service account. The app creates a `Project Data` tab on first use.
- Enter the production bookings, responsible teams and meeting points for 17–29 November 2026. Confirm Jerry Tam’s interview time and meeting point on 22 November.
- Direct Drive uploads are intentionally not enabled in the personal workspace. Add or open Drive links while signed in to your own Google account.
- Add delivery owners, review history, destinations and actual delivery dates to the shared deliverables workflow.

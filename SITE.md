# prod.alphaville.hk

Private production workspace for Alphaville client projects.

## What's on the site

### Pages
- **Sign-in page** (`/`) - Identifies the private workspace and the HKDW 2027 project, then asks visitors for their approved email address.
- **Project overview** (`/p/hkdw-2027`) - Shows open action points, the confirmed filming period and daily 09:00–21:00 HKT window from 17–29 November 2026, an editable day-by-day plan preview, the published event calendar, the interview slot that needs time and meeting-point confirmation, and a project-specific contact directory.
- **Sponsors** (`/p/hkdw-2027/sponsors`) - Shows the source roster and a drag-and-drop intake preview for sponsor material, including a Google Drive path for large files.
- **Sponsor workspaces** (`/p/hkdw-2027/sponsors/{sponsor}`) - Separate page paths for each source-roster sponsor. Each page is an empty review preview until authentication and project-scoped records are connected.
- **ICARUS production brief** (`/p/hkdw-2027/providers/icarus`) - Preview of provider-facing production information, with filming windows held for coordinator input, the single approval lifecycle, a safe venue-access reference, and the public media publication cadence.
- **Deliverables** (`/p/hkdw-2027/deliverables`) - Contract recap for video production and distribution, with relative deadlines and separate provider assignments for ICARUS Sports, Kevin Rio and Takumi Images. Operational delivery tracking is not connected in this preview.

### Shared elements
- **Header** - Alphaville wordmark and private workspace label.
- **Footer** - prod.alphaville.hk identity.
- **Project label** - HKDW 2027 - Royal Hong Kong Yacht Club.

## Recent changes
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

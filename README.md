# Staff Evaluation System

A web-based employee performance evaluation platform for Better Practice Consulting Inc. The system supports authenticated staff evaluation, role-based access, real-time progress tracking, dashboard analytics, archived history, staff exemptions, administrative controls, and export/printing workflows.

## Current Status

**Active development branch:** `refactor/separate-files`

The project has moved beyond the original single-file prototype and now uses separated HTML, CSS, and JavaScript modules. The main evaluation workflow, dashboard, history, account controls, current-round progress, staff administration, and exemption workflow are already implemented and are being refined for mobile usability, theme consistency, and round-specific history behavior.

## Core Workflow

1. A staff member signs in using their assigned account.
2. The evaluator selects a colleague from the active roster.
3. Scores and remarks are automatically saved as a draft while the evaluator is working.
4. A completed evaluation can be submitted.
5. Submitted evaluations are locked.
6. Authorized reviewers can monitor progress, review results, add an overall summary, and make permitted corrections.
7. After the required submissions are complete, an authorized reviewer can finalize the evaluation.
8. Finalized evaluations are archived in **Evaluation History**.
9. A new live round can then begin.

Multiple staff members can evaluate at the same time. Supabase stores the evaluation rows and Realtime updates allow progress and reviewer views to refresh while evaluations are being completed.

## Access Levels

### Probationary Staff

- Can sign in
- Can evaluate assigned colleagues
- Can save drafts automatically
- Can submit completed evaluations
- Does not receive administrative controls

### Junior Staff

- Includes normal evaluation access
- Can view **Evaluation Results**
- Can view **Evaluation History**
- Does not receive destructive or administrative controls

### Senior Staff

- Includes normal evaluation access
- Can review evaluation results
- Can view history and dashboard details
- Can manage eligible staff records
- Can manage current-round exemptions
- Can finalize completed evaluations
- Can print and export authorized results

### Manager

- Full reviewer and administrative access
- Can manage user accounts
- Can add and remove staff
- Can change staff evaluation roles
- Can review and correct evaluation data
- Can manage exemptions
- Can finalize rounds
- Can print and export results
- Can perform authorized history deletion actions

Frontend visibility is not treated as the only security layer. Administrative and protected operations are expected to remain enforced by Supabase Row-Level Security and server-side functions.

## Evaluation Features

### Draft Saving

Evaluation scores and comments are saved automatically while the evaluator is working.

A live draft uses:

```text
archived = false
locked = false
```

### Submitted Evaluations

A completed submission uses:

```text
archived = false
locked = true
```

Submitted rows are included in completion tracking and reviewer progress.

### Finalized / Archived Evaluations

When an authorized reviewer finalizes a completed evaluation round, its rows are moved into archived history.

Archived records use:

```text
archived = true
archived_at = <finalization timestamp>
```

Archived evaluations are read-only in the normal History view, but authorized users can still print or export them.

## Staff Exemptions

The system includes a **current-round staff exemption** feature for employees who should not participate in a specific evaluation round.

Examples include:

- Leave
- Absence
- Maternity / Paternity leave
- Other recorded reasons

When a staff member is exempted:

- They are excluded as an evaluatee for the active round.
- They are excluded as a required evaluator for the active round.
- Their exemption reason is stored.
- Existing evaluation data is not deleted.
- Previous archived evaluation history is preserved.
- Their identity remains available so older History records do not become `Unknown`.
- Their current-round exemption can later be restored.

The exemption system is intended to affect **only the specific active round**, not older finalized rounds.

## Evaluation Results

Authorized reviewers can open the current **Evaluation Results** section to see live submission status for each employee.

The results view includes:

- Employee name
- Submitted evaluator count
- Expected evaluator count
- Completion progress
- Current-round exemption state
- Exemption reason where applicable

An exempted staff member remains visible in the current-round results context but is not treated as a required participant.

## Evaluation History

Finalized evaluation rounds are grouped by evaluation date.

History currently supports:

- Archived employee evaluations
- Archived evaluator scores
- Archived evaluator remarks
- Manager / Senior Staff overall comments
- Average scores
- Print and export from archived records
- Individual history deletion for authorized users
- Whole-day history deletion for authorized users
- Preservation of staff names even if the current-round roster is filtered
- Display of staff who were exempted for the affected archived evaluation date
- Exemption reason display
- Non-clickable exemption-only history entries when no evaluation exists for that staff member

An exempted History entry is informational only. It does not create a fake evaluation score and does not affect historical averages.

## Dashboard

The Performance Dashboard provides a high-level view of current and historical performance.

### Summary Cards

The dashboard includes:

- **Top Performer · Latest Evaluation**
- **Best Overall Performer**
- **Team Average**
- **Current Round Progress**

### Ranking and Performance Views

The dashboard also includes:

- Last Evaluation Ranking
- Overall Ranking
- Team Performance trend
- Recent Evaluations
- Detailed performer records
- Team Average details and graph
- Current Round Progress detail view
- Current Round Progress drilldown

### Recent Evaluations

Recent activity can show:

- Evaluator
- Employee being evaluated
- Draft activity
- Criteria completed
- Percentage progress
- Submission state
- Comment state
- Latest update time

Supabase Realtime is used to keep current evaluation activity and progress synchronized.

## Current Round Progress

The current-round progress system tracks expected evaluator-to-employee assignments.

It distinguishes between:

- Not started
- Evaluating
- Submitted / completed
- Exempted

Exempted staff are removed from the required participant counts for the current round.

A drilldown view provides more detail about the expected assignments and completion status.

## Staff Administration

Authorized users have access to staff administration tools.

Current controls include:

- Add staff
- Remove staff
- Set evaluation form role
- Manage sign-in access where permitted
- View staff roster
- Open staff profiles
- Manage current-round exemptions

The Add Staff interface uses custom responsive dropdown controls with theme-aware styling.

## Account Settings

Users can manage their own account through the Settings interface.

Current account features include:

- Profile picture
- Remove profile picture
- Change password
- Theme / appearance controls

Profile pictures are stored through Supabase Storage.

## Appearance and Themes

The site supports appearance customization and UI refinements for:

- Light mode
- Dark mode
- AMOLED mode

Theme handling covers the dashboard, evaluation form, account settings, staff administration, dropdowns, exemption controls, history, and other interactive components.

## Mobile Support

The application has dedicated mobile behavior and responsive fixes, including:

- Responsive dashboard layout
- Mobile evaluation layout
- Mobile account settings
- Mobile staff profile popup
- Mobile team-average graph containment
- Responsive exemption management
- Responsive current-round progress
- Sidebar / drawer behavior
- Smart scrolling header behavior
- Touch-friendly controls

Mobile behavior continues to be actively refined as new site features are added.

## Printing and Export

Authorized reviewers can generate final evaluation outputs through:

- Print
- PDF export
- Word export

Final document actions are intended for completed, reviewable evaluation records.

Archived History records remain available for later printing and export.

## Technology Stack

### Frontend

- HTML5
- CSS3
- JavaScript
- ES modules
- Responsive web design

### Backend / Services

- Supabase Authentication
- Supabase PostgreSQL
- Supabase Row-Level Security
- Supabase Realtime
- Supabase Storage
- Supabase Edge Functions

### Hosting / Source Control

- GitHub
- GitHub Pages

## Supabase Data

### `profiles`

Stores staff identity, role, and evaluation-form information.

Important fields include:

- `id`
- `full_name`
- `position`
- `role`
- `form_role`

### `evaluations`

Stores live drafts, submitted evaluations, and archived history.

Important fields include:

- `id`
- `employee_id`
- `evaluator_id`
- `scores`
- `average`
- `comments`
- `created_at`
- `form_role`
- `locked`
- `updated_at`
- `archived`
- `archived_at`
- `archived_by`
- `round`
- `manager_summary`

The live system allows one active evaluator/employee pair while archived rounds remain preserved as historical records.

### `evaluation_round_exemptions`

Stores current-round staff exemptions and their audit trail.

Important fields include:

- `id`
- `staff_id`
- `reason`
- `active`
- `exempted_by`
- `exempted_at`
- `restored_by`
- `restored_at`

## Project Structure

The project is now modular. The structure below highlights the files that currently carry the main application features.

```text
staff_evaluation/
├── .github/
├── assets/
├── css/
│   ├── index.css
│   ├── dashboard.css
│   ├── mobile-layout-tweaks.css
│   ├── session-loader.css
│   ├── add-staff-modal.css
│   ├── account-settings.css
│   ├── global-motion.css
│   ├── staff-profile-popup.css
│   ├── one-at-a-time-theme-fix.css
│   ├── team-average-mobile-graph-fix.css
│   ├── smart-scroll-header.css
│   ├── history-day-delete.css
│   └── exemption-*.css
├── js/
│   ├── evaluation.js
│   ├── supabase.js
│   ├── dashboard-loader.js
│   ├── dashboard-detail-enhancements.js
│   ├── current-round-progress.js
│   ├── current-round-progress-drilldown.js
│   ├── round-exemptions.js
│   ├── round-exemption-history-isolation.js
│   ├── history-day-delete.js
│   ├── history-exempted-entries.js
│   ├── performer-records-popup.js
│   ├── staff-profile-popup.js
│   ├── account-settings.js
│   ├── account-appearance.js
│   ├── add-staff-modal.js
│   ├── add-staff-dropdown-sync.js
│   ├── global-motion.js
│   ├── site-appearance-overhaul.js
│   └── smart-scroll-header.js
├── index.html
├── login.html
├── Final_index.html
├── index-backup.html
└── README.md
```

## Important Files

| File | Purpose |
|---|---|
| `index.html` | Main application shell, dashboard, evaluation form, sidebar, and modals |
| `login.html` | Authentication page |
| `js/evaluation.js` | Evaluation form, criteria, score handling, print/export support |
| `js/supabase.js` | Authentication, roster, evaluation persistence, autosave, review, archiving, History, Realtime |
| `js/current-round-progress.js` | Current-round progress summary and detail interface |
| `js/current-round-progress-drilldown.js` | Detailed evaluator assignment progress |
| `js/round-exemptions.js` | Current-round staff exemptions and eligibility filtering |
| `js/round-exemption-history-isolation.js` | Keeps current exemptions from removing identities needed by previous History |
| `js/history-exempted-entries.js` | Adds informational exemption entries to the affected History date |
| `js/history-day-delete.js` | Authorized deletion of all archived evaluations for one History date |
| `js/dashboard-detail-enhancements.js` | Detailed dashboard analytics, charts, and extended views |
| `js/account-settings.js` | Profile picture and password settings |
| `js/account-appearance.js` | Appearance/theme management |
| `js/staff-profile-popup.js` | Staff profile detail popup |
| `css/index.css` | Core application and evaluation styling |
| `css/dashboard.css` | Main dashboard styling |
| `css/mobile-layout-tweaks.css` | Mobile layout refinements |
| `css/smart-scroll-header.css` | Sticky/smart header behavior |
| `css/history-day-delete.css` | Whole-day History deletion controls |

## Security Notes

- Never expose a Supabase `service_role` key in browser code.
- The frontend should use only the publishable / anon key.
- Keep Row-Level Security enabled on protected tables.
- Administrative operations should remain protected by server-side authorization.
- Edge Functions should verify the signed-in user's role before performing privileged actions.
- Hidden controls are a user-interface convenience, not a security boundary.

## Running Locally

The frontend should be served through HTTP rather than opened directly with `file://`.

Example:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## GitHub Pages

The live static site is deployed through GitHub Pages from the active development/deployment branch:

```text
refactor/separate-files
```

The deployment must include at minimum:

```text
index.html
login.html
css/
js/
assets/
```

The project uses version query strings on many CSS and JavaScript files to reduce stale browser-cache issues after updates.

## Development Notes

The application was originally built as a large combined implementation and has since been refactored into smaller feature-specific modules.

Legacy / backup files remain available for recovery and comparison:

```text
Final_index.html
index-backup.html
```

When adding a new feature:

1. Preserve the existing evaluation workflow.
2. Preserve current role permissions.
3. Do not let current-round filters modify archived history.
4. Keep mobile behavior in mind.
5. Verify Light, Dark, and AMOLED modes.
6. Preserve script loading order where modules depend on functions created by earlier scripts.
7. Keep Supabase authorization rules as the source of truth for protected actions.

## Current Development Focus

Recent development has focused on:

- Current-round staff exemptions
- Round-specific exemption handling
- Preserving archived History while staff are exempted
- Showing exemption reasons in History
- Whole-day History deletion
- Preventing `Unknown` names in archived records
- Mobile chart and evaluation-layout fixes
- Theme consistency across Light, Dark, and AMOLED
- Responsive Staff Administration
- Smart header and sidebar behavior
- Improving dashboard detail views and current-round monitoring

## Repository

```text
FetzCriey/staff_evaluation
```

## Branch

```text
refactor/separate-files
```

## Project State

The core system is functional and under active refinement. Current work is primarily focused on making round behavior, History, exemptions, mobile interaction, and appearance handling consistent across the full application.

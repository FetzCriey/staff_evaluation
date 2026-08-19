# Staff Evaluation System

A web-based employee performance evaluation system with authentication, role-based access, real-time evaluation progress, dashboard analytics, review tools, history, and export functionality.

## Overview

The Staff Evaluation System allows employees to evaluate their colleagues while giving authorized reviewers access to submitted evaluations, progress monitoring, historical records, rankings, and team performance summaries.

The application uses a static frontend hosted through GitHub Pages and Supabase for authentication, database storage, row-level security, and real-time updates.

## Main Features

- Secure login using Supabase Authentication
- Role-based access for:
  - Probationary
  - Junior Staff
  - Senior Staff
  - Manager
- Employee-to-employee evaluation
- Automatic draft saving
- Submitted evaluation locking
- Reviewer preview of submitted evaluations
- Individual evaluator remarks
- Manager summary
- Evaluation history
- Finalized evaluation rounds
- PDF / print / export workflow
- Dashboard analytics
- Team rankings
- Overall rankings
- Team average
- Current round progress
- Performance trend
- Real-time Recent Evaluations
- Draft / submitted status
- Evaluation score progress
- Comment status
- Responsive desktop and mobile dashboard
- Mobile 2 × 2 dashboard summary cards
- Animated Dashboard ↔ Evaluation Form transitions

## Recent Evaluations

The dashboard shows live evaluation activity including:

- Evaluator name
- Employee being evaluated
- Number of criteria scored
- Percentage completed
- Saved Draft status
- Submitted status
- Commented / No Comment status
- Last update time

The section is designed to display the five most recent entries first, with a **Show More** / **Show Less** control for additional activity.

## Technology

- HTML5
- CSS3
- JavaScript
- Supabase
  - Authentication
  - PostgreSQL
  - Row-Level Security
  - Realtime
  - Edge Functions
- GitHub
- GitHub Pages

## Project Structure

```text
staff_evaluation/
├── .github/
├── css/
│   ├── dashboard.css
│   └── index.css
├── js/
│   ├── dashboard.js
│   ├── evaluation.js
│   └── supabase.js
├── tests/
├── 123.png
├── Final_index.html
├── index-backup.html
├── index.html
└── login.html
```

### Important Files

| File | Purpose |
|---|---|
| `index.html` | Main dashboard and evaluation application |
| `login.html` | User authentication page |
| `Final_index.html` | Evaluation-page fallback / alternate version |
| `index-backup.html` | Backup of the original combined implementation |
| `css/index.css` | Main evaluation and application styling |
| `css/dashboard.css` | Dashboard-specific and responsive styling |
| `js/evaluation.js` | Evaluation form logic and scoring |
| `js/supabase.js` | Authentication, database, reviewer functions, autosave, and Realtime |
| `js/dashboard.js` | Dashboard analytics, recent activity, and dashboard interaction |

## Supabase

The application relies on Supabase for persistent data and authentication.

Primary tables include:

### `profiles`

Stores employee profile and access information.

Typical fields include:

- `id`
- `full_name`
- `position`
- `role`
- `form_role`

### `evaluations`

Stores evaluation drafts, submissions, and historical records.

Important fields include:

- `id`
- `employee_id`
- `evaluator_id`
- `scores`
- `average`
- `comments`
- `form_role`
- `locked`
- `updated_at`
- `archived`
- `archived_at`
- `archived_by`
- `round`
- `manager_summary`

## Evaluation Status

### Saved Draft

An evaluation is considered a draft when:

```text
locked = false
```

Scores and comments may continue to autosave while the evaluator is working.

### Submitted

An evaluation is considered submitted when:

```text
locked = true
```

Submitted evaluations are included in reviewer progress and completion tracking.

### Archived

When a completed evaluation round is finalized, its records are archived and preserved in Evaluation History.

## Real-Time Updates

Supabase Realtime is used for changes to the `evaluations` table.

The application can automatically refresh:

- Evaluation Results
- Reviewer progress
- Recent Evaluations
- Draft progress
- Submission status
- Comments
- Current round completion

The dashboard uses the authenticated Realtime flow handled by `js/supabase.js` instead of maintaining a separate duplicate Realtime connection.

## Dashboard

Authorized reviewers can view:

### Latest Top Performer

Uses the latest finalized evaluation results.

### Best Overall Performer

Uses finalized evaluation history across rounds.

### Team Average

Shows the team's finalized performance average.

### Current Round Progress

Shows how many expected evaluator-to-employee submissions have been completed.

### Last Evaluation Ranking

Ranks employees using their most recent finalized evaluation.

### Overall Ranking

Ranks employees using their finalized historical averages.

### Performance Trend

Displays historical finalized performance over time.

### Recent Evaluations

Displays current evaluation activity and progress in real time.

## Access Levels

### Probationary

- Can complete evaluations
- Limited access to team evaluation data

### Junior Staff

- Can complete evaluations
- Can view Evaluation Results and History

### Senior Staff

- Can complete evaluations
- Can review evaluations
- Can manage eligible employee records
- Can finalize evaluations

### Manager

- Full reviewer and administrative access
- Can manage users
- Can review and correct evaluations
- Can finalize rounds
- Can export and print results

Actual permissions are enforced by Supabase policies and server-side functions, not only by hidden frontend controls.

## Running Locally

Because this is a static frontend, you can run it using any local HTTP server.

Example using Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

Opening the files directly with `file://` is not recommended because module scripts and authentication behavior may not work correctly.

## GitHub Pages

The project can be hosted directly with GitHub Pages.

Make sure GitHub Pages is configured to serve the branch containing:

```text
index.html
login.html
css/
js/
```

After updating CSS or JavaScript, a hard refresh may be needed if the browser has cached the previous version.

## Security Notes

- Never place a Supabase `service_role` key in frontend code.
- Only a Supabase publishable / anon key should be used in the browser.
- Administrative operations should remain behind authenticated Edge Functions.
- Row-Level Security should remain enabled for protected tables.
- Do not rely on hidden buttons or frontend role checks as the only security layer.

## Development Notes

The application was refactored from a large single-file version into separated HTML, CSS, and JavaScript files.

The backup implementation remains available in:

```text
index-backup.html
```

When editing the application, preserve the script loading order required by the evaluation and Supabase modules.

## Current Development Branch

```text
refactor/separate-files
```

## Repository

```text
FetzCriey/staff_evaluation
```

## Status

The project is under active development. Current work includes improving:

- Real-time dashboard synchronization
- Mobile dashboard usability
- Compact Recent Evaluations display
- Evaluation workflow
- Reviewer experience
- Performance analytics

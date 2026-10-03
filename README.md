# Staff Evaluation System

A database-backed web application for structured staff performance reviews. The system supports authenticated access, evaluator scoring, comments, saved evaluation records, history/review workflows, and manager-facing controls.

## Why I built it

Staff evaluations need a consistent process for selecting the person being reviewed, recording scores and comments, saving the evaluation, and reviewing stored records. This project turns that workflow into a browser-based application backed by Supabase.

## Key features

- Authentication and protected evaluation access
- Staff/evaluator selection
- Criteria-based scoring with validation
- Comments and saved evaluation records
- Evaluation history/review workflow
- Manager controls
- Supabase-backed data storage
- Automated load testing for the site, autosave writes, and Supabase Realtime behavior

## Tech stack

- HTML
- CSS
- JavaScript
- Supabase
- k6 for load testing
- GitHub Actions for test workflows

## Application flow

1. Sign in.
2. Select the staff member/evaluator.
3. Score the evaluation criteria.
4. Add comments.
5. Save the evaluation.
6. Review stored records/history.

## Testing

The repository includes k6-based tests and GitHub Actions workflows for:

- General load testing
- Supabase autosave load testing
- Supabase Realtime load testing

Relevant files include:

- `tests/supabase-autosave-load-test.js`
- `tests/supabase-realtime-load-test.js`
- `.github/workflows/k6-load-test.yml`
- `.github/workflows/supabase-autosave-load-test.yml`
- `.github/workflows/supabase-realtime-load-test.yml`

The Supabase-specific tests require the appropriate project configuration/secrets. Do not commit private credentials to the repository.

## Demo access

The application requires sign-in, so there is no unrestricted public demo account. The source and test scripts are public so the implementation can still be reviewed.

## My work

I built the interface and evaluation workflow, connected the application to Supabase, and added automated site, autosave, and Realtime load-test coverage.

## Portfolio

See the project in context on my portfolio: https://mark-ian-portfolio.vercel.app/#work

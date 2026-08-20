/* =========================================================
   RECENT EVALUATIONS → EXISTING RESULTS VIEW
   Manager / Senior Staff only.

   This does not create a second review flow. It finds the same
   Evaluation Results row already built by js/supabase.js and
   triggers that existing row, preserving all current safeguards.
   ========================================================= */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://giosjwjhalhmwcuyzfos.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_";
const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const recent = document.getElementById('recentActivity');
let canOpenResults = false;

const normalize = value => String(value || '')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim();

function ensureStyles(){
  if(document.getElementById('recent-evaluation-results-link-style')) return;

  const style = document.createElement('style');
  style.id = 'recent-evaluation-results-link-style';
  style.textContent = `
    .dash-live-eval-row.recent-review-link{
      cursor:pointer;
      border-radius:10px;
      transition:
        background-color .15s ease,
        box-shadow .15s ease,
        transform .12s ease;
    }

    .dash-live-eval-row.recent-review-link:hover{
      background:#f4fafd;
      box-shadow:inset 0 0 0 1px #d7e9f3;
    }

    .dash-live-eval-row.recent-review-link:active{
      transform:scale(.997);
    }

    .dash-live-eval-row.recent-review-link:focus-visible{
      outline:3px solid rgba(21,172,227,.20);
      outline-offset:2px;
    }
  `;
  document.head.appendChild(style);
}

function decorateRows(){
  if(!recent) return;

  recent.querySelectorAll('.dash-live-eval-row').forEach(row => {
    row.classList.toggle('recent-review-link', canOpenResults);

    if(!canOpenResults){
      row.removeAttribute('role');
      row.removeAttribute('tabindex');
      row.removeAttribute('aria-label');
      row.removeAttribute('title');
      return;
    }

    const employee =
      row.querySelector('.dash-live-employee')?.textContent?.trim() || '';

    row.setAttribute('role', 'button');
    row.setAttribute('tabindex', '0');

    if(employee){
      row.setAttribute(
        'aria-label',
        `Open evaluation results for ${employee}`
      );
      row.title = `Open ${employee}'s evaluation results`;
    }
  });
}

function matchingResultsRow(employeeName){
  const wanted = normalize(employeeName);
  if(!wanted) return null;

  return [...document.querySelectorAll('#resList .res-row')]
    .find(row => normalize(row.querySelector('.res-nm')?.textContent) === wanted)
    || null;
}

async function waitForResultsRow(employeeName, timeout=1800){
  const started = Date.now();

  while(Date.now() - started < timeout){
    const row = matchingResultsRow(employeeName);
    if(row) return row;
    await new Promise(resolve => setTimeout(resolve, 80));
  }

  return null;
}

async function openEmployeeResults(row){
  if(!canOpenResults || !row) return;

  const employeeName =
    row.querySelector('.dash-live-employee')?.textContent?.trim();

  if(!employeeName) return;

  // Supabase.js builds #resList for reviewers. Triggering that exact row calls
  // its existing openResults(pid, name) logic. dashboard.js already has a
  // capture listener that switches from Dashboard to the Evaluation form.
  const resultRow = await waitForResultsRow(employeeName);

  if(!resultRow){
    if(typeof window.uiAlert === 'function'){
      await window.uiAlert(
        'Results not ready',
        `Could not open ${employeeName}'s evaluation results yet. Please try again.`
      );
    }
    return;
  }

  resultRow.click();
}

async function determineAccess(){
  try{
    const { data:{ session } } = await db.auth.getSession();
    if(!session) return;

    const { data, error } = await db
      .from('profiles')
      .select('role, form_role')
      .eq('id', session.user.id)
      .maybeSingle();

    if(error || !data) return;

    // Exact requested access:
    // Manager OR Senior Staff. Junior and Probationary remain non-clickable.
    canOpenResults =
      data.role === 'manager' ||
      data.form_role === 'Senior Staff';

    if(canOpenResults) ensureStyles();
    decorateRows();
  }catch(err){
    console.info('Recent evaluation result links unavailable.', err);
  }
}

if(recent){
  recent.addEventListener('click', event => {
    if(!canOpenResults) return;

    const row = event.target.closest('.dash-live-eval-row');
    if(!row || !recent.contains(row)) return;

    openEmployeeResults(row);
  });

  recent.addEventListener('keydown', event => {
    if(!canOpenResults) return;
    if(event.key !== 'Enter' && event.key !== ' ') return;

    const row = event.target.closest('.dash-live-eval-row');
    if(!row || !recent.contains(row)) return;

    event.preventDefault();
    openEmployeeResults(row);
  });

  // Dashboard.js rebuilds Recent Evaluations during realtime refreshes.
  // Re-apply the clickable state to every newly created row.
  new MutationObserver(() => {
    requestAnimationFrame(decorateRows);
  }).observe(recent, {
    childList:true,
    subtree:true
  });
}

determineAccess();

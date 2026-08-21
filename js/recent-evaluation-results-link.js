/* =========================================================
   RECENT EVALUATIONS → EXISTING RESULTS VIEW
   Manager / Senior Staff only.

   Also keeps unchanged Recent Evaluations rows mounted across the
   dashboard's periodic refresh. dashboard.js rebuilds this section every
   few seconds; reusing the existing row nodes prevents the text/avatar
   from flashing when the underlying data has not visually changed.
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
      position:relative;
      cursor:pointer;
      border-radius:11px;
      transition:
        background-color .16s ease,
        box-shadow .16s ease,
        transform .14s ease;
    }

    .dash-live-eval-row.recent-review-link::before{
      content:"";
      position:absolute;
      top:9px;
      bottom:9px;
      left:-4px;
      width:3px;
      border-radius:999px;
      background:var(--lagoon);
      opacity:0;
      transform:scaleY(.45);
      transition:
        opacity .16s ease,
        transform .16s ease;
    }

    .dash-live-eval-row.recent-review-link:hover{
      background:#eaf7fd;
      box-shadow:
        inset 0 0 0 1.5px #9fd6ec,
        0 7px 18px -12px rgba(8,52,76,.55);
      transform:translateY(-1px);
    }

    .dash-live-eval-row.recent-review-link:hover::before{
      opacity:1;
      transform:scaleY(1);
    }

    .dash-live-eval-row.recent-review-link:active{
      transform:translateY(0) scale(.995);
      background:#e2f4fc;
    }

    .dash-live-eval-row.recent-review-link:focus-visible{
      outline:3px solid rgba(21,172,227,.32);
      outline-offset:2px;
      background:#eaf7fd;
      box-shadow:inset 0 0 0 1.5px #9fd6ec;
    }

    .dash-live-eval-row.recent-review-link:focus-visible::before{
      opacity:1;
      transform:scaleY(1);
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

/* ---------------------------------------------------------
   Stable Recent Evaluations DOM
   --------------------------------------------------------- */

function recentRowKey(row){
  if(!row) return '';

  const evaluator = normalize(
    row.querySelector('.dash-live-evaluator')?.textContent
  );
  const employee = normalize(
    row.querySelector('.dash-live-employee')?.textContent
  );

  return evaluator && employee
    ? `${evaluator}|${employee}`
    : '';
}

function collectRows(node, map){
  if(node?.nodeType !== Node.ELEMENT_NODE) return;

  if(node.matches?.('.dash-live-eval-row')){
    const key = recentRowKey(node);
    if(key) map.set(key, node);
  }

  node.querySelectorAll?.('.dash-live-eval-row').forEach(row => {
    const key = recentRowKey(row);
    if(key) map.set(key, row);
  });
}

function copyText(oldRow, newRow, selector){
  const oldEl = oldRow.querySelector(selector);
  const newEl = newRow.querySelector(selector);
  if(oldEl && newEl && oldEl.textContent !== newEl.textContent){
    oldEl.textContent = newEl.textContent;
  }
}

function syncStableRow(oldRow, newRow){
  oldRow.dataset.recentIndex = newRow.dataset.recentIndex || '';
  oldRow.classList.toggle(
    'dash-recent-hidden',
    newRow.classList.contains('dash-recent-hidden')
  );

  copyText(oldRow, newRow, '.dash-live-evaluator');
  copyText(oldRow, newRow, '.dash-live-employee');
  copyText(oldRow, newRow, '.dash-live-progress-line span');
  copyText(oldRow, newRow, '.dash-live-progress-line strong');
  copyText(oldRow, newRow, '.dash-live-meta > span:last-child');

  const oldStatus = oldRow.querySelector('.dash-live-status');
  const newStatus = newRow.querySelector('.dash-live-status');
  if(oldStatus && newStatus){
    oldStatus.className = newStatus.className;
    if(oldStatus.textContent !== newStatus.textContent){
      oldStatus.textContent = newStatus.textContent;
    }
  }

  const oldComment = oldRow.querySelector('.dash-live-comment');
  const newComment = newRow.querySelector('.dash-live-comment');
  if(oldComment && newComment){
    oldComment.className = newComment.className;
    if(oldComment.textContent !== newComment.textContent){
      oldComment.textContent = newComment.textContent;
    }
  }

  const oldBar = oldRow.querySelector('.dash-live-progress > span');
  const newPctText =
    newRow.querySelector('.dash-live-progress-line strong')?.textContent || '';
  const pct = Number.parseFloat(newPctText);

  if(oldBar && Number.isFinite(pct)){
    // Keep the same DOM node so the existing CSS width transition animates a
    // genuine progress change without flashing the surrounding text.
    oldBar.style.width = `${Math.max(0, Math.min(100, pct))}%`;
  }
}

let recentObserver = null;

function observeRecent(){
  recentObserver?.observe(recent, {
    childList:true,
    subtree:true
  });
}

function stabilizeRefresh(mutations){
  const removedRows = new Map();

  mutations.forEach(mutation => {
    mutation.removedNodes.forEach(node => collectRows(node, removedRows));
  });

  if(removedRows.size){
    // Disconnect while swapping nodes so our own replacements do not create a
    // second observer pass. MutationObserver callbacks run before paint, so an
    // unchanged row never visually disappears between dashboard refreshes.
    recentObserver.disconnect();

    recent.querySelectorAll('.dash-live-eval-row').forEach(newRow => {
      const key = recentRowKey(newRow);
      const oldRow = key ? removedRows.get(key) : null;
      if(!oldRow) return;

      syncStableRow(oldRow, newRow);
      newRow.replaceWith(oldRow);
    });

    observeRecent();
  }

  requestAnimationFrame(decorateRows);
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

  recentObserver = new MutationObserver(stabilizeRefresh);
  observeRecent();
}

determineAccess();

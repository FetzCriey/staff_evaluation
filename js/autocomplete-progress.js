/* =========================================================
   EMPLOYEE AUTOCOMPLETE — PROGRESS BACKGROUND FILL
   Each suggested name is filled left-to-right according to this
   evaluator's active draft progress. Submitted evaluations fill 100%.
   No separate progress bar, percentage, or status text is added.
   ========================================================= */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://giosjwjhalhmwcuyzfos.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_";
const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// All current evaluation forms contain 10 criteria. This matches the existing
// dashboard / progress logic, where a fully scored draft has 10 saved keys.
const TOTAL_CRITERIA = 10;
const progressByName = new Map();
let loading = null;

const normalize = value => String(value || '')
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .trim();

function ensureStyles(){
  if(document.getElementById('autocomplete-progress-fill-style')) return;

  const style = document.createElement('style');
  style.id = 'autocomplete-progress-fill-style';
  style.textContent = `
    .ac-box .ac-item.ac-progress-name{
      --ac-progress:0%;
      --ac-fill-start:rgba(21,172,227,.24);
      --ac-fill-end:rgba(11,127,176,.18);
      background-image:linear-gradient(
        90deg,
        var(--ac-fill-start) 0%,
        var(--ac-fill-end) var(--ac-progress),
        transparent var(--ac-progress),
        transparent 100%
      ) !important;
      background-repeat:no-repeat !important;
      transition:background-color .14s ease, color .14s ease;
    }

    .ac-box .ac-item.ac-progress-name.ac-progress-submitted{
      --ac-fill-start:rgba(51,184,119,.28);
      --ac-fill-end:rgba(31,122,77,.22);
    }
  `;
  document.head.appendChild(style);
}

function paintSuggestions(){
  ensureStyles();

  document.querySelectorAll('.ac-box .ac-item').forEach(item => {
    const name = item.textContent.trim();
    const state = progressByName.get(normalize(name));
    const pct = state?.percent ?? 0;

    item.classList.add('ac-progress-name');
    item.classList.toggle('ac-progress-submitted', !!state?.locked);
    item.style.setProperty('--ac-progress', Math.max(0, Math.min(100, pct)) + '%');
  });
}

async function refreshProgress(){
  if(loading) return loading;

  loading = (async () => {
    try{
      const { data:{ session } } = await db.auth.getSession();
      const uid = session?.user?.id;
      if(!uid) return;

      const [profilesResult, evaluationsResult] = await Promise.all([
        db.from('profiles').select('id, full_name'),
        db.from('evaluations')
          .select('employee_id, scores, locked')
          .eq('evaluator_id', uid)
          .eq('archived', false)
      ]);

      if(profilesResult.error || evaluationsResult.error) return;

      const nameById = new Map(
        (profilesResult.data ?? []).map(row => [row.id, row.full_name])
      );

      progressByName.clear();

      (evaluationsResult.data ?? []).forEach(row => {
        const name = nameById.get(row.employee_id);
        if(!name) return;

        const scored = Math.min(
          Object.keys(row.scores || {}).length,
          TOTAL_CRITERIA
        );

        const percent = row.locked
          ? 100
          : Math.min(100, (scored / TOTAL_CRITERIA) * 100);

        progressByName.set(normalize(name), {
          percent,
          locked: !!row.locked
        });
      });

      paintSuggestions();
    }catch(err){
      console.info('Autocomplete progress fill unavailable.', err);
    }finally{
      loading = null;
    }
  })();

  return loading;
}

const employeeInput = document.getElementById('empName');
const autocompleteBox = employeeInput?.closest('.field')?.querySelector('.ac-box');

// evaluation.js rebuilds the suggestion rows while the evaluator types.
// Repaint each new set immediately using the cached progress data.
if(autocompleteBox){
  new MutationObserver(() => {
    requestAnimationFrame(paintSuggestions);
  }).observe(autocompleteBox, {
    childList:true,
    subtree:true
  });
}

if(employeeInput){
  employeeInput.addEventListener('input', () => {
    requestAnimationFrame(paintSuggestions);
  });

  // Refresh from Supabase whenever the evaluator returns to the name field,
  // so a draft/submission completed moments earlier is reflected immediately.
  employeeInput.addEventListener('focus', () => {
    refreshProgress();
  });
}

// Initial cache for the first time the autocomplete opens.
refreshProgress();

/* =========================================================
   DASHBOARD / REVIEW NAVIGATION STATE

   Navigation rules:
   - Dashboard is controlled by the header/sidebar Dashboard controls.
   - Evaluation form always means "my scoring", never a stale Results view.
   - The old in-form Dashboard and Back to my scoring controls stay hidden.
   - A result row looks selected only while an actual Results/History review
     is open, not while Dashboard or normal scoring is active.
   ========================================================= */

(() => {
  const dashboard = document.getElementById('dashboardView');
  const backBar = document.getElementById('backBar');
  const backBtn = document.getElementById('backBtn');
  const drawerEvaluation = document.getElementById('drawerEvaluation');
  const headerActionBtn = document.getElementById('headerActionBtn');

  if(!dashboard) return;

  const BODY_CLASS = 'suppress-result-selection';

  function ensureStyle(){
    if(document.getElementById('navigation-authority-style')) return;

    const style = document.createElement('style');
    style.id = 'navigation-authority-style';
    style.textContent = `
      /* The header already provides Dashboard, so remove the duplicate
         Dashboard control inside the Evaluation form. */
      .dash-back-row{
        display:none !important;
      }

      /* Sidebar Evaluation form is now the only way to leave Results/History
         and return to normal scoring. Keep this legacy control in the DOM
         only so the existing Supabase reset logic can be reused internally. */
      #backBar{
        display:none !important;
      }

      /* Do not make an old review target look selected while Dashboard
         or normal scoring is active. */
      body.${BODY_CLASS} #resList .res-row.on{
        border-color:var(--line) !important;
        background:#fff !important;
      }

      body.${BODY_CLASS} #resList .res-row.on:hover{
        border-color:var(--lagoon) !important;
        background:#f7fbfd !important;
      }
    `;
    document.head.appendChild(style);
  }

  function reviewIsOpen(){
    // supabase.js removes .hide from #backBar only in review mode.
    // CSS hides the bar visually, but the class still gives us a reliable
    // internal signal without changing the existing review implementation.
    return !!backBar && !backBar.classList.contains('hide');
  }

  function returnToMyScoringIfNeeded(){
    if(!reviewIsOpen() || !backBtn) return;

    // Reuse the existing Back-to-my-scoring handler. This also triggers the
    // existing single-column reset supplemental fix, so review columns cannot
    // leak back into scoring mode.
    backBtn.click();
  }

  function syncSelectionState(){
    ensureStyle();

    const dashboardVisible =
      !dashboard.classList.contains('hide');

    // Selected result styling should exist only during an actual review.
    const suppress =
      dashboardVisible || !reviewIsOpen();

    document.body.classList.toggle(
      BODY_CLASS,
      suppress
    );
  }

  /*
    Run BEFORE dashboard.js's normal click handlers.

    If a reviewer is currently looking at somebody's Results/History and taps
    "Evaluation form", first restore "mine" mode; dashboard.js then opens the
    form normally.
  */
  drawerEvaluation?.addEventListener('click', () => {
    returnToMyScoringIfNeeded();
    syncSelectionState();
  }, true);

  /*
    The header's Start Evaluation button is another route into the scoring
    form. When it is clicked from Dashboard, it should obey the same rule and
    never reopen a stale review.
  */
  headerActionBtn?.addEventListener('click', () => {
    const dashboardVisible =
      !dashboard.classList.contains('hide');

    if(dashboardVisible){
      returnToMyScoringIfNeeded();
      syncSelectionState();
    }
  }, true);

  new MutationObserver(syncSelectionState).observe(dashboard, {
    attributes:true,
    attributeFilter:['class']
  });

  if(backBar){
    new MutationObserver(syncSelectionState).observe(backBar, {
      attributes:true,
      attributeFilter:['class']
    });
  }

  ensureStyle();
  syncSelectionState();
})();

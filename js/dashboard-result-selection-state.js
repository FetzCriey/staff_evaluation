/* =========================================================
   NAVIGATION AUTHORITY + OBSOLETE BUTTON REMOVAL

   - The duplicate in-form "← Dashboard" row is removed from the DOM.
   - The "Back to my scoring" BUTTON is removed from the DOM.
   - Its already-registered reset handlers are kept on the detached button
     object and exposed through one internal function.
   - Sidebar "Evaluation form" and Dashboard "Start Evaluation" use that
     function whenever the current form is in Results/History review mode.
   - The empty #backBar container remains only because supabase.js currently
     uses it as an internal review-mode visibility/state hook.
   ========================================================= */

(() => {
  const BODY_CLASS = 'suppress-result-selection';

  function init(){
    const dashboard = document.getElementById('dashboardView');
    const whoK = document.getElementById('whoK');
    const backBar = document.getElementById('backBar');
    const backBtn = document.getElementById('backBtn');
    const drawerEvaluation = document.getElementById('drawerEvaluation');
    const headerActionBtn = document.getElementById('headerActionBtn');

    if(!dashboard) return;

    /* ---------------------------------------------------------
       Remove the obsolete visible navigation controls.
       --------------------------------------------------------- */

    // Header already contains Dashboard, so this duplicate row is unnecessary.
    document.querySelector('.dash-back-row')?.remove();

    // Keep only the empty state container because supabase.js calls
    // show('backBar', ...). The actual button is removed from the live DOM.
    if(backBar){
      backBar.setAttribute('aria-hidden', 'true');
      backBar.style.display = 'none';
    }

    // Supabase and the existing single-column reset script have already
    // registered their click handlers by DOMContentLoaded. Keep this detached
    // reference privately, then remove the button from the document.
    backBtn?.remove();

    /* ---------------------------------------------------------
       Review → normal scoring
       --------------------------------------------------------- */

    function isReviewMode(){
      return whoK?.textContent?.trim() === 'Results for';
    }

    function returnToMyScoring(){
      if(!isReviewMode()) return false;
      if(!backBtn) return false;

      // Fires the existing Supabase reset logic plus the existing
      // single-column reset fix, but the button itself is no longer in the DOM.
      backBtn.click();
      return true;
    }

    // One internal navigation API; no visible Back button is needed.
    window.__returnToMyScoring = returnToMyScoring;

    /*
      Capture phase runs before dashboard.js's normal navigation handler.
      Evaluation form therefore always exits Results/History first, then the
      existing dashboard code opens the normal scoring form.
    */
    drawerEvaluation?.addEventListener('click', () => {
      returnToMyScoring();
    }, true);

    /*
      Start Evaluation is another path from Dashboard to the scoring form.
      If an old Results view is still the internal form state, clear it first.
      When already on the form this header button means Dashboard, so do not
      reset anything in that case.
    */
    headerActionBtn?.addEventListener('click', () => {
      const dashboardVisible = !dashboard.classList.contains('hide');
      if(dashboardVisible) returnToMyScoring();
    }, true);

    /* ---------------------------------------------------------
       Result-row selected appearance
       --------------------------------------------------------- */

    function ensureStyle(){
      if(document.getElementById('navigation-authority-style')) return;

      const style = document.createElement('style');
      style.id = 'navigation-authority-style';
      style.textContent = `
        /* #backBar may have its hide class toggled by the existing review
           code, but it contains no button and must never reserve space. */
        #backBar{
          display:none !important;
        }

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

    function syncSelectionState(){
      ensureStyle();

      const dashboardVisible =
        !dashboard.classList.contains('hide');

      // Highlight a result only while that Results/History review is actually
      // the active form state.
      document.body.classList.toggle(
        BODY_CLASS,
        dashboardVisible || !isReviewMode()
      );
    }

    new MutationObserver(syncSelectionState).observe(dashboard, {
      attributes:true,
      attributeFilter:['class']
    });

    if(whoK){
      new MutationObserver(syncSelectionState).observe(whoK, {
        childList:true,
        subtree:true,
        characterData:true
      });
    }

    ensureStyle();
    syncSelectionState();
  }

  // supabase.js is a deferred module with top-level awaits. DOMContentLoaded
  // fires only after it finishes attaching the existing reset handlers.
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init, { once:true });
  }else{
    init();
  }
})();

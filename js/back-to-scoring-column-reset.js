/* =========================================================
   REVIEW → BACK TO MY SCORING
   Results / History may expand the form to multiple evaluator
   columns. Supabase's existing Back button clears the review data,
   but clearColumns() alone does not reduce the evaluator count.

   After the existing Back handler finishes, force scoring mode back
   to exactly one column owned by the signed-in user.
   ========================================================= */

(() => {
  const backBtn = document.getElementById('backBtn');
  if(!backBtn) return;

  backBtn.addEventListener('click', () => {
    const api = window.evalApi;
    if(!api || typeof api.setColumns !== 'function') return;

    const evaluator =
      String(window.__currentUserName || '').trim() ||
      document.getElementById('acctName')?.textContent?.trim() ||
      'You';

    // The existing Supabase click handler runs first because it was
    // registered before this supplemental script. It clears the review
    // state and scores; this final step restores the normal one-column
    // scoring layout instead of leaving the old review column count.
    api.setColumns([evaluator]);
  });
})();

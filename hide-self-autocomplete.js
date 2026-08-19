/* =========================================================
   HIDE THE SIGNED-IN EVALUATOR FROM EMPLOYEE AUTOCOMPLETE
   The existing self-evaluation block remains as a safety layer.
   This only changes the predictive suggestion list.
   ========================================================= */

(() => {
  const originalSuggest = window.acSuggest;
  if (typeof originalSuggest !== 'function') return;

  const normalize = value => String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

  window.acSuggest = function(query) {
    const selfName = normalize(window.__currentUserName);

    return originalSuggest(query).filter(name =>
      !selfName || normalize(name) !== selfName
    );
  };
})();

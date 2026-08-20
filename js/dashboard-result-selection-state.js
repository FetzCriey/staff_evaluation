/* =========================================================
   DASHBOARD — RESULT SELECTION VISUAL STATE
   Evaluation Results keeps the current review target internally.
   While Dashboard is visible, do not make that old target look
   actively selected in the sidebar. The highlight returns when
   the Evaluation form / Results view is visible again.
   ========================================================= */

(() => {
  const dashboard = document.getElementById('dashboardView');
  if(!dashboard) return;

  const BODY_CLASS = 'dashboard-suppress-result-selection';

  function ensureStyle(){
    if(document.getElementById('dashboard-result-selection-style')) return;

    const style = document.createElement('style');
    style.id = 'dashboard-result-selection-style';
    style.textContent = `
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

  function sync(){
    ensureStyle();

    const dashboardVisible =
      !dashboard.classList.contains('hide');

    document.body.classList.toggle(
      BODY_CLASS,
      dashboardVisible
    );
  }

  new MutationObserver(sync).observe(dashboard, {
    attributes:true,
    attributeFilter:['class']
  });

  sync();
})();

/* =========================================================
   HIDE EMPTY EVALUATOR HEADER
   Do not show placeholder labels such as "Eval 1" until a real
   employee from the roster has been selected.
   ========================================================= */

(() => {
  const input = document.getElementById('empName');
  if(!input) return;

  const CLASS_NAME = 'hide-empty-evaluator-header';

  function ensureStyle(){
    if(document.getElementById('hide-empty-evaluator-header-style')) return;

    const style = document.createElement('style');
    style.id = 'hide-empty-evaluator-header-style';
    style.textContent = `
      body.${CLASS_NAME} #grid thead th.evh{
        color:transparent !important;
        text-shadow:none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function hasChosenEmployee(){
    const value = input.value.trim();
    if(!value) return false;

    // Supabase exposes the exact roster validator after profile IDs load.
    // Until then, keep the placeholder header hidden rather than showing Eval 1.
    if(typeof window.__isRosterName !== 'function') return false;

    return window.__isRosterName(value);
  }

  function sync(){
    ensureStyle();
    document.body.classList.toggle(
      CLASS_NAME,
      !hasChosenEmployee()
    );
  }

  ['input','change','blur','focus'].forEach(type => {
    input.addEventListener(type, sync);
  });

  // evaluation.js can rebuild the table header after role / employee changes.
  // The body class keeps the placeholder hidden through those rebuilds.
  const grid = document.getElementById('grid');
  if(grid){
    new MutationObserver(sync).observe(grid, {
      childList:true,
      subtree:true
    });
  }

  // __isRosterName is created asynchronously by supabase.js.
  // Re-check briefly after page initialization so the correct evaluator
  // heading becomes visible as soon as a valid selected employee is ready.
  let checks = 0;
  const readyCheck = setInterval(() => {
    sync();
    checks += 1;
    if(typeof window.__isRosterName === 'function' || checks >= 40){
      clearInterval(readyCheck);
    }
  }, 100);

  sync();
})();

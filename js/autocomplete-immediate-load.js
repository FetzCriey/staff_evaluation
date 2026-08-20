/* =========================================================
   AUTOCOMPLETE — IMMEDIATE EMPLOYEE LOAD
   evaluation.js writes a picked autocomplete name directly into
   #empName, so the browser does not emit a native "change" event.
   Supabase listens for "change" to load that employee's draft /
   submission. Commit the picked suggestion immediately instead of
   waiting for blur / click-outside.
   ========================================================= */

(() => {
  const input = document.getElementById('empName');
  const box = input?.closest('.field')?.querySelector('.ac-box');

  if(!input || !box) return;

  let commitQueued = false;

  function isExactRosterName(){
    const value = input.value.trim();
    if(!value) return false;

    // Supabase exposes this after its roster IDs are ready.
    // If it is not ready for a split second, the normal change handler
    // can still validate the value itself when dispatched.
    return typeof window.__isRosterName === 'function'
      ? window.__isRosterName(value)
      : true;
  }

  function commitPickedEmployee(){
    if(commitQueued) return;
    commitQueued = true;

    queueMicrotask(() => {
      commitQueued = false;
      if(!isExactRosterName()) return;

      input.classList.remove('bad');

      // This is the event js/supabase.js already uses for
      // onEmployeeChange(). No separate loading path is introduced.
      input.dispatchEvent(new Event('change', {
        bubbles: true
      }));
    });
  }

  // Mouse / touch selection:
  // evaluation.js handles mousedown on the .ac-item first and calls
  // pick(name). This listener is on the parent in bubble phase, so by
  // the time it runs the input already contains the selected name.
  box.addEventListener('mousedown', event => {
    if(!event.target.closest('.ac-item')) return;
    commitPickedEmployee();
  });

  // Keyboard selection:
  // Capture whether Enter is being pressed while a suggestion list is
  // genuinely open. evaluation.js then performs its normal pick(name)
  // during the same key event; the microtask commits that picked value.
  input.addEventListener('keydown', event => {
    if(event.key !== 'Enter') return;
    if(!box.classList.contains('open')) return;
    if(!box.querySelector('.ac-item')) return;

    commitPickedEmployee();
  }, true);
})();

/* =========================================================
   NAVIGATION AUTHORITY — SAFE INITIALIZATION

   Important:
   supabase.js initializes asynchronously and attaches Results + History
   handlers to #backBtn late in that process. Never remove #backBtn until
   those handlers and sidebar loaders are fully initialized.

   After initialization:
   - duplicate in-form "← Dashboard" is removed
   - "Back to my scoring" is removed from the live DOM
   - Sidebar "Evaluation form" / Dashboard "Start Evaluation" can still call
     the already-registered reset handlers through the detached button object
   - Results and History continue loading normally
   - deleting the History record currently being viewed cannot crash merely
     because the legacy Back button has already been removed
   ========================================================= */

(() => {
  const BODY_CLASS = 'suppress-result-selection';

  const dashboard = document.getElementById('dashboardView');
  const whoK = document.getElementById('whoK');
  const backBar = document.getElementById('backBar');
  const backBtn = document.getElementById('backBtn');
  const drawerEvaluation = document.getElementById('drawerEvaluation');
  const headerActionBtn = document.getElementById('headerActionBtn');

  if(!dashboard) return;

  let navigationReady = false;
  let detachedBackBtn = null;

  /*
    supabase.js still contains one legacy path that looks up #backBtn after a
    successfully deleted History record. Normally that element is intentionally
    detached. For that one confirmed operation only, temporarily reconnect the
    already-initialized button inside the permanently hidden #backBar so the
    existing Supabase reset handlers can finish safely. It is detached again
    immediately after the internal click.
  */
  let deleteBridgeActive = false;
  let deleteBridgeTimer = null;

  function ensureStyle(){
    if(document.getElementById('navigation-authority-style')) return;

    const style = document.createElement('style');
    style.id = 'navigation-authority-style';
    style.textContent = `
      /* The state container is never part of visible navigation. */
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

  function isReviewMode(){
    return whoK?.textContent?.trim() === 'Results for';
  }

  function returnToMyScoring(){
    if(!isReviewMode()) return true;

    const resetButton = detachedBackBtn || document.getElementById('backBtn');
    if(!resetButton) return false;

    // All Supabase + single-column-reset handlers are attached before the
    // button is detached, so click() remains a valid internal reset action.
    resetButton.click();
    return true;
  }

  function cleanupDeleteBridge(){
    clearTimeout(deleteBridgeTimer);
    deleteBridgeTimer = null;

    if(deleteBridgeActive && detachedBackBtn?.isConnected){
      detachedBackBtn.remove();
    }

    deleteBridgeActive = false;
  }

  function currentArchiveMatchesDelete(message){
    const note = document.getElementById('archNote');
    if(!note || note.classList.contains('hide')) return false;

    const currentName =
      document.getElementById('whoV')?.textContent?.trim() || '';

    const archiveText =
      document.getElementById('archText')?.textContent?.trim() || '';

    // openArchive() writes:
    // "Archived <locale date/time> — read only. ..."
    const match = archiveText.match(/^Archived\s+(.+?)\s+—/);
    const currentWhen = match?.[1]?.trim() || '';

    const text = String(message || '');

    return !!currentName &&
      !!currentWhen &&
      text.includes(currentName) &&
      text.includes(currentWhen);
  }

  function armDeleteBridge(){
    /*
      Before navigation cleanup there is nothing to bridge: #backBtn is still
      in the document and Supabase can find it normally.
    */
    if(!navigationReady || !backBar || !detachedBackBtn) return;
    if(detachedBackBtn.isConnected) return;

    deleteBridgeActive = true;
    backBar.appendChild(detachedBackBtn);

    /*
      Supabase's own click handlers were attached before this supplemental
      listener, so they reset review/archive state first. Then remove the
      temporary DOM bridge again.
    */
    detachedBackBtn.addEventListener('click', () => {
      queueMicrotask(cleanupDeleteBridge);
    }, { once:true });

    // Network/RLS failures never reach the internal click. This is only a
    // failsafe; the alert wrapper below normally cleans those cases sooner.
    deleteBridgeTimer = setTimeout(cleanupDeleteBridge, 30000);
  }

  function installHistoryDeleteSafety(){
    /*
      Arm the bridge only AFTER the user confirms deletion of the archive that
      is currently open. Cancelling deletion therefore changes nothing.
    */
    const originalConfirm = window.uiConfirm;

    if(
      typeof originalConfirm === 'function' &&
      !originalConfirm.__historyDeleteNavigationSafety
    ){
      const wrappedConfirm = async function(title, message, ...rest){
        const ok = await originalConfirm.call(this, title, message, ...rest);

        if(
          ok &&
          title === 'Delete this history record?' &&
          currentArchiveMatchesDelete(message)
        ){
          armDeleteBridge();
        }

        return ok;
      };

      wrappedConfirm.__historyDeleteNavigationSafety = true;
      wrappedConfirm.__historyDeleteOriginal = originalConfirm;
      window.uiConfirm = wrappedConfirm;
    }

    /*
      If Supabase rejects/fails the deletion, its success-path internal click
      never occurs. Remove the temporary bridge as soon as that failure is
      reported. Preserve any other uiAlert wrappers already installed.
    */
    const originalAlert = window.uiAlert;

    if(
      typeof originalAlert === 'function' &&
      !originalAlert.__historyDeleteNavigationSafety
    ){
      const wrappedAlert = async function(title, message, ...rest){
        if(
          deleteBridgeActive &&
          (
            title === 'Could not delete' ||
            title === 'Nothing was deleted'
          )
        ){
          cleanupDeleteBridge();
        }

        const result =
          await originalAlert.call(this, title, message, ...rest);

        if(deleteBridgeActive && title === 'Deleted'){
          cleanupDeleteBridge();
        }

        return result;
      };

      wrappedAlert.__historyDeleteNavigationSafety = true;
      wrappedAlert.__historyDeleteOriginal = originalAlert;
      window.uiAlert = wrappedAlert;
    }
  }

  function syncSelectionState(){
    ensureStyle();

    const dashboardVisible =
      !dashboard.classList.contains('hide');

    document.body.classList.toggle(
      BODY_CLASS,
      dashboardVisible || !isReviewMode()
    );
  }

  function finishNavigationSetup(){
    if(navigationReady) return;

    navigationReady = true;

    // Safe now: Supabase has already reached Results + History initialization.
    document.querySelector('.dash-back-row')?.remove();

    if(backBar){
      backBar.setAttribute('aria-hidden', 'true');
      backBar.style.display = 'none';
    }

    const liveBackBtn = document.getElementById('backBtn');
    if(liveBackBtn){
      detachedBackBtn = liveBackBtn;
      liveBackBtn.remove();
    }

    window.__returnToMyScoring = returnToMyScoring;
    syncSelectionState();
  }

  /*
    Wait for Supabase's reviewer initialization markers.

    __refreshResults is assigned after the Results button handler is attached.
    __clearArchiveView is assigned after the History/back handler is attached.
    Once both exist, removing the visible Back button cannot interrupt
    supabase.js initialization.
  */
  const started = Date.now();

  const readyTimer = setInterval(() => {
    const resultsReady =
      typeof window.__refreshResults === 'function';

    const historyReady =
      typeof window.__clearArchiveView === 'function';

    if(resultsReady && historyReady){
      clearInterval(readyTimer);
      finishNavigationSetup();
      return;
    }

    /*
      Basic/Probationary users never initialize Results/History because they
      do not have reviewer access. Once the authenticated page is fully shown
      and those sections remain hidden, there is no Results/History handler
      waiting for #backBtn.
    */
    const wrapReady =
      !document.getElementById('wrap')?.classList.contains('hide');

    const resultsUnavailable =
      document.getElementById('secResults')?.classList.contains('hide');

    const historyUnavailable =
      document.getElementById('secHistory')?.classList.contains('hide');

    if(
      wrapReady &&
      resultsUnavailable &&
      historyUnavailable &&
      Date.now() - started > 1500
    ){
      clearInterval(readyTimer);
      finishNavigationSetup();
      return;
    }

    // Safety timeout: do not keep polling forever if another unrelated script
    // fails. Crucially, unlike the previous version, do NOT remove #backBtn
    // early during this timeout period.
    if(Date.now() - started > 12000){
      clearInterval(readyTimer);
      console.info(
        'Navigation cleanup skipped because Results/History did not finish initializing.'
      );
    }
  }, 100);

  /*
    These capture listeners are safe even before cleanup completes:
    while #backBtn is still in the DOM they use it normally; after cleanup
    they use the detached reference with the same registered handlers.
  */
  drawerEvaluation?.addEventListener('click', event => {
    if(!isReviewMode()) return;

    if(!returnToMyScoring()){
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  headerActionBtn?.addEventListener('click', event => {
    const dashboardVisible =
      !dashboard.classList.contains('hide');

    if(!dashboardVisible || !isReviewMode()) return;

    if(!returnToMyScoring()){
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

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
  installHistoryDeleteSafety();
  syncSelectionState();
})();

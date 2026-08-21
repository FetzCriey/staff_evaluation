/* =========================================================
   BETTER PRACTICE — SITE-WIDE MOTION CONTROLLER
   Adds reusable click, value-change, and dynamic-entry feedback.
   Pure presentation: no business logic or Supabase writes.
   ========================================================= */

(() => {
  const reduceMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if(reduceMotion){
    document.body.classList.add('motion-ready');
    return;
  }

  const CLICKABLE = [
    'button:not(:disabled)',
    'a[href]',
    '[role="button"]',
    '.ac-item',
    '.bp-select-option',
    '.res-row',
    '.his-main',
    '.dash-live-eval-row'
  ].join(',');

  const ENTERABLE = [
    '.ac-item',
    '.bp-select-option',
    '.his-row',
    '.mgr-row',
    '.dash-rank-row',
    '.prog-chip',
    '.c-card'
  ].join(',');

  // Evaluation Results is rebuilt as a complete list whenever its counts or
  // selected person refresh. Re-running the entrance animation on every rebuilt
  // .res-row causes the brief whole-list flash users can see after a review
  // opens. Keep their click/hover transitions, but animate each staff name only
  // once per page session.
  const animatedResultNames = new Set();

  function resultRowName(row){
    return row?.querySelector?.('.res-nm')?.textContent?.trim().toLowerCase() || '';
  }

  function animateResultRowOnce(row){
    const key = resultRowName(row);
    if(!key || animatedResultNames.has(key)) return;

    animatedResultNames.add(key);
    animateEnter(row);
  }

  // Dashboard Recent Evaluations is also rebuilt as a whole list on refresh.
  // Animate each evaluator → employee pair only once per page session, so the
  // periodic/realtime refresh does not make the activity card blink.
  const animatedRecentPairs = new Set();

  function recentRowKey(row){
    const evaluator =
      row?.querySelector?.('.dash-live-evaluator')?.textContent?.trim().toLowerCase() || '';
    const employee =
      row?.querySelector?.('.dash-live-employee')?.textContent?.trim().toLowerCase() || '';

    return evaluator && employee
      ? evaluator + '|' + employee
      : '';
  }

  function animateRecentRowOnce(row){
    const key = recentRowKey(row);
    if(!key || animatedRecentPairs.has(key)) return;

    animatedRecentPairs.add(key);
    animateEnter(row);
  }

  const VALUE_TARGET = [
    '.dash-big-score',
    '.dash-rank-score',
    '.res-ct',
    '.cnt',
    '.pill-state',
    '.dash-live-status',
    '.dash-live-progress-line strong',
    '#progNum',
    '#completionPercent',
    '#completionText'
  ].join(',');

  function replayClass(el, className){
    if(!el) return;
    el.classList.remove(className);
    // Force a fresh animation even when the same control is clicked repeatedly.
    void el.offsetWidth;
    el.classList.add(className);
  }

  function clearOnAnimationEnd(el, className){
    const done = () => {
      el.classList.remove(className);
      el.removeEventListener('animationend', done);
    };
    el.addEventListener('animationend', done);
  }

  /* ---------------------------------------------------------
     Universal click feedback
     --------------------------------------------------------- */

  document.addEventListener('pointerdown', event => {
    const control = event.target.closest?.(CLICKABLE);
    if(!control) return;

    replayClass(control, 'motion-click');
    clearOnAnimationEnd(control, 'motion-click');
  }, true);

  /* ---------------------------------------------------------
     Scores and form field value changes
     --------------------------------------------------------- */

  document.addEventListener('input', event => {
    const field = event.target;

    if(
      field?.matches?.('.score-in,input,textarea,select') &&
      !field.matches('[type="range"]')
    ){
      replayClass(field, 'motion-value-change');
      clearOnAnimationEnd(field, 'motion-value-change');
    }
  }, true);

  document.addEventListener('change', event => {
    const field = event.target;
    if(!field?.matches?.('select,.bp-native-select')) return;

    replayClass(field, 'motion-value-change');
    clearOnAnimationEnd(field, 'motion-value-change');
  }, true);

  /* ---------------------------------------------------------
     Dynamic content / realtime rows
     --------------------------------------------------------- */

  let enterSequence = 0;

  function animateEnter(el){
    if(
      !el ||
      el.nodeType !== Node.ELEMENT_NODE ||
      el.classList.contains('motion-enter')
    ) return;

    const delay = Math.min(enterSequence++ * 18, 126);
    el.style.setProperty('--motion-delay', delay + 'ms');

    replayClass(el, 'motion-enter');

    const done = () => {
      el.classList.remove('motion-enter');
      el.style.removeProperty('--motion-delay');
      el.removeEventListener('animationend', done);
    };

    el.addEventListener('animationend', done);
  }

  function scanAddedNode(node){
    if(node.nodeType !== Node.ELEMENT_NODE) return;

    // Evaluation Results rows are special: the entire list is frequently
    // reconstructed by Supabase, so only the first DOM instance for each
    // staff name receives the entrance animation.
    if(node.matches?.('.res-row')){
      animateResultRowOnce(node);
    }

    [...node.querySelectorAll?.('.res-row') || []]
      .forEach(animateResultRowOnce);

    // Recent Evaluations is periodically/realtime rebuilt by dashboard.js.
    // Do not replay the entrance animation on unchanged activity rows.
    if(node.matches?.('.dash-live-eval-row')){
      animateRecentRowOnce(node);
    }

    [...node.querySelectorAll?.('.dash-live-eval-row') || []]
      .forEach(animateRecentRowOnce);

    if(node.matches?.(ENTERABLE)){
      animateEnter(node);
    }

    // Cap each mutation scan so a full table rebuild remains smooth.
    [...node.querySelectorAll?.(ENTERABLE) || []]
      .slice(0, 18)
      .forEach(animateEnter);
  }

  const observer = new MutationObserver(mutations => {
    enterSequence = 0;

    for(const mutation of mutations){
      if(mutation.type === 'childList'){
        mutation.addedNodes.forEach(scanAddedNode);

        const valueHost =
          mutation.target.nodeType === Node.ELEMENT_NODE
            ? mutation.target.closest?.(VALUE_TARGET)
            : null;

        if(valueHost){
          replayClass(valueHost, 'motion-value-change');
          clearOnAnimationEnd(valueHost, 'motion-value-change');
        }
      }

      if(mutation.type === 'characterData'){
        const valueHost =
          mutation.target.parentElement?.closest?.(VALUE_TARGET);

        if(valueHost){
          replayClass(valueHost, 'motion-value-change');
          clearOnAnimationEnd(valueHost, 'motion-value-change');
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList:true,
    subtree:true,
    characterData:true
  });

  /*
    Enable transition rules after the initial DOM has painted. This avoids
    browser-default elements visibly tweening from unstyled startup values.
  */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.add('motion-ready');
    });
  });
})();

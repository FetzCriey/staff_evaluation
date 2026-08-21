/* =========================================================
   DASHBOARD PERIODIC-REFRESH STABILITY

   dashboard.js intentionally polls every 5 seconds so all roles can see
   current dashboard data. Some dashboard elements are rebuilt/reassigned on
   every poll even when their visible value is unchanged. The global motion
   system interprets those DOM mutations as fresh content and replays entrance
   / value animations, which looks like a 4–5 second blink.

   This module keeps the polling and real data updates intact, but suppresses
   only redundant refresh animations on the non-Recent-Evaluations dashboard
   components. Genuine value changes can still animate.
   ========================================================= */

(() => {
  const dashboard = document.getElementById('dashboardView');
  if(!dashboard) return;

  const FIXED_VALUE_SELECTORS = [
    '#latestTopScore',
    '#overallTopScore',
    '#teamAverage',
    '#completionText',
    '#completionPercent'
  ];

  const fixedValues = FIXED_VALUE_SELECTORS
    .map(selector => dashboard.querySelector(selector))
    .filter(Boolean);

  const lastText = new Map();

  function rememberCurrentValues(){
    fixedValues.forEach(node => {
      lastText.set(node, node.textContent);
    });
  }

  function suppressRedundantValueAnimation(){
    fixedValues.forEach(node => {
      const current = node.textContent;
      const previous = lastText.get(node);

      if(previous === current){
        // global-motion.js may have just replayed this class because
        // dashboard.js assigned the same text again. Remove it before paint.
        node.classList.remove('motion-value-change');
      }else{
        // A real data change is allowed to keep its animation.
        lastText.set(node, current);
      }
    });
  }

  /*
    Ranking rows are completely recreated on every poll. That is fine for the
    data logic, but they must not replay their entrance animation every five
    seconds. The first render still uses the normal animation; after the first
    stable paint, periodic rebuilds are visually quiet.
  */
  function suppressRankingRefreshAnimation(){
    dashboard.querySelectorAll(
      '#latestRanking .dash-rank-row, #overallRanking .dash-rank-row'
    ).forEach(row => {
      row.classList.remove('motion-enter');
      row.querySelectorAll('.motion-value-change').forEach(node => {
        node.classList.remove('motion-value-change');
      });
    });
  }

  function settleRefresh(){
    suppressRedundantValueAnimation();

    if(document.body.classList.contains('dashboard-refresh-stable')){
      suppressRankingRefreshAnimation();
    }
  }

  const observer = new MutationObserver(settleRefresh);
  observer.observe(dashboard, {
    childList:true,
    subtree:true,
    characterData:true
  });

  // Seed the placeholder/initial state. Genuine first data values are still
  // detected as changes and may animate normally.
  rememberCurrentValues();

  // After the initial dashboard has had time to render, ranking/image entrance
  // animations are disabled only for automatic periodic rebuilds.
  setTimeout(() => {
    document.body.classList.add('dashboard-refresh-stable');
    suppressRankingRefreshAnimation();
  }, 1200);

  const style = document.createElement('style');
  style.id = 'dashboard-refresh-stability-style';
  style.textContent = `
    /* dashboard.js recreates ranking avatar <img> nodes during polling.
       Do not replay the image entrance animation on each recreated node. */
    body.dashboard-refresh-stable #dashboardView :is(
      #latestRanking,
      #overallRanking
    ) .dash-rank-avatar img{
      animation:none !important;
    }

    /* Same protection for a ranking row if global-motion.js adds its entrance
       class during the same mutation batch. */
    body.dashboard-refresh-stable #dashboardView :is(
      #latestRanking,
      #overallRanking
    ) .dash-rank-row.motion-enter{
      animation:none !important;
    }
  `;
  document.head.appendChild(style);
})();

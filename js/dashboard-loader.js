/* =========================================================
   DASHBOARD LAZY LOADER
   Avoid Dashboard Supabase reads when a reload is restoring
   Evaluation / Results / History. Dashboard code is loaded
   immediately for normal Dashboard visits, or on first request
   to return to Dashboard from the form.
   ========================================================= */
(() => {
  const STORAGE_KEY = "bp-staff-evaluation-location-v1";
  let saved = null;

  try{
    const raw = sessionStorage.getItem(STORAGE_KEY);
    saved = raw ? JSON.parse(raw) : null;
  }catch(_){}

  const restoringForm = saved?.view === "form";
  let dashboardPromise = null;
  let dashboardReady = false;

  function loadDashboard(){
    if(!dashboardPromise){
      dashboardPromise = import("./dashboard.js?v=20260822-2207")
        .then(module => {
          dashboardReady = true;
          return module;
        })
        .catch(error => {
          dashboardPromise = null;
          console.error("Dashboard failed to load.", error);
          throw error;
        });
    }
    return dashboardPromise;
  }

  if(!restoringForm){
    loadDashboard();
    return;
  }

  const dashboardIntentSelector =
    "#drawerDashboard,#backToDashboard,#headerActionBtn";

  async function onDashboardIntent(event){
    const target = event.target?.closest?.(dashboardIntentSelector);
    if(!target || dashboardReady) return;

    // While restoring a form page, these controls mean "go to Dashboard".
    // dashboard.js itself switches to Dashboard as soon as it is imported.
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    try{
      await loadDashboard();

      // drawerDashboard owns mobile drawer closing after dashboard.js loads.
      // Replay only this safe, one-direction navigation action.
      if(target.id === "drawerDashboard"){
        target.click();
      }
    }catch(_){
      // Keep the current form usable if Dashboard loading fails.
    }
  }

  document.addEventListener("click", onDashboardIntent, true);
})();

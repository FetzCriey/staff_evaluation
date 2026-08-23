/* =========================================================
   DASHBOARD LAZY LOADER
   Avoid Dashboard Supabase reads when a reload is restoring
   Evaluation / Results / History. Dashboard intent is persisted
   synchronously so an immediate second reload cannot jump back.
   ========================================================= */
(() => {
  const STORAGE_KEY = "bp-staff-evaluation-location-v1";
  const AUTH_STORAGE_KEY = "sb-giosjwjhalhmwcuyzfos-auth-token";

  function currentOwnerKey(){
    try{
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      const auth = raw ? JSON.parse(raw) : null;
      const id = auth?.user?.id;
      if(id) return "uid:" + String(id);
    }catch(_){}

    try{
      const email = String(sessionStorage.getItem("staff_email") || "")
        .trim()
        .toLowerCase();
      if(email) return "email:" + email;
    }catch(_){}

    return "";
  }

  const ownerKey = currentOwnerKey();
  let saved = null;

  try{
    const raw = sessionStorage.getItem(STORAGE_KEY);
    saved = raw ? JSON.parse(raw) : null;

    if(
      saved &&
      (!ownerKey || !saved.ownerKey || saved.ownerKey !== ownerKey)
    ){
      sessionStorage.removeItem(STORAGE_KEY);
      saved = null;
    }
  }catch(_){
    saved = null;
  }

  const restoringForm = saved?.view === "form";
  let dashboardPromise = null;
  let dashboardReady = false;

  function persistDashboardIntent(){
    if(!ownerKey) return;

    try{
      const raw = sessionStorage.getItem(STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : {};

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...current,
          ownerKey,
          view:"dashboard",
          mode:null,
          employeeName:null,
          historyName:null,
          historyMeta:null,
          historyAverage:null,
          scrollY:0,
          savedAt:Date.now()
        })
      );
    }catch(_){}
  }

  function cancelPendingRestore(){
    if(typeof window.__cancelEvaluationLocationRestore === "function"){
      window.__cancelEvaluationLocationRestore("dashboard");
    }else{
      window.__cancelEvaluationLocationRestoreRequested = true;
    }
  }

  function loadDashboard(){
    if(!dashboardPromise){
      dashboardPromise = import("./dashboard.js?v=20260822-2231")
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

    // Save the user's explicit destination before dynamic import/network work.
    persistDashboardIntent();
    cancelPendingRestore();

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    try{
      await loadDashboard();

      // Replaying the mobile sidebar button lets dashboard.js close the drawer.
      if(target.id === "drawerDashboard"){
        target.click();
      }
    }catch(_){
      // Keep the current form usable if Dashboard loading fails.
    }
  }

  document.addEventListener("click", onDashboardIntent, true);
})();

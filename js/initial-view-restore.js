/* =========================================================
   INITIAL VIEW RESTORE
   Prevent the Dashboard from flashing first on page reload when
   this browser tab was previously on Evaluation / Results / History.
   The exact employee/result/history record is restored later by
   staff-profile-popup.js using the same sessionStorage state.
   ========================================================= */
(() => {
  const STORAGE_KEY = "bp-staff-evaluation-location-v1";

  let state = null;
  try{
    const raw = sessionStorage.getItem(STORAGE_KEY);
    state = raw ? JSON.parse(raw) : null;
  }catch(_){}

  if(!state || state.view !== "form") return;

  const applyFormView = () => {
    const dashboard = document.getElementById("dashboardView");
    const form = document.getElementById("formView");

    if(!dashboard || !form) return false;

    dashboard.classList.add("hide");
    form.classList.remove("hide");

    document.getElementById("layoutChooser")?.classList.remove("hide");
    document.getElementById("drawerDashboard")?.classList.remove("on");
    document.getElementById("drawerEvaluation")?.classList.add("on");

    const title = document.getElementById("pageTitle");
    if(title) title.textContent = "Performance Evaluation";

    const now = document.getElementById("layNow");
    if(now) now.textContent = "";

    const action = document.getElementById("headerActionBtn");
    if(action) action.textContent = "Dashboard";

    return true;
  };

  if(!applyFormView()) return;

  /*
    dashboard.js still initializes itself to Dashboard. Keep the saved form
    state authoritative during bootstrap. MutationObserver callbacks run before
    the browser's next paint, so the temporary Dashboard state is corrected
    without becoming visible.
  */
  let enforcing = false;
  let releaseTimer = null;

  const observer = new MutationObserver(() => {
    if(enforcing) return;

    enforcing = true;
    try{
      applyFormView();
    }finally{
      enforcing = false;
    }

    const wrap = document.getElementById("wrap");
    if(wrap && !wrap.classList.contains("hide") && !releaseTimer){
      // Leave enough time for the later Results/History restore module to run.
      releaseTimer = setTimeout(() => observer.disconnect(), 1400);
    }
  });

  [
    document.getElementById("dashboardView"),
    document.getElementById("formView"),
    document.getElementById("layoutChooser"),
    document.getElementById("drawerDashboard"),
    document.getElementById("drawerEvaluation"),
    document.getElementById("wrap")
  ].filter(Boolean).forEach(node => {
    observer.observe(node, {
      attributes:true,
      attributeFilter:["class"]
    });
  });

  // Safety release if another script fails before the authenticated app appears.
  setTimeout(() => observer.disconnect(), 8000);
})();

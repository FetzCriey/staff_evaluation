/* =========================================================
   INITIAL VIEW RESTORE
   Apply the saved main view before the authenticated app is shown.
   dashboard-loader.js keeps dashboard.js unloaded during a form
   reload, so no MutationObserver / forced-view fight is needed.
   ========================================================= */
(() => {
  const STORAGE_KEY = "bp-staff-evaluation-location-v1";

  let state = null;
  try{
    const raw = sessionStorage.getItem(STORAGE_KEY);
    state = raw ? JSON.parse(raw) : null;
  }catch(_){}

  if(!state || state.view !== "form") return;

  const dashboard = document.getElementById("dashboardView");
  const form = document.getElementById("formView");

  if(!dashboard || !form) return;

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
})();

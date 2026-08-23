/* =========================================================
   INITIAL VIEW RESTORE
   Apply an account-owned saved main view before the authenticated
   app is shown. Stale/legacy state is ignored instead of allowing
   another signed-in account to inherit the previous location.
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
  let state = null;

  try{
    const raw = sessionStorage.getItem(STORAGE_KEY);
    state = raw ? JSON.parse(raw) : null;

    if(
      state &&
      (!ownerKey || !state.ownerKey || state.ownerKey !== ownerKey)
    ){
      sessionStorage.removeItem(STORAGE_KEY);
      state = null;
    }
  }catch(_){
    state = null;
  }

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

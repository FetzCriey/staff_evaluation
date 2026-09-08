import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const INIT_KEY = "__staffAdminPasswordReset_20260908";
if(!window[INIT_KEY]){
  window[INIT_KEY] = true;
  void initAdminPasswordReset();
}

async function initAdminPasswordReset(){
  const supabase = createClient(
    "https://giosjwjhalhmwcuyzfos.supabase.co",
    "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_"
  );

  const { data:{ session } } = await supabase.auth.getSession();
  if(!session) return;

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .maybeSingle();

  // Password resets are intentionally Manager-only. Senior Staff can manage
  // ordinary roster tasks, but cannot take over another person's login.
  if(me?.role !== "manager") return;

  installStyles();

  let users = [];
  let refreshTimer = null;
  let refreshing = false;

  async function invokeManageUsers(payload){
    const { data, error } = await supabase.functions.invoke("manage-users", { body: payload });
    if(error){
      let detail = error.message || "Request failed.";
      try{ detail = (await error.context?.json())?.error || detail; }catch(_){}
      throw new Error(detail);
    }
    if(data?.error) throw new Error(data.error);
    return data;
  }

  async function resetPassword(userId, password){
    const { data, error } = await supabase.functions.invoke("reset-staff-password", {
      body: { id:userId, password }
    });
    if(error){
      let detail = error.message || "Password reset failed.";
      try{ detail = (await error.context?.json())?.error || detail; }catch(_){}
      throw new Error(detail);
    }
    if(data?.error) throw new Error(data.error);
    return data;
  }

  async function refreshUsers(){
    if(refreshing) return;
    refreshing = true;
    try{
      const data = await invokeManageUsers({ action:"list" });
      users = Array.isArray(data?.users) ? data.users : [];
      enhanceRows();
    }catch(error){
      console.warn("Could not prepare Manager password reset controls.", error);
    }finally{
      refreshing = false;
    }
  }

  function rowName(row){
    const nm = row.querySelector(".mgr-nm");
    if(!nm) return "";
    const firstText = [...nm.childNodes].find(node => node.nodeType === Node.TEXT_NODE)?.nodeValue || "";
    return firstText.trim();
  }

  function rowEmail(row){
    const title = row.querySelector(".mgr-nm")?.getAttribute("title") || "";
    const first = title.split(" · ")[0].trim();
    return first.includes("@") ? first.toLowerCase() : "";
  }

  function findUserForRow(row){
    const email = rowEmail(row);
    if(email){
      const byEmail = users.find(user => String(user.email || "").toLowerCase() === email);
      if(byEmail) return byEmail;
    }
    const name = rowName(row);
    return users.find(user => String(user.full_name || "").trim() === name) || null;
  }

  function enhanceRows(){
    const list = document.getElementById("mgrList");
    if(!list) return;

    let missingMap = false;
    list.querySelectorAll(".mgr-row").forEach(row => {
      if(row.dataset.passwordResetReady === "1") return;
      const user = findUserForRow(row);
      if(!user){ missingMap = true; return; }

      row.dataset.passwordResetReady = "1";
      const controls = row.querySelector(".mgr-ctl");
      if(!controls) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "mgr-password-reset";
      button.title = user.has_login
        ? `Reset ${user.full_name}'s password`
        : `${user.full_name} has no sign-in account`;
      button.setAttribute("aria-label", button.title);
      button.disabled = !user.has_login;
      button.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M15 7a4 4 0 1 0-7.7 1.5L3 12.8V17h4v-2h2v-2h2.2l1.3-1.3A4 4 0 0 0 15 7Z"/>
          <path d="M14 7h.01"/>
        </svg>
      `;

      button.addEventListener("click", () => {
        if(user.has_login) openResetDialog(user, button);
      });

      const deleteButton = controls.querySelector(".mgr-del");
      controls.insertBefore(button, deleteButton || null);
    });

    if(missingMap) scheduleRefresh();
  }

  function scheduleRefresh(){
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refreshUsers, 180);
  }

  const waitForList = new MutationObserver(() => enhanceRows());
  const panel = document.getElementById("mgrPanel");
  if(panel) waitForList.observe(panel, { childList:true, subtree:true });

  await refreshUsers();

  function openResetDialog(user, sourceButton){
    document.querySelector(".mgr-password-modal")?.remove();

    const modal = document.createElement("div");
    modal.className = "mgr-password-modal";
    modal.innerHTML = `
      <div class="mgr-password-backdrop" data-pw-close></div>
      <section class="mgr-password-dialog" role="dialog" aria-modal="true" aria-labelledby="mgrPasswordTitle">
        <div class="mgr-password-kicker">Manager security</div>
        <h2 id="mgrPasswordTitle">Reset password</h2>
        <p class="mgr-password-person"></p>

        <label for="mgrNewPassword">New temporary password</label>
        <div class="mgr-password-input-wrap">
          <input id="mgrNewPassword" type="password" autocomplete="new-password" minlength="8" placeholder="At least 8 characters">
          <button class="mgr-password-eye" type="button" aria-label="Show passwords">Show</button>
        </div>

        <label for="mgrConfirmPassword">Confirm temporary password</label>
        <input id="mgrConfirmPassword" type="password" autocomplete="new-password" minlength="8" placeholder="Enter it again">

        <div class="mgr-password-error" aria-live="polite"></div>
        <div class="mgr-password-actions">
          <button class="mgr-password-cancel" type="button">Cancel</button>
          <button class="mgr-password-submit" type="button">Reset password</button>
        </div>
      </section>
    `;

    document.body.appendChild(modal);
    const dialog = modal.querySelector(".mgr-password-dialog");
    const pw = modal.querySelector("#mgrNewPassword");
    const confirm = modal.querySelector("#mgrConfirmPassword");
    const submit = modal.querySelector(".mgr-password-submit");
    const cancel = modal.querySelector(".mgr-password-cancel");
    const eye = modal.querySelector(".mgr-password-eye");
    const error = modal.querySelector(".mgr-password-error");
    modal.querySelector(".mgr-password-person").textContent =
      `${user.full_name} · ${user.email || "staff account"}`;

    let busy = false;
    const close = () => {
      if(busy) return;
      modal.remove();
      sourceButton?.focus();
    };

    cancel.addEventListener("click", close);
    modal.querySelector("[data-pw-close]").addEventListener("click", close);
    dialog.addEventListener("keydown", event => {
      if(event.key === "Escape") close();
    });

    eye.addEventListener("click", () => {
      const show = pw.type === "password";
      pw.type = show ? "text" : "password";
      confirm.type = show ? "text" : "password";
      eye.textContent = show ? "Hide" : "Show";
      eye.setAttribute("aria-label", show ? "Hide passwords" : "Show passwords");
      pw.focus();
    });

    submit.addEventListener("click", async () => {
      error.textContent = "";
      const nextPassword = pw.value;
      if(nextPassword.length < 8){
        error.textContent = "Use at least 8 characters.";
        pw.focus();
        return;
      }
      if(nextPassword !== confirm.value){
        error.textContent = "The two passwords do not match.";
        confirm.focus();
        return;
      }

      busy = true;
      submit.disabled = true;
      cancel.disabled = true;
      eye.disabled = true;
      pw.disabled = true;
      confirm.disabled = true;
      submit.textContent = "Resetting…";

      try{
        await resetPassword(user.id, nextPassword);
        modal.remove();
        if(typeof window.uiAlert === "function"){
          await window.uiAlert(
            "Password reset",
            `${user.full_name}'s password was changed. Give the temporary password to them securely.`
          );
        }else{
          window.alert(`${user.full_name}'s password was changed.`);
        }
        sourceButton?.focus();
      }catch(err){
        busy = false;
        submit.disabled = false;
        cancel.disabled = false;
        eye.disabled = false;
        pw.disabled = false;
        confirm.disabled = false;
        submit.textContent = "Reset password";
        error.textContent = err?.message || "Could not reset the password.";
      }
    });

    pw.focus();
  }
}

function installStyles(){
  if(document.getElementById("mgrPasswordResetStyles")) return;
  const style = document.createElement("style");
  style.id = "mgrPasswordResetStyles";
  style.textContent = `
    #mgrPanel .mgr-password-reset{
      width:30px !important;height:30px !important;min-width:30px !important;
      display:grid !important;place-items:center !important;padding:0 !important;margin:0 !important;
      border:1.5px solid rgba(var(--bp-accent-rgb,21,172,227),.32) !important;
      border-radius:8px !important;background:var(--accent-soft,#e2f4fc) !important;
      color:var(--lagoon-deep,#0b7fb0) !important;box-shadow:none !important;cursor:pointer !important;
    }
    #mgrPanel .mgr-password-reset:hover:not(:disabled){
      border-color:var(--lagoon,#15ace3) !important;background:var(--bp-theme-surface-3,#eef7fc) !important;
      transform:translateY(-1px) !important;
    }
    #mgrPanel .mgr-password-reset:disabled{
      background:var(--bp-theme-surface-2,#f4fafd) !important;border-color:var(--line,#c9dfee) !important;
      color:var(--muted,#5b7080) !important;opacity:.58 !important;cursor:not-allowed !important;
    }
    #mgrPanel .mgr-password-reset svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}

    .mgr-password-modal{position:fixed;inset:0;z-index:100650;display:grid;place-items:center;padding:16px}
    .mgr-password-backdrop{position:absolute;inset:0;background:rgba(3,25,39,.68);backdrop-filter:blur(5px);-webkit-backdrop-filter:blur(5px)}
    .mgr-password-dialog{position:relative;z-index:1;width:min(430px,100%);padding:20px;border:1.5px solid var(--line,#c9dfee);border-radius:18px;background:var(--panel,#fff);color:var(--ink,#0a2233);box-shadow:0 28px 90px -28px rgba(2,28,44,.75)}
    .mgr-password-kicker{color:var(--lagoon-deep,#0b7fb0);font-size:9px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}
    .mgr-password-dialog h2{margin:4px 0 0;color:var(--ink,#0a2233);font-family:"Bricolage Grotesque","Inter",sans-serif;font-size:21px}
    .mgr-password-person{margin:7px 0 16px;color:var(--muted,#5b7080);font-size:11px;overflow-wrap:anywhere}
    .mgr-password-dialog label{display:block;margin:11px 0 6px;color:var(--ink-soft,#28455c);font-size:9px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}
    .mgr-password-dialog input{width:100%;min-height:42px;margin:0 !important;padding:10px 12px;border:1.5px solid var(--line,#c9dfee);border-radius:10px;background:var(--bp-theme-input,#f8fcfe);color:var(--ink,#0a2233);font:500 12px "Inter",sans-serif;outline:none}
    .mgr-password-dialog input:focus{border-color:var(--lagoon,#15ace3) !important;box-shadow:0 0 0 3px rgba(var(--bp-accent-rgb,21,172,227),.16) !important}
    .mgr-password-input-wrap{position:relative}
    .mgr-password-input-wrap input{padding-right:66px}
    .mgr-password-eye{position:absolute;top:50%;right:7px;transform:translateY(-50%);width:auto !important;min-width:48px !important;min-height:30px !important;margin:0 !important;padding:6px 8px !important;border:0 !important;border-radius:8px !important;background:transparent !important;color:var(--lagoon-deep,#0b7fb0) !important;box-shadow:none !important;font-size:10px !important;font-weight:800 !important}
    .mgr-password-error{min-height:18px;margin-top:10px;color:var(--error-ink,#a62a2a);font-size:10px;font-weight:700}
    .mgr-password-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:7px}
    .mgr-password-actions button{width:auto !important;min-height:38px !important;margin:0 !important;padding:9px 13px !important;border-radius:10px !important;font-size:11px !important;font-weight:800 !important}
    .mgr-password-cancel{border:1.5px solid var(--line,#c9dfee) !important;background:var(--bp-theme-surface-2,#f4fafd) !important;color:var(--ink,#0a2233) !important;box-shadow:none !important}
    .mgr-password-submit{border:1px solid transparent !important;background:linear-gradient(180deg,var(--lagoon,#15ace3),var(--lagoon-deep,#0b7fb0)) !important;color:var(--bp-accent-contrast,#fff) !important}
    .mgr-password-actions button:disabled{opacity:.58 !important;cursor:not-allowed !important;transform:none !important}
    html[data-bp-theme="dark"] .mgr-password-dialog,html[data-bp-theme="amoled"] .mgr-password-dialog{background:var(--panel) !important;border-color:var(--bp-card-border,var(--line)) !important;color:var(--ink) !important}
  `;
  document.head.appendChild(style);
}

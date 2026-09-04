import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const INIT_KEY = "__staffRecycleBinInit_20260904";

if(!window[INIT_KEY]){
  window[INIT_KEY] = true;
  void initRecycleBin();
}

async function initRecycleBin(){
  const db = createClient(
    "https://giosjwjhalhmwcuyzfos.supabase.co",
    "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_"
  );

  const { data:{ session } } = await db.auth.getSession();
  if(!session) return;

  const { data: me, error: meError } = await db
    .from("profiles")
    .select("id, role, form_role")
    .eq("id", session.user.id)
    .maybeSingle();

  if(meError || !me) return;

  const canUseRecycleBin =
    me.role === "manager" ||
    me.form_role === "Senior Staff";

  if(!canUseRecycleBin) return;

  ensureStyles();

  const ui = injectUi();
  if(!ui) return;

  let state = {
    tier: me.role === "manager" ? "manager" : "senior",
    items: [],
    profiles: [],
    groups: [],
    loading: false,
    restoringAll: false
  };

  async function admin(payload){
    const { data, error } = await db.functions.invoke("manage-users", {
      body: payload
    });

    if(error){
      let detail = error.message || "Request failed.";
      try{
        const parsed = await error.context?.json();
        if(parsed?.error) detail = parsed.error;
      }catch(_){}
      throw new Error(detail);
    }

    if(data?.error) throw new Error(data.error);
    return data;
  }

  function ensureStyles(){
    if(document.getElementById("recycle-bin-styles")) return;

    const link = document.createElement("link");
    link.id = "recycle-bin-styles";
    link.rel = "stylesheet";
    link.href = "css/recycle-bin.css?v=20260904-1549";
    document.head.appendChild(link);
  }

  function injectUi(){
    if(document.getElementById("secRecycleBin")){
      return {
        section: document.getElementById("secRecycleBin"),
        openButton: document.getElementById("openRecycleBin"),
        count: document.getElementById("recycleBinCount"),
        modal: document.getElementById("recycleBinModal"),
        content: document.getElementById("recycleBinContent"),
        status: document.getElementById("recycleBinStatus"),
        closeButton: document.getElementById("closeRecycleBin"),
        refreshButton: document.getElementById("refreshRecycleBin"),
        restoreAllButton: document.getElementById("restoreAllRecycleBin"),
        backdrop: document.querySelector("#recycleBinModal .recycle-bin-backdrop")
      };
    }

    const secAdd = document.getElementById("secAdd");
    const mgrPanel = document.getElementById("mgrPanel");
    if(!mgrPanel || !secAdd?.parentNode) return null;

    const section = document.createElement("div");
    section.className = "mgr-sec mgr-add-button-sec";
    section.id = "secRecycleBin";

    const openButton = document.createElement("button");
    openButton.className = "mgr-add-launch recycle-bin-launch";
    openButton.id = "openRecycleBin";
    openButton.type = "button";
    openButton.innerHTML = `
      <span class="mgr-add-launch-icon" aria-hidden="true">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2.1" stroke-linecap="round"
          stroke-linejoin="round">
          <path d="M4 7h16"/>
          <path d="M9 7V4h6v3"/>
          <path d="M6 7l1 13h10l1-13"/>
          <path d="M10 11v5M14 11v5"/>
        </svg>
      </span>
      <span class="recycle-bin-launch-copy">
        <span>Recycle Bin</span>
        <small>Restore deleted records</small>
      </span>
      <span class="recycle-bin-launch-count" id="recycleBinCount">0</span>
    `;
    section.appendChild(openButton);

    secAdd.parentNode.insertBefore(section, secAdd);

    const modal = document.createElement("div");
    modal.className = "recycle-bin-modal";
    modal.id = "recycleBinModal";
    modal.hidden = true;

    modal.innerHTML = `
      <div class="recycle-bin-backdrop" data-recycle-close></div>
      <section class="recycle-bin-dialog" role="dialog" aria-modal="true" aria-labelledby="recycleBinTitle">
        <header class="recycle-bin-head">
          <div>
            <div class="recycle-bin-kicker">Staff administration</div>
            <h2 id="recycleBinTitle">Recycle Bin</h2>
            <p>Restore deleted evaluation records and deleted staff accounts.</p>
          </div>
          <button class="recycle-bin-close" id="closeRecycleBin" type="button"
            aria-label="Close Recycle Bin">×</button>
        </header>
        <div class="recycle-bin-toolbar">
          <div class="recycle-bin-status" id="recycleBinStatus"></div>
          <div class="recycle-bin-toolbar-actions">
            <button class="recycle-bin-restore-all" id="restoreAllRecycleBin" type="button">
              Restore all
            </button>
            <button class="recycle-bin-refresh" id="refreshRecycleBin" type="button">
              Refresh
            </button>
          </div>
        </div>
        <div class="recycle-bin-content" id="recycleBinContent"></div>
      </section>
    `;

    document.body.appendChild(modal);

    return {
      section,
      openButton,
      count: modal.ownerDocument.getElementById("recycleBinCount"),
      modal,
      content: modal.querySelector("#recycleBinContent"),
      status: modal.querySelector("#recycleBinStatus"),
      closeButton: modal.querySelector("#closeRecycleBin"),
      refreshButton: modal.querySelector("#refreshRecycleBin"),
      restoreAllButton: modal.querySelector("#restoreAllRecycleBin"),
      backdrop: modal.querySelector("[data-recycle-close]")
    };
  }

  let previousOverflow = "";

  function openModal(){
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ui.modal.hidden = false;
    ui.openButton.setAttribute("aria-expanded", "true");
    ui.closeButton.focus();
    void loadItems(true);
  }

  function closeModal(){
    ui.modal.hidden = true;
    ui.openButton.setAttribute("aria-expanded", "false");
    document.body.style.overflow = previousOverflow;
    ui.openButton.focus();
  }

  ui.openButton.setAttribute("aria-expanded", "false");
  ui.openButton.addEventListener("click", openModal);
  ui.closeButton.addEventListener("click", closeModal);
  ui.backdrop.addEventListener("click", closeModal);
  ui.refreshButton?.addEventListener("click", () => loadItems(true));
  ui.restoreAllButton?.addEventListener("click", restoreAll);

  document.addEventListener("keydown", event => {
    if(event.key !== "Escape" || ui.modal.hidden) return;
    if(document.querySelector(".recycle-action-modal, .recycle-password-modal")) return;
    closeModal();
  });

  window.addEventListener("staff-finalized-data-changed", () => {
    if(!ui.modal.hidden){
      void loadItems(true);
    }else{
      void refreshCount();
    }
  });

  function setStatus(text, kind=""){
    ui.status.textContent = text || "";
    ui.status.className = "recycle-bin-status" + (kind ? ` ${kind}` : "");
  }

  async function refreshCount(){
    try{
      const data = await admin({ action:"recycle_list" });
      const groups = buildGroups(data.items || [], data.profiles || []);
      ui.count.textContent = String(groups.length);
    }catch(_){
      // Count is non-critical. The full error is shown when the user opens it.
    }
  }

  async function loadItems(force=false){
    if(state.loading && !force) return;
    state.loading = true;
    syncRestoreAllButton();

    ui.content.innerHTML = `
      <div class="recycle-bin-loading">
        <span class="recycle-bin-spinner" aria-hidden="true"></span>
        <span>Loading deleted items…</span>
      </div>
    `;
    setStatus("");

    try{
      const data = await admin({ action:"recycle_list" });
      state = {
        ...state,
        tier: data.tier || state.tier,
        items: Array.isArray(data.items) ? data.items : [],
        profiles: Array.isArray(data.profiles) ? data.profiles : [],
        loading: false
      };
      state.groups = buildGroups(state.items, state.profiles);
      ui.count.textContent = String(state.groups.length);
      render();
    }catch(error){
      state.loading = false;
      ui.content.innerHTML = "";
      const box = document.createElement("div");
      box.className = "recycle-bin-error";
      box.textContent = error?.message || "Could not load the Recycle Bin.";
      ui.content.appendChild(box);
      setStatus("Could not load deleted items.", "error");
    }
  }

  function toDate(value){
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function dateKey(value){
    const d = toDate(value);
    if(!d) return "unknown";
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0")
    ].join("-");
  }

  function dateLabel(value){
    const d = toDate(value);
    return d
      ? d.toLocaleDateString(undefined, {
          month:"long",
          day:"numeric",
          year:"numeric"
        })
      : "Unknown date";
  }

  function dateTimeLabel(value){
    const d = toDate(value);
    return d
      ? d.toLocaleString(undefined, {
          month:"short",
          day:"numeric",
          year:"numeric",
          hour:"numeric",
          minute:"2-digit"
        })
      : "Unknown";
  }

  function bool(value){
    return value === true || value === "true";
  }

  function nameMaps(items, profiles){
    const names = new Map();
    const activeIds = new Set();

    for(const profile of profiles){
      if(!profile?.id) continue;
      activeIds.add(String(profile.id));
      if(profile.full_name){
        names.set(String(profile.id), String(profile.full_name));
      }
    }

    for(const item of items){
      if(item?.entity_type !== "profile") continue;
      const payload = item.payload || {};
      if(item.original_id && payload.full_name && !names.has(String(item.original_id))){
        names.set(String(item.original_id), String(payload.full_name));
      }
    }

    return { names, activeIds };
  }

  function buildGroups(items, profiles){
    const { names, activeIds } = nameMaps(items, profiles);
    const result = [];
    const evaluationGroups = new Map();

    for(const item of items){
      if(item?.entity_type === "profile"){
        const payload = item.payload || {};
        result.push({
          kind:"profile",
          id:String(item.id),
          originalId:String(item.original_id || ""),
          item,
          name:String(payload.full_name || "Deleted employee"),
          email:String(payload.__auth_email || ""),
          role:payload.role === "manager" ? "Manager" : "Employee",
          formRole:String(payload.form_role || "—"),
          deletedAt:item.deleted_at,
          deletedBy:names.get(String(item.deleted_by || "")) || "Unknown user",
          managerAccount:payload.role === "manager"
        });
        continue;
      }

      if(item?.entity_type !== "evaluation") continue;

      const payload = item.payload || {};
      const isHistory = bool(payload.archived);
      const employeeId = String(payload.employee_id || "");
      const round = payload.round == null ? "" : String(payload.round);
      const evaluationWhen =
        isHistory
          ? (payload.archived_at || payload.updated_at || payload.created_at)
          : (payload.updated_at || payload.created_at || item.deleted_at);

      const key = [
        isHistory ? "history" : "evaluation",
        employeeId || "unknown",
        dateKey(evaluationWhen),
        round
      ].join("|");

      if(!evaluationGroups.has(key)){
        evaluationGroups.set(key, {
          kind:"evaluation",
          key,
          isHistory,
          employeeId,
          employeeName:names.get(employeeId) || "Unknown employee",
          round,
          evaluationWhen,
          rows:[],
          ids:[],
          deletedAt:item.deleted_at,
          deletedByIds:new Set(),
          missingProfileIds:new Set()
        });
      }

      const group = evaluationGroups.get(key);
      group.rows.push(payload);
      group.ids.push(String(item.id));

      if(toDate(item.deleted_at) > toDate(group.deletedAt)){
        group.deletedAt = item.deleted_at;
      }

      if(item.deleted_by){
        group.deletedByIds.add(String(item.deleted_by));
      }

      for(const dependency of [payload.employee_id, payload.evaluator_id]){
        const id = String(dependency || "");
        if(id && !activeIds.has(id)){
          group.missingProfileIds.add(id);
        }
      }
    }

    for(const group of evaluationGroups.values()){
      const deleters = [...group.deletedByIds]
        .map(id => names.get(id) || "Unknown user");
      group.deletedBy =
        deleters.length === 0 ? "Unknown user" :
        deleters.length === 1 ? deleters[0] :
        "Multiple users";
      group.missingProfiles = [...group.missingProfileIds]
        .map(id => names.get(id) || "Deleted staff account");
      result.push(group);
    }

    result.sort((a,b) => {
      const aTime = toDate(a.deletedAt)?.getTime() || 0;
      const bTime = toDate(b.deletedAt)?.getTime() || 0;
      return bTime - aTime;
    });

    return result;
  }

  function getRestoreAllPlan(){
    const profileGroups = state.groups.filter(group => group.kind === "profile");
    const evaluationGroups = state.groups.filter(group => group.kind === "evaluation");

    const restorableProfiles = profileGroups.filter(group =>
      Boolean(group.email) &&
      (!group.managerAccount || state.tier === "manager")
    );
    const restorableProfileIds = new Set(
      restorableProfiles.map(group => group.originalId).filter(Boolean)
    );

    const blockedProfiles = profileGroups.filter(group =>
      !restorableProfiles.includes(group)
    );

    const restorableEvaluations = evaluationGroups.filter(group =>
      [...group.missingProfileIds].every(id => restorableProfileIds.has(id))
    );
    const blockedEvaluations = evaluationGroups.filter(group =>
      !restorableEvaluations.includes(group)
    );

    return {
      restorableProfiles,
      blockedProfiles,
      restorableEvaluations,
      blockedEvaluations
    };
  }

  function syncRestoreAllButton(){
    if(!ui.restoreAllButton) return;
    const plan = getRestoreAllPlan();
    const available = plan.restorableProfiles.length + plan.restorableEvaluations.length;
    ui.restoreAllButton.disabled = state.loading || state.restoringAll || available === 0;
    ui.restoreAllButton.title = available
      ? `Restore ${available} available deleted item${available === 1 ? "" : "s"}`
      : "No deleted items can currently be restored.";
  }

  function setBulkBusy(busy){
    state.restoringAll = busy;
    ui.modal.classList.toggle("recycle-bin-is-busy", busy);
    ui.modal.querySelector(".recycle-bin-dialog")?.setAttribute("aria-busy", String(busy));
    if(ui.refreshButton) ui.refreshButton.disabled = busy;
    ui.content.querySelectorAll(".recycle-bin-restore").forEach(button => {
      button.disabled = busy || button.disabled;
    });
    syncRestoreAllButton();
  }

  function refreshSharedViews(source="recycle-restore"){
    try{
      if(typeof window.__refreshResults === "function"){
        window.__refreshResults();
      }
    }catch(_){}

    window.dispatchEvent(new CustomEvent("staff-finalized-data-changed", {
      detail: { source }
    }));
  }

  function render(){
    ui.content.innerHTML = "";

    if(!state.groups.length){
      const empty = document.createElement("div");
      empty.className = "recycle-bin-empty";
      empty.innerHTML = `
        <div class="recycle-bin-empty-icon" aria-hidden="true">✓</div>
        <strong>Recycle Bin is empty</strong>
        <span>Deleted evaluations and employees will appear here.</span>
      `;
      ui.content.appendChild(empty);
      setStatus("0 deleted items");
      syncRestoreAllButton();
      return;
    }

    const history = state.groups.filter(g => g.kind === "evaluation" && g.isHistory);
    const live = state.groups.filter(g => g.kind === "evaluation" && !g.isHistory);
    const profiles = state.groups.filter(g => g.kind === "profile");

    const sections = [
      ["Deleted History", history],
      ["Deleted Evaluations", live],
      ["Deleted Employees", profiles]
    ];

    for(const [title, groups] of sections){
      if(!groups.length) continue;

      const section = document.createElement("section");
      section.className = "recycle-bin-group";

      const heading = document.createElement("div");
      heading.className = "recycle-bin-group-head";

      const h3 = document.createElement("h3");
      h3.textContent = title;

      const badge = document.createElement("span");
      badge.textContent = String(groups.length);

      heading.append(h3, badge);
      section.appendChild(heading);

      for(const group of groups){
        section.appendChild(
          group.kind === "profile"
            ? renderProfileCard(group)
            : renderEvaluationCard(group)
        );
      }

      ui.content.appendChild(section);
    }

    setStatus(
      `${state.groups.length} deleted item${state.groups.length === 1 ? "" : "s"}`
    );
    syncRestoreAllButton();
  }

  function addMeta(container, label, value){
    const item = document.createElement("div");
    item.className = "recycle-bin-meta-item";

    const key = document.createElement("span");
    key.textContent = label;

    const val = document.createElement("strong");
    val.textContent = value || "—";

    item.append(key, val);
    container.appendChild(item);
  }

  function renderEvaluationCard(group){
    const card = document.createElement("article");
    card.className = "recycle-bin-card";

    const top = document.createElement("div");
    top.className = "recycle-bin-card-top";

    const titleWrap = document.createElement("div");

    const type = document.createElement("div");
    type.className = "recycle-bin-type";
    type.textContent = group.isHistory
      ? "Deleted evaluation history"
      : "Deleted evaluation";

    const name = document.createElement("h4");
    name.textContent = group.employeeName;

    titleWrap.append(type, name);

    const restore = document.createElement("button");
    restore.type = "button";
    restore.className = "recycle-bin-restore";
    restore.textContent = "Restore";

    if(group.missingProfileIds.size){
      restore.disabled = true;
      restore.title = "Restore the missing employee account first.";
    }

    restore.addEventListener("click", () => restoreEvaluationGroup(group, restore));

    top.append(titleWrap, restore);
    card.appendChild(top);

    const meta = document.createElement("div");
    meta.className = "recycle-bin-meta";

    addMeta(meta, group.isHistory ? "Evaluation date" : "Evaluation record date",
      dateLabel(group.evaluationWhen));
    addMeta(meta, "Evaluator submissions",
      String(group.rows.length));
    if(group.round){
      addMeta(meta, "Round", group.round);
    }
    addMeta(meta, "Date deleted", dateTimeLabel(group.deletedAt));
    addMeta(meta, "Deleted by", group.deletedBy);

    card.appendChild(meta);

    if(group.missingProfileIds.size){
      const note = document.createElement("div");
      note.className = "recycle-bin-note warning";
      note.textContent =
        "Restore the related deleted staff account first so the evaluation can be linked to a valid profile.";
      card.appendChild(note);
    }

    return card;
  }

  function renderProfileCard(group){
    const card = document.createElement("article");
    card.className = "recycle-bin-card";

    const top = document.createElement("div");
    top.className = "recycle-bin-card-top";

    const titleWrap = document.createElement("div");

    const type = document.createElement("div");
    type.className = "recycle-bin-type";
    type.textContent = "Deleted employee";

    const name = document.createElement("h4");
    name.textContent = group.name;

    titleWrap.append(type, name);

    const restore = document.createElement("button");
    restore.type = "button";
    restore.className = "recycle-bin-restore";
    restore.textContent = "Restore";

    const seniorBlocked =
      group.managerAccount &&
      state.tier !== "manager";

    if(seniorBlocked){
      restore.disabled = true;
      restore.title = "Only a Manager can restore a Manager account.";
    }

    restore.addEventListener("click", () => restoreProfile(group, restore));

    top.append(titleWrap, restore);
    card.appendChild(top);

    const meta = document.createElement("div");
    meta.className = "recycle-bin-meta";

    addMeta(meta, "Previous access", group.role);
    addMeta(meta, "Previous form role", group.formRole);
    addMeta(meta, "Email", group.email || "No recoverable email");
    addMeta(meta, "Date deleted", dateTimeLabel(group.deletedAt));
    addMeta(meta, "Deleted by", group.deletedBy);

    card.appendChild(meta);

    if(seniorBlocked){
      const note = document.createElement("div");
      note.className = "recycle-bin-note warning";
      note.textContent = "Manager accounts can only be restored by another Manager.";
      card.appendChild(note);
    }else if(!group.email){
      const note = document.createElement("div");
      note.className = "recycle-bin-note warning";
      note.textContent = "This deleted employee has no recoverable sign-in email.";
      card.appendChild(note);
      restore.disabled = true;
    }

    return card;
  }

  function showActionDialog({ title, message, okText="OK", cancelText="Cancel", showCancel=true }){
    return new Promise(resolve => {
      const overlay = document.createElement("div");
      overlay.className = "recycle-action-modal";

      const backdrop = document.createElement("div");
      backdrop.className = "recycle-action-backdrop";

      const dialog = document.createElement("section");
      dialog.className = "recycle-action-dialog";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-label", title);

      const kicker = document.createElement("div");
      kicker.className = "recycle-action-kicker";
      kicker.textContent = "Recycle Bin";

      const heading = document.createElement("h3");
      heading.textContent = title;

      const copy = document.createElement("p");
      copy.textContent = message;

      const actions = document.createElement("div");
      actions.className = "recycle-action-actions";

      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "recycle-action-cancel";
      cancel.textContent = cancelText;

      const ok = document.createElement("button");
      ok.type = "button";
      ok.className = "recycle-action-ok";
      ok.textContent = okText;

      if(showCancel) actions.appendChild(cancel);
      actions.appendChild(ok);
      dialog.append(kicker, heading, copy, actions);
      overlay.append(backdrop, dialog);

      function finish(value){
        overlay.remove();
        resolve(value);
      }

      ok.addEventListener("click", () => finish(true));
      cancel.addEventListener("click", () => finish(false));
      backdrop.addEventListener("click", () => finish(showCancel ? false : true));
      overlay.addEventListener("keydown", event => {
        if(event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        finish(showCancel ? false : true);
      });

      document.body.appendChild(overlay);
      setTimeout(() => ok.focus(), 0);
    });
  }

  async function confirmAction(title, message, okText="Restore"){
    return showActionDialog({ title, message, okText, showCancel:true });
  }

  async function alertUser(title, message){
    await showActionDialog({ title, message, okText:"OK", showCancel:false });
  }

  async function restoreAll(){
    if(state.loading || state.restoringAll) return;

    const plan = getRestoreAllPlan();
    const availableCount = plan.restorableProfiles.length + plan.restorableEvaluations.length;
    if(!availableCount){
      await alertUser(
        "Nothing can be restored yet",
        "The remaining items depend on deleted staff accounts that cannot currently be restored, or require Manager access."
      );
      return;
    }

    const evaluationRows = plan.restorableEvaluations.reduce(
      (sum, group) => sum + group.rows.length,
      0
    );
    const blockedCount = plan.blockedProfiles.length + plan.blockedEvaluations.length;
    const details = [
      `${plan.restorableProfiles.length} deleted employee account${plan.restorableProfiles.length === 1 ? "" : "s"}`,
      `${plan.restorableEvaluations.length} evaluation group${plan.restorableEvaluations.length === 1 ? "" : "s"} (${evaluationRows} row${evaluationRows === 1 ? "" : "s"})`
    ];
    if(blockedCount){
      details.push(`${blockedCount} unavailable item${blockedCount === 1 ? "" : "s"} will be skipped`);
    }

    const ok = await confirmAction(
      "Restore all available items?",
      `This will restore ${details.join(", ")}. Staff accounts are restored first so linked evaluations can reconnect to valid profiles.`,
      "Restore all"
    );
    if(!ok) return;

    let passwords = new Map();
    if(plan.restorableProfiles.length){
      const entered = await askBulkTemporaryPasswords(plan.restorableProfiles);
      if(entered == null) return;
      passwords = entered;
    }

    setBulkBusy(true);
    setStatus("Restoring all available items…");

    const restoredProfileIds = new Set();
    let restoredProfiles = 0;
    let restoredEvaluationRows = 0;
    let skippedAfterFailure = 0;
    const failures = [];

    for(const group of plan.restorableProfiles){
      try{
        await admin({
          action:"recycle_restore_profile",
          recycle_id:group.id,
          password:passwords.get(group.id) || ""
        });
        restoredProfiles += 1;
        if(group.originalId) restoredProfileIds.add(group.originalId);
      }catch(error){
        failures.push(`${group.name}: ${error?.message || "Could not restore employee"}`);
      }
    }

    for(const group of plan.restorableEvaluations){
      const dependenciesReady = [...group.missingProfileIds].every(id =>
        restoredProfileIds.has(id)
      );

      if(!dependenciesReady){
        skippedAfterFailure += 1;
        continue;
      }

      try{
        const data = await admin({
          action:"recycle_restore_evaluations",
          ids:group.ids
        });
        restoredEvaluationRows += Number(data.restored || group.rows.length);
      }catch(error){
        failures.push(`${group.employeeName}: ${error?.message || "Could not restore evaluation"}`);
      }
    }

    refreshSharedViews("recycle-restore-all");

    const skipped = blockedCount + skippedAfterFailure;
    const summary = [
      `${restoredProfiles} employee account${restoredProfiles === 1 ? "" : "s"} restored.`,
      `${restoredEvaluationRows} evaluation row${restoredEvaluationRows === 1 ? "" : "s"} restored.`
    ];
    if(skipped){
      summary.push(`${skipped} item${skipped === 1 ? "" : "s"} skipped because a required account could not be restored or access is restricted.`);
    }
    if(failures.length){
      const shown = failures.slice(0, 3).join("\n");
      summary.push(`Some restores failed:\n${shown}${failures.length > 3 ? `\n+${failures.length - 3} more` : ""}`);
    }

    setBulkBusy(false);
    await alertUser(
      failures.length || skipped ? "Restore All finished" : "Restore All complete",
      summary.join("\n\n")
    );

    window.location.reload();
  }

  async function restoreEvaluationGroup(group, button){
    const label = group.isHistory
      ? `${group.employeeName}'s archived evaluation from ${dateLabel(group.evaluationWhen)}`
      : `${group.employeeName}'s deleted evaluation`;

    const ok = await confirmAction(
      "Restore evaluation?",
      `${label} will be restored with ${group.rows.length} evaluator submission${group.rows.length === 1 ? "" : "s"}.`,
      "Restore"
    );
    if(!ok) return;

    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    setStatus("Restoring evaluation…");

    try{
      const data = await admin({
        action:"recycle_restore_evaluations",
        ids:group.ids
      });

      refreshSharedViews("recycle-restore");

      await alertUser(
        "Restored",
        `${data.restored || group.rows.length} evaluation row${(data.restored || group.rows.length) === 1 ? "" : "s"} restored successfully.`
      );

      // A full reload guarantees History, Team Average graph/evaluator details,
      // latest/overall rankings, cards and performance trends are all rebuilt
      // from exactly the same Supabase state.
      window.location.reload();
    }catch(error){
      button.disabled = false;
      button.removeAttribute("aria-busy");
      setStatus("Restore failed.", "error");
      await alertUser("Could not restore evaluation", error?.message || "Unknown error");
    }
  }

  async function restoreProfile(group, button){
    if(group.managerAccount && state.tier !== "manager"){
      await alertUser(
        "Manager access required",
        "Only a Manager can restore a deleted Manager account."
      );
      return;
    }

    const password = await askTemporaryPassword(group.name);
    if(password == null) return;

    if(password.length < 8){
      await alertUser(
        "Password too short",
        "Use at least 8 characters for the temporary password."
      );
      return;
    }

    const ok = await confirmAction(
      "Restore employee?",
      `${group.name} will be restored with the saved profile details and the temporary password you entered.`,
      "Restore employee"
    );
    if(!ok) return;

    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    setStatus("Restoring employee…");

    try{
      const data = await admin({
        action:"recycle_restore_profile",
        recycle_id:group.id,
        password
      });

      await alertUser(
        "Employee restored",
        `${data.full_name || group.name} has been restored. The temporary password is now active for sign-in.`
      );

      window.location.reload();
    }catch(error){
      button.disabled = false;
      button.removeAttribute("aria-busy");
      setStatus("Restore failed.", "error");
      await alertUser("Could not restore employee", error?.message || "Unknown error");
    }
  }

  function askTemporaryPassword(name){
    return new Promise(resolve => {
      const overlay = document.createElement("div");
      overlay.className = "recycle-password-modal";

      const backdrop = document.createElement("div");
      backdrop.className = "recycle-password-backdrop";

      const dialog = document.createElement("form");
      dialog.className = "recycle-password-dialog";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-labelledby", "recyclePasswordTitle");
      dialog.innerHTML = `
        <div class="recycle-password-kicker">Restore sign-in account</div>
        <h3 id="recyclePasswordTitle">Set temporary password</h3>
        <p></p>
        <label>
          Temporary password
          <input type="password" autocomplete="new-password" minlength="8"
            placeholder="At least 8 characters" required>
        </label>
        <div class="recycle-password-actions">
          <button type="button" class="recycle-password-cancel">Cancel</button>
          <button type="submit" class="recycle-password-submit">Continue</button>
        </div>
      `;

      dialog.querySelector("p").textContent =
        `Passwords cannot be recovered. Set a temporary password for ${name}.`;

      const input = dialog.querySelector("input");
      const cancel = dialog.querySelector(".recycle-password-cancel");

      function finish(value){
        overlay.remove();
        resolve(value);
      }

      cancel.addEventListener("click", () => finish(null));
      backdrop.addEventListener("click", () => finish(null));
      overlay.addEventListener("keydown", event => {
        if(event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        finish(null);
      });

      dialog.addEventListener("submit", event => {
        event.preventDefault();
        finish(input.value);
      });

      overlay.append(backdrop, dialog);
      document.body.appendChild(overlay);
      setTimeout(() => input.focus(), 0);
    });
  }

  function askBulkTemporaryPasswords(groups){
    return new Promise(resolve => {
      const overlay = document.createElement("div");
      overlay.className = "recycle-password-modal";

      const backdrop = document.createElement("div");
      backdrop.className = "recycle-password-backdrop";

      const dialog = document.createElement("form");
      dialog.className = "recycle-password-dialog recycle-password-dialog-bulk";
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-labelledby", "recycleBulkPasswordTitle");

      const kicker = document.createElement("div");
      kicker.className = "recycle-password-kicker";
      kicker.textContent = "Restore all staff accounts";

      const title = document.createElement("h3");
      title.id = "recycleBulkPasswordTitle";
      title.textContent = "Set temporary passwords";

      const copy = document.createElement("p");
      copy.textContent =
        "Passwords cannot be recovered. Enter a temporary password of at least 8 characters for each deleted employee.";

      const list = document.createElement("div");
      list.className = "recycle-password-list";

      for(const group of groups){
        const row = document.createElement("label");
        row.className = "recycle-password-row";

        const person = document.createElement("span");
        person.className = "recycle-password-person";
        const strong = document.createElement("strong");
        strong.textContent = group.name;
        const small = document.createElement("small");
        small.textContent = group.email;
        person.append(strong, small);

        const input = document.createElement("input");
        input.type = "password";
        input.autocomplete = "new-password";
        input.minLength = 8;
        input.required = true;
        input.placeholder = "Temporary password";
        input.dataset.recycleId = group.id;

        row.append(person, input);
        list.appendChild(row);
      }

      const actions = document.createElement("div");
      actions.className = "recycle-password-actions";
      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "recycle-password-cancel";
      cancel.textContent = "Cancel";
      const submit = document.createElement("button");
      submit.type = "submit";
      submit.className = "recycle-password-submit";
      submit.textContent = "Continue";
      actions.append(cancel, submit);

      dialog.append(kicker, title, copy, list, actions);
      overlay.append(backdrop, dialog);

      function finish(value){
        overlay.remove();
        resolve(value);
      }

      cancel.addEventListener("click", () => finish(null));
      backdrop.addEventListener("click", () => finish(null));
      overlay.addEventListener("keydown", event => {
        if(event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        finish(null);
      });

      dialog.addEventListener("submit", event => {
        event.preventDefault();
        const result = new Map();
        for(const input of dialog.querySelectorAll("input[data-recycle-id]")){
          if(input.value.length < 8){
            input.focus();
            input.reportValidity();
            return;
          }
          result.set(input.dataset.recycleId, input.value);
        }
        finish(result);
      });

      document.body.appendChild(overlay);
      setTimeout(() => dialog.querySelector("input")?.focus(), 0);
    });
  }

  // Load only the count at startup. The full list is refreshed every time the
  // modal is opened, so it never depends on a stale frontend cache.
  void refreshCount();
}

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* =========================================================
   CURRENT ROUND STAFF EXEMPTIONS
   - Manager / Senior Staff can exempt an unavailable staff member.
   - Exempted staff are excluded both as evaluatees and required evaluators.
   - The database keeps the reason and an audit trail.
   - Existing evaluation data is never deleted by this feature.
   ========================================================= */

const SUPABASE_URL = "https://giosjwjhalhmwcuyzfos.supabase.co";
const SUPABASE_KEY = "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_";
const db = createClient(SUPABASE_URL, SUPABASE_KEY);
const BUCKET = "profile-pictures";
const CRITERIA_TOTAL = 10;

let uid = "";
let me = null;
let profiles = [];
let roster = [];
let canManage = false;

let exemptedIds = new Set();
let exemptedNames = new Set();
let exemptionReasonById = new Map();
let profileById = new Map();
let profileIdByName = new Map();

let liveRowsCache = [];
let liveRowsAt = 0;
let liveRowsPromise = null;
let patchQueued = false;
let patchRunning = false;
let patchAgain = false;
let refreshPromise = null;
let manageModal = null;
let realtimeChannel = null;

const normalize = value => String(value || "")
  .toLowerCase()
  .replace(/\s+/g, " ")
  .trim();

const clamp = (value,min,max) => Math.max(min,Math.min(max,value));

function setText(node,value){
  if(!node) return;
  const next = String(value ?? "");
  if(node.textContent !== next) node.textContent = next;
}

function setWidth(node,value){
  if(!node) return;
  const next = String(value);
  if(node.style.width !== next) node.style.width = next;
}

function initials(name){
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return (
    (parts[0]?.[0] || "") +
    (parts.length > 1 ? parts.at(-1)?.[0] || "" : "")
  ).toUpperCase() || "—";
}

function publicAvatarUrl(path){
  if(!path) return "";
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function isScoringMode(){
  const backBar = document.getElementById("backBar");
  return !backBar || backBar.classList.contains("hide");
}

function isExemptedName(name){
  return exemptedNames.has(normalize(name));
}

function reasonForId(id){
  return exemptionReasonById.get(id) ||
    "Exempted from the current evaluation round.";
}

function reasonForName(name){
  const id = profileIdByName.get(normalize(name));
  return id ? reasonForId(id) : "Exempted from the current evaluation round.";
}

async function showNotice(title,message){
  if(typeof window.uiAlert === "function"){
    return window.uiAlert(title,message);
  }
  window.alert(title + "\n\n" + message);
}

async function askConfirm(title,message,ok="Continue"){
  if(typeof window.uiConfirm === "function"){
    return window.uiConfirm(title,message,{ok});
  }
  return window.confirm(title + "\n\n" + message);
}

function injectStyles(){
  if(document.getElementById("round-exemption-style")) return;

  const style = document.createElement("style");
  style.id = "round-exemption-style";
  style.textContent = `
    .round-progress-summary.has-exemptions{
      grid-template-columns:repeat(4,minmax(0,1fr));
    }

    .round-progress-summary-card.exempted{
      background:#fff8e8;
      border-color:#ecd9a6;
    }

    .round-progress-summary-card.exempted strong,
    .round-progress-summary-card.exempted span{
      color:#8a641d;
    }

    .round-exemption-toolbar{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
      margin:0 0 12px;
      padding:9px 10px;
      border:1.5px solid var(--line,#c9dfee);
      border-radius:12px;
      background:#f7fbfd;
    }

    .round-exemption-toolbar-copy{
      min-width:0;
    }

    .round-exemption-toolbar-copy strong{
      display:block;
      color:var(--ink,#0a2233);
      font-size:10.5px;
      line-height:1.25;
      font-weight:800;
    }

    .round-exemption-toolbar-copy span{
      display:block;
      margin-top:2px;
      color:var(--muted,#5b7080);
      font-size:9px;
      line-height:1.3;
    }

    .round-exemption-manage-btn{
      flex:0 0 auto;
      border:1.5px solid #bfe4f5;
      border-radius:9px;
      padding:7px 9px;
      background:var(--accent-soft,#e2f4fc);
      color:var(--lagoon-deep,#0b7fb0);
      font:800 9.5px/1 "Inter",sans-serif;
      cursor:pointer;
    }

    .round-exemption-manage-btn:hover{
      border-color:var(--lagoon,#15ace3);
      background:#d7f0fb;
    }

    .round-exempted-list{
      display:flex;
      flex-direction:column;
      gap:9px;
      margin-top:9px;
    }

    .round-exempted-person{
      padding:12px 13px;
      border:1.5px solid #ecd9a6;
      border-radius:14px;
      background:#fffdf7;
    }

    .round-exempted-head{
      display:flex;
      align-items:flex-start;
      gap:10px;
      min-width:0;
    }

    .round-exempted-avatar{
      flex:0 0 38px;
      width:38px;
      height:38px;
      display:grid;
      place-items:center;
      overflow:hidden;
      border:1px solid #e6d6ae;
      border-radius:11px;
      background:#fff4d8;
      color:#8a641d;
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:12px;
      font-weight:800;
    }

    .round-exempted-avatar img{
      display:block;
      width:100%;
      height:100%;
      object-fit:cover;
    }

    .round-exempted-copy{
      flex:1 1 auto;
      min-width:0;
    }

    .round-exempted-name{
      display:block;
      color:var(--ink,#0a2233);
      font-size:12.5px;
      line-height:1.3;
      font-weight:800;
      overflow-wrap:anywhere;
    }

    .round-exempted-reason{
      display:block;
      margin-top:3px;
      color:#76623b;
      font-size:10px;
      line-height:1.4;
      overflow-wrap:anywhere;
    }

    .round-exempted-state{
      flex:0 0 auto;
      padding:4px 8px;
      border:1px solid #ecd9a6;
      border-radius:999px;
      background:#fff3d1;
      color:#8a641d;
      font-size:8.5px;
      line-height:1.25;
      font-weight:800;
      letter-spacing:.05em;
      text-transform:uppercase;
      white-space:nowrap;
    }

    .round-exempted-note{
      margin-top:9px;
      color:#826d43;
      font-size:9.5px;
      line-height:1.35;
      font-weight:700;
    }

    .res-row.round-exempted-result{
      border-color:#ead8a8 !important;
      background:#fffdf7 !important;
      cursor:default !important;
    }

    .res-row.round-exempted-result .res-ct{
      color:#8a641d;
    }

    .res-row.round-exempted-result .res-bar{
      background:#f3ead3;
    }

    .res-row.round-exempted-result .res-bar span{
      width:100% !important;
      background:#d7b75f !important;
    }

    .round-exemption-result-reason{
      display:block;
      margin-top:5px;
      color:#826d43;
      font-size:9px;
      line-height:1.3;
      text-align:left;
      overflow-wrap:anywhere;
    }

    .round-exemption-modal[hidden]{
      display:none !important;
    }

    .round-exemption-modal{
      position:fixed;
      inset:0;
      z-index:100030;
      display:grid;
      place-items:center;
      padding:18px;
    }

    .round-exemption-backdrop{
      position:absolute;
      inset:0;
      background:rgba(4,24,36,.62);
      backdrop-filter:blur(5px);
      -webkit-backdrop-filter:blur(5px);
    }

    .round-exemption-dialog{
      position:relative;
      z-index:1;
      width:min(620px,100%);
      max-height:min(88vh,760px);
      overflow:auto;
      overscroll-behavior:contain;
      border:1.5px solid var(--line,#c9dfee);
      border-radius:20px;
      background:#fff;
      box-shadow:0 28px 80px -22px rgba(4,32,50,.52);
    }

    .round-exemption-head{
      position:sticky;
      top:0;
      z-index:2;
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:14px;
      padding:19px 20px 16px;
      color:#fff;
      background:
        radial-gradient(100% 150% at 100% 0%,rgba(21,172,227,.48),transparent 60%),
        linear-gradient(145deg,#0b536f 0%,#08344c 58%,#051f30 100%);
    }

    .round-exemption-kicker{
      margin-bottom:4px;
      color:rgba(218,242,252,.78);
      font-size:9px;
      font-weight:800;
      letter-spacing:.16em;
      text-transform:uppercase;
    }

    .round-exemption-title{
      margin:0;
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:21px;
      line-height:1.1;
      font-weight:800;
    }

    .round-exemption-sub{
      margin-top:5px;
      max-width:48ch;
      color:rgba(229,245,252,.84);
      font-size:10.5px;
      line-height:1.4;
    }

    .round-exemption-close{
      flex:0 0 36px;
      width:36px;
      height:36px;
      display:grid;
      place-items:center;
      border:1px solid rgba(255,255,255,.28);
      border-radius:10px;
      background:rgba(255,255,255,.14);
      color:#fff;
      font:700 21px/1 inherit;
      cursor:pointer;
    }

    .round-exemption-body{
      padding:15px 17px 19px;
    }

    .round-exemption-list{
      display:flex;
      flex-direction:column;
      gap:8px;
    }

    .round-exemption-row{
      display:grid;
      grid-template-columns:minmax(0,1fr) auto;
      gap:10px;
      align-items:center;
      padding:11px 12px;
      border:1.5px solid var(--line,#c9dfee);
      border-radius:12px;
      background:#fff;
    }

    .round-exemption-row.active{
      border-color:#ecd9a6;
      background:#fffdf7;
    }

    .round-exemption-row-name{
      color:var(--ink,#0a2233);
      font-size:11.5px;
      line-height:1.3;
      font-weight:800;
      overflow-wrap:anywhere;
    }

    .round-exemption-row-meta{
      margin-top:3px;
      color:var(--muted,#5b7080);
      font-size:9.5px;
      line-height:1.35;
      overflow-wrap:anywhere;
    }

    .round-exemption-row.active .round-exemption-row-meta{
      color:#826d43;
    }

    .round-exemption-action{
      border:1.5px solid #bfe4f5;
      border-radius:9px;
      padding:7px 9px;
      background:var(--accent-soft,#e2f4fc);
      color:var(--lagoon-deep,#0b7fb0);
      font:800 9px/1 "Inter",sans-serif;
      cursor:pointer;
      white-space:nowrap;
    }

    .round-exemption-action.restore{
      border-color:#d9e3e8;
      background:#f1f5f7;
      color:#5f737f;
    }

    .round-exemption-editor{
      padding:2px 0;
    }

    .round-exemption-back{
      margin:0 0 12px;
      padding:0;
      border:0;
      background:transparent;
      color:var(--lagoon-deep,#0b7fb0);
      font:800 10px/1.2 "Inter",sans-serif;
      cursor:pointer;
    }

    .round-exemption-editor-card{
      padding:14px;
      border:1.5px solid var(--line,#c9dfee);
      border-radius:14px;
      background:#f8fcfe;
    }

    .round-exemption-editor-name{
      margin-bottom:5px;
      color:var(--ink,#0a2233);
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:17px;
      font-weight:800;
    }

    .round-exemption-editor-note{
      margin-bottom:12px;
      color:var(--muted,#5b7080);
      font-size:10px;
      line-height:1.45;
    }

    .round-exemption-label{
      display:block;
      margin-bottom:6px;
      color:var(--ink-soft,#28455c);
      font-size:9.5px;
      font-weight:800;
      letter-spacing:.07em;
      text-transform:uppercase;
    }

    .round-exemption-reason-input{
      width:100%;
      min-height:92px;
      resize:vertical;
      padding:10px 11px;
      border:1.5px solid var(--line,#c9dfee);
      border-radius:10px;
      outline:none;
      background:#fff;
      color:var(--ink,#0a2233);
      font:500 11px/1.45 "Inter",sans-serif;
    }

    .round-exemption-reason-input:focus{
      border-color:var(--lagoon,#15ace3);
      box-shadow:0 0 0 4px rgba(21,172,227,.13);
    }

    .round-exemption-editor-actions{
      display:flex;
      justify-content:flex-end;
      gap:8px;
      margin-top:11px;
    }

    .round-exemption-secondary,
    .round-exemption-primary{
      border-radius:9px;
      padding:8px 11px;
      font:800 9.5px/1 "Inter",sans-serif;
      cursor:pointer;
    }

    .round-exemption-secondary{
      border:1.5px solid var(--line,#c9dfee);
      background:#fff;
      color:var(--ink-soft,#28455c);
    }

    .round-exemption-primary{
      border:1.5px solid var(--lagoon-deep,#0b7fb0);
      background:var(--lagoon-deep,#0b7fb0);
      color:#fff;
    }

    .round-exemption-primary:disabled,
    .round-exemption-action:disabled{
      opacity:.55;
      cursor:wait;
    }

    @media(max-width:600px){
      .round-progress-summary.has-exemptions{
        grid-template-columns:1fr;
      }

      .round-exemption-toolbar{
        align-items:flex-start;
      }

      .round-exemption-toolbar-copy span{
        max-width:24ch;
      }

      .round-exempted-person{
        padding:11px;
      }

      .round-exempted-state{
        max-width:82px;
        white-space:normal;
        text-align:center;
      }

      .round-exemption-modal{
        box-sizing:border-box;
        width:100vw;
        height:100vh;
        height:100dvh;
        min-height:0;
        padding:8px;
        padding-top:max(8px,env(safe-area-inset-top));
        padding-right:max(8px,env(safe-area-inset-right));
        padding-bottom:max(8px,env(safe-area-inset-bottom));
        padding-left:max(8px,env(safe-area-inset-left));
        overflow:hidden;
      }

      .round-exemption-dialog{
        box-sizing:border-box;
        width:100%;
        max-width:100%;
        min-width:0;
        max-height:100%;
        overflow-y:auto;
        overflow-x:hidden;
        -webkit-overflow-scrolling:touch;
        border-radius:16px;
      }

      .round-exemption-head{
        padding:16px 14px 13px;
      }

      .round-exemption-title{
        font-size:19px;
      }

      .round-exemption-body{
        padding:12px;
      }

      .round-exemption-row{
        grid-template-columns:minmax(0,1fr);
      }

      .round-exemption-action{
        justify-self:start;
      }
    }
  `;
  document.head.appendChild(style);
}

async function getLiveRows(force=false){
  const now = Date.now();

  if(!force && now - liveRowsAt < 1200){
    return liveRowsCache;
  }

  if(liveRowsPromise) return liveRowsPromise;

  liveRowsPromise = (async () => {
    const { data, error } = await db.rpc("get_dashboard_evaluations");
    if(error) throw error;

    liveRowsCache = (data || []).filter(row => !row.archived);
    liveRowsAt = Date.now();
    return liveRowsCache;
  })();

  try{
    return await liveRowsPromise;
  }finally{
    liveRowsPromise = null;
  }
}

function rebuildMaps(){
  profileById = new Map();
  profileIdByName = new Map();

  profiles.forEach(profile => {
    if(!profile?.id) return;
    profileById.set(profile.id,profile);
    if(profile.full_name){
      profileIdByName.set(normalize(profile.full_name),profile.id);
    }
  });

  exemptedIds = new Set(
    roster.filter(person => person?.id && person.exempted === true)
      .map(person => person.id)
  );

  exemptedNames = new Set(
    roster.filter(person => person?.full_name && person.exempted === true)
      .map(person => normalize(person.full_name))
  );

  exemptionReasonById = new Map(
    roster
      .filter(person => person?.id && person.exempted === true)
      .map(person => [
        person.id,
        String(person.exemption_reason || "").trim() ||
          "Exempted from the current evaluation round."
      ])
  );
}

function activePeople(){
  return profiles.filter(person => person?.id && !exemptedIds.has(person.id));
}

function activeEvaluatorIds(){
  return new Set(
    roster
      .filter(person =>
        person?.id &&
        person.has_login !== false &&
        person.exempted !== true
      )
      .map(person => person.id)
  );
}

function currentUserDoneSet(rows){
  return new Set(
    rows
      .filter(row =>
        row.evaluator_id === uid &&
        row.locked &&
        !exemptedIds.has(row.employee_id)
      )
      .map(row => row.employee_id)
  );
}

function nextAvailableName(){
  const done = currentUserDoneSet(liveRowsCache);
  return activePeople()
    .filter(person => person.id !== uid && !done.has(person.id))
    .sort((a,b) =>
      String(a.full_name || "").localeCompare(String(b.full_name || ""))
    )[0]?.full_name || "";
}

function wrapRosterSetter(){
  const current = window.setRoster;
  if(typeof current !== "function") return;

  if(current.__roundExemptionWrapped) return;

  const original = current;
  const wrapped = function(rows){
    const filtered = Array.isArray(rows)
      ? rows.filter(row => {
          const id = row?.id;
          const name = normalize(row?.full_name || row?.name);
          return !(id && exemptedIds.has(id)) && !exemptedNames.has(name);
        })
      : rows;

    return original.call(this,filtered);
  };

  wrapped.__roundExemptionWrapped = true;
  wrapped.__roundExemptionOriginal = original;
  window.setRoster = wrapped;
}

function refreshAutocompleteRoster(){
  wrapRosterSetter();

  if(typeof window.setRoster === "function"){
    window.setRoster(activePeople());
  }
}

function wrapEmployeeSetter(){
  const api = window.evalApi;
  if(!api || typeof api.setEmployee !== "function") return;
  if(api.setEmployee.__roundExemptionWrapped) return;

  const original = api.setEmployee.bind(api);

  const wrapped = function(name){
    const wanted = String(name || "");

    if(
      isScoringMode() &&
      wanted &&
      isExemptedName(wanted)
    ){
      return original(nextAvailableName());
    }

    return original(wanted);
  };

  wrapped.__roundExemptionWrapped = true;
  wrapped.__roundExemptionOriginal = original;
  api.setEmployee = wrapped;
}

function wrapNextUpAlert(){
  const current = window.uiAlert;
  if(typeof current !== "function") return;
  if(current.__roundExemptionWrapped) return;

  const original = current;

  const wrapped = function(title,message,...rest){
    const text = String(message || "");
    const match = text.match(/^Next up:\s*(.+?)\.$/i);

    if(
      title === "Saved" &&
      match &&
      isExemptedName(match[1])
    ){
      const next = nextAvailableName();

      if(next){
        return original.call(
          this,
          title,
          "Next up: " + next + ".",
          ...rest
        );
      }

      return original.call(
        this,
        "All done",
        "You have evaluated everyone participating in the current round. Thank you.",
        ...rest
      );
    }

    return original.call(this,title,message,...rest);
  };

  wrapped.__roundExemptionWrapped = true;
  wrapped.__roundExemptionOriginal = original;
  window.uiAlert = wrapped;
}

async function syncInternalEligibility(){
  const { data, error } = await db.rpc("get_evaluation_roster");
  if(error || !Array.isArray(data)) return;

  if(typeof window.__syncEvaluationRoster === "function"){
    window.__syncEvaluationRoster(data);
  }
}

async function refreshState({forceRows=false}={}){
  if(refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try{
      const { data:{ session } } = await db.auth.getSession();
      if(!session) return;

      uid = session.user.id;

      const [profilesResult,rosterResult] = await Promise.all([
        db.from("profiles")
          .select("id,full_name,position,role,form_role,avatar_path")
          .order("full_name"),
        db.rpc("get_evaluation_roster_v2")
      ]);

      if(profilesResult.error) throw profilesResult.error;
      if(rosterResult.error) throw rosterResult.error;

      profiles = profilesResult.data || [];
      roster = Array.isArray(rosterResult.data) ? rosterResult.data : [];
      me = profiles.find(person => person.id === uid) || null;
      canManage = me?.role === "manager" || me?.form_role === "Senior Staff";

      rebuildMaps();

      await getLiveRows(forceRows);
      await syncInternalEligibility();

      refreshAutocompleteRoster();
      wrapEmployeeSetter();
      wrapNextUpAlert();

      queuePatch();
    }catch(error){
      console.info("Round exemption sync unavailable.",error);
    }finally{
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

function evaluatorProgress(evaluatorId,rows){
  const active = activePeople();
  const activeIds = new Set(active.map(person => person.id));
  const required = Math.max(
    active.length - (activeIds.has(evaluatorId) ? 1 : 0),
    0
  );

  const byEmployee = new Map();

  rows.forEach(row => {
    if(
      row.evaluator_id !== evaluatorId ||
      row.employee_id === evaluatorId ||
      !activeIds.has(row.employee_id) ||
      exemptedIds.has(row.evaluator_id)
    ) return;

    const previous = byEmployee.get(row.employee_id);
    const previousTime = new Date(
      previous?.updated_at || previous?.created_at || 0
    ).getTime();
    const currentTime = new Date(
      row.updated_at || row.created_at || 0
    ).getTime();

    if(!previous || currentTime >= previousTime){
      byEmployee.set(row.employee_id,row);
    }
  });

  const evaluatorRows = [...byEmployee.values()];
  const submitted = evaluatorRows.filter(row => !!row.locked).length;
  const drafts = evaluatorRows.filter(row => !row.locked);

  let workUnits = submitted;

  drafts.forEach(row => {
    const scored = clamp(Number(row.score_count) || 0,0,CRITERIA_TOTAL);
    let partial = CRITERIA_TOTAL ? scored / CRITERIA_TOTAL : 0;
    if(partial === 0 && row.has_comment) partial = .05;
    workUnits += Math.min(partial,.95);
  });

  const pct = required
    ? clamp(workUnits / required * 100,0,100)
    : 100;

  const completed = required === 0 || submitted >= required;
  const started = evaluatorRows.length > 0;

  let state = "not-started";
  let stateLabel = "Not started";

  if(completed){
    state = "completed";
    stateLabel = "Completed";
  }else if(started){
    state = "evaluating";
    stateLabel = "Evaluating";
  }

  const activeDraft = drafts
    .slice()
    .sort((a,b) =>
      new Date(b.updated_at || b.created_at || 0) -
      new Date(a.updated_at || a.created_at || 0)
    )[0] || null;

  return {
    required,
    submitted,
    pct,
    state,
    stateLabel,
    activeDraft
  };
}

async function patchDashboard(rows){
  const people = activePeople();
  const peopleIds = new Set(people.map(person => person.id));
  const evaluatorIds = activeEvaluatorIds();
  const eligibleCount = evaluatorIds.size;

  const expected = people.reduce(
    (sum,person) =>
      sum +
      Math.max(
        eligibleCount - (evaluatorIds.has(person.id) ? 1 : 0),
        0
      ),
    0
  );

  const done = new Set(
    rows
      .filter(row =>
        row.locked &&
        peopleIds.has(row.employee_id) &&
        evaluatorIds.has(row.evaluator_id)
      )
      .map(row => `${row.employee_id}|${row.evaluator_id}`)
  ).size;

  const pct = expected
    ? Math.min(100,done / expected * 100)
    : 0;

  setText(document.getElementById("completionText"),`${done} / ${expected}`);
  setText(document.getElementById("completionPercent"),`${Math.round(pct)}%`);
  setWidth(document.getElementById("completionBar"),`${pct}%`);

  document.querySelectorAll(".dash-live-eval-row").forEach(row => {
    const evaluator =
      row.querySelector(".dash-live-evaluator")?.textContent?.trim() || "";
    const employee =
      row.querySelector(".dash-live-employee")?.textContent?.trim() || "";

    row.hidden =
      isExemptedName(evaluator) ||
      isExemptedName(employee);
  });
}

function paintExemptedAvatar(host,profile){
  if(!host || !profile) return;

  host.innerHTML = "";
  const url = publicAvatarUrl(profile.avatar_path);

  if(!url){
    host.textContent = initials(profile.full_name);
    return;
  }

  const img = document.createElement("img");
  img.src = url;
  img.alt = `${profile.full_name || "Staff"} profile picture`;
  img.addEventListener("error",() => {
    host.innerHTML = "";
    host.textContent = initials(profile.full_name);
  },{once:true});

  host.appendChild(img);
}

function ensureProgressToolbar(body){
  const old = body.querySelector(":scope > .round-exemption-toolbar");

  if(!canManage){
    old?.remove();
    return;
  }

  if(old) return;

  const bar = document.createElement("div");
  bar.className = "round-exemption-toolbar";
  bar.innerHTML = `
    <div class="round-exemption-toolbar-copy">
      <strong>Current round exemptions</strong>
      <span>Exclude unavailable staff without changing their roster account.</span>
    </div>
    <button class="round-exemption-manage-btn" type="button">
      Manage
    </button>
  `;

  bar.querySelector("button")?.addEventListener("click",openManageModal);
  body.prepend(bar);
}

function renderExemptedProgressCards(list){
  let host = list.querySelector(":scope > .round-exempted-list");

  if(!exemptedIds.size){
    host?.remove();
    return;
  }

  if(!host){
    host = document.createElement("div");
    host.className = "round-exempted-list";
    list.appendChild(host);
  }

  const exemptedProfiles = profiles
    .filter(profile => exemptedIds.has(profile.id))
    .sort((a,b) =>
      String(a.full_name || "").localeCompare(String(b.full_name || ""))
    );

  const signature = JSON.stringify(
    exemptedProfiles.map(profile => [
      profile.id,
      profile.full_name,
      profile.avatar_path,
      reasonForId(profile.id)
    ])
  );

  if(host.dataset.signature === signature) return;
  host.dataset.signature = signature;
  host.innerHTML = "";

  exemptedProfiles.forEach(profile => {
    const card = document.createElement("article");
    card.className = "round-exempted-person";

    card.innerHTML = `
      <div class="round-exempted-head">
        <span class="round-exempted-avatar" aria-hidden="true"></span>
        <div class="round-exempted-copy">
          <strong class="round-exempted-name"></strong>
          <span class="round-exempted-reason"></span>
        </div>
        <span class="round-exempted-state">Exempted</span>
      </div>
      <div class="round-exempted-note">
        Not included in expected evaluations or evaluator requirements for this round.
      </div>
    `;

    setText(card.querySelector(".round-exempted-name"),profile.full_name || "Unknown");
    setText(card.querySelector(".round-exempted-reason"),reasonForId(profile.id));
    paintExemptedAvatar(card.querySelector(".round-exempted-avatar"),profile);
    host.appendChild(card);
  });
}

async function patchCurrentProgress(rows){
  const modal = document.querySelector(".round-progress-modal");
  if(!modal || modal.hidden) return;

  const body = document.getElementById("roundProgressBody");
  const list = body?.querySelector(".round-progress-list");
  if(!body || !list) return;

  ensureProgressToolbar(body);

  const counts = {
    evaluating:0,
    "not-started":0,
    completed:0
  };

  list.querySelectorAll(":scope > .round-progress-person").forEach(row => {
    const name =
      row.querySelector(".round-progress-name")?.textContent?.trim() || "";
    const id = profileIdByName.get(normalize(name));

    if(!id) return;

    const isExempted = exemptedIds.has(id);
    row.hidden = isExempted;

    if(isExempted) return;

    const info = evaluatorProgress(id,rows);
    counts[info.state] = (counts[info.state] || 0) + 1;

    row.classList.remove("evaluating","not-started","completed");
    row.classList.add(info.state);

    const badge = row.querySelector(".round-progress-state");
    if(badge){
      badge.classList.remove("evaluating","not-started","completed");
      badge.classList.add(info.state);
      setText(badge,info.stateLabel);
    }

    let meta = info.required
      ? `${info.submitted} of ${info.required} evaluations submitted`
      : "No evaluations assigned";

    if(info.state === "evaluating" && info.activeDraft){
      const employee =
        profileById.get(info.activeDraft.employee_id)?.full_name ||
        "Unknown employee";
      const scored = clamp(
        Number(info.activeDraft.score_count) || 0,
        0,
        CRITERIA_TOTAL
      );

      meta += ` · currently evaluating ${employee}`;
      if(scored) meta += ` (${scored}/${CRITERIA_TOTAL} criteria)`;
    }

    setText(row.querySelector(".round-progress-meta"),meta);
    setText(
      row.querySelector(".round-progress-line strong"),
      `${Math.round(info.pct)}%`
    );

    const track = row.querySelector(".round-progress-track");
    const fill = track?.querySelector("span");

    if(track){
      track.setAttribute("aria-valuenow",String(Math.round(info.pct)));
    }
    setWidth(fill,`${info.pct}%`);
  });

  const summary = body.querySelector(".round-progress-summary");

  if(summary){
    const setSummary = (cls,value) => {
      setText(
        summary.querySelector(`.round-progress-summary-card.${cls} strong`),
        value
      );
    };

    setSummary("evaluating",counts.evaluating || 0);
    setSummary("not-started",counts["not-started"] || 0);
    setSummary("completed",counts.completed || 0);

    let exemptCard =
      summary.querySelector(".round-progress-summary-card.exempted");

    if(exemptedIds.size){
      if(!exemptCard){
        exemptCard = document.createElement("div");
        exemptCard.className = "round-progress-summary-card exempted";
        exemptCard.innerHTML = `<strong>0</strong><span>Exempted</span>`;
        summary.appendChild(exemptCard);
      }

      setText(exemptCard.querySelector("strong"),exemptedIds.size);
      summary.classList.add("has-exemptions");
    }else{
      exemptCard?.remove();
      summary.classList.remove("has-exemptions");
    }
  }

  renderExemptedProgressCards(list);
}

function patchDrilldownAssignments(){
  document.querySelectorAll(".round-drilldown-panel").forEach(panel => {
    let visible = 0;
    let submitted = 0;
    let excluded = 0;

    panel.querySelectorAll(".round-drilldown-assignment").forEach(row => {
      const name =
        row.querySelector(".round-drilldown-name")?.textContent?.trim() || "";
      const exempted = isExemptedName(name);

      row.hidden = exempted;

      if(exempted){
        excluded++;
        return;
      }

      visible++;
      if(row.classList.contains("submitted")) submitted++;
    });

    setText(
      panel.querySelector(".round-drilldown-count"),
      `${submitted}/${visible} submitted`
    );

    let note = panel.querySelector(".round-exemption-drilldown-note");

    if(excluded){
      if(!note){
        note = document.createElement("div");
        note.className = "round-exemption-drilldown-note";
        note.style.cssText =
          "margin-top:8px;color:#826d43;font-size:9px;font-weight:700;line-height:1.35";
        panel.appendChild(note);
      }

      setText(
        note,
        `${excluded} exempted staff member${excluded === 1 ? "" : "s"} excluded from this round.`
      );
    }else{
      note?.remove();
    }
  });
}

async function patchResults(rows){
  const list = document.getElementById("resList");

  if(list){
    list.querySelectorAll(".res-row").forEach(row => {
      const name = row.querySelector(".res-nm")?.textContent?.trim() || "";
      const id = profileIdByName.get(normalize(name));
      const exempted = !!id && exemptedIds.has(id);

      row.classList.toggle("round-exempted-result",exempted);

      if(exempted){
        row.setAttribute("aria-disabled","true");
        setText(row.querySelector(".res-ct"),"Exempted");

        let reason = row.querySelector(".round-exemption-result-reason");
        if(!reason){
          reason = document.createElement("span");
          reason.className = "round-exemption-result-reason";
          row.appendChild(reason);
        }
        setText(reason,reasonForId(id));
      }else{
        row.removeAttribute("aria-disabled");
        row.querySelector(".round-exemption-result-reason")?.remove();
      }
    });
  }

  const evaluatorIds = activeEvaluatorIds();
  const active = activePeople();
  let complete = 0;

  active.forEach(person => {
    const total = Math.max(
      evaluatorIds.size - (evaluatorIds.has(person.id) ? 1 : 0),
      0
    );

    const submitted = new Set(
      rows
        .filter(row =>
          row.employee_id === person.id &&
          row.locked &&
          evaluatorIds.has(row.evaluator_id) &&
          row.evaluator_id !== person.id
        )
        .map(row => row.evaluator_id)
    ).size;

    if(total > 0 && submitted >= total) complete++;
  });

  setText(
    document.getElementById("resDone"),
    `${complete}/${active.length}`
  );
}

function patchScoringAccess(){
  const save = document.getElementById("saveBtn");
  const input = document.getElementById("empName");

  if(save){
    const blocked =
      exemptedIds.has(uid) ||
      (
        isScoringMode() &&
        input &&
        isExemptedName(input.value)
      );

    if(blocked){
      save.setAttribute("data-round-exemption-blocked","1");
    }else{
      save.removeAttribute("data-round-exemption-blocked");
    }
  }
}

async function patchAll(){
  if(patchRunning){
    patchAgain = true;
    return;
  }

  patchRunning = true;

  try{
    const rows = await getLiveRows();

    await patchDashboard(rows);
    await patchCurrentProgress(rows);
    patchDrilldownAssignments();
    await patchResults(rows);
    patchScoringAccess();
  }catch(error){
    console.info("Round exemption UI patch unavailable.",error);
  }finally{
    patchRunning = false;

    if(patchAgain){
      patchAgain = false;
      queuePatch();
    }
  }
}

function queuePatch(){
  if(patchQueued) return;
  patchQueued = true;

  requestAnimationFrame(() => {
    patchQueued = false;
    patchAll();
  });
}

function ensureManageModal(){
  if(manageModal) return manageModal;

  manageModal = document.createElement("div");
  manageModal.className = "round-exemption-modal";
  manageModal.hidden = true;
  manageModal.setAttribute("aria-hidden","true");

  manageModal.innerHTML = `
    <div class="round-exemption-backdrop" data-round-exemption-close></div>
    <section class="round-exemption-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="roundExemptionTitle">
      <header class="round-exemption-head">
        <div>
          <div class="round-exemption-kicker">Current evaluation round</div>
          <h2 class="round-exemption-title" id="roundExemptionTitle">
            Staff exemptions
          </h2>
          <div class="round-exemption-sub">
            Exempt unavailable staff so they are not evaluated and are not required to evaluate others in this round.
          </div>
        </div>
        <button class="round-exemption-close"
          type="button"
          aria-label="Close staff exemptions"
          data-round-exemption-close>×</button>
      </header>
      <div class="round-exemption-body" id="roundExemptionBody"></div>
    </section>
  `;

  manageModal.addEventListener("click",event => {
    if(event.target.closest("[data-round-exemption-close]")){
      closeManageModal();
    }
  });

  document.body.appendChild(manageModal);
  return manageModal;
}

function closeManageModal(){
  if(!manageModal) return;
  manageModal.hidden = true;
  manageModal.setAttribute("aria-hidden","true");
}

async function loadActiveExemptionRecords(){
  const { data, error } = await db
    .from("evaluation_round_exemptions")
    .select("id,staff_id,reason,active,exempted_at")
    .eq("active",true)
    .order("exempted_at");

  if(error) throw error;
  return data || [];
}

async function renderManageList(){
  if(!canManage) return;

  const shell = ensureManageModal();
  const body = shell.querySelector("#roundExemptionBody");
  if(!body) return;

  body.innerHTML = `<div class="round-progress-loading" role="status">Loading staff…</div>`;

  try{
    const activeRecords = await loadActiveExemptionRecords();
    const recordByStaff = new Map(activeRecords.map(record => [record.staff_id,record]));

    body.innerHTML = `<div class="round-exemption-list"></div>`;
    const list = body.querySelector(".round-exemption-list");

    profiles
      .slice()
      .sort((a,b) =>
        String(a.full_name || "").localeCompare(String(b.full_name || ""))
      )
      .forEach(profile => {
        const record = recordByStaff.get(profile.id);
        const row = document.createElement("div");
        row.className = "round-exemption-row" + (record ? " active" : "");

        row.innerHTML = `
          <div>
            <div class="round-exemption-row-name"></div>
            <div class="round-exemption-row-meta"></div>
          </div>
          <button class="round-exemption-action${record ? " restore" : ""}"
            type="button"></button>
        `;

        setText(row.querySelector(".round-exemption-row-name"),profile.full_name || "Unknown");

        if(record){
          setText(row.querySelector(".round-exemption-row-meta"),record.reason);
        }else{
          setText(row.querySelector(".round-exemption-row-meta"),"Participating in the current round");
        }

        const action = row.querySelector(".round-exemption-action");
        setText(action,record ? "Restore" : "Exempt");

        action.addEventListener("click",async () => {
          if(record){
            await restoreStaff(record,profile,action);
          }else{
            openReasonEditor(profile);
          }
        });

        list.appendChild(row);
      });
  }catch(error){
    body.innerHTML = `
      <div class="round-progress-error">
        Could not load round exemptions. ${String(error?.message || "")}
      </div>
    `;
  }
}

function openReasonEditor(profile){
  const body = ensureManageModal().querySelector("#roundExemptionBody");
  if(!body) return;

  body.innerHTML = `
    <div class="round-exemption-editor">
      <button class="round-exemption-back" type="button">← Back to staff</button>
      <div class="round-exemption-editor-card">
        <div class="round-exemption-editor-name"></div>
        <div class="round-exemption-editor-note">
          This staff member will not be evaluated and will not be required to evaluate anyone while the exemption is active. The reason is stored for audit purposes.
        </div>

        <label class="round-exemption-label" for="roundExemptionReason">
          Reason for exemption
        </label>
        <textarea class="round-exemption-reason-input"
          id="roundExemptionReason"
          maxlength="500"
          placeholder="Example: On approved leave"></textarea>

        <div class="round-exemption-editor-actions">
          <button class="round-exemption-secondary" type="button">Cancel</button>
          <button class="round-exemption-primary" type="button">Exempt staff</button>
        </div>
      </div>
    </div>
  `;

  setText(body.querySelector(".round-exemption-editor-name"),profile.full_name || "Unknown");

  const back = body.querySelector(".round-exemption-back");
  const cancel = body.querySelector(".round-exemption-secondary");
  const save = body.querySelector(".round-exemption-primary");
  const input = body.querySelector(".round-exemption-reason-input");

  back?.addEventListener("click",renderManageList);
  cancel?.addEventListener("click",renderManageList);

  save?.addEventListener("click",async () => {
    const reason = String(input?.value || "").trim();

    if(reason.length < 2){
      await showNotice(
        "Reason required",
        "Enter a short reason for the current-round exemption."
      );
      input?.focus();
      return;
    }

    save.disabled = true;

    try{
      const { data:hasActivity, error:activityError } =
        await db.rpc("has_live_evaluation_activity",{
          p_staff_id:profile.id
        });

      if(activityError) throw activityError;

      if(hasActivity){
        await showNotice(
          "Current-round activity already exists",
          `${profile.full_name} already has a live draft or submission in this round. Reset those current-round records first, then exempt the staff member. No evaluation data was changed.`
        );
        return;
      }

      const { error } = await db
        .from("evaluation_round_exemptions")
        .insert({
          staff_id:profile.id,
          reason,
          active:true,
          exempted_by:uid
        });

      if(error) throw error;

      await afterExemptionChange();

      await showNotice(
        "Staff exempted",
        `${profile.full_name} is now excluded from the current evaluation round.`
      );

      await renderManageList();
    }catch(error){
      await showNotice(
        "Could not exempt staff",
        error?.message || "The exemption could not be saved."
      );
    }finally{
      save.disabled = false;
    }
  });

  input?.focus();
}

async function restoreStaff(record,profile,button){
  if(!await askConfirm(
    "Restore " + (profile.full_name || "this staff member") + "?",
    "They will again be included as an evaluatee and, if they have a login account, as a required evaluator in the current round.",
    "Restore"
  )) return;

  button.disabled = true;

  try{
    const { error } = await db
      .from("evaluation_round_exemptions")
      .update({
        active:false,
        restored_by:uid,
        restored_at:new Date().toISOString()
      })
      .eq("id",record.id)
      .eq("active",true);

    if(error) throw error;

    await afterExemptionChange();

    await showNotice(
      "Staff restored",
      `${profile.full_name} is participating in the current evaluation round again.`
    );

    await renderManageList();
  }catch(error){
    await showNotice(
      "Could not restore staff",
      error?.message || "The exemption could not be removed."
    );
  }finally{
    button.disabled = false;
  }
}

async function afterExemptionChange(){
  liveRowsAt = 0;
  await refreshState({forceRows:true});

  if(typeof window.__refreshResults === "function"){
    window.__refreshResults();
  }

  window.dispatchEvent(new CustomEvent("round-exemptions-updated"));
  queuePatch();
}

async function openManageModal(){
  if(!canManage) return;

  const shell = ensureManageModal();
  shell.hidden = false;
  shell.setAttribute("aria-hidden","false");
  await renderManageList();
  shell.querySelector(".round-exemption-close")?.focus({preventScroll:true});
}

function installGuards(){
  document.addEventListener("change",event => {
    const input = event.target;

    if(
      input?.id !== "empName" ||
      !isScoringMode() ||
      !isExemptedName(input.value)
    ) return;

    const name = input.value.trim();
    event.preventDefault();
    event.stopImmediatePropagation();

    input.value = "";

    setTimeout(() => {
      input.dispatchEvent(new Event("change",{bubbles:true}));
    },0);

    showNotice(
      "Exempted from this round",
      `${name} is not participating in the current evaluation round. ${reasonForName(name)}`
    );
  },true);

  document.addEventListener("blur",event => {
    const input = event.target;

    if(
      input?.id !== "empName" ||
      !isScoringMode() ||
      !isExemptedName(input.value)
    ) return;

    const name = input.value.trim();
    event.preventDefault();
    event.stopImmediatePropagation();

    input.value = "";

    setTimeout(() => {
      input.dispatchEvent(new Event("change",{bubbles:true}));
    },0);

    showNotice(
      "Exempted from this round",
      `${name} is not participating in the current evaluation round. ${reasonForName(name)}`
    );
  },true);

  document.addEventListener("click",event => {
    const save = event.target.closest?.("#saveBtn");

    if(save && isScoringMode()){
      const selected =
        document.getElementById("empName")?.value?.trim() || "";

      if(exemptedIds.has(uid)){
        event.preventDefault();
        event.stopImmediatePropagation();

        showNotice(
          "You are exempted from this round",
          "You are not required to submit evaluations while your current-round exemption is active."
        );
        return;
      }

      if(selected && isExemptedName(selected)){
        event.preventDefault();
        event.stopImmediatePropagation();

        showNotice(
          "Staff member is exempted",
          `${selected} is not participating in the current evaluation round.`
        );
      }
    }

    const resultRow = event.target.closest?.(".res-row.round-exempted-result");

    if(resultRow){
      event.preventDefault();
      event.stopImmediatePropagation();

      const name =
        resultRow.querySelector(".res-nm")?.textContent?.trim() ||
        "This staff member";

      showNotice(
        "Exempted from this round",
        `${name} is not being evaluated in the current round. ${reasonForName(name)}`
      );
    }
  },true);
}

function installObserver(){
  const observer = new MutationObserver(mutations => {
    const relevant = mutations.some(mutation => {
      const target = mutation.target;

      if(
        target?.nodeType === 1 &&
        target.closest?.(
          "#dashboardView,#resList,.round-progress-modal,.round-drilldown-panel"
        )
      ) return true;

      return [...mutation.addedNodes].some(node => {
        if(node?.nodeType !== 1) return false;

        return (
          node.matches?.(
            "#dashboardView,#resList,.round-progress-modal,.round-progress-person,.round-drilldown-panel"
          ) ||
          node.querySelector?.(
            "#resList,.round-progress-modal,.round-progress-person,.round-drilldown-panel"
          )
        );
      });
    });

    if(relevant) queuePatch();
  });

  observer.observe(document.body,{
    childList:true,
    subtree:true,
    characterData:true,
    attributes:true,
    attributeFilter:["hidden","class","aria-hidden"]
  });
}

function installRealtime(){
  if(realtimeChannel || !uid) return;

  realtimeChannel = db
    .channel("round-exemptions-" + uid)
    .on(
      "postgres_changes",
      {
        event:"*",
        schema:"public",
        table:"evaluation_round_exemptions"
      },
      async () => {
        await refreshState({forceRows:true});
        queuePatch();
      }
    )
    .subscribe();
}

injectStyles();
installGuards();
installObserver();

await refreshState({forceRows:true});
installRealtime();

const bootstrap = setInterval(() => {
  wrapRosterSetter();
  wrapEmployeeSetter();
  wrapNextUpAlert();

  if(
    typeof window.setRoster === "function" &&
    window.evalApi &&
    typeof window.__syncEvaluationRoster === "function"
  ){
    clearInterval(bootstrap);
    refreshAutocompleteRoster();
  }
},100);

setTimeout(() => clearInterval(bootstrap),8000);

// v2 roster is intentionally polled as a fallback for staff who cannot
// directly SELECT the protected exemptions table and therefore may not receive
// a Realtime event through RLS.
setInterval(() => {
  if(document.visibilityState !== "visible") return;
  refreshState();
},5000);

document.addEventListener("visibilitychange",() => {
  if(document.visibilityState === "visible"){
    liveRowsAt = 0;
    refreshState({forceRows:true});
  }
});

window.addEventListener("focus",() => {
  liveRowsAt = 0;
  refreshState({forceRows:true});
});

window.addEventListener("pagehide",() => {
  if(realtimeChannel){
    db.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
},{once:true});

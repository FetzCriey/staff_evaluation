import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://giosjwjhalhmwcuyzfos.supabase.co";
const SUPABASE_KEY = "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_";
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const CRITERIA_TOTAL = 10;
let modal = null;
let previousOverflow = "";
let lastFocused = null;

let cachedPeople = null;
let cachedRoster = null;
let liveRefreshTimer = null;
let livePollTimer = null;
let liveRefreshRunning = false;
let liveRefreshAgain = false;
let realtimeHooked = false;
let lastRenderSignature = "";
const previousProgressPct = new Map();

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const initials = name => {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return (
    (parts[0]?.[0] || "") +
    (parts.length > 1 ? parts.at(-1)?.[0] || "" : "")
  ).toUpperCase() || "—";
};

function injectStyles(){
  if(document.getElementById("round-progress-detail-style")) return;

  const style = document.createElement("style");
  style.id = "round-progress-detail-style";
  style.textContent = `
    .dash-round-progress-card:focus-visible{
      outline:3px solid var(--lagoon-dark,#08344c);
      outline-offset:3px;
    }

    .round-progress-modal[hidden]{
      display:none !important;
    }

    .round-progress-modal{
      position:fixed;
      inset:0;
      z-index:100010;
      display:grid;
      place-items:center;
      padding:18px;
    }

    .round-progress-backdrop{
      position:absolute;
      inset:0;
      background:rgba(4,24,36,.58);
      backdrop-filter:blur(5px);
      -webkit-backdrop-filter:blur(5px);
    }

    .round-progress-dialog{
      position:relative;
      z-index:1;
      width:min(650px,100%);
      max-height:min(88vh,780px);
      overflow:auto;
      overscroll-behavior:contain;
      background:#fff;
      color:var(--ink,#0a2233);
      border:1.5px solid var(--line,#c9dfee);
      border-radius:22px;
      box-shadow:0 28px 80px -22px rgba(4,32,50,.52);
      scrollbar-width:none;
    }

    .round-progress-dialog::-webkit-scrollbar{
      width:0;
      height:0;
    }

    .round-progress-head{
      position:sticky;
      top:0;
      z-index:3;
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:16px;
      padding:22px 22px 18px;
      color:#fff;
      background:
        radial-gradient(100% 150% at 100% 0%,rgba(21,172,227,.5),transparent 60%),
        linear-gradient(145deg,#0b536f 0%,#08344c 58%,#051f30 100%);
    }

    .round-progress-kicker{
      margin-bottom:4px;
      font-size:9.5px;
      font-weight:800;
      letter-spacing:.18em;
      text-transform:uppercase;
      color:rgba(218,242,252,.78);
    }

    .round-progress-title{
      margin:0;
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:23px;
      line-height:1.1;
      font-weight:800;
    }

    .round-progress-subtitle{
      margin-top:6px;
      max-width:46ch;
      font-size:11.5px;
      line-height:1.45;
      color:rgba(229,245,252,.84);
    }

    .round-progress-close{
      flex:0 0 38px;
      width:38px;
      height:38px;
      display:grid;
      place-items:center;
      border:1px solid rgba(255,255,255,.28);
      border-radius:11px;
      background:rgba(255,255,255,.14);
      color:#fff;
      font:700 22px/1 inherit;
      cursor:pointer;
    }

    .round-progress-close:hover{
      background:rgba(255,255,255,.24);
    }

    .round-progress-body{
      padding:18px 20px 22px;
    }

    .round-progress-summary{
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:9px;
      margin-bottom:16px;
    }

    .round-progress-summary-card{
      min-width:0;
      padding:11px 12px;
      border:1.5px solid var(--line,#c9dfee);
      border-radius:13px;
      background:#f7fbfd;
    }

    .round-progress-summary-card strong{
      display:block;
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:21px;
      line-height:1;
      color:var(--lagoon-deep,#0b7fb0);
    }

    .round-progress-summary-card span{
      display:block;
      margin-top:5px;
      font-size:9.5px;
      font-weight:800;
      letter-spacing:.06em;
      text-transform:uppercase;
      color:var(--muted,#5b7080);
    }

    /* Status colors match each evaluator's progress bar. */
    .round-progress-summary-card.not-started{
      background:#f1f5f7;
      border-color:#d9e3e8;
    }

    .round-progress-summary-card.not-started strong,
    .round-progress-summary-card.not-started span{
      color:#6c7d88;
    }

    .round-progress-summary-card.evaluating{
      background:var(--accent-soft,#e2f4fc);
      border-color:#bfe4f5;
    }

    .round-progress-summary-card.evaluating strong,
    .round-progress-summary-card.evaluating span{
      color:var(--lagoon-deep,#0b7fb0);
    }

    .round-progress-summary-card.completed{
      background:#eaf7f0;
      border-color:#bfe3ce;
    }

    .round-progress-summary-card.completed strong,
    .round-progress-summary-card.completed span{
      color:#1f7a4d;
    }

    .round-progress-list{
      display:flex;
      flex-direction:column;
      gap:9px;
    }

    .round-progress-person{
      padding:12px 13px;
      border:1.5px solid var(--line,#c9dfee);
      border-radius:14px;
      background:#fff;
    }

    .round-progress-person.not-started{
      background:#fbfcfd;
      border-color:#d9e3e8;
    }

    .round-progress-person.evaluating{
      background:#f8fcfe;
      border-color:#bfe4f5;
    }

    .round-progress-person.completed{
      background:#fbfefc;
      border-color:#bfe3ce;
    }

    .round-progress-person-head{
      display:flex;
      align-items:center;
      gap:10px;
      min-width:0;
    }

    .round-progress-avatar{
      flex:0 0 38px;
      width:38px;
      height:38px;
      display:grid;
      place-items:center;
      border-radius:11px;
      background:linear-gradient(180deg,var(--lagoon,#15ace3),var(--lagoon-deep,#0b7fb0));
      color:#fff;
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:12px;
      font-weight:800;
    }

    .round-progress-person-copy{
      flex:1 1 auto;
      min-width:0;
    }

    .round-progress-name{
      display:block;
      overflow-wrap:anywhere;
      font-size:12.5px;
      line-height:1.3;
      font-weight:800;
      color:var(--ink,#0a2233);
    }

    .round-progress-meta{
      display:block;
      margin-top:2px;
      overflow-wrap:anywhere;
      font-size:10.5px;
      line-height:1.35;
      color:var(--muted,#5b7080);
    }

    .round-progress-state{
      flex:0 0 auto;
      padding:4px 8px;
      border-radius:999px;
      font-size:9px;
      line-height:1.25;
      font-weight:800;
      letter-spacing:.05em;
      text-transform:uppercase;
      white-space:nowrap;
    }

    .round-progress-state.evaluating{
      color:var(--lagoon-deep,#0b7fb0);
      background:var(--accent-soft,#e2f4fc);
      border:1px solid #bfe4f5;
    }

    .round-progress-state.not-started{
      color:#6c7d88;
      background:#f1f5f7;
      border:1px solid #d9e3e8;
    }

    .round-progress-state.completed{
      color:#1f7a4d;
      background:#eaf7f0;
      border:1px solid #bfe3ce;
    }

    .round-progress-line{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      margin-top:11px;
      font-size:10px;
      color:var(--muted,#5b7080);
    }

    .round-progress-line strong{
      color:var(--ink-soft,#28455c);
      font-size:10.5px;
    }

    .round-progress-track{
      height:8px;
      margin-top:6px;
      overflow:hidden;
      border-radius:999px;
      background:#e4eff6;
    }

    .round-progress-track span{
      display:block;
      height:100%;
      width:0;
      border-radius:inherit;
      background:linear-gradient(90deg,var(--lagoon,#15ace3),var(--lagoon-deep,#0b7fb0));
      transition:width .35s cubic-bezier(.16,1,.3,1);
    }

    .round-progress-person.completed .round-progress-track span{
      background:linear-gradient(90deg,#33b877,#1f7a4d);
    }

    .round-progress-person.not-started .round-progress-track span{
      background:#c8d7df;
    }

    .round-progress-empty,
    .round-progress-loading,
    .round-progress-error{
      padding:30px 18px;
      text-align:center;
      color:var(--muted,#5b7080);
      font-size:12px;
    }

    .round-progress-loading::before{
      content:"";
      display:block;
      width:30px;
      height:30px;
      margin:0 auto 11px;
      border:3px solid #d9e9f1;
      border-top-color:var(--lagoon,#15ace3);
      border-radius:50%;
      animation:roundProgressSpin .75s linear infinite;
    }

    @keyframes roundProgressSpin{
      to{transform:rotate(360deg)}
    }

    @media(max-width:600px){
      .round-progress-modal{
        align-items:center;
        padding:
          max(10px,env(safe-area-inset-top))
          max(10px,env(safe-area-inset-right))
          max(10px,env(safe-area-inset-bottom))
          max(10px,env(safe-area-inset-left));
      }

      .round-progress-dialog{
        width:100%;
        max-width:100%;
        max-height:calc(100dvh - max(20px,env(safe-area-inset-top) + env(safe-area-inset-bottom)));
        border-radius:18px;
        overflow-x:hidden;
      }

      .round-progress-head{
        padding:18px 16px 15px;
      }

      .round-progress-title{
        font-size:20px;
      }

      .round-progress-body{
        padding:14px;
      }

      .round-progress-summary{
        grid-template-columns:1fr;
        gap:7px;
      }

      .round-progress-summary-card{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        padding:9px 11px;
      }

      .round-progress-summary-card strong{
        order:2;
        font-size:18px;
      }

      .round-progress-summary-card span{
        order:1;
        margin:0;
      }

      .round-progress-person{
        padding:11px;
      }

      .round-progress-person-head{
        align-items:flex-start;
      }

      .round-progress-state{
        max-width:94px;
        white-space:normal;
        text-align:center;
      }

    }

    @media(prefers-reduced-motion:reduce){
      .round-progress-loading::before{
        animation:none;
      }

      .round-progress-track span{
        transition:none;
      }

    }
  `;
  document.head.appendChild(style);
}

function ensureModal(){
  if(modal) return modal;

  modal = document.createElement("div");
  modal.className = "round-progress-modal";
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="round-progress-backdrop" data-round-progress-close></div>
    <section class="round-progress-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="roundProgressTitle">
      <header class="round-progress-head">
        <div>
          <div class="round-progress-kicker">Current evaluation round</div>
          <h2 class="round-progress-title" id="roundProgressTitle">Evaluator progress</h2>
          <div class="round-progress-subtitle">
            See who is actively evaluating, who has not started, and who has completed all expected submissions.
          </div>
        </div>
        <button class="round-progress-close"
          type="button"
          aria-label="Close evaluator progress"
          data-round-progress-close>×</button>
      </header>
      <div class="round-progress-body" id="roundProgressBody"></div>
    </section>
  `;

  document.body.appendChild(modal);

  modal.addEventListener("click", event => {
    if(event.target.closest("[data-round-progress-close]")) closeModal();
  });

  return modal;
}

function closeModal(){
  if(!modal || modal.hidden) return;
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  stopLiveSync();
  document.body.style.overflow = previousOverflow;
  lastFocused?.focus?.({preventScroll:true});
  lastFocused = null;
}

function openShell(){
  ensureModal();
  if(modal.hidden){
    lastFocused = document.activeElement;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
  }
  modal.querySelector(".round-progress-close")?.focus({preventScroll:true});
}

function scoreCount(row){
  if(Number.isFinite(Number(row?.score_count))){
    return clamp(Number(row.score_count), 0, CRITERIA_TOTAL);
  }

  if(row?.scores && typeof row.scores === "object"){
    return clamp(
      Object.values(row.scores)
        .filter(value =>
          value !== null &&
          value !== "" &&
          Number.isFinite(Number(value))
        ).length,
      0,
      CRITERIA_TOTAL
    );
  }

  return 0;
}

function hasComment(row){
  if(typeof row?.has_comment === "boolean") return row.has_comment;
  return !!String(row?.comments || "").trim();
}

function buildProgress(people, rows, roster){
  const peopleIds = new Set(people.map(person => person.id));
  const names = new Map();

  [...people, ...roster].forEach(person => {
    if(person?.id && !names.has(person.id)){
      names.set(person.id, person.full_name || "Unknown");
    }
  });

  const eligible = roster
    .filter(person => person?.id && person.has_login !== false)
    .map(person => ({
      id:person.id,
      full_name:person.full_name || names.get(person.id) || "Unknown"
    }));

  const currentRows = rows.filter(row => !row.archived);

  return eligible.map(evaluator => {
    const required = Math.max(
      people.length - (peopleIds.has(evaluator.id) ? 1 : 0),
      0
    );

    const allowedEmployees = new Set(
      people
        .filter(person => person.id !== evaluator.id)
        .map(person => person.id)
    );

    const byEmployee = new Map();

    currentRows.forEach(row => {
      if(
        row.evaluator_id !== evaluator.id ||
        !allowedEmployees.has(row.employee_id)
      ) return;

      const previous = byEmployee.get(row.employee_id);
      const previousTime = new Date(
        previous?.updated_at || previous?.created_at || 0
      ).getTime();
      const currentTime = new Date(
        row.updated_at || row.created_at || 0
      ).getTime();

      if(!previous || currentTime >= previousTime){
        byEmployee.set(row.employee_id, row);
      }
    });

    const evaluatorRows = [...byEmployee.values()];
    const submitted = evaluatorRows.filter(row => !!row.locked).length;
    const drafts = evaluatorRows.filter(row => !row.locked);

    let workUnits = submitted;

    drafts.forEach(row => {
      const scored = scoreCount(row);
      let partial = CRITERIA_TOTAL ? scored / CRITERIA_TOTAL : 0;

      // A comment-only draft is still visible activity.
      if(partial === 0 && hasComment(row)) partial = .05;

      // A fully scored but not-yet-submitted draft must never look complete.
      partial = Math.min(partial, .95);
      workUnits += partial;
    });

    const pct = required
      ? clamp(workUnits / required * 100, 0, 100)
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

    const activeEmployee = activeDraft
      ? names.get(activeDraft.employee_id) || "Unknown employee"
      : "";

    const activeScores = activeDraft ? scoreCount(activeDraft) : 0;

    return {
      id:evaluator.id,
      name:evaluator.full_name,
      required,
      submitted,
      pct,
      state,
      stateLabel,
      activeEmployee,
      activeScores
    };
  }).sort((a,b) => {
    const order = {"evaluating":0, "not-started":1, "completed":2};
    return (
      (order[a.state] ?? 9) - (order[b.state] ?? 9) ||
      a.name.localeCompare(b.name)
    );
  });
}

function progressSignature(items){
  return JSON.stringify(
    items.map(item => [
      item.id,
      item.required,
      item.submitted,
      Math.round(item.pct * 100) / 100,
      item.state,
      item.activeEmployee,
      item.activeScores
    ])
  );
}

function renderProgress(items){
  const body = document.getElementById("roundProgressBody");
  if(!body) return;

  const signature = progressSignature(items);
  if(signature === lastRenderSignature) return;
  lastRenderSignature = signature;

  if(!items.length){
    body.innerHTML = `
      <div class="round-progress-empty">
        No eligible evaluators are available for the current round.
      </div>
    `;
    return;
  }

  const scrollBox = modal?.querySelector(".round-progress-dialog");
  const previousScrollTop = scrollBox?.scrollTop || 0;

  const counts = items.reduce(
    (acc,item) => {
      acc[item.state] = (acc[item.state] || 0) + 1;
      return acc;
    },
    {}
  );

  body.innerHTML = `
    <div class="round-progress-summary">
      <div class="round-progress-summary-card evaluating">
        <strong>${counts["evaluating"] || 0}</strong>
        <span>Evaluating</span>
      </div>
      <div class="round-progress-summary-card not-started">
        <strong>${counts["not-started"] || 0}</strong>
        <span>Not started</span>
      </div>
      <div class="round-progress-summary-card completed">
        <strong>${counts["completed"] || 0}</strong>
        <span>Completed</span>
      </div>
    </div>
    <div class="round-progress-list"></div>
  `;

  const list = body.querySelector(".round-progress-list");

  items.forEach(item => {
    const row = document.createElement("article");
    row.className = `round-progress-person ${item.state}`;

    const assignmentText = item.required
      ? `${item.submitted} of ${item.required} evaluations submitted`
      : "No evaluations assigned";

    let detailText = assignmentText;

    if(item.state === "evaluating" && item.activeEmployee){
      detailText +=
        ` · currently evaluating ${item.activeEmployee}` +
        (item.activeScores
          ? ` (${item.activeScores}/${CRITERIA_TOTAL} criteria)`
          : "");
    }

    const previousPct = previousProgressPct.has(item.id)
      ? previousProgressPct.get(item.id)
      : item.pct;

    row.innerHTML = `
      <div class="round-progress-person-head">
        <span class="round-progress-avatar" aria-hidden="true">${initials(item.name)}</span>
        <div class="round-progress-person-copy">
          <strong class="round-progress-name"></strong>
          <span class="round-progress-meta"></span>
        </div>
        <span class="round-progress-state ${item.state}">${item.stateLabel}</span>
      </div>
      <div class="round-progress-line">
        <span>Round progress</span>
        <strong>${Math.round(item.pct)}%</strong>
      </div>
      <div class="round-progress-track"
        role="progressbar"
        aria-label="${item.name} round progress"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="${Math.round(item.pct)}">
        <span style="width:${previousPct}%"></span>
      </div>
    `;

    row.querySelector(".round-progress-name").textContent = item.name;
    row.querySelector(".round-progress-meta").textContent = detailText;
    list.appendChild(row);

    const fill = row.querySelector(".round-progress-track > span");
    previousProgressPct.set(item.id, item.pct);

    if(fill && Math.abs(previousPct - item.pct) > .01){
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if(fill.isConnected) fill.style.width = `${item.pct}%`;
      }));
    }else if(fill){
      fill.style.width = `${item.pct}%`;
    }
  });

  if(scrollBox){
    scrollBox.scrollTop = Math.min(
      previousScrollTop,
      Math.max(0, scrollBox.scrollHeight - scrollBox.clientHeight)
    );
  }
}

async function loadProgress({full=false, showLoading=false}={}){
  if(liveRefreshRunning){
    liveRefreshAgain = true;
    return;
  }

  liveRefreshRunning = true;

  const body = document.getElementById("roundProgressBody");
  const hadRenderedData = !!lastRenderSignature;

  if(showLoading && body && !hadRenderedData){
    body.innerHTML = `
      <div class="round-progress-loading" role="status">
        Loading current round progress…
      </div>
    `;
  }

  try{
    const { data:{ session } } = await db.auth.getSession();
    if(!session) throw new Error("No active staff session.");

    let evaluationsResult;

    if(full || !cachedPeople || !cachedRoster){
      const [profilesResult, evaluations, rosterResult] =
        await Promise.all([
          db.from("profiles")
            .select("id,full_name,position,role,form_role")
            .order("full_name"),
          db.rpc("get_dashboard_evaluations"),
          db.rpc("get_evaluation_roster")
        ]);

      evaluationsResult = evaluations;
      if(evaluationsResult.error) throw evaluationsResult.error;

      const profiles = !profilesResult.error
        ? (profilesResult.data || [])
        : [];

      const roster = (
        !rosterResult.error &&
        Array.isArray(rosterResult.data)
      )
        ? rosterResult.data
        : profiles.map(person => ({...person, has_login:true}));

      cachedPeople = profiles.length ? profiles : roster;
      cachedRoster = roster;
    }else{
      evaluationsResult = await db.rpc("get_dashboard_evaluations");
      if(evaluationsResult.error) throw evaluationsResult.error;
    }

    const items = buildProgress(
      cachedPeople || [],
      evaluationsResult.data || [],
      cachedRoster || []
    );

    renderProgress(items);
  }catch(error){
    console.error("Current round progress failed:", error);

    // Keep already-visible progress on screen during a transient network error.
    // Only show an error card when the initial load itself fails.
    if(body && !hadRenderedData){
      body.innerHTML = `
        <div class="round-progress-error">
          Could not load evaluator progress. Please close this window and try again.
        </div>
      `;
    }
  }finally{
    liveRefreshRunning = false;

    if(liveRefreshAgain && modal && !modal.hidden){
      liveRefreshAgain = false;
      scheduleLiveRefresh(40);
    }
  }
}

function scheduleLiveRefresh(delay=80){
  clearTimeout(liveRefreshTimer);
  liveRefreshTimer = setTimeout(() => {
    liveRefreshTimer = null;
    if(!modal || modal.hidden) return;
    loadProgress({full:false, showLoading:false});
  }, delay);
}

function hookAuthenticatedRealtime(){
  const current = window.__refreshResults;
  if(typeof current !== "function") return false;

  if(current.__roundProgressRealtimeHook){
    realtimeHooked = true;
    return true;
  }

  const wrapped = function(...args){
    let result;

    try{
      result = current.apply(this, args);
    }finally{
      if(modal && !modal.hidden){
        scheduleLiveRefresh(70);
      }
    }

    return result;
  };

  wrapped.__roundProgressRealtimeHook = true;
  wrapped.__roundProgressRealtimeOriginal = current;
  window.__refreshResults = wrapped;
  realtimeHooked = true;
  return true;
}

function startLiveSync(){
  hookAuthenticatedRealtime();

  clearInterval(livePollTimer);
  livePollTimer = setInterval(() => {
    if(!modal || modal.hidden) return;
    if(document.visibilityState !== "visible") return;
    scheduleLiveRefresh(0);
  }, 5000);
}

function stopLiveSync(){
  clearTimeout(liveRefreshTimer);
  liveRefreshTimer = null;
  clearInterval(livePollTimer);
  livePollTimer = null;
  liveRefreshAgain = false;
}

function openProgress(){
  openShell();
  startLiveSync();
  loadProgress({
    full: !cachedPeople || !cachedRoster,
    showLoading: true
  });
}

function makeCardInteractive(){
  const card = document.getElementById("completionText")?.closest(".dash-metric");
  if(!card || card.dataset.roundProgressReady === "1") return;

  card.dataset.roundProgressReady = "1";
  card.classList.add("dash-round-progress-card");
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-haspopup", "dialog");
  card.setAttribute(
    "aria-label",
    "Current Round Progress. Open evaluator progress details."
  );
  card.removeAttribute("title");

  card.addEventListener("click", openProgress);
  card.addEventListener("keydown", event => {
    if(event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openProgress();
  });
}

injectStyles();
makeCardInteractive();

const realtimeHookTimer = setInterval(() => {
  if(hookAuthenticatedRealtime()) clearInterval(realtimeHookTimer);
}, 100);

setTimeout(() => {
  if(!realtimeHooked) hookAuthenticatedRealtime();
  clearInterval(realtimeHookTimer);
}, 8000);

document.addEventListener("visibilitychange", () => {
  if(
    document.visibilityState === "visible" &&
    modal &&
    !modal.hidden
  ){
    scheduleLiveRefresh(0);
  }
});

window.addEventListener("focus", () => {
  if(modal && !modal.hidden) scheduleLiveRefresh(0);
});

document.addEventListener("keydown", event => {
  if(event.key === "Escape" && modal && !modal.hidden){
    closeModal();
  }
});

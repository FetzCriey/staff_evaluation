import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* =========================================================
   CURRENT ROUND PROGRESS — EVALUATOR DRILLDOWN
   Adds an assignment-level accordion beneath each evaluator
   without replacing the existing progress renderer.
   ========================================================= */

const SUPABASE_URL = "https://giosjwjhalhmwcuyzfos.supabase.co";
const SUPABASE_KEY = "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_";
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const CRITERIA_TOTAL = 10;
const SNAPSHOT_TTL = 3500;

let snapshotCache = null;
let snapshotAt = 0;
let snapshotPromise = null;
let decorateQueued = false;
let decorating = false;
let openIdentity = null;
let activeRow = null;
let panelSequence = 0;

const clamp = (value,min,max) => Math.max(min,Math.min(max,value));

const normalize = value => String(value || "")
  .toLowerCase()
  .replace(/\s+/g," ")
  .trim();

function initials(name){
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return (
    (parts[0]?.[0] || "") +
    (parts.length > 1 ? parts.at(-1)?.[0] || "" : "")
  ).toUpperCase() || "—";
}

function scoreCount(row){
  if(Number.isFinite(Number(row?.score_count))){
    return clamp(Number(row.score_count),0,CRITERIA_TOTAL);
  }

  if(row?.scores && typeof row.scores === "object"){
    return clamp(
      Object.values(row.scores).filter(value =>
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

function injectStyles(){
  if(document.getElementById("round-progress-drilldown-style")) return;

  const style = document.createElement("style");
  style.id = "round-progress-drilldown-style";
  style.textContent = `
    .round-progress-person.has-drilldown{
      overflow:hidden;
      cursor:pointer;
      transition:border-color .16s ease,box-shadow .16s ease,background .16s ease;
    }

    .round-progress-person.has-drilldown:not(.drilldown-open):hover{
      border-color:var(--lagoon,#15ace3);
      box-shadow:0 10px 28px -22px rgba(8,52,76,.38);
    }

    .round-progress-person.has-drilldown.drilldown-open{
      border-color:var(--lagoon,#15ace3);
      box-shadow:0 10px 28px -20px rgba(8,52,76,.45);
    }

    .round-progress-person.has-drilldown > .round-drilldown-panel,
    .round-progress-person.has-drilldown > .round-drilldown-panel *{
      cursor:default;
    }

    .round-progress-person-head.round-drilldown-toggle{
      position:relative;
      cursor:pointer;
      border-radius:10px;
      outline:none;
    }

    .round-progress-person-head.round-drilldown-toggle:focus-visible{
      box-shadow:0 0 0 3px rgba(21,172,227,.18);
    }

    .round-drilldown-chevron{
      flex:0 0 auto;
      width:9px;
      height:9px;
      margin:0 2px 0 1px;
      border-right:2px solid var(--lagoon-deep,#0b7fb0);
      border-bottom:2px solid var(--lagoon-deep,#0b7fb0);
      opacity:.65;
      transform:rotate(45deg);
      transition:transform .2s ease,opacity .16s ease;
    }

    .round-progress-person.drilldown-open .round-drilldown-chevron{
      opacity:1;
      transform:rotate(225deg);
    }

    .round-drilldown-hint{
      margin-top:8px;
      display:flex;
      align-items:center;
      justify-content:flex-end;
      gap:5px;
      color:var(--lagoon-deep,#0b7fb0);
      font-size:9px;
      line-height:1;
      font-weight:800;
      letter-spacing:.06em;
      text-transform:uppercase;
      opacity:.68;
    }

    .round-progress-person.drilldown-open .round-drilldown-hint{
      display:none;
    }

    .round-drilldown-panel{
      margin:12px -13px -12px;
      padding:13px;
      border-top:1px solid var(--line,#c9dfee);
      background:#f7fbfd;
      animation:roundDrilldownIn .18s ease;
    }

    .round-drilldown-panel[hidden]{
      display:none !important;
    }

    .round-drilldown-title-row{
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:10px;
      margin-bottom:10px;
    }

    .round-drilldown-kicker{
      margin-bottom:3px;
      color:var(--lagoon-deep,#0b7fb0);
      font-size:9px;
      line-height:1.2;
      font-weight:800;
      letter-spacing:.12em;
      text-transform:uppercase;
    }

    .round-drilldown-title{
      margin:0;
      color:var(--ink,#0a2233);
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:13px;
      line-height:1.2;
      font-weight:800;
    }

    .round-drilldown-count{
      flex:0 0 auto;
      padding:3px 7px;
      border:1px solid #c9e6f4;
      border-radius:999px;
      background:var(--accent-soft,#e2f4fc);
      color:var(--lagoon-deep,#0b7fb0);
      font-size:9px;
      font-weight:800;
      white-space:nowrap;
    }

    .round-drilldown-list{
      display:flex;
      flex-direction:column;
      gap:7px;
    }

    .round-drilldown-assignment{
      display:grid;
      grid-template-columns:30px minmax(0,1fr) auto;
      grid-template-areas:
        "avatar copy badge"
        "avatar bar badge";
      column-gap:9px;
      row-gap:6px;
      align-items:center;
      min-width:0;
      padding:9px 10px;
      border:1px solid var(--line,#c9dfee);
      border-radius:11px;
      background:#fff;
    }

    .round-drilldown-assignment.in-progress{
      border-color:#bfe4f5;
      background:#fbfdff;
    }

    .round-drilldown-assignment.submitted{
      border-color:#bfe3ce;
      background:#fbfefc;
    }

    .round-drilldown-assignment.not-started{
      border-color:#d9e3e8;
      background:#fcfdfe;
    }

    .round-drilldown-avatar{
      grid-area:avatar;
      width:30px;
      height:30px;
      display:grid;
      place-items:center;
      border:1px solid #c6dfed;
      border-radius:9px;
      background:linear-gradient(160deg,#eff8fd,#d7eaf5);
      color:var(--lagoon-dark,#08344c);
      font-size:9px;
      font-weight:800;
    }

    .round-drilldown-copy{
      grid-area:copy;
      min-width:0;
    }

    .round-drilldown-name{
      display:block;
      min-width:0;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
      color:var(--ink,#0a2233);
      font-size:10.8px;
      line-height:1.25;
      font-weight:800;
    }

    .round-drilldown-meta{
      display:block;
      margin-top:2px;
      color:var(--muted,#5b7080);
      font-size:9.3px;
      line-height:1.3;
    }

    .round-drilldown-badge{
      grid-area:badge;
      align-self:start;
      padding:3px 6px;
      border-radius:999px;
      font-size:8px;
      line-height:1.25;
      font-weight:800;
      letter-spacing:.04em;
      text-transform:uppercase;
      white-space:nowrap;
    }

    .round-drilldown-badge.in-progress{
      border:1px solid #bfe4f5;
      background:var(--accent-soft,#e2f4fc);
      color:var(--lagoon-deep,#0b7fb0);
    }

    .round-drilldown-badge.submitted{
      border:1px solid #bfe3ce;
      background:#eaf7f0;
      color:#1f7a4d;
    }

    .round-drilldown-badge.not-started{
      border:1px solid #d9e3e8;
      background:#f1f5f7;
      color:#6c7d88;
    }

    .round-drilldown-bar{
      grid-area:bar;
      height:5px;
      overflow:hidden;
      border-radius:999px;
      background:#e7f0f6;
    }

    .round-drilldown-bar span{
      display:block;
      height:100%;
      border-radius:inherit;
      background:linear-gradient(90deg,var(--lagoon,#15ace3),var(--lagoon-deep,#0b7fb0));
    }

    .round-drilldown-assignment.submitted .round-drilldown-bar span{
      background:linear-gradient(90deg,#33b877,#1f7a4d);
    }

    .round-drilldown-assignment.not-started .round-drilldown-bar span{
      background:#c8d7df;
    }

    .round-drilldown-loading,
    .round-drilldown-error,
    .round-drilldown-empty{
      padding:15px 10px;
      border:1px solid var(--line,#c9dfee);
      border-radius:11px;
      background:#fff;
      text-align:center;
      color:var(--muted,#5b7080);
      font-size:10px;
    }

    .round-drilldown-loading::before{
      content:"";
      display:inline-block;
      width:13px;
      height:13px;
      margin-right:7px;
      vertical-align:-2px;
      border:2px solid #d7e8f1;
      border-top-color:var(--lagoon,#15ace3);
      border-radius:50%;
      animation:roundDrilldownSpin .7s linear infinite;
    }

    @keyframes roundDrilldownSpin{
      to{transform:rotate(360deg)}
    }

    @keyframes roundDrilldownIn{
      from{opacity:0;transform:translateY(-4px)}
      to{opacity:1;transform:none}
    }

    @media(max-width:600px){
      .round-drilldown-panel{
        margin:11px -11px -11px;
        padding:11px;
      }

      .round-drilldown-assignment{
        grid-template-columns:28px minmax(0,1fr);
        grid-template-areas:
          "avatar copy"
          "avatar badge"
          "bar bar";
        padding:9px;
      }

      .round-drilldown-avatar{
        width:28px;
        height:28px;
      }

      .round-drilldown-badge{
        justify-self:start;
      }

      .round-drilldown-name{
        white-space:normal;
        overflow-wrap:anywhere;
      }
    }

    @media(prefers-reduced-motion:reduce){
      .round-drilldown-chevron{
        transition:none;
      }

      .round-drilldown-panel{
        animation:none;
      }

      .round-drilldown-loading::before{
        animation:none;
      }
    }
  `;

  document.head.appendChild(style);
}

async function getSnapshot(force=false){
  const now = Date.now();

  if(!force && snapshotCache && now - snapshotAt < SNAPSHOT_TTL){
    return snapshotCache;
  }

  if(snapshotPromise) return snapshotPromise;

  snapshotPromise = (async () => {
    const [profilesResult,evaluationsResult,rosterResult] = await Promise.all([
      db.from("profiles")
        .select("id,full_name,position,role,form_role")
        .order("full_name"),
      db.rpc("get_dashboard_evaluations"),
      db.rpc("get_evaluation_roster")
    ]);

    if(evaluationsResult.error) throw evaluationsResult.error;

    const profiles = !profilesResult.error
      ? (profilesResult.data || [])
      : [];

    const roster = (
      !rosterResult.error &&
      Array.isArray(rosterResult.data)
    )
      ? rosterResult.data
      : profiles.map(person => ({...person,has_login:true}));

    snapshotCache = {
      people:profiles.length ? profiles : roster,
      roster,
      rows:evaluationsResult.data || []
    };
    snapshotAt = Date.now();
    return snapshotCache;
  })();

  try{
    return await snapshotPromise;
  }finally{
    snapshotPromise = null;
  }
}

function latestRowsForEvaluator(snapshot,evaluatorId){
  const allowedEmployees = new Set(
    snapshot.people
      .filter(person => person.id !== evaluatorId)
      .map(person => person.id)
  );

  const byEmployee = new Map();

  snapshot.rows.forEach(row => {
    if(
      row.archived ||
      row.evaluator_id !== evaluatorId ||
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
      byEmployee.set(row.employee_id,row);
    }
  });

  return byEmployee;
}

function evaluatorSummary(snapshot,evaluator){
  const peopleIds = new Set(snapshot.people.map(person => person.id));
  const required = Math.max(
    snapshot.people.length - (peopleIds.has(evaluator.id) ? 1 : 0),
    0
  );

  const byEmployee = latestRowsForEvaluator(snapshot,evaluator.id);
  const evaluatorRows = [...byEmployee.values()];
  const submitted = evaluatorRows.filter(row => !!row.locked).length;
  const started = evaluatorRows.length > 0;
  const completed = required === 0 || submitted >= required;

  let state = "not-started";
  if(completed) state = "completed";
  else if(started) state = "evaluating";

  return {required,submitted,state};
}

function visibleRowState(row){
  if(row.classList.contains("completed")) return "completed";
  if(row.classList.contains("evaluating")) return "evaluating";
  return "not-started";
}

function visibleSubmissionNumbers(row){
  const text = row.querySelector(".round-progress-meta")?.textContent || "";
  const match = text.match(/(\d+)\s+of\s+(\d+)\s+evaluations?\s+submitted/i);
  if(!match) return null;
  return {
    submitted:Number(match[1]),
    required:Number(match[2])
  };
}

function sameNameOccurrence(row){
  const name = normalize(row.querySelector(".round-progress-name")?.textContent);
  if(!name) return 0;

  const rows = [...document.querySelectorAll(".round-progress-person")];
  const matches = rows.filter(candidate =>
    normalize(candidate.querySelector(".round-progress-name")?.textContent) === name
  );

  return Math.max(0,matches.indexOf(row));
}

function identifyEvaluator(snapshot,row){
  const visibleName = String(
    row.querySelector(".round-progress-name")?.textContent || ""
  ).trim();
  const wantedName = normalize(visibleName);
  const wantedState = visibleRowState(row);
  const numbers = visibleSubmissionNumbers(row);

  let candidates = snapshot.roster.filter(person =>
    person?.id &&
    person.has_login !== false &&
    normalize(person.full_name) === wantedName
  );

  if(candidates.length <= 1) return candidates[0] || null;

  const exact = candidates.filter(candidate => {
    const summary = evaluatorSummary(snapshot,candidate);
    return (
      summary.state === wantedState &&
      (!numbers || (
        summary.submitted === numbers.submitted &&
        summary.required === numbers.required
      ))
    );
  });

  if(exact.length === 1) return exact[0];

  candidates = exact.length ? exact : candidates;
  candidates = candidates.slice().sort((a,b) =>
    String(a.id).localeCompare(String(b.id))
  );

  return candidates[sameNameOccurrence(row)] || candidates[0] || null;
}

function buildAssignments(snapshot,evaluator){
  const byEmployee = latestRowsForEvaluator(snapshot,evaluator.id);

  return snapshot.people
    .filter(person => person.id !== evaluator.id)
    .map(person => {
      const row = byEmployee.get(person.id) || null;
      const scored = row ? scoreCount(row) : 0;
      const commented = row ? hasComment(row) : false;

      let state = "not-started";
      let label = "Not started";
      let meta = "No evaluation activity yet";
      let pct = 0;

      if(row?.locked){
        state = "submitted";
        label = "Submitted";
        meta = "Evaluation submitted";
        pct = 100;
      }else if(row){
        state = "in-progress";
        label = "In progress";

        if(scored > 0){
          meta = `${scored}/${CRITERIA_TOTAL} criteria completed`;
          pct = Math.min(
            CRITERIA_TOTAL ? scored / CRITERIA_TOTAL * 100 : 0,
            95
          );
        }else if(commented){
          meta = "Comment added";
          pct = 5;
        }else{
          meta = "Evaluation started";
          pct = 5;
        }
      }

      return {
        id:person.id,
        name:person.full_name || "Unknown employee",
        state,
        label,
        meta,
        pct
      };
    })
    .sort((a,b) => {
      const order = {"in-progress":0,"not-started":1,"submitted":2};
      return (
        (order[a.state] ?? 9) - (order[b.state] ?? 9) ||
        a.name.localeCompare(b.name)
      );
    });
}

function setRowExpanded(row,expanded){
  const head = row.querySelector(".round-drilldown-toggle");
  const panel = row.querySelector(".round-drilldown-panel");

  row.classList.toggle("drilldown-open",expanded);
  head?.setAttribute("aria-expanded",String(expanded));

  if(panel) panel.hidden = !expanded;
}

function closeActive({clearIdentity=true}={}){
  if(activeRow?.isConnected) setRowExpanded(activeRow,false);
  activeRow = null;
  if(clearIdentity) openIdentity = null;
}

function createPanel(row){
  let panel = row.querySelector(":scope > .round-drilldown-panel");
  if(panel) return panel;

  panel = document.createElement("div");
  panel.className = "round-drilldown-panel";
  panel.id = `roundDrilldownPanel${++panelSequence}`;
  panel.hidden = true;
  row.appendChild(panel);

  const head = row.querySelector(".round-drilldown-toggle");
  head?.setAttribute("aria-controls",panel.id);

  return panel;
}

function renderAssignmentPanel(panel,evaluator,assignments){
  const submitted = assignments.filter(item => item.state === "submitted").length;

  panel.innerHTML = `
    <div class="round-drilldown-title-row">
      <div>
        <div class="round-drilldown-kicker">Assignment breakdown</div>
        <h3 class="round-drilldown-title"></h3>
      </div>
      <span class="round-drilldown-count">
        ${submitted}/${assignments.length} submitted
      </span>
    </div>
    <div class="round-drilldown-list"></div>
  `;

  panel.querySelector(".round-drilldown-title").textContent =
    `${evaluator.full_name || "Evaluator"}'s evaluations`;

  const list = panel.querySelector(".round-drilldown-list");

  if(!assignments.length){
    list.innerHTML = `
      <div class="round-drilldown-empty">
        No employee evaluations are assigned to this evaluator.
      </div>
    `;
    return;
  }

  assignments.forEach(item => {
    const assignment = document.createElement("div");
    assignment.className = `round-drilldown-assignment ${item.state}`;

    assignment.innerHTML = `
      <span class="round-drilldown-avatar" aria-hidden="true">${initials(item.name)}</span>
      <div class="round-drilldown-copy">
        <strong class="round-drilldown-name"></strong>
        <span class="round-drilldown-meta"></span>
      </div>
      <span class="round-drilldown-badge ${item.state}">
        ${item.state === "submitted" ? "✓ Submitted" : item.label}
      </span>
      <div class="round-drilldown-bar"
        role="progressbar"
        aria-label="${item.name} evaluation progress"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow="${Math.round(item.pct)}">
        <span style="width:${item.pct}%"></span>
      </div>
    `;

    assignment.querySelector(".round-drilldown-name").textContent = item.name;
    assignment.querySelector(".round-drilldown-meta").textContent = item.meta;
    list.appendChild(assignment);
  });
}

async function openDetails(row,{restore=false}={}){
  if(!row?.isConnected) return;

  if(activeRow && activeRow !== row){
    setRowExpanded(activeRow,false);
  }

  activeRow = row;

  const name = String(
    row.querySelector(".round-progress-name")?.textContent || ""
  ).trim();

  openIdentity = {
    name:normalize(name),
    occurrence:sameNameOccurrence(row)
  };

  const panel = createPanel(row);
  setRowExpanded(row,true);

  panel.innerHTML = `
    <div class="round-drilldown-loading" role="status">
      Loading assignment details…
    </div>
  `;

  try{
    const snapshot = await getSnapshot(restore);
    if(!row.isConnected || activeRow !== row) return;

    const evaluator = identifyEvaluator(snapshot,row);
    if(!evaluator){
      throw new Error("Could not match this evaluator to the current roster.");
    }

    const assignments = buildAssignments(snapshot,evaluator);
    renderAssignmentPanel(panel,evaluator,assignments);
  }catch(error){
    console.error("Evaluator drilldown failed:",error);
    if(panel.isConnected){
      panel.innerHTML = `
        <div class="round-drilldown-error">
          Could not load this evaluator's assignment details. Try again.
        </div>
      `;
    }
  }
}

function toggleDetails(row){
  const isOpen = row.classList.contains("drilldown-open");

  if(isOpen){
    closeActive();
    return;
  }

  openDetails(row);
}

function decorateRow(row){
  if(row.dataset.roundDrilldownReady === "1") return;

  const head = row.querySelector(".round-progress-person-head");
  if(!head) return;

  row.dataset.roundDrilldownReady = "1";
  row.classList.add("has-drilldown");

  head.classList.add("round-drilldown-toggle");
  head.setAttribute("role","button");
  head.setAttribute("tabindex","0");
  head.setAttribute("aria-expanded","false");
  head.setAttribute("aria-label","View this evaluator's assignment details");

  if(!head.querySelector(".round-drilldown-chevron")){
    const chevron = document.createElement("span");
    chevron.className = "round-drilldown-chevron";
    chevron.setAttribute("aria-hidden","true");
    head.appendChild(chevron);
  }

  if(!row.querySelector(":scope > .round-drilldown-hint")){
    const hint = document.createElement("div");
    hint.className = "round-drilldown-hint";
    hint.innerHTML = `<span>View assignments</span>`;
    row.appendChild(hint);
  }

  // Keep the header keyboard-accessible, but make the whole evaluator card
  // respond to pointer/touch clicks. The expanded assignment panel is excluded
  // so users can interact with or scroll its content without collapsing it.
  head.addEventListener("click",event => {
    event.stopPropagation();
    toggleDetails(row);
  });

  head.addEventListener("keydown",event => {
    if(event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    event.stopPropagation();
    toggleDetails(row);
  });

  row.addEventListener("click",event => {
    if(event.target.closest(".round-drilldown-panel")) return;
    if(event.target.closest(".round-drilldown-toggle")) return;
    toggleDetails(row);
  });
}

function restoreOpenRow(){
  if(!openIdentity || activeRow?.isConnected) return;

  const matches = [...document.querySelectorAll(".round-progress-person")]
    .filter(row =>
      normalize(row.querySelector(".round-progress-name")?.textContent) ===
      openIdentity.name
    );

  const row = matches[openIdentity.occurrence] || matches[0];
  if(row){
    openDetails(row,{restore:true});
  }
}

function decorateAll(){
  if(decorating) return;
  decorating = true;

  try{
    document.querySelectorAll(".round-progress-person").forEach(decorateRow);

    if(activeRow && !activeRow.isConnected){
      activeRow = null;
    }

    restoreOpenRow();
  }finally{
    decorating = false;
  }
}

function queueDecorate(){
  if(decorateQueued) return;
  decorateQueued = true;

  requestAnimationFrame(() => {
    decorateQueued = false;
    decorateAll();
  });
}

const observer = new MutationObserver(mutations => {
  const relevant = mutations.some(mutation => {
    const target = mutation.target;
    if(
      target?.nodeType === 1 &&
      target.closest?.(".round-progress-modal")
    ) return true;

    return [...mutation.addedNodes].some(node => {
      if(node?.nodeType !== 1) return false;
      return (
        node.matches?.(".round-progress-modal,.round-progress-person") ||
        node.querySelector?.(".round-progress-modal,.round-progress-person")
      );
    });
  });

  if(relevant) queueDecorate();
});

injectStyles();

observer.observe(document.body,{
  childList:true,
  subtree:true
});

queueDecorate();

document.addEventListener("visibilitychange",() => {
  if(document.visibilityState === "visible" && openIdentity){
    snapshotAt = 0;
  }
});

window.addEventListener("focus",() => {
  if(openIdentity) snapshotAt = 0;
});

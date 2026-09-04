import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/*
  HISTORY — EXEMPTED STAFF FOR THE CORRECT ROUND

  Important:
  - Current Evaluation Results keeps its existing exemption behavior.
  - This file ONLY augments #hisList (History).
  - An exempted person is added to a History date only when their exemption
    overlaps that archived evaluation round.
  - They are shown as read-only / non-clickable with the saved reason.
  - Older History rounds outside that exemption window are untouched.
*/

const db = createClient(
  "https://giosjwjhalhmwcuyzfos.supabase.co",
  "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_"
);

const list = document.getElementById("hisList");
if(!list) throw new Error("History list not found");

let roundByDate = new Map();
let exemptionRows = [];
let nameById = new Map();

let refreshTimer = null;
let running = false;
let runAgain = false;

function localDateKey(value){
  const d = new Date(value);
  if(Number.isNaN(d.getTime())) return "";

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function timeOf(value){
  const ms = new Date(value).getTime();
  return Number.isFinite(ms) ? ms : null;
}

function injectStyles(){
  if(document.getElementById("history-exempted-entry-style")) return;

  const style = document.createElement("style");
  style.id = "history-exempted-entry-style";
  style.textContent = `
    .his-row.his-exempted-row{
      cursor:default !important;
      border-color:#ecd9a6 !important;
      background:linear-gradient(180deg,#fffdf7 0%,#fff8e8 100%) !important;
      pointer-events:auto !important;
    }

    .his-row.his-exempted-row:hover{
      transform:none !important;
      box-shadow:none !important;
    }

    .his-exempted-main{
      flex:1 1 auto;
      min-width:0;
      padding:10px 12px;
      cursor:default;
      user-select:text;
    }

    .his-exempted-row .his-nm{
      display:flex;
      align-items:center;
      gap:7px;
      min-width:0;
    }

    .his-exempted-badge{
      flex:0 0 auto;
      display:inline-flex;
      align-items:center;
      padding:3px 7px;
      border:1px solid #ecd9a6;
      border-radius:999px;
      background:#fff3d1;
      color:#8a641d;
      font-size:8px;
      line-height:1.2;
      font-weight:800;
      letter-spacing:.05em;
      text-transform:uppercase;
      white-space:nowrap;
    }

    .his-exempted-reason{
      display:block;
      margin-top:5px;
      color:#806a3e;
      font-size:9.5px;
      line-height:1.4;
      overflow-wrap:anywhere;
    }

    .his-exempted-state{
      flex:0 0 auto;
      margin-right:10px;
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
      cursor:default;
    }

    html[data-bp-theme="dark"] .his-row.his-exempted-row,
    html[data-bp-theme="amoled"] .his-row.his-exempted-row{
      border-color:rgba(225,190,102,.34) !important;
      background:rgba(153,112,32,.11) !important;
    }

    html[data-bp-theme="dark"] .his-exempted-reason,
    html[data-bp-theme="amoled"] .his-exempted-reason{
      color:#d7c28c;
    }

    html[data-bp-theme="dark"] .his-exempted-badge,
    html[data-bp-theme="dark"] .his-exempted-state,
    html[data-bp-theme="amoled"] .his-exempted-badge,
    html[data-bp-theme="amoled"] .his-exempted-state{
      border-color:rgba(225,190,102,.38);
      background:rgba(161,119,33,.18);
      color:#efd58f;
    }

    @media(max-width:560px){
      .his-exempted-main{
        padding:9px 10px;
      }

      .his-exempted-row .his-nm{
        align-items:flex-start;
        flex-direction:column;
        gap:4px;
      }

      .his-exempted-state{
        margin-right:8px;
        padding:4px 7px;
        font-size:8px;
      }
    }
  `;

  document.head.appendChild(style);
}

async function loadNames(){
  const map = new Map();

  try{
    const { data, error } = await db.rpc("get_evaluation_roster");

    if(!error && Array.isArray(data)){
      data.forEach(row => {
        if(row?.id && row?.full_name){
          map.set(row.id, row.full_name);
        }
      });
    }
  }catch(_){}

  try{
    const { data, error } = await db
      .from("profiles")
      .select("id,full_name");

    if(!error && Array.isArray(data)){
      data.forEach(row => {
        if(row?.id && row?.full_name){
          map.set(row.id, row.full_name);
        }
      });
    }
  }catch(_){}

  return map;
}

async function loadData(){
  const [archiveResult, exemptionResult, names] = await Promise.all([
    db
      .from("evaluations")
      .select("employee_id,created_at,archived_at,round")
      .eq("archived", true)
      .not("archived_at", "is", null),

    db
      .from("evaluation_round_exemptions")
      .select("id,staff_id,reason,exempted_at,restored_at")
      .order("exempted_at"),

    loadNames()
  ]);

  if(archiveResult.error) throw archiveResult.error;
  if(exemptionResult.error) throw exemptionResult.error;

  /*
    History is grouped by archived calendar date in supabase.js.
    Build the actual round window behind each History date:

      windowStart = earliest evaluation row created for that archived day
      windowEnd   = latest archive timestamp for that archived day

    An exemption is attached only if its active interval overlaps this window.
    This prevents a current exemption from leaking backward into old History.
  */
  const map = new Map();

  (archiveResult.data || []).forEach(row => {
    const key = localDateKey(row.archived_at);
    const created = timeOf(row.created_at);
    const archived = timeOf(row.archived_at);

    if(!key || archived === null) return;

    if(!map.has(key)){
      map.set(key, {
        start: created ?? archived,
        end: archived,
        employeeIds: new Set(),
        rounds: new Set()
      });
    }

    const group = map.get(key);

    if(created !== null){
      group.start = Math.min(group.start, created);
    }

    group.end = Math.max(group.end, archived);

    if(row.employee_id){
      group.employeeIds.add(row.employee_id);
    }

    if(row.round !== null && row.round !== undefined){
      group.rounds.add(String(row.round));
    }
  });

  roundByDate = map;
  exemptionRows = exemptionResult.data || [];
  nameById = names;
}

function overlapsRound(exemption, round){
  const start = timeOf(exemption?.exempted_at);
  if(start === null) return false;

  const end = exemption?.restored_at
    ? timeOf(exemption.restored_at)
    : Number.POSITIVE_INFINITY;

  const exemptionEnd =
    end === null ? Number.POSITIVE_INFINITY : end;

  /*
    Intervals overlap when:
      exemption started before round ended
      AND exemption ended after round started.
  */
  return start <= round.end && exemptionEnd >= round.start;
}

function exemptionsForDate(dateKey){
  const round = roundByDate.get(dateKey);
  if(!round) return [];

  const byStaff = new Map();

  exemptionRows.forEach(exemption => {
    const staffId = exemption?.staff_id;
    if(!staffId) return;

    /*
      If the person already has an archived evaluation for this History date,
      do not add a second "Exempted" row. History should show them as evaluated.
    */
    if(round.employeeIds.has(staffId)) return;

    if(!overlapsRound(exemption, round)) return;

    const current = byStaff.get(staffId);

    if(
      !current ||
      (timeOf(exemption.exempted_at) ?? 0) >
        (timeOf(current.exempted_at) ?? 0)
    ){
      byStaff.set(staffId, exemption);
    }
  });

  return [...byStaff.values()]
    .sort((a,b) => {
      const an = nameById.get(a.staff_id) || "";
      const bn = nameById.get(b.staff_id) || "";
      return an.localeCompare(bn);
    });
}

function makeExemptedRow(exemption){
  const name =
    nameById.get(exemption.staff_id) ||
    "Staff member";

  const reason =
    String(exemption.reason || "").trim() ||
    "Exempted from this evaluation round.";

  const row = document.createElement("div");
  row.className = "his-row his-exempted-row";
  row.dataset.historyExemptedStaffId = exemption.staff_id;

  /*
    Deliberately NOT a button and there is no click handler.
    It cannot open the score sheet because no evaluation exists.
  */
  const main = document.createElement("div");
  main.className = "his-exempted-main";

  const nameEl = document.createElement("div");
  nameEl.className = "his-nm";
  nameEl.append(document.createTextNode(name));

  const noEvaluation = document.createElement("span");
  noEvaluation.className = "his-exempted-badge";
  noEvaluation.textContent = "No evaluation";

  nameEl.appendChild(noEvaluation);

  const reasonEl = document.createElement("div");
  reasonEl.className = "his-exempted-reason";
  reasonEl.textContent = "Reason: " + reason;

  main.append(nameEl, reasonEl);

  const state = document.createElement("div");
  state.className = "his-exempted-state";
  state.textContent = "Exempted";

  row.append(main, state);
  row.setAttribute(
    "aria-label",
    `${name}. Exempted from this evaluation round. Reason: ${reason}`
  );

  return row;
}

function patchHistory(){
  /*
    This selector is intentionally scoped to #hisList only.
    Evaluation Results (#resList) is not changed here and therefore keeps
    the exemption display already provided by round-exemptions.js.
  */
  list.querySelectorAll(".his-date-group").forEach(group => {
    const dateKey = group.dataset.historyDateKey || "";
    const body = group.querySelector(".his-date-body");
    const count = group.querySelector(".his-date-count");

    if(!body || !dateKey) return;

    body
      .querySelectorAll(".his-exempted-row")
      .forEach(row => row.remove());

    const exemptions = exemptionsForDate(dateKey);

    exemptions.forEach(exemption => {
      body.appendChild(makeExemptedRow(exemption));
    });

    if(count){
      const evaluated =
        body.querySelectorAll(".his-row:not(.his-exempted-row)").length;

      count.textContent =
        `${evaluated} evaluation${evaluated === 1 ? "" : "s"}` +
        (exemptions.length
          ? ` · ${exemptions.length} exempted`
          : "");
    }
  });
}

async function refresh(){
  if(running){
    runAgain = true;
    return;
  }

  running = true;

  try{
    await loadData();
    patchHistory();
  }catch(error){
    console.warn(
      "Could not add round-specific exemptions to History:",
      error
    );
  }finally{
    running = false;

    if(runAgain){
      runAgain = false;
      refresh();
    }
  }
}

function queueRefresh(){
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(refresh, 90);
}

injectStyles();

/*
  supabase.js rebuilds History whenever archived records change.
  Re-patch only after a History structure change.
*/
new MutationObserver(mutations => {
  const historyChanged = mutations.some(mutation =>
    [...mutation.addedNodes, ...mutation.removedNodes].some(node =>
      node?.nodeType === 1 &&
      (
        node.matches?.(".his-date-group,.his-row") ||
        node.querySelector?.(".his-date-group,.his-row")
      )
    )
  );

  if(historyChanged){
    queueRefresh();
  }
}).observe(list, {
  childList:true,
  subtree:true
});

window.addEventListener(
  "round-exemptions-updated",
  queueRefresh
);

try{
  db.channel("history-round-specific-exemptions")
    .on(
      "postgres_changes",
      {
        event:"*",
        schema:"public",
        table:"evaluation_round_exemptions"
      },
      queueRefresh
    )
    .subscribe();
}catch(_){}

refresh();

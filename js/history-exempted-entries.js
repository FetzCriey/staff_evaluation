import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/*
  HISTORY: EXEMPTED STAFF

  Archived History normally contains only staff who have evaluation rows.
  A staff member exempted from that evaluation round has no evaluation rows,
  so this module adds a read-only History entry for them.

  The entry:
  - is NOT clickable;
  - shows "Exempted";
  - shows the recorded exemption reason;
  - appears only on an archived date whose archive timestamp happened while
    that exemption was active;
  - never changes scores/averages or old evaluation records.
*/

const db = createClient(
  "https://giosjwjhalhmwcuyzfos.supabase.co",
  "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_"
);

const list = document.getElementById("hisList");
if(!list) throw new Error("History list not found");

let archiveTimesByDate = new Map();
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

function injectStyles(){
  if(document.getElementById("history-exempted-entry-style")) return;

  const style = document.createElement("style");
  style.id = "history-exempted-entry-style";
  style.textContent = `
    .his-row.his-exempted-row{
      cursor:default !important;
      border-color:#ecd9a6 !important;
      background:linear-gradient(180deg,#fffdf7 0%,#fff8e8 100%) !important;
    }

    .his-exempted-main{
      flex:1 1 auto;
      min-width:0;
      padding:10px 12px;
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
      margin-top:4px;
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
        if(row?.id && row?.full_name) map.set(row.id, row.full_name);
      });
    }
  }catch(_){}

  if(!map.size){
    try{
      const { data, error } = await db
        .from("profiles")
        .select("id,full_name");
      if(!error && Array.isArray(data)){
        data.forEach(row => {
          if(row?.id && row?.full_name) map.set(row.id, row.full_name);
        });
      }
    }catch(_){}
  }

  return map;
}

async function loadData(){
  const [archiveResult, exemptionResult, names] = await Promise.all([
    db
      .from("evaluations")
      .select("archived_at")
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

  const times = new Map();

  (archiveResult.data || []).forEach(row => {
    const stamp = row?.archived_at;
    const key = localDateKey(stamp);
    if(!key || !stamp) return;

    if(!times.has(key)) times.set(key, []);
    times.get(key).push(new Date(stamp).getTime());
  });

  archiveTimesByDate = times;
  exemptionRows = exemptionResult.data || [];
  nameById = names;
}

function exemptionActiveAt(exemption, archiveMs){
  const start = new Date(exemption?.exempted_at).getTime();
  if(!Number.isFinite(start) || archiveMs < start) return false;

  if(!exemption?.restored_at) return true;

  const end = new Date(exemption.restored_at).getTime();
  return !Number.isFinite(end) || archiveMs < end;
}

function exemptionsForDate(dateKey){
  const archiveTimes = archiveTimesByDate.get(dateKey) || [];
  if(!archiveTimes.length) return [];

  const byStaff = new Map();

  exemptionRows.forEach(exemption => {
    const staffId = exemption?.staff_id;
    if(!staffId) return;

    const activeDuringArchive =
      archiveTimes.some(archiveMs => exemptionActiveAt(exemption, archiveMs));

    if(!activeDuringArchive) return;

    /*
      One staff member can have multiple old exemption records. For a single
      archived date show only the latest record that was active at archive time.
    */
    const current = byStaff.get(staffId);
    if(
      !current ||
      new Date(exemption.exempted_at).getTime() >
        new Date(current.exempted_at).getTime()
    ){
      byStaff.set(staffId, exemption);
    }
  });

  return [...byStaff.values()];
}

function makeExemptedRow(exemption){
  const name = nameById.get(exemption.staff_id) || "Staff member";
  const reason = String(exemption.reason || "").trim() ||
    "Exempted from this evaluation round.";

  const row = document.createElement("div");
  row.className = "his-row his-exempted-row";
  row.dataset.historyExemptedStaffId = exemption.staff_id;
  row.setAttribute("aria-label", `${name} — exempted. Reason: ${reason}`);

  const main = document.createElement("div");
  main.className = "his-exempted-main";

  const nameEl = document.createElement("div");
  nameEl.className = "his-nm";
  nameEl.append(document.createTextNode(name + " "));

  const badge = document.createElement("span");
  badge.className = "his-exempted-badge";
  badge.textContent = "No evaluation";
  nameEl.appendChild(badge);

  const reasonEl = document.createElement("div");
  reasonEl.className = "his-exempted-reason";
  reasonEl.textContent = "Reason: " + reason;

  main.append(nameEl, reasonEl);

  const state = document.createElement("div");
  state.className = "his-exempted-state";
  state.textContent = "Exempted";

  row.append(main, state);
  return row;
}

function patchHistory(){
  list.querySelectorAll(".his-date-group").forEach(group => {
    const dateKey = group.dataset.historyDateKey || "";
    const body = group.querySelector(".his-date-body");
    const count = group.querySelector(".his-date-count");
    if(!body || !dateKey) return;

    body.querySelectorAll(".his-exempted-row").forEach(row => row.remove());

    const exemptions = exemptionsForDate(dateKey);

    exemptions.forEach(exemption => {
      body.appendChild(makeExemptedRow(exemption));
    });

    /*
      Keep the original evaluation count accurate, then clearly add the
      exemption count instead of pretending an exempted staff member has an
      evaluation record.
    */
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
    console.warn("Could not add exempted staff to History:", error);
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
  refreshTimer = setTimeout(refresh, 80);
}

injectStyles();

/*
  History is rendered asynchronously by supabase.js. Observe only structural
  changes and patch after rendering has settled.
*/
new MutationObserver(mutations => {
  if(
    mutations.some(m =>
      [...m.addedNodes, ...m.removedNodes].some(node =>
        node?.nodeType === 1 &&
        (
          node.matches?.(".his-date-group,.his-row") ||
          node.querySelector?.(".his-date-group,.his-row")
        )
      )
    )
  ){
    queueRefresh();
  }
}).observe(list, { childList:true, subtree:true });

window.addEventListener("round-exemptions-updated", queueRefresh);

try{
  db.channel("history-exempted-entries")
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

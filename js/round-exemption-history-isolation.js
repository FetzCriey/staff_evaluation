import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/*
  ROUND EXEMPTION / HISTORY ISOLATION

  Current-round exemptions must change only current-round eligibility.
  They must NOT remove a staff identity from the app's name map because
  archived History still needs that identity to display old evaluations.

  The existing round-exemptions module sends a filtered roster to
  window.__syncEvaluationRoster(). This bridge keeps the filtered roster
  for eligibility, while adding currently exempted staff back as
  identity-only entries (has_login:false).

  Result:
  - exempted staff are still excluded from the CURRENT round;
  - previous archived evaluations continue showing their real names;
  - archived evaluator columns remain identifiable;
  - restoring the exemption returns the user to normal current-round
    eligibility without changing old History.
*/

const db = createClient(
  "https://giosjwjhalhmwcuyzfos.supabase.co",
  "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_"
);

let fullRoster = [];
let activeExemptions = new Set();
let lastRows = null;
let wrapped = false;
let refreshTimer = null;

function rowId(row){
  return String(row?.id || "").trim();
}

async function loadFullRoster(){
  try{
    const { data, error } = await db.rpc("get_evaluation_roster");
    if(!error && Array.isArray(data)){
      return data.filter(row => rowId(row));
    }
  }catch(_){}

  try{
    const { data, error } = await db
      .from("profiles")
      .select("id,full_name,position,role,form_role");
    if(!error && Array.isArray(data)){
      return data.filter(row => rowId(row));
    }
  }catch(_){}

  return [];
}

async function loadActiveExemptions(){
  try{
    const { data, error } = await db
      .from("evaluation_round_exemptions")
      .select("staff_id")
      .eq("active", true);

    if(!error && Array.isArray(data)){
      return new Set(
        data
          .map(row => String(row?.staff_id || "").trim())
          .filter(Boolean)
      );
    }
  }catch(_){}

  return new Set();
}

function mergeIdentityOnlyRows(rows){
  const incoming = Array.isArray(rows) ? rows : [];
  const byId = new Map();

  incoming.forEach(row => {
    const id = rowId(row);
    if(id) byId.set(id, row);
  });

  /*
    Only re-add people who are CURRENTLY exempted and were deliberately
    filtered out of the eligibility roster. A genuinely deleted staff member
    is not kept because they will no longer exist in fullRoster.
  */
  fullRoster.forEach(profile => {
    const id = rowId(profile);
    if(
      !id ||
      byId.has(id) ||
      !activeExemptions.has(id)
    ) return;

    byId.set(id, {
      ...profile,
      has_login: false,
      exempted: true,
      __history_identity_only: true
    });
  });

  return [...byId.values()];
}

function reapply(){
  if(!wrapped || !lastRows) return;
  const sync = window.__roundHistoryIsolationOriginalSync;
  if(typeof sync !== "function") return;
  sync(mergeIdentityOnlyRows(lastRows));
}

async function refreshReferences(){
  const [roster, exemptions] = await Promise.all([
    loadFullRoster(),
    loadActiveExemptions()
  ]);

  if(roster.length) fullRoster = roster;
  activeExemptions = exemptions;

  reapply();
}

function queueRefresh(){
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(refreshReferences, 80);
}

function install(){
  if(wrapped) return true;

  const original = window.__syncEvaluationRoster;
  if(typeof original !== "function") return false;

  wrapped = true;
  window.__roundHistoryIsolationOriginalSync = original;

  window.__syncEvaluationRoster = function(rows){
    lastRows = Array.isArray(rows) ? rows : [];
    return original(mergeIdentityOnlyRows(lastRows));
  };

  /*
    The exemption module already emits this event after a change. Refresh the
    active exemption IDs first, then re-run the eligibility sync with identity
    preservation.
  */
  window.addEventListener("round-exemptions-updated", queueRefresh);

  refreshReferences();

  try{
    db.channel("round-exemption-history-isolation")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "evaluation_round_exemptions"
        },
        queueRefresh
      )
      .subscribe();
  }catch(_){}

  return true;
}

/*
  supabase.js contains top-level async work before it exposes
  __syncEvaluationRoster, so wait for it instead of assuming timing.
*/
if(!install()){
  const started = Date.now();
  const wait = setInterval(() => {
    if(install() || Date.now() - started > 15000){
      clearInterval(wait);
    }
  }, 50);
}

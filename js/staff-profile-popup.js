import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://giosjwjhalhmwcuyzfos.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_";
const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const BUCKET = "profile-pictures";
const CACHE_MS = 12000;

let cache = null;
let cacheAt = 0;
let modal = null;
let previousOverflow = "";
let lastFocused = null;

const normalize = value => String(value || "")
  .toLowerCase()
  .replace(/\s+/g, " ")
  .trim();

const mean = values => {
  const clean = values.map(Number).filter(Number.isFinite);
  return clean.length
    ? clean.reduce((sum, value) => sum + value, 0) / clean.length
    : null;
};

const scoreText = value =>
  Number.isFinite(Number(value)) ? Number(value).toFixed(2) : "—";

const initials = name => {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return (
    (parts[0]?.[0] || "") +
    (parts.length > 1 ? parts.at(-1)?.[0] || "" : "")
  ).toUpperCase() || "—";
};

function publicAvatarUrl(path){
  if(!path) return "";
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function buildRounds(rows){
  const grouped = new Map();

  rows
    .filter(row => row.archived && row.archived_at)
    .forEach(row => {
      const key = `${row.employee_id}|${row.archived_at}`;
      if(!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(row);
    });

  return [...grouped.entries()]
    .map(([key, group]) => {
      const split = key.indexOf("|");
      return {
        employee_id:key.slice(0, split),
        archived_at:key.slice(split + 1),
        average:mean(group.map(row => row.average))
      };
    })
    .filter(round => Number.isFinite(round.average));
}

function rankMap(rows, latestOnly=false){
  const byEmployee = new Map();

  rows.forEach(row => {
    if(latestOnly){
      const previous = byEmployee.get(row.employee_id);
      if(
        !previous ||
        new Date(row.archived_at).getTime() >
          new Date(previous.archived_at).getTime()
      ){
        byEmployee.set(row.employee_id, row);
      }
      return;
    }

    if(!byEmployee.has(row.employee_id)){
      byEmployee.set(row.employee_id, []);
    }
    byEmployee.get(row.employee_id).push(row.average);
  });

  const ranked = latestOnly
    ? [...byEmployee.values()].map(row => ({
        employee_id:row.employee_id,
        average:row.average
      }))
    : [...byEmployee.entries()].map(([employee_id, values]) => ({
        employee_id,
        average:mean(values)
      }));

  const ordered = ranked
    .filter(row => Number.isFinite(row.average))
    .sort((a,b) => b.average - a.average);

  return new Map(ordered.map((row, index) => [
    row.employee_id,
    { rank:index + 1, average:row.average }
  ]));
}

async function loadData(force=false){
  if(!force && cache && Date.now() - cacheAt < CACHE_MS){
    return cache;
  }

  const { data:{ session } } = await db.auth.getSession();
  if(!session) throw new Error("No active staff session.");

  const [profilesResult, evaluationsResult, rosterResult] = await Promise.all([
    db.from("profiles")
      .select("id, full_name, position, role, form_role, avatar_path")
      .order("full_name"),
    db.rpc("get_dashboard_evaluations"),
    db.rpc("get_evaluation_roster")
  ]);

  if(profilesResult.error) throw profilesResult.error;
  if(evaluationsResult.error) throw evaluationsResult.error;

  const profiles = profilesResult.data || [];
  const evaluations = evaluationsResult.data || [];
  const roster = (!rosterResult.error && Array.isArray(rosterResult.data))
    ? rosterResult.data
    : profiles.map(profile => ({...profile, has_login:true}));

  const byId = new Map(profiles.map(profile => [profile.id, profile]));
  const byName = new Map();

  profiles.forEach(profile => {
    const key = normalize(profile.full_name);
    if(key && !byName.has(key)) byName.set(key, profile);
  });

  const loginById = new Map(
    roster.map(profile => [profile.id, profile.has_login !== false])
  );

  const rounds = buildRounds(evaluations);
  const latestRanks = rankMap(rounds, true);
  const overallRanks = rankMap(rounds, false);

  cache = {
    profiles,
    evaluations,
    roster,
    byId,
    byName,
    loginById,
    rounds,
    latestRanks,
    overallRanks
  };
  cacheAt = Date.now();

  return cache;
}

function profileStats(profile, data){
  const rounds = data.rounds
    .filter(round => round.employee_id === profile.id)
    .sort((a,b) => new Date(a.archived_at) - new Date(b.archived_at));

  const latest = rounds.at(-1) || null;
  const overall = mean(rounds.map(round => round.average));
  const best = rounds.length
    ? Math.max(...rounds.map(round => Number(round.average)))
    : null;

  const eligibleIds = new Set(
    data.roster
      .filter(person => person.has_login !== false)
      .map(person => person.id)
  );

  const targetHasLogin =
    data.loginById.has(profile.id)
      ? data.loginById.get(profile.id)
      : true;

  const expected = Math.max(
    eligibleIds.size - (targetHasLogin ? 1 : 0),
    0
  );

  const submitted = new Set(
    data.evaluations
      .filter(row =>
        !row.archived &&
        row.locked &&
        row.employee_id === profile.id &&
        eligibleIds.has(row.evaluator_id) &&
        row.evaluator_id !== profile.id
      )
      .map(row => row.evaluator_id)
  ).size;

  const currentPercent = expected
    ? Math.min(100, submitted / expected * 100)
    : 0;

  return {
    rounds,
    latest,
    overall,
    best,
    finalizedRounds:rounds.length,
    latestRank:data.latestRanks.get(profile.id)?.rank || null,
    overallRank:data.overallRanks.get(profile.id)?.rank || null,
    expected,
    submitted,
    currentPercent
  };
}

function ensureModal(){
  if(modal) return modal;

  modal = document.createElement("div");
  modal.className = "staff-profile-modal";
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="staff-profile-backdrop" data-staff-profile-close></div>
    <section class="staff-profile-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="staffProfileTitle">
      <button class="staff-profile-close"
        type="button"
        aria-label="Close profile"
        data-staff-profile-close>×</button>
      <div id="staffProfileContent"></div>
    </section>
  `;

  document.body.appendChild(modal);

  modal.addEventListener("click", event => {
    if(event.target.closest("[data-staff-profile-close]")){
      closeModal();
    }
  });

  document.addEventListener("keydown", event => {
    if(event.key === "Escape" && !modal.hidden){
      closeModal();
    }
  });

  return modal;
}

function closeModal(){
  if(!modal || modal.hidden) return;
  modal.hidden = true;
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = previousOverflow;
  lastFocused?.focus?.({preventScroll:true});
  lastFocused = null;
}

function showLoading(){
  ensureModal();
  modal.querySelector("#staffProfileContent").innerHTML = `
    <div class="staff-profile-loading">
      <div class="staff-profile-loading-inner">
        <div class="staff-profile-spinner" aria-hidden="true"></div>
        Loading staff profile…
      </div>
    </div>
  `;
}

function showError(message){
  ensureModal();
  modal.querySelector("#staffProfileContent").innerHTML = `
    <div class="staff-profile-error">
      <strong>Could not load profile</strong>
      <span></span>
    </div>
  `;
  modal.querySelector(".staff-profile-error span").textContent =
    message || "Please try again.";
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
  modal.querySelector(".staff-profile-close")?.focus({preventScroll:true});
}

function renderProfile(profile, stats){
  const content = modal.querySelector("#staffProfileContent");
  content.innerHTML = `
    <header class="staff-profile-hero">
      <div class="staff-profile-avatar" id="staffProfileAvatar"></div>
      <div class="staff-profile-heading">
        <div class="staff-profile-kicker">Staff profile</div>
        <h2 class="staff-profile-name" id="staffProfileTitle"></h2>
        <div class="staff-profile-position"></div>
        <div class="staff-profile-badges"></div>
      </div>
    </header>

    <div class="staff-profile-body">
      <div class="staff-profile-section-title">Performance statistics</div>

      <div class="staff-profile-stats">
        <div class="staff-profile-stat">
          <span class="staff-profile-stat-label">Latest Score</span>
          <span class="staff-profile-stat-value" data-stat="latest"></span>
        </div>
        <div class="staff-profile-stat">
          <span class="staff-profile-stat-label">Overall Average</span>
          <span class="staff-profile-stat-value" data-stat="overall"></span>
        </div>
        <div class="staff-profile-stat">
          <span class="staff-profile-stat-label">Best Score</span>
          <span class="staff-profile-stat-value" data-stat="best"></span>
        </div>
        <div class="staff-profile-stat">
          <span class="staff-profile-stat-label">Finalized Rounds</span>
          <span class="staff-profile-stat-value" data-stat="rounds"></span>
        </div>
        <div class="staff-profile-stat">
          <span class="staff-profile-stat-label">Latest Rank</span>
          <span class="staff-profile-stat-value" data-stat="latestRank"></span>
        </div>
        <div class="staff-profile-stat">
          <span class="staff-profile-stat-label">Overall Rank</span>
          <span class="staff-profile-stat-value" data-stat="overallRank"></span>
        </div>
      </div>

      <div class="staff-profile-progress-card">
        <div class="staff-profile-progress-head">
          <div class="staff-profile-progress-title">Current evaluation round</div>
          <div class="staff-profile-progress-count"></div>
        </div>
        <div class="staff-profile-progress-track">
          <span></span>
        </div>
        <div class="staff-profile-progress-note"></div>
      </div>

      <div class="staff-profile-history">
        <div class="staff-profile-section-title">Recent finalized rounds</div>
        <div class="staff-profile-history-list"></div>
      </div>
    </div>
  `;

  content.querySelector(".staff-profile-name").textContent =
    profile.full_name || "Unknown staff";
  content.querySelector(".staff-profile-position").textContent =
    profile.position || "Staff member";

  const badges = content.querySelector(".staff-profile-badges");
  const badgeTexts = [
    profile.form_role || null,
    profile.role === "manager" ? "Manager" : null
  ].filter(Boolean);

  badgeTexts.forEach(text => {
    const badge = document.createElement("span");
    badge.className = "staff-profile-badge";
    badge.textContent = text;
    badges.appendChild(badge);
  });

  const avatar = content.querySelector("#staffProfileAvatar");
  avatar.textContent = initials(profile.full_name);

  if(profile.avatar_path){
    const img = document.createElement("img");
    img.alt = `${profile.full_name} profile picture`;
    img.src = publicAvatarUrl(profile.avatar_path) +
      "?v=" + encodeURIComponent(Date.now());
    img.addEventListener("error", () => {
      img.remove();
      avatar.textContent = initials(profile.full_name);
    }, {once:true});
    avatar.textContent = "";
    avatar.appendChild(img);
  }

  const withUnit = value =>
    value === "—"
      ? "—"
      : `${value}<span class="staff-profile-stat-unit">/5</span>`;

  content.querySelector('[data-stat="latest"]').innerHTML =
    withUnit(scoreText(stats.latest?.average));
  content.querySelector('[data-stat="overall"]').innerHTML =
    withUnit(scoreText(stats.overall));
  content.querySelector('[data-stat="best"]').innerHTML =
    withUnit(scoreText(stats.best));

  content.querySelector('[data-stat="rounds"]').textContent =
    String(stats.finalizedRounds);

  content.querySelector('[data-stat="latestRank"]').textContent =
    stats.latestRank ? `#${stats.latestRank}` : "—";

  content.querySelector('[data-stat="overallRank"]').textContent =
    stats.overallRank ? `#${stats.overallRank}` : "—";

  content.querySelector(".staff-profile-progress-count").textContent =
    `${stats.submitted} / ${stats.expected}`;

  content.querySelector(".staff-profile-progress-track > span").style.width =
    `${stats.currentPercent}%`;

  content.querySelector(".staff-profile-progress-note").textContent =
    stats.expected
      ? `${Math.round(stats.currentPercent)}% of expected evaluators have submitted for this staff member.`
      : "No evaluator submissions are expected for this profile.";

  const history = content.querySelector(".staff-profile-history-list");
  const recentRounds = stats.rounds.slice(-5).reverse();

  if(!recentRounds.length){
    const empty = document.createElement("div");
    empty.className = "staff-profile-empty";
    empty.textContent = "No finalized evaluation history yet.";
    history.appendChild(empty);
  }else{
    recentRounds.forEach(round => {
      const row = document.createElement("div");
      row.className = "staff-profile-history-row";

      const date = document.createElement("span");
      date.className = "staff-profile-history-date";
      date.textContent = new Date(round.archived_at).toLocaleDateString(
        undefined,
        {month:"short", day:"numeric", year:"numeric"}
      );

      const bar = document.createElement("span");
      bar.className = "staff-profile-history-bar";
      const fill = document.createElement("span");
      fill.style.width =
        `${Math.max(0, Math.min(100, Number(round.average) / 5 * 100))}%`;
      bar.appendChild(fill);

      const value = document.createElement("span");
      value.className = "staff-profile-history-score";
      value.textContent = scoreText(round.average);

      row.append(date, bar, value);
      history.appendChild(row);
    });
  }
}

async function openProfile(profile){
  if(!profile) return;

  openShell();
  showLoading();

  try{
    const data = await loadData();
    const freshProfile = data.byId.get(profile.id) || profile;
    const stats = profileStats(freshProfile, data);
    renderProfile(freshProfile, stats);
  }catch(error){
    console.info("Staff profile popup unavailable.", error);
    showError(error?.message || "The profile could not be loaded.");
  }
}

function profileFromText(text, data){
  const cleaned = normalize(text);
  if(!cleaned) return null;

  if(data.byName.has(cleaned)){
    return data.byName.get(cleaned);
  }

  // Handles containers whose text also includes a small tag such as "mgr".
  let best = null;
  for(const [name, profile] of data.byName){
    if(cleaned.includes(name) && (!best || name.length > normalize(best.full_name).length)){
      best = profile;
    }
  }
  return best;
}

function nearbyTextCandidates(element){
  const values = [];

  if(element?.textContent) values.push(element.textContent);

  const row = element?.closest?.(
    ".dash-rank-row,.dash-live-eval-row"
  );

  if(row){
    [
      ".dash-rank-name",
      ".dash-live-evaluator",
      ".dash-live-employee"
    ].forEach(selector => {
      const node = row.querySelector(selector);
      if(node?.textContent) values.push(node.textContent);
    });
  }

  return values;
}

// The profile popup is intentionally Dashboard-only. Sidebar Results,
// History, Staff Administration, and the signed-in account area keep their
// normal navigation/management purpose and are never intercepted here.
const explicitSelectors = [
  "#latestTopName",
  "#overallTopName",
  ".dash-rank-name",
  ".dash-rank-avatar",
  ".dash-live-evaluator",
  ".dash-live-employee",
  ".dash-live-avatar"
].join(",");

function profileTrigger(element){
  if(!element || element.nodeType !== Node.ELEMENT_NODE) return null;
  const trigger = element.closest?.(explicitSelectors) || null;
  return trigger?.closest?.("#dashboardView") ? trigger : null;
}

async function resolveTriggerProfile(trigger){
  const data = await loadData();

  for(const text of nearbyTextCandidates(trigger)){
    const profile = profileFromText(text, data);
    if(profile) return profile;
  }

  return null;
}

function decorateTriggers(root=document){
  root.querySelectorAll?.(explicitSelectors).forEach(node => {
    if(!node.closest("#dashboardView")) return;

    node.classList.add("staff-profile-trigger");
    node.setAttribute("role", "button");
    if(!node.hasAttribute("tabindex")) node.tabIndex = 0;
    node.title = node.title || "View staff profile";
  });
}

document.addEventListener("click", event => {
  const trigger = profileTrigger(event.target);
  if(!trigger) return;

  // Only the exact Dashboard name/avatar click opens the profile. For Recent
  // Evaluations, clicking elsewhere on the row keeps the existing Results action.
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  resolveTriggerProfile(trigger)
    .then(profile => {
      if(profile) openProfile(profile);
    })
    .catch(error => {
      console.info("Could not resolve staff profile.", error);
    });
}, true);

document.addEventListener("keydown", event => {
  if(event.key !== "Enter" && event.key !== " ") return;

  const trigger = event.target?.closest?.(".staff-profile-trigger");
  if(!trigger || !trigger.closest("#dashboardView")) return;

  event.preventDefault();
  event.stopPropagation();

  resolveTriggerProfile(trigger)
    .then(profile => {
      if(profile) openProfile(profile);
    })
    .catch(() => {});
}, true);

const triggerObserver = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if(node.nodeType !== Node.ELEMENT_NODE) return;
      if(node.matches?.(explicitSelectors)){
        decorateTriggers(node.parentElement || document);
      }else{
        decorateTriggers(node);
      }
    });
  });
});

triggerObserver.observe(document.documentElement, {
  childList:true,
  subtree:true
});

/*
  Sidebar Results / History access
  --------------------------------
  supabase.js deliberately prevents changing to another evaluatee while a
  partially-completed score is open. That rule should remain for switching
  evaluatees, but it should not block authorized read-only Results/History.

  Its guard calculates "filled" through evalApi.getColumnScores(0). During the
  single Results/History click only, report an empty scoring column so the
  navigation guard treats the action as read-only navigation. The original API
  method is restored immediately after the event dispatch, before later work.

  Draft score changes are already live-saved by supabase.js; this does not alter
  scores, database data, permissions, RLS, or the actual evaluator-switch rule.
*/
function enableSidebarReviewNavigation(){
  document.addEventListener("click", event => {
    const reviewTarget = event.target?.closest?.(
      "#resList .res-row, #hisList .his-main"
    );
    if(!reviewTarget) return;

    const api = window.evalApi;
    if(!api || typeof api.getColumnScores !== "function") return;

    const original = api.getColumnScores;
    let restored = false;

    const temporaryGetColumnScores = function(index){
      if(Number(index) === 0) return {};
      return original.call(this, index);
    };

    const restore = () => {
      if(restored) return;
      restored = true;
      if(api.getColumnScores === temporaryGetColumnScores){
        api.getColumnScores = original;
      }
    };

    api.getColumnScores = temporaryGetColumnScores;
    queueMicrotask(restore);
  }, true);
}

enableSidebarReviewNavigation();



/* =========================================================
   HISTORY CARD FULL CLICK AREA
   The existing .his-main button remains the real History action.
   Taps on the average or unused space inside the same card are
   forwarded to it. The Delete button remains a separate action.
   ========================================================= */
function enableHistoryFullCardClick(){
  const historyList = document.getElementById("hisList");
  if(!historyList || historyList.dataset.fullCardClickReady === "1") return;

  historyList.dataset.fullCardClickReady = "1";

  if(!document.getElementById("history-full-card-click-style")){
    const style = document.createElement("style");
    style.id = "history-full-card-click-style";
    style.textContent = `
      #hisList .his-row{cursor:pointer}
      #hisList .his-row .his-del{cursor:pointer}
    `;
    document.head.appendChild(style);
  }

  historyList.addEventListener("click", event => {
    const row = event.target?.closest?.(".his-row");
    if(!row || !historyList.contains(row)) return;

    // The main History button and Delete already have their own handlers.
    if(event.target.closest(".his-main,.his-del")) return;

    const main = row.querySelector(".his-main");
    if(main && !main.disabled) main.click();
  });
}

enableHistoryFullCardClick();


/* =========================================================
   RELOAD LOCATION PERSISTENCE
   Keep the same Dashboard / Evaluation / Results / History
   location after a normal page reload in the same browser tab.
   No database or authentication data is stored here.
   ========================================================= */
(function installReloadLocationPersistence(){
  const STORAGE_KEY = "bp-staff-evaluation-location-v1";
  const MAX_WAIT_MS = 5500;

  let restoring = true;
  let savedAtLoad = readState();
  let scrollTimer = null;

  function readState(){
    try{
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if(!raw) return null;

      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : null;
    }catch(_){
      return null;
    }
  }

  function writeState(next){
    if(restoring || !next) return;

    try{
      const current = readState() || {};
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...current,
          ...next,
          savedAt:Date.now()
        })
      );
    }catch(_){}
  }

  function clearState(){
    try{
      sessionStorage.removeItem(STORAGE_KEY);
    }catch(_){}
  }

  function textOf(node){
    return String(node?.textContent || "").replace(/\s+/g, " ").trim();
  }

  function formIsVisible(){
    const form = document.getElementById("formView");
    return !!form && !form.classList.contains("hide");
  }

  function dashboardIsVisible(){
    const dash = document.getElementById("dashboardView");
    return !!dash && !dash.classList.contains("hide");
  }

  function historyFingerprint(row){
    return {
      historyName:textOf(row?.querySelector(".his-nm")),
      historyMeta:textOf(row?.querySelector(".his-meta")),
      historyAverage:textOf(row?.querySelector(".his-avg"))
    };
  }

  function historyMatches(row, state){
    if(!row || !state) return false;

    const fp = historyFingerprint(row);

    if(state.historyName && fp.historyName !== state.historyName) return false;
    if(state.historyMeta && fp.historyMeta !== state.historyMeta) return false;
    if(
      state.historyAverage &&
      fp.historyAverage &&
      fp.historyAverage !== state.historyAverage
    ) return false;

    return !!(fp.historyName || fp.historyMeta);
  }

  function syncFromDom(){
    if(restoring) return;

    if(dashboardIsVisible()){
      writeState({
        view:"dashboard",
        mode:null,
        employeeName:null,
        historyName:null,
        historyMeta:null,
        historyAverage:null,
        scrollY:window.scrollY || 0
      });
      return;
    }

    if(!formIsVisible()) return;

    const whoKind = textOf(document.getElementById("whoK"));
    const whoName = textOf(document.getElementById("whoV"));
    const archiveNote = document.getElementById("archNote");
    const archiveVisible =
      !!archiveNote && !archiveNote.classList.contains("hide");

    if(whoKind === "Results for"){
      if(archiveVisible){
        const previous = readState() || {};
        writeState({
          view:"form",
          mode:"history",
          employeeName:whoName || previous.employeeName || null,
          historyName:previous.historyName || whoName || null,
          historyMeta:previous.historyMeta || null,
          historyAverage:previous.historyAverage || null,
          scrollY:window.scrollY || 0
        });
      }else{
        writeState({
          view:"form",
          mode:"results",
          employeeName:whoName || null,
          historyName:null,
          historyMeta:null,
          historyAverage:null,
          scrollY:window.scrollY || 0
        });
      }
      return;
    }

    const employee =
      document.getElementById("empName")?.value?.trim() || "";

    writeState({
      view:"form",
      mode:"mine",
      employeeName:employee || null,
      historyName:null,
      historyMeta:null,
      historyAverage:null,
      scrollY:window.scrollY || 0
    });
  }

  function waitFor(test, timeout=MAX_WAIT_MS, interval=80){
    return new Promise(resolve => {
      const started = Date.now();

      const check = () => {
        let value = null;

        try{
          value = test();
        }catch(_){}

        if(value){
          resolve(value);
          return;
        }

        if(Date.now() - started >= timeout){
          resolve(null);
          return;
        }

        setTimeout(check, interval);
      };

      check();
    });
  }

  async function ensureFormVisible(){
    if(formIsVisible()) return true;

    const button = document.getElementById("drawerEvaluation");
    if(!button) return false;

    const started = Date.now();

    while(Date.now() - started < MAX_WAIT_MS){
      if(formIsVisible()) return true;
      button.click();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return formIsVisible();
  }

  async function restoreMine(state){
    if(!state.employeeName) return;

    const input = await waitFor(() => document.getElementById("empName"));
    if(!input) return;

    input.value = state.employeeName;
    input.dispatchEvent(new Event("change", {bubbles:true}));
  }

  async function restoreResults(state){
    if(!state.employeeName) return;

    const wanted = state.employeeName.toLowerCase();

    const row = await waitFor(() => {
      return [...document.querySelectorAll("#resList .res-row")]
        .find(item =>
          textOf(item.querySelector(".res-nm")).toLowerCase() === wanted
        ) || null;
    });

    row?.click();
  }

  async function restoreHistory(state){
    const row = await waitFor(() => {
      return [...document.querySelectorAll("#hisList .his-row")]
        .find(item => historyMatches(item, state)) || null;
    });

    row?.querySelector(".his-main")?.click();
  }

  async function restoreLocation(){
    const state = savedAtLoad;

    if(!state){
      restoring = false;
      syncFromDom();
      return;
    }

    // Wait until Supabase has authenticated the page and revealed the app.
    await waitFor(() => {
      const wrap = document.getElementById("wrap");
      return wrap && !wrap.classList.contains("hide") ? wrap : null;
    });

    if(state.view === "form"){
      const opened = await ensureFormVisible();

      if(opened){
        if(state.mode === "history"){
          await restoreHistory(state);
        }else if(state.mode === "results"){
          await restoreResults(state);
        }else{
          await restoreMine(state);
        }
      }
    }

    if(Number.isFinite(Number(state.scrollY))){
      setTimeout(() => {
        window.scrollTo({
          top:Math.max(0, Number(state.scrollY)),
          left:0,
          behavior:"auto"
        });
      }, 180);
    }

    restoring = false;
    savedAtLoad = null;

    // Let all app handlers finish changing Results/History/form state first.
    setTimeout(syncFromDom, 220);
  }

  // Record the exact History card before its existing handler opens it.
  document.addEventListener("click", event => {
    if(restoring) return;

    const signOut = event.target?.closest?.("#signOut");
    if(signOut){
      clearState();
      return;
    }

    const historyRow = event.target?.closest?.("#hisList .his-row");
    if(historyRow && !event.target.closest(".his-del")){
      writeState({
        view:"form",
        mode:"history",
        employeeName:textOf(historyRow.querySelector(".his-nm")) || null,
        ...historyFingerprint(historyRow),
        scrollY:window.scrollY || 0
      });
      return;
    }

    const resultsRow = event.target?.closest?.("#resList .res-row");
    if(resultsRow){
      writeState({
        view:"form",
        mode:"results",
        employeeName:textOf(resultsRow.querySelector(".res-nm")) || null,
        historyName:null,
        historyMeta:null,
        historyAverage:null,
        scrollY:window.scrollY || 0
      });
      return;
    }

    // Dashboard / Evaluation navigation is synchronized after the app's own
    // click handlers have changed the visible view.
    if(
      event.target?.closest?.(
        "#drawerDashboard,#drawerEvaluation,#headerActionBtn,#backToDashboard"
      )
    ){
      setTimeout(syncFromDom, 120);
    }
  }, true);

  const empName = document.getElementById("empName");
  empName?.addEventListener("change", () => setTimeout(syncFromDom, 120));
  empName?.addEventListener("blur", () => setTimeout(syncFromDom, 120));

  const watched = [
    document.getElementById("dashboardView"),
    document.getElementById("formView"),
    document.getElementById("whoK"),
    document.getElementById("whoV"),
    document.getElementById("archNote")
  ].filter(Boolean);

  if(watched.length){
    const observer = new MutationObserver(() => {
      if(!restoring) setTimeout(syncFromDom, 60);
    });

    watched.forEach(node => {
      observer.observe(node, {
        attributes:true,
        attributeFilter:["class"],
        childList:true,
        subtree:true,
        characterData:true
      });
    });
  }

  window.addEventListener("scroll", () => {
    if(restoring) return;

    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      writeState({scrollY:window.scrollY || 0});
    }, 180);
  }, {passive:true});

  window.addEventListener("beforeunload", () => {
    if(!restoring) syncFromDom();
  });

  restoreLocation();
})();

window.addEventListener("profile-avatar-updated", () => {
  cacheAt = 0;
});

document.addEventListener("visibilitychange", () => {
  if(document.visibilityState === "visible" && Date.now() - cacheAt > CACHE_MS){
    cacheAt = 0;
  }
});

ensureModal();
decorateTriggers();

// Warm the safe profile/dashboard data without blocking the rest of the app.
loadData()
  .then(() => decorateTriggers())
  .catch(error => console.info("Staff profile data will load on first click.", error));

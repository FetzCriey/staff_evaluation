import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* =========================================================
   DASHBOARD DETAIL ENHANCEMENTS
   1. Team Average card -> finalized team-average graph.
   2. Keep Current Round Progress denominator exemption-aware
      when returning from another browser tab.
   ========================================================= */

const SUPABASE_URL = "https://giosjwjhalhmwcuyzfos.supabase.co";
const SUPABASE_KEY = "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_";
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const CACHE_MS = 9000;

let teamModal = null;
let evaluatorModal = null;
let evaluatorModalLastFocused = null;
let teamCache = null;
let teamCacheAt = 0;
let teamPreviousOverflow = "";
let teamLastFocused = null;
let teamOpening = false;

let mainViewIntent = null;
let mainViewIntentTimer = null;
let mainViewSyncing = false;

let stableProgress = null;
let progressSyncPromise = null;
let progressSyncTimer = null;
let progressObserver = null;

const normalizeNumber = value => {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
};

const mean = values => {
  const clean = values.map(Number).filter(Number.isFinite);
  return clean.length
    ? clean.reduce((sum,value) => sum + value,0) / clean.length
    : null;
};

const scoreText = value =>
  Number.isFinite(Number(value))
    ? Number(value).toFixed(2)
    : "—";

function dateValue(value){
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function localDateKey(value){
  const d = dateValue(value);
  if(!d) return "";

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2,"0"),
    String(d.getDate()).padStart(2,"0")
  ].join("-");
}

function injectStyles(){
  if(document.getElementById("dashboard-detail-enhancement-style")) return;

  const style = document.createElement("style");
  style.id = "dashboard-detail-enhancement-style";
  style.textContent = `
    /* The dashboard refresh can legitimately update these values, but they
       should not pulse/bounce every time the browser tab becomes visible. */
    #completionText.motion-value-change,
    #completionPercent.motion-value-change{
      animation:none !important;
      scale:1 !important;
      translate:0 0 !important;
      opacity:1 !important;
      transform:none !important;
    }

    .dash-metric.team-average-detail-trigger{
      cursor:pointer;
      outline:none;
      transition:
        transform .16s ease,
        border-color .16s ease,
        box-shadow .16s ease;
    }

    .dash-metric.team-average-detail-trigger:hover{
      border-color:#b9ddec;
      box-shadow:0 16px 34px -27px rgba(8,52,76,.48);
      transform:translateY(-1px);
    }

    .dash-metric.team-average-detail-trigger:focus-visible{
      border-color:var(--lagoon,#15ace3);
      box-shadow:0 0 0 4px rgba(21,172,227,.15);
    }

    .team-average-modal[hidden]{
      display:none !important;
    }

    .team-average-modal{
      position:fixed;
      inset:0;
      z-index:100105;
      display:grid;
      place-items:center;
      box-sizing:border-box;
      padding:18px;
    }

    .team-average-backdrop{
      position:absolute;
      inset:0;
      background:rgba(4,24,36,.64);
      backdrop-filter:blur(6px);
      -webkit-backdrop-filter:blur(6px);
    }

    .team-average-dialog{
      position:relative;
      z-index:1;
      width:min(790px,100%);
      max-height:min(88vh,840px);
      overflow-y:auto;
      overflow-x:hidden;
      overscroll-behavior:contain;
      border:1.5px solid var(--line,#c9dfee);
      border-radius:22px;
      background:#fff;
      color:var(--ink,#0a2233);
      box-shadow:0 30px 86px -24px rgba(3,31,48,.58);
    }

    .team-average-modal.team-average-site-loading
      .team-average-dialog{
      width:min(100%,290px);
      max-height:none;
      overflow:visible;
      border:0;
      border-radius:0;
      background:transparent;
      box-shadow:none;
    }

    .team-average-modal.team-average-site-loading
      #teamAverageDetailContent{
      display:flex;
      align-items:center;
      justify-content:center;
    }

    .team-average-modal.team-average-site-loading
      .session-loader{
      width:min(100%,290px);
      margin:0;
    }


    .team-average-head{
      position:relative;
      padding:20px 56px 18px 20px;
      color:#fff;
      background:
        radial-gradient(105% 150% at 100% 0%,rgba(21,172,227,.52),transparent 60%),
        linear-gradient(145deg,#0b536f 0%,#08344c 58%,#051f30 100%);
    }

    .team-average-close{
      position:absolute;
      top:14px;
      right:14px;
      width:38px;
      height:38px;
      display:grid;
      place-items:center;
      border:1px solid rgba(255,255,255,.28);
      border-radius:11px;
      background:rgba(255,255,255,.14);
      color:#fff;
      font:700 21px/1 "Inter",sans-serif;
      cursor:pointer;
    }

    .team-average-kicker{
      color:rgba(213,240,251,.76);
      font-size:8.5px;
      line-height:1.2;
      font-weight:800;
      letter-spacing:.15em;
      text-transform:uppercase;
    }

    .team-average-title{
      margin:4px 0 0;
      color:#fff;
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:24px;
      line-height:1.1;
      font-weight:800;
    }

    .team-average-sub{
      margin-top:6px;
      max-width:58ch;
      color:rgba(229,245,252,.82);
      font-size:10.5px;
      line-height:1.45;
    }

    .team-average-body{
      padding:16px 17px 19px;
    }

    .team-average-stats{
      display:grid;
      grid-template-columns:repeat(4,minmax(0,1fr));
      gap:8px;
    }

    .team-average-stat{
      min-width:0;
      padding:11px;
      border:1.5px solid var(--line,#c9dfee);
      border-radius:13px;
      background:#f9fcfe;
    }

    .team-average-stat-label{
      display:block;
      color:var(--muted,#5b7080);
      font-size:8px;
      line-height:1.25;
      font-weight:800;
      letter-spacing:.045em;
      text-transform:uppercase;
    }

    .team-average-stat-value{
      display:block;
      margin-top:5px;
      color:var(--ink,#0a2233);
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:19px;
      line-height:1;
      font-weight:800;
    }

    .team-average-stat-unit{
      margin-left:2px;
      color:var(--muted,#5b7080);
      font-family:"Inter",sans-serif;
      font-size:8px;
      font-weight:700;
    }

    .team-average-section-head{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
      margin:17px 1px 9px;
    }

    .team-average-section-title{
      color:var(--ink,#0a2233);
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:14px;
      line-height:1.2;
      font-weight:800;
    }

    .team-average-period-count{
      flex:0 0 auto;
      padding:4px 8px;
      border:1px solid #cbe7f3;
      border-radius:999px;
      background:var(--accent-soft,#e2f4fc);
      color:var(--lagoon-deep,#0b7fb0);
      font-size:8px;
      line-height:1.25;
      font-weight:800;
      white-space:nowrap;
    }

    .team-average-chart-shell{
      overflow-x:auto;
      overflow-y:hidden;
      padding:11px 8px 5px;
      border:1.5px solid var(--line,#c9dfee);
      border-radius:15px;
      background:
        linear-gradient(180deg,#fbfeff 0%,#f7fbfd 100%);
      scrollbar-width:thin;
      scrollbar-color:#bfd9e7 transparent;
    }

    .team-average-chart{
      display:block;
      width:100%;
      min-width:620px;
      height:auto;
      user-select:none;
      -webkit-user-select:none;
      -webkit-touch-callout:none;
    }

    .team-average-chart text{
      user-select:none;
      -webkit-user-select:none;
      pointer-events:none;
    }

    .team-average-point{
      cursor:pointer;
      outline:none;
      touch-action:manipulation;
      scale:1 !important;
      translate:0 0 !important;
      transform:none !important;
      animation:none !important;
      transition:none !important;
      transform-origin:center !important;
      transform-box:fill-box !important;
    }

    body.motion-ready .team-average-point:hover,
    body.motion-ready .team-average-point:active,
    body.motion-ready .team-average-point.motion-click{
      scale:1 !important;
      translate:0 0 !important;
      transform:none !important;
      animation:none !important;
    }

    .team-average-point-hit{
      fill:transparent;
      stroke:transparent;
      stroke-width:1;
      pointer-events:all;
      cursor:pointer;
    }

    .team-average-point:focus,
    .team-average-point:focus-visible{
      outline:none !important;
    }

    .team-average-point:focus-visible .team-average-dot{
      stroke:#08344c;
      stroke-width:4;
    }

    .team-average-grid{
      stroke:#dceaf2;
      stroke-width:1;
    }

    .team-average-axis-text{
      fill:#6a7d89;
      font:700 10px "Inter",sans-serif;
    }

    .team-average-area{
      fill:url(#teamAverageAreaFill);
    }

    .team-average-line{
      fill:none;
      stroke:#0b7fb0;
      stroke-width:4;
      stroke-linecap:round;
      stroke-linejoin:round;
    }

    .team-average-dot{
      fill:#15ace3;
      stroke:#fff;
      stroke-width:3;
      cursor:pointer;
      outline:none;
      transition:
        fill .14s ease,
        stroke .14s ease,
        stroke-width .14s ease;
    }

    .team-average-dot:hover{
      fill:#0b7fb0;
    }

    .team-average-dot.selected{
      fill:#08344c;
      stroke:#15ace3;
      stroke-width:4;
    }

    .team-average-value{
      fill:#28455c;
      font:800 11px "Bricolage Grotesque","Inter",sans-serif;
      pointer-events:none;
    }

    .team-evaluator-modal[hidden]{
      display:none !important;
    }

    .team-evaluator-modal{
      position:fixed;
      inset:0;
      z-index:100125;
      display:grid;
      place-items:center;
      box-sizing:border-box;
      padding:18px;
    }

    .team-evaluator-backdrop{
      position:absolute;
      inset:0;
      background:rgba(4,24,36,.48);
      backdrop-filter:blur(3px);
      -webkit-backdrop-filter:blur(3px);
    }

    .team-evaluator-dialog{
      position:relative;
      z-index:1;
      width:min(610px,100%);
      max-height:min(82vh,700px);
      overflow-y:auto;
      overflow-x:hidden;
      overscroll-behavior:contain;
      border:1.5px solid var(--line,#c9dfee);
      border-radius:19px;
      background:#fff;
      box-shadow:0 30px 76px -24px rgba(3,31,48,.62);
    }

    .team-evaluator-popup-head{
      position:relative;
      padding:17px 52px 15px 17px;
      color:#fff;
      background:
        radial-gradient(
          105% 150% at 100% 0%,
          rgba(21,172,227,.46),
          transparent 60%
        ),
        linear-gradient(
          145deg,
          #0b536f 0%,
          #08344c 58%,
          #051f30 100%
        );
    }

    .team-evaluator-popup-close{
      position:absolute;
      top:11px;
      right:11px;
      width:35px;
      height:35px;
      display:grid;
      place-items:center;
      border:1px solid rgba(255,255,255,.28);
      border-radius:10px;
      background:rgba(255,255,255,.14);
      color:#fff;
      font:700 20px/1 "Inter",sans-serif;
      cursor:pointer;
    }

    .team-evaluator-popup-kicker{
      color:rgba(213,240,251,.76);
      font-size:8px;
      line-height:1.2;
      font-weight:800;
      letter-spacing:.14em;
      text-transform:uppercase;
    }

    .team-evaluator-popup-title{
      margin:4px 0 0;
      color:#fff;
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:20px;
      line-height:1.15;
      font-weight:800;
    }

    .team-evaluator-popup-date{
      margin-top:5px;
      color:rgba(229,245,252,.84);
      font-size:9.5px;
      line-height:1.4;
    }

    .team-evaluator-popup-body{
      padding:13px 14px 15px;
    }

    .team-evaluator-popup-summary{
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:7px;
      margin-bottom:12px;
    }

    .team-evaluator-popup-stat{
      min-width:0;
      padding:9px 10px;
      border:1px solid #d5e8f2;
      border-radius:11px;
      background:#f9fcfe;
    }

    .team-evaluator-popup-stat span{
      display:block;
      color:var(--muted,#5b7080);
      font-size:7.5px;
      line-height:1.2;
      font-weight:800;
      letter-spacing:.045em;
      text-transform:uppercase;
    }

    .team-evaluator-popup-stat strong{
      display:block;
      margin-top:4px;
      color:var(--ink,#0a2233);
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:16px;
      line-height:1;
      font-weight:800;
    }

    .team-average-evaluator-section{
      margin-top:12px;
    }

    .team-average-evaluator-head{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
      margin:0 1px 8px;
    }

    .team-average-evaluator-title{
      color:var(--ink,#0a2233);
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:13px;
      line-height:1.2;
      font-weight:800;
    }

    .team-average-evaluator-count{
      flex:0 0 auto;
      padding:4px 8px;
      border:1px solid #cbe7f3;
      border-radius:999px;
      background:#eef9fd;
      color:var(--lagoon-deep,#0b7fb0);
      font-size:8px;
      line-height:1.2;
      font-weight:800;
    }

    .team-average-evaluator-list{
      display:grid;
      grid-template-columns:repeat(2,minmax(0,1fr));
      gap:8px;
    }

    .team-average-evaluator-card{
      min-width:0;
      padding:10px 11px;
      border:1.5px solid #d5e8f2;
      border-radius:12px;
      background:#fff;
    }

    .team-average-evaluator-card.exempted{
      border-color:#ead9ab;
      background:linear-gradient(180deg,#fffdf7 0%,#fff8e8 100%);
    }

    .team-average-evaluator-exempted-pill{
      flex:0 0 auto;
      padding:4px 7px;
      border:1px solid #e5cf91;
      border-radius:999px;
      background:#fff1c9;
      color:#7e601f;
      font-size:8px;
      line-height:1.2;
      font-weight:800;
      white-space:nowrap;
    }

    .team-average-evaluator-reason{
      margin-top:8px;
      padding:7px 8px;
      border:1px solid #eadfbd;
      border-radius:9px;
      background:rgba(255,255,255,.75);
      color:#715d34;
      font-size:8.7px;
      line-height:1.4;
      overflow-wrap:anywhere;
    }

    .team-average-evaluator-reason strong{
      color:#765a20;
      font-weight:800;
    }

    .team-average-evaluator-top{
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      gap:10px;
    }

    .team-average-evaluator-copy{
      min-width:0;
    }

    .team-average-evaluator-name{
      display:block;
      color:var(--ink,#0a2233);
      font-size:10.5px;
      line-height:1.3;
      font-weight:800;
      overflow-wrap:anywhere;
    }

    .team-average-evaluator-meta{
      display:block;
      margin-top:2px;
      color:var(--muted,#5b7080);
      font-size:8.5px;
      line-height:1.3;
    }

    .team-average-evaluator-score{
      flex:0 0 auto;
      color:var(--ink,#0a2233);
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:16px;
      line-height:1;
      font-weight:800;
      white-space:nowrap;
    }

    .team-average-evaluator-bar{
      height:5px;
      margin-top:8px;
      overflow:hidden;
      border-radius:999px;
      background:#e6f0f5;
    }

    .team-average-evaluator-bar span{
      display:block;
      height:100%;
      border-radius:inherit;
      background:linear-gradient(
        90deg,
        var(--lagoon,#15ace3),
        var(--lagoon-deep,#0b7fb0)
      );
    }

    .team-average-evaluator-empty{
      grid-column:1 / -1;
      padding:13px;
      border:1.5px dashed #c9dfee;
      border-radius:12px;
      background:#f9fcfe;
      color:var(--muted,#5b7080);
      text-align:center;
      font-size:9.5px;
      line-height:1.4;
    }

    .team-average-empty,
    .team-average-loading,
    .team-average-error{
      padding:28px 16px;
      border:1.5px solid var(--line,#c9dfee);
      border-radius:14px;
      background:#f9fcfe;
      color:var(--muted,#5b7080);
      text-align:center;
      font-size:10.5px;
      line-height:1.45;
    }

    .team-average-loading::before{
      content:"";
      display:inline-block;
      width:14px;
      height:14px;
      margin-right:7px;
      vertical-align:-3px;
      border:2px solid #d6e8f1;
      border-top-color:var(--lagoon,#15ace3);
      border-radius:50%;
      animation:teamAverageSpin .7s linear infinite;
    }

    @keyframes teamAverageSpin{
      to{transform:rotate(360deg)}
    }

    @media(max-width:600px){
      .team-average-modal{
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

      .team-average-dialog{
        box-sizing:border-box;
        width:100%;
        max-width:100%;
        min-width:0;
        max-height:100%;
        -webkit-overflow-scrolling:touch;
        border-radius:16px;
      }

      .team-average-modal.team-average-site-loading
        .team-average-dialog{
        width:min(100%,260px);
        max-width:260px;
        max-height:none;
        overflow:visible;
        border-radius:0;
      }


      .team-average-head{
        padding:16px 48px 14px 14px;
      }

      .team-average-close{
        top:10px;
        right:10px;
        width:35px;
        height:35px;
      }

      .team-average-title{
        font-size:20px;
      }

      .team-average-body{
        padding:12px;
      }

      .team-average-stats{
        grid-template-columns:repeat(2,minmax(0,1fr));
      }

      .team-average-chart-shell{
        padding:8px 5px 3px;
      }

      .team-average-chart{
        min-width:560px;
      }

      .team-average-evaluator-list{
        grid-template-columns:1fr;
      }

      .team-evaluator-modal{
        width:100vw;
        height:100vh;
        height:100dvh;
        min-height:0;
        padding:9px;
        padding-top:max(9px,env(safe-area-inset-top));
        padding-right:max(9px,env(safe-area-inset-right));
        padding-bottom:max(9px,env(safe-area-inset-bottom));
        padding-left:max(9px,env(safe-area-inset-left));
        overflow:hidden;
      }

      .team-evaluator-dialog{
        box-sizing:border-box;
        width:100%;
        max-width:100%;
        min-width:0;
        max-height:100%;
        -webkit-overflow-scrolling:touch;
        border-radius:16px;
      }

      .team-evaluator-popup-head{
        padding:15px 46px 13px 14px;
      }

      .team-evaluator-popup-title{
        font-size:18px;
      }

      .team-evaluator-popup-body{
        padding:11px;
      }

      .team-evaluator-popup-summary{
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:5px;
      }

      .team-evaluator-popup-stat{
        padding:8px 7px;
      }

      .team-evaluator-popup-stat strong{
        font-size:14px;
      }
    }

    @media(max-width:350px){
      .team-average-stat{
        padding:9px;
      }

      .team-average-chart{
        min-width:520px;
      }
    }

    @media(prefers-reduced-motion:reduce){
      .dash-metric.team-average-detail-trigger{
        transition:none;
      }

      .team-average-loading::before{
        animation:none;
      }

      .team-average-dot{
        transition:none;
      }
    }
  `;

  document.head.appendChild(style);
}

/* =========================================================
   TEAM AVERAGE GRAPH
   ========================================================= */

function teamAverageCard(){
  return document.getElementById("teamAverage")?.closest(".dash-metric") || null;
}

function decorateTeamAverageCard(){
  const card = teamAverageCard();
  if(!card || card.dataset.teamAverageDetailReady === "1") return;

  card.dataset.teamAverageDetailReady = "1";
  card.classList.add("team-average-detail-trigger");
  card.setAttribute("role","button");
  card.setAttribute("tabindex","0");
  card.setAttribute("aria-haspopup","dialog");
  card.setAttribute(
    "aria-label",
    "Team Average. Open finalized team-average graph."
  );
  card.title = "View team average graph";

}

function ensureTeamModal(){
  if(teamModal) return teamModal;

  teamModal = document.createElement("div");
  teamModal.className = "team-average-modal";
  teamModal.hidden = true;
  teamModal.setAttribute("aria-hidden","true");

  teamModal.innerHTML = `
    <div class="team-average-backdrop" data-team-average-close></div>
    <section class="team-average-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="teamAverageDetailTitle">
      <div id="teamAverageDetailContent"></div>
    </section>
  `;

  teamModal.addEventListener("click",event => {
    if(event.target.closest("[data-team-average-close]")){
      closeTeamModal();
    }
  });

  document.body.appendChild(teamModal);
  return teamModal;
}

function openTeamShell(){
  ensureTeamModal();

  if(teamModal.hidden){
    teamLastFocused = document.activeElement;
    teamPreviousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    teamModal.hidden = false;
    teamModal.setAttribute("aria-hidden","false");
  }
}

function closeTeamModal(){
  if(!teamModal || teamModal.hidden) return;

  closeEvaluatorModal();
  teamModal.classList.remove("team-average-site-loading");

  teamModal.hidden = true;
  teamModal.setAttribute("aria-hidden","true");
  document.body.style.overflow = teamPreviousOverflow;
  teamLastFocused?.focus?.({preventScroll:true});
  teamLastFocused = null;
}

function showTeamLoading(){
  openTeamShell();

  teamModal.classList.add("team-average-site-loading");

  teamModal.querySelector("#teamAverageDetailContent").innerHTML = `
    <div class="session-loader"
      role="status"
      aria-live="polite"
      aria-label="Loading">
      <div class="session-loader-mark" aria-hidden="true">
        <span class="session-loader-ring"></span>
        <span class="session-loader-core"></span>
      </div>
      <div class="session-loader-copy">
        <div class="session-loader-title">Loading</div>
        <div class="session-loader-dots" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
      </div>
    </div>
  `;
}

function showTeamError(message){
  openTeamShell();
  teamModal.classList.remove("team-average-site-loading");

  teamModal.querySelector("#teamAverageDetailContent").innerHTML = `
    <div class="team-average-error"></div>
  `;
  teamModal.querySelector(".team-average-error").textContent =
    message || "Could not load the team-average graph.";
}

async function loadTeamData(force=false){
  if(!force && teamCache && Date.now() - teamCacheAt < CACHE_MS){
    return teamCache;
  }

  const [
    profilesResult,
    evaluationsResult,
    exemptionsResult,
    historyMetaResult
  ] = await Promise.all([
    db.from("profiles")
      .select("id,full_name")
      .order("full_name"),
    db.rpc("get_dashboard_evaluations"),
    db.from("evaluation_round_exemptions")
      .select("staff_id,reason,active,exempted_at,restored_at")
      .order("exempted_at",{ascending:true}),
    db.from("evaluations")
      .select("archived_at,manager_summary")
      .eq("archived",true)
      .not("manager_summary","is",null)
  ]);

  if(profilesResult.error) throw profilesResult.error;
  if(evaluationsResult.error) throw evaluationsResult.error;

  teamCache = {
    profiles:profilesResult.data || [],
    evaluations:evaluationsResult.data || [],
    exemptions:exemptionsResult.error
      ? []
      : (exemptionsResult.data || []),
    historyMetadata:historyMetaResult.error
      ? []
      : (historyMetaResult.data || [])
  };
  teamCacheAt = Date.now();
  return teamCache;
}

function buildEmployeeRounds(rows){
  const grouped = new Map();

  rows
    .filter(row => row.archived && row.archived_at)
    .forEach(row => {
      const key = `${row.employee_id}|${row.archived_at}`;
      if(!grouped.has(key)) grouped.set(key,[]);
      grouped.get(key).push(row);
    });

  return [...grouped.entries()]
    .map(([key,group]) => {
      const split = key.indexOf("|");
      return {
        employee_id:key.slice(0,split),
        archived_at:key.slice(split + 1),
        average:mean(group.map(row => row.average)),
        evaluatorCount:new Set(
          group.map(row => row.evaluator_id).filter(Boolean)
        ).size
      };
    })
    .filter(round => Number.isFinite(round.average));
}

function buildTeamPeriods(employeeRounds){
  const byDate = new Map();

  employeeRounds.forEach(round => {
    const key = localDateKey(round.archived_at);
    if(!key) return;

    if(!byDate.has(key)) byDate.set(key,[]);
    byDate.get(key).push(round);
  });

  return [...byDate.entries()]
    .sort((a,b) => a[0].localeCompare(b[0]))
    .map(([key,rounds]) => {
      const archivedTimes = rounds
        .map(round => round.archived_at)
        .sort((a,b) => new Date(a) - new Date(b));

      return {
      key,
      archived_at:archivedTimes[0],
      archived_end:archivedTimes.at(-1),
      average:mean(rounds.map(round => round.average)),
      staffCount:new Set(rounds.map(round => round.employee_id)).size,
      evaluatorSubmissions:rounds.reduce(
        (sum,round) => sum + (Number(round.evaluatorCount) || 0),
        0
      )
      };
    })
    .filter(period => Number.isFinite(period.average));
}

function overallTeamAverage(employeeRounds){
  const byEmployee = new Map();

  employeeRounds.forEach(round => {
    if(!byEmployee.has(round.employee_id)){
      byEmployee.set(round.employee_id,[]);
    }
    byEmployee.get(round.employee_id).push(round.average);
  });

  return mean(
    [...byEmployee.values()].map(values => mean(values))
  );
}

function periodDateLabel(value,short=false){
  const d = dateValue(value);
  if(!d) return "Unknown date";

  return d.toLocaleDateString(
    undefined,
    short
      ? {month:"short",year:"2-digit"}
      : {weekday:"short",month:"long",day:"numeric",year:"numeric"}
  );
}

function buildPeriodExemptions(data,period){
  const profiles = data.profiles || [];
  const profileByName = new Map(
    profiles.map(profile => [
      String(profile.full_name || "").trim().toLowerCase(),
      profile
    ])
  );
  const profileById = new Map(
    profiles
      .filter(profile => profile?.id)
      .map(profile => [profile.id,profile])
  );

  const found = new Map();
  const add = ({staff_id=null,name="",reason=""}) => {
    const cleanName = String(name || "").trim();
    const profile = staff_id
      ? profileById.get(staff_id)
      : profileByName.get(cleanName.toLowerCase());
    const finalName = cleanName || profile?.full_name || "Unknown staff";
    const key = staff_id || profile?.id || finalName.toLowerCase();

    if(!key || found.has(key)) return;

    found.set(key,{
      staff_id:staff_id || profile?.id || null,
      name:finalName,
      reason:String(reason || "Exempted from this finalized period.").trim()
    });
  };

  // Historical demo rounds carry an explicit marker because the exempted
  // staff member correctly has no evaluation row in that finalized period.
  const summaries = new Set(
    (data.historyMetadata || [])
      .filter(row =>
        row.archived_at &&
        localDateKey(row.archived_at) === period.key &&
        row.manager_summary
      )
      .map(row => String(row.manager_summary))
  );

  summaries.forEach(summary => {
    const marker = /\[HISTORICAL_EXEMPTION\]\s*(.+?)\s+[—-]\s+(.+?)(?=\.?\s+Historical simulation data|$)/gi;
    for(const match of summary.matchAll(marker)){
      add({name:match[1],reason:match[2]});
    }
  });

  // Real exemption audit rows are also used when the exemption window
  // overlaps the finalized period. This is intentionally best-effort so
  // users without permission to read the audit table still see the graph.
  const periodStart = new Date(period.archived_at).getTime();
  const periodEnd = new Date(period.archived_end || period.archived_at).getTime();

  (data.exemptions || []).forEach(record => {
    const exemptedAt = new Date(record.exempted_at).getTime();
    const restoredAt = record.restored_at
      ? new Date(record.restored_at).getTime()
      : Number.POSITIVE_INFINITY;

    if(
      Number.isFinite(exemptedAt) &&
      exemptedAt <= periodEnd &&
      restoredAt >= periodStart
    ){
      add({
        staff_id:record.staff_id,
        reason:record.reason
      });
    }
  });

  return [...found.values()].sort(
    (a,b) => a.name.localeCompare(b.name)
  );
}

function buildEvaluatorAverages(rows,periodKey,profiles){
  const names = new Map(
    (profiles || [])
      .filter(profile => profile?.id)
      .map(profile => [
        profile.id,
        String(profile.full_name || "Unknown evaluator")
      ])
  );

  const grouped = new Map();

  rows
    .filter(row =>
      row.archived &&
      row.archived_at &&
      localDateKey(row.archived_at) === periodKey &&
      row.evaluator_id &&
      Number.isFinite(Number(row.average))
    )
    .forEach(row => {
      if(!grouped.has(row.evaluator_id)){
        grouped.set(row.evaluator_id,[]);
      }

      grouped.get(row.evaluator_id).push({
        average:Number(row.average),
        employee_id:row.employee_id
      });
    });

  return [...grouped.entries()]
    .map(([evaluator_id,items]) => ({
      evaluator_id,
      name:names.get(evaluator_id) || "Unknown evaluator",
      average:mean(items.map(item => item.average)),
      employeeCount:new Set(
        items.map(item => item.employee_id).filter(Boolean)
      ).size
    }))
    .filter(item => Number.isFinite(item.average))
    .sort(
      (a,b) =>
        b.average - a.average ||
        a.name.localeCompare(b.name)
    );
}

function renderEvaluatorAverages(host,items,exemptions=[]){
  if(!host) return;

  const count = host.querySelector(".team-average-evaluator-count");
  const list = host.querySelector(".team-average-evaluator-list");

  if(count){
    const activeText =
      `${items.length} evaluator${items.length === 1 ? "" : "s"}`;
    const exemptedText = exemptions.length
      ? ` · ${exemptions.length} exempted`
      : "";

    count.textContent = activeText + exemptedText;
  }

  if(!list) return;

  list.innerHTML = "";

  if(!items.length && !exemptions.length){
    list.innerHTML = `
      <div class="team-average-evaluator-empty">
        No evaluator-level averages are available for this period.
      </div>
    `;
    return;
  }

  items.forEach(item => {
    const card = document.createElement("article");
    card.className = "team-average-evaluator-card";

    card.innerHTML = `
      <div class="team-average-evaluator-top">
        <div class="team-average-evaluator-copy">
          <span class="team-average-evaluator-name"></span>
          <span class="team-average-evaluator-meta"></span>
        </div>
        <div class="team-average-evaluator-score"></div>
      </div>
      <div class="team-average-evaluator-bar"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="5"
        aria-valuenow="${Number(item.average).toFixed(2)}">
        <span></span>
      </div>
    `;

    card.querySelector(".team-average-evaluator-name").textContent =
      item.name;

    card.querySelector(".team-average-evaluator-meta").textContent =
      `${item.employeeCount} staff member${
        item.employeeCount === 1 ? "" : "s"
      } evaluated`;

    card.querySelector(".team-average-evaluator-score").textContent =
      `${scoreText(item.average)} / 5`;

    card.querySelector(".team-average-evaluator-bar span").style.width =
      `${
        Math.max(
          0,
          Math.min(100,Number(item.average) / 5 * 100)
        )
      }%`;

    list.appendChild(card);
  });

  exemptions.forEach(item => {
    const card = document.createElement("article");
    card.className = "team-average-evaluator-card exempted";

    card.innerHTML = `
      <div class="team-average-evaluator-top">
        <div class="team-average-evaluator-copy">
          <span class="team-average-evaluator-name"></span>
          <span class="team-average-evaluator-meta">
            Exempted from this finalized period
          </span>
        </div>
        <span class="team-average-evaluator-exempted-pill">Exempted</span>
      </div>
      <div class="team-average-evaluator-reason">
        <strong>Cause:</strong> <span></span>
      </div>
    `;

    card.querySelector(".team-average-evaluator-name").textContent =
      item.name;
    card.querySelector(".team-average-evaluator-reason span").textContent =
      item.reason;

    list.appendChild(card);
  });
}

function ensureEvaluatorModal(){
  if(evaluatorModal) return evaluatorModal;

  evaluatorModal = document.createElement("div");
  evaluatorModal.className = "team-evaluator-modal";
  evaluatorModal.hidden = true;
  evaluatorModal.setAttribute("aria-hidden","true");

  evaluatorModal.innerHTML = `
    <div class="team-evaluator-backdrop"
      data-team-evaluator-close></div>
    <section class="team-evaluator-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="teamEvaluatorPopupTitle">
      <header class="team-evaluator-popup-head">
        <button class="team-evaluator-popup-close"
          type="button"
          aria-label="Close evaluator averages"
          data-team-evaluator-close>×</button>
        <div class="team-evaluator-popup-kicker">
          Selected finalized period
        </div>
        <h3 class="team-evaluator-popup-title"
          id="teamEvaluatorPopupTitle">
          Evaluator averages
        </h3>
        <div class="team-evaluator-popup-date"></div>
      </header>

      <div class="team-evaluator-popup-body">
        <div class="team-evaluator-popup-summary">
          <div class="team-evaluator-popup-stat">
            <span>Team average</span>
            <strong data-evaluator-popup-stat="average">—</strong>
          </div>
          <div class="team-evaluator-popup-stat">
            <span>Staff finalized</span>
            <strong data-evaluator-popup-stat="staff">—</strong>
          </div>
          <div class="team-evaluator-popup-stat">
            <span>Evaluators</span>
            <strong data-evaluator-popup-stat="evaluators">—</strong>
          </div>
        </div>

        <section class="team-average-evaluator-section">
          <div class="team-average-evaluator-head">
            <div class="team-average-evaluator-title">
              Individual evaluator averages
            </div>
            <div class="team-average-evaluator-count">
              0 evaluators
            </div>
          </div>
          <div class="team-average-evaluator-list"></div>
        </section>
      </div>
    </section>
  `;

  evaluatorModal.addEventListener("click",event => {
    if(event.target.closest("[data-team-evaluator-close]")){
      closeEvaluatorModal();
    }
  });

  document.body.appendChild(evaluatorModal);
  return evaluatorModal;
}

function closeEvaluatorModal(){
  if(!evaluatorModal || evaluatorModal.hidden) return;

  evaluatorModal.hidden = true;
  evaluatorModal.setAttribute("aria-hidden","true");

  evaluatorModalLastFocused?.focus?.({
    preventScroll:true
  });
  evaluatorModalLastFocused = null;
}

function openEvaluatorModal(period,items,exemptions,trigger){
  const popup = ensureEvaluatorModal();

  evaluatorModalLastFocused =
    trigger || document.activeElement;

  popup.querySelector(".team-evaluator-popup-date").textContent =
    periodDateLabel(period.archived_at);

  popup.querySelector(
    '[data-evaluator-popup-stat="average"]'
  ).textContent =
    `${scoreText(period.average)} / 5`;

  popup.querySelector(
    '[data-evaluator-popup-stat="staff"]'
  ).textContent =
    String(period.staffCount);

  popup.querySelector(
    '[data-evaluator-popup-stat="evaluators"]'
  ).textContent =
    String(items.length);

  renderEvaluatorAverages(
    popup.querySelector(".team-average-evaluator-section"),
    items,
    exemptions
  );

  popup.hidden = false;
  popup.setAttribute("aria-hidden","false");

  requestAnimationFrame(() => {
    popup
      .querySelector(".team-evaluator-popup-close")
      ?.focus({preventScroll:true});
  });
}

function renderTeamGraph(data){
  teamModal?.classList.remove("team-average-site-loading");

  const employeeRounds = buildEmployeeRounds(data.evaluations);
  const periods = buildTeamPeriods(employeeRounds);
  const overall = overallTeamAverage(employeeRounds);
  const latest = periods.at(-1) || null;

  const best = periods.length
    ? periods.reduce((a,b) => a.average >= b.average ? a : b)
    : null;

  const lowest = periods.length
    ? periods.reduce((a,b) => a.average <= b.average ? a : b)
    : null;

  const content = teamModal.querySelector("#teamAverageDetailContent");

  content.innerHTML = `
    <header class="team-average-head">
      <button class="team-average-close"
        type="button"
        aria-label="Close team average details"
        data-team-average-close>×</button>

      <div class="team-average-kicker">Finalized evaluation performance</div>
      <h2 class="team-average-title" id="teamAverageDetailTitle">
        Team Average
      </h2>
      <div class="team-average-sub">
        Track how the team's finalized average changed across evaluation periods.
        Each point gives equal weight to each staff member finalized in that period.
      </div>
    </header>

    <div class="team-average-body">
      <div class="team-average-stats">
        <div class="team-average-stat">
          <span class="team-average-stat-label">Overall team average</span>
          <span class="team-average-stat-value" data-team-stat="overall"></span>
        </div>

        <div class="team-average-stat">
          <span class="team-average-stat-label">Latest period</span>
          <span class="team-average-stat-value" data-team-stat="latest"></span>
        </div>

        <div class="team-average-stat">
          <span class="team-average-stat-label">Highest period</span>
          <span class="team-average-stat-value" data-team-stat="best"></span>
        </div>

        <div class="team-average-stat">
          <span class="team-average-stat-label">Finalized periods</span>
          <span class="team-average-stat-value" data-team-stat="periods"></span>
        </div>
      </div>

      <div class="team-average-section-head">
        <div class="team-average-section-title">
          Finalized team-average trend
        </div>
        <div class="team-average-period-count"></div>
      </div>

      <div id="teamAverageGraphHost"></div>
    </div>
  `;

  const scoreUnit = value =>
    value === "—"
      ? "—"
      : `${value}<span class="team-average-stat-unit">/5</span>`;

  content.querySelector('[data-team-stat="overall"]').innerHTML =
    scoreUnit(scoreText(overall));

  content.querySelector('[data-team-stat="latest"]').innerHTML =
    scoreUnit(scoreText(latest?.average));

  content.querySelector('[data-team-stat="best"]').innerHTML =
    scoreUnit(scoreText(best?.average));

  content.querySelector('[data-team-stat="periods"]').textContent =
    String(periods.length);

  content.querySelector(".team-average-period-count").textContent =
    `${periods.length} finalized ${periods.length === 1 ? "period" : "periods"}`;

  const host = content.querySelector("#teamAverageGraphHost");

  if(!periods.length){
    host.innerHTML = `
      <div class="team-average-empty">
        No finalized team-average history is available yet.
      </div>
    `;
    content.querySelector(".team-average-close")?.focus({preventScroll:true});
    return;
  }

  const W = Math.max(620, periods.length * 105);
  const H = 285;
  const L = 45;
  const R = 22;
  const T = 28;
  const B = 48;
  const plotW = W - L - R;
  const plotH = H - T - B;

  const x = index =>
    periods.length === 1
      ? L + plotW / 2
      : L + index * (plotW / (periods.length - 1));

  const y = value =>
    T + (5 - Math.max(1,Math.min(5,value))) / 4 * plotH;

  const coords = periods.map((period,index) => [
    x(index),
    y(period.average)
  ]);

  const line = coords
    .map((point,index) =>
      `${index ? "L" : "M"} ${point[0]} ${point[1]}`
    )
    .join(" ");

  const area =
    `M ${coords[0][0]} ${H-B} ` +
    coords.map(point => `L ${point[0]} ${point[1]}`).join(" ") +
    ` L ${coords.at(-1)[0]} ${H-B} Z`;

  const graph = document.createElement("div");
  graph.innerHTML = `
    <div class="team-average-chart-shell">
      <svg class="team-average-chart"
        viewBox="0 0 ${W} ${H}"
        role="img"
        aria-label="Finalized team average trend">
        <defs>
          <linearGradient id="teamAverageAreaFill"
            x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#15ace3" stop-opacity=".24"></stop>
            <stop offset="100%" stop-color="#15ace3" stop-opacity=".025"></stop>
          </linearGradient>
        </defs>

        ${[1,2,3,4,5].map(value => {
          const yy = y(value);
          return `
            <line class="team-average-grid"
              x1="${L}" y1="${yy}"
              x2="${W-R}" y2="${yy}"></line>
            <text class="team-average-axis-text"
              x="13" y="${yy+3}">${value}</text>
          `;
        }).join("")}

        <path class="team-average-area" d="${area}"></path>
        <path class="team-average-line" d="${line}"></path>

        ${periods.map((period,index) => {
          const [xx,yy] = coords[index];
          return `
            <g class="team-average-point"
              data-team-period-index="${index}"
              tabindex="0"
              role="button"
              aria-pressed="${index === periods.length - 1 ? "true" : "false"}"
              aria-label="${periodDateLabel(period.archived_at)} team average ${scoreText(period.average)} out of 5">

              <!-- Large invisible target: 48px diameter around the point. -->
              <circle class="team-average-point-hit"
                cx="${xx}" cy="${yy}" r="24"></circle>

              <circle class="team-average-dot${index === periods.length - 1 ? " selected" : ""}"
                cx="${xx}" cy="${yy}" r="6">
                <title>${periodDateLabel(period.archived_at)} · ${scoreText(period.average)} / 5</title>
              </circle>

              <text class="team-average-value"
                x="${xx}" y="${yy-13}"
                text-anchor="middle">
                ${scoreText(period.average)}
              </text>

              <text class="team-average-axis-text"
                x="${xx}" y="${H-17}"
                text-anchor="middle">
                ${periodDateLabel(period.archived_at,true)}
              </text>
            </g>
          `;
        }).join("")}
      </svg>
    </div>

  `;

  host.appendChild(graph);

  const selectPeriod = (
    index,
    {showEvaluatorPopup=false,trigger=null}={}
  ) => {
    const period = periods[index];
    if(!period) return;

    host.querySelectorAll(".team-average-point").forEach(point => {
      const selected =
        Number(point.dataset.teamPeriodIndex) === index;

      point.setAttribute(
        "aria-pressed",
        selected ? "true" : "false"
      );

      point
        .querySelector(".team-average-dot")
        ?.classList.toggle("selected",selected);
    });

    if(showEvaluatorPopup){
      const evaluatorItems = buildEvaluatorAverages(
        data.evaluations,
        period.key,
        data.profiles
      );
      const exemptionItems = buildPeriodExemptions(
        data,
        period
      );

      openEvaluatorModal(
        period,
        evaluatorItems,
        exemptionItems,
        trigger
      );
    }
  };

  host.querySelectorAll(".team-average-point").forEach(point => {
    const activate = () =>
      selectPeriod(
        Number(point.dataset.teamPeriodIndex),
        {
          showEvaluatorPopup:true,
          trigger:point
        }
      );

    // Prevent browser text-drag selection before the click is dispatched.
    point.addEventListener("pointerdown",event => {
      if(event.pointerType === "mouse"){
        event.preventDefault();
      }
    });

    point.addEventListener("click",event => {
      event.preventDefault();
      event.stopPropagation();
      activate();
    });

    point.addEventListener("keydown",event => {
      if(event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      event.stopPropagation();
      activate();
    });
  });

  // Select the newest point for context, but do not open the child popup
  // until the user explicitly chooses a graph point.
  selectPeriod(periods.length - 1);

  content.querySelector(".team-average-close")?.focus({preventScroll:true});
}

async function openTeamAverageDetails(){
  if(teamOpening) return;

  teamOpening = true;
  showTeamLoading();

  try{
    const data = await loadTeamData();
    renderTeamGraph(data);
  }catch(error){
    console.info("Team average popup unavailable.",error);
    showTeamError(error?.message || "Could not load team-average details.");
  }finally{
    teamOpening = false;
  }
}

document.addEventListener("click",event => {
  const card = event.target?.closest?.(
    ".dash-metric.team-average-detail-trigger"
  );

  if(!card || !card.closest("#dashboardView")) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  openTeamAverageDetails();
},true);

document.addEventListener("keydown",event => {
  if(event.key !== "Enter" && event.key !== " ") return;

  const card = event.target?.closest?.(
    ".dash-metric.team-average-detail-trigger"
  );

  if(!card || !card.closest("#dashboardView")) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  openTeamAverageDetails();
},true);

document.addEventListener("keydown",event => {
  if(event.key !== "Escape") return;

  if(evaluatorModal && !evaluatorModal.hidden){
    event.preventDefault();
    closeEvaluatorModal();
    return;
  }

  if(teamModal && !teamModal.hidden){
    event.preventDefault();
    closeTeamModal();
  }
},true);


/* =========================================================
   MAIN VIEW STATE SYNCHRONIZER
   Keep header + sidebar navigation aligned with whichever main
   view is actually visible, regardless of which control changed it.
   ========================================================= */

function mainViewFromDom(){
  const dashboard = document.getElementById("dashboardView");
  const form = document.getElementById("formView");

  if(!dashboard || !form) return null;

  const dashboardVisible =
    !dashboard.classList.contains("hide");

  const formVisible =
    !form.classList.contains("hide");

  if(formVisible && !dashboardVisible) return "form";
  if(dashboardVisible && !formVisible) return "dashboard";

  // During animation/transitional frames, trust explicit navigation intent.
  return mainViewIntent;
}

function applyMainViewChrome(mode){
  if(mode !== "dashboard" && mode !== "form") return;

  const onDashboard = mode === "dashboard";
  const action = document.getElementById("headerActionBtn");

  if(action){
    const nextText =
      onDashboard
        ? "Start Evaluation"
        : "Dashboard";

    if(action.textContent !== nextText){
      action.textContent = nextText;
    }

    action.setAttribute(
      "aria-label",
      onDashboard
        ? "Start Evaluation"
        : "Return to Dashboard"
    );

    action.dataset.mainViewAction =
      onDashboard
        ? "open-evaluation"
        : "open-dashboard";
  }

  const title = document.getElementById("pageTitle");
  if(title){
    const nextTitle =
      onDashboard
        ? "Performance Dashboard"
        : "Performance Evaluation";

    if(title.textContent !== nextTitle){
      title.textContent = nextTitle;
    }
  }

  document
    .getElementById("drawerDashboard")
    ?.classList.toggle("on",onDashboard);

  document
    .getElementById("drawerEvaluation")
    ?.classList.toggle("on",!onDashboard);

  document
    .getElementById("layoutChooser")
    ?.classList.toggle("hide",onDashboard);
}

function syncVisibleMainViewState(preferredMode=null){
  if(mainViewSyncing) return;

  const mode =
    preferredMode ||
    mainViewIntent ||
    mainViewFromDom();

  if(!mode) return;

  mainViewSyncing = true;

  try{
    applyMainViewChrome(mode);
  }finally{
    mainViewSyncing = false;
  }
}

function setMainViewIntent(mode){
  if(mode !== "dashboard" && mode !== "form") return;

  mainViewIntent = mode;
  syncVisibleMainViewState(mode);

  clearTimeout(mainViewIntentTimer);
  mainViewIntentTimer = setTimeout(() => {
    mainViewIntent = null;
    syncVisibleMainViewState();
  },700);
}

function installMainViewStateSync(){
  const dashboard = document.getElementById("dashboardView");
  const form = document.getElementById("formView");
  const action = document.getElementById("headerActionBtn");

  if(!dashboard || !form || !action) return;

  const viewObserver = new MutationObserver(() => {
    queueMicrotask(() => {
      syncVisibleMainViewState();
    });
  });

  viewObserver.observe(dashboard,{
    attributes:true,
    attributeFilter:["class"]
  });

  viewObserver.observe(form,{
    attributes:true,
    attributeFilter:["class"]
  });

  // If another module overwrites the header label after navigation,
  // immediately restore the label from the actual view/intent.
  const actionObserver = new MutationObserver(() => {
    if(mainViewSyncing) return;

    queueMicrotask(() => {
      syncVisibleMainViewState();
    });
  });

  actionObserver.observe(action,{
    childList:true,
    characterData:true,
    subtree:true
  });

  document.addEventListener("click",event => {
    const evaluation =
      event.target?.closest?.("#drawerEvaluation");

    if(evaluation){
      setMainViewIntent("form");

      // Reassert after dashboard.js finishes its animated transition.
      setTimeout(
        () => syncVisibleMainViewState("form"),
        0
      );
      setTimeout(
        () => syncVisibleMainViewState("form"),
        220
      );
      setTimeout(
        () => syncVisibleMainViewState(),
        560
      );
      return;
    }

    const dashboardIntent =
      event.target?.closest?.(
        "#drawerDashboard,#backToDashboard"
      );

    if(dashboardIntent){
      setMainViewIntent("dashboard");

      setTimeout(
        () => syncVisibleMainViewState("dashboard"),
        0
      );
      setTimeout(
        () => syncVisibleMainViewState("dashboard"),
        220
      );
      setTimeout(
        () => syncVisibleMainViewState(),
        560
      );
      return;
    }

    if(event.target?.closest?.("#headerActionBtn")){
      const currentMode =
        mainViewFromDom() ||
        mainViewIntent ||
        "dashboard";

      setMainViewIntent(
        currentMode === "form"
          ? "dashboard"
          : "form"
      );
    }
  },true);

  window.addEventListener(
    "pageshow",
    () => syncVisibleMainViewState()
  );

  window.addEventListener(
    "focus",
    () => syncVisibleMainViewState()
  );

  document.addEventListener("visibilitychange",() => {
    if(document.visibilityState === "visible"){
      syncVisibleMainViewState();
    }
  });

  syncVisibleMainViewState();
}

/* =========================================================
   CURRENT ROUND DASHBOARD STABILITY
   Dashboard.js uses the legacy roster RPC, while exemptions use
   the v2 roster. Guard the visible denominator from briefly
   reverting to the legacy expected total after tab visibility.
   ========================================================= */

function computeCorrectProgress(people,rows,roster){
  const exemptedIds = new Set(
    roster
      .filter(person => person?.id && person.exempted === true)
      .map(person => person.id)
  );

  const activePeople = people.filter(person =>
    person?.id && !exemptedIds.has(person.id)
  );

  const activePeopleIds = new Set(
    activePeople.map(person => person.id)
  );

  const eligibleEvaluatorIds = new Set(
    roster
      .filter(person =>
        person?.id &&
        person.has_login !== false &&
        person.exempted !== true
      )
      .map(person => person.id)
  );

  const eligibleCount = eligibleEvaluatorIds.size;

  const expected = activePeople.reduce(
    (sum,person) =>
      sum +
      Math.max(
        eligibleCount -
          (eligibleEvaluatorIds.has(person.id) ? 1 : 0),
        0
      ),
    0
  );

  const done = new Set(
    rows
      .filter(row =>
        !row.archived &&
        row.locked &&
        activePeopleIds.has(row.employee_id) &&
        eligibleEvaluatorIds.has(row.evaluator_id)
      )
      .map(row => `${row.employee_id}|${row.evaluator_id}`)
  ).size;

  const pct = expected
    ? Math.min(100,done / expected * 100)
    : 0;

  return {
    done,
    expected,
    pct,
    text:`${done} / ${expected}`,
    percent:`${Math.round(pct)}%`,
    width:`${pct}%`
  };
}

function applyStableProgress(progress){
  if(!progress) return;

  const text = document.getElementById("completionText");
  const percent = document.getElementById("completionPercent");
  const bar = document.getElementById("completionBar");

  if(text && text.textContent !== progress.text){
    text.textContent = progress.text;
  }

  if(percent && percent.textContent !== progress.percent){
    percent.textContent = progress.percent;
  }

  if(bar && bar.style.width !== progress.width){
    bar.style.width = progress.width;
  }
}

function visibleExpected(){
  const text =
    document.getElementById("completionText")?.textContent || "";

  const match = text.match(
    /^\s*(\d+)\s*\/\s*(\d+)\s*$/
  );

  if(!match) return null;

  return {
    done:Number(match[1]),
    expected:Number(match[2])
  };
}

function guardLegacyProgress(){
  if(!stableProgress) return;

  const visible = visibleExpected();
  if(!visible) return;

  // The problematic background-tab refresh changes the denominator
  // (for example 30 -> 42 -> 30). Correct that in the same mutation
  // microtask so it does not paint as a visible bounce.
  if(visible.expected !== stableProgress.expected){
    applyStableProgress(stableProgress);
  }
}

async function syncStableProgress(){
  if(progressSyncPromise) return progressSyncPromise;

  progressSyncPromise = (async () => {
    try{
      const [profilesResult,evaluationsResult,rosterResult] =
        await Promise.all([
          db.from("profiles")
            .select("id,full_name")
            .order("full_name"),
          db.rpc("get_dashboard_evaluations"),
          db.rpc("get_evaluation_roster_v2")
        ]);

      if(evaluationsResult.error) throw evaluationsResult.error;
      if(rosterResult.error) throw rosterResult.error;

      const people = profilesResult.error
        ? []
        : (profilesResult.data || []);

      const roster = Array.isArray(rosterResult.data)
        ? rosterResult.data
        : [];

      if(!people.length && roster.length){
        roster.forEach(person => {
          if(!person?.id) return;
          people.push({
            id:person.id,
            full_name:person.full_name || "Unknown"
          });
        });
      }

      stableProgress = computeCorrectProgress(
        people,
        evaluationsResult.data || [],
        roster
      );

      applyStableProgress(stableProgress);
    }catch(error){
      console.info(
        "Exemption-aware dashboard progress refresh unavailable.",
        error
      );
    }finally{
      progressSyncPromise = null;
    }
  })();

  return progressSyncPromise;
}

function scheduleProgressSync(delay=60){
  clearTimeout(progressSyncTimer);
  progressSyncTimer = setTimeout(() => {
    progressSyncTimer = null;
    syncStableProgress();
  },delay);
}

function installProgressGuard(){
  const text = document.getElementById("completionText");
  const percent = document.getElementById("completionPercent");
  const bar = document.getElementById("completionBar");

  if(!text || !percent || !bar) return;

  progressObserver = new MutationObserver(() => {
    guardLegacyProgress();
    scheduleProgressSync(100);
  });

  progressObserver.observe(text,{
    childList:true,
    subtree:true,
    characterData:true
  });

  progressObserver.observe(percent,{
    childList:true,
    subtree:true,
    characterData:true
  });

  progressObserver.observe(bar,{
    attributes:true,
    attributeFilter:["style"]
  });
}

document.addEventListener("visibilitychange",() => {
  if(document.visibilityState !== "visible") return;

  guardLegacyProgress();
  teamCacheAt = 0;
  scheduleProgressSync(0);
});

window.addEventListener("focus",() => {
  guardLegacyProgress();
  teamCacheAt = 0;
  scheduleProgressSync(0);
});

window.addEventListener("online",() => {
  teamCacheAt = 0;
  scheduleProgressSync(0);
});

window.addEventListener("round-exemptions-updated",() => {
  // The expected denominator may legitimately change after Exempt/Restore.
  // Drop the old guard immediately and rebuild it from v2.
  stableProgress = null;
  scheduleProgressSync(0);
});

const refreshHookTimer = setInterval(() => {
  const current = window.__refreshResults;
  if(typeof current !== "function") return;

  if(current.__dashboardDetailEnhancementHook){
    clearInterval(refreshHookTimer);
    return;
  }

  const wrapped = function(...args){
    let result;

    try{
      result = current.apply(this,args);
    }finally{
      scheduleProgressSync(90);
      teamCacheAt = 0;
    }

    return result;
  };

  wrapped.__dashboardDetailEnhancementHook = true;
  wrapped.__dashboardDetailEnhancementOriginal = current;
  window.__refreshResults = wrapped;

  clearInterval(refreshHookTimer);
},100);

setTimeout(() => clearInterval(refreshHookTimer),8000);

const stablePoll = setInterval(() => {
  if(document.visibilityState !== "visible") return;
  if(document.getElementById("dashboardView")?.classList.contains("hide")) return;
  scheduleProgressSync(0);
},5000);

window.addEventListener("pagehide",() => {
  clearInterval(stablePoll);
  clearInterval(refreshHookTimer);
  clearTimeout(progressSyncTimer);
  progressObserver?.disconnect();
},{once:true});

const cardObserver = new MutationObserver(() => {
  decorateTeamAverageCard();
});

cardObserver.observe(document.documentElement,{
  childList:true,
  subtree:true
});

injectStyles();
decorateTeamAverageCard();
installMainViewStateSync();
installProgressGuard();
syncStableProgress();

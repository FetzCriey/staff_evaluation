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
let teamCache = null;
let teamCacheAt = 0;
let teamPreviousOverflow = "";
let teamLastFocused = null;
let teamOpening = false;

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
      transition:r .14s ease,fill .14s ease;
    }

    .team-average-dot:hover,
    .team-average-dot.selected{
      r:8px;
      fill:#08344c;
    }

    .team-average-value{
      fill:#28455c;
      font:800 11px "Bricolage Grotesque","Inter",sans-serif;
      pointer-events:none;
    }

    .team-average-detail{
      display:grid;
      grid-template-columns:minmax(0,1.45fr) repeat(2,minmax(0,.75fr));
      gap:8px;
      margin-top:9px;
    }

    .team-average-detail-main,
    .team-average-detail-mini{
      min-width:0;
      padding:10px 11px;
      border:1px solid #d5e8f2;
      border-radius:12px;
      background:#fff;
    }

    .team-average-detail-label{
      color:var(--muted,#5b7080);
      font-size:7.8px;
      font-weight:800;
      letter-spacing:.045em;
      text-transform:uppercase;
    }

    .team-average-detail-value{
      display:block;
      margin-top:4px;
      color:var(--ink,#0a2233);
      font-size:11px;
      line-height:1.35;
      font-weight:800;
      overflow-wrap:anywhere;
    }

    .team-average-detail-score{
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:17px;
      line-height:1;
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

      .team-average-detail{
        grid-template-columns:1fr 1fr;
      }

      .team-average-detail-main{
        grid-column:1 / -1;
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

  teamModal.hidden = true;
  teamModal.setAttribute("aria-hidden","true");
  document.body.style.overflow = teamPreviousOverflow;
  teamLastFocused?.focus?.({preventScroll:true});
  teamLastFocused = null;
}

function showTeamLoading(){
  openTeamShell();
  teamModal.querySelector("#teamAverageDetailContent").innerHTML = `
    <div class="team-average-loading">
      Loading finalized team averages…
    </div>
  `;
}

function showTeamError(message){
  openTeamShell();
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

  const [profilesResult,evaluationsResult] = await Promise.all([
    db.from("profiles")
      .select("id,full_name")
      .order("full_name"),
    db.rpc("get_dashboard_evaluations")
  ]);

  if(profilesResult.error) throw profilesResult.error;
  if(evaluationsResult.error) throw evaluationsResult.error;

  teamCache = {
    profiles:profilesResult.data || [],
    evaluations:evaluationsResult.data || []
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
    .map(([key,rounds]) => ({
      key,
      archived_at:rounds
        .map(round => round.archived_at)
        .sort((a,b) => new Date(a) - new Date(b))[0],
      average:mean(rounds.map(round => round.average)),
      staffCount:new Set(rounds.map(round => round.employee_id)).size,
      evaluatorSubmissions:rounds.reduce(
        (sum,round) => sum + (Number(round.evaluatorCount) || 0),
        0
      )
    }))
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

function renderTeamGraph(data){
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
            <g>
              <circle class="team-average-dot${index === periods.length - 1 ? " selected" : ""}"
                data-team-period-index="${index}"
                cx="${xx}" cy="${yy}" r="6"
                tabindex="0"
                role="button"
                aria-label="${periodDateLabel(period.archived_at)} team average ${scoreText(period.average)} out of 5">
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

    <div class="team-average-detail" id="teamAveragePointDetail">
      <div class="team-average-detail-main">
        <div class="team-average-detail-label">Selected period</div>
        <span class="team-average-detail-value" data-period-detail="date"></span>
      </div>
      <div class="team-average-detail-mini">
        <div class="team-average-detail-label">Team average</div>
        <span class="team-average-detail-value team-average-detail-score"
          data-period-detail="score"></span>
      </div>
      <div class="team-average-detail-mini">
        <div class="team-average-detail-label">Staff finalized</div>
        <span class="team-average-detail-value"
          data-period-detail="staff"></span>
      </div>
    </div>
  `;

  host.appendChild(graph);

  const selectPeriod = index => {
    const period = periods[index];
    if(!period) return;

    host.querySelectorAll(".team-average-dot").forEach(dot => {
      dot.classList.toggle(
        "selected",
        Number(dot.dataset.teamPeriodIndex) === index
      );
    });

    const detail = host.querySelector("#teamAveragePointDetail");

    detail.querySelector('[data-period-detail="date"]').textContent =
      periodDateLabel(period.archived_at);

    detail.querySelector('[data-period-detail="score"]').textContent =
      `${scoreText(period.average)} / 5`;

    detail.querySelector('[data-period-detail="staff"]').textContent =
      `${period.staffCount} staff`;
  };

  host.querySelectorAll(".team-average-dot").forEach(dot => {
    const activate = () =>
      selectPeriod(Number(dot.dataset.teamPeriodIndex));

    dot.addEventListener("click",activate);

    dot.addEventListener("keydown",event => {
      if(event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      activate();
    });
  });

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
  if(event.key === "Escape" && teamModal && !teamModal.hidden){
    event.preventDefault();
    closeTeamModal();
  }
},true);

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
installProgressGuard();
syncStableProgress();

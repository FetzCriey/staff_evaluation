import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* =========================================================
   TOP / OVERALL PERFORMER RECORDS POPUP
   Makes the two headline performer metric cards fully clickable
   and shows the selected staff member's finalized records.
   ========================================================= */

const SUPABASE_URL = "https://giosjwjhalhmwcuyzfos.supabase.co";
const SUPABASE_KEY = "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_";
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const BUCKET = "profile-pictures";
const CACHE_MS = 10000;

let modal = null;
let cache = null;
let cacheAt = 0;
let previousOverflow = "";
let lastFocused = null;
let opening = false;

const normalize = value => String(value || "")
  .toLowerCase()
  .replace(/\s+/g," ")
  .trim();

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

function initials(name){
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return (
    (parts[0]?.[0] || "") +
    (parts.length > 1 ? parts.at(-1)?.[0] || "" : "")
  ).toUpperCase() || "—";
}

function avatarUrl(path){
  if(!path) return "";
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function injectStyles(){
  if(document.getElementById("performer-records-style")) return;

  const style = document.createElement("style");
  style.id = "performer-records-style";
  style.textContent = `
    .dash-metric.performer-records-trigger{
      cursor:pointer;
      outline:none;
      transition:
        transform .16s ease,
        border-color .16s ease,
        box-shadow .16s ease;
    }

    .dash-metric.performer-records-trigger:hover{
      border-color:#b9ddec;
      box-shadow:0 16px 34px -27px rgba(8,52,76,.48);
      transform:translateY(-1px);
    }

    .dash-metric.performer-records-trigger:focus-visible{
      border-color:var(--lagoon,#15ace3);
      box-shadow:0 0 0 4px rgba(21,172,227,.15);
    }

    .dash-metric.performer-records-trigger
      .performer-records-card-hint{
      display:inline-flex;
      align-items:center;
      gap:5px;
      margin-top:7px;
      color:var(--lagoon-deep,#0b7fb0);
      font-size:8.5px;
      line-height:1;
      font-weight:800;
      letter-spacing:.06em;
      text-transform:uppercase;
      opacity:.72;
    }

    .performer-records-modal[hidden]{
      display:none !important;
    }

    .performer-records-modal{
      position:fixed;
      inset:0;
      z-index:100100;
      display:grid;
      place-items:center;
      box-sizing:border-box;
      padding:18px;
    }

    .performer-records-backdrop{
      position:absolute;
      inset:0;
      background:rgba(4,24,36,.64);
      backdrop-filter:blur(6px);
      -webkit-backdrop-filter:blur(6px);
    }

    .performer-records-dialog{
      position:relative;
      z-index:1;
      width:min(720px,100%);
      max-height:min(88vh,820px);
      overflow-y:auto;
      overflow-x:hidden;
      overscroll-behavior:contain;
      border:1.5px solid var(--line,#c9dfee);
      border-radius:22px;
      background:#fff;
      box-shadow:0 30px 86px -24px rgba(3,31,48,.58);
    }

    .performer-records-hero{
      position:relative;
      display:flex;
      align-items:flex-start;
      gap:14px;
      padding:20px 54px 18px 20px;
      color:#fff;
      background:
        radial-gradient(105% 150% at 100% 0%,rgba(21,172,227,.52),transparent 60%),
        linear-gradient(145deg,#0b536f 0%,#08344c 58%,#051f30 100%);
    }

    .performer-records-close{
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

    .performer-records-avatar{
      flex:0 0 58px;
      width:58px;
      height:58px;
      display:grid;
      place-items:center;
      overflow:hidden;
      border:1px solid rgba(255,255,255,.34);
      border-radius:17px;
      background:rgba(255,255,255,.15);
      color:#fff;
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:17px;
      font-weight:800;
    }

    .performer-records-avatar img{
      display:block;
      width:100%;
      height:100%;
      object-fit:cover;
    }

    .performer-records-heading{
      flex:1 1 auto;
      min-width:0;
    }

    .performer-records-kicker{
      color:rgba(213,240,251,.76);
      font-size:8.5px;
      line-height:1.2;
      font-weight:800;
      letter-spacing:.15em;
      text-transform:uppercase;
    }

    .performer-records-name{
      margin:4px 0 0;
      color:#fff;
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:23px;
      line-height:1.1;
      font-weight:800;
      overflow-wrap:anywhere;
    }

    .performer-records-position{
      margin-top:5px;
      color:rgba(229,245,252,.82);
      font-size:10px;
      line-height:1.35;
    }

    .performer-records-badges{
      display:flex;
      flex-wrap:wrap;
      gap:6px;
      margin-top:8px;
    }

    .performer-records-badge{
      padding:4px 7px;
      border:1px solid rgba(255,255,255,.22);
      border-radius:999px;
      background:rgba(255,255,255,.1);
      color:#e8f7fc;
      font-size:8px;
      line-height:1.2;
      font-weight:800;
      letter-spacing:.04em;
    }

    .performer-records-body{
      padding:16px 17px 19px;
    }

    .performer-records-summary{
      display:grid;
      grid-template-columns:repeat(4,minmax(0,1fr));
      gap:8px;
    }

    .performer-records-stat{
      min-width:0;
      padding:11px;
      border:1.5px solid var(--line,#c9dfee);
      border-radius:13px;
      background:#f9fcfe;
    }

    .performer-records-stat-label{
      display:block;
      color:var(--muted,#5b7080);
      font-size:8px;
      line-height:1.25;
      font-weight:800;
      letter-spacing:.045em;
      text-transform:uppercase;
    }

    .performer-records-stat-value{
      display:block;
      margin-top:5px;
      color:var(--ink,#0a2233);
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:19px;
      line-height:1;
      font-weight:800;
    }

    .performer-records-stat-unit{
      margin-left:2px;
      color:var(--muted,#5b7080);
      font-family:"Inter",sans-serif;
      font-size:8px;
      font-weight:700;
    }

    .performer-records-section-head{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px;
      margin:17px 1px 9px;
    }

    .performer-records-section-title{
      color:var(--ink,#0a2233);
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:14px;
      line-height:1.2;
      font-weight:800;
    }

    .performer-records-count{
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

    .performer-records-list{
      display:flex;
      flex-direction:column;
      gap:8px;
    }

    .performer-record{
      display:grid;
      grid-template-columns:56px minmax(0,1fr) auto;
      grid-template-areas:
        "round copy score"
        "round bar score";
      align-items:center;
      column-gap:11px;
      row-gap:7px;
      padding:11px 12px;
      border:1.5px solid var(--line,#c9dfee);
      border-radius:13px;
      background:#fff;
    }

    .performer-record.latest{
      border-color:#bce1f1;
      background:#fbfdff;
    }

    .performer-record-round{
      grid-area:round;
      align-self:stretch;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      min-width:0;
      border-radius:10px;
      background:#eff8fd;
      color:var(--lagoon-deep,#0b7fb0);
    }

    .performer-record-round strong{
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:14px;
      line-height:1;
      font-weight:800;
    }

    .performer-record-round span{
      margin-top:3px;
      font-size:7px;
      line-height:1.1;
      font-weight:800;
      letter-spacing:.05em;
      text-transform:uppercase;
    }

    .performer-record-copy{
      grid-area:copy;
      min-width:0;
    }

    .performer-record-date{
      display:block;
      color:var(--ink,#0a2233);
      font-size:10.5px;
      line-height:1.3;
      font-weight:800;
    }

    .performer-record-meta{
      display:block;
      margin-top:2px;
      color:var(--muted,#5b7080);
      font-size:8.8px;
      line-height:1.3;
    }

    .performer-record-score{
      grid-area:score;
      color:var(--ink,#0a2233);
      font-family:"Bricolage Grotesque","Inter",sans-serif;
      font-size:18px;
      line-height:1;
      font-weight:800;
      text-align:right;
    }

    .performer-record-score span{
      display:block;
      margin-top:4px;
      color:var(--muted,#5b7080);
      font-family:"Inter",sans-serif;
      font-size:7.5px;
      font-weight:700;
    }

    .performer-record-bar{
      grid-area:bar;
      height:6px;
      overflow:hidden;
      border-radius:999px;
      background:#e6f0f5;
    }

    .performer-record-bar span{
      display:block;
      height:100%;
      border-radius:inherit;
      background:linear-gradient(
        90deg,
        var(--lagoon,#15ace3),
        var(--lagoon-deep,#0b7fb0)
      );
    }

    .performer-records-empty,
    .performer-records-loading,
    .performer-records-error{
      padding:24px 14px;
      border:1.5px solid var(--line,#c9dfee);
      border-radius:13px;
      background:#f9fcfe;
      color:var(--muted,#5b7080);
      text-align:center;
      font-size:10px;
      line-height:1.45;
    }

    .performer-records-loading::before{
      content:"";
      display:inline-block;
      width:14px;
      height:14px;
      margin-right:7px;
      vertical-align:-3px;
      border:2px solid #d6e8f1;
      border-top-color:var(--lagoon,#15ace3);
      border-radius:50%;
      animation:performerRecordsSpin .7s linear infinite;
    }

    @keyframes performerRecordsSpin{
      to{transform:rotate(360deg)}
    }

    @media(max-width:600px){
      .dash-metric.performer-records-trigger
        .performer-records-card-hint{
        font-size:8px;
      }

      .performer-records-modal{
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

      .performer-records-dialog{
        width:100%;
        max-width:100%;
        min-width:0;
        max-height:100%;
        -webkit-overflow-scrolling:touch;
        border-radius:16px;
      }

      .performer-records-hero{
        padding:16px 48px 14px 14px;
        gap:11px;
      }

      .performer-records-close{
        top:10px;
        right:10px;
        width:35px;
        height:35px;
      }

      .performer-records-avatar{
        flex-basis:48px;
        width:48px;
        height:48px;
        border-radius:14px;
        font-size:14px;
      }

      .performer-records-name{
        font-size:20px;
      }

      .performer-records-body{
        padding:12px;
      }

      .performer-records-summary{
        grid-template-columns:repeat(2,minmax(0,1fr));
      }

      .performer-record{
        grid-template-columns:48px minmax(0,1fr) auto;
        column-gap:8px;
        padding:10px;
      }

      .performer-record-score{
        font-size:16px;
      }
    }

    @media(max-width:350px){
      .performer-records-summary{
        gap:6px;
      }

      .performer-records-stat{
        padding:9px;
      }

      .performer-record{
        grid-template-columns:43px minmax(0,1fr);
        grid-template-areas:
          "round copy"
          "round score"
          "bar bar";
      }

      .performer-record-score{
        text-align:left;
      }

      .performer-record-score span{
        display:inline;
        margin-left:3px;
      }
    }

    @media(prefers-reduced-motion:reduce){
      .dash-metric.performer-records-trigger{
        transition:none;
      }

      .performer-records-loading::before{
        animation:none;
      }
    }
  `;

  document.head.appendChild(style);
}

function metricCard(type){
  const name = document.getElementById(
    type === "latest" ? "latestTopName" : "overallTopName"
  );
  return name?.closest(".dash-metric") || null;
}

function decorateCards(){
  [
    ["latest","View latest top performer's records"],
    ["overall","View best overall performer's records"]
  ].forEach(([type,label]) => {
    const card = metricCard(type);
    if(!card || card.dataset.performerRecordsReady === "1") return;

    card.dataset.performerRecordsReady = "1";
    card.dataset.performerRecordsType = type;
    card.classList.add("performer-records-trigger");
    card.setAttribute("role","button");
    card.setAttribute("tabindex","0");
    card.setAttribute("aria-label",label);
    card.title = label;

    const foot = card.querySelector(".dash-metric-foot");
    if(foot && !card.querySelector(".performer-records-card-hint")){
      const hint = document.createElement("span");
      hint.className = "performer-records-card-hint";
      hint.innerHTML = `
        <span>View records</span>
        <span aria-hidden="true">›</span>
      `;
      foot.insertAdjacentElement("afterend",hint);
    }
  });
}

function ensureModal(){
  if(modal) return modal;

  modal = document.createElement("div");
  modal.className = "performer-records-modal";
  modal.hidden = true;
  modal.setAttribute("aria-hidden","true");

  modal.innerHTML = `
    <div class="performer-records-backdrop"
      data-performer-records-close></div>
    <section class="performer-records-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="performerRecordsTitle">
      <div id="performerRecordsContent"></div>
    </section>
  `;

  modal.addEventListener("click",event => {
    if(event.target.closest("[data-performer-records-close]")){
      closeModal();
    }
  });

  document.body.appendChild(modal);
  return modal;
}

function openShell(){
  ensureModal();

  if(modal.hidden){
    lastFocused = document.activeElement;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modal.hidden = false;
    modal.setAttribute("aria-hidden","false");
  }
}

function closeModal(){
  if(!modal || modal.hidden) return;

  modal.hidden = true;
  modal.setAttribute("aria-hidden","true");
  document.body.style.overflow = previousOverflow;
  lastFocused?.focus?.({preventScroll:true});
  lastFocused = null;
}

function showLoading(){
  openShell();
  modal.querySelector("#performerRecordsContent").innerHTML = `
    <div class="performer-records-loading">
      Loading performance records…
    </div>
  `;
}

function showError(message){
  openShell();
  modal.querySelector("#performerRecordsContent").innerHTML = `
    <div class="performer-records-error"></div>
  `;
  modal.querySelector(".performer-records-error").textContent =
    message || "Could not load performance records.";
}

async function loadData(force=false){
  if(!force && cache && Date.now() - cacheAt < CACHE_MS){
    return cache;
  }

  const [profilesResult,evaluationsResult] = await Promise.all([
    db.from("profiles")
      .select("id,full_name,position,role,form_role,avatar_path")
      .order("full_name"),
    db.rpc("get_dashboard_evaluations")
  ]);

  if(profilesResult.error) throw profilesResult.error;
  if(evaluationsResult.error) throw evaluationsResult.error;

  cache = {
    profiles:profilesResult.data || [],
    evaluations:evaluationsResult.data || []
  };
  cacheAt = Date.now();
  return cache;
}

function profileByVisibleName(name,data){
  const wanted = normalize(name);

  return data.profiles.find(
    profile => normalize(profile.full_name) === wanted
  ) || null;
}

function buildRecords(profile,data){
  const groups = new Map();

  data.evaluations
    .filter(row =>
      row.archived &&
      row.archived_at &&
      row.employee_id === profile.id
    )
    .forEach(row => {
      const key = String(row.archived_at);
      if(!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(row);
    });

  return [...groups.entries()]
    .map(([archived_at,rows]) => ({
      archived_at,
      average:mean(rows.map(row => row.average)),
      evaluatorCount:new Set(
        rows.map(row => row.evaluator_id).filter(Boolean)
      ).size
    }))
    .filter(record => Number.isFinite(record.average))
    .sort(
      (a,b) =>
        new Date(a.archived_at).getTime() -
        new Date(b.archived_at).getTime()
    );
}

function render(profile,records,type){
  const latest = records.at(-1) || null;
  const overall = mean(records.map(record => record.average));
  const best = records.length
    ? Math.max(...records.map(record => Number(record.average)))
    : null;

  const content = modal.querySelector("#performerRecordsContent");

  content.innerHTML = `
    <header class="performer-records-hero">
      <button class="performer-records-close"
        type="button"
        aria-label="Close performance records"
        data-performer-records-close>×</button>

      <div class="performer-records-avatar"></div>

      <div class="performer-records-heading">
        <div class="performer-records-kicker"></div>
        <h2 class="performer-records-name"
          id="performerRecordsTitle"></h2>
        <div class="performer-records-position"></div>
        <div class="performer-records-badges"></div>
      </div>
    </header>

    <div class="performer-records-body">
      <div class="performer-records-summary">
        <div class="performer-records-stat">
          <span class="performer-records-stat-label">Latest score</span>
          <span class="performer-records-stat-value" data-stat="latest"></span>
        </div>
        <div class="performer-records-stat">
          <span class="performer-records-stat-label">Overall average</span>
          <span class="performer-records-stat-value" data-stat="overall"></span>
        </div>
        <div class="performer-records-stat">
          <span class="performer-records-stat-label">Best score</span>
          <span class="performer-records-stat-value" data-stat="best"></span>
        </div>
        <div class="performer-records-stat">
          <span class="performer-records-stat-label">Finalized rounds</span>
          <span class="performer-records-stat-value" data-stat="rounds"></span>
        </div>
      </div>

      <div class="performer-records-section-head">
        <div class="performer-records-section-title">
          Evaluation records
        </div>
        <div class="performer-records-count"></div>
      </div>

      <div class="performer-records-list"></div>
    </div>
  `;

  content.querySelector(".performer-records-kicker").textContent =
    type === "latest"
      ? "Latest evaluation · Top performer"
      : "All finalized rounds · Best overall performer";

  content.querySelector(".performer-records-name").textContent =
    profile.full_name || "Unknown staff";

  content.querySelector(".performer-records-position").textContent =
    profile.position || "Staff member";

  const avatar = content.querySelector(".performer-records-avatar");
  avatar.textContent = initials(profile.full_name);

  if(profile.avatar_path){
    const img = document.createElement("img");
    img.src = avatarUrl(profile.avatar_path) +
      "?v=" + encodeURIComponent(Date.now());
    img.alt = `${profile.full_name} profile picture`;
    img.addEventListener("error",() => {
      img.remove();
      avatar.textContent = initials(profile.full_name);
    },{once:true});
    avatar.textContent = "";
    avatar.appendChild(img);
  }

  const badges = content.querySelector(".performer-records-badges");

  [
    profile.form_role || null,
    profile.role === "manager" ? "Manager" : null
  ].filter(Boolean).forEach(label => {
    const badge = document.createElement("span");
    badge.className = "performer-records-badge";
    badge.textContent = label;
    badges.appendChild(badge);
  });

  const scoreWithUnit = value =>
    value === "—"
      ? "—"
      : `${value}<span class="performer-records-stat-unit">/5</span>`;

  content.querySelector('[data-stat="latest"]').innerHTML =
    scoreWithUnit(scoreText(latest?.average));

  content.querySelector('[data-stat="overall"]').innerHTML =
    scoreWithUnit(scoreText(overall));

  content.querySelector('[data-stat="best"]').innerHTML =
    scoreWithUnit(scoreText(best));

  content.querySelector('[data-stat="rounds"]').textContent =
    String(records.length);

  content.querySelector(".performer-records-count").textContent =
    `${records.length} finalized ${records.length === 1 ? "round" : "rounds"}`;

  const list = content.querySelector(".performer-records-list");

  if(!records.length){
    list.innerHTML = `
      <div class="performer-records-empty">
        No finalized evaluation records are available for this staff member.
      </div>
    `;
  }else{
    const newestIndex = records.length - 1;

    records
      .slice()
      .reverse()
      .forEach((record,reverseIndex) => {
        const chronologicalIndex = newestIndex - reverseIndex;
        const card = document.createElement("article");

        card.className =
          "performer-record" + (reverseIndex === 0 ? " latest" : "");

        card.innerHTML = `
          <div class="performer-record-round">
            <strong>${chronologicalIndex + 1}</strong>
            <span>Round</span>
          </div>

          <div class="performer-record-copy">
            <span class="performer-record-date"></span>
            <span class="performer-record-meta"></span>
          </div>

          <div class="performer-record-score">
            ${scoreText(record.average)}
            <span>out of 5</span>
          </div>

          <div class="performer-record-bar"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax="5"
            aria-valuenow="${Number(record.average).toFixed(2)}">
            <span style="width:${
              Math.max(
                0,
                Math.min(100,Number(record.average) / 5 * 100)
              )
            }%"></span>
          </div>
        `;

        card.querySelector(".performer-record-date").textContent =
          new Date(record.archived_at).toLocaleDateString(
            undefined,
            {
              weekday:"short",
              month:"long",
              day:"numeric",
              year:"numeric"
            }
          );

        const evaluatorText =
          `${record.evaluatorCount} evaluator${
            record.evaluatorCount === 1 ? "" : "s"
          } submitted`;

        card.querySelector(".performer-record-meta").textContent =
          reverseIndex === 0
            ? `${evaluatorText} · Latest finalized record`
            : evaluatorText;

        list.appendChild(card);
      });
  }

  content
    .querySelector(".performer-records-close")
    ?.focus({preventScroll:true});
}

async function openRecords(type){
  if(opening) return;

  const nameNode = document.getElementById(
    type === "latest" ? "latestTopName" : "overallTopName"
  );

  const name = String(nameNode?.textContent || "").trim();

  if(!name || name === "—") return;

  opening = true;
  showLoading();

  try{
    const data = await loadData();
    const profile = profileByVisibleName(name,data);

    if(!profile){
      throw new Error(`Could not find ${name} in the staff roster.`);
    }

    const records = buildRecords(profile,data);
    render(profile,records,type);
  }catch(error){
    console.info("Performer records popup unavailable.",error);
    showError(error?.message || "Could not load performance records.");
  }finally{
    opening = false;
  }
}

function performerCardFromTarget(target){
  const card = target?.closest?.(
    ".dash-metric.performer-records-trigger"
  );

  return card?.closest?.("#dashboardView") ? card : null;
}

document.addEventListener("click",event => {
  const card = performerCardFromTarget(event.target);
  if(!card) return;

  // Take priority over the existing name-only staff profile trigger for these
  // two cards. Other Dashboard profile triggers are untouched.
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  openRecords(card.dataset.performerRecordsType);
},true);

document.addEventListener("keydown",event => {
  if(event.key !== "Enter" && event.key !== " ") return;

  const card = event.target?.closest?.(
    ".dash-metric.performer-records-trigger"
  );

  if(!card || !card.closest("#dashboardView")) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  openRecords(card.dataset.performerRecordsType);
},true);

document.addEventListener("keydown",event => {
  if(event.key === "Escape" && modal && !modal.hidden){
    event.preventDefault();
    closeModal();
  }
},true);

const observer = new MutationObserver(() => {
  decorateCards();
});

observer.observe(document.documentElement,{
  childList:true,
  subtree:true
});

window.addEventListener("focus",() => {
  cacheAt = 0;
});

document.addEventListener("visibilitychange",() => {
  if(document.visibilityState === "visible"){
    cacheAt = 0;
  }
});

injectStyles();
decorateCards();

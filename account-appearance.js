/* =========================================================
   ACCOUNT APPEARANCE
   Per-user Light / Dark / AMOLED mode + accent color.

   Persistence:
   - Saved in the signed-in user's Supabase Auth user_metadata.
   - Does not alter profiles, evaluation data, RLS, or other staff.
   ========================================================= */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://giosjwjhalhmwcuyzfos.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_";
const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const META_KEY = "bp_appearance";
const DEFAULTS = Object.freeze({
  mode: "light",
  accent: "#15ACE3"
});

const MODES = new Set(["light", "dark", "amoled"]);
const PRESETS = Object.freeze([
  { name: "Better Practice", value: "#15ACE3" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Purple", value: "#A855F7" },
  { name: "Pink", value: "#EC4899" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Green", value: "#22C55E" }
]);

let currentUser = null;
let currentAppearance = { ...DEFAULTS };
let saveTimer = null;
let saveSerial = 0;

function isHex(value){
  return /^#[0-9a-f]{6}$/i.test(String(value || "").trim());
}

function normalizeAppearance(value){
  const source = value && typeof value === "object" ? value : {};
  return {
    mode: MODES.has(source.mode) ? source.mode : DEFAULTS.mode,
    accent: isHex(source.accent) ? source.accent.toUpperCase() : DEFAULTS.accent
  };
}

function hexToRgb(hex){
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function rgbToHex({ r, g, b }){
  const part = n => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

function mix(hexA, hexB, amount){
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const t = Math.max(0, Math.min(1, amount));
  return rgbToHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t
  });
}

function contrastText(hex){
  const { r, g, b } = hexToRgb(hex);
  const channels = [r, g, b].map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  return luminance > 0.47 ? "#07131B" : "#FFFFFF";
}

function ensureStyles(){
  if(document.getElementById("bpAccountAppearanceStyles")) return;

  const style = document.createElement("style");
  style.id = "bpAccountAppearanceStyles";
  style.textContent = `
    :root{
      --bp-accent-rgb:21,172,227;
      --bp-theme-surface-2:#f4fafd;
      --bp-theme-surface-3:#eef7fc;
      --bp-theme-input:#f8fcfe;
      --bp-theme-contrast:#ffffff;
    }

    html[data-bp-theme="dark"],
    html[data-bp-theme="amoled"]{
      color-scheme:dark;
    }

    html[data-bp-theme="light"]{
      color-scheme:light;
      --ink:#0a2233;
      --ink-soft:#28455c;
      --muted:#5b7080;
      --mist:#d5e7f3;
      --mist-deep:#c3dcec;
      --panel:#ffffff;
      --line:#c9dfee;
      --bp-theme-surface-2:#f4fafd;
      --bp-theme-surface-3:#eef7fc;
      --bp-theme-input:#f8fcfe;
      --bp-theme-contrast:#ffffff;
      --shadow:0 24px 70px -20px rgba(8,52,76,.35);
      --shadow-sm:0 2px 4px rgba(8,52,76,.06),0 14px 34px -16px rgba(8,52,76,.42);
    }

    html[data-bp-theme="dark"]{
      --ink:#f2f6f9;
      --ink-soft:#d0d9e1;
      --muted:#93a3b1;
      --mist:#111922;
      --mist-deep:#0a1016;
      --panel:#18222c;
      --line:#30404e;
      --bp-theme-surface-2:#1d2934;
      --bp-theme-surface-3:#23313d;
      --bp-theme-input:#111a23;
      --bp-theme-contrast:#ffffff;
      --error-bg:#351d21;
      --error-ink:#ffb5bd;
      --error-line:#6b343c;
      --shadow:0 24px 70px -20px rgba(0,0,0,.72);
      --shadow-sm:0 2px 5px rgba(0,0,0,.28),0 16px 36px -18px rgba(0,0,0,.78);
    }

    html[data-bp-theme="amoled"]{
      --ink:#f7f7f7;
      --ink-soft:#d8d8d8;
      --muted:#969696;
      --mist:#000000;
      --mist-deep:#000000;
      --panel:#050505;
      --line:#262626;
      --bp-theme-surface-2:#0b0b0b;
      --bp-theme-surface-3:#111111;
      --bp-theme-input:#090909;
      --bp-theme-contrast:#ffffff;
      --error-bg:#260b0e;
      --error-ink:#ffb5bd;
      --error-line:#5d2229;
      --shadow:0 24px 70px -20px rgba(0,0,0,.92);
      --shadow-sm:0 2px 5px rgba(0,0,0,.55),0 16px 36px -18px rgba(0,0,0,.95);
    }

    html[data-bp-theme="dark"] body,
    html[data-bp-theme="amoled"] body{
      background:
        linear-gradient(180deg,var(--mist) 0%,var(--mist-deep) 100%)
        fixed no-repeat var(--mist) !important;
      color:var(--ink) !important;
    }

    /* Primary brand areas follow the selected accent. */
    html[data-bp-theme] header.top,
    html[data-bp-theme] .drawer-top,
    html[data-bp-theme] .account-settings-head{
      background:
        radial-gradient(120% 90% at 85% -10%,rgba(var(--bp-accent-rgb),.48),transparent 55%),
        radial-gradient(100% 80% at -10% 110%,rgba(var(--bp-accent-rgb),.22),transparent 50%),
        linear-gradient(160deg,var(--lagoon-dark) 0%,#082535 58%,#05151e 100%) !important;
    }

    html[data-bp-theme="amoled"] header.top,
    html[data-bp-theme="amoled"] .drawer-top,
    html[data-bp-theme="amoled"] .account-settings-head{
      background:
        radial-gradient(120% 90% at 85% -10%,rgba(var(--bp-accent-rgb),.32),transparent 56%),
        linear-gradient(160deg,#090909 0%,#030303 60%,#000 100%) !important;
    }

    /* Common surfaces. */
    html[data-bp-theme="dark"] :where(
      .panel,.drawer,.dash-metric,.dash-panel-card,.tcard,.stepper,.mgr-row,
      .account-settings-dialog,.settings-photo-row,[role="dialog"]
    ),
    html[data-bp-theme="amoled"] :where(
      .panel,.drawer,.dash-metric,.dash-panel-card,.tcard,.stepper,.mgr-row,
      .account-settings-dialog,.settings-photo-row,[role="dialog"]
    ){
      background:var(--panel) !important;
      border-color:var(--line) !important;
      color:var(--ink) !important;
    }

    html[data-bp-theme="dark"] :where(
      .dash-panel-head,.dash-date-chip,.dash-tag,.dash-back-btn,.dash-drawer-ico,
      .acct-settings-btn,.settings-btn-ghost,.totals,thead th,.mgr-add
    ),
    html[data-bp-theme="amoled"] :where(
      .dash-panel-head,.dash-date-chip,.dash-tag,.dash-back-btn,.dash-drawer-ico,
      .acct-settings-btn,.settings-btn-ghost,.totals,thead th,.mgr-add
    ){
      background:var(--bp-theme-surface-2) !important;
      border-color:var(--line) !important;
      color:var(--ink-soft) !important;
    }

    html[data-bp-theme="dark"] :where(
      input:not([type="color"]):not([type="range"]),
      textarea,select,.field input,.score-in,.settings-password-wrap input
    ),
    html[data-bp-theme="amoled"] :where(
      input:not([type="color"]):not([type="range"]),
      textarea,select,.field input,.score-in,.settings-password-wrap input
    ){
      background:var(--bp-theme-input) !important;
      border-color:var(--line) !important;
      color:var(--ink) !important;
    }

    html[data-bp-theme="dark"] :where(input,textarea)::placeholder,
    html[data-bp-theme="amoled"] :where(input,textarea)::placeholder{
      color:var(--muted) !important;
      opacity:.84;
    }

    html[data-bp-theme="dark"] tbody tr:hover td,
    html[data-bp-theme="amoled"] tbody tr:hover td{
      background:var(--bp-theme-surface-2) !important;
    }

    html[data-bp-theme="dark"] :where(.dash-rank-row,.dash-activity-row,.dash-live-eval-row),
    html[data-bp-theme="amoled"] :where(.dash-rank-row,.dash-activity-row,.dash-live-eval-row){
      border-color:var(--line) !important;
    }

    html[data-bp-theme="dark"] :where(.dash-rank-avatar,.dash-live-avatar,.dash-rank-no,.dash-activity-icon),
    html[data-bp-theme="amoled"] :where(.dash-rank-avatar,.dash-live-avatar,.dash-rank-no,.dash-activity-icon){
      background:var(--bp-theme-surface-3) !important;
      border-color:var(--line) !important;
      color:var(--lagoon-deep) !important;
    }

    html[data-bp-theme="dark"] .dash-metric-feature,
    html[data-bp-theme="amoled"] .dash-metric-feature{
      background:
        radial-gradient(120% 100% at 100% 0%,rgba(var(--bp-accent-rgb),.11),transparent 55%),
        var(--panel) !important;
    }

    html[data-bp-theme] .dash-metric::after{
      background:rgba(var(--bp-accent-rgb),.08) !important;
    }

    html[data-bp-theme="dark"] :where(.dash-progress-track,.dash-rank-bar,.dash-live-progress),
    html[data-bp-theme="amoled"] :where(.dash-progress-track,.dash-rank-bar,.dash-live-progress){
      background:var(--bp-theme-surface-3) !important;
    }

    html[data-bp-theme] :where(.dash-progress-track span,.dash-rank-bar span,.dash-live-progress span){
      background:linear-gradient(90deg,var(--lagoon),var(--lagoon-deep)) !important;
    }

    html[data-bp-theme] :where(.btn,.settings-btn-primary){
      background:linear-gradient(180deg,var(--lagoon),var(--lagoon-deep)) !important;
    }

    html[data-bp-theme] :where(
      .field input:focus,.score-in:focus,.comment textarea:focus,
      .settings-password-wrap input:focus,input:focus,textarea:focus,select:focus
    ){
      border-color:var(--lagoon) !important;
      box-shadow:0 0 0 3px rgba(var(--bp-accent-rgb),.16) !important;
    }

    html[data-bp-theme="dark"] .scrim,
    html[data-bp-theme="amoled"] .scrim{
      background:rgba(0,0,0,.68) !important;
    }

    /* Account appearance controls. */
    .bp-appearance-section{
      display:flex;
      flex-direction:column;
      gap:12px;
    }

    .bp-appearance-help{
      margin:-4px 0 1px;
      color:var(--muted);
      font-size:11px;
      line-height:1.45;
    }

    .bp-theme-choices{
      display:grid;
      grid-template-columns:repeat(3,minmax(0,1fr));
      gap:8px;
    }

    .bp-theme-choice{
      min-width:0;
      min-height:74px;
      padding:10px 8px;
      border:1.5px solid var(--line);
      border-radius:12px;
      background:var(--bp-theme-surface-2);
      color:var(--ink-soft);
      font:inherit;
      cursor:pointer;
      display:flex;
      flex-direction:column;
      align-items:flex-start;
      justify-content:space-between;
      gap:8px;
      text-align:left;
      transition:border-color .15s ease,box-shadow .15s ease,transform .15s ease;
    }

    .bp-theme-choice:hover{
      transform:translateY(-1px);
      border-color:var(--lagoon);
    }

    .bp-theme-choice[aria-pressed="true"]{
      border-color:var(--lagoon);
      box-shadow:0 0 0 3px rgba(var(--bp-accent-rgb),.13);
    }

    .bp-theme-preview{
      width:100%;
      height:26px;
      overflow:hidden;
      border-radius:8px;
      border:1px solid rgba(127,147,161,.28);
      display:flex;
      align-items:flex-end;
      padding:4px;
      gap:3px;
    }

    .bp-theme-preview::before,
    .bp-theme-preview::after{
      content:"";
      display:block;
      border-radius:999px;
    }

    .bp-theme-preview::before{
      width:52%;
      height:5px;
      background:var(--lagoon);
    }

    .bp-theme-preview::after{
      width:26%;
      height:5px;
      background:currentColor;
      opacity:.38;
    }

    .bp-theme-preview.light{background:#f4fafd;color:#28455c}
    .bp-theme-preview.dark{background:#18222c;color:#d0d9e1}
    .bp-theme-preview.amoled{background:#000;color:#f7f7f7}

    .bp-theme-choice strong{
      color:var(--ink);
      font-size:11.5px;
      line-height:1;
    }

    .bp-accent-label{
      margin-top:2px;
      color:var(--ink-soft);
      font-size:10px;
      font-weight:750;
      letter-spacing:.09em;
      text-transform:uppercase;
    }

    .bp-accent-grid{
      display:flex;
      align-items:center;
      flex-wrap:wrap;
      gap:8px;
    }

    .bp-accent-swatch{
      width:31px;
      height:31px;
      padding:0;
      border:2px solid transparent;
      border-radius:10px;
      background:var(--swatch);
      cursor:pointer;
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.32);
      transition:transform .14s ease,box-shadow .14s ease,border-color .14s ease;
    }

    .bp-accent-swatch:hover{transform:translateY(-1px) scale(1.04)}

    .bp-accent-swatch[aria-pressed="true"]{
      border-color:var(--ink);
      box-shadow:
        0 0 0 2px var(--panel),
        0 0 0 4px var(--lagoon);
    }

    .bp-custom-color-wrap{
      margin-left:auto;
      display:flex;
      align-items:center;
      gap:7px;
      padding:5px 8px;
      border:1.5px solid var(--line);
      border-radius:10px;
      background:var(--bp-theme-surface-2);
      color:var(--ink-soft);
      font-size:10.5px;
      font-weight:700;
    }

    .bp-custom-color{
      width:28px;
      height:25px;
      padding:0;
      border:0;
      border-radius:7px;
      background:transparent;
      cursor:pointer;
    }

    .bp-custom-color::-webkit-color-swatch-wrapper{padding:0}
    .bp-custom-color::-webkit-color-swatch{border:0;border-radius:7px}
    .bp-custom-color::-moz-color-swatch{border:0;border-radius:7px}

    .bp-appearance-status{
      min-height:17px;
      color:var(--muted);
      font-size:10.5px;
    }

    .bp-appearance-status.ok{color:#27804f}
    .bp-appearance-status.err{color:var(--error-ink)}

    html[data-bp-theme="dark"] .bp-appearance-status.ok,
    html[data-bp-theme="amoled"] .bp-appearance-status.ok{
      color:#73d99e;
    }

    @media(max-width:520px){
      .bp-theme-choices{grid-template-columns:1fr}
      .bp-theme-choice{min-height:58px}
      .bp-custom-color-wrap{margin-left:0}
    }

    @media(prefers-reduced-motion:reduce){
      .bp-theme-choice,.bp-accent-swatch{transition:none}
      .bp-theme-choice:hover,.bp-accent-swatch:hover{transform:none}
    }
  `;
  document.head.appendChild(style);
}

function applyAppearance(raw, options = {}){
  ensureStyles();
  const appearance = normalizeAppearance(raw);
  currentAppearance = appearance;

  const root = document.documentElement;
  const accent = appearance.accent;
  const rgb = hexToRgb(accent);

  root.dataset.bpTheme = appearance.mode;
  root.style.setProperty("--bp-accent-rgb", `${rgb.r},${rgb.g},${rgb.b}`);
  root.style.setProperty("--lagoon", accent);
  root.style.setProperty("--accent", accent);
  root.style.setProperty("--sky", mix(accent, "#FFFFFF", 0.34));

  if(appearance.mode === "light"){
    root.style.setProperty("--lagoon-deep", mix(accent, "#000000", 0.30));
    root.style.setProperty("--accent-deep", mix(accent, "#000000", 0.30));
    root.style.setProperty("--lagoon-dark", mix(accent, "#000000", 0.58));
    root.style.setProperty("--accent-soft", mix(accent, "#FFFFFF", 0.88));
  }else{
    root.style.setProperty("--lagoon-deep", mix(accent, "#FFFFFF", 0.10));
    root.style.setProperty("--accent-deep", mix(accent, "#FFFFFF", 0.10));
    root.style.setProperty("--lagoon-dark", mix(accent, "#000000", 0.58));
    root.style.setProperty("--accent-soft", `rgba(${rgb.r},${rgb.g},${rgb.b},.14)`);
  }

  root.style.setProperty("--bp-accent-contrast", contrastText(accent));

  syncControls();

  if(options.dispatch !== false){
    window.dispatchEvent(new CustomEvent("bp-appearance-changed", {
      detail:{ ...appearance }
    }));
  }

  return appearance;
}

function setStatus(text = "", kind = ""){
  const el = document.getElementById("bpAppearanceStatus");
  if(!el) return;
  el.textContent = text;
  el.className = "bp-appearance-status" + (kind ? ` ${kind}` : "");
}

function syncControls(){
  document.querySelectorAll("[data-bp-theme-choice]").forEach(btn => {
    btn.setAttribute("aria-pressed", String(btn.dataset.bpThemeChoice === currentAppearance.mode));
  });

  document.querySelectorAll("[data-bp-accent]").forEach(btn => {
    btn.setAttribute(
      "aria-pressed",
      String(String(btn.dataset.bpAccent || "").toUpperCase() === currentAppearance.accent)
    );
  });

  const picker = document.getElementById("bpCustomAccent");
  if(picker && picker.value.toUpperCase() !== currentAppearance.accent){
    picker.value = currentAppearance.accent;
  }
}

function scheduleSave(){
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveAppearance, 280);
}

async function saveAppearance(){
  const serial = ++saveSerial;

  if(!currentUser){
    const { data:{ user }, error } = await db.auth.getUser();
    if(error || !user){
      setStatus("Sign in again to save appearance.", "err");
      return;
    }
    currentUser = user;
  }

  setStatus("Saving to your account…");

  const payload = {
    ...currentAppearance,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await db.auth.updateUser({
    data: {
      [META_KEY]: payload
    }
  });

  if(serial !== saveSerial) return;

  if(error){
    setStatus(error.message || "Could not save appearance.", "err");
    return;
  }

  currentUser = data?.user || currentUser;
  setStatus();
}

function chooseMode(mode){
  if(!MODES.has(mode) || mode === currentAppearance.mode) return;
  applyAppearance({ ...currentAppearance, mode });
  setStatus("Saving…");
  scheduleSave();
}

function chooseAccent(accent){
  if(!isHex(accent)) return;
  const normalized = accent.toUpperCase();
  if(normalized === currentAppearance.accent) return;
  applyAppearance({ ...currentAppearance, accent:normalized });
  setStatus("Saving…");
  scheduleSave();
}

function buildSettingsSection(){
  if(document.getElementById("bpAppearanceSection")) return true;

  const body = document.querySelector("#accountSettingsModal .account-settings-body");
  if(!body) return false;

  const passwordSection = [...body.querySelectorAll(".settings-section")].find(section =>
    /change password/i.test(section.querySelector(".settings-section-title")?.textContent || "")
  );

  const section = document.createElement("section");
  section.className = "settings-section bp-appearance-section";
  section.id = "bpAppearanceSection";

  const swatches = PRESETS.map(item => `
    <button
      class="bp-accent-swatch"
      type="button"
      data-bp-accent="${item.value}"
      aria-label="${item.name} accent"
      aria-pressed="false"
      title="${item.name}"
      style="--swatch:${item.value}"
    ></button>
  `).join("");

  section.innerHTML = `
    <div class="settings-section-title">Appearance</div>
    <p class="bp-appearance-help">
      Your theme and color are saved only to your signed-in account.
    </p>

    <div class="bp-theme-choices" role="group" aria-label="Color mode">
      <button class="bp-theme-choice" type="button" data-bp-theme-choice="light" aria-pressed="false">
        <span class="bp-theme-preview light" aria-hidden="true"></span>
        <strong>Light</strong>
      </button>
      <button class="bp-theme-choice" type="button" data-bp-theme-choice="dark" aria-pressed="false">
        <span class="bp-theme-preview dark" aria-hidden="true"></span>
        <strong>Dark</strong>
      </button>
      <button class="bp-theme-choice" type="button" data-bp-theme-choice="amoled" aria-pressed="false">
        <span class="bp-theme-preview amoled" aria-hidden="true"></span>
        <strong>AMOLED</strong>
      </button>
    </div>

    <div class="bp-accent-label">Site color</div>
    <div class="bp-accent-grid" role="group" aria-label="Site accent color">
      ${swatches}
      <label class="bp-custom-color-wrap" for="bpCustomAccent">
        <span>Custom</span>
        <input
          class="bp-custom-color"
          id="bpCustomAccent"
          type="color"
          value="${DEFAULTS.accent}"
          aria-label="Custom site color"
        >
      </label>
    </div>

    <div class="bp-appearance-status" id="bpAppearanceStatus" aria-live="polite"></div>
  `;

  const divider = document.createElement("div");
  divider.className = "settings-divider";
  divider.dataset.bpAppearanceDivider = "true";

  if(passwordSection){
    passwordSection.before(section, divider);
  }else{
    body.append(section, divider);
  }

  section.querySelectorAll("[data-bp-theme-choice]").forEach(btn => {
    btn.addEventListener("click", () => chooseMode(btn.dataset.bpThemeChoice));
  });

  section.querySelectorAll("[data-bp-accent]").forEach(btn => {
    btn.addEventListener("click", () => chooseAccent(btn.dataset.bpAccent));
  });

  section.querySelector("#bpCustomAccent")?.addEventListener("input", event => {
    chooseAccent(event.target.value);
  });

  syncControls();
  return true;
}

async function hydrateFromSession(){
  const { data:{ session }, error } = await db.auth.getSession();

  if(error || !session?.user){
    currentUser = null;
    applyAppearance(DEFAULTS);
    return;
  }

  currentUser = session.user;
  applyAppearance(currentUser.user_metadata?.[META_KEY] || DEFAULTS);
}

function installUiWatcher(){
  if(buildSettingsSection()) return;

  const observer = new MutationObserver(() => {
    if(buildSettingsSection()){
      observer.disconnect();
    }
  });

  observer.observe(document.documentElement, {
    childList:true,
    subtree:true
  });
}

ensureStyles();
installUiWatcher();
hydrateFromSession();

db.auth.onAuthStateChange((event, session) => {
  if(!session?.user){
    if(event === "SIGNED_OUT"){
      currentUser = null;
      applyAppearance(DEFAULTS);
    }
    return;
  }

  currentUser = session.user;

  if(event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED"){
    applyAppearance(currentUser.user_metadata?.[META_KEY] || DEFAULTS);
  }
});

window.bpAccountAppearance = Object.freeze({
  get: () => ({ ...currentAppearance }),
  apply: value => applyAppearance(value),
  reset: () => {
    applyAppearance(DEFAULTS);
    setStatus("Saving…");
    scheduleSave();
  }
});

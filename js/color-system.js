/* =========================================================
   BETTER PRACTICE — COLOR SYSTEM

   One accent -> 50–950 scale -> semantic tokens -> themes.

   60 / 30 / 10 usage:
   - 60% canvas / page background
   - 30% cards / panels / controls
   - 10% brand / actions / selected states

   Light, Dark and AMOLED reuse the same semantic token names.
   Contrast-sensitive text is selected using WCAG contrast ratios.
   ========================================================= */

const ROOT = document.documentElement;
const STYLE_ID = "bpColorSystemStyles";
const VERSION = "20260905-1002";
const DEFAULT_ACCENT = "#15ACE3";
const VALID_THEMES = new Set(["light", "dark", "amoled"]);

let baseAccent = null;
let lastTokens = null;
let frame = 0;

function clamp(value, min = 0, max = 1){
  return Math.max(min, Math.min(max, value));
}

function isHex(value){
  return /^#[0-9a-f]{6}$/i.test(String(value || "").trim());
}

function normalizeHex(value, fallback = DEFAULT_ACCENT){
  const text = String(value || "").trim();
  return isHex(text) ? text.toUpperCase() : fallback;
}

function hexToRgb(hex){
  const clean = normalizeHex(hex).slice(1);
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function rgbToHex({r, g, b}){
  const part = value => Math.round(Math.max(0, Math.min(255, value)))
    .toString(16)
    .padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase();
}

function mix(a, b, amount){
  const x = hexToRgb(a);
  const y = hexToRgb(b);
  const t = clamp(amount);
  return rgbToHex({
    r: x.r + (y.r - x.r) * t,
    g: x.g + (y.g - x.g) * t,
    b: x.b + (y.b - x.b) * t
  });
}

function linearChannel(value){
  const n = value / 255;
  return n <= 0.04045
    ? n / 12.92
    : Math.pow((n + 0.055) / 1.055, 2.4);
}

function luminance(hex){
  const {r, g, b} = hexToRgb(hex);
  return (
    0.2126 * linearChannel(r) +
    0.7152 * linearChannel(g) +
    0.0722 * linearChannel(b)
  );
}

function contrastRatio(foreground, background){
  const a = luminance(foreground);
  const b = luminance(background);
  const bright = Math.max(a, b);
  const dark = Math.min(a, b);
  return (bright + 0.05) / (dark + 0.05);
}

function bestBlackOrWhite(background){
  const black = "#07131B";
  const white = "#FFFFFF";
  return contrastRatio(black, background) >= contrastRatio(white, background)
    ? black
    : white;
}

function firstReadable(candidates, background, minimum = 4.5){
  for(const candidate of candidates){
    if(contrastRatio(candidate, background) >= minimum) return candidate;
  }

  return candidates.reduce((best, candidate) =>
    contrastRatio(candidate, background) > contrastRatio(best, background)
      ? candidate
      : best
  );
}

function accessibleBrandPair(scale, minimum = 4.5){
  /* Stay as close to 500 as possible, but move one step if the raw accent
     cannot support normal-size text at WCAG AA. */
  const order = [500, 600, 400, 700, 300, 800, 200, 900, 100, 950, 50];
  let fallback = null;

  for(const step of order){
    const background = scale[step];
    const foreground = bestBlackOrWhite(background);
    const ratio = contrastRatio(foreground, background);

    if(!fallback || ratio > fallback.ratio){
      fallback = { background, foreground, ratio, step };
    }
    if(ratio >= minimum){
      return { background, foreground, ratio, step };
    }
  }

  return fallback;
}

function buildScale(accent){
  const a = normalizeHex(accent);
  return {
    50: mix(a, "#FFFFFF", 0.94),
    100: mix(a, "#FFFFFF", 0.84),
    200: mix(a, "#FFFFFF", 0.70),
    300: mix(a, "#FFFFFF", 0.52),
    400: mix(a, "#FFFFFF", 0.28),
    500: a,
    600: mix(a, "#000000", 0.12),
    700: mix(a, "#000000", 0.28),
    800: mix(a, "#000000", 0.44),
    900: mix(a, "#000000", 0.60),
    950: mix(a, "#000000", 0.74)
  };
}

function buildThemeTokens(theme, accent){
  const scale = buildScale(accent);
  const mode = VALID_THEMES.has(theme) ? theme : "light";

  let canvas;
  let canvasDeep;
  let surface;
  let surface2;
  let surface3;
  let input;
  let border;
  let text;
  let textSoft;
  let muted;
  let cardBorder;
  let headerStart;
  let headerMid;
  let headerEnd;

  if(mode === "amoled"){
    canvas = "#000000";
    canvasDeep = "#000000";
    surface = "#050505";
    surface2 = "#0B0B0B";
    surface3 = mix("#111111", accent, 0.07);
    input = "#080808";
    border = mix("#363636", accent, 0.08);
    cardBorder = mix("#484848", accent, 0.08);
    text = "#F7F7F7";
    textSoft = "#D8D8D8";
    muted = "#A4A4A4";
    headerStart = mix("#0A0A0A", scale[800], 0.20);
    headerMid = "#030303";
    headerEnd = "#000000";
  }else if(mode === "dark"){
    canvas = mix("#0B1218", accent, 0.025);
    canvasDeep = mix("#080D12", accent, 0.018);
    surface = mix("#18222C", accent, 0.035);
    surface2 = mix("#1D2934", accent, 0.045);
    surface3 = mix("#24323E", accent, 0.055);
    input = mix("#111A23", accent, 0.025);
    border = mix("#435867", accent, 0.10);
    cardBorder = mix("#536B7D", accent, 0.10);
    text = "#F2F6F9";
    textSoft = "#D0D9E1";
    muted = "#A2B0BB";
    headerStart = mix("#0B2633", scale[800], 0.28);
    headerMid = mix("#081B25", scale[900], 0.16);
    headerEnd = "#051118";
  }else{
    canvas = mix("#F5FAFD", accent, 0.025);
    canvasDeep = mix("#EAF3F8", accent, 0.035);
    surface = "#FFFFFF";
    surface2 = mix("#FFFFFF", accent, 0.055);
    surface3 = mix("#FFFFFF", accent, 0.095);
    input = mix("#FFFFFF", accent, 0.030);
    border = mix("#C9DFEE", accent, 0.10);
    cardBorder = border;
    text = "#0A2233";
    textSoft = "#28455C";
    muted = "#5B7080";
    headerStart = mix("#0C3A54", scale[800], 0.30);
    headerMid = mix("#08344C", scale[900], 0.22);
    headerEnd = mix("#051E2D", scale[950], 0.12);
  }

  /* Keep all normal-size semantic text at 4.5:1 or better. */
  text = firstReadable([text, "#07131B", "#FFFFFF"], surface, 7);
  textSoft = firstReadable(
    mode === "light"
      ? [textSoft, "#244154", "#173244", "#07131B"]
      : [textSoft, "#D9E2E8", "#E8EEF2", "#FFFFFF"],
    surface,
    4.5
  );
  muted = firstReadable(
    mode === "light"
      ? [muted, "#526A7A", "#435C6D", "#334D5F"]
      : [muted, "#ADBBC5", "#BAC6CE", "#CBD4DA"],
    surface,
    4.5
  );

  const actionPair = accessibleBrandPair(scale, 4.5);
  const brand = actionPair.background;
  const onBrand = actionPair.foreground;
  const brandSoft = mix(surface2, scale[500], mode === "light" ? 0.12 : 0.16);
  const brandText = firstReadable(
    mode === "light"
      ? [scale[600], scale[700], scale[800], scale[900], scale[950]]
      : [scale[400], scale[300], scale[200], scale[100], "#FFFFFF"],
    brandSoft,
    4.5
  );
  const brandOnSurface = firstReadable(
    mode === "light"
      ? [scale[600], scale[700], scale[800], scale[900], scale[950]]
      : [scale[400], scale[300], scale[200], scale[100], "#FFFFFF"],
    surface,
    4.5
  );

  return {
    mode,
    accent: normalizeHex(accent),
    scale,
    canvas,
    canvasDeep,
    surface,
    surface2,
    surface3,
    input,
    border,
    cardBorder,
    text,
    textSoft,
    muted,
    brand,
    brandStep:actionPair.step,
    brandSoft,
    brandText,
    brandOnSurface,
    onBrand,
    headerStart,
    headerMid,
    headerEnd,
    onHeader: "#FFFFFF"
  };
}

function setVar(name, value){
  ROOT.style.setProperty(name, value);
}

function publishTokens(tokens){
  const rgb = hexToRgb(tokens.accent);
  setVar("--bp-accent-rgb", `${rgb.r},${rgb.g},${rgb.b}`);

  Object.entries(tokens.scale).forEach(([step, value]) => {
    setVar(`--bp-brand-${step}`, value);
  });

  setVar("--bp-canvas", tokens.canvas);
  setVar("--bp-canvas-deep", tokens.canvasDeep);
  setVar("--bp-surface", tokens.surface);
  setVar("--bp-surface-2", tokens.surface2);
  setVar("--bp-surface-3", tokens.surface3);
  setVar("--bp-input", tokens.input);
  setVar("--bp-border", tokens.border);
  setVar("--bp-card-border", tokens.cardBorder);
  setVar("--bp-text", tokens.text);
  setVar("--bp-text-soft", tokens.textSoft);
  setVar("--bp-text-muted", tokens.muted);
  setVar("--bp-brand", tokens.brand);
  setVar("--bp-brand-soft", tokens.brandSoft);
  setVar("--bp-brand-text", tokens.brandText);
  setVar("--bp-brand-on-surface", tokens.brandOnSurface);
  setVar("--bp-on-brand", tokens.onBrand);
  setVar("--bp-header-start", tokens.headerStart);
  setVar("--bp-header-mid", tokens.headerMid);
  setVar("--bp-header-end", tokens.headerEnd);
  setVar("--bp-on-header", tokens.onHeader);

  /* Legacy aliases: older modules now consume the same semantic system. */
  setVar("--ink", tokens.text);
  setVar("--ink-soft", tokens.textSoft);
  setVar("--muted", tokens.muted);
  setVar("--mist", tokens.canvas);
  setVar("--mist-deep", tokens.canvasDeep);
  setVar("--panel", tokens.surface);
  setVar("--line", tokens.border);
  setVar("--bp-theme-surface-2", tokens.surface2);
  setVar("--bp-theme-surface-3", tokens.surface3);
  setVar("--bp-theme-input", tokens.input);
  setVar("--lagoon", tokens.brand);
  setVar("--accent", tokens.brand);
  setVar("--lagoon-deep", tokens.brandText);
  setVar("--accent-deep", tokens.brandText);
  setVar("--lagoon-dark", tokens.scale[900]);
  setVar("--accent-soft", tokens.brandSoft);
  setVar("--sky", tokens.scale[300]);
  setVar("--bp-accent-contrast", tokens.onBrand);
  setVar("--bp-theme-contrast", tokens.onBrand);
}

function installStyles(){
  let style = document.getElementById(STYLE_ID);
  if(!style){
    style = document.createElement("style");
    style.id = STYLE_ID;
  }

  style.dataset.version = VERSION;
  style.textContent = `
    /* 60% — canvas / dominant neutral */
    html[data-bp-theme] body{
      background:linear-gradient(180deg,var(--bp-canvas) 0%,var(--bp-canvas-deep) 100%) fixed no-repeat var(--bp-canvas) !important;
      color:var(--bp-text) !important;
    }

    /* 30% — primary surfaces */
    html[data-bp-theme] :where(
      .drawer,.panel,.dash-metric,.dash-panel-card,.account-settings-dialog,
      .staff-add-dialog,.recycle-bin-dialog,.performer-records-dialog,
      .team-average-dialog,.team-evaluator-dialog,.round-progress-dialog,
      .round-exemption-dialog,.staff-profile-card,.dlg,.rm-box
    ){
      background:var(--bp-surface) !important;
      border-color:var(--bp-card-border,var(--bp-border)) !important;
      color:var(--bp-text) !important;
    }

    html[data-bp-theme] :where(
      .dash-panel-head,.dash-date-chip,.dash-tag,.totals,.tcard,.mgr-sum,
      .mgr-row,.acct,.acct-settings-btn,.settings-section,.settings-photo-row,
      .res-row,.his-row,.his-date-sum,.his-date-body,.round-progress-person,
      .round-drilldown-panel,.round-drilldown-assignment,.recycle-bin-toolbar,
      .recycle-bin-card,.performer-record,.team-average-stat,.staff-profile-stat
    ){
      background:var(--bp-surface-2) !important;
      border-color:var(--bp-border) !important;
      color:var(--bp-text) !important;
    }

    html[data-bp-theme] :where(
      input:not([type="color"]):not([type="range"]),textarea,select,
      .field input,.score-in,.settings-password-wrap input,.bp-select-btn,
      .lay-tr,.recycle-bin-meta-item
    ){
      background:var(--bp-input) !important;
      border-color:var(--bp-border) !important;
      color:var(--bp-text) !important;
    }

    html[data-bp-theme] :where(input,textarea)::placeholder{
      color:var(--bp-text-muted) !important;
      opacity:1 !important;
    }

    /* Header surfaces: same brand scale, remapped per theme. */
    html[data-bp-theme] :where(
      header.top,.drawer-top,.account-settings-head,.staff-add-head,.recycle-bin-head
    ){
      background:
        radial-gradient(120% 95% at 88% -15%,rgba(var(--bp-accent-rgb),.42),transparent 56%),
        radial-gradient(100% 85% at -10% 110%,rgba(var(--bp-accent-rgb),.18),transparent 52%),
        linear-gradient(155deg,var(--bp-header-start) 0%,var(--bp-header-mid) 58%,var(--bp-header-end) 100%) !important;
      color:var(--bp-on-header) !important;
    }

    html[data-bp-theme] :where(
      header.top,.drawer-top,.account-settings-head,.staff-add-head,.recycle-bin-head
    ) :where(h1,h2,h3,strong,.t){
      color:var(--bp-on-header) !important;
      -webkit-text-fill-color:var(--bp-on-header) !important;
    }

    /* 10% — primary brand actions. */
    html[data-bp-theme] :where(
      .btn:not(.ghost),.settings-btn-primary,.dash-head-btn,
      .mgr-add-launch:not(.round-exemption-sidebar-launch),
      .recycle-bin-restore-all,.recycle-bin-restore,
      .recycle-action-ok,.recycle-password-submit,
      .staff-add-submit
    ):not(:disabled){
      background:linear-gradient(180deg,var(--bp-brand) 0%,var(--bp-brand-600) 100%) !important;
      border-color:var(--bp-brand-600) !important;
      color:var(--bp-on-brand) !important;
      -webkit-text-fill-color:var(--bp-on-brand) !important;
    }

    /* Secondary actions use surfaces, not washed-out accent fills. */
    html[data-bp-theme] :where(
      .btn.ghost,.recycle-bin-refresh,.recycle-action-cancel,
      .recycle-password-cancel,.acct-settings-btn,.dash-back-btn
    ):not(:disabled){
      background:var(--bp-surface-3) !important;
      border-color:var(--bp-border) !important;
      color:var(--bp-text) !important;
      -webkit-text-fill-color:var(--bp-text) !important;
    }

    html[data-bp-theme] :where(
      .btn.ghost,.recycle-bin-refresh,.recycle-action-cancel,
      .recycle-password-cancel,.acct-settings-btn,.dash-back-btn
    ):not(:disabled):hover{
      border-color:var(--bp-brand) !important;
      color:var(--bp-brand-on-surface) !important;
      -webkit-text-fill-color:var(--bp-brand-on-surface) !important;
    }

    /* Selected/active states consume the soft brand token. */
    html[data-bp-theme] :where(
      .dash-drawer-link.on,.mgr-sec.open > .mgr-sum,.lay-opt.on,
      .lay-opt[aria-selected="true"],.bp-select-option.selected,
      .bp-select-option[aria-selected="true"],.his-row.on,.res-row.on
    ){
      background:var(--bp-brand-soft) !important;
      border-color:var(--bp-brand) !important;
      color:var(--bp-brand-text) !important;
      -webkit-text-fill-color:var(--bp-brand-text) !important;
    }

    /* Accent text must be readable against the surface, not merely "the hex". */
    html[data-bp-theme] :where(
      .dash-big-score,.tcard .v,.his-avg,.mgr-sum .cnt,
      .dash-rank-no,.dash-activity-icon,.bp-accent-label,
      .recycle-bin-group-head span,.recycle-bin-launch-count
    ){
      color:var(--bp-brand-on-surface) !important;
      -webkit-text-fill-color:var(--bp-brand-on-surface) !important;
    }

    html[data-bp-theme] :where(
      .dash-metric-foot,.dash-live-meta,.dash-live-time,.his-meta,.res-ct,
      .acct-rl,.bp-appearance-help,.recycle-bin-type,
      .recycle-bin-meta-item span,.recycle-bin-status
    ){
      color:var(--bp-text-muted) !important;
      -webkit-text-fill-color:var(--bp-text-muted) !important;
    }

    /* Contrast protection: disabled controls stay obviously disabled AND readable. */
    html[data-bp-theme] button:disabled,
    html[data-bp-theme] .btn:disabled,
    html[data-bp-theme] .settings-btn:disabled{
      opacity:1 !important;
      filter:none !important;
      box-shadow:none !important;
      background:var(--bp-surface-2) !important;
      border-color:var(--bp-border) !important;
      color:var(--bp-text-soft) !important;
      -webkit-text-fill-color:var(--bp-text-soft) !important;
    }

    /* Focus follows the selected brand but does not sacrifice text contrast. */
    html[data-bp-theme] :where(
      button,input,textarea,select,.score-in,.bp-select-btn,.lay-tr
    ):focus-visible{
      outline:none !important;
      border-color:var(--bp-brand) !important;
      box-shadow:0 0 0 3px rgba(var(--bp-accent-rgb),.20) !important;
    }

    /* Existing Recycle Bin/dialog specificity is intentionally beaten here. */
    html[data-bp-theme] #openRecycleBin .recycle-bin-launch-copy > span,
    html[data-bp-theme] #openRecycleBin .recycle-bin-launch-copy small{
      color:var(--bp-on-brand) !important;
      -webkit-text-fill-color:var(--bp-on-brand) !important;
      opacity:1 !important;
    }

    html[data-bp-theme] #openRecycleBin .recycle-bin-launch-copy small{
      opacity:.82 !important;
    }

    html[data-bp-theme] :where(.recycle-action-dialog,.recycle-password-dialog) :where(h3,p,label){
      color:var(--bp-text) !important;
      -webkit-text-fill-color:var(--bp-text) !important;
      opacity:1 !important;
    }

    html[data-bp-theme] :where(.recycle-action-dialog,.recycle-password-dialog) p{
      color:var(--bp-text-soft) !important;
      -webkit-text-fill-color:var(--bp-text-soft) !important;
    }
  `;

  /* Re-append so this semantic layer stays above older visual hotfixes. */
  document.head.appendChild(style);
}

function readAccentFromPage(){
  const inline = ROOT.style.getPropertyValue("--lagoon").trim();
  if(isHex(inline)) return normalizeHex(inline);

  const computed = getComputedStyle(ROOT).getPropertyValue("--lagoon").trim();
  return isHex(computed) ? normalizeHex(computed) : DEFAULT_ACCENT;
}

function applyColorSystem(options = {}){
  const theme = VALID_THEMES.has(options.mode)
    ? options.mode
    : (VALID_THEMES.has(ROOT.dataset.bpTheme) ? ROOT.dataset.bpTheme : "light");

  if(isHex(options.accent)){
    baseAccent = normalizeHex(options.accent);
  }else if(!baseAccent){
    baseAccent = readAccentFromPage();
  }

  const tokens = buildThemeTokens(theme, baseAccent || DEFAULT_ACCENT);
  lastTokens = tokens;
  ROOT.dataset.bpColorSystem = VERSION;
  ROOT.dataset.bpBaseAccent = tokens.accent;
  publishTokens(tokens);
  installStyles();

  window.dispatchEvent(new CustomEvent("bp-color-system-applied", {
    detail:{
      mode:tokens.mode,
      accent:tokens.accent,
      contrast:{
        onBrand:contrastRatio(tokens.onBrand, tokens.brand),
        textOnSurface:contrastRatio(tokens.text, tokens.surface),
        softTextOnSurface:contrastRatio(tokens.textSoft, tokens.surface),
        mutedTextOnSurface:contrastRatio(tokens.muted, tokens.surface),
        brandTextOnSoft:contrastRatio(tokens.brandText, tokens.brandSoft)
      }
    }
  }));
}

function scheduleApply(options = {}){
  if(frame) cancelAnimationFrame(frame);
  frame = requestAnimationFrame(() => {
    frame = 0;
    applyColorSystem(options);
  });
}

window.addEventListener("bp-appearance-changed", event => {
  const detail = event.detail || {};
  if(isHex(detail.accent)) baseAccent = normalizeHex(detail.accent);
  scheduleApply({
    mode: detail.mode,
    accent: detail.accent
  });
});

new MutationObserver(mutations => {
  if(mutations.some(m => m.type === "attributes" && m.attributeName === "data-bp-theme")){
    scheduleApply();
  }
}).observe(ROOT, {attributes:true, attributeFilter:["data-bp-theme"]});

/* Small developer hook for verifying ratios without touching app data. */
window.__bpColorSystem = Object.freeze({
  contrastRatio,
  buildScale,
  apply: applyColorSystem,
  get tokens(){ return lastTokens ? structuredClone(lastTokens) : null; }
});

scheduleApply();

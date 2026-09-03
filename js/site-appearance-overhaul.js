(() => {
  const STYLE_ID = "bpAppearanceOverhaul";
  const VERSION = "20260903-1526";

  function installStyles(){
    const old = document.getElementById(STYLE_ID);
    if(old) old.remove();

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.dataset.version = VERSION;
    style.textContent = `
      /* =========================================================
         BETTER PRACTICE — SITE APPEARANCE CONSISTENCY PASS
         Visual-only. Existing behavior/data flows are preserved.
         ========================================================= */

      :root{
        --bp-radius-sm:10px;
        --bp-radius-md:12px;
        --bp-radius-lg:16px;
        --bp-radius-xl:20px;
        --bp-space-1:6px;
        --bp-space-2:10px;
        --bp-space-3:14px;
        --bp-space-4:18px;
        --bp-shadow-card:0 12px 28px -24px rgba(8,52,76,.50);
        --bp-shadow-float:0 24px 60px -30px rgba(8,52,76,.58);
        --bp-focus:0 0 0 3px rgba(var(--bp-accent-rgb,21,172,227),.22);
      }

      html[data-bp-theme="dark"],
      html[data-bp-theme="amoled"]{
        --bp-shadow-card:0 12px 30px -22px rgba(0,0,0,.72);
        --bp-shadow-float:0 28px 70px -30px rgba(0,0,0,.9);
      }

      /* ---------- TYPOGRAPHY HIERARCHY ---------- */
      body{
        text-rendering:optimizeLegibility;
        -webkit-font-smoothing:antialiased;
      }

      :where(
        .dash-section-kicker,.settings-section-title,.lay-lbl,.mgr h3,
        .bp-accent-label,.review-remarks-title,.evlbl,.round-exemption-label,
        .team-average-section-title,.performer-records-section-title
      ){
        letter-spacing:.10em !important;
      }

      :where(
        .dash-metric-label,.dash-panel-head h3,.settings-section-title,
        .mgr-sum,.dash-drawer-link,.acct-settings-btn,.signout
      ){
        font-weight:750 !important;
      }

      /* ---------- SURFACE + RADIUS CONSISTENCY ---------- */
      :where(
        .dash-metric,.dash-panel-card,.panel,.card,.tcard,.stepper,
        .account-settings-dialog,.settings-section,.staff-add-dialog,
        .performer-records-dialog,.team-average-dialog,.round-progress-dialog,
        .round-exemption-dialog,.staff-profile-card,.dlg,.rm-box
      ){
        border-radius:var(--bp-radius-lg) !important;
      }

      :where(
        .dash-date-chip,.dash-tag,.dash-back-btn,.mgr-sum,.mgr-add-launch,
        .round-exemption-sidebar-launch,.lay-tr,.lay-menu,.bp-select-btn,
        .bp-select-menu,.acct-settings-btn,.signout,.settings-btn,
        .btn,.his-row,.res-row,.round-progress-person,.team-average-evaluator-card
      ){
        border-radius:var(--bp-radius-md) !important;
      }

      :where(
        .dash-metric,.dash-panel-card,.panel,.card,.tcard,.settings-section,
        .mgr-sum,.mgr-add-launch,.round-exemption-sidebar-launch,.acct-settings-btn,
        .signout,.his-row,.res-row,.round-progress-person,.team-average-evaluator-card
      ){
        box-shadow:var(--bp-shadow-card) !important;
      }

      :where(
        .account-settings-dialog,.staff-add-dialog,.performer-records-dialog,
        .team-average-dialog,.round-progress-dialog,.round-exemption-dialog,
        .staff-profile-card,.dlg,.rm-box,.bp-select-menu,.lay-menu
      ){
        box-shadow:var(--bp-shadow-float) !important;
      }

      /* ---------- SPACING CONSISTENCY ---------- */
      :where(.dash-panel-card,.panel,.settings-section){
        scroll-margin-top:18px;
      }

      .dash-metrics{gap:14px !important}
      .dash-grid{gap:14px !important}
      .dash-ranking{gap:7px !important}
      .dash-live-eval-list{gap:8px !important}

      #drawer .dash-drawer-nav{gap:7px !important}
      #drawer .mgr{gap:7px}
      #drawer .acct{gap:7px}

      /* ---------- BUTTON SYSTEM ---------- */
      :where(
        button,.btn,.settings-btn,.acct-settings-btn,.signout,.mgr-sum,
        .mgr-add-launch,.round-exemption-sidebar-launch,.lay-tr,.bp-select-btn
      ){
        transition:
          background-color .15s ease,
          border-color .15s ease,
          color .15s ease,
          box-shadow .15s ease,
          transform .12s ease !important;
      }

      :where(
        button,.btn,.settings-btn,.acct-settings-btn,.signout,.mgr-sum,
        .mgr-add-launch,.round-exemption-sidebar-launch,.lay-tr,.bp-select-btn
      ):focus-visible{
        outline:none !important;
        box-shadow:var(--bp-focus) !important;
      }

      :where(
        .btn,.settings-btn-primary,.dlg-foot .ok,.round-exemption-stacked-primary
      ):not(:disabled){
        color:var(--bp-theme-contrast,#fff) !important;
      }

      :where(
        button,.btn,.settings-btn,.acct-settings-btn,.signout,.mgr-sum,
        .mgr-add-launch,.round-exemption-sidebar-launch,.lay-tr,.bp-select-btn
      ):disabled{
        opacity:1 !important;
        cursor:not-allowed !important;
        filter:none !important;
        transform:none !important;
        box-shadow:none !important;
        color:var(--muted) !important;
        border-color:var(--line) !important;
        background:var(--bp-theme-surface-2,#f4fafd) !important;
      }

      html[data-bp-theme="dark"] :where(
        button,.btn,.settings-btn,.acct-settings-btn,.signout,.mgr-sum,
        .mgr-add-launch,.round-exemption-sidebar-launch,.lay-tr,.bp-select-btn
      ):disabled,
      html[data-bp-theme="amoled"] :where(
        button,.btn,.settings-btn,.acct-settings-btn,.signout,.mgr-sum,
        .mgr-add-launch,.round-exemption-sidebar-launch,.lay-tr,.bp-select-btn
      ):disabled{
        color:var(--ink-soft) !important;
        background:var(--bp-theme-surface-2) !important;
      }

      /* ---------- SIDEBAR ICON + ACTIVE STATE ---------- */
      #drawer .dash-drawer-ico svg{
        width:17px !important;
        height:17px !important;
        display:block !important;
      }

      #drawer .dash-drawer-link.on{
        border-color:rgba(var(--bp-accent-rgb),.34) !important;
        background:rgba(var(--bp-accent-rgb),.12) !important;
        box-shadow:inset 3px 0 0 var(--lagoon) !important;
      }

      #drawer .dash-drawer-link.on .dash-drawer-ico{
        background:var(--lagoon) !important;
        color:var(--bp-theme-contrast,#fff) !important;
        border-color:transparent !important;
      }

      /* ---------- STATUS COLOR SYSTEM ---------- */
      :where(
        .round-progress-state.not-started,.status-pill.not-started,
        .round-exemption-row-state.ready
      ){
        background:var(--bp-theme-surface-2,#f4fafd) !important;
        border-color:var(--line) !important;
        color:var(--muted) !important;
      }

      :where(
        .round-progress-state.in-progress,.round-progress-state.evaluating,
        .status-pill.in-progress,.review-remark-state.progress,.dash-live-status.draft
      ){
        background:rgba(var(--bp-accent-rgb),.11) !important;
        border-color:rgba(var(--bp-accent-rgb),.38) !important;
        color:var(--lagoon-deep) !important;
      }

      :where(
        .round-progress-state.submitted,.round-progress-state.completed,
        .status-pill.submitted,.review-remark-state.submitted,.dash-live-status.submitted
      ){
        background:rgba(39,128,79,.13) !important;
        border-color:rgba(54,151,94,.32) !important;
        color:#27804f !important;
      }

      html[data-bp-theme="dark"] :where(
        .round-progress-state.submitted,.round-progress-state.completed,
        .status-pill.submitted,.review-remark-state.submitted,.dash-live-status.submitted
      ),
      html[data-bp-theme="amoled"] :where(
        .round-progress-state.submitted,.round-progress-state.completed,
        .status-pill.submitted,.review-remark-state.submitted,.dash-live-status.submitted
      ){
        color:#73d99e !important;
        background:rgba(39,128,79,.16) !important;
        border-color:rgba(79,178,119,.38) !important;
      }

      :where(
        .round-progress-state.exempted,.round-exempted-state,
        .round-exemption-row-state.active
      ){
        background:rgba(190,137,38,.13) !important;
        border-color:rgba(190,137,38,.34) !important;
        color:#8d641a !important;
      }

      html[data-bp-theme="dark"] :where(
        .round-progress-state.exempted,.round-exempted-state,
        .round-exemption-row-state.active
      ),
      html[data-bp-theme="amoled"] :where(
        .round-progress-state.exempted,.round-exempted-state,
        .round-exemption-row-state.active
      ){
        color:#e9bd70 !important;
        background:rgba(190,137,38,.16) !important;
        border-color:rgba(222,176,82,.42) !important;
      }

      .archived-note{
        border-radius:var(--bp-radius-md) !important;
      }

      /* ---------- DARK / AMOLED LEGACY SURFACES ---------- */
      html[data-bp-theme="dark"] :where(
        .whobar,.prog-wrap,.review-summary-card,.review-remark-card,
        .res-row,.his-row,.his-date-sum,.his-date-body,
        .round-progress-person,.round-drilldown-panel,.round-drilldown-assignment,
        .team-average-evaluator-card,.team-average-stat,
        .performer-record,.staff-profile-stat,.staff-profile-progress-card,
        .bp-select-btn,.bp-select-menu,.bp-select-option,.lay-tr,.lay-menu,.lay-opt
      ),
      html[data-bp-theme="amoled"] :where(
        .whobar,.prog-wrap,.review-summary-card,.review-remark-card,
        .res-row,.his-row,.his-date-sum,.his-date-body,
        .round-progress-person,.round-drilldown-panel,.round-drilldown-assignment,
        .team-average-evaluator-card,.team-average-stat,
        .performer-record,.staff-profile-stat,.staff-profile-progress-card,
        .bp-select-btn,.bp-select-menu,.bp-select-option,.lay-tr,.lay-menu,.lay-opt
      ){
        background:var(--bp-theme-surface-2) !important;
        border-color:var(--line) !important;
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] :where(
        .res-nm,.his-nm,.round-progress-name,.team-average-evaluator-name,
        .performer-record-date,.staff-profile-progress-title
      ),
      html[data-bp-theme="amoled"] :where(
        .res-nm,.his-nm,.round-progress-name,.team-average-evaluator-name,
        .performer-record-date,.staff-profile-progress-title
      ){
        color:var(--ink) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] :where(
        .his-meta,.round-progress-meta,.team-average-evaluator-sub,
        .performer-record-meta,.staff-profile-progress-note
      ),
      html[data-bp-theme="amoled"] :where(
        .his-meta,.round-progress-meta,.team-average-evaluator-sub,
        .performer-record-meta,.staff-profile-progress-note
      ){
        color:var(--muted) !important;
        opacity:1 !important;
      }



      /* ---------- FULLY CUSTOM THEMED ROLE DROPDOWN ---------- */
      #mgrPanel .bp-role-select-wrap{
        position:relative !important;
        width:100% !important;
        min-width:0 !important;
      }

      #mgrPanel .bp-role-native{
        position:absolute !important;
        width:1px !important;
        height:1px !important;
        opacity:0 !important;
        pointer-events:none !important;
      }

      #mgrPanel .bp-role-trigger{
        width:100% !important;
        min-height:42px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:space-between !important;
        gap:10px !important;
        padding:0 11px 0 12px !important;
        border:1px solid var(--line) !important;
        border-radius:12px !important;
        background:var(--panel,#fff) !important;
        color:var(--ink) !important;
        font:inherit !important;
        font-size:12px !important;
        font-weight:800 !important;
        text-align:left !important;
        cursor:pointer !important;
        box-shadow:0 8px 22px -19px rgba(8,52,76,.55) !important;
      }

      #mgrPanel .bp-role-trigger:hover{
        border-color:rgba(var(--bp-accent-rgb),.48) !important;
      }

      #mgrPanel .bp-role-select-wrap.is-open .bp-role-trigger,
      #mgrPanel .bp-role-trigger:focus-visible{
        outline:none !important;
        border-color:rgba(var(--bp-accent-rgb),.88) !important;
        box-shadow:
          0 0 0 3px rgba(var(--bp-accent-rgb),.18),
          0 10px 26px -19px rgba(var(--bp-accent-rgb),.82) !important;
      }

      #mgrPanel .bp-role-chevron{
        width:16px !important;
        height:16px !important;
        flex:0 0 16px !important;
        transition:transform .16s ease !important;
      }

      #mgrPanel .bp-role-select-wrap.is-open .bp-role-chevron{
        transform:rotate(180deg) !important;
      }

      #mgrPanel .bp-role-menu{
        position:absolute !important;
        z-index:9999 !important;
        top:calc(100% + 5px) !important;
        left:0 !important;
        right:0 !important;
        display:none !important;
        padding:5px !important;
        border:1px solid var(--line) !important;
        border-radius:12px !important;
        background:var(--panel,#fff) !important;
        color:var(--ink) !important;
        box-shadow:0 20px 46px -24px rgba(8,52,76,.62) !important;
        overflow:hidden !important;
      }

      #mgrPanel .bp-role-select-wrap.is-open .bp-role-menu{
        display:block !important;
      }

      #mgrPanel .bp-role-option{
        width:100% !important;
        min-height:36px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:space-between !important;
        gap:10px !important;
        padding:7px 9px !important;
        border:0 !important;
        border-radius:8px !important;
        background:transparent !important;
        color:var(--ink) !important;
        font:inherit !important;
        font-size:12px !important;
        font-weight:750 !important;
        text-align:left !important;
        cursor:pointer !important;
        box-shadow:none !important;
      }

      #mgrPanel .bp-role-option:hover,
      #mgrPanel .bp-role-option:focus-visible{
        outline:none !important;
        background:rgba(var(--bp-accent-rgb),.10) !important;
      }

      #mgrPanel .bp-role-option.is-selected{
        background:rgba(var(--bp-accent-rgb),.18) !important;
        color:var(--lagoon-deep) !important;
      }

      #mgrPanel .bp-role-check{
        width:16px !important;
        height:16px !important;
        opacity:0 !important;
        flex:0 0 16px !important;
      }

      #mgrPanel .bp-role-option.is-selected .bp-role-check{
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] #mgrPanel .bp-role-trigger,
      html[data-bp-theme="dark"] #mgrPanel .bp-role-menu,
      html[data-bp-theme="amoled"] #mgrPanel .bp-role-trigger,
      html[data-bp-theme="amoled"] #mgrPanel .bp-role-menu{
        background:var(--bp-theme-surface-2) !important;
        border-color:rgba(var(--bp-accent-rgb),.32) !important;
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] #mgrPanel .bp-role-menu,
      html[data-bp-theme="amoled"] #mgrPanel .bp-role-menu{
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.025),
          0 24px 54px -24px rgba(0,0,0,.95) !important;
      }

      html[data-bp-theme="dark"] #mgrPanel .bp-role-option,
      html[data-bp-theme="amoled"] #mgrPanel .bp-role-option{
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] #mgrPanel .bp-role-option:hover,
      html[data-bp-theme="dark"] #mgrPanel .bp-role-option:focus-visible,
      html[data-bp-theme="amoled"] #mgrPanel .bp-role-option:hover,
      html[data-bp-theme="amoled"] #mgrPanel .bp-role-option:focus-visible{
        background:rgba(var(--bp-accent-rgb),.11) !important;
      }

      html[data-bp-theme="dark"] #mgrPanel .bp-role-option.is-selected,
      html[data-bp-theme="amoled"] #mgrPanel .bp-role-option.is-selected{
        background:rgba(var(--bp-accent-rgb),.20) !important;
        color:var(--ink) !important;
      }

      /* ---------- ROLE SELECT / NATIVE DROPDOWN THEME MATCH ---------- */
      :where(.mgr-sel, .mgr select, #mgrPanel select){
        color-scheme:light;
        min-height:42px !important;
        padding:0 38px 0 12px !important;
        border:1px solid var(--line) !important;
        border-radius:var(--bp-radius-md) !important;
        background:var(--panel,#fff) !important;
        color:var(--ink) !important;
        font:inherit !important;
        font-size:12px !important;
        font-weight:750 !important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.08),
          0 8px 20px -18px rgba(8,52,76,.5) !important;
      }

      :where(.mgr-sel, .mgr select, #mgrPanel select):hover{
        border-color:rgba(var(--bp-accent-rgb),.42) !important;
      }

      :where(.mgr-sel, .mgr select, #mgrPanel select):focus{
        outline:none !important;
        border-color:rgba(var(--bp-accent-rgb),.78) !important;
        box-shadow:
          0 0 0 3px rgba(var(--bp-accent-rgb),.16),
          0 8px 22px -18px rgba(var(--bp-accent-rgb),.7) !important;
      }

      :where(.mgr-sel, .mgr select, #mgrPanel select) option{
        background:#fff;
        color:#152330;
        font-weight:650;
      }

      :where(.mgr-sel, .mgr select, #mgrPanel select) option:checked{
        background:rgba(var(--bp-accent-rgb),.16);
        color:#152330;
      }

      html[data-bp-theme="dark"] :where(.mgr-sel, .mgr select, #mgrPanel select),
      html[data-bp-theme="amoled"] :where(.mgr-sel, .mgr select, #mgrPanel select){
        color-scheme:dark;
        background:var(--bp-theme-surface-2) !important;
        border-color:rgba(var(--bp-accent-rgb),.34) !important;
        color:var(--ink) !important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.025),
          0 10px 24px -20px rgba(0,0,0,.95) !important;
      }

      html[data-bp-theme="dark"] :where(.mgr-sel, .mgr select, #mgrPanel select):focus,
      html[data-bp-theme="amoled"] :where(.mgr-sel, .mgr select, #mgrPanel select):focus{
        border-color:rgba(var(--bp-accent-rgb),.9) !important;
        box-shadow:
          0 0 0 3px rgba(var(--bp-accent-rgb),.20),
          0 12px 28px -20px rgba(var(--bp-accent-rgb),.85) !important;
      }

      html[data-bp-theme="dark"] :where(.mgr-sel, .mgr select, #mgrPanel select) option,
      html[data-bp-theme="amoled"] :where(.mgr-sel, .mgr select, #mgrPanel select) option{
        background:var(--bp-theme-surface-2) !important;
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] :where(.mgr-sel, .mgr select, #mgrPanel select) option:checked,
      html[data-bp-theme="amoled"] :where(.mgr-sel, .mgr select, #mgrPanel select) option:checked{
        background:rgba(var(--bp-accent-rgb),.22) !important;
        color:var(--ink) !important;
      }

      /* ---------- DROPDOWN CONSISTENCY ---------- */
      :where(.bp-select-btn,.lay-tr,.mgr-sel,select){
        min-height:42px;
      }

      :where(.bp-select-menu,.lay-menu){
        padding:6px !important;
      }

      :where(.bp-select-option,.lay-opt){
        min-height:40px !important;
        border-radius:var(--bp-radius-sm) !important;
      }

      :where(.bp-select-option,.lay-opt):hover{
        background:rgba(var(--bp-accent-rgb),.08) !important;
      }

      :where(.bp-select-option[aria-selected="true"],.lay-opt[aria-selected="true"]){
        background:rgba(var(--bp-accent-rgb),.13) !important;
        color:var(--ink) !important;
      }

      /* ---------- LONG NAME SAFETY ---------- */
      :where(
        .dash-person,.dash-rank-name,.dash-live-names b,.mgr-nm,.res-nm,.his-nm,
        .round-progress-name,.team-average-evaluator-name,.staff-profile-name,
        .performer-records-person
      ){
        overflow-wrap:anywhere !important;
        word-break:normal !important;
      }

      /* ---------- EMPTY STATES ---------- */
      :where(
        .mgr-empty,.res-empty,.his-empty,.round-drilldown-empty,
        .team-average-empty,.staff-profile-empty,.performer-records-empty
      ){
        min-height:58px !important;
        display:flex !important;
        align-items:center !important;
        gap:10px !important;
        padding:12px !important;
        border:1px dashed var(--line) !important;
        border-radius:var(--bp-radius-md) !important;
        background:var(--bp-theme-surface-2,#f4fafd) !important;
        color:var(--muted) !important;
      }

      :where(
        .mgr-empty,.res-empty,.his-empty,.round-drilldown-empty,
        .team-average-empty,.staff-profile-empty,.performer-records-empty
      )::before{
        content:"—";
        flex:0 0 28px;
        width:28px;
        height:28px;
        display:grid;
        place-items:center;
        border-radius:9px;
        background:rgba(var(--bp-accent-rgb),.09);
        color:var(--lagoon-deep);
        font-weight:900;
      }

      /* ---------- SETTINGS / SECTION SEPARATORS ---------- */
      #accountSettingsModal .account-settings-body{
        gap:16px !important;
      }

      #accountSettingsModal .settings-section{
        border-color:var(--line) !important;
      }

      #accountSettingsModal .settings-divider{
        border-color:var(--line) !important;
        opacity:.75;
      }

      /* ---------- ACCENT CONTRAST SAFETY ---------- */
      :where(
        .dash-head-btn,.settings-btn-primary,.btn.primary,.btn.save,
        .dash-drawer-link.on .dash-drawer-ico,
        .dlg-foot .ok,.round-exemption-stacked-primary
      ){
        color:var(--bp-theme-contrast,#fff) !important;
      }




      /* ---------- SIDEBAR FIXED TOP + SCROLLABLE MIDDLE + FIXED BOTTOM ---------- */
      #drawer{
        position:fixed !important;
        top:0 !important;
        bottom:0 !important;
        height:100dvh !important;
        max-height:100dvh !important;
        display:flex !important;
        flex-direction:column !important;
        overflow:hidden !important;
      }

      #drawer .bp-drawer-fixed-top{
        flex:0 0 auto !important;
        position:relative !important;
        z-index:520 !important;
        background:var(--panel,#fff) !important;
        border-bottom:1px solid var(--line) !important;
        box-shadow:0 16px 28px -28px rgba(8,52,76,.55) !important;
      }

      #drawer .bp-drawer-middle{
        flex:1 1 auto !important;
        min-height:0 !important;
        overflow-y:auto !important;
        overflow-x:visible !important;
        overscroll-behavior:contain !important;
        -webkit-overflow-scrolling:touch !important;
        padding-top:10px !important;
        padding-bottom:14px !important;
      }

      #drawer #acct{
        flex:0 0 auto !important;
        position:relative !important;
        inset:auto !important;
        margin-top:0 !important;
        z-index:520 !important;
        background:var(--panel,#fff) !important;
        border-top:1px solid var(--line) !important;
        box-shadow:0 -18px 28px -26px rgba(8,52,76,.55) !important;
      }

      html[data-bp-theme="dark"] #drawer .bp-drawer-fixed-top,
      html[data-bp-theme="amoled"] #drawer .bp-drawer-fixed-top,
      html[data-bp-theme="dark"] #drawer #acct,
      html[data-bp-theme="amoled"] #drawer #acct{
        background:var(--bp-theme-surface-1,var(--panel)) !important;
      }

      html[data-bp-theme="dark"] #drawer .bp-drawer-fixed-top,
      html[data-bp-theme="amoled"] #drawer .bp-drawer-fixed-top{
        box-shadow:0 16px 34px -26px rgba(0,0,0,.92) !important;
      }

      html[data-bp-theme="dark"] #drawer #acct,
      html[data-bp-theme="amoled"] #drawer #acct{
        box-shadow:0 -18px 34px -24px rgba(0,0,0,.92) !important;
      }

      #drawer :where(.bp-role-menu,.lay-menu){
        z-index:760 !important;
      }

      @media(max-width:760px){
        #drawer,
        #drawer .bp-drawer-middle{
          max-height:100dvh !important;
        }
      }


      /* ---------- SIDEBAR VIEWPORT LAYOUT ---------- */
      #drawer{
        position:fixed !important;
        top:0 !important;
        bottom:0 !important;
        height:100dvh !important;
        max-height:100dvh !important;
        display:flex !important;
        flex-direction:column !important;
        overflow:hidden !important;
      }

      #drawer .bp-drawer-scroll{
        flex:1 1 auto !important;
        min-height:0 !important;
        overflow-y:auto !important;
        overflow-x:visible !important;
        overscroll-behavior:contain !important;
        -webkit-overflow-scrolling:touch !important;
        padding-bottom:14px !important;
      }

      #drawer #acct{
        position:relative !important;
        inset:auto !important;
        flex:0 0 auto !important;
        margin-top:0 !important;
        padding-top:12px !important;
        padding-bottom:max(10px,env(safe-area-inset-bottom)) !important;
        background:var(--panel,#fff) !important;
        border-top:1px solid var(--line) !important;
        box-shadow:0 -18px 28px -26px rgba(8,52,76,.55) !important;
        z-index:500 !important;
      }

      html[data-bp-theme="dark"] #drawer #acct,
      html[data-bp-theme="amoled"] #drawer #acct{
        background:var(--bp-theme-surface-1,var(--panel)) !important;
        box-shadow:0 -18px 34px -24px rgba(0,0,0,.92) !important;
      }

      #drawer :where(.bp-role-menu,.lay-menu){
        z-index:700 !important;
      }

      @media(max-width:760px){
        #drawer{
          height:100dvh !important;
          max-height:100dvh !important;
        }

        #drawer #acct{
          padding-bottom:max(12px,env(safe-area-inset-bottom)) !important;
        }
      }


      /* ---------- FIXED ACCOUNT BLOCK AT SIDEBAR BOTTOM ---------- */
      #drawer{
        display:flex !important;
        flex-direction:column !important;
        min-height:0 !important;
        overflow-y:auto !important;
        overflow-x:visible !important;
      }

      #drawer #acct{
        position:sticky !important;
        bottom:0 !important;
        z-index:120 !important;
        flex:0 0 auto !important;
        margin-top:auto !important;
        padding-top:12px !important;
        padding-bottom:max(10px,env(safe-area-inset-bottom)) !important;
        background:var(--panel,#fff) !important;
        border-top:1px solid var(--line) !important;
        box-shadow:
          0 -18px 28px -26px rgba(8,52,76,.55) !important;
      }

      /* Keep expanded menus above the fixed account block. */
      #drawer :where(.bp-role-select-wrap,.lay-wrap,.mgr-sec){
        position:relative;
      }

      #drawer :where(.bp-role-menu,.lay-menu){
        z-index:240 !important;
      }

      html[data-bp-theme="dark"] #drawer #acct,
      html[data-bp-theme="amoled"] #drawer #acct{
        background:var(--bp-theme-surface-1,var(--panel)) !important;
        border-top-color:var(--line) !important;
        box-shadow:
          0 -18px 34px -24px rgba(0,0,0,.92) !important;
      }

      /* Give scrolling sidebar content enough room so its last item
         is never hidden underneath the pinned account controls. */
      #drawer #mgrPanel{
        padding-bottom:10px !important;
      }

      @media(max-width:760px){
        #drawer #acct{
          bottom:0 !important;
          padding-bottom:max(12px,env(safe-area-inset-bottom)) !important;
        }
      }


      /* ---------- REDUCE BOX-IN-BOX NESTING ---------- */
      #drawer #acct,
      #drawer #mgrPanel{
        box-shadow:none !important;
      }

      #drawer #acct .acct-row{
        background:transparent !important;
        border:0 !important;
        box-shadow:none !important;
      }

      .mgr-panel-body{
        box-shadow:none !important;
      }

      /* ---------- MOBILE MODAL + VIEWPORT POLISH ---------- */
      @media(max-width:760px){
        :where(
          .account-settings-dialog,.staff-add-dialog,.performer-records-dialog,
          .team-average-dialog,.round-progress-dialog,.round-exemption-dialog,
          .staff-profile-card,.dlg,.rm-box
        ){
          width:min(94vw,520px) !important;
          max-height:calc(100dvh - 24px) !important;
          margin:max(12px,env(safe-area-inset-top)) auto max(12px,env(safe-area-inset-bottom)) !important;
        }

        :where(
          .account-settings-body,.staff-add-body,.performer-records-body,
          .team-average-body,.round-progress-body,.round-exemption-body,.staff-profile-body
        ){
          overscroll-behavior:contain !important;
          -webkit-overflow-scrolling:touch !important;
        }

        .dash-metrics,
        .dash-grid{
          gap:12px !important;
        }

        :where(.dash-metric,.dash-panel-card){
          border-radius:14px !important;
        }
      }

      /* ---------- TABLE / NARROW LAPTOP POLISH ---------- */
      @media(min-width:761px) and (max-width:1180px){
        .wrap{padding-left:18px !important;padding-right:18px !important}
        .dash-metrics{grid-template-columns:repeat(2,minmax(0,1fr)) !important}
        .dash-grid{grid-template-columns:1fr !important}
      }

      /* ---------- PRINT DASHBOARD POLISH ---------- */
      @media print{
        body.bp-print-dashboard{
          background:#fff !important;
          color:#111 !important;
        }

        body.bp-print-dashboard header.top{
          background:#fff !important;
          color:#111 !important;
          border:1px solid #bbb !important;
          box-shadow:none !important;
        }

        body.bp-print-dashboard :where(
          .dash-metric,.dash-panel-card,.dash-date-chip,.dash-tag
        ){
          background:#fff !important;
          color:#111 !important;
          border-color:#ccc !important;
          box-shadow:none !important;
        }

        body.bp-print-dashboard :where(
          .dash-section-kicker,.dash-metric-label,.dash-metric-foot,
          .dash-rank-meta,.dash-live-meta
        ){
          color:#555 !important;
        }

        body.bp-print-dashboard :where(.dash-metric,.dash-panel-card){
          break-inside:avoid !important;
          page-break-inside:avoid !important;
        }

        body.bp-print-dashboard .dash-grid{
          grid-template-columns:1fr 1fr !important;
          gap:10mm !important;
        }
      }

      @media(prefers-reduced-motion:reduce){
        *,*::before,*::after{
          scroll-behavior:auto !important;
          animation-duration:.001ms !important;
          animation-iteration-count:1 !important;
          transition-duration:.001ms !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function replaceSidebarIcons(){
    const home = document.querySelector("#drawerDashboard .dash-drawer-ico");
    const evalIcon = document.querySelector("#drawerEvaluation .dash-drawer-ico");

    if(home && !home.querySelector("svg")){
      home.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 11.5 12 4l9 7.5"/>
          <path d="M5.5 10.5V20h13v-9.5"/>
          <path d="M9.5 20v-5.5h5V20"/>
        </svg>`;
    }

    if(evalIcon && !evalIcon.querySelector("svg")){
      evalIcon.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="4" y="3" width="16" height="18" rx="2"/>
          <path d="M8 8h8M8 12h8M8 16h5"/>
        </svg>`;
    }
  }


  function closeRoleDropdowns(except){
    document.querySelectorAll("#mgrPanel .bp-role-select-wrap.is-open").forEach(wrap => {
      if(wrap !== except){
        wrap.classList.remove("is-open");
        const btn = wrap.querySelector(".bp-role-trigger");
        if(btn) btn.setAttribute("aria-expanded","false");
      }
    });
  }

  function buildRoleDropdown(select){
    if(!select || select.dataset.bpRoleEnhanced === "1") return;
    if(select.closest(".bp-role-select-wrap")) return;

    select.dataset.bpRoleEnhanced = "1";
    select.classList.add("bp-role-native");

    const wrap = document.createElement("div");
    wrap.className = "bp-role-select-wrap";

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "bp-role-trigger";
    trigger.setAttribute("aria-haspopup","listbox");
    trigger.setAttribute("aria-expanded","false");
    trigger.innerHTML = `
      <span class="bp-role-value"></span>
      <svg class="bp-role-chevron" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2.4" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true">
        <path d="m7 10 5 5 5-5"/>
      </svg>`;

    const menu = document.createElement("div");
    menu.className = "bp-role-menu";
    menu.setAttribute("role","listbox");

    select.parentNode.insertBefore(wrap,select);
    wrap.appendChild(select);
    wrap.appendChild(trigger);
    wrap.appendChild(menu);

    function sync(){
      const value = trigger.querySelector(".bp-role-value");
      const selected = select.options[select.selectedIndex];
      value.textContent = selected ? selected.textContent : "";

      menu.innerHTML = "";
      [...select.options].forEach((opt,index) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "bp-role-option" + (index === select.selectedIndex ? " is-selected" : "");
        item.setAttribute("role","option");
        item.setAttribute("aria-selected", index === select.selectedIndex ? "true" : "false");
        item.innerHTML = `
          <span></span>
          <svg class="bp-role-check" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
            stroke-linejoin="round" aria-hidden="true">
            <path d="m5 12 4 4L19 6"/>
          </svg>`;
        item.querySelector("span").textContent = opt.textContent;

        item.addEventListener("click",() => {
          if(select.selectedIndex !== index){
            select.selectedIndex = index;
            select.dispatchEvent(new Event("change",{bubbles:true}));
          }
          sync();
          wrap.classList.remove("is-open");
          trigger.setAttribute("aria-expanded","false");
          trigger.focus();
        });

        menu.appendChild(item);
      });
    }

    trigger.addEventListener("click",event => {
      event.stopPropagation();
      const opening = !wrap.classList.contains("is-open");
      closeRoleDropdowns(wrap);
      wrap.classList.toggle("is-open",opening);
      trigger.setAttribute("aria-expanded",opening ? "true" : "false");
    });

    select.addEventListener("change",sync);
    sync();
  }

  function enhanceRoleDropdowns(){
    document.querySelectorAll("#mgrPanel select").forEach(buildRoleDropdown);
  }

  function watchRoleDropdowns(){
    const panel = document.getElementById("mgrPanel");
    if(!panel || panel.dataset.bpRoleWatch === "1") return;
    panel.dataset.bpRoleWatch = "1";

    const observer = new MutationObserver(() => enhanceRoleDropdowns());
    observer.observe(panel,{childList:true,subtree:true});
  }

  document.addEventListener("click",() => closeRoleDropdowns());
  document.addEventListener("keydown",event => {
    if(event.key === "Escape") closeRoleDropdowns();
  });


  function structureDrawerForFixedAccount(){
    const drawer = document.getElementById("drawer");
    const acct = drawer?.querySelector("#acct");
    if(!drawer || !acct) return;

    if(drawer.querySelector(".bp-drawer-fixed-top") && drawer.querySelector(".bp-drawer-middle")) return;

    // Unwrap the previous single scroll wrapper if present.
    const oldScroll = drawer.querySelector(".bp-drawer-scroll");
    if(oldScroll){
      [...oldScroll.children].forEach(child => drawer.insertBefore(child, oldScroll));
      oldScroll.remove();
    }

    const top = document.createElement("div");
    top.className = "bp-drawer-fixed-top";

    const middle = document.createElement("div");
    middle.className = "bp-drawer-middle";

    const drawerTop = drawer.querySelector(".drawer-top");
    const nav = drawer.querySelector(".dash-drawer-nav");

    if(drawerTop) top.appendChild(drawerTop);
    if(nav) top.appendChild(nav);

    const remaining = [...drawer.children].filter(child =>
      child !== top &&
      child !== middle &&
      child !== acct &&
      child !== drawerTop &&
      child !== nav
    );

    remaining.forEach(child => middle.appendChild(child));

    drawer.insertBefore(top, drawer.firstChild);
    drawer.insertBefore(middle, acct);
  }

  function enhance(){
    structureDrawerForFixedAccount();
    installStyles();
    replaceSidebarIcons();
    enhanceRoleDropdowns();
    watchRoleDropdowns();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded",enhance,{once:true});
  }else{
    enhance();
  }

  // Appearance CSS is injected dynamically by account-appearance.js.
  // Re-append our style when the selected theme changes so this remains the final layer.
  const htmlObserver = new MutationObserver(mutations => {
    if(mutations.some(m => m.type === "attributes" && m.attributeName === "data-bp-theme")){
      queueMicrotask(installStyles);
    }
  });
  htmlObserver.observe(document.documentElement,{attributes:true,attributeFilter:["data-bp-theme"]});
})();
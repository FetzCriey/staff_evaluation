(() => {
  const STYLE_ID = "bpUiPolishHotfix";

  function installPolish() {
    const old = document.getElementById(STYLE_ID);
    if (old) old.remove();

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      /* =====================================================
         RESET COLOR BUTTON — DESKTOP + MOBILE
         ===================================================== */
      .bp-accent-reset{
        min-height:42px !important;
        display:inline-flex !important;
        align-items:center !important;
        justify-content:center !important;
        gap:8px !important;
        padding:10px 16px !important;
        border:1.5px solid rgba(var(--bp-accent-rgb,21,172,227),.38) !important;
        border-radius:12px !important;
        background:linear-gradient(
          180deg,
          rgba(var(--bp-accent-rgb,21,172,227),.12),
          rgba(var(--bp-accent-rgb,21,172,227),.045)
        ) !important;
        color:var(--ink-soft) !important;
        font:inherit !important;
        font-size:12px !important;
        font-weight:800 !important;
        letter-spacing:.01em !important;
        cursor:pointer !important;
        box-shadow:
          inset 0 1px 0 rgba(255,255,255,.06),
          0 9px 22px -17px rgba(var(--bp-accent-rgb,21,172,227),.9) !important;
        opacity:1 !important;
        transition:.16s ease !important;
      }

      .bp-accent-reset::before{
        content:"↺";
        font-size:16px;
        line-height:1;
        font-weight:900;
      }

      .bp-accent-reset:hover:not(:disabled){
        transform:translateY(-1px) !important;
        border-color:rgba(var(--bp-accent-rgb,21,172,227),.72) !important;
        background:linear-gradient(
          180deg,
          rgba(var(--bp-accent-rgb,21,172,227),.20),
          rgba(var(--bp-accent-rgb,21,172,227),.08)
        ) !important;
        color:var(--ink) !important;
      }

      .bp-accent-reset:disabled{
        opacity:.45 !important;
        cursor:not-allowed !important;
        box-shadow:none !important;
      }

      /* =====================================================
         SHARED DARK / AMOLED POPUP SURFACES
         ===================================================== */
      html[data-bp-theme="dark"] :where(
        .performer-records-dialog,
        .team-average-dialog,
        .team-evaluator-dialog,
        .round-progress-dialog,
        .staff-profile-card,
        .dlg,
        .rm-box
      ),
      html[data-bp-theme="amoled"] :where(
        .performer-records-dialog,
        .team-average-dialog,
        .team-evaluator-dialog,
        .round-progress-dialog,
        .staff-profile-card,
        .dlg,
        .rm-box
      ){
        background:var(--panel) !important;
        color:var(--ink) !important;
        border-color:var(--bp-card-border,var(--line)) !important;
      }

      /* =====================================================
         TOP / OVERALL PERFORMER POPUPS
         ===================================================== */
      html[data-bp-theme="dark"] :where(
        .performer-records-body,
        .performer-records-stat,
        .performer-record
      ),
      html[data-bp-theme="amoled"] :where(
        .performer-records-body,
        .performer-records-stat,
        .performer-record
      ){
        background:var(--panel) !important;
        color:var(--ink) !important;
        border-color:var(--bp-card-border,var(--line)) !important;
      }

      html[data-bp-theme="dark"] .performer-record.latest,
      html[data-bp-theme="amoled"] .performer-record.latest{
        background:var(--bp-theme-surface-2) !important;
        border-color:rgba(var(--bp-accent-rgb),.55) !important;
      }

      html[data-bp-theme="dark"] :where(
        .performer-records-stat-value,
        .performer-record-date,
        .performer-record-score,
        .performer-records-section-title
      ),
      html[data-bp-theme="amoled"] :where(
        .performer-records-stat-value,
        .performer-record-date,
        .performer-record-score,
        .performer-records-section-title
      ){
        color:var(--ink) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] :where(
        .performer-records-stat-label,
        .performer-records-stat-unit,
        .performer-record-meta,
        .performer-record-score span
      ),
      html[data-bp-theme="amoled"] :where(
        .performer-records-stat-label,
        .performer-records-stat-unit,
        .performer-record-meta,
        .performer-record-score span
      ){
        color:var(--muted) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] .performer-record-round,
      html[data-bp-theme="amoled"] .performer-record-round{
        background:var(--bp-theme-surface-3) !important;
        color:var(--lagoon-deep) !important;
      }

      html[data-bp-theme="dark"] .performer-record-bar,
      html[data-bp-theme="amoled"] .performer-record-bar{
        background:var(--bp-theme-surface-3) !important;
      }

      /* =====================================================
         TEAM AVERAGE + EVALUATOR AVERAGES POPUPS
         ===================================================== */
      html[data-bp-theme="dark"] :where(
        .team-average-body,
        .team-average-stat,
        .team-average-chart-shell,
        .team-evaluator-popup-body,
        .team-evaluator-popup-stat,
        .team-evaluator-row
      ),
      html[data-bp-theme="amoled"] :where(
        .team-average-body,
        .team-average-stat,
        .team-average-chart-shell,
        .team-evaluator-popup-body,
        .team-evaluator-popup-stat,
        .team-evaluator-row
      ){
        background:var(--panel) !important;
        color:var(--ink) !important;
        border-color:var(--bp-card-border,var(--line)) !important;
      }

      html[data-bp-theme="dark"] :where(
        .team-average-stat-value,
        .team-average-section-title,
        .team-evaluator-popup-stat strong,
        .team-evaluator-popup-section-title,
        .team-evaluator-name,
        .team-evaluator-score
      ),
      html[data-bp-theme="amoled"] :where(
        .team-average-stat-value,
        .team-average-section-title,
        .team-evaluator-popup-stat strong,
        .team-evaluator-popup-section-title,
        .team-evaluator-name,
        .team-evaluator-score
      ){
        color:var(--ink) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] :where(
        .team-average-stat-label,
        .team-average-stat-unit,
        .team-evaluator-popup-stat span,
        .team-evaluator-meta
      ),
      html[data-bp-theme="amoled"] :where(
        .team-average-stat-label,
        .team-average-stat-unit,
        .team-evaluator-popup-stat span,
        .team-evaluator-meta
      ){
        color:var(--muted) !important;
        opacity:1 !important;
      }

      /* Chart remains readable in dark modes instead of a bright white block. */
      html[data-bp-theme="dark"] .team-average-chart-shell,
      html[data-bp-theme="amoled"] .team-average-chart-shell{
        background:var(--bp-theme-surface-2) !important;
      }

      html[data-bp-theme="dark"] .team-average-grid,
      html[data-bp-theme="amoled"] .team-average-grid{
        stroke:var(--line) !important;
      }

      html[data-bp-theme="dark"] .team-average-axis-text,
      html[data-bp-theme="dark"] .team-average-value,
      html[data-bp-theme="amoled"] .team-average-axis-text,
      html[data-bp-theme="amoled"] .team-average-value{
        fill:var(--ink-soft) !important;
      }

      /* =====================================================
         CURRENT ROUND / EVALUATOR PROGRESS POPUP
         ===================================================== */
      html[data-bp-theme="dark"] :where(
        .round-progress-body,
        .round-progress-summary-card,
        .round-progress-person,
        .round-drilldown-panel,
        .round-drilldown-assignment,
        .round-drilldown-loading,
        .round-drilldown-error,
        .round-drilldown-empty
      ),
      html[data-bp-theme="amoled"] :where(
        .round-progress-body,
        .round-progress-summary-card,
        .round-progress-person,
        .round-drilldown-panel,
        .round-drilldown-assignment,
        .round-drilldown-loading,
        .round-drilldown-error,
        .round-drilldown-empty
      ){
        background:var(--panel) !important;
        color:var(--ink) !important;
        border-color:var(--bp-card-border,var(--line)) !important;
      }

      html[data-bp-theme="dark"] :where(
        .round-progress-name,
        .round-progress-line strong,
        .round-drilldown-title,
        .round-drilldown-name
      ),
      html[data-bp-theme="amoled"] :where(
        .round-progress-name,
        .round-progress-line strong,
        .round-drilldown-title,
        .round-drilldown-name
      ){
        color:var(--ink) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] :where(
        .round-progress-meta,
        .round-progress-line,
        .round-drilldown-meta
      ),
      html[data-bp-theme="amoled"] :where(
        .round-progress-meta,
        .round-progress-line,
        .round-drilldown-meta
      ){
        color:var(--muted) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] :where(
        .round-progress-track,
        .round-drilldown-bar
      ),
      html[data-bp-theme="amoled"] :where(
        .round-progress-track,
        .round-drilldown-bar
      ){
        background:var(--bp-theme-surface-3) !important;
      }

      /* Preserve status meanings but make them dark-theme compatible. */
      html[data-bp-theme="dark"] .round-progress-summary-card.not-started,
      html[data-bp-theme="amoled"] .round-progress-summary-card.not-started{
        background:var(--bp-theme-surface-2) !important;
        border-color:var(--line) !important;
      }

      html[data-bp-theme="dark"] .round-progress-summary-card.evaluating,
      html[data-bp-theme="amoled"] .round-progress-summary-card.evaluating{
        background:rgba(var(--bp-accent-rgb),.12) !important;
        border-color:rgba(var(--bp-accent-rgb),.52) !important;
      }

      html[data-bp-theme="dark"] .round-progress-summary-card.completed,
      html[data-bp-theme="amoled"] .round-progress-summary-card.completed{
        background:rgba(39,128,79,.14) !important;
        border-color:rgba(79,178,119,.38) !important;
      }

      /* =====================================================
         STAFF PROFILE POPUP
         ===================================================== */
      html[data-bp-theme="dark"] :where(
        .staff-profile-body,
        .staff-profile-stat,
        .staff-profile-progress-card,
        .staff-profile-empty
      ),
      html[data-bp-theme="amoled"] :where(
        .staff-profile-body,
        .staff-profile-stat,
        .staff-profile-progress-card,
        .staff-profile-empty
      ){
        background:var(--panel) !important;
        color:var(--ink) !important;
        border-color:var(--bp-card-border,var(--line)) !important;
      }

      html[data-bp-theme="dark"] :where(
        .staff-profile-stat-value,
        .staff-profile-progress-title,
        .staff-profile-history-score
      ),
      html[data-bp-theme="amoled"] :where(
        .staff-profile-stat-value,
        .staff-profile-progress-title,
        .staff-profile-history-score
      ){
        color:var(--ink) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] :where(
        .staff-profile-stat-label,
        .staff-profile-stat-unit,
        .staff-profile-progress-note,
        .staff-profile-history-date
      ),
      html[data-bp-theme="amoled"] :where(
        .staff-profile-stat-label,
        .staff-profile-stat-unit,
        .staff-profile-progress-note,
        .staff-profile-history-date
      ){
        color:var(--muted) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] .staff-profile-history-bar,
      html[data-bp-theme="dark"] .staff-profile-progress-track,
      html[data-bp-theme="amoled"] .staff-profile-history-bar,
      html[data-bp-theme="amoled"] .staff-profile-progress-track{
        background:var(--bp-theme-surface-3) !important;
      }

      /* =====================================================
         EVALUATION SINGLE-EVALUATOR HEADER / NAV / TOTALS
         ===================================================== */
      html[data-bp-theme="dark"] :where(.evhead,.evnav),
      html[data-bp-theme="amoled"] :where(.evhead,.evnav){
        background:var(--bp-theme-surface-2) !important;
        color:var(--ink) !important;
        border-color:var(--line) !important;
      }

      html[data-bp-theme="dark"] :where(.evlbl,.evprog),
      html[data-bp-theme="amoled"] :where(.evlbl,.evprog){
        color:var(--muted) !important;
      }

      html[data-bp-theme="dark"] .evwho,
      html[data-bp-theme="amoled"] .evwho{
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] .evnav .btn.ghost,
      html[data-bp-theme="amoled"] .evnav .btn.ghost{
        background:var(--bp-theme-surface-3) !important;
        border-color:var(--line) !important;
        color:var(--ink) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] .evnav .btn.ghost:disabled,
      html[data-bp-theme="amoled"] .evnav .btn.ghost:disabled{
        opacity:.42 !important;
      }

      /* =====================================================
         CLEAR SCORES DIALOG
         ===================================================== */
      html[data-bp-theme="dark"] :where(.dlg-top,.rm-top),
      html[data-bp-theme="amoled"] :where(.dlg-top,.rm-top){
        background:var(--panel) !important;
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] .dlg-ttl,
      html[data-bp-theme="amoled"] .dlg-ttl{
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] .dlg-msg,
      html[data-bp-theme="amoled"] .dlg-msg{
        color:var(--ink-soft) !important;
      }

      html[data-bp-theme="dark"] :where(.dlg-foot,.rm-foot),
      html[data-bp-theme="amoled"] :where(.dlg-foot,.rm-foot){
        background:var(--bp-theme-surface-2) !important;
        border-color:var(--line) !important;
      }

      html[data-bp-theme="dark"] .dlg-foot .cancel,
      html[data-bp-theme="amoled"] .dlg-foot .cancel{
        background:var(--bp-theme-surface-3) !important;
        border-color:var(--line) !important;
        color:var(--ink) !important;
      }

      /* =====================================================
         MOBILE WIDTH / OVERFLOW
         ===================================================== */
      @media(max-width:680px){
        html,body{
          max-width:100% !important;
          overflow-x:hidden !important;
        }

        :where(
          .wrap,.shell,.main,#formView,#dashboardView,.panel,.scroll,
          #grid,#body,.comment,.actions,.totals,#singleWrap,#rows
        ){
          width:100% !important;
          max-width:100% !important;
          min-width:0 !important;
          box-sizing:border-box !important;
        }

        #formView{
          overflow-x:hidden !important;
        }

        .totals{
          justify-content:stretch !important;
          gap:10px !important;
          padding:14px !important;
        }

        .totals .interp{
          flex:1 0 100% !important;
          margin-left:0 !important;
          text-align:center !important;
        }

        .tcard{
          flex:1 1 calc(50% - 5px) !important;
          min-width:0 !important;
          text-align:center !important;
          padding:12px 10px !important;
        }

        .actions{
          display:grid !important;
          grid-template-columns:repeat(2,minmax(0,1fr)) !important;
          gap:10px !important;
        }

        .actions .btn{
          width:100% !important;
          min-width:0 !important;
          max-width:100% !important;
          padding:13px 10px !important;
          font-size:13px !important;
          white-space:normal !important;
        }

        .actions .status{
          grid-column:1 / -1 !important;
        }

        .bp-accent-reset{
          min-width:138px !important;
        }
      }

      @media(max-width:430px){
        .actions{
          grid-template-columns:1fr !important;
        }

        .tcard{
          flex-basis:100% !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function boot(){
    installPolish();

    // Some feature modules inject their own CSS after page load.
    // Re-append our hotfix so it stays last in the cascade.
    setTimeout(installPolish, 100);
    setTimeout(installPolish, 500);
    setTimeout(installPolish, 1200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once:true });
  } else {
    boot();
  }
})();
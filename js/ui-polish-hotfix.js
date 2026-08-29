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

      /* Selected evaluation/history rows must stay dark */
      html[data-bp-theme="dark"] :where(.res-row,.res-row.on,.res-row.selected,.res-row.active,.his-row,.his-row.on,.his-row.selected,.his-row.active),
      html[data-bp-theme="amoled"] :where(.res-row,.res-row.on,.res-row.selected,.res-row.active,.his-row,.his-row.on,.his-row.selected,.his-row.active){
        background:var(--bp-theme-surface-2) !important;
        color:var(--ink) !important;
        border-color:var(--line) !important;
      }

      html[data-bp-theme="dark"] :where(.res-row.on,.res-row.selected,.res-row.active,.his-row.on,.his-row.selected,.his-row.active),
      html[data-bp-theme="amoled"] :where(.res-row.on,.res-row.selected,.res-row.active,.his-row.on,.his-row.selected,.his-row.active){
        background:rgba(var(--bp-accent-rgb),.12) !important;
        border-color:rgba(var(--bp-accent-rgb),.55) !important;
        box-shadow:inset 3px 0 0 var(--lagoon) !important;
      }

      html[data-bp-theme="dark"] :where(.res-nm,.his-nm),
      html[data-bp-theme="amoled"] :where(.res-nm,.his-nm){
        color:var(--ink) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] :where(.res-ct,.his-meta),
      html[data-bp-theme="amoled"] :where(.res-ct,.his-meta){
        color:var(--muted) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] :where(.res-bar,.his-bar),
      html[data-bp-theme="amoled"] :where(.res-bar,.his-bar){
        background:var(--bp-theme-surface-3) !important;
      }

      /* Read-only evaluation result cards */
      html[data-bp-theme="dark"] :where(.review-summary-card,.review-remark-card,.result-card,.results-card,.evaluation-result-card,.preview-card,#cards .card,#cards .ccard,.criterion-card,.criteria-card),
      html[data-bp-theme="amoled"] :where(.review-summary-card,.review-remark-card,.result-card,.results-card,.evaluation-result-card,.preview-card,#cards .card,#cards .ccard,.criterion-card,.criteria-card){
        background:var(--panel) !important;
        color:var(--ink) !important;
        border-color:var(--bp-card-border,var(--line)) !important;
      }

      @media(max-width:680px){
        html[data-bp-theme="dark"] #grid #body tr,
        html[data-bp-theme="amoled"] #grid #body tr{
          background:var(--panel) !important;
          color:var(--ink) !important;
          border-color:var(--bp-card-border,var(--line)) !important;
        }
        html[data-bp-theme="dark"] #grid #body td,
        html[data-bp-theme="amoled"] #grid #body td{
          background:transparent !important;
          color:var(--ink) !important;
          border-color:var(--line) !important;
        }
        html[data-bp-theme="dark"] #grid #body :where(.crit-name,.crit-title),
        html[data-bp-theme="amoled"] #grid #body :where(.crit-name,.crit-title){
          color:var(--ink) !important;
          opacity:1 !important;
        }
        html[data-bp-theme="dark"] #grid #body :where(.crit-desc,.crit-description),
        html[data-bp-theme="amoled"] #grid #body :where(.crit-desc,.crit-description){
          color:var(--muted) !important;
          opacity:1 !important;
        }
      }

      /* Team Average dot -> Evaluator averages popup */
      html[data-bp-theme="dark"] :where(.team-evaluator-popup-body > *,.team-evaluator-list > *,[class*="team-evaluator"][class*="row"],[class*="team-evaluator"][class*="item"],[class*="team-evaluator"][class*="card"]),
      html[data-bp-theme="amoled"] :where(.team-evaluator-popup-body > *,.team-evaluator-list > *,[class*="team-evaluator"][class*="row"],[class*="team-evaluator"][class*="item"],[class*="team-evaluator"][class*="card"]){
        background:var(--panel) !important;
        border-color:var(--bp-card-border,var(--line)) !important;
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] :where([class*="team-evaluator"] strong,[class*="team-evaluator"] b,[class*="team-evaluator"][class*="name"],[class*="team-evaluator"][class*="score"]),
      html[data-bp-theme="amoled"] :where([class*="team-evaluator"] strong,[class*="team-evaluator"] b,[class*="team-evaluator"][class*="name"],[class*="team-evaluator"][class*="score"]){
        color:var(--ink) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] :where([class*="team-evaluator"] span,[class*="team-evaluator"][class*="meta"]),
      html[data-bp-theme="amoled"] :where([class*="team-evaluator"] span,[class*="team-evaluator"][class*="meta"]){
        color:var(--muted) !important;
      }

      /* Clear scores button readability */
      #resetBtn{
        border:1.5px solid #c84b4b !important;
        background:linear-gradient(180deg,#df5a54,#b92f2f) !important;
        color:#fff !important;
        box-shadow:0 10px 24px -12px rgba(185,47,47,.7) !important;
        opacity:1 !important;
      }
      #resetBtn:hover:not(:disabled){
        background:linear-gradient(180deg,#e96b65,#c53b3b) !important;
        color:#fff !important;
        border-color:#e16a65 !important;
      }
      #resetBtn:disabled{
        background:var(--bp-theme-surface-3,#e9eef2) !important;
        color:var(--muted,#7b8790) !important;
        border-color:var(--line,#c9dfee) !important;
        box-shadow:none !important;
        opacity:.7 !important;
      }
      html[data-bp-theme="amoled"] #resetBtn:disabled,
      html[data-bp-theme="dark"] #resetBtn:disabled{
        background:var(--bp-theme-surface-3) !important;
        color:var(--ink-soft) !important;
        border-color:var(--line) !important;
        opacity:.72 !important;
      }

      /* Not started readability */
      html[data-bp-theme="dark"] :where(.round-progress-state.not-started,.round-drilldown-badge.not-started),
      html[data-bp-theme="amoled"] :where(.round-progress-state.not-started,.round-drilldown-badge.not-started){
        background:var(--bp-theme-surface-3) !important;
        color:var(--ink-soft) !important;
        border-color:var(--line) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] :where(.round-progress-person.not-started,.round-drilldown-assignment.not-started),
      html[data-bp-theme="amoled"] :where(.round-progress-person.not-started,.round-drilldown-assignment.not-started){
        background:var(--panel) !important;
        color:var(--ink) !important;
        border-color:var(--line) !important;
      }

      html[data-bp-theme="dark"] .round-progress-summary-card.not-started :where(strong,span),
      html[data-bp-theme="amoled"] .round-progress-summary-card.not-started :where(strong,span){
        color:var(--ink-soft) !important;
      }


      /* =====================================================
         EXACT ROOT-CAUSE FIXES — AMOLED / DARK
         ===================================================== */

      /* dashboard-result-selection-state.js injects:
         body.suppress-result-selection #resList .res-row.on {
           background:#fff !important;
         }
         Match and exceed that specificity so theme wins. */
      html[data-bp-theme="dark"] body.suppress-result-selection #resList .res-row.on,
      html[data-bp-theme="amoled"] body.suppress-result-selection #resList .res-row.on{
        background:var(--bp-theme-surface-2) !important;
        border-color:var(--line) !important;
        color:var(--ink) !important;
        box-shadow:none !important;
      }

      html[data-bp-theme="dark"] body.suppress-result-selection #resList .res-row.on:hover,
      html[data-bp-theme="amoled"] body.suppress-result-selection #resList .res-row.on:hover{
        background:var(--bp-theme-surface-3) !important;
        border-color:var(--lagoon) !important;
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] body.suppress-result-selection #resList .res-row.on .res-nm,
      html[data-bp-theme="amoled"] body.suppress-result-selection #resList .res-row.on .res-nm{
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] body.suppress-result-selection #resList .res-row.on .res-ct,
      html[data-bp-theme="amoled"] body.suppress-result-selection #resList .res-row.on .res-ct{
        color:var(--muted) !important;
      }

      /* index.css contains a later generic .panel,.card { background:#fff }.
         In dark themes every ordinary evaluation criterion card must follow
         the selected surface instead of the legacy white fallback. */
      html[data-bp-theme="dark"] body .card:not(.team-average-evaluator-card):not(.exempted),
      html[data-bp-theme="amoled"] body .card:not(.team-average-evaluator-card):not(.exempted){
        background:var(--panel) !important;
        border-color:var(--bp-card-border,var(--line)) !important;
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] body .card :where(.crit-name,.ctext,.nm),
      html[data-bp-theme="amoled"] body .card :where(.crit-name,.ctext,.nm){
        color:var(--ink) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] body .card :where(.crit-desc,.cpill),
      html[data-bp-theme="amoled"] body .card :where(.crit-desc,.cpill){
        color:var(--muted) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] body .card .cpill,
      html[data-bp-theme="amoled"] body .card .cpill{
        background:var(--bp-theme-surface-2) !important;
        border-color:var(--line) !important;
      }

      /* Exact classes used after tapping a Team Average graph point. */
      html[data-bp-theme="dark"] .team-average-evaluator-card:not(.exempted),
      html[data-bp-theme="amoled"] .team-average-evaluator-card:not(.exempted){
        background:var(--panel) !important;
        border-color:var(--bp-card-border,var(--line)) !important;
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] .team-average-evaluator-card:not(.exempted) .team-average-evaluator-name,
      html[data-bp-theme="dark"] .team-average-evaluator-card:not(.exempted) .team-average-evaluator-score,
      html[data-bp-theme="amoled"] .team-average-evaluator-card:not(.exempted) .team-average-evaluator-name,
      html[data-bp-theme="amoled"] .team-average-evaluator-card:not(.exempted) .team-average-evaluator-score{
        color:var(--ink) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] .team-average-evaluator-card:not(.exempted) .team-average-evaluator-meta,
      html[data-bp-theme="amoled"] .team-average-evaluator-card:not(.exempted) .team-average-evaluator-meta{
        color:var(--muted) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] .team-average-evaluator-card:not(.exempted) .team-average-evaluator-bar,
      html[data-bp-theme="amoled"] .team-average-evaluator-card:not(.exempted) .team-average-evaluator-bar{
        background:var(--bp-theme-surface-3) !important;
      }

      /* Keep exempted records intentionally warm, but make their copy readable. */
      html[data-bp-theme="dark"] .team-average-evaluator-card.exempted,
      html[data-bp-theme="amoled"] .team-average-evaluator-card.exempted{
        background:#171208 !important;
        border-color:#66552a !important;
      }

      html[data-bp-theme="dark"] .team-average-evaluator-card.exempted :where(.team-average-evaluator-name,.team-average-evaluator-meta),
      html[data-bp-theme="amoled"] .team-average-evaluator-card.exempted :where(.team-average-evaluator-name,.team-average-evaluator-meta){
        color:#e9d8aa !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] .team-average-evaluator-card.exempted .team-average-evaluator-reason,
      html[data-bp-theme="amoled"] .team-average-evaluator-card.exempted .team-average-evaluator-reason{
        background:#211a0c !important;
        border-color:#66552a !important;
        color:#e9d8aa !important;
      }

      /* Clear Scores: disabled must still be readable instead of faded cyan. */
      html[data-bp-theme="dark"] body #resetBtn:disabled,
      html[data-bp-theme="amoled"] body #resetBtn:disabled{
        background:var(--bp-theme-surface-3) !important;
        border:1.5px solid var(--line) !important;
        color:var(--ink-soft) !important;
        opacity:1 !important;
        box-shadow:none !important;
        filter:none !important;
      }

      html[data-bp-theme="dark"] body #resetBtn:not(:disabled),
      html[data-bp-theme="amoled"] body #resetBtn:not(:disabled){
        background:linear-gradient(180deg,#df5a54,#b92f2f) !important;
        border:1.5px solid #c84b4b !important;
        color:#fff !important;
        opacity:1 !important;
      }

      /* Not Started: no white pill in Dark/AMOLED. */
      html[data-bp-theme="dark"] body .round-progress-state.not-started,
      html[data-bp-theme="amoled"] body .round-progress-state.not-started,
      html[data-bp-theme="dark"] body .round-drilldown-badge.not-started,
      html[data-bp-theme="amoled"] body .round-drilldown-badge.not-started{
        background:var(--bp-theme-surface-3) !important;
        border-color:var(--line) !important;
        color:var(--ink-soft) !important;
        opacity:1 !important;
      }

      /* Disabled export/correction controls: retain readable labels. */
      html[data-bp-theme="dark"] body .actions .btn:disabled,
      html[data-bp-theme="amoled"] body .actions .btn:disabled{
        background:var(--bp-theme-surface-3) !important;
        border:1.5px solid var(--line) !important;
        color:var(--muted) !important;
        box-shadow:none !important;
        opacity:1 !important;
        filter:none !important;
      }

      /* Reset remains specially readable even inside the general disabled rule. */
      html[data-bp-theme="dark"] body .actions #resetBtn:disabled,
      html[data-bp-theme="amoled"] body .actions #resetBtn:disabled{
        color:var(--ink-soft) !important;
      }


      /* =====================================================
         BUTTON THEME / CONTRAST — EXACT REMAINING STATES
         ===================================================== */

      /* All ordinary enabled action buttons follow the user's accent. */
      html[data-bp-theme] body .actions .btn:not(:disabled):not(#resetBtn),
      html[data-bp-theme] body .settings-btn-primary:not(:disabled),
      html[data-bp-theme] body .btn-add:not(:disabled){
        background:linear-gradient(
          180deg,
          var(--lagoon),
          var(--lagoon-deep)
        ) !important;
        border-color:rgba(var(--bp-accent-rgb),.72) !important;
        color:var(--bp-theme-contrast,#fff) !important;
        opacity:1 !important;
        filter:none !important;
        box-shadow:0 10px 24px -10px rgba(var(--bp-accent-rgb),.58) !important;
      }

      /* Disabled buttons remain unmistakably disabled but still readable.
         Do NOT tint them bright accent, since that looks clickable. */
      html[data-bp-theme="dark"] body .actions .btn:disabled:not(#resetBtn),
      html[data-bp-theme="amoled"] body .actions .btn:disabled:not(#resetBtn){
        background:var(--bp-theme-surface-3) !important;
        border:1.5px solid var(--line) !important;
        color:var(--ink-soft) !important;
        opacity:1 !important;
        filter:none !important;
        text-shadow:none !important;
        box-shadow:none !important;
      }

      html[data-bp-theme="light"] body .actions .btn:disabled:not(#resetBtn){
        background:#e7eef3 !important;
        border:1.5px solid #c7d7e2 !important;
        color:#637583 !important;
        opacity:1 !important;
        filter:none !important;
        text-shadow:none !important;
        box-shadow:none !important;
      }

      /* Clear/reset remains destructive red when enabled. */
      html[data-bp-theme] body #resetBtn:not(:disabled),
      html[data-bp-theme] body .btn.danger:not(:disabled),
      html[data-bp-theme] body .danger:not(:disabled){
        background:linear-gradient(180deg,#e65c56,#c62f2f) !important;
        border-color:#d84a45 !important;
        color:#fff !important;
        opacity:1 !important;
        box-shadow:0 10px 24px -11px rgba(198,47,47,.72) !important;
      }

      /* Confirm / alert dialog button rows.
         Primary action follows selected site color instead of hard-coded cyan. */
      html[data-bp-theme] body :where(.dlg-foot,.rm-foot,.confirm-actions,.modal-actions)
        button:not(.cancel):not(.danger):not([data-danger]):not(.destructive){
        background:linear-gradient(
          180deg,
          var(--lagoon),
          var(--lagoon-deep)
        ) !important;
        border:1.5px solid rgba(var(--bp-accent-rgb),.75) !important;
        color:var(--bp-theme-contrast,#fff) !important;
        opacity:1 !important;
        box-shadow:0 8px 20px -10px rgba(var(--bp-accent-rgb),.65) !important;
      }

      /* Generic uiConfirm-style dialogs sometimes have no named footer class.
         Target the buttons inside the dialog, while excluding close/X controls. */
      html[data-bp-theme] body [role="dialog"]
        button:not(.cancel):not(.danger):not([data-danger]):not(.destructive)
        :not(svg){
        opacity:1;
      }

      html[data-bp-theme] body [role="dialog"] button:not(
        .account-settings-close,
        .staff-add-close,
        .performer-records-close,
        .team-average-close,
        .team-evaluator-popup-close,
        .round-progress-close,
        .staff-profile-close,
        .x,
        .cancel,
        .danger,
        .destructive
      ):not([data-danger]):not(:disabled){
        color:var(--bp-theme-contrast,#fff) !important;
      }

      /* Explicit common OK/Confirm/Restore button classes. */
      html[data-bp-theme] body [role="dialog"] :where(
        .ok,.confirm,.restore,.primary,.confirm-btn,.ok-btn,.restore-btn
      ):not(:disabled){
        background:linear-gradient(
          180deg,
          var(--lagoon),
          var(--lagoon-deep)
        ) !important;
        border-color:rgba(var(--bp-accent-rgb),.75) !important;
        color:var(--bp-theme-contrast,#fff) !important;
        opacity:1 !important;
      }

      /* Cancel should never be a bright white unreadable slab in dark/AMOLED. */
      html[data-bp-theme="dark"] body [role="dialog"] :where(
        .cancel,.cancel-btn,[data-cancel]
      ),
      html[data-bp-theme="amoled"] body [role="dialog"] :where(
        .cancel,.cancel-btn,[data-cancel]
      ){
        background:var(--bp-theme-surface-3) !important;
        border:1.5px solid var(--line) !important;
        color:var(--ink-soft) !important;
        opacity:1 !important;
        box-shadow:none !important;
        filter:none !important;
      }

      html[data-bp-theme="light"] body [role="dialog"] :where(
        .cancel,.cancel-btn,[data-cancel]
      ){
        background:#f4f8fb !important;
        border:1.5px solid #c9dfee !important;
        color:#28455c !important;
        opacity:1 !important;
        box-shadow:none !important;
      }

      /* Dialog destructive action remains red, independent of accent. */
      html[data-bp-theme] body [role="dialog"] :where(
        .danger,.danger-btn,.destructive,[data-danger]
      ):not(:disabled){
        background:linear-gradient(180deg,#e65c56,#c62f2f) !important;
        border-color:#d84a45 !important;
        color:#fff !important;
        opacity:1 !important;
      }

      /* Any disabled dialog button must still have legible copy. */
      html[data-bp-theme="dark"] body [role="dialog"] button:disabled,
      html[data-bp-theme="amoled"] body [role="dialog"] button:disabled{
        background:var(--bp-theme-surface-3) !important;
        border-color:var(--line) !important;
        color:var(--ink-soft) !important;
        opacity:1 !important;
        filter:none !important;
        box-shadow:none !important;
      }

      /* In-progress / submitted status chips are labels, not buttons.
         Keep readable with the current custom accent. */
      html[data-bp-theme] body :where(
        .review-remark-status.in-progress,
        .review-status.in-progress,
        .status-pill.in-progress
      ){
        color:var(--lagoon) !important;
        border-color:rgba(var(--bp-accent-rgb),.65) !important;
        background:rgba(var(--bp-accent-rgb),.10) !important;
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

    const headObserver = new MutationObserver(() => {
      const hotfix = document.getElementById(STYLE_ID);
      if(hotfix && hotfix !== document.head.lastElementChild){
        document.head.appendChild(hotfix);
      }
    });
    headObserver.observe(document.head,{childList:true});
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once:true });
  } else {
    boot();
  }
})();
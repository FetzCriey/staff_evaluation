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


      /* =====================================================
         STAFF EXEMPTION STACKED CONFIRM — EXACT BUTTON CLASSES
         ===================================================== */

      html[data-bp-theme] body .round-exemption-stacked-primary:not(:disabled){
        background:linear-gradient(
          180deg,
          var(--lagoon),
          var(--lagoon-deep)
        ) !important;
        border:1.5px solid rgba(var(--bp-accent-rgb),.78) !important;
        color:var(--bp-theme-contrast,#fff) !important;
        opacity:1 !important;
        filter:none !important;
        box-shadow:0 9px 22px -11px rgba(var(--bp-accent-rgb),.72) !important;
      }

      html[data-bp-theme="dark"] body .round-exemption-stacked-secondary,
      html[data-bp-theme="amoled"] body .round-exemption-stacked-secondary{
        background:var(--bp-theme-surface-3) !important;
        border:1.5px solid var(--line) !important;
        color:var(--ink-soft) !important;
        opacity:1 !important;
        filter:none !important;
        box-shadow:none !important;
      }

      html[data-bp-theme="light"] body .round-exemption-stacked-secondary{
        background:#f4f8fb !important;
        border:1.5px solid #c9dfee !important;
        color:#28455c !important;
        opacity:1 !important;
        box-shadow:none !important;
      }

      html[data-bp-theme] body .round-exemption-stacked-primary:hover:not(:disabled){
        filter:brightness(1.07) !important;
        border-color:var(--lagoon) !important;
      }

      html[data-bp-theme="dark"] body .round-exemption-stacked-secondary:hover,
      html[data-bp-theme="amoled"] body .round-exemption-stacked-secondary:hover{
        background:rgba(var(--bp-accent-rgb),.10) !important;
        border-color:rgba(var(--bp-accent-rgb),.5) !important;
        color:var(--ink) !important;
      }

      /* =====================================================
         MOBILE SCROLL STABILITY
         - no smooth programmatic page movement
         - stop scroll anchoring from moving the viewport while
           dynamic score/progress/result content updates
         - keep normal vertical finger scrolling
         ===================================================== */
      @media(max-width:760px){
        html{
          scroll-behavior:auto !important;
        }

        body{
          overflow-x:hidden !important;
          overflow-y:visible !important;
        }

        body :where(
          #formView,
          #dashboardView,
          .main,
          .panel,
          #singleWrap,
          #rows,
          #cards,
          .comment,
          .actions,
          .totals,
          .prog-wrap,
          .review-remarks,
          .team-average-dialog,
          .team-evaluator-dialog,
          .round-progress-dialog,
          .staff-profile-card
        ){
          overflow-anchor:none !important;
        }

        /* A little real bottom breathing room prevents the final button/card
           from sitting exactly under the dynamic mobile browser toolbar. */
        #formView,
        #dashboardView{
          padding-bottom:max(36px, env(safe-area-inset-bottom)) !important;
        }

        .actions{
          margin-bottom:max(18px, env(safe-area-inset-bottom)) !important;
        }
      }


      /* =====================================================
         ADD STAFF — EXACT CUSTOM DROPDOWN THEME
         ===================================================== */

      html[data-bp-theme="dark"] body .staff-add-dialog,
      html[data-bp-theme="amoled"] body .staff-add-dialog{
        background:var(--panel) !important;
        border-color:var(--bp-card-border,var(--line)) !important;
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] body .staff-add-body,
      html[data-bp-theme="amoled"] body .staff-add-body,
      html[data-bp-theme="dark"] body .staff-add-form,
      html[data-bp-theme="amoled"] body .staff-add-form{
        background:transparent !important;
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] body .staff-add-form :where(input,select),
      html[data-bp-theme="amoled"] body .staff-add-form :where(input,select){
        background:var(--bp-theme-input) !important;
        border-color:var(--line) !important;
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] body .staff-add-form :where(input,select):focus,
      html[data-bp-theme="amoled"] body .staff-add-form :where(input,select):focus{
        background:var(--bp-theme-input) !important;
        border-color:var(--lagoon) !important;
        color:var(--ink) !important;
      }

      /* These are the visible custom controls, not the hidden native selects. */
      html[data-bp-theme="dark"] body .staff-add-form .bp-select-btn,
      html[data-bp-theme="amoled"] body .staff-add-form .bp-select-btn{
        background:var(--bp-theme-input) !important;
        border-color:var(--line) !important;
        color:var(--ink) !important;
        box-shadow:none !important;
      }

      html[data-bp-theme="dark"] body .staff-add-form .bp-select-btn:hover,
      html[data-bp-theme="amoled"] body .staff-add-form .bp-select-btn:hover{
        background:var(--bp-theme-surface-2) !important;
        border-color:var(--lagoon) !important;
      }

      html[data-bp-theme="dark"] body .staff-add-form .bp-select.open .bp-select-btn,
      html[data-bp-theme="dark"] body .staff-add-form .bp-select-btn:focus-visible,
      html[data-bp-theme="amoled"] body .staff-add-form .bp-select.open .bp-select-btn,
      html[data-bp-theme="amoled"] body .staff-add-form .bp-select-btn:focus-visible{
        background:var(--bp-theme-input) !important;
        border-color:var(--lagoon) !important;
        color:var(--ink) !important;
        box-shadow:0 0 0 3px rgba(var(--bp-accent-rgb),.16) !important;
      }

      html[data-bp-theme="dark"] body .staff-add-form .bp-select-label,
      html[data-bp-theme="amoled"] body .staff-add-form .bp-select-label{
        color:var(--ink) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] body .staff-add-form .bp-select-arrow,
      html[data-bp-theme="amoled"] body .staff-add-form .bp-select-arrow{
        border-color:var(--lagoon) !important;
      }

      html[data-bp-theme="dark"] body .staff-add-form .bp-select-menu,
      html[data-bp-theme="amoled"] body .staff-add-form .bp-select-menu{
        background:var(--bp-theme-surface-2) !important;
        border-color:var(--line) !important;
        box-shadow:0 18px 38px -20px rgba(0,0,0,.86) !important;
      }

      html[data-bp-theme="dark"] body .staff-add-form .bp-select-option,
      html[data-bp-theme="amoled"] body .staff-add-form .bp-select-option{
        background:transparent !important;
        color:var(--ink-soft) !important;
      }

      html[data-bp-theme="dark"] body .staff-add-form .bp-select-option:hover,
      html[data-bp-theme="dark"] body .staff-add-form .bp-select-option.focused,
      html[data-bp-theme="amoled"] body .staff-add-form .bp-select-option:hover,
      html[data-bp-theme="amoled"] body .staff-add-form .bp-select-option.focused{
        background:rgba(var(--bp-accent-rgb),.12) !important;
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] body .staff-add-form .bp-select-option.selected,
      html[data-bp-theme="amoled"] body .staff-add-form .bp-select-option.selected{
        background:rgba(var(--bp-accent-rgb),.18) !important;
        color:var(--lagoon) !important;
      }

      /* =====================================================
         MOBILE NATIVE SCROLL — DO NOT INTERCEPT TOUCH GESTURES
         ===================================================== */
      @media(max-width:760px){
        html{
          scroll-behavior:auto !important;
        }

        body{
          overflow-x:hidden !important;
          /* Intentionally no touch-action / overscroll override here.
             Let Android/Chrome handle normal momentum scrolling natively. */
        }

        .staff-add-dialog,
        .account-settings-dialog,
        .team-average-dialog,
        .team-evaluator-dialog,
        .round-progress-dialog{
          -webkit-overflow-scrolling:touch !important;
          touch-action:auto !important;
        }

        .staff-add-dialog{
          overscroll-behavior:contain !important;
        }
      }


      /* =====================================================
         CURRENT ROUND — EXEMPTED STAFF IN DARK / AMOLED
         ===================================================== */
      html[data-bp-theme="dark"] .round-exempted-person,
      html[data-bp-theme="amoled"] .round-exempted-person{
        background:rgba(138,100,29,.16) !important;
        border-color:rgba(236,217,166,.50) !important;
        color:var(--ink) !important;
        box-shadow:none !important;
      }

      html[data-bp-theme="dark"] .round-exempted-name,
      html[data-bp-theme="amoled"] .round-exempted-name{
        color:var(--ink) !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] .round-exempted-reason,
      html[data-bp-theme="amoled"] .round-exempted-reason,
      html[data-bp-theme="dark"] .round-exempted-note,
      html[data-bp-theme="amoled"] .round-exempted-note{
        color:#dccb9e !important;
        opacity:1 !important;
      }

      html[data-bp-theme="dark"] .round-exempted-avatar,
      html[data-bp-theme="amoled"] .round-exempted-avatar{
        background:rgba(138,100,29,.28) !important;
        border-color:rgba(236,217,166,.46) !important;
        color:#f2ddb0 !important;
        box-shadow:none !important;
      }

      html[data-bp-theme="dark"] .round-exempted-state,
      html[data-bp-theme="amoled"] .round-exempted-state{
        background:rgba(138,100,29,.28) !important;
        border-color:rgba(236,217,166,.50) !important;
        color:#f2d99a !important;
        opacity:1 !important;
      }


      /* =====================================================
         PREMIUM SIDEBAR — FINAL CASCADE FIX
         Loaded after account-appearance so theme CSS cannot
         turn the premium header back into the old dark banner.
         ===================================================== */
      #drawer.drawer{
        width:310px !important;
        max-width:88vw !important;
        padding:14px !important;
        gap:10px !important;
        background:var(--panel) !important;
        color:var(--ink) !important;
        border-right:1px solid var(--line) !important;
      }

      #drawer .drawer-top{
        padding:4px 2px 12px !important;
        background:transparent !important;
        color:var(--ink) !important;
        border:0 !important;
        box-shadow:none !important;
      }

      #drawer .drawer-brand{
        gap:10px !important;
      }

      #drawer .drawer-brand-logo{
        width:42px !important;
        height:42px !important;
        flex:0 0 42px !important;
        padding:4px !important;
        border:1px solid rgba(var(--bp-accent-rgb,21,172,227),.20) !important;
        border-radius:13px !important;
        background:#fff !important;
        box-shadow:0 8px 20px -14px rgba(8,52,76,.50) !important;
      }

      #drawer .drawer-brand-copy .t{
        color:var(--ink) !important;
        font-size:16px !important;
        font-weight:800 !important;
        opacity:1 !important;
      }

      #drawer .drawer-brand-copy .s{
        color:var(--muted) !important;
        font-size:9px !important;
        font-weight:700 !important;
        opacity:1 !important;
      }

      #drawer #drawerClose.x{
        width:40px !important;
        height:40px !important;
        flex:0 0 40px !important;
        display:grid !important;
        place-items:center !important;
        border:1px solid var(--line) !important;
        border-radius:13px !important;
        background:var(--bp-theme-surface-2,#f5f9fc) !important;
        color:var(--ink-soft) !important;
        box-shadow:none !important;
      }

      #drawer .dash-drawer-nav{
        display:flex !important;
        flex-direction:column !important;
        gap:7px !important;
        padding:0 0 10px !important;
        margin:0 !important;
        border-bottom:1px solid var(--line) !important;
      }

      #drawer .dash-drawer-link{
        min-height:49px !important;
        display:flex !important;
        align-items:center !important;
        gap:10px !important;
        width:100% !important;
        padding:7px 10px 7px 8px !important;
        border:1px solid transparent !important;
        border-radius:14px !important;
        background:transparent !important;
        color:var(--ink-soft) !important;
        font-weight:750 !important;
        text-transform:none !important;
        opacity:1 !important;
      }

      #drawer .dash-drawer-link::after{
        content:"›" !important;
        margin-left:auto !important;
        color:var(--muted) !important;
        font-size:21px !important;
        line-height:1 !important;
      }

      #drawer .dash-drawer-ico{
        width:36px !important;
        height:36px !important;
        flex:0 0 36px !important;
        display:grid !important;
        place-items:center !important;
        border:1px solid var(--line) !important;
        border-radius:11px !important;
        background:var(--bp-theme-surface-2,#f5f9fc) !important;
        color:var(--ink-soft) !important;
        opacity:1 !important;
      }

      #drawer .dash-drawer-link.on{
        background:rgba(var(--bp-accent-rgb,21,172,227),.10) !important;
        border-color:rgba(var(--bp-accent-rgb,21,172,227),.28) !important;
        color:var(--ink) !important;
        box-shadow:none !important;
      }

      #drawer .dash-drawer-link.on .dash-drawer-ico{
        background:linear-gradient(
          145deg,
          var(--lagoon,#15ace3),
          var(--lagoon-deep,#0b7fb0)
        ) !important;
        border-color:transparent !important;
        color:#fff !important;
      }

      /* The old criteria-view box is hidden on the dashboard.
         It still remains available when the evaluation form is active. */
      #drawer .lay{
        margin-top:0 !important;
      }

      #drawer #mgrPanel.mgr{
        margin-top:0 !important;
        padding:4px 0 0 !important;
        border-top:0 !important;
      }

      #drawer #mgrPanel > h3{
        margin:0 0 8px 4px !important;
        color:var(--muted) !important;
        font-size:9px !important;
        font-weight:850 !important;
        letter-spacing:.14em !important;
        opacity:1 !important;
      }

      #drawer .mgr-sec{
        margin:0 0 7px !important;
        padding:0 !important;
        border:0 !important;
        border-radius:14px !important;
        background:transparent !important;
        overflow:visible !important;
      }

      #drawer .mgr-sum,
      #drawer #openRoundExemptions,
      #drawer #openAddStaff{
        min-height:46px !important;
        width:100% !important;
        display:flex !important;
        align-items:center !important;
        gap:9px !important;
        padding:8px 10px !important;
        border:1px solid var(--line) !important;
        border-radius:13px !important;
        background:var(--panel) !important;
        color:var(--ink-soft) !important;
        font-family:inherit !important;
        font-size:11.5px !important;
        font-weight:750 !important;
        text-align:left !important;
        opacity:1 !important;
        visibility:visible !important;
        box-shadow:none !important;
      }

      #drawer .mgr-sum .lbl,
      #drawer #openAddStaff > span:last-child,
      #drawer .round-exemption-sidebar-label,
      #drawer .round-exemption-sidebar-kicker{
        color:inherit !important;
        opacity:1 !important;
        visibility:visible !important;
      }

      #drawer #openAddStaff{
        justify-content:flex-start !important;
      }

      #drawer #openAddStaff .mgr-add-launch-icon{
        width:32px !important;
        height:32px !important;
        flex:0 0 32px !important;
        display:grid !important;
        place-items:center !important;
        border:1px solid rgba(var(--bp-accent-rgb,21,172,227),.24) !important;
        border-radius:10px !important;
        background:rgba(var(--bp-accent-rgb,21,172,227),.09) !important;
        color:var(--lagoon-deep) !important;
        opacity:1 !important;
        visibility:visible !important;
      }

      #drawer #openAddStaff > span:last-child{
        display:block !important;
        color:var(--ink) !important;
        font-size:11.5px !important;
        font-weight:800 !important;
      }

      #drawer #openRoundExemptions{
        background:rgba(181,132,35,.055) !important;
        border-color:rgba(181,132,35,.24) !important;
      }

      #drawer .round-exemption-sidebar-kicker{
        color:var(--muted) !important;
        font-size:8px !important;
      }

      #drawer .round-exemption-sidebar-label{
        color:var(--ink) !important;
        font-size:11.5px !important;
      }

      #drawer .round-exemption-sidebar-count,
      #drawer .mgr-sum .cnt{
        flex:0 0 auto !important;
        min-width:26px !important;
        padding:3px 7px !important;
        border-radius:999px !important;
        color:var(--lagoon-deep) !important;
        background:rgba(var(--bp-accent-rgb,21,172,227),.09) !important;
        opacity:1 !important;
      }

      #drawer .mgr-panel-body{
        margin-top:6px !important;
        padding:8px !important;
        border:1px solid var(--line) !important;
        border-radius:12px !important;
        background:var(--bp-theme-surface-2,#f5f9fc) !important;
      }

      #drawer #acct.acct{
        margin-top:auto !important;
        padding:10px 0 0 !important;
        border-top:1px solid var(--line) !important;
      }

      #drawer .acct-row{
        padding:3px 2px 9px !important;
        border:0 !important;
        background:transparent !important;
      }

      #drawer .acct-settings-btn,
      #drawer #signOut.signout{
        min-height:44px !important;
        width:100% !important;
        display:flex !important;
        align-items:center !important;
        justify-content:flex-start !important;
        gap:10px !important;
        margin:0 0 7px !important;
        padding:9px 11px !important;
        border:1px solid var(--line) !important;
        border-radius:12px !important;
        box-shadow:none !important;
      }

      #drawer .acct-settings-btn{
        background:var(--bp-theme-surface-2,#f5f9fc) !important;
        color:var(--ink-soft) !important;
      }

      #drawer #signOut.signout{
        background:rgba(200,72,72,.055) !important;
        border-color:rgba(200,72,72,.20) !important;
        color:#c54f4f !important;
      }

      html[data-bp-theme="dark"] #drawer.drawer,
      html[data-bp-theme="amoled"] #drawer.drawer{
        background:var(--panel) !important;
      }

      html[data-bp-theme="dark"] #drawer .drawer-top,
      html[data-bp-theme="amoled"] #drawer .drawer-top{
        background:transparent !important;
      }

      html[data-bp-theme="dark"] #drawer :where(
        .mgr-sum,#openRoundExemptions,#openAddStaff
      ),
      html[data-bp-theme="amoled"] #drawer :where(
        .mgr-sum,#openRoundExemptions,#openAddStaff
      ){
        background:var(--bp-theme-surface-2) !important;
        color:var(--ink) !important;
        border-color:var(--line) !important;
      }

      html[data-bp-theme="dark"] #drawer #signOut.signout,
      html[data-bp-theme="amoled"] #drawer #signOut.signout{
        background:rgba(239,94,94,.08) !important;
        border-color:rgba(239,94,94,.22) !important;
        color:#ff9d9d !important;
      }

      @media(max-width:600px){
        #drawer.drawer{
          width:min(315px,88vw) !important;
          padding:12px !important;
          border-radius:0 20px 20px 0 !important;
        }
      }


      /* =====================================================
         SIDEBAR ACCOUNT SECTION — FLAT PREMIUM LAYOUT
         Remove the outer rounded account box so the profile
         and action rows read as separate menu items.
         ===================================================== */
      #drawer #acct.acct{
        margin-top:auto !important;
        padding:12px 0 0 !important;
        border-top:1px solid var(--line) !important;
        border-right:0 !important;
        border-bottom:0 !important;
        border-left:0 !important;
        border-radius:0 !important;
        background:transparent !important;
        box-shadow:none !important;
        overflow:visible !important;
      }

      #drawer #acct .acct-row{
        display:flex !important;
        align-items:center !important;
        gap:10px !important;
        padding:4px 2px 10px !important;
        margin:0 !important;
        border:0 !important;
        border-radius:0 !important;
        background:transparent !important;
        box-shadow:none !important;
      }

      #drawer #acct .acct-txt{
        min-width:0 !important;
      }

      #drawer #acct .acct-nm{
        color:var(--ink) !important;
        font-size:12.5px !important;
        font-weight:800 !important;
        line-height:1.25 !important;
        opacity:1 !important;
      }

      #drawer #acct .acct-rl{
        margin-top:2px !important;
        color:var(--muted) !important;
        font-size:10.5px !important;
        line-height:1.3 !important;
        opacity:1 !important;
      }

      #drawer #acct .avatar{
        width:38px !important;
        height:38px !important;
        flex:0 0 38px !important;
        border:0 !important;
        border-radius:11px !important;
        background:linear-gradient(
          145deg,
          var(--lagoon,#15ace3),
          var(--lagoon-deep,#0b7fb0)
        ) !important;
        color:#fff !important;
        box-shadow:0 8px 18px -12px rgba(var(--bp-accent-rgb,21,172,227),.9) !important;
      }

      #drawer #acct .acct-settings-btn,
      #drawer #acct #signOut.signout{
        width:100% !important;
        min-height:44px !important;
        display:flex !important;
        align-items:center !important;
        justify-content:flex-start !important;
        gap:10px !important;
        margin:0 0 7px !important;
        padding:9px 11px !important;
        border-radius:12px !important;
        box-shadow:none !important;
      }

      #drawer #acct .acct-settings-btn{
        border:1px solid var(--line) !important;
        background:var(--bp-theme-surface-2,#f5f9fc) !important;
        color:var(--ink-soft) !important;
      }

      #drawer #acct #signOut.signout{
        border:1px solid rgba(200,72,72,.20) !important;
        background:rgba(200,72,72,.055) !important;
        color:#c54f4f !important;
      }

      html[data-bp-theme="dark"] #drawer #acct.acct,
      html[data-bp-theme="amoled"] #drawer #acct.acct{
        background:transparent !important;
        border-top-color:var(--line) !important;
      }

      html[data-bp-theme="dark"] #drawer #acct .acct-settings-btn,
      html[data-bp-theme="amoled"] #drawer #acct .acct-settings-btn{
        background:var(--bp-theme-surface-2) !important;
        border-color:var(--line) !important;
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] #drawer #acct #signOut.signout,
      html[data-bp-theme="amoled"] #drawer #acct #signOut.signout{
        background:rgba(239,94,94,.08) !important;
        border-color:rgba(239,94,94,.22) !important;
        color:#ff9d9d !important;
      }


      /* =====================================================
         APPEARANCE — RESET COLOR BUTTON CONTRAST
         Keep the control readable in every theme, including
         the disabled/default-accent state.
         ===================================================== */
      .bp-accent-reset{
        min-height:42px !important;
        border:1.5px solid rgba(var(--bp-accent-rgb,21,172,227),.42) !important;
        border-radius:12px !important;
        background:rgba(var(--bp-accent-rgb,21,172,227),.10) !important;
        color:var(--ink) !important;
        font-weight:800 !important;
        opacity:1 !important;
        box-shadow:none !important;
      }

      .bp-accent-reset::before{
        color:currentColor !important;
        opacity:1 !important;
      }

      .bp-accent-reset:hover:not(:disabled){
        background:rgba(var(--bp-accent-rgb,21,172,227),.17) !important;
        border-color:rgba(var(--bp-accent-rgb,21,172,227),.68) !important;
        color:var(--ink) !important;
      }

      .bp-accent-reset:disabled{
        background:var(--bp-theme-surface-2,#f4fafd) !important;
        border-color:var(--line) !important;
        color:var(--muted) !important;
        opacity:.72 !important;
        cursor:not-allowed !important;
      }

      html[data-bp-theme="dark"] .bp-accent-reset,
      html[data-bp-theme="amoled"] .bp-accent-reset{
        background:rgba(var(--bp-accent-rgb,21,172,227),.14) !important;
        border-color:rgba(var(--bp-accent-rgb,21,172,227),.46) !important;
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] .bp-accent-reset:disabled,
      html[data-bp-theme="amoled"] .bp-accent-reset:disabled{
        background:var(--bp-theme-surface-2) !important;
        border-color:var(--line) !important;
        color:var(--muted) !important;
        opacity:.78 !important;
      }


      /* =====================================================
         APPEARANCE — PREMIUM REDESIGN
         Match the new card-style reference while preserving
         the existing theme/accent behavior.
         ===================================================== */
      #accountSettingsModal .bp-appearance-section{
        position:relative !important;
        gap:14px !important;
        padding:18px !important;
        border:1px solid var(--line) !important;
        border-radius:18px !important;
        background:
          linear-gradient(180deg,
            color-mix(in srgb,var(--panel) 96%,var(--lagoon) 4%),
            var(--panel)
          ) !important;
        box-shadow:0 14px 34px -28px rgba(8,52,76,.52) !important;
      }

      #accountSettingsModal .bp-appearance-section .settings-section-title{
        margin:0 !important;
        color:var(--ink) !important;
        font-family:"Bricolage Grotesque","Inter",sans-serif !important;
        font-size:18px !important;
        line-height:1.15 !important;
        font-weight:800 !important;
        letter-spacing:-.01em !important;
      }

      #accountSettingsModal .bp-appearance-help{
        margin:-7px 0 2px !important;
        color:var(--muted) !important;
        font-size:11.5px !important;
        line-height:1.45 !important;
      }

      #accountSettingsModal .bp-theme-choices{
        gap:10px !important;
      }

      #accountSettingsModal .bp-theme-choice{
        position:relative !important;
        min-height:92px !important;
        padding:10px !important;
        border:1.5px solid var(--line) !important;
        border-radius:14px !important;
        background:var(--bp-theme-surface-2) !important;
        color:var(--ink-soft) !important;
        box-shadow:0 7px 18px -17px rgba(8,52,76,.58) !important;
        transform:none !important;
      }

      #accountSettingsModal .bp-theme-choice:hover{
        border-color:rgba(var(--bp-accent-rgb,21,172,227),.56) !important;
        transform:translateY(-1px) !important;
      }

      #accountSettingsModal .bp-theme-choice[aria-pressed="true"]{
        border-color:var(--lagoon) !important;
        background:
          linear-gradient(180deg,
            rgba(var(--bp-accent-rgb,21,172,227),.08),
            var(--bp-theme-surface-2)
          ) !important;
        box-shadow:
          0 0 0 2px rgba(var(--bp-accent-rgb,21,172,227),.12),
          0 10px 24px -20px rgba(var(--bp-accent-rgb,21,172,227),.9) !important;
      }

      #accountSettingsModal .bp-theme-choice[aria-pressed="true"]::after{
        content:"✓" !important;
        position:absolute !important;
        right:9px !important;
        bottom:9px !important;
        width:21px !important;
        height:21px !important;
        display:grid !important;
        place-items:center !important;
        border-radius:50% !important;
        background:var(--lagoon) !important;
        color:var(--bp-theme-contrast,#fff) !important;
        font-size:13px !important;
        font-weight:900 !important;
        line-height:1 !important;
        box-shadow:0 5px 12px -8px rgba(var(--bp-accent-rgb,21,172,227),.95) !important;
      }

      #accountSettingsModal .bp-theme-preview{
        height:38px !important;
        padding:7px !important;
        gap:5px !important;
        border-radius:10px !important;
        border-color:rgba(127,147,161,.30) !important;
        align-items:center !important;
      }

      #accountSettingsModal .bp-theme-preview::before{
        width:54% !important;
        height:7px !important;
      }

      #accountSettingsModal .bp-theme-preview::after{
        width:30% !important;
        height:7px !important;
      }

      #accountSettingsModal .bp-theme-choice strong{
        padding-right:25px !important;
        color:var(--ink) !important;
        font-size:12px !important;
        line-height:1.1 !important;
        font-weight:800 !important;
      }

      #accountSettingsModal .bp-accent-label{
        margin-top:3px !important;
        color:var(--ink-soft) !important;
        font-size:10px !important;
        font-weight:850 !important;
        letter-spacing:.11em !important;
      }

      #accountSettingsModal .bp-accent-grid{
        display:grid !important;
        grid-template-columns:minmax(0,1fr) auto !important;
        gap:12px 14px !important;
        align-items:center !important;
        padding-top:2px !important;
      }

      #accountSettingsModal .bp-accent-row{
        grid-column:1 / -1 !important;
        grid-row:1 !important;
        grid-template-columns:repeat(8,minmax(30px,1fr)) !important;
        gap:8px !important;
        padding:6px 1px 12px !important;
        border-bottom:1px solid var(--line) !important;
      }

      #accountSettingsModal .bp-accent-swatch{
        width:34px !important;
        height:34px !important;
        border-radius:50% !important;
        border:2px solid rgba(255,255,255,.72) !important;
        box-shadow:
          0 0 0 1px rgba(78,104,123,.22),
          inset 0 0 0 1px rgba(255,255,255,.34) !important;
      }

      #accountSettingsModal .bp-accent-swatch:hover{
        transform:translateY(-1px) scale(1.06) !important;
      }

      #accountSettingsModal .bp-accent-swatch[aria-pressed="true"]{
        border-color:var(--panel) !important;
        box-shadow:
          0 0 0 2px var(--panel),
          0 0 0 4px var(--lagoon) !important;
      }

      #accountSettingsModal .bp-accent-grid::before{
        content:"Reset will restore the default Better Practice color." !important;
        grid-column:1 !important;
        grid-row:2 !important;
        max-width:210px !important;
        color:var(--muted) !important;
        font-size:10.5px !important;
        line-height:1.4 !important;
      }

      #accountSettingsModal .bp-accent-reset{
        grid-column:2 !important;
        grid-row:2 !important;
        align-self:center !important;
        justify-self:end !important;
        min-height:40px !important;
        padding:9px 15px !important;
        border:1.5px solid var(--lagoon) !important;
        border-radius:12px !important;
        background:rgba(var(--bp-accent-rgb,21,172,227),.08) !important;
        color:var(--lagoon-deep) !important;
        font-size:11px !important;
        font-weight:850 !important;
        opacity:1 !important;
        box-shadow:none !important;
      }

      #accountSettingsModal .bp-accent-reset::before{
        content:"↻" !important;
        margin-right:6px !important;
        color:currentColor !important;
        font-size:15px !important;
        font-weight:900 !important;
        line-height:1 !important;
      }

      #accountSettingsModal .bp-accent-reset:hover:not(:disabled){
        background:rgba(var(--bp-accent-rgb,21,172,227),.15) !important;
        border-color:var(--lagoon-deep) !important;
        color:var(--lagoon-deep) !important;
        transform:translateY(-1px) !important;
      }

      #accountSettingsModal .bp-accent-reset:disabled{
        background:var(--bp-theme-surface-2) !important;
        border-color:var(--line) !important;
        color:var(--ink-soft) !important;
        opacity:.68 !important;
        cursor:not-allowed !important;
      }

      html[data-bp-theme="dark"] #accountSettingsModal .bp-appearance-section,
      html[data-bp-theme="amoled"] #accountSettingsModal .bp-appearance-section{
        background:var(--panel) !important;
        border-color:var(--bp-card-border,var(--line)) !important;
      }

      html[data-bp-theme="dark"] #accountSettingsModal .bp-theme-choice,
      html[data-bp-theme="amoled"] #accountSettingsModal .bp-theme-choice{
        background:var(--bp-theme-surface-2) !important;
        border-color:var(--line) !important;
      }

      html[data-bp-theme="dark"] #accountSettingsModal .bp-theme-choice[aria-pressed="true"],
      html[data-bp-theme="amoled"] #accountSettingsModal .bp-theme-choice[aria-pressed="true"]{
        background:rgba(var(--bp-accent-rgb,21,172,227),.13) !important;
        border-color:var(--lagoon) !important;
      }

      html[data-bp-theme="dark"] #accountSettingsModal .bp-accent-reset,
      html[data-bp-theme="amoled"] #accountSettingsModal .bp-accent-reset{
        background:rgba(var(--bp-accent-rgb,21,172,227),.14) !important;
        border-color:rgba(var(--bp-accent-rgb,21,172,227),.58) !important;
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] #accountSettingsModal .bp-accent-reset:disabled,
      html[data-bp-theme="amoled"] #accountSettingsModal .bp-accent-reset:disabled{
        background:var(--bp-theme-surface-2) !important;
        border-color:var(--line) !important;
        color:var(--ink-soft) !important;
        opacity:.74 !important;
      }

      @media(max-width:600px){
        #accountSettingsModal .bp-appearance-section{
          padding:15px !important;
          border-radius:16px !important;
        }

        #accountSettingsModal .bp-theme-choice{
          min-height:84px !important;
          padding:9px !important;
        }

        #accountSettingsModal .bp-theme-preview{
          height:34px !important;
        }

        #accountSettingsModal .bp-accent-row{
          grid-template-columns:repeat(8,minmax(26px,1fr)) !important;
          gap:5px !important;
        }

        #accountSettingsModal .bp-accent-swatch{
          width:30px !important;
          height:30px !important;
        }

        #accountSettingsModal .bp-accent-grid{
          grid-template-columns:1fr !important;
          gap:9px !important;
        }

        #accountSettingsModal .bp-accent-grid::before,
        #accountSettingsModal .bp-accent-reset{
          grid-column:1 !important;
        }

        #accountSettingsModal .bp-accent-grid::before{
          grid-row:2 !important;
          max-width:none !important;
        }

        #accountSettingsModal .bp-accent-reset{
          grid-row:3 !important;
          justify-self:stretch !important;
          width:100% !important;
        }
      }


      /* =====================================================
         CONTEXT-AWARE CTRL+P PRINTING
         Print whichever main view the user is actually viewing.
         ===================================================== */
      @media print{
        body.bp-print-dashboard #formView,
        body.bp-print-dashboard #backBar,
        body.bp-print-dashboard #drawer,
        body.bp-print-dashboard #scrim,
        body.bp-print-dashboard .burger,
        body.bp-print-dashboard #headerActionBtn{
          display:none !important;
        }

        body.bp-print-dashboard #dashboardView{
          display:block !important;
          visibility:visible !important;
          position:static !important;
          width:100% !important;
          max-width:none !important;
          margin:0 !important;
          padding:0 !important;
          overflow:visible !important;
        }

        body.bp-print-dashboard #dashboardView *,
        body.bp-print-dashboard header.top,
        body.bp-print-dashboard header.top *{
          visibility:visible !important;
        }

        body.bp-print-dashboard .wrap,
        body.bp-print-dashboard .shell,
        body.bp-print-dashboard .main{
          display:block !important;
          width:100% !important;
          max-width:none !important;
          margin:0 !important;
          padding-left:0 !important;
          padding-right:0 !important;
          overflow:visible !important;
        }

        body.bp-print-dashboard header.top{
          display:flex !important;
          position:static !important;
          margin:0 0 14px !important;
          break-inside:avoid !important;
          page-break-inside:avoid !important;
        }

        body.bp-print-dashboard .dash-metrics,
        body.bp-print-dashboard .dash-grid,
        body.bp-print-dashboard .dash-grid-bottom{
          break-inside:auto !important;
          page-break-inside:auto !important;
        }

        body.bp-print-dashboard .dash-metric,
        body.bp-print-dashboard .dash-panel-card{
          break-inside:avoid !important;
          page-break-inside:avoid !important;
        }

        body.bp-print-evaluation #dashboardView{
          display:none !important;
        }
      }

    `;

    document.head.appendChild(style);
  }


  function syncPrintContext(){
    const body = document.body;
    if(!body) return;

    const dashboard = document.getElementById("dashboardView");
    const form = document.getElementById("formView");

    const dashboardVisible = !!dashboard &&
      !dashboard.classList.contains("hide") &&
      getComputedStyle(dashboard).display !== "none";

    const formVisible = !!form &&
      !form.classList.contains("hide") &&
      getComputedStyle(form).display !== "none";

    body.classList.remove("bp-print-dashboard","bp-print-evaluation");

    if(dashboardVisible && !formVisible){
      body.classList.add("bp-print-dashboard");
    }else{
      body.classList.add("bp-print-evaluation");
    }
  }

  function clearPrintContext(){
    document.body?.classList.remove("bp-print-dashboard","bp-print-evaluation");
  }

  window.addEventListener("beforeprint",syncPrintContext);
  window.addEventListener("afterprint",clearPrintContext);

  try{
    const printMedia = window.matchMedia("print");
    const onPrintMediaChange = event => {
      if(event.matches) syncPrintContext();
      else clearPrintContext();
    };
    printMedia.addEventListener?.("change",onPrintMediaChange);
  }catch(_){}

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
(() => {
  function installPolish() {
    if (document.getElementById("bpUiPolishHotfix")) return;

    const style = document.createElement("style");
    style.id = "bpUiPolishHotfix";
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
        border:1.5px solid rgba(var(--bp-accent-rgb,21,172,227),.34) !important;
        border-radius:12px !important;
        background:
          linear-gradient(180deg,
            rgba(var(--bp-accent-rgb,21,172,227),.10),
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
          0 8px 22px -16px rgba(var(--bp-accent-rgb,21,172,227),.75) !important;
        opacity:1 !important;
        transition:
          transform .15s ease,
          border-color .15s ease,
          background .15s ease,
          color .15s ease,
          box-shadow .15s ease !important;
      }

      .bp-accent-reset::before{
        content:"↺";
        font-size:16px;
        line-height:1;
        font-weight:900;
      }

      .bp-accent-reset:hover:not(:disabled){
        transform:translateY(-1px) !important;
        border-color:rgba(var(--bp-accent-rgb,21,172,227),.70) !important;
        background:
          linear-gradient(180deg,
            rgba(var(--bp-accent-rgb,21,172,227),.18),
            rgba(var(--bp-accent-rgb,21,172,227),.08)
          ) !important;
        color:var(--ink) !important;
        box-shadow:0 10px 24px -16px rgba(var(--bp-accent-rgb,21,172,227),.9) !important;
      }

      .bp-accent-reset:active:not(:disabled){
        transform:translateY(0) scale(.985) !important;
      }

      .bp-accent-reset:disabled{
        opacity:.45 !important;
        cursor:not-allowed !important;
        box-shadow:none !important;
      }

      html[data-bp-theme="dark"] .bp-accent-reset,
      html[data-bp-theme="amoled"] .bp-accent-reset{
        background:
          linear-gradient(180deg,
            rgba(var(--bp-accent-rgb,21,172,227),.13),
            rgba(var(--bp-accent-rgb,21,172,227),.055)
          ) !important;
        color:var(--ink-soft) !important;
        border-color:rgba(var(--bp-accent-rgb,21,172,227),.38) !important;
      }

      /* =====================================================
         DARK / AMOLED — CLEAR SCORES DIALOG
         ===================================================== */
      html[data-bp-theme="dark"] body .dlg,
      html[data-bp-theme="amoled"] body .dlg,
      html[data-bp-theme="dark"] body .rm-box,
      html[data-bp-theme="amoled"] body .rm-box{
        background:var(--panel) !important;
        border-color:var(--bp-card-border,var(--line)) !important;
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] body .dlg-top,
      html[data-bp-theme="amoled"] body .dlg-top,
      html[data-bp-theme="dark"] body .rm-top,
      html[data-bp-theme="amoled"] body .rm-top{
        background:var(--panel) !important;
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] body .dlg-ttl,
      html[data-bp-theme="amoled"] body .dlg-ttl,
      html[data-bp-theme="dark"] body .dlg-msg,
      html[data-bp-theme="amoled"] body .dlg-msg{
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] body .dlg-msg,
      html[data-bp-theme="amoled"] body .dlg-msg{
        color:var(--ink-soft) !important;
      }

      html[data-bp-theme="dark"] body .dlg-foot,
      html[data-bp-theme="amoled"] body .dlg-foot,
      html[data-bp-theme="dark"] body .rm-foot,
      html[data-bp-theme="amoled"] body .rm-foot{
        background:var(--bp-theme-surface-2) !important;
        border-color:var(--line) !important;
      }

      html[data-bp-theme="dark"] body .dlg-foot .cancel,
      html[data-bp-theme="amoled"] body .dlg-foot .cancel{
        background:var(--bp-theme-surface-3) !important;
        color:var(--ink) !important;
        border-color:var(--line) !important;
        box-shadow:none !important;
      }

      html[data-bp-theme="dark"] body .dlg-foot .cancel:hover,
      html[data-bp-theme="amoled"] body .dlg-foot .cancel:hover{
        background:rgba(var(--bp-accent-rgb),.12) !important;
        border-color:var(--lagoon) !important;
        color:var(--ink) !important;
      }

      /* =====================================================
         DARK / AMOLED — SINGLE EVALUATOR HEADER
         ===================================================== */
      html[data-bp-theme="dark"] body .evhead,
      html[data-bp-theme="amoled"] body .evhead{
        background:var(--bp-theme-surface-2) !important;
        border-color:var(--line) !important;
        color:var(--ink) !important;
      }

      html[data-bp-theme="dark"] body .evhead :where(.evlbl,.evprog),
      html[data-bp-theme="amoled"] body .evhead :where(.evlbl,.evprog){
        color:var(--muted) !important;
      }

      html[data-bp-theme="dark"] body .evhead .evwho,
      html[data-bp-theme="amoled"] body .evhead .evwho{
        color:var(--ink) !important;
      }

      /* =====================================================
         MOBILE WIDTH / OVERFLOW / BOTTOM FORM AREA
         ===================================================== */
      @media (max-width:680px){
        html,body{
          max-width:100% !important;
          overflow-x:hidden !important;
        }

        body .wrap,
        body .shell,
        body .main,
        body #formView,
        body #dashboardView,
        body .panel,
        body .scroll,
        body #grid,
        body #body,
        body .comment,
        body .actions,
        body .totals{
          width:100% !important;
          max-width:100% !important;
          min-width:0 !important;
          box-sizing:border-box !important;
        }

        body #formView{
          overflow-x:hidden !important;
        }

        body .totals{
          justify-content:stretch !important;
          gap:10px !important;
          padding:14px !important;
        }

        body .totals .interp{
          flex:1 0 100% !important;
          margin-left:0 !important;
          text-align:center !important;
        }

        body .tcard{
          flex:1 1 calc(50% - 5px) !important;
          min-width:0 !important;
          max-width:none !important;
          text-align:center !important;
          padding:12px 10px !important;
        }

        body .actions{
          display:grid !important;
          grid-template-columns:repeat(2,minmax(0,1fr)) !important;
          gap:10px !important;
          padding-left:2px !important;
          padding-right:2px !important;
        }

        body .actions .btn{
          width:100% !important;
          min-width:0 !important;
          max-width:100% !important;
          padding:13px 10px !important;
          font-size:13px !important;
          white-space:normal !important;
        }

        body .actions .status{
          grid-column:1 / -1 !important;
        }

        /* Single-evaluator view: keep header + list inside the card. */
        body #singleWrap{
          width:100% !important;
          max-width:100% !important;
          min-width:0 !important;
          overflow:hidden !important;
        }

        body #rows,
        body #rows > *{
          max-width:100% !important;
          min-width:0 !important;
        }

        /* Settings reset button is full-width enough to feel intentional. */
        body .bp-accent-reset{
          min-width:132px !important;
        }
      }

      @media (max-width:430px){
        body .actions{
          grid-template-columns:1fr !important;
        }

        body .tcard{
          flex-basis:100% !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      installPolish();
      requestAnimationFrame(installPolish);
      setTimeout(installPolish, 250);
    }, { once:true });
  } else {
    installPolish();
  }
})();
(() => {
  /*
   * This loader preserves the exact smart-header/notification implementation
   * from the current refactor/separate-files baseline, then applies the
   * sidebar-focus behavior requested on 2026-09-09.
   *
   * Baseline commit:
   * f4fb28f67beb81158298d33279f7da04b7ea157b
   */
  const BASE_SCRIPT =
    "https://cdn.jsdelivr.net/gh/FetzCriey/staff_evaluation@f4fb28f67beb81158298d33279f7da04b7ea157b/js/smart-scroll-header.js";

  function installSidebarFullFocus(){
    const header = document.querySelector("header.top");
    const drawer = document.getElementById("drawer");
    const scrim = document.getElementById("scrim");
    if(!drawer) return;

    const drawerIsOpen = () =>
      drawer.classList.contains("open") ||
      drawer.getAttribute("aria-hidden") === "false";

    function apply(){
      const open = drawerIsOpen();

      if(open){
        /*
         * The old behavior measured header.bottom and moved the drawer below it.
         * Force the drawer to occupy the complete site viewport instead.
         * Inline !important intentionally wins against the current stylesheet's
         * body.bp-drawer-open #drawer { top:var(--bp-drawer-top)!important; }.
         */
        document.documentElement.style.setProperty("--bp-drawer-top", "0px");
        drawer.style.setProperty("top", "0", "important");
        drawer.style.setProperty("bottom", "0", "important");
        drawer.style.setProperty("height", "auto", "important");
        drawer.style.setProperty("max-height", "none", "important");

        /* The scrim must cover the COMPLETE background, including the header. */
        if(scrim){
          scrim.style.setProperty("top", "0", "important");
          scrim.style.setProperty("right", "0", "important");
          scrim.style.setProperty("bottom", "0", "important");
          scrim.style.setProperty("left", "0", "important");
        }

        /* Header remains visible only as blurred/dimmed background content. */
        if(header){
          header.style.setProperty("z-index", "40", "important");
          header.style.setProperty("pointer-events", "none", "important");
        }
      }else{
        document.documentElement.style.removeProperty("--bp-drawer-top");
        drawer.style.removeProperty("top");
        drawer.style.removeProperty("bottom");
        drawer.style.removeProperty("height");
        drawer.style.removeProperty("max-height");

        if(scrim){
          scrim.style.removeProperty("top");
          scrim.style.removeProperty("right");
          scrim.style.removeProperty("bottom");
          scrim.style.removeProperty("left");
        }

        if(header){
          header.style.removeProperty("z-index");
          header.style.removeProperty("pointer-events");
        }
      }
    }

    function settle(){
      apply();
      /* The baseline script also runs an rAF header measurement. Re-assert
         full-focus positioning after those callbacks have completed. */
      requestAnimationFrame(() => {
        apply();
        requestAnimationFrame(apply);
      });
    }

    new MutationObserver(settle).observe(drawer, {
      attributes:true,
      attributeFilter:["class", "aria-hidden"]
    });

    document.getElementById("burger")?.addEventListener("click", settle);
    document.getElementById("drawerClose")?.addEventListener("click", settle);
    scrim?.addEventListener("click", settle);

    window.addEventListener("resize", () => {
      if(drawerIsOpen()) settle();
    }, { passive:true });

    window.visualViewport?.addEventListener("resize", () => {
      if(drawerIsOpen()) settle();
    }, { passive:true });

    window.addEventListener("pageshow", settle);
    settle();
  }

  function loadBaseline(){
    /* Prevent duplicate initialization if this file is accidentally included twice. */
    if(window.__bpSmartHeaderBaselineLoading){
      installSidebarFullFocus();
      return;
    }
    window.__bpSmartHeaderBaselineLoading = true;

    const script = document.createElement("script");
    script.src = BASE_SCRIPT;
    script.async = false;
    script.onload = () => {
      window.__bpSmartHeaderBaselineLoaded = true;
      installSidebarFullFocus();
    };
    script.onerror = () => {
      console.error("Smart header baseline could not load.");
      /* The sidebar focus fix can still operate even if the baseline CDN fails. */
      installSidebarFullFocus();
    };
    document.head.appendChild(script);
  }

  loadBaseline();
})();

(() => {
  const header = document.querySelector("header.top");
  const drawer = document.getElementById("drawer");
  if (!header) return;

  const SHOW_AT_TOP = 14;
  const HIDE_DELTA = 2;
  const TOUCH_TRIGGER = 3;

  const scrollTop = () => Math.max(
    0,
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );

  let lastY = scrollTop();
  let ticking = false;
  let lastTouchY = null;

  function drawerIsOpen(){
    return !!drawer && (
      drawer.classList.contains("open") ||
      drawer.getAttribute("aria-hidden") === "false"
    );
  }

  function syncDrawerState(){
    const open = drawerIsOpen();
    document.body.classList.toggle("bp-drawer-open", open);
    if (!open) showHeader();
  }

  function showHeader(){
    if (drawerIsOpen()) return;
    header.classList.remove("bp-scroll-header-hidden");
    header.classList.add("bp-scroll-header-visible");
  }

  function hideHeader(){
    if (drawerIsOpen()) return;
    header.classList.remove("bp-scroll-header-visible");
    header.classList.add("bp-scroll-header-hidden");
  }

  function updateFromScroll(){
    ticking = false;

    if (drawerIsOpen()){
      lastY = scrollTop();
      return;
    }

    const currentY = scrollTop();
    const delta = currentY - lastY;

    if (currentY <= SHOW_AT_TOP){
      showHeader();
    } else if (delta > HIDE_DELTA){
      hideHeader();
    } else if (delta < 0){
      showHeader();
    }

    lastY = currentY;
  }

  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateFromScroll);
  }

  window.addEventListener("scroll", onScroll, { passive:true });
  document.addEventListener("scroll", onScroll, { passive:true });

  /* Mobile fallback: detect finger direction directly. */
  document.addEventListener("touchstart", event => {
    const y = event.touches?.[0]?.clientY;
    if (Number.isFinite(y)) lastTouchY = y;
  }, { passive:true });

  document.addEventListener("touchmove", event => {
    if (drawerIsOpen()) return;

    const y = event.touches?.[0]?.clientY;
    if (!Number.isFinite(y) || !Number.isFinite(lastTouchY)) return;

    const fingerDelta = y - lastTouchY;

    if (Math.abs(fingerDelta) >= TOUCH_TRIGGER){
      /* Finger down = page moving up, so reveal header. */
      if (fingerDelta > 0){
        showHeader();
      } else if (scrollTop() > SHOW_AT_TOP){
        hideHeader();
      }
      lastTouchY = y;
    }
  }, { passive:true });

  const resetTouch = () => {
    lastTouchY = null;
    lastY = scrollTop();
  };

  document.addEventListener("touchend", resetTouch, { passive:true });
  document.addEventListener("touchcancel", resetTouch, { passive:true });

  window.addEventListener("wheel", event => {
    if (drawerIsOpen()) return;
    if (event.deltaY < 0){
      showHeader();
    } else if (event.deltaY > HIDE_DELTA && scrollTop() > SHOW_AT_TOP){
      hideHeader();
    }
  }, { passive:true });

  if (drawer){
    new MutationObserver(syncDrawerState).observe(drawer, {
      attributes:true,
      attributeFilter:["class","aria-hidden"]
    });
  }

  document.getElementById("burger")?.addEventListener("click", () => {
    requestAnimationFrame(syncDrawerState);
  });

  window.addEventListener("pageshow", () => {
    lastY = scrollTop();
    showHeader();
  });

  syncDrawerState();
  showHeader();
})();

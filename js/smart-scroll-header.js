(() => {
  const header = document.querySelector("header.top");
  const drawer = document.getElementById("drawer");
  if (!header) return;

  const SHOW_AT_TOP = 14;
  const SCROLL_TRIGGER = 6;
  const TOUCH_TRIGGER = 5;
  const WHEEL_TRIGGER = 4;
  const BOTTOM_TOLERANCE = 12;
  const USER_INTENT_WINDOW = 220;

  const scrollTop = () => Math.max(
    0,
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );

  const maxScrollTop = () => Math.max(
    0,
    Math.max(
      document.documentElement.scrollHeight || 0,
      document.body.scrollHeight || 0
    ) - window.innerHeight
  );

  const nearBottom = (y = scrollTop()) => (
    maxScrollTop() - y <= BOTTOM_TOLERANCE
  );

  let lastY = scrollTop();
  let ticking = false;
  let lastTouchY = null;
  let lastUserDirection = 0;
  let lastUserIntentAt = 0;

  function drawerIsOpen(){
    return !!drawer && (
      drawer.classList.contains("open") ||
      drawer.getAttribute("aria-hidden") === "false"
    );
  }

  function rememberUserIntent(direction){
    lastUserDirection = direction;
    lastUserIntentAt = performance.now();
  }

  function hasRecentUpIntent(){
    return lastUserDirection < 0 &&
      performance.now() - lastUserIntentAt <= USER_INTENT_WINDOW;
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

  function syncScrollPosition(){
    lastY = scrollTop();
    ticking = false;
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
      lastY = currentY;
      return;
    }

    /* Ignore tiny layout/viewport jitter instead of treating it as a real scroll. */
    if (Math.abs(delta) < SCROLL_TRIGGER){
      lastY = currentY;
      return;
    }

    /*
      At the bottom of a page, browser overscroll and viewport resizing can
      briefly report a small upward movement. Only reveal the header there
      when the user actually gave an upward wheel/touch gesture.
    */
    if (delta < 0 && nearBottom(currentY) && !hasRecentUpIntent()){
      lastY = currentY;
      return;
    }

    if (delta > 0){
      hideHeader();
    } else {
      showHeader();
    }

    lastY = currentY;
  }

  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateFromScroll);
  }

  /* Page scrolling is handled by window. Avoid duplicate document scroll work. */
  window.addEventListener("scroll", onScroll, { passive:true });

  /* Mobile: use the finger direction as the authoritative user intent. */
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
      /* Finger down = page moves up; finger up = page moves down. */
      if (fingerDelta > 0){
        rememberUserIntent(-1);
        showHeader();
      } else if (scrollTop() > SHOW_AT_TOP){
        rememberUserIntent(1);
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

    if (event.deltaY <= -WHEEL_TRIGGER){
      rememberUserIntent(-1);
      showHeader();
    } else if (event.deltaY >= WHEEL_TRIGGER && scrollTop() > SHOW_AT_TOP){
      rememberUserIntent(1);
      hideHeader();
    }
  }, { passive:true });

  /* Mobile browser chrome and orientation changes can alter scrollY by a few px. */
  window.addEventListener("resize", syncScrollPosition, { passive:true });
  window.visualViewport?.addEventListener("resize", syncScrollPosition, { passive:true });

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
    syncScrollPosition();
    showHeader();
  });

  syncDrawerState();
  showHeader();
})();

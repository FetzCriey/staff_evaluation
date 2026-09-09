(() => {
  const header = document.querySelector("header.top");
  const drawer = document.getElementById("drawer");
  const scrim = document.getElementById("scrim");
  if(!header) return;

  /* =========================================================
     MOBILE SCROLL PERFORMANCE
     Keep native touch scrolling in charge. The header reacts to
     actual scroll movement instead of listening to every touchmove.
     ========================================================= */
  const coarsePointer = window.matchMedia?.("(pointer:coarse)")?.matches ?? false;
  const SHOW_AT_TOP = 14;
  const SCROLL_TRIGGER = coarsePointer ? 16 : 7;
  const WHEEL_TRIGGER = 4;

  let lastY = Math.max(0, window.scrollY || 0);
  let accumulated = 0;
  let lastDirection = 0;
  let ticking = false;
  let notificationPanelOpen = false;

  function installMobilePerformanceStyles(){
    if(document.getElementById("bpMobileScrollPerformance")) return;

    const style = document.createElement("style");
    style.id = "bpMobileScrollPerformance";
    style.textContent = `
      @media (max-width:760px), (pointer:coarse){
        /* Restore the browser's normal vertical scrolling physics. */
        html,body{
          overscroll-behavior-y:auto !important;
        }

        /* background-attachment:fixed is expensive during Android/iOS scrolling. */
        body{
          background-attachment:scroll !important;
        }

        /* The original motion system continuously animates several large,
           fixed decorative layers. Keep the look, but make those layers static
           on phones so scrolling does not have to re-composite them each frame. */
        body::before,
        body::after{
          position:absolute !important;
          animation:none !important;
          filter:none !important;
        }

        body.motion-ready::before,
        body.motion-ready::after,
        body.motion-ready .wrap::before,
        body.motion-ready .shell::before,
        body.motion-ready .top::before,
        body.motion-ready .top::after{
          animation:none !important;
        }

        /* The large dotted full-page overlay is decorative and particularly
           costly on a long mobile dashboard. */
        body.motion-ready .wrap::after,
        body.motion-ready .shell::after{
          display:none !important;
          animation:none !important;
        }

        /* Keep only the compositor-friendly header transform. */
        header.top{
          will-change:transform !important;
        }

        /* Momentum scrolling for the two intentional internal scrollers. */
        #drawer,
        .bp-notification-list{
          -webkit-overflow-scrolling:touch;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const scrollTop = () => Math.max(
    0,
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0
  );

  function drawerIsOpen(){
    return !!drawer && (
      drawer.classList.contains("open") ||
      drawer.getAttribute("aria-hidden") === "false"
    );
  }

  function setHeaderVisible(visible, force = false){
    if(drawerIsOpen() && !force) return;
    if(notificationPanelOpen && !visible && !force) return;

    const alreadyVisible = header.classList.contains("bp-scroll-header-visible");
    const alreadyHidden = header.classList.contains("bp-scroll-header-hidden");

    if(visible){
      if(alreadyVisible && !alreadyHidden) return;
      header.classList.remove("bp-scroll-header-hidden");
      header.classList.add("bp-scroll-header-visible");
    }else{
      if(alreadyHidden && !alreadyVisible) return;
      header.classList.remove("bp-scroll-header-visible");
      header.classList.add("bp-scroll-header-hidden");
    }
  }

  function resetScrollTracker(){
    lastY = scrollTop();
    accumulated = 0;
    lastDirection = 0;
    ticking = false;
  }

  function updateFromScroll(){
    ticking = false;

    if(drawerIsOpen()){
      resetScrollTracker();
      return;
    }

    const currentY = scrollTop();

    if(currentY <= SHOW_AT_TOP){
      setHeaderVisible(true);
      lastY = currentY;
      accumulated = 0;
      lastDirection = 0;
      return;
    }

    const delta = currentY - lastY;
    lastY = currentY;

    /* Ignore tiny browser-toolbar / fractional viewport jitter. */
    if(Math.abs(delta) < 1) return;

    const direction = delta > 0 ? 1 : -1;

    if(direction !== lastDirection){
      lastDirection = direction;
      accumulated = 0;
    }

    accumulated += Math.abs(delta);

    /* Do not mutate the sticky header for every tiny scroll event.
       Wait until the page has genuinely travelled a useful distance. */
    if(accumulated < SCROLL_TRIGGER) return;
    accumulated = 0;

    if(direction > 0){
      setHeaderVisible(false);
    }else{
      setHeaderVisible(true);
    }
  }

  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(updateFromScroll);
  }

  window.addEventListener("scroll", onScroll, { passive:true });

  /* Mouse/trackpad stays responsive on desktop without affecting touch. */
  window.addEventListener("wheel", event => {
    if(drawerIsOpen() || notificationPanelOpen) return;

    if(event.deltaY >= WHEEL_TRIGGER && scrollTop() > SHOW_AT_TOP){
      setHeaderVisible(false);
    }else if(event.deltaY <= -WHEEL_TRIGGER){
      setHeaderVisible(true);
    }
  }, { passive:true });

  /* =========================================================
     SIDEBAR FULL-FOCUS MODE
     Drawer starts at the top of the site viewport. Header remains
     behind the scrim instead of occupying its own exposed strip.
     ========================================================= */
  function applyDrawerFocus(){
    if(!drawer) return;
    const open = drawerIsOpen();

    document.body.classList.toggle("bp-drawer-open", open);

    if(open){
      setHeaderVisible(true, true);

      document.documentElement.style.setProperty("--bp-drawer-top", "0px");
      drawer.style.setProperty("top", "0", "important");
      drawer.style.setProperty("bottom", "0", "important");
      drawer.style.setProperty("height", "auto", "important");
      drawer.style.setProperty("max-height", "none", "important");

      if(scrim){
        scrim.style.setProperty("top", "0", "important");
        scrim.style.setProperty("right", "0", "important");
        scrim.style.setProperty("bottom", "0", "important");
        scrim.style.setProperty("left", "0", "important");
      }

      header.style.setProperty("z-index", "40", "important");
      header.style.setProperty("pointer-events", "none", "important");
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

      header.style.removeProperty("z-index");
      header.style.removeProperty("pointer-events");
      resetScrollTracker();
      setHeaderVisible(true);
    }
  }

  if(drawer){
    new MutationObserver(applyDrawerFocus).observe(drawer, {
      attributes:true,
      attributeFilter:["class", "aria-hidden"]
    });
  }

  document.getElementById("burger")?.addEventListener("click", () => {
    requestAnimationFrame(applyDrawerFocus);
  });

  document.getElementById("drawerClose")?.addEventListener("click", () => {
    requestAnimationFrame(applyDrawerFocus);
  });

  scrim?.addEventListener("click", () => {
    requestAnimationFrame(applyDrawerFocus);
  });

  window.addEventListener("resize", resetScrollTracker, { passive:true });

  /* visualViewport resize fires when a mobile browser toolbar expands/collapses.
     Only reset the tracker; do not force header movement. */
  window.visualViewport?.addEventListener("resize", resetScrollTracker, { passive:true });

  window.addEventListener("pageshow", () => {
    resetScrollTracker();
    applyDrawerFocus();
    setHeaderVisible(true, drawerIsOpen());
  });

  installMobilePerformanceStyles();
  applyDrawerFocus();
  setHeaderVisible(true, drawerIsOpen());

  /* =========================================================
     HEADER NOTIFICATION CENTER
     Safe metadata only: scores/comments are never exposed here.
     ========================================================= */
  void initHeaderNotifications();

  async function initHeaderNotifications(){
    const headerAction = document.getElementById("headerActionBtn");
    if(!headerAction || document.getElementById("bpHeaderNotifications")) return;

    let createClient;
    try{
      ({ createClient } = await import(
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
      ));
    }catch(error){
      console.warn("Notifications: Supabase library could not load.", error);
      return;
    }

    const db = createClient(
      "https://giosjwjhalhmwcuyzfos.supabase.co",
      "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_"
    );

    const { data:{ session } } = await db.auth.getSession();
    if(!session) return;

    const button = document.createElement("button");
    button.id = "bpHeaderNotifications";
    button.className = "bp-notification-btn";
    button.type = "button";
    button.setAttribute("aria-label", "Notifications");
    button.setAttribute("aria-haspopup", "dialog");
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M18 8a6 6 0 10-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/>
        <path d="M10 21h4"/>
      </svg>
      <span class="bp-notification-badge" id="bpNotificationBadge" hidden>0</span>
    `;

    /* Requested order: Start Evaluation first, then notification bell. */
    headerAction.insertAdjacentElement("afterend", button);

    const panel = document.createElement("section");
    panel.id = "bpNotificationPanel";
    panel.className = "bp-notification-panel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "false");
    panel.setAttribute("aria-labelledby", "bpNotificationTitle");
    panel.innerHTML = `
      <div class="bp-notification-panel-head">
        <div class="bp-notification-panel-copy">
          <div class="bp-notification-kicker">My account</div>
          <h2 id="bpNotificationTitle">Notifications</h2>
        </div>
        <button class="bp-notification-close" id="bpNotificationClose"
          type="button" aria-label="Close notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.3" stroke-linecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18"/>
          </svg>
        </button>
      </div>
      <div class="bp-notification-summary" id="bpNotificationSummary">
        <span class="bp-notification-unread" id="bpNotificationUnread">Loading…</span>
        <div class="bp-notification-summary-actions">
          <span class="bp-notification-total" id="bpNotificationTotal"></span>
          <button class="bp-notification-mark-all" id="bpNotificationMarkAll"
            type="button">Mark all as read</button>
        </div>
      </div>
      <div class="bp-notification-list" id="bpNotificationList"></div>
    `;
    document.body.appendChild(panel);

    const badge = button.querySelector("#bpNotificationBadge");
    const unreadLabel = panel.querySelector("#bpNotificationUnread");
    const totalLabel = panel.querySelector("#bpNotificationTotal");
    const markAllButton = panel.querySelector("#bpNotificationMarkAll");
    const list = panel.querySelector("#bpNotificationList");
    const closeButton = panel.querySelector("#bpNotificationClose");

    let items = [];
    let loading = false;
    let pollTimer = null;

    const unreadItems = () => items.filter(item => !item.read_at);

    function escapeHtml(value){
      return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    function syncBadge(){
      const count = unreadItems().length;
      badge.textContent = count > 99 ? "99+" : String(count);
      badge.hidden = count === 0;
      button.setAttribute(
        "aria-label",
        count ? `Notifications, ${count} unread` : "Notifications"
      );
    }

    function formatTime(value){
      const date = new Date(value);
      if(Number.isNaN(date.getTime())) return "";

      const diff = Math.max(0, Date.now() - date.getTime());
      const minute = 60_000;
      const hour = 60 * minute;
      const day = 24 * hour;

      if(diff < minute) return "Just now";
      if(diff < hour) return `${Math.floor(diff / minute)}m ago`;
      if(diff < day) return `${Math.floor(diff / hour)}h ago`;
      if(diff < 7 * day) return `${Math.floor(diff / day)}d ago`;

      return date.toLocaleDateString(undefined, {
        month:"short",
        day:"numeric",
        year:date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined
      });
    }

    function iconFor(type){
      if(type === "evaluation_received"){
        return `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true">
            <path d="M9 5h6"/><path d="M9 9h6"/><path d="M9 13h3"/>
            <path d="M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"/>
          </svg>`;
      }

      if(type === "position_changed"){
        return `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            aria-hidden="true">
            <rect x="3" y="7" width="18" height="13" rx="2"/>
            <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 12h18"/>
          </svg>`;
      }

      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          aria-hidden="true">
          <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>
        </svg>`;
    }

    function render(){
      const unread = unreadItems().length;
      syncBadge();

      unreadLabel.innerHTML = `<strong>${unread}</strong> unread`;
      totalLabel.textContent = `${items.length} total`;
      markAllButton.disabled = unread === 0;

      if(!items.length){
        list.innerHTML = `
          <div class="bp-notification-empty">
            <strong>No notifications yet</strong>
            <span>Evaluation and position updates will appear here.</span>
          </div>`;
        return;
      }

      list.innerHTML = items.map(item => `
        <article class="bp-notification-item${item.read_at ? "" : " unread"}"
          data-notification-id="${escapeHtml(item.id)}">
          <div class="bp-notification-icon">${iconFor(item.type)}</div>
          <div class="bp-notification-item-copy">
            <div class="bp-notification-item-title">
              ${escapeHtml(item.title || "Notification")}
            </div>
            <div class="bp-notification-item-message">
              ${escapeHtml(item.message || "")}
            </div>
            <div class="bp-notification-item-time">
              ${escapeHtml(formatTime(item.created_at))}
            </div>
          </div>
        </article>
      `).join("");
    }

    function showLoading(){
      list.innerHTML = `
        <div class="bp-notification-loading">
          <span class="bp-notification-spinner" aria-hidden="true"></span>
          <span>Loading notifications…</span>
        </div>`;
    }

    async function loadNotifications({ showSpinner = false } = {}){
      if(loading) return;
      loading = true;

      if(showSpinner && !items.length) showLoading();

      try{
        const { data, error } = await db
          .from("user_notifications")
          .select("id,type,title,message,metadata,created_at,read_at")
          .order("created_at", { ascending:false })
          .limit(50);

        if(error) throw error;
        items = Array.isArray(data) ? data : [];
        render();
      }catch(error){
        console.warn("Notifications could not load.", error);

        if(!items.length && !panel.hidden){
          list.innerHTML = `
            <div class="bp-notification-error">
              <strong>Could not load notifications</strong>
              <span>${escapeHtml(error?.message || "Please try again.")}</span>
            </div>`;
          unreadLabel.textContent = "Unavailable";
          totalLabel.textContent = "";
          markAllButton.disabled = true;
        }
      }finally{
        loading = false;
      }
    }

    async function markAllUnreadRead(){
      const ids = unreadItems().map(item => item.id).filter(Boolean);
      if(!ids.length) return;

      const { error } = await db.rpc("mark_user_notifications_read", {
        notification_ids: ids
      });

      if(error){
        console.warn("Notifications could not be marked as read.", error);
        return;
      }

      const now = new Date().toISOString();
      const idSet = new Set(ids);
      items = items.map(item =>
        idSet.has(item.id) ? { ...item, read_at:now } : item
      );
      render();
    }

    function positionPanel(){
      if(panel.hidden) return;

      const viewport = window.visualViewport;
      const viewportLeft = viewport?.offsetLeft || 0;
      const viewportTop = viewport?.offsetTop || 0;
      const viewportWidth = viewport?.width || window.innerWidth;
      const viewportHeight = viewport?.height || window.innerHeight;
      const mobile = window.matchMedia("(max-width:620px)").matches;
      const margin = mobile ? 12 : 10;

      const bellRect = button.getBoundingClientRect();
      const headerRect = header.getBoundingClientRect();

      const width = mobile
        ? Math.max(280, viewportWidth - margin * 2)
        : Math.min(380, Math.max(300, viewportWidth - margin * 2));

      const minLeft = viewportLeft + margin;
      const maxLeft = viewportLeft + viewportWidth - width - margin;
      const desiredLeft = mobile ? minLeft : bellRect.right - width;
      const left = Math.min(maxLeft, Math.max(minLeft, desiredLeft));

      const top = Math.max(
        viewportTop + margin,
        Math.ceil(headerRect.bottom + (mobile ? 10 : 8))
      );

      const availableHeight = Math.max(
        180,
        viewportTop + viewportHeight - top - margin
      );

      panel.style.width = `${width}px`;
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
      panel.style.maxHeight = `${availableHeight}px`;
    }

    async function openPanel(){
      notificationPanelOpen = true;
      setHeaderVisible(true, true);
      panel.hidden = false;
      button.setAttribute("aria-expanded", "true");
      positionPanel();
      await loadNotifications({ showSpinner:true });
      positionPanel();
    }

    function closePanel({ restoreFocus = false } = {}){
      if(panel.hidden) return;
      panel.hidden = true;
      notificationPanelOpen = false;
      button.setAttribute("aria-expanded", "false");
      resetScrollTracker();

      if(restoreFocus) button.focus();
    }

    button.addEventListener("click", event => {
      event.stopPropagation();

      if(panel.hidden){
        void openPanel();
      }else{
        closePanel();
      }
    });

    closeButton.addEventListener("click", () =>
      closePanel({ restoreFocus:true })
    );

    markAllButton.addEventListener("click", () => {
      if(markAllButton.disabled) return;
      markAllButton.disabled = true;
      void markAllUnreadRead();
    });

    panel.addEventListener("click", event => event.stopPropagation());

    document.addEventListener("click", event => {
      if(panel.hidden) return;
      if(button.contains(event.target) || panel.contains(event.target)) return;
      closePanel();
    });

    document.addEventListener("keydown", event => {
      if(event.key === "Escape" && !panel.hidden){
        closePanel({ restoreFocus:true });
      }
    });

    window.addEventListener("resize", positionPanel, { passive:true });
    window.visualViewport?.addEventListener("resize", positionPanel, { passive:true });
    window.addEventListener("scroll", positionPanel, { passive:true });

    window.addEventListener("focus", () => {
      void loadNotifications();
    });

    document.addEventListener("visibilitychange", () => {
      if(document.visibilityState === "visible"){
        void loadNotifications();
      }
    });

    window.addEventListener("staff-finalized-data-changed", () => {
      void loadNotifications();
    });

    pollTimer = window.setInterval(() => {
      if(document.visibilityState === "visible"){
        void loadNotifications();
      }
    }, 30_000);

    window.addEventListener("pagehide", () => {
      if(pollTimer) window.clearInterval(pollTimer);
    }, { once:true });

    await loadNotifications();
  }
})();

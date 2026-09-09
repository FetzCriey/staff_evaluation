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

  function updateDrawerOffset(){
    if(!drawerIsOpen()) return;
    const rect = header.getBoundingClientRect();
    const top = Math.max(0, Math.ceil(rect.bottom + 8));
    document.documentElement.style.setProperty("--bp-drawer-top", `${top}px`);
  }

  function showHeader(force = false){
    if (drawerIsOpen() && !force) return;
    header.classList.remove("bp-scroll-header-hidden");
    header.classList.add("bp-scroll-header-visible");
  }

  function hideHeader(){
    if (drawerIsOpen()) return;
    header.classList.remove("bp-scroll-header-visible");
    header.classList.add("bp-scroll-header-hidden");
  }

  function syncDrawerState(){
    const open = drawerIsOpen();
    document.body.classList.toggle("bp-drawer-open", open);

    if(open){
      showHeader(true);
      requestAnimationFrame(updateDrawerOffset);
    }else{
      document.documentElement.style.removeProperty("--bp-drawer-top");
      showHeader();
    }
  }

  function syncScrollPosition(){
    lastY = scrollTop();
    ticking = false;
    if(drawerIsOpen()) requestAnimationFrame(updateDrawerOffset);
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

    if (Math.abs(delta) < SCROLL_TRIGGER){
      lastY = currentY;
      return;
    }

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

  window.addEventListener("scroll", onScroll, { passive:true });

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
    syncDrawerState();
  });

  syncDrawerState();
  showHeader(drawerIsOpen());

  /* =========================================================
     HEADER NOTIFICATION CENTER
     Safe metadata only: notifications never expose evaluation scores/comments.
     ========================================================= */
  void initHeaderNotifications();

  async function initHeaderNotifications(){
    const headerAction = document.getElementById("headerActionBtn");
    if(!headerAction || document.getElementById("bpHeaderNotifications")) return;

    let createClient;
    try{
      ({ createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"));
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
    header.insertBefore(button, headerAction);

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
        <button class="bp-notification-close" id="bpNotificationClose" type="button" aria-label="Close notifications">×</button>
      </div>
      <div class="bp-notification-summary" id="bpNotificationSummary">
        <span>Loading…</span>
      </div>
      <div class="bp-notification-list" id="bpNotificationList"></div>
    `;
    document.body.appendChild(panel);

    const badge = button.querySelector("#bpNotificationBadge");
    const summary = panel.querySelector("#bpNotificationSummary");
    const list = panel.querySelector("#bpNotificationList");
    const closeButton = panel.querySelector("#bpNotificationClose");

    let items = [];
    let loading = false;
    let pollTimer = null;

    function unreadItems(){
      return items.filter(item => !item.read_at);
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 5h6"/><path d="M9 9h6"/><path d="M9 13h3"/>
            <path d="M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z"/>
          </svg>`;
      }
      if(type === "position_changed"){
        return `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="7" width="18" height="13" rx="2"/>
            <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 12h18"/>
          </svg>`;
      }
      return `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>
        </svg>`;
    }

    function render(){
      const unread = unreadItems().length;
      syncBadge();
      summary.innerHTML = `<span><strong>${unread}</strong> unread</span><span>${items.length} total</span>`;

      if(!items.length){
        list.innerHTML = `
          <div class="bp-notification-empty">
            <strong>No notifications yet</strong>
            <span>Evaluation and position updates will appear here.</span>
          </div>`;
        return;
      }

      list.innerHTML = items.map(item => `
        <article class="bp-notification-item${item.read_at ? "" : " unread"}" data-notification-id="${escapeHtml(item.id)}">
          <div class="bp-notification-icon">${iconFor(item.type)}</div>
          <div class="bp-notification-item-copy">
            <div class="bp-notification-item-title">${escapeHtml(item.title || "Notification")}</div>
            <div class="bp-notification-item-message">${escapeHtml(item.message || "")}</div>
            <div class="bp-notification-item-time">${escapeHtml(formatTime(item.created_at))}</div>
          </div>
        </article>
      `).join("");
    }

    function escapeHtml(value){
      return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
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
          summary.innerHTML = `<span>Unavailable</span>`;
        }
      }finally{
        loading = false;
      }
    }

    async function markVisibleUnreadRead(){
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
      items = items.map(item => idSet.has(item.id) ? { ...item, read_at:now } : item);
      syncBadge();
      summary.innerHTML = `<span><strong>0</strong> unread</span><span>${items.length} total</span>`;
    }

    function positionPanel(){
      if(panel.hidden) return;
      const rect = button.getBoundingClientRect();
      const margin = 10;
      const width = Math.min(380, Math.max(280, window.innerWidth - 24));
      const left = Math.min(
        window.innerWidth - width - margin,
        Math.max(margin, rect.right - width)
      );
      const top = Math.min(
        window.innerHeight - 80,
        Math.max(margin, rect.bottom + 8)
      );

      panel.style.width = `${width}px`;
      panel.style.left = `${Math.max(margin, left)}px`;
      panel.style.top = `${top}px`;
    }

    async function openPanel(){
      showHeader(true);
      panel.hidden = false;
      button.setAttribute("aria-expanded", "true");
      positionPanel();
      await loadNotifications({ showSpinner:true });
      setTimeout(() => { void markVisibleUnreadRead(); }, 450);
    }

    function closePanel({ restoreFocus = false } = {}){
      if(panel.hidden) return;
      panel.hidden = true;
      button.setAttribute("aria-expanded", "false");
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

    closeButton.addEventListener("click", () => closePanel({ restoreFocus:true }));
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

    window.addEventListener("resize", () => {
      positionPanel();
      if(drawerIsOpen()) requestAnimationFrame(updateDrawerOffset);
    }, { passive:true });
    window.visualViewport?.addEventListener("resize", positionPanel, { passive:true });
    window.addEventListener("scroll", positionPanel, { passive:true });

    window.addEventListener("focus", () => { void loadNotifications(); });
    document.addEventListener("visibilitychange", () => {
      if(document.visibilityState === "visible") void loadNotifications();
    });
    window.addEventListener("staff-finalized-data-changed", () => { void loadNotifications(); });

    pollTimer = window.setInterval(() => {
      if(document.visibilityState === "visible") void loadNotifications();
    }, 30_000);

    window.addEventListener("pagehide", () => {
      if(pollTimer) window.clearInterval(pollTimer);
    }, { once:true });

    await loadNotifications();
    requestAnimationFrame(() => {
      if(drawerIsOpen()) updateDrawerOffset();
    });
  }
})();

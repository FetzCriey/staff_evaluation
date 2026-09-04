(() => {
  const header = document.querySelector("header.top");
  const drawer = document.getElementById("drawer");
  if (!header) return;

  const SHOW_AT_TOP = 14;
  const HIDE_DELTA = 6;

  let lastY = Math.max(0, window.scrollY || 0);
  let ticking = false;

  function drawerIsOpen(){
    return !!drawer && (
      drawer.classList.contains("open") ||
      drawer.getAttribute("aria-hidden") === "false"
    );
  }

  function syncDrawerState(){
    const open = drawerIsOpen();
    document.body.classList.toggle("bp-drawer-open", open);

    if (!open){
      showHeader();
    }
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

  function update(){
    ticking = false;

    if (drawerIsOpen()){
      lastY = Math.max(0, window.scrollY || 0);
      return;
    }

    const currentY = Math.max(0, window.scrollY || 0);
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
    requestAnimationFrame(update);
  }

  window.addEventListener("scroll", onScroll, { passive:true });

  if (drawer){
    new MutationObserver(syncDrawerState).observe(drawer, {
      attributes:true,
      attributeFilter:["class","aria-hidden"]
    });
  }

  document.getElementById("burger")?.addEventListener("click", () => {
    requestAnimationFrame(syncDrawerState);
  });

  syncDrawerState();
  showHeader();
})();

(() => {
  const header = document.querySelector("header.top");
  if (!header) return;

  const SHOW_AT_TOP = 14;
  const HIDE_DELTA = 2;

  let lastY = Math.max(0, window.scrollY || 0);
  let ticking = false;

  function showHeader(){
    header.classList.remove("bp-scroll-header-hidden");
    header.classList.add("bp-scroll-header-visible");
  }

  function hideHeader(){
    header.classList.remove("bp-scroll-header-visible");
    header.classList.add("bp-scroll-header-hidden");
  }

  function update(){
    ticking = false;

    const currentY = Math.max(0, window.scrollY || 0);
    const delta = currentY - lastY;

    if (currentY <= SHOW_AT_TOP){
      showHeader();
    } else if (delta > HIDE_DELTA){
      hideHeader();
    } else if (delta < 0){
      /* Any upward movement brings the header back immediately. */
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

  /* Keep the menu control visible whenever the sidebar is being opened. */
  document.getElementById("burger")?.addEventListener("click", showHeader);

  const drawer = document.getElementById("drawer");
  if (drawer){
    new MutationObserver(() => {
      if (drawer.classList.contains("open") || drawer.getAttribute("aria-hidden") === "false"){
        showHeader();
      }
    }).observe(drawer, {
      attributes:true,
      attributeFilter:["class","aria-hidden"]
    });
  }

  showHeader();
})();

/* =========================================================
   VISIBLE COMPANY LOGOS — REAL FILE SOURCE
   Keeps every visible logo pointed at the same named PNG so
   "Download image" uses: Better Practice Consulting Inc.png
   ========================================================= */

(() => {
  const LOGO_FILE = 'Better Practice Consulting Inc.png';
  const LOGO_ALT = 'Better Practice Consulting Inc. logo';

  function applyLogoFileSource() {
    document.querySelectorAll('#logoImg, .drawer-brand-logo, img.logo').forEach(img => {
      if (img.getAttribute('src') !== LOGO_FILE) {
        img.setAttribute('src', LOGO_FILE);
      }
      img.setAttribute('alt', LOGO_ALT);
    });
  }

  applyLogoFileSource();

  // Re-apply if another script changes a visible logo source later.
  new MutationObserver(applyLogoFileSource).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src']
  });
})();

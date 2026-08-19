/* Remove Pinned Criteria from phone-sized screens only.
   Desktop keeps the existing Pinned Criteria option unchanged. */
(() => {
  const mobile = window.matchMedia('(max-width: 620px)');
  const panel = document.getElementById('panel');

  function syncMobileLayoutOptions() {
    const pinnedOption = document.querySelector('#layMenu [data-lay="pinned"]');

    if (pinnedOption) {
      pinnedOption.style.display = mobile.matches ? 'none' : '';
      pinnedOption.setAttribute('aria-hidden', String(mobile.matches));
    }

    // Pinned and Full Grid render the same responsive card/table layout on phones.
    // If Pinned becomes active while phone-sized, normalize it back to Full Grid.
    if (
      mobile.matches &&
      panel?.classList.contains('pinned') &&
      typeof window.setLayout === 'function'
    ) {
      window.setLayout('grid');
    }
  }

  if (typeof mobile.addEventListener === 'function') {
    mobile.addEventListener('change', syncMobileLayoutOptions);
  } else if (typeof mobile.addListener === 'function') {
    mobile.addListener(syncMobileLayoutOptions);
  }

  if (panel) {
    new MutationObserver(syncMobileLayoutOptions).observe(panel, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  syncMobileLayoutOptions();
})();

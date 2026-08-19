/* Hide the per-criterion Average column while a user is scoring.
   Preview / Results mode keeps the Average column visible. */
(() => {
  const STYLE_ID = 'criteria-average-visibility-style';
  const HIDE_CLASS = 'hide-criteria-average-while-scoring';

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      body.${HIDE_CLASS} #grid thead th.tot:last-child,
      body.${HIDE_CLASS} #grid tbody td.calc.dim {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  const sync = () => {
    const modeLabel = document.getElementById('whoK')?.textContent?.trim() || '';
    const previewMode = modeLabel === 'Results for';
    document.body.classList.toggle(HIDE_CLASS, !previewMode);
  };

  const label = document.getElementById('whoK');
  if (label) {
    new MutationObserver(sync).observe(label, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  sync();
})();

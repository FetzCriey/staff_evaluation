/* Redirect to the dashboard only after the evaluator has submitted everyone. */
(() => {
  const originalAlert = window.uiAlert;
  if (typeof originalAlert !== 'function') return;

  window.uiAlert = async function(title, message, ...rest) {
    const result = await originalAlert.call(this, title, message, ...rest);

    if (
      title === 'All done' &&
      /evaluated everyone/i.test(String(message || ''))
    ) {
      requestAnimationFrame(() => {
        document.getElementById('backToDashboard')?.click();
      });
    }

    return result;
  };
})();

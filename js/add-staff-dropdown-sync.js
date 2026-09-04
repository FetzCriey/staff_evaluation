(() => {
  const MODAL_SELECTOR = '.staff-add-modal';

  function getNativeSelect(root){
    const prev = root.previousElementSibling;
    return prev && prev.matches('select.bp-native-select') ? prev : null;
  }

  function getTheme(){
    return document.documentElement.getAttribute('data-bp-theme') || 'light';
  }

  function themeColors(selected){
    const theme = getTheme();

    if(theme === 'dark' || theme === 'amoled'){
      return {
        text: 'var(--ink)',
        selectedText: 'var(--ink)',
        selectedBg: 'rgba(var(--bp-accent-rgb),.24)',
        hoverBg: 'rgba(var(--bp-accent-rgb),.14)'
      };
    }

    return {
      text: '#233746',
      selectedText: '#4f2a7f',
      selectedBg: 'rgba(var(--bp-accent-rgb),.15)',
      hoverBg: 'rgba(var(--bp-accent-rgb),.10)'
    };
  }

  function closeRoot(root){
    root.classList.remove('open');
    root.querySelector('.bp-select-btn')?.setAttribute('aria-expanded','false');
  }

  function applyRowTheme(item, selected){
    const c = themeColors(selected);
    const color = selected ? c.selectedText : c.text;

    item.style.setProperty('color', color, 'important');
    item.style.setProperty('-webkit-text-fill-color', color, 'important');
    item.style.setProperty('opacity', '1', 'important');
    item.style.setProperty('visibility', 'visible', 'important');
    item.style.setProperty('display', 'flex', 'important');
    item.style.setProperty('height', '36px', 'important');
    item.style.setProperty('min-height', '36px', 'important');
    item.style.setProperty(
      'background',
      selected ? c.selectedBg : 'transparent',
      'important'
    );
  }

  function rebuild(root){
    const select = getNativeSelect(root);
    const btn = root.querySelector('.bp-select-btn');
    const label = root.querySelector('.bp-select-label');
    const menu = root.querySelector('.bp-select-menu');

    if(!select || !btn || !label || !menu) return;

    const options = Array.from(select.options);
    const selectedOption = select.options[select.selectedIndex];
    label.textContent = selectedOption?.textContent || '';

    // Make the trigger follow the active theme too.
    const theme = getTheme();
    const dark = theme === 'dark' || theme === 'amoled';
    btn.style.setProperty('color', dark ? 'var(--ink)' : '#233746', 'important');
    btn.style.setProperty('-webkit-text-fill-color', dark ? 'var(--ink)' : '#233746', 'important');

    menu.replaceChildren();

    options.forEach((option, index) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'bp-select-option';
      item.setAttribute('role','option');
      item.dataset.value = option.value;
      item.textContent = option.textContent;

      const selected = index === select.selectedIndex;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-selected', String(selected));

      applyRowTheme(item, selected);

      item.addEventListener('mouseenter', () => {
        if(index !== select.selectedIndex){
          const c = themeColors(false);
          item.style.setProperty('background', c.hoverBg, 'important');
        }
      });

      item.addEventListener('mouseleave', () => {
        applyRowTheme(item, index === select.selectedIndex);
      });

      item.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();

        if(select.selectedIndex !== index){
          select.selectedIndex = index;
          select.dispatchEvent(new Event('change', { bubbles:true }));
        }

        rebuild(root);
        closeRoot(root);
        btn.focus();
      });

      menu.appendChild(item);
    });

    const rowHeight = 36;
    const paddingAndBorder = 12;
    const desired = Math.min(options.length * rowHeight + paddingAndBorder, 240);

    menu.style.setProperty('height', `${desired}px`, 'important');
    menu.style.setProperty('min-height', `${desired}px`, 'important');
    menu.style.setProperty('max-height', '240px', 'important');
    menu.style.setProperty(
      'overflow-y',
      options.length * rowHeight + paddingAndBorder > 240 ? 'auto' : 'hidden',
      'important'
    );
  }

  function enhanceRoot(root){
    if(root.dataset.bpSynced === '1') return;
    root.dataset.bpSynced = '1';

    const select = getNativeSelect(root);
    const btn = root.querySelector('.bp-select-btn');
    if(!select || !btn) return;

    btn.addEventListener('click', () => rebuild(root), true);
    select.addEventListener('change', () => rebuild(root));

    new MutationObserver(() => rebuild(root)).observe(select, {
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:['selected','label','value']
    });

    rebuild(root);
  }

  function scan(){
    document.querySelectorAll(`${MODAL_SELECTOR} .bp-select`).forEach(enhanceRoot);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', scan, { once:true });
  }else{
    scan();
  }

  const modal = document.querySelector(MODAL_SELECTOR);
  if(modal){
    new MutationObserver(scan).observe(modal, { childList:true, subtree:true });
  }

  // Automatically re-theme dropdowns whenever Light/Dark/AMOLED changes.
  new MutationObserver(() => {
    document.querySelectorAll(`${MODAL_SELECTOR} .bp-select`).forEach(rebuild);
  }).observe(document.documentElement, {
    attributes:true,
    attributeFilter:['data-bp-theme']
  });
})();
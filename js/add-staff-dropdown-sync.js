(() => {
  const MODAL_SELECTOR = '.staff-add-modal';

  function getNativeSelect(root){
    const prev = root.previousElementSibling;
    return prev && prev.matches('select.bp-native-select') ? prev : null;
  }

  function closeRoot(root){
    root.classList.remove('open');
    root.querySelector('.bp-select-btn')?.setAttribute('aria-expanded','false');
  }

  function rebuild(root){
    const select = getNativeSelect(root);
    const btn = root.querySelector('.bp-select-btn');
    const label = root.querySelector('.bp-select-label');
    const menu = root.querySelector('.bp-select-menu');

    if(!select || !btn || !label || !menu) return;

    const options = Array.from(select.options);

    // Always show the real currently selected option in the trigger.
    const selectedOption = select.options[select.selectedIndex];
    label.textContent = selectedOption?.textContent || '';

    // Rebuild the visible custom menu directly from the real native select.
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

      item.style.setProperty('color', selected ? '#4f2a7f' : '#233746', 'important');
      item.style.setProperty('-webkit-text-fill-color', selected ? '#4f2a7f' : '#233746', 'important');
      item.style.setProperty('opacity', '1', 'important');
      item.style.setProperty('visibility', 'visible', 'important');
      item.style.setProperty('display', 'flex', 'important');
      item.style.setProperty('height', '36px', 'important');
      item.style.setProperty('min-height', '36px', 'important');

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

    // Explicit content-sized height based on the actual number of options.
    const rowHeight = 36;
    const paddingAndBorder = 12;
    const desired = Math.min(options.length * rowHeight + paddingAndBorder, 240);

    menu.style.setProperty('height', `${desired}px`, 'important');
    menu.style.setProperty('min-height', `${desired}px`, 'important');
    menu.style.setProperty('max-height', '240px', 'important');
    menu.style.setProperty('overflow-y', options.length * rowHeight + paddingAndBorder > 240 ? 'auto' : 'hidden', 'important');
  }

  function enhanceRoot(root){
    if(root.dataset.bpSynced === '1') return;
    root.dataset.bpSynced = '1';

    const select = getNativeSelect(root);
    const btn = root.querySelector('.bp-select-btn');
    if(!select || !btn) return;

    // Rebuild before the original click handler opens the menu.
    btn.addEventListener('click', () => rebuild(root), true);
    select.addEventListener('change', () => rebuild(root));

    // If another script adds/removes native options later, mirror them.
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
})();
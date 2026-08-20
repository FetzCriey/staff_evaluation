/* =========================================================
   ADD STAFF MODAL
   - Sidebar contains only the Add Staff launch button.
   - Existing Supabase mgrAdd logic still owns validation/create.
   - Existing "User created" uiAlert remains the success popup.
   ========================================================= */

(() => {
  const modal = document.getElementById('addStaffModal');
  const openBtn = document.getElementById('openAddStaff');
  const closeBtn = document.getElementById('closeAddStaff');
  const createBtn = document.getElementById('mgrAdd');
  const nameInput = document.getElementById('mgrName');
  const sidebarMsg = document.getElementById('mgrMsg');
  const modalStatus = document.getElementById('addStaffStatus');

  if(!modal || !openBtn) return;

  let previousOverflow = '';
  let lastFocus = null;

  function syncStatus(){
    if(!modalStatus || !sidebarMsg) return;
    modalStatus.textContent = sidebarMsg.textContent || '';
    modalStatus.className = 'staff-add-status' +
      (sidebarMsg.classList.contains('err') ? ' err' :
       sidebarMsg.classList.contains('ok') ? ' ok' : '');
  }

  function openModal(){
    lastFocus = document.activeElement;

    // The Add Staff button is launched from the drawer. Close the drawer first
    // so there is only one active overlay on screen.
    document.getElementById('drawerClose')?.click();

    previousOverflow = document.body.style.overflow;
    modal.hidden = false;
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    syncStatus();

    requestAnimationFrame(() => nameInput?.focus());
  }

  function closeModal(force=false){
    // Do not let an accidental tap dismiss the form while account creation
    // is actively running. Successful creation uses force=true below.
    if(!force && createBtn?.disabled) return;

    modal.hidden = true;
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = previousOverflow;

    if(!force && lastFocus && typeof lastFocus.focus === 'function'){
      requestAnimationFrame(() => lastFocus.focus());
    }
  }

  openBtn.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', () => closeModal());

  modal.querySelectorAll('[data-add-staff-close]').forEach(el => {
    el.addEventListener('click', () => closeModal());
  });

  document.addEventListener('keydown', event => {
    if(event.key === 'Escape' && !modal.hidden){
      event.preventDefault();
      closeModal();
    }
  });

  if(sidebarMsg){
    new MutationObserver(syncStatus).observe(sidebarMsg, {
      childList:true,
      subtree:true,
      attributes:true,
      attributeFilter:['class']
    });
  }

  // supabase.js already ends a successful creation with:
  // uiAlert('User created', 'Name can now sign in ...')
  // Close the form modal first, then let that existing confirmation popup show.
  const originalAlert = window.uiAlert;
  if(typeof originalAlert === 'function'){
    window.uiAlert = async function(title, message, ...rest){
      if(title === 'User created'){
        closeModal(true);
      }
      return originalAlert.call(this, title, message, ...rest);
    };
  }

  /* ---------------------------------------------------------
     Custom themed dropdowns
     --------------------------------------------------------- */
  function enhanceSelect(select){
    if(!select || select.dataset.bpEnhanced === '1') return;
    select.dataset.bpEnhanced = '1';
    select.classList.add('bp-native-select');

    const root = document.createElement('div');
    root.className = 'bp-select';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bp-select-btn';
    btn.setAttribute('aria-haspopup','listbox');
    btn.setAttribute('aria-expanded','false');

    const label = document.createElement('span');
    label.className = 'bp-select-label';

    const arrow = document.createElement('span');
    arrow.className = 'bp-select-arrow';
    arrow.setAttribute('aria-hidden','true');

    btn.append(label, arrow);

    const menu = document.createElement('div');
    menu.className = 'bp-select-menu';
    menu.setAttribute('role','listbox');

    function close(){
      root.classList.remove('open');
      btn.setAttribute('aria-expanded','false');
    }

    function sync(){
      label.textContent = select.options[select.selectedIndex]?.textContent || '';
      menu.querySelectorAll('.bp-select-option').forEach(opt => {
        const selected = opt.dataset.value === select.value;
        opt.classList.toggle('selected', selected);
        opt.setAttribute('aria-selected', String(selected));
      });
    }

    Array.from(select.options).forEach(option => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'bp-select-option';
      item.setAttribute('role','option');
      item.dataset.value = option.value;
      item.textContent = option.textContent;

      item.addEventListener('click', () => {
        if(select.value !== option.value){
          select.value = option.value;
          select.dispatchEvent(new Event('change', { bubbles:true }));
        }
        sync();
        close();
        btn.focus();
      });

      menu.appendChild(item);
    });

    btn.addEventListener('click', () => {
      const opening = !root.classList.contains('open');

      document.querySelectorAll('.bp-select.open').forEach(other => {
        if(other !== root){
          other.classList.remove('open');
          other.querySelector('.bp-select-btn')?.setAttribute('aria-expanded','false');
        }
      });

      root.classList.toggle('open', opening);
      btn.setAttribute('aria-expanded', String(opening));
    });

    btn.addEventListener('keydown', event => {
      const options = Array.from(menu.querySelectorAll('.bp-select-option'));
      if(!options.length) return;

      if(event.key === 'ArrowDown' || event.key === 'ArrowUp'){
        event.preventDefault();
        root.classList.add('open');
        btn.setAttribute('aria-expanded','true');

        let idx = options.findIndex(o => o.dataset.value === select.value);
        idx += event.key === 'ArrowDown' ? 1 : -1;
        idx = Math.max(0, Math.min(options.length - 1, idx));

        select.value = options[idx].dataset.value;
        select.dispatchEvent(new Event('change', { bubbles:true }));
        sync();
      }else if(event.key === 'Escape'){
        close();
      }else if(event.key === 'Enter' || event.key === ' '){
        event.preventDefault();
        btn.click();
      }
    });

    document.addEventListener('click', event => {
      if(!root.contains(event.target)) close();
    });

    select.addEventListener('change', sync);

    select.insertAdjacentElement('afterend', root);
    root.append(btn, menu);
    sync();
  }

  enhanceSelect(document.getElementById('mgrRole'));
  enhanceSelect(document.getElementById('mgrAccess'));

})();

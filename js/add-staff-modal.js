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
})();

/* =========================================================
   ACCOUNT SETTINGS
   Own password + own profile picture only.
   ========================================================= */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://giosjwjhalhmwcuyzfos.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_";
const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const BUCKET = 'profile-pictures';
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg','image/png','image/webp']);

const modal = document.getElementById('accountSettingsModal');
const openBtn = document.getElementById('openAccountSettings');
const closeBtn = document.getElementById('closeAccountSettings');
const fileInput = document.getElementById('settingsPhotoInput');
const chooseBtn = document.getElementById('chooseProfilePhoto');
const removeBtn = document.getElementById('removeProfilePhoto');
const preview = document.getElementById('settingsAvatarPreview');
const userNameEl = document.getElementById('settingsUserName');
const photoStatus = document.getElementById('photoSettingsStatus');
const newPassword = document.getElementById('settingsNewPassword');
const confirmPassword = document.getElementById('settingsConfirmPassword');
const passwordBtn = document.getElementById('changeOwnPassword');
const passwordStatus = document.getElementById('passwordSettingsStatus');

let session = null;
let profile = null;
let previousOverflow = '';

function initials(name){
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts.at(-1)?.[0] || '' : '')).toUpperCase() || '—';
}

function setStatus(el, text='', cls=''){
  if(!el) return;
  el.textContent = text;
  el.className = 'settings-status' + (cls ? ' ' + cls : '');
}

function publicAvatarUrl(path){
  if(!path) return '';
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function paintAvatar(path){
  const name = profile?.full_name || session?.user?.email || '';
  const url = publicAvatarUrl(path);

  document.querySelectorAll('[data-current-user-avatar]').forEach(host => {
    host.innerHTML = '';
    if(url){
      const img = document.createElement('img');
      img.src = url + '?v=' + Date.now();
      img.alt = name ? name + ' profile picture' : 'Profile picture';
      host.appendChild(img);
    }else{
      host.textContent = initials(name);
    }
  });

  if(preview){
    preview.innerHTML = '';
    if(url){
      const img = document.createElement('img');
      img.src = url + '?v=' + Date.now();
      img.alt = name ? name + ' profile picture' : 'Profile picture';
      preview.appendChild(img);
    }else{
      preview.textContent = initials(name);
    }
  }

  removeBtn && (removeBtn.disabled = !path);
}

async function loadAccount(){
  const { data:{ session:active } } = await db.auth.getSession();
  session = active;
  if(!session) return;

  const { data, error } = await db
    .from('profiles')
    .select('id, full_name, avatar_path')
    .eq('id', session.user.id)
    .maybeSingle();

  if(error){
    console.info('Account settings profile unavailable.', error);
    return;
  }

  profile = data || {
    id: session.user.id,
    full_name: session.user.email,
    avatar_path: null
  };

  userNameEl && (userNameEl.textContent = profile.full_name || session.user.email || 'Signed in user');
  paintAvatar(profile.avatar_path);
}

function openModal(){
  if(!modal) return;
  document.getElementById('drawerClose')?.click();
  previousOverflow = document.body.style.overflow;
  modal.hidden = false;
  modal.setAttribute('aria-hidden','false');
  document.body.style.overflow = 'hidden';
  setStatus(photoStatus);
  setStatus(passwordStatus);
  loadAccount();
}

function closeModal(){
  if(!modal) return;
  modal.hidden = true;
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow = previousOverflow;
  if(newPassword) newPassword.value = '';
  if(confirmPassword) confirmPassword.value = '';
  setStatus(photoStatus);
  setStatus(passwordStatus);
}

openBtn?.addEventListener('click', openModal);
closeBtn?.addEventListener('click', closeModal);
modal?.querySelectorAll('[data-account-settings-close]').forEach(el => el.addEventListener('click', closeModal));

document.addEventListener('keydown', event => {
  if(event.key === 'Escape' && modal && !modal.hidden) closeModal();
});

chooseBtn?.addEventListener('click', () => fileInput?.click());

fileInput?.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  fileInput.value = '';
  if(!file) return;

  if(!ALLOWED_TYPES.has(file.type)){
    setStatus(photoStatus, 'Use a JPG, PNG or WEBP image.', 'err');
    return;
  }

  if(file.size > MAX_BYTES){
    setStatus(photoStatus, 'The image must be 5 MB or smaller.', 'err');
    return;
  }

  if(!session) await loadAccount();
  const uid = session?.user?.id;
  if(!uid){
    setStatus(photoStatus, 'Your session has expired. Please sign in again.', 'err');
    return;
  }

  chooseBtn.disabled = true;
  removeBtn && (removeBtn.disabled = true);
  setStatus(photoStatus, 'Uploading picture…');

  const path = `${uid}/avatar`;

  try{
    const { error:uploadError } = await db.storage
      .from(BUCKET)
      .upload(path, file, {
        upsert:true,
        contentType:file.type,
        cacheControl:'3600'
      });

    if(uploadError) throw uploadError;

    const { error:profileError } = await db
      .from('profiles')
      .update({ avatar_path:path })
      .eq('id', uid);

    if(profileError) throw profileError;

    profile.avatar_path = path;
    paintAvatar(path);
    setStatus(photoStatus, 'Profile picture updated.', 'ok');

    if(typeof window.uiAlert === 'function'){
      await window.uiAlert('Profile picture updated', 'Your new picture is now used for your account.');
    }
  }catch(err){
    setStatus(photoStatus, err?.message || 'Could not upload the picture.', 'err');
  }finally{
    chooseBtn.disabled = false;
    removeBtn && (removeBtn.disabled = !profile?.avatar_path);
  }
});

removeBtn?.addEventListener('click', async () => {
  if(!session) await loadAccount();
  const uid = session?.user?.id;
  if(!uid || !profile?.avatar_path) return;

  removeBtn.disabled = true;
  chooseBtn && (chooseBtn.disabled = true);
  setStatus(photoStatus, 'Removing picture…');

  try{
    const oldPath = profile.avatar_path;

    const { error:removeError } = await db.storage
      .from(BUCKET)
      .remove([oldPath]);

    if(removeError) throw removeError;

    const { error:profileError } = await db
      .from('profiles')
      .update({ avatar_path:null })
      .eq('id', uid);

    if(profileError) throw profileError;

    profile.avatar_path = null;
    paintAvatar(null);
    setStatus(photoStatus, 'Profile picture removed.', 'ok');
  }catch(err){
    setStatus(photoStatus, err?.message || 'Could not remove the picture.', 'err');
  }finally{
    chooseBtn && (chooseBtn.disabled = false);
    removeBtn.disabled = !profile?.avatar_path;
  }
});

document.querySelectorAll('.settings-password-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.passwordTarget);
    if(!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.textContent = show ? 'Hide' : 'Show';
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  });
});

passwordBtn?.addEventListener('click', async () => {
  const password = newPassword?.value || '';
  const confirmation = confirmPassword?.value || '';

  if(password.length < 8){
    setStatus(passwordStatus, 'Use at least 8 characters.', 'err');
    return;
  }

  if(password !== confirmation){
    setStatus(passwordStatus, 'The passwords do not match.', 'err');
    return;
  }

  passwordBtn.disabled = true;
  setStatus(passwordStatus, 'Changing password…');

  try{
    const { error } = await db.auth.updateUser({ password });
    if(error) throw error;

    newPassword.value = '';
    confirmPassword.value = '';
    setStatus(passwordStatus, 'Password changed successfully.', 'ok');

    if(typeof window.uiAlert === 'function'){
      await window.uiAlert('Password changed', 'Your account password has been updated.');
    }
  }catch(err){
    setStatus(passwordStatus, err?.message || 'Could not change the password.', 'err');
  }finally{
    passwordBtn.disabled = false;
  }
});

// Replace initials with the saved picture as soon as the authenticated page loads.
loadAccount();

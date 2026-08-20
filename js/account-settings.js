/* =========================================================
   ACCOUNT SETTINGS
   Own password + own profile picture only.
   Profile uploads are cropped before being stored.
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
  const stamp = Date.now();

  document.querySelectorAll('[data-current-user-avatar]').forEach(host => {
    host.innerHTML = '';
    if(url){
      const img = document.createElement('img');
      img.src = url + '?v=' + stamp;
      img.alt = name ? name + ' profile picture' : 'Profile picture';
      img.addEventListener('error', () => {
        host.innerHTML = '';
        host.textContent = initials(name);
      }, { once:true });
      host.appendChild(img);
    }else{
      host.textContent = initials(name);
    }
  });

  if(preview){
    preview.innerHTML = '';
    if(url){
      const img = document.createElement('img');
      img.src = url + '?v=' + stamp;
      img.alt = name ? name + ' profile picture' : 'Profile picture';
      img.addEventListener('error', () => {
        preview.innerHTML = '';
        preview.textContent = initials(name);
      }, { once:true });
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
  if(document.getElementById('profileCropModal')?.hidden === false) return;
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

/* =========================================================
   CROP UI
   ========================================================= */

const CROP_CANVAS_SIZE = 900;
let cropState = null;

function createCropUi(){
  if(document.getElementById('profileCropModal')) return;

  const shell = document.createElement('div');
  shell.className = 'profile-crop-modal';
  shell.id = 'profileCropModal';
  shell.hidden = true;
  shell.setAttribute('aria-hidden','true');
  shell.innerHTML = `
    <div class="profile-crop-backdrop" data-crop-cancel></div>
    <section class="profile-crop-dialog" role="dialog" aria-modal="true" aria-labelledby="profileCropTitle">
      <div class="profile-crop-head">
        <div>
          <div class="profile-crop-kicker">Profile picture</div>
          <h2 id="profileCropTitle">Crop picture</h2>
        </div>
        <button class="profile-crop-close" type="button" data-crop-cancel aria-label="Cancel crop">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <div class="profile-crop-body">
        <div class="profile-crop-stage">
          <canvas id="profileCropCanvas" width="${CROP_CANVAS_SIZE}" height="${CROP_CANVAS_SIZE}" aria-label="Profile picture crop preview"></canvas>
          <div class="profile-crop-guide" aria-hidden="true"></div>
        </div>

        <div class="profile-crop-zoom-row">
          <span>Zoom</span>
          <input id="profileCropZoom" type="range" min="1" max="3" value="1" step="0.01" aria-label="Crop zoom">
        </div>

        <div class="profile-crop-hint">Drag the picture to reposition it inside the square.</div>

        <div class="profile-crop-actions">
          <button class="settings-btn settings-btn-ghost" type="button" data-crop-cancel>Cancel</button>
          <button class="settings-btn settings-btn-primary" type="button" id="useCroppedPicture">OK</button>
        </div>
      </div>
    </section>
  `;

  document.body.appendChild(shell);

  shell.querySelectorAll('[data-crop-cancel]').forEach(btn => {
    btn.addEventListener('click', closeCropUi);
  });

  shell.querySelector('#profileCropZoom')?.addEventListener('input', e => {
    if(!cropState) return;
    cropState.zoom = Number(e.target.value) || 1;
    clampCropOffsets();
    drawCrop();
  });

  const canvas = shell.querySelector('#profileCropCanvas');

  canvas?.addEventListener('pointerdown', e => {
    if(!cropState) return;
    cropState.dragging = true;
    cropState.lastX = e.clientX;
    cropState.lastY = e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
  });

  canvas?.addEventListener('pointermove', e => {
    if(!cropState?.dragging) return;
    const rect = canvas.getBoundingClientRect();
    const factor = CROP_CANVAS_SIZE / Math.max(1, rect.width);

    cropState.offsetX += (e.clientX - cropState.lastX) * factor;
    cropState.offsetY += (e.clientY - cropState.lastY) * factor;
    cropState.lastX = e.clientX;
    cropState.lastY = e.clientY;

    clampCropOffsets();
    drawCrop();
  });

  const stopDrag = e => {
    if(!cropState) return;
    cropState.dragging = false;
    try{ canvas.releasePointerCapture?.(e.pointerId); }catch(_){}
  };

  canvas?.addEventListener('pointerup', stopDrag);
  canvas?.addEventListener('pointercancel', stopDrag);

  shell.querySelector('#useCroppedPicture')?.addEventListener('click', async () => {
    if(!cropState) return;
    const useBtn = shell.querySelector('#useCroppedPicture');
    useBtn.disabled = true;
    setStatus(photoStatus, 'Preparing cropped picture…');

    try{
      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          result => result ? resolve(result) : reject(new Error('Could not create the cropped image.')),
          'image/jpeg',
          0.92
        );
      });

      closeCropUi();
      await uploadAvatarBlob(blob);
    }catch(err){
      setStatus(photoStatus, err?.message || 'Could not crop the picture.', 'err');
    }finally{
      useBtn.disabled = false;
    }
  });
}

function clampCropOffsets(){
  if(!cropState) return;
  const scale = cropState.baseScale * cropState.zoom;
  const drawW = cropState.image.naturalWidth * scale;
  const drawH = cropState.image.naturalHeight * scale;

  const limitX = Math.max(0, (drawW - CROP_CANVAS_SIZE) / 2);
  const limitY = Math.max(0, (drawH - CROP_CANVAS_SIZE) / 2);

  cropState.offsetX = Math.max(-limitX, Math.min(limitX, cropState.offsetX));
  cropState.offsetY = Math.max(-limitY, Math.min(limitY, cropState.offsetY));
}

function drawCrop(){
  if(!cropState) return;
  const canvas = document.getElementById('profileCropCanvas');
  const ctx = canvas?.getContext('2d');
  if(!ctx) return;

  const scale = cropState.baseScale * cropState.zoom;
  const drawW = cropState.image.naturalWidth * scale;
  const drawH = cropState.image.naturalHeight * scale;
  const x = (CROP_CANVAS_SIZE - drawW) / 2 + cropState.offsetX;
  const y = (CROP_CANVAS_SIZE - drawH) / 2 + cropState.offsetY;

  ctx.clearRect(0,0,CROP_CANVAS_SIZE,CROP_CANVAS_SIZE);
  ctx.fillStyle = '#eaf4fa';
  ctx.fillRect(0,0,CROP_CANVAS_SIZE,CROP_CANVAS_SIZE);
  ctx.drawImage(cropState.image, x, y, drawW, drawH);
}

async function openCropUi(file){
  createCropUi();

  const objectUrl = URL.createObjectURL(file);
  const image = new Image();

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error('Could not read that image.'));
    image.src = objectUrl;
  });

  const baseScale = Math.max(
    CROP_CANVAS_SIZE / image.naturalWidth,
    CROP_CANVAS_SIZE / image.naturalHeight
  );

  cropState = {
    file,
    image,
    objectUrl,
    baseScale,
    zoom:1,
    offsetX:0,
    offsetY:0,
    dragging:false,
    lastX:0,
    lastY:0
  };

  const cropModal = document.getElementById('profileCropModal');
  cropModal.hidden = false;
  cropModal.setAttribute('aria-hidden','false');

  const zoom = document.getElementById('profileCropZoom');
  if(zoom) zoom.value = '1';

  clampCropOffsets();
  drawCrop();
}

function closeCropUi(){
  const cropModal = document.getElementById('profileCropModal');
  if(cropModal){
    cropModal.hidden = true;
    cropModal.setAttribute('aria-hidden','true');
  }

  if(cropState?.objectUrl){
    URL.revokeObjectURL(cropState.objectUrl);
  }
  cropState = null;
}

document.addEventListener('keydown', event => {
  if(event.key !== 'Escape') return;

  const cropModal = document.getElementById('profileCropModal');
  if(cropModal && !cropModal.hidden){
    event.preventDefault();
    closeCropUi();
    return;
  }

  if(modal && !modal.hidden) closeModal();
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

  try{
    setStatus(photoStatus, 'Adjust the crop, then confirm.');
    await openCropUi(file);
  }catch(err){
    setStatus(photoStatus, err?.message || 'Could not open the picture.', 'err');
  }
});

async function uploadAvatarBlob(blob){
  if(!session) await loadAccount();
  const uid = session?.user?.id;

  if(!uid){
    setStatus(photoStatus, 'Your session has expired. Please sign in again.', 'err');
    return;
  }

  chooseBtn.disabled = true;
  removeBtn && (removeBtn.disabled = true);
  setStatus(photoStatus, 'Uploading cropped picture…');

  const path = `${uid}/avatar`;

  try{
    const { error:uploadError } = await db.storage
      .from(BUCKET)
      .upload(path, blob, {
        upsert:true,
        contentType:'image/jpeg',
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

    window.dispatchEvent(new CustomEvent('profile-avatar-updated', {
      detail:{ userId:uid, avatarPath:path }
    }));

  }catch(err){
    setStatus(photoStatus, err?.message || 'Could not upload the picture.', 'err');
  }finally{
    chooseBtn.disabled = false;
    removeBtn && (removeBtn.disabled = !profile?.avatar_path);
  }
}

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

    window.dispatchEvent(new CustomEvent('profile-avatar-updated', {
      detail:{ userId:uid, avatarPath:null }
    }));
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

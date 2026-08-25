/* =========================================================
   PROFILE AVATAR SYNC
   Replaces staff initials with saved profile pictures wherever
   the dashboard currently renders avatar initials.
   ========================================================= */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://giosjwjhalhmwcuyzfos.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_";
const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const BUCKET = 'profile-pictures';
const profilesByName = new Map();
let painting = false;
let refreshPromise = null;
let lastRefresh = 0;

const avatarSyncStyle = document.createElement('style');
avatarSyncStyle.textContent = `
  .round-progress-avatar.has-avatar-photo{
    overflow:hidden;
    padding:0;
  }

  .round-progress-avatar.has-avatar-photo img{
    display:block;
    width:100%;
    height:100%;
    object-fit:cover;
  }
`;
document.head.appendChild(avatarSyncStyle);

const normalize = value => String(value || '')
  .toLowerCase()
  .replace(/\s+/g,' ')
  .trim();

function initials(name){
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts.length > 1 ? parts.at(-1)?.[0] || '' : '')).toUpperCase() || '—';
}

function avatarUrl(path){
  if(!path) return '';
  return db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

function paintHost(host, name){
  if(!host || !name) return;

  const profile = profilesByName.get(normalize(name));
  const path = profile?.avatar_path || '';
  const expectedKey = `${normalize(name)}|${path}`;

  if(host.dataset.avatarKey === expectedKey) return;
  host.dataset.avatarKey = expectedKey;
  host.innerHTML = '';
  host.classList.remove('has-avatar-photo');

  if(!path){
    host.textContent = initials(name);
    return;
  }

  const img = document.createElement('img');
  img.src = avatarUrl(path) + '?v=' + encodeURIComponent(profile.avatar_version || Date.now());
  img.alt = `${name} profile picture`;
  img.loading = 'lazy';

  img.addEventListener('error', () => {
    host.classList.remove('has-avatar-photo');
    host.innerHTML = '';
    host.textContent = initials(name);
    host.dataset.avatarKey = `${normalize(name)}|fallback`;
  }, { once:true });

  host.classList.add('has-avatar-photo');
  host.appendChild(img);
}

function paintAll(){
  if(painting) return;
  painting = true;

  try{
    document.querySelectorAll('.dash-live-eval-row').forEach(row => {
      const name = row.querySelector('.dash-live-evaluator')?.textContent?.trim();
      const host = row.querySelector('.dash-live-avatar');
      paintHost(host, name);
    });

    document.querySelectorAll('.dash-rank-row').forEach(row => {
      const name = row.querySelector('.dash-rank-name')?.textContent?.trim();
      const host = row.querySelector('.dash-rank-avatar');
      paintHost(host, name);
    });

    document.querySelectorAll('.round-progress-person').forEach(row => {
      const name = row.querySelector('.round-progress-name')?.textContent?.trim();
      const host = row.querySelector('.round-progress-avatar');
      paintHost(host, name);
    });

    const currentName = document.getElementById('acctName')?.textContent?.trim();
    document.querySelectorAll('[data-current-user-avatar]').forEach(host => {
      paintHost(host, currentName);
    });
  }finally{
    painting = false;
  }
}

async function refreshProfiles(force=false){
  const now = Date.now();
  if(!force && now - lastRefresh < 15000){
    paintAll();
    return;
  }

  if(refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try{
      const { data, error } = await db
        .from('profiles')
        .select('id, full_name, avatar_path')
        .order('full_name');

      if(error) return;

      profilesByName.clear();
      (data || []).forEach(p => {
        if(!p.full_name) return;
        profilesByName.set(normalize(p.full_name), {
          id:p.id,
          avatar_path:p.avatar_path || '',
          avatar_version:Date.now()
        });
      });

      lastRefresh = Date.now();
      paintAll();
    }catch(err){
      console.info('Profile avatar sync unavailable.', err);
    }finally{
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

let repaintQueued = false;
function queuePaint(){
  if(repaintQueued) return;
  repaintQueued = true;
  requestAnimationFrame(() => {
    repaintQueued = false;
    paintAll();
  });
}

const dashboard = document.getElementById('dashboardView');
if(dashboard){
  new MutationObserver(queuePaint).observe(dashboard, {
    childList:true,
    subtree:true,
    characterData:true
  });
}

const accountName = document.getElementById('acctName');
if(accountName){
  new MutationObserver(queuePaint).observe(accountName, {
    childList:true,
    subtree:true,
    characterData:true
  });
}

const roundProgressObserver = new MutationObserver(mutations => {
  const relevant = mutations.some(mutation => {
    const target = mutation.target;
    if(target?.nodeType === 1 && target.closest?.('.round-progress-modal')){
      return true;
    }

    return [...mutation.addedNodes].some(node => {
      if(node?.nodeType !== 1) return false;
      return (
        node.matches?.('.round-progress-modal,.round-progress-person,.round-progress-avatar') ||
        node.querySelector?.('.round-progress-modal,.round-progress-person,.round-progress-avatar')
      );
    });
  });

  if(relevant) queuePaint();
});

roundProgressObserver.observe(document.body, {
  childList:true,
  subtree:true,
  characterData:true
});

window.addEventListener('profile-avatar-updated', () => refreshProfiles(true));
window.addEventListener('focus', () => refreshProfiles());
document.addEventListener('visibilitychange', () => {
  if(document.visibilityState === 'visible') refreshProfiles();
});

// Other users' changed pictures are picked up without needing a full page reload.
setInterval(() => refreshProfiles(true), 60000);

refreshProfiles(true);

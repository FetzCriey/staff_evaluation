import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

/* =========================================================
   UNDO DESTRUCTIVE ACTIONS
   "Undo beats confirm" for actions that can be made safely
   reversible during a short grace period.

   Covered:
   - Reset one submission
   - Reset all live submissions for an employee
   - Remove staff
   - Remove own profile picture

   Permanent history deletion intentionally keeps its existing
   confirmation because it is a finalized archive record.
   ========================================================= */

const SUPABASE_URL = "https://giosjwjhalhmwcuyzfos.supabase.co";
const SUPABASE_KEY = "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_";
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const BUCKET = "profile-pictures";
const UNDO_MS = 6500;

let activeUndo = null;
let profileMapCache = null;
let profileMapAt = 0;

const normalize = value => String(value || "")
  .toLowerCase()
  .replace(/\s+/g," ")
  .trim();

function initials(name){
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return (
    (parts[0]?.[0] || "") +
    (parts.length > 1 ? parts.at(-1)?.[0] || "" : "")
  ).toUpperCase() || "—";
}

async function notice(title,message){
  if(typeof window.uiAlert === "function"){
    return window.uiAlert(title,message);
  }
  window.alert(title + "\n\n" + message);
}

function injectStyles(){
  if(document.getElementById("bp-undo-style")) return;

  const style = document.createElement("style");
  style.id = "bp-undo-style";
  style.textContent = `
    .bp-undo-toast{
      position:fixed;
      left:50%;
      bottom:max(18px,env(safe-area-inset-bottom));
      z-index:100200;
      width:min(430px,calc(100vw - 28px));
      transform:translateX(-50%);
      overflow:hidden;
      border:1px solid rgba(126,187,214,.34);
      border-radius:14px;
      background:linear-gradient(160deg,#102c3c 0%,#0a2030 100%);
      color:#fff;
      box-shadow:0 20px 54px -18px rgba(2,20,31,.65);
      animation:bpUndoIn .18s ease;
    }

    .bp-undo-main{
      display:flex;
      align-items:center;
      gap:11px;
      padding:11px 12px 10px;
    }

    .bp-undo-icon{
      flex:0 0 31px;
      width:31px;
      height:31px;
      display:grid;
      place-items:center;
      border:1px solid rgba(122,214,239,.32);
      border-radius:10px;
      background:rgba(21,172,227,.12);
      color:#71d8f6;
    }

    .bp-undo-copy{
      flex:1 1 auto;
      min-width:0;
    }

    .bp-undo-title{
      color:#fff;
      font-size:11.5px;
      line-height:1.25;
      font-weight:800;
      overflow-wrap:anywhere;
    }

    .bp-undo-sub{
      margin-top:2px;
      color:rgba(222,240,248,.69);
      font-size:9px;
      line-height:1.35;
    }

    .bp-undo-btn{
      flex:0 0 auto;
      min-width:68px;
      padding:8px 10px;
      border:1px solid rgba(65,210,190,.34);
      border-radius:9px;
      background:rgba(29,177,155,.14);
      color:#63e1cb;
      font:800 10px/1 "Inter",sans-serif;
      cursor:pointer;
    }

    .bp-undo-btn:hover{
      background:rgba(29,177,155,.22);
    }

    .bp-undo-progress{
      height:3px;
      background:rgba(255,255,255,.08);
    }

    .bp-undo-progress span{
      display:block;
      width:100%;
      height:100%;
      transform-origin:left center;
      background:linear-gradient(90deg,#20c6df,#39d6ba);
      animation:bpUndoCountdown ${UNDO_MS}ms linear forwards;
    }

    .bp-undo-toast.committing .bp-undo-btn{
      opacity:.55;
      pointer-events:none;
    }

    .bp-undo-toast.committing .bp-undo-sub::after{
      content:" · Saving…";
    }

    @keyframes bpUndoIn{
      from{opacity:0;transform:translate(-50%,8px)}
      to{opacity:1;transform:translate(-50%,0)}
    }

    @keyframes bpUndoCountdown{
      from{transform:scaleX(1)}
      to{transform:scaleX(0)}
    }

    @media(max-width:600px){
      .bp-undo-toast{
        bottom:max(12px,env(safe-area-inset-bottom));
        width:calc(100vw - 20px);
        border-radius:13px;
      }

      .bp-undo-main{
        padding:10px;
        gap:9px;
      }

      .bp-undo-icon{
        flex-basis:29px;
        width:29px;
        height:29px;
      }

      .bp-undo-title{
        font-size:11px;
      }

      .bp-undo-sub{
        font-size:8.5px;
      }

      .bp-undo-btn{
        min-width:62px;
        padding:8px;
      }
    }

    @media(prefers-reduced-motion:reduce){
      .bp-undo-toast{
        animation:none;
      }
    }
  `;

  document.head.appendChild(style);
}

function removeToast(state){
  state?.toast?.remove();
}

async function finalizeUndoState(state){
  if(!state || state.finished) return;

  state.finished = true;
  clearTimeout(state.timer);
  state.toast?.classList.add("committing");

  try{
    await state.commit?.();
    state.onCommitted?.();
  }catch(error){
    console.error("Undo action commit failed:",error);

    try{
      await state.rollback?.();
    }catch(rollbackError){
      console.error("Undo rollback after failed commit also failed:",rollbackError);
    }

    state.onCommitError?.(error);
  }finally{
    removeToast(state);
    if(activeUndo === state) activeUndo = null;
  }
}

async function undoState(state){
  if(!state || state.finished) return;

  state.finished = true;
  clearTimeout(state.timer);

  try{
    await state.rollback?.();
    state.onUndone?.();
  }catch(error){
    console.error("Undo failed:",error);
    state.onUndoError?.(error);
  }finally{
    removeToast(state);
    if(activeUndo === state) activeUndo = null;
  }
}

async function beginUndo({
  title,
  subtitle="Action will be finalized shortly.",
  commit,
  rollback,
  onCommitted,
  onUndone,
  onCommitError,
  onUndoError
}){
  // One clear Undo target at a time. A new destructive action finalizes
  // the previous pending one before opening its own snackbar.
  if(activeUndo && !activeUndo.finished){
    await finalizeUndoState(activeUndo);
  }

  const toast = document.createElement("div");
  toast.className = "bp-undo-toast";
  toast.setAttribute("role","status");
  toast.setAttribute("aria-live","polite");

  toast.innerHTML = `
    <div class="bp-undo-main">
      <div class="bp-undo-icon" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2.2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 7l-4 4 4 4"></path>
          <path d="M5 11h8a6 6 0 016 6"></path>
        </svg>
      </div>
      <div class="bp-undo-copy">
        <div class="bp-undo-title"></div>
        <div class="bp-undo-sub"></div>
      </div>
      <button class="bp-undo-btn" type="button">Undo</button>
    </div>
    <div class="bp-undo-progress"><span></span></div>
  `;

  toast.querySelector(".bp-undo-title").textContent = title;
  toast.querySelector(".bp-undo-sub").textContent = subtitle;

  document.body.appendChild(toast);

  const state = {
    toast,
    commit,
    rollback,
    onCommitted,
    onUndone,
    onCommitError,
    onUndoError,
    finished:false,
    timer:null
  };

  activeUndo = state;

  toast.querySelector(".bp-undo-btn")?.addEventListener("click",() => {
    undoState(state);
  });

  state.timer = setTimeout(() => {
    finalizeUndoState(state);
  },UNDO_MS);

  return state;
}

async function profileMap(force=false){
  if(!force && profileMapCache && Date.now() - profileMapAt < 5000){
    return profileMapCache;
  }

  const { data, error } = await db
    .from("profiles")
    .select("id,full_name");

  if(error) throw error;

  const byName = new Map();

  (data || []).forEach(row => {
    const key = normalize(row.full_name);
    if(!key) return;
    if(!byName.has(key)) byName.set(key,[]);
    byName.get(key).push(row);
  });

  profileMapCache = byName;
  profileMapAt = Date.now();
  return byName;
}

async function uniqueProfileId(name){
  const map = await profileMap();
  const matches = map.get(normalize(name)) || [];

  if(matches.length !== 1){
    throw new Error(
      matches.length
        ? `More than one staff member is named ${name}.`
        : `Could not find ${name} on the roster.`
    );
  }

  return matches[0].id;
}

function cleanStaffName(row){
  const node = row?.querySelector(".mgr-nm");
  if(!node) return "";

  const clone = node.cloneNode(true);
  clone.querySelectorAll(".tag").forEach(tag => tag.remove());
  return String(clone.textContent || "").trim();
}

async function manageUsers(payload){
  const { data, error } = await db.functions.invoke("manage-users",{
    body:payload
  });

  if(error){
    let detail = error.message;
    try{
      detail = (await error.context?.json())?.error || detail;
    }catch(_){}
    throw new Error(detail);
  }

  if(data?.error) throw new Error(data.error);
  return data;
}

function applyRoster(users){
  if(!Array.isArray(users)) return;
  window.setRoster?.(users);
  window.__syncEvaluationRoster?.(users);
}

function setRolesCountFromVisibleRows(){
  const count = [...document.querySelectorAll("#mgrList .mgr-row")]
    .filter(row => !row.hidden)
    .length;

  const host = document.getElementById("rolesCount");
  if(host) host.textContent = String(count);
}

function paintOwnAvatar(path,name){
  const url = path
    ? db.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
    : "";

  const paint = host => {
    if(!host) return;

    host.innerHTML = "";

    if(!url){
      host.textContent = initials(name);
      return;
    }

    const img = document.createElement("img");
    img.src = url + "?v=" + Date.now();
    img.alt = name ? `${name} profile picture` : "Profile picture";
    img.addEventListener("error",() => {
      host.innerHTML = "";
      host.textContent = initials(name);
    },{once:true});

    host.appendChild(img);
  };

  document
    .querySelectorAll("[data-current-user-avatar]")
    .forEach(paint);

  paint(document.getElementById("settingsAvatarPreview"));
}

async function handleRemoveProfilePicture(event,button){
  event.preventDefault();
  event.stopImmediatePropagation();

  if(button.disabled) return;

  const { data:{ session } } = await db.auth.getSession();
  const uid = session?.user?.id;

  if(!uid){
    await notice("Session expired","Please sign in again.");
    return;
  }

  const { data:profile, error } = await db
    .from("profiles")
    .select("full_name,avatar_path")
    .eq("id",uid)
    .maybeSingle();

  if(error){
    await notice("Could not remove picture",error.message);
    return;
  }

  const oldPath = profile?.avatar_path;
  if(!oldPath) return;

  const name =
    profile?.full_name ||
    session?.user?.email ||
    "Signed in user";

  const choose = document.getElementById("chooseProfilePhoto");
  const status = document.getElementById("photoSettingsStatus");

  button.disabled = true;
  if(choose) choose.disabled = true;

  // The reference changes immediately, so other users see the removal fast.
  // The physical storage object survives until the Undo window expires.
  const { error:updateError } = await db
    .from("profiles")
    .update({avatar_path:null})
    .eq("id",uid);

  if(updateError){
    button.disabled = false;
    if(choose) choose.disabled = false;
    await notice("Could not remove picture",updateError.message);
    return;
  }

  paintOwnAvatar(null,name);

  if(status){
    status.textContent = "Profile picture removed.";
    status.className = "settings-status ok";
  }

  window.dispatchEvent(new CustomEvent("profile-avatar-updated",{
    detail:{userId:uid,avatarPath:null}
  }));

  await beginUndo({
    title:"Profile picture removed",
    subtitle:"Undo to restore it.",
    commit:async () => {
      const { error:removeError } = await db.storage
        .from(BUCKET)
        .remove([oldPath]);

      // An orphaned old file is safer than breaking profile state.
      if(removeError){
        console.warn("Old profile picture cleanup failed:",removeError);
      }
    },
    rollback:async () => {
      const { error:restoreError } = await db
        .from("profiles")
        .update({avatar_path:oldPath})
        .eq("id",uid);

      if(restoreError) throw restoreError;

      paintOwnAvatar(oldPath,name);

      if(status){
        status.textContent = "Profile picture restored.";
        status.className = "settings-status ok";
      }

      window.dispatchEvent(new CustomEvent("profile-avatar-updated",{
        detail:{userId:uid,avatarPath:oldPath}
      }));
    },
    onCommitted:() => {
      if(choose) choose.disabled = false;
      button.disabled = true;
    },
    onUndone:() => {
      if(choose) choose.disabled = false;
      button.disabled = false;
    },
    onCommitError:async error => {
      if(choose) choose.disabled = false;
      button.disabled = false;
      await notice(
        "Could not finish removing the picture",
        error?.message || "The picture was restored."
      );
    },
    onUndoError:async error => {
      if(choose) choose.disabled = false;
      button.disabled = false;
      await notice(
        "Could not restore the picture",
        error?.message || "Please try uploading the picture again."
      );
    }
  });
}

async function handleRemoveStaff(event,button){
  event.preventDefault();
  event.stopImmediatePropagation();

  if(button.disabled) return;

  const row = button.closest(".mgr-row");
  const name = cleanStaffName(row);
  if(!row || !name) return;

  button.disabled = true;

  try{
    const listing = await manageUsers({action:"list"});
    const users = listing?.users || [];

    const emailHint = String(
      row.querySelector(".mgr-nm")?.title || ""
    ).split(" · ")[0].trim().toLowerCase();

    let matches = users.filter(user =>
      normalize(user.full_name) === normalize(name)
    );

    if(emailHint && emailHint !== "no sign-in account"){
      const exactEmail = matches.filter(user =>
        String(user.email || "").toLowerCase() === emailHint
      );
      if(exactEmail.length) matches = exactEmail;
    }

    if(matches.length !== 1){
      throw new Error(
        matches.length
          ? `More than one staff record matches ${name}.`
          : `Could not find ${name} in Staff Administration.`
      );
    }

    const user = matches[0];

    // Preserve the backend safety rule before showing the removal animation.
    const { count, error:countError } = await db
      .from("evaluations")
      .select("id",{count:"exact",head:true})
      .or(`employee_id.eq.${user.id},evaluator_id.eq.${user.id}`);

    if(countError) throw countError;

    if((count || 0) > 0){
      button.disabled = false;
      await notice(
        "Staff cannot be removed yet",
        `${name} has ${count} evaluation${count === 1 ? "" : "s"} on file. Remove those records first.`
      );
      return;
    }

    const filtered = users.filter(item => item.id !== user.id);
    const oldHidden = row.hidden;

    row.hidden = true;
    applyRoster(filtered);
    setRolesCountFromVisibleRows();

    await beginUndo({
      title:`${name} removed`,
      subtitle:"Undo before the account is permanently deleted.",
      commit:async () => {
        await manageUsers({action:"delete",id:user.id});
      },
      rollback:async () => {
        row.hidden = oldHidden;
        applyRoster(users);
        setRolesCountFromVisibleRows();
      },
      onCommitted:() => {
        row.remove();
        applyRoster(filtered);
        setRolesCountFromVisibleRows();
      },
      onUndone:() => {
        button.disabled = false;
      },
      onCommitError:async error => {
        row.hidden = oldHidden;
        button.disabled = false;
        applyRoster(users);
        setRolesCountFromVisibleRows();

        await notice(
          "Could not remove staff",
          error?.message || `${name} was restored.`
        );
      },
      onUndoError:async error => {
        button.disabled = false;
        await notice(
          "Could not undo staff removal",
          error?.message || "Reload Staff Administration to verify the account."
        );
      }
    });

  }catch(error){
    button.disabled = false;
    await notice(
      "Could not remove staff",
      error?.message || "Please try again."
    );
  }
}

function currentReviewEmployeeName(){
  return String(
    document.getElementById("empName")?.value || ""
  ).trim();
}

async function handleResetOne(event,button){
  event.preventDefault();
  event.stopImmediatePropagation();

  if(button.disabled) return;

  const item = button.closest(".rm-item");
  const evaluatorName =
    item?.querySelector(".rm-nm")?.textContent?.trim() || "";
  const employeeName = currentReviewEmployeeName();

  if(!item || !evaluatorName || !employeeName) return;

  button.disabled = true;

  try{
    const [employeeId,evaluatorId] = await Promise.all([
      uniqueProfileId(employeeName),
      uniqueProfileId(evaluatorName)
    ]);

    const { data:row, error } = await db
      .from("evaluations")
      .select("id")
      .eq("employee_id",employeeId)
      .eq("evaluator_id",evaluatorId)
      .eq("archived",false)
      .maybeSingle();

    if(error) throw error;
    if(!row?.id) throw new Error("That live submission no longer exists.");

    item.hidden = true;

    await beginUndo({
      title:`${evaluatorName}'s submission reset`,
      subtitle:`Undo to keep the scores for ${employeeName}.`,
      commit:async () => {
        const { error:deleteError } = await db
          .from("evaluations")
          .delete()
          .eq("id",row.id);

        if(deleteError) throw deleteError;
      },
      rollback:async () => {
        item.hidden = false;
        button.disabled = false;
      },
      onCommitted:() => {
        item.remove();
        window.__refreshResults?.();

        const body = document.getElementById("rmBody");
        if(body && !body.querySelector(".rm-item:not([hidden])")){
          body.innerHTML =
            '<div class="rm-empty">No submissions to clear.</div>';
        }
      },
      onUndone:() => {
        item.hidden = false;
        button.disabled = false;
      },
      onCommitError:async error => {
        item.hidden = false;
        button.disabled = false;

        await notice(
          "Could not reset submission",
          error?.message || "The submission was kept."
        );
      }
    });

  }catch(error){
    button.disabled = false;
    await notice(
      "Could not reset submission",
      error?.message || "Please try again."
    );
  }
}

async function handleResetAll(event,button){
  event.preventDefault();
  event.stopImmediatePropagation();

  if(button.disabled) return;

  const employeeName = currentReviewEmployeeName();
  if(!employeeName) return;

  button.disabled = true;

  try{
    const employeeId = await uniqueProfileId(employeeName);

    const { data:rows, error } = await db
      .from("evaluations")
      .select("id")
      .eq("employee_id",employeeId)
      .eq("archived",false);

    if(error) throw error;

    const ids = (rows || []).map(row => row.id);
    if(!ids.length){
      button.disabled = false;
      return;
    }

    const items = [
      ...document.querySelectorAll("#rmBody .rm-item")
    ];

    items.forEach(item => {
      item.hidden = true;
    });

    await beginUndo({
      title:`All submissions for ${employeeName} reset`,
      subtitle:`${ids.length} submission${ids.length === 1 ? "" : "s"} · Undo to keep them.`,
      commit:async () => {
        const { error:deleteError } = await db
          .from("evaluations")
          .delete()
          .eq("employee_id",employeeId)
          .eq("archived",false);

        if(deleteError) throw deleteError;
      },
      rollback:async () => {
        items.forEach(item => {
          item.hidden = false;
        });
        button.disabled = false;
      },
      onCommitted:() => {
        items.forEach(item => item.remove());

        const body = document.getElementById("rmBody");
        if(body){
          body.innerHTML =
            '<div class="rm-empty">No submissions to clear.</div>';
        }

        button.disabled = false;
        window.__refreshResults?.();
      },
      onUndone:() => {
        items.forEach(item => {
          item.hidden = false;
        });
        button.disabled = false;
      },
      onCommitError:async error => {
        items.forEach(item => {
          item.hidden = false;
        });
        button.disabled = false;

        await notice(
          "Could not reset submissions",
          error?.message || "The submissions were kept."
        );
      }
    });

  }catch(error){
    button.disabled = false;
    await notice(
      "Could not reset submissions",
      error?.message || "Please try again."
    );
  }
}

document.addEventListener("click",event => {
  const removePhoto = event.target.closest?.("#removeProfilePhoto");
  if(removePhoto){
    handleRemoveProfilePicture(event,removePhoto);
    return;
  }

  const removeStaff = event.target.closest?.(".mgr-del");
  if(removeStaff){
    handleRemoveStaff(event,removeStaff);
    return;
  }

  const resetOne = event.target.closest?.(".rm-x");
  if(resetOne){
    handleResetOne(event,resetOne);
    return;
  }

  const resetAll = event.target.closest?.("#rmAll");
  if(resetAll){
    handleResetAll(event,resetAll);
  }
},true);

injectStyles();

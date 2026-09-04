import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const INIT_KEY = "__staffHistoryDayDeleteInit_20260904";

if(!window[INIT_KEY]){
  window[INIT_KEY] = true;
  void initHistoryDayDelete();
}

async function initHistoryDayDelete(){
  const db = createClient(
    "https://giosjwjhalhmwcuyzfos.supabase.co",
    "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_"
  );

  const list = document.getElementById("hisList");
  if(!list) return;

  let canDeleteWholeDay = false;

  // Recycle Bin is intentionally loaded from this already-existing module so
  // index.html does not need another separate Recycle Bin script tag.
  import("./recycle-bin.js?v=20260904-1549").catch(error => {
    console.error("Recycle Bin module could not load.", error);
  });

  function refreshFinalizedViews(){
    try{
      if(typeof window.__refreshResults === "function"){
        window.__refreshResults();
      }
    }catch(error){
      console.warn("Could not refresh evaluation results after History change.", error);
    }

    window.dispatchEvent(new CustomEvent("staff-finalized-data-changed", {
      detail: { source: "history-delete" }
    }));
  }

  // Individual History deletion is handled inside js/supabase.js. That code
  // already reloads History, but previously did not explicitly start the same
  // dashboard refresh chain. Watch only after an individual delete button is
  // pressed; a successful loadHistory() rebuild then triggers the shared
  // refresh hook, which also invalidates dashboard-detail-enhancements teamCache.
  list.addEventListener("click", event => {
    const button = event.target.closest(".his-del");
    if(!button || !list.contains(button)) return;

    let settled = false;
    const observer = new MutationObserver(mutations => {
      if(settled) return;

      const rebuilt = mutations.some(mutation =>
        mutation.type === "childList" &&
        (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)
      );

      if(!rebuilt) return;

      settled = true;
      observer.disconnect();
      queueMicrotask(refreshFinalizedViews);
    });

    observer.observe(list, { childList:true, subtree:true });

    // Cancel the one-shot observer if the user cancels the confirmation or the
    // delete fails. This timer performs no data work; it only releases the observer.
    setTimeout(() => {
      if(settled) return;
      settled = true;
      observer.disconnect();
    }, 20000);
  }, true);

  function svgTrash(){
    return `
      <svg width="15" height="15" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M3 6h18"/>
        <path d="M8 6V4h8v2"/>
        <path d="M19 6l-1 14H6L5 6"/>
        <path d="M10 11v5M14 11v5"/>
      </svg>`;
  }

  function parseLocalDay(dateKey){
    const m = String(dateKey || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if(!m) return null;

    const start = new Date(
      Number(m[1]),
      Number(m[2]) - 1,
      Number(m[3]),
      0, 0, 0, 0
    );
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    return { start, end };
  }

  function labelForGroup(group){
    return group.querySelector(".his-date-label")?.textContent?.trim()
      || group.dataset.historyDateKey
      || "this day";
  }

  async function confirmDelete(label, count){
    const message =
      `All ${count} archived evaluation${count === 1 ? "" : "s"} from ${label} ` +
      `will be moved to the Recycle Bin.`;

    if(typeof window.uiConfirm === "function"){
      return window.uiConfirm(
        "Delete all evaluations from this day?",
        message,
        { ok:"Delete whole day", danger:true }
      );
    }

    return window.confirm(message);
  }

  async function showError(message){
    if(typeof window.uiAlert === "function"){
      await window.uiAlert("Could not delete evaluations", message);
      return;
    }
    window.alert("Could not delete evaluations\n\n" + message);
  }

  async function deleteWholeDay(group, button){
    const key = group.dataset.historyDateKey;
    const range = parseLocalDay(key);
    if(!range){
      await showError("The evaluation date could not be read.");
      return;
    }

    const countText = group.querySelector(".his-date-count")?.textContent || "";
    const count = Number(countText.match(/\d+/)?.[0]) || group.querySelectorAll(".his-row").length;
    const label = labelForGroup(group);

    if(!await confirmDelete(label, count)) return;

    button.disabled = true;
    button.setAttribute("aria-busy", "true");

    try{
      const { data, error } = await db
        .from("evaluations")
        .delete()
        .eq("archived", true)
        .gte("archived_at", range.start.toISOString())
        .lt("archived_at", range.end.toISOString())
        .select("id");

      if(error) throw error;

      if(!data?.length){
        throw new Error(
          "No archived evaluations were deleted. Your account may not have permission."
        );
      }

      // Whole-day deletion already used a full reload. Keep that behavior so
      // History, rankings, cards, trends and Team Average all re-read Supabase.
      window.location.reload();
    }catch(error){
      button.disabled = false;
      button.removeAttribute("aria-busy");
      await showError(error?.message || "Unknown error");
    }
  }

  function enhanceGroup(group){
    if(!canDeleteWholeDay || group.dataset.dayDeleteReady === "1") return;

    const summary = group.querySelector(":scope > .his-date-sum");
    if(!summary) return;

    group.dataset.dayDeleteReady = "1";

    const head = document.createElement("div");
    head.className = "his-day-delete-head";

    summary.parentNode.insertBefore(head, summary);
    head.appendChild(summary);

    const del = document.createElement("button");
    del.type = "button";
    del.className = "his-day-delete-btn";
    del.title = "Delete all evaluations from this day";
    del.setAttribute("aria-label", "Delete all evaluations from " + labelForGroup(group));
    del.innerHTML = svgTrash();

    del.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      deleteWholeDay(group, del);
    });

    head.appendChild(del);
  }

  function enhanceAll(){
    if(!canDeleteWholeDay) return;
    list.querySelectorAll(".his-date-group").forEach(enhanceGroup);
  }

  const { data:{ session } } = await db.auth.getSession();
  if(!session) return;

  const { data: profile } = await db
    .from("profiles")
    .select("role, form_role")
    .eq("id", session.user.id)
    .maybeSingle();

  canDeleteWholeDay =
    profile?.role === "manager" ||
    profile?.form_role === "Senior Staff";

  if(!canDeleteWholeDay) return;

  enhanceAll();

  new MutationObserver(enhanceAll).observe(list, {
    childList:true,
    subtree:true
  });
}

/* =========================================================
   EXEMPTED EVALUATION RESULTS — REFRESH STABILITY
   round-exemptions.js refreshes its roster periodically and on focus.
   Its internal sync calls __syncEvaluationRoster(), which rebuilds the
   Evaluation Results list. Rebuilding an unchanged list makes exempted
   cards briefly flash from a normal result row into their exempted state.

   This wrapper only forwards roster syncs when the effective roster really
   changed. Database polling, exemption reason updates, Realtime, and UI
   patching continue to work normally.
   ========================================================= */

(() => {
  const WRAP_FLAG = "__bpExemptedResultsStabilityWrapped";
  const ORIGINAL_KEY = "__bpExemptedResultsStabilityOriginal";

  function normalizedSignature(rows){
    if(!Array.isArray(rows)) return "";

    const normalized = rows.map(row => [
      String(row?.id || ""),
      String(row?.full_name || ""),
      String(row?.position || ""),
      String(row?.role || ""),
      String(row?.form_role || ""),
      row?.has_login === false ? "0" : "1",
      row?.exempted === true ? "1" : "0"
    ]);

    normalized.sort((a,b) => {
      const aKey = a.join("\u001f");
      const bKey = b.join("\u001f");
      return aKey.localeCompare(bKey);
    });

    return JSON.stringify(normalized);
  }

  function install(){
    const current = window.__syncEvaluationRoster;

    if(typeof current !== "function") return false;
    if(current[WRAP_FLAG]) return true;

    const original = current;
    let lastSignature = null;

    function stableRosterSync(rows, ...rest){
      if(!Array.isArray(rows)){
        return original.call(this, rows, ...rest);
      }

      const signature = normalizedSignature(rows);

      if(signature && signature === lastSignature){
        return;
      }

      lastSignature = signature;
      return original.call(this, rows, ...rest);
    }

    stableRosterSync[WRAP_FLAG] = true;
    stableRosterSync[ORIGINAL_KEY] = original;
    window.__syncEvaluationRoster = stableRosterSync;
    return true;
  }

  if(install()) return;

  const startedAt = Date.now();
  const timer = setInterval(() => {
    if(install() || Date.now() - startedAt > 15000){
      clearInterval(timer);
    }
  }, 50);

  window.addEventListener("pageshow", install, { passive:true });
})();

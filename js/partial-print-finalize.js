(() => {
  "use strict";

  /*
    PRINT -> DIRECT HISTORY

    This script intentionally runs after evaluation.js but before supabase.js.

    Behaviour:
    - Manager / Senior Staff may print a live Preview before every evaluator
      has submitted.
    - Only evaluator columns that are already Submitted AND have every criterion
      completed are included in the printed form.
    - Missing or unfinished evaluator columns are not printed.
    - The exact completed submissions included in that print are then archived
      to the normal History table immediately.
    - Archived History printing is left unchanged.
    - PDF / Word behaviour is left unchanged.
  */

  const printButton = document.getElementById("printBtn");
  const api = window.evalApi;

  if(!printButton || !api) return;

  // evaluation.js assigns the real print function through the onclick property.
  // Keep that exact handler so the site's existing print design is preserved.
  const originalPrintHandler = printButton.onclick;
  if(typeof originalPrintHandler !== "function"){
    console.warn("Direct History Print: original print handler was not found.");
    return;
  }

  const SUPABASE_URL = "https://giosjwjhalhmwcuyzfos.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_";

  const norm = value =>
    String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();

  const safeAlert = (title, message) => {
    if(typeof window.uiAlert === "function"){
      void window.uiAlert(title, message);
      return;
    }
    window.alert(title + "\n\n" + message);
  };

  function isArchivedHistoryView(){
    const note = document.getElementById("archNote");
    return !!note && !note.classList.contains("hide");
  }

  function hasUnsavedReviewerCorrections(){
    const fix = document.getElementById("fixBtn");
    if(!fix || fix.classList.contains("hide")) return false;
    return !fix.disabled;
  }

  function allCriteriaComplete(scores, criteriaCount){
    if(!scores || criteriaCount <= 0) return false;

    for(let index = 0; index < criteriaCount; index += 1){
      const value = Number(scores[String(index)]);
      if(!Number.isFinite(value) || value < 1 || value > 5){
        return false;
      }
    }

    return true;
  }

  function capturePreview(){
    const cards = [
      ...document.querySelectorAll("#reviewRemarks .review-remark-card")
    ];

    const criteriaCount = Number(api.criteriaCount?.() || 0);
    const originalComment = String(api.comments?.() || "");
    const summary =
      document.querySelector("#reviewRemarks .review-summary-input")?.value || "";

    const rows = cards.map((card, index) => {
      const name =
        card.querySelector(".review-remark-name")?.textContent?.trim() ||
        "Evaluator";

      const state = card.querySelector(".review-remark-state");
      const submitted =
        !!state &&
        (
          state.classList.contains("submitted") ||
          norm(state.textContent) === "submitted"
        );

      const comment =
        card.querySelector(".review-remark-input")?.value || "";

      const scores = api.getColumnScores(index) || {};
      const complete = allCriteriaComplete(scores, criteriaCount);

      return {
        index,
        name,
        submitted,
        complete,
        comment,
        scores:{ ...scores }
      };
    });

    return {
      employeeName:String(api.employeeName?.() || "").trim(),
      criteriaCount,
      originalComment,
      summary,
      rows,
      printable:rows.filter(row => row.submitted && row.complete)
    };
  }

  function printedComment(snapshot){
    const summary = String(snapshot.summary || "").trim();
    if(summary) return summary;

    return snapshot.printable
      .map(row => {
        const text = String(row.comment || "").trim();
        return text ? row.name + ": " + text : "";
      })
      .filter(Boolean)
      .join("\n");
  }

  function paintRows(rows, comment){
    if(typeof api.clearScores === "function"){
      api.clearScores();
    }

    api.setColumns(rows.map(row => row.name));

    rows.forEach((row, index) => {
      api.setColumnScores(index, row.scores);
    });

    api.setComments(comment);
  }

  function restorePreview(snapshot){
    try{
      paintRows(snapshot.rows, snapshot.originalComment);
    }catch(error){
      console.warn("Direct History Print: could not restore Preview.", error);
    }
  }

  async function archivePrintedRows(snapshot){
    const status = document.getElementById("status");

    try{
      if(status){
        status.textContent = "Moving printed evaluation to History…";
      }

      const { createClient } = await import(
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm"
      );

      const db = createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
      );

      const { data:{ session } } = await db.auth.getSession();
      if(!session){
        throw new Error("Your session is no longer active.");
      }

      // Re-check access here. The button is hidden from unauthorized users,
      // but this makes the print-to-history action fail closed as well.
      const { data:profile, error:profileError } = await db
        .from("profiles")
        .select("role,form_role")
        .eq("id", session.user.id)
        .maybeSingle();

      if(profileError) throw profileError;

      const canFinalize =
        profile?.role === "manager" ||
        profile?.form_role === "Senior Staff";

      if(!canFinalize){
        throw new Error(
          "Only Manager or Senior Staff can move a printed evaluation to History."
        );
      }

      const { data:roster, error:rosterError } =
        await db.rpc("get_evaluation_roster");

      if(rosterError) throw rosterError;

      const rosterRows = Array.isArray(roster) ? roster : [];
      const byName = new Map();

      rosterRows.forEach(person => {
        if(person?.id && person?.full_name){
          byName.set(norm(person.full_name), person);
        }
      });

      const employee = byName.get(norm(snapshot.employeeName));
      if(!employee?.id){
        throw new Error("The employee could not be matched to the current roster.");
      }

      const evaluatorIds = snapshot.printable
        .map(row => byName.get(norm(row.name))?.id)
        .filter(Boolean);

      if(!evaluatorIds.length){
        throw new Error("No completed evaluator submissions were found.");
      }

      // Re-read the database before archiving. Only the exact evaluator names
      // included in the print are eligible, and each row must still be locked
      // and complete.
      const { data:activeRows, error:activeError } = await db
        .from("evaluations")
        .select("id,evaluator_id,scores,locked")
        .eq("employee_id", employee.id)
        .eq("archived", false)
        .in("evaluator_id", evaluatorIds);

      if(activeError) throw activeError;

      const printableIds = (activeRows || [])
        .filter(row =>
          row.locked &&
          evaluatorIds.includes(row.evaluator_id) &&
          allCriteriaComplete(row.scores || {}, snapshot.criteriaCount)
        )
        .map(row => row.id);

      if(!printableIds.length){
        throw new Error(
          "The completed submissions changed before they could be moved to History."
        );
      }

      const stamp = new Date().toISOString();

      const { data:archivedRows, error:archiveError } = await db
        .from("evaluations")
        .update({
          archived:true,
          archived_at:stamp,
          archived_by:session.user.id,
          locked:true
        })
        .in("id", printableIds)
        .select("id");

      if(archiveError) throw archiveError;

      if(!archivedRows?.length){
        throw new Error(
          "The database did not move the printed evaluation to History."
        );
      }

      // Keep finalized dashboards, rankings, History augmenters and other
      // listeners synchronized with the same database state.
      window.dispatchEvent(new CustomEvent("staff-finalized-data-changed", {
        detail:{
          source:"print-direct-history",
          employee_id:employee.id,
          archived_at:stamp,
          evaluator_count:archivedRows.length
        }
      }));

      if(status){
        status.textContent =
          "Printed evaluation moved to History.";
      }

      // A reload guarantees Results, History and dashboard caches all re-read
      // Supabase after the archive operation.
      window.setTimeout(() => {
        window.location.reload();
      }, 650);
    }catch(error){
      console.error("Direct History Print:", error);

      if(status){
        status.textContent = "";
      }

      safeAlert(
        "Printed, but History was not updated",
        error?.message || "The evaluation could not be moved to History."
      );
    }
  }

  /*
    Register in capture phase BEFORE supabase.js registers its own print guard.
    This lets Print use the user's requested partial-finalization rule while
    leaving PDF and Word under the site's existing all-evaluators rule.
  */
  printButton.addEventListener("click", event => {
    // Archived records already live in History. Let all existing handlers run
    // normally so re-printing History never creates another History record.
    if(isArchivedHistoryView()) return;

    event.preventDefault();
    event.stopImmediatePropagation();

    if(hasUnsavedReviewerCorrections()){
      safeAlert(
        "Save corrections first",
        "Save the score, evaluator remark, or Main Overall Comment changes before printing."
      );
      return;
    }

    const snapshot = capturePreview();

    if(!snapshot.employeeName){
      safeAlert(
        "No employee selected",
        "Open an employee from Evaluation results before printing."
      );
      return;
    }

    if(!snapshot.printable.length){
      safeAlert(
        "No completed evaluation yet",
        "At least one evaluator must submit all criteria before the form can be printed."
      );
      return;
    }

    /*
      Temporarily remove unfinished columns from the in-memory form so the
      existing print renderer sees only fully submitted evaluator forms.
      The real print function is called DIRECTLY and synchronously to preserve
      mobile/desktop popup permission from the user's click.
    */
    try{
      paintRows(snapshot.printable, printedComment(snapshot));

      originalPrintHandler.call(printButton);
    }catch(error){
      console.error("Direct History Print: print failed.", error);
      safeAlert(
        "Could not print",
        error?.message || "The print window could not be created."
      );
      restorePreview(snapshot);
      return;
    }

    // Restore the on-screen Preview immediately. The printed window already
    // captured the filtered data synchronously.
    window.setTimeout(() => restorePreview(snapshot), 0);

    // No second Finalise confirmation: the user's requested rule is
    // Print -> History directly.
    void archivePrintedRows(snapshot);
  }, true);
})();

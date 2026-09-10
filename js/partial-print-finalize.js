(() => {
  "use strict";

  /*
    PARTIAL EXPORT -> DIRECT HISTORY

    Runs after evaluation.js and before supabase.js.

    Same rule for:
      - Print
      - Export to PDF
      - Export to Word

    Live Preview behaviour:
      1. At least one evaluator must already be Submitted.
      2. Every criterion in that submitted evaluator's form must be complete.
      3. Only those completed+submitted evaluator columns are exported.
      4. The exact exported rows are moved to normal History.
      5. Unfinished / draft / missing evaluator rows remain active and unchanged.
      6. Existing History records can still be re-printed / re-exported normally.
  */

  const api = window.evalApi;
  if(!api) return;

  const buttons = {
    printBtn: {
      label:"Print",
      working:"Moving printed evaluation to History…",
      done:"Printed evaluation moved to History."
    },
    pdfBtn: {
      label:"PDF",
      working:"Moving exported PDF evaluation to History…",
      done:"PDF evaluation moved to History."
    },
    exportBtn: {
      label:"Word",
      working:"Moving exported Word evaluation to History…",
      done:"Word evaluation moved to History."
    }
  };

  const originals = new Map();

  for(const id of Object.keys(buttons)){
    const button = document.getElementById(id);
    if(!button) continue;

    const handler = button.onclick;
    if(typeof handler === "function"){
      originals.set(id, handler);
    }
  }

  if(!originals.size){
    console.warn("Partial Export History: no original export handlers were found.");
    return;
  }

  const SUPABASE_URL = "https://giosjwjhalhmwcuyzfos.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_";

  const norm = value =>
    String(value ?? "").trim().replace(/\s+/g, " ").toLowerCase();

  function safeAlert(title, message){
    if(typeof window.uiAlert === "function"){
      void window.uiAlert(title, message);
      return;
    }
    window.alert(title + "\n\n" + message);
  }

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

      return {
        index,
        name,
        submitted,
        complete:allCriteriaComplete(scores, criteriaCount),
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

  function exportedComment(snapshot){
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
      console.warn("Partial Export History: could not restore Preview.", error);
    }
  }

  async function archiveExportedRows(snapshot, buttonId){
    const status = document.getElementById("status");
    const config = buttons[buttonId];

    try{
      if(status){
        status.textContent = config?.working || "Moving evaluation to History…";
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

      // Re-check authorization before changing evaluation rows.
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
          "Only Manager or Senior Staff can move an exported evaluation to History."
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

      const evaluatorIds = [
        ...new Set(
          snapshot.printable
            .map(row => byName.get(norm(row.name))?.id)
            .filter(Boolean)
        )
      ];

      if(!evaluatorIds.length){
        throw new Error("No completed evaluator submissions were found.");
      }

      /*
        Important: only fetch the evaluator rows that were actually included
        in this export. Every other active row is intentionally left alone.
      */
      const { data:activeRows, error:activeError } = await db
        .from("evaluations")
        .select("id,evaluator_id,scores,locked")
        .eq("employee_id", employee.id)
        .eq("archived", false)
        .in("evaluator_id", evaluatorIds);

      if(activeError) throw activeError;

      const exportedIds = (activeRows || [])
        .filter(row =>
          row.locked &&
          evaluatorIds.includes(row.evaluator_id) &&
          allCriteriaComplete(row.scores || {}, snapshot.criteriaCount)
        )
        .map(row => row.id);

      if(!exportedIds.length){
        throw new Error(
          "The completed submissions changed before they could be moved to History."
        );
      }

      const stamp = new Date().toISOString();

      /*
        Archive ONLY the exact completed rows that were exported.
        Unfinished/draft evaluator rows remain archived=false and are not
        modified, so those evaluators can continue their current work.
      */
      const { data:archivedRows, error:archiveError } = await db
        .from("evaluations")
        .update({
          archived:true,
          archived_at:stamp,
          archived_by:session.user.id,
          locked:true
        })
        .in("id", exportedIds)
        .select("id");

      if(archiveError) throw archiveError;

      if(!archivedRows?.length){
        throw new Error(
          "The database did not move the exported evaluation to History."
        );
      }

      window.dispatchEvent(new CustomEvent("staff-finalized-data-changed", {
        detail:{
          source:"partial-export-direct-history",
          export_type:buttonId,
          employee_id:employee.id,
          archived_at:stamp,
          evaluator_count:archivedRows.length
        }
      }));

      if(status){
        status.textContent = config?.done || "Evaluation moved to History.";
      }

      // Refresh all Results/History/dashboard state from Supabase.
      window.setTimeout(() => {
        window.location.reload();
      }, 650);
    }catch(error){
      console.error("Partial Export History:", error);

      if(status){
        status.textContent = "";
      }

      safeAlert(
        "Export completed, but History was not updated",
        error?.message || "The evaluation could not be moved to History."
      );
    }
  }

  function exportLooksSuccessful(buttonId){
    /*
      Print does not expose a reliable completion status.
      PDF and Word handlers set a success message synchronously after their
      builders finish, so avoid archiving when those builders reported failure.
    */
    if(buttonId === "printBtn") return true;

    const status = String(
      document.getElementById("status")?.textContent || ""
    ).toLowerCase();

    if(buttonId === "pdfBtn"){
      return status.includes("pdf downloaded");
    }

    if(buttonId === "exportBtn"){
      return status.includes("word downloaded");
    }

    return true;
  }

  for(const [buttonId, originalHandler] of originals){
    const button = document.getElementById(buttonId);
    if(!button) continue;

    /*
      Capture-phase registration happens before supabase.js attaches its
      all-evaluators-finalization guard. For live Preview we therefore apply
      the new partial-export rule. For archived History we do nothing and let
      the existing handlers behave normally.
    */
    button.addEventListener("click", event => {
      if(isArchivedHistoryView()) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if(hasUnsavedReviewerCorrections()){
        safeAlert(
          "Save corrections first",
          "Save the score, evaluator remark, or Main Overall Comment changes before exporting."
        );
        return;
      }

      const snapshot = capturePreview();

      if(!snapshot.employeeName){
        safeAlert(
          "No employee selected",
          "Open an employee from Evaluation results before exporting."
        );
        return;
      }

      if(!snapshot.printable.length){
        safeAlert(
          "No completed evaluation yet",
          "At least one evaluator must submit all criteria before Print, PDF, or Word can be used."
        );
        return;
      }

      /*
        Temporarily expose only completed + submitted evaluator columns to
        evaluation.js. This makes the existing Print/PDF/Word generators use
        exactly the same filtered dataset without changing their layouts.
      */
      try{
        paintRows(snapshot.printable, exportedComment(snapshot));

        const result = originalHandler.call(button);

        // The Word handler is async; normalize it with Promise.resolve.
        Promise.resolve(result)
          .then(() => {
            if(!exportLooksSuccessful(buttonId)){
              restorePreview(snapshot);
              return;
            }

            restorePreview(snapshot);
            void archiveExportedRows(snapshot, buttonId);
          })
          .catch(error => {
            console.error("Partial Export History: export failed.", error);
            restorePreview(snapshot);
            safeAlert(
              "Could not export",
              error?.message || "The requested export could not be created."
            );
          });
      }catch(error){
        console.error("Partial Export History: export failed.", error);
        restorePreview(snapshot);
        safeAlert(
          "Could not export",
          error?.message || "The requested export could not be created."
        );
      }
    }, true);
  }
})();

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

(() => {
  const SUPABASE_URL = "https://giosjwjhalhmwcuyzfos.supabase.co";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_";
  const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

  const FORM_DEFS = {
    "Probationary": {
      title: "BETTER PRACTICE PROBATIONARY EMPLOYEE PERFORMANCE EVALUATION FORM",
      rows: [
        ["Attendance & Punctuality", "Reports to work on time and follows schedule consistently."],
        ["Willingness to Learn", "Shows initiative in learning processes, systems, and assigned tasks."],
        ["Quality of Work", "Accuracy, completeness, and attention to detail in assigned work."],
        ["Productivity", "Ability to complete assigned tasks within expected turnaround time."],
        ["Communication Skills", "Professional and clear communication with teammates and clients."],
        ["Teamwork & Cooperation", "Works well with the team and follows instructions properly."],
        ["Accountability & Reliability", "Takes ownership of assigned responsibilities and follows through on tasks."],
        ["Adaptability", "Ability to adjust to new tasks, corrections, workload changes, and feedback."],
        ["Professionalism", "Demonstrates proper attitude, respect, integrity, and work ethics."],
        ["Overall Performance & Potential", "Shows readiness for regularization and long-term growth within the company."]
      ]
    },
    "Junior Staff": {
      title: "BETTER PRACTICE JUNIOR STAFF PERFORMANCE EVALUATION FORM",
      rows: [
        ["Accuracy & Quality of Work", "Accuracy in endorsements, onboarding, monitoring, encoding, and document handling."],
        ["Productivity & Task Completion", "Ability to complete assigned tasks, follow-ups, endorsements, and monitoring on time."],
        ["Client Communication", "Professionalism, responsiveness, and clarity in SMS, Viber, email, and client handling."],
        ["Turnaround Time", "Speed and efficiency in handling client concerns, onboarding, and endorsements."],
        ["Monitoring & Follow-Up", "Consistency in tracking pending requirements, onboarding status, and client updates."],
        ["Team Coordination", "Proper coordination with CRO, Compliance, Operations, Billing, and other teams."],
        ["Accountability & Reliability", "Ownership of tasks, attendance, punctuality, and ability to follow instructions properly."],
        ["Adaptability & Initiative", "Shows respect, integrity, proper work ethics, and professionalism in all interactions."],
        ["Professionalism", "Willingness to learn and improve skills."],
        ["Position-Specific Performance", "Performance based on assigned role responsibilities and workload."]
      ]
    },
    "Senior Staff": {
      title: "BETTER PRACTICE SENIOR EVALUATION FORM",
      rows: [
        ["Leadership & Team Guidance", "Ability to guide, support, and motivate team members effectively."],
        ["Team Productivity & Task Management", "Proper delegation, monitoring, and completion of team tasks and deadlines."],
        ["Decision-Making & Problem Solving", "Ability to resolve issues, escalations, and operational concerns efficiently."],
        ["Communication Skills", "Clear, professional, and timely communication with team members and clients."],
        ["Quality Control & Accuracy", "Reviews endorsements, onboarding, monitoring, and outputs for completeness and accuracy."],
        ["Workload Management", "Ability to balance workloads fairly and support high-volume or urgent cases."],
        ["Accountability & Reliability", "Ownership of team performance, punctuality, follow-through, and consistency."],
        ["Coaching & Staff Development", "Provides training, guidance, and constructive feedback to junior staff."],
        ["Professionalism", "Demonstrates integrity, professionalism, and proper handling of sensitive situations."],
        ["Team Performance Outcome", "Overall team performance, turnaround time, coordination, and client satisfaction under the team leader's supervision."]
      ]
    }
  };

  const list = document.getElementById("hisList");
  const historyCount = document.getElementById("hisCount");
  if(!list || !historyCount) return;

  let canView = false;
  let canPrint = false;
  let rosterById = new Map();
  let activeExemptions = new Set();
  let currentRows = [];
  let archivedRoundCount = 0;
  let refreshTimer = null;
  let refreshing = false;
  let refreshAgain = false;
  let modal = null;

  function esc(value){
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function localDateKey(value){
    const d = new Date(value);
    if(Number.isNaN(d.getTime())) return "unknown";
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0")
    ].join("-");
  }

  function dateLabel(value){
    const d = new Date(value);
    if(Number.isNaN(d.getTime())) return "Unknown date";
    return d.toLocaleDateString(undefined, {
      weekday:"short",
      month:"long",
      day:"numeric",
      year:"numeric"
    });
  }

  function dateTimeLabel(value){
    const d = new Date(value);
    if(Number.isNaN(d.getTime())) return "Unknown date";
    return d.toLocaleString(undefined, {
      month:"long",
      day:"numeric",
      year:"numeric",
      hour:"numeric",
      minute:"2-digit"
    });
  }

  function timeLabel(value){
    const d = new Date(value);
    if(Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString(undefined, { hour:"numeric", minute:"2-digit" });
  }

  function person(id){
    return rosterById.get(id) || { id, full_name:"Unknown", position:"", form_role:"", has_login:true };
  }

  function formDef(role){
    return FORM_DEFS[role] || null;
  }

  function isCompleteSubmission(row){
    if(!row?.locked) return false;
    const def = formDef(row.form_role);
    if(!def?.rows?.length) return false;
    const scores = row.scores || {};
    return def.rows.every((_, index) => {
      const value = Number(scores[String(index)]);
      return Number.isFinite(value) && value >= 1 && value <= 5;
    });
  }

  function eligibleEvaluatorIds(){
    return [...rosterById.values()]
      .filter(row => row?.id && row.has_login !== false && !activeExemptions.has(row.id))
      .map(row => row.id);
  }

  function submissionState(row){
    const eligible = eligibleEvaluatorIds();
    const expected = eligible.filter(id => id !== row.employee_id);
    const submitted = new Set(
      currentRows
        .filter(r => r.employee_id === row.employee_id && r.locked)
        .map(r => r.evaluator_id)
        .filter(id => expected.includes(id))
    );
    const missing = expected.filter(id => !submitted.has(id));

    return {
      expected:expected.length,
      submitted:submitted.size,
      missing,
      ready:expected.length > 0 && missing.length === 0
    };
  }

  function scoreStats(row){
    const def = formDef(row.form_role);
    const values = (def?.rows || []).map((_, i) => Number(row.scores?.[String(i)]));
    const valid = values.filter(Number.isFinite);
    const total = valid.reduce((a,b) => a + b, 0);
    const average = valid.length ? total / valid.length : 0;
    return { total, average };
  }

  function injectStyles(){
    if(document.getElementById("bpIndividualSubmissionHistoryStyle")) return;

    const style = document.createElement("style");
    style.id = "bpIndividualSubmissionHistoryStyle";
    style.textContent = `
      .bp-pending-history{
        margin:0 0 10px;
        padding:0 0 10px;
        border-bottom:1px solid var(--line,#c9dfee);
      }
      .bp-pending-history-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        padding:8px 4px 9px;
      }
      .bp-pending-history-title{
        color:var(--ink-soft,#28455c);
        font-size:9px;
        font-weight:850;
        letter-spacing:.12em;
        text-transform:uppercase;
      }
      .bp-pending-history-badge{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-width:22px;
        height:22px;
        padding:0 7px;
        border:1px solid rgba(var(--bp-accent-rgb,21,172,227),.25);
        border-radius:999px;
        background:rgba(var(--bp-accent-rgb,21,172,227),.10);
        color:var(--lagoon-deep,#0b7fb0);
        font-size:9px;
        font-weight:850;
      }
      .bp-pending-date-group{
        overflow:hidden;
        margin-bottom:7px;
        border:1px solid var(--line,#c9dfee);
        border-radius:12px;
        background:var(--panel,#fff);
      }
      .bp-pending-date-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        padding:9px 10px;
        border-bottom:1px solid var(--line,#c9dfee);
        background:var(--bp-theme-surface-2,#f4fafd);
      }
      .bp-pending-date-label{
        color:var(--ink,#0a2233);
        font-size:10px;
        font-weight:800;
      }
      .bp-pending-date-count{
        color:var(--muted,#5b7080);
        font-size:8.5px;
        font-weight:750;
        white-space:nowrap;
      }
      .bp-pending-row{
        display:grid;
        grid-template-columns:minmax(0,1fr) auto;
        align-items:center;
        gap:8px;
        padding:9px;
        border-bottom:1px solid var(--line,#c9dfee);
      }
      .bp-pending-row:last-child{border-bottom:0}
      .bp-pending-open{
        min-width:0;
        padding:0;
        border:0;
        background:transparent;
        color:inherit;
        text-align:left;
        cursor:pointer;
      }
      .bp-pending-name{
        overflow:hidden;
        color:var(--ink,#0a2233);
        font-size:10.5px;
        font-weight:800;
        text-overflow:ellipsis;
        white-space:nowrap;
      }
      .bp-pending-meta{
        display:flex;
        flex-wrap:wrap;
        gap:3px 6px;
        margin-top:3px;
        color:var(--muted,#5b7080);
        font-size:8.6px;
        line-height:1.35;
      }
      .bp-pending-state{
        display:flex;
        flex-direction:column;
        align-items:flex-end;
        gap:4px;
      }
      .bp-pending-status{
        max-width:105px;
        padding:4px 7px;
        border:1px solid rgba(var(--bp-accent-rgb,21,172,227),.30);
        border-radius:999px;
        background:rgba(var(--bp-accent-rgb,21,172,227),.09);
        color:var(--lagoon-deep,#0b7fb0);
        font-size:7.8px;
        font-weight:850;
        line-height:1.2;
        text-align:center;
      }
      .bp-pending-status.ready{
        border-color:rgba(39,128,79,.28);
        background:rgba(39,128,79,.10);
        color:#27804f;
      }
      .bp-pending-average{
        color:var(--ink-soft,#28455c);
        font-size:9px;
        font-weight:850;
      }

      html[data-bp-theme="dark"] .bp-pending-date-group,
      html[data-bp-theme="amoled"] .bp-pending-date-group{
        background:var(--panel) !important;
        border-color:var(--line) !important;
      }
      html[data-bp-theme="dark"] .bp-pending-date-head,
      html[data-bp-theme="amoled"] .bp-pending-date-head{
        background:var(--bp-theme-surface-2) !important;
        border-color:var(--line) !important;
      }
      html[data-bp-theme="dark"] .bp-pending-name,
      html[data-bp-theme="amoled"] .bp-pending-name,
      html[data-bp-theme="dark"] .bp-pending-date-label,
      html[data-bp-theme="amoled"] .bp-pending-date-label{
        color:var(--ink) !important;
      }
      html[data-bp-theme="dark"] .bp-pending-status.ready,
      html[data-bp-theme="amoled"] .bp-pending-status.ready{
        color:#73d99e !important;
      }

      .bp-individual-modal[hidden]{display:none !important}
      .bp-individual-modal{
        position:fixed;
        inset:0;
        z-index:100800;
        display:flex;
        align-items:flex-start;
        justify-content:center;
        overflow:auto;
        padding:22px;
        background:rgba(5,30,45,.58);
        backdrop-filter:blur(6px);
        -webkit-backdrop-filter:blur(6px);
      }
      .bp-individual-dialog{
        width:min(920px,100%);
        margin:auto;
        overflow:hidden;
        border:1px solid var(--line,#c9dfee);
        border-radius:18px;
        background:var(--panel,#fff);
        color:var(--ink,#0a2233);
        box-shadow:0 30px 90px -34px rgba(0,0,0,.72);
      }
      .bp-individual-toolbar{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        padding:12px 14px;
        border-bottom:1px solid var(--line,#c9dfee);
        background:var(--bp-theme-surface-2,#f4fafd);
      }
      .bp-individual-toolbar-copy strong{
        display:block;
        color:var(--ink,#0a2233);
        font-size:12px;
      }
      .bp-individual-toolbar-copy span{
        display:block;
        margin-top:2px;
        color:var(--muted,#5b7080);
        font-size:9px;
      }
      .bp-individual-actions{display:flex;gap:8px;align-items:center}
      .bp-individual-action{
        min-height:36px;
        padding:8px 12px;
        border:1px solid var(--line,#c9dfee);
        border-radius:10px;
        background:var(--panel,#fff);
        color:var(--ink,#0a2233);
        font:800 10px/1 "Inter",sans-serif;
        cursor:pointer;
      }
      .bp-individual-action.primary{
        border-color:transparent;
        background:linear-gradient(180deg,var(--lagoon,#15ace3),var(--lagoon-deep,#0b7fb0));
        color:#fff;
      }
      .bp-individual-sheet{
        padding:26px 30px 30px;
        background:#fff;
        color:#0a2233;
      }
      .bp-print-brand{
        display:flex;
        align-items:center;
        gap:14px;
        padding-bottom:16px;
        border-bottom:2px solid #0b7fb0;
      }
      .bp-print-brand img{
        width:54px;
        height:54px;
        object-fit:contain;
        border:1px solid #d4e5ef;
        border-radius:12px;
        padding:5px;
        background:#fff;
      }
      .bp-print-kicker{
        color:#0b7fb0;
        font-size:8.5px;
        font-weight:800;
        letter-spacing:.15em;
        text-transform:uppercase;
      }
      .bp-print-title{
        margin-top:3px;
        color:#0a2233;
        font:800 18px/1.2 "Bricolage Grotesque","Inter",sans-serif;
      }
      .bp-print-subtitle{
        margin-top:4px;
        color:#5b7080;
        font-size:9.5px;
      }
      .bp-print-meta{
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:10px 14px;
        padding:16px 0;
      }
      .bp-print-meta-item{
        padding:9px 10px;
        border:1px solid #d4e5ef;
        border-radius:9px;
        background:#f7fbfd;
      }
      .bp-print-meta-item span{
        display:block;
        color:#6b7f8e;
        font-size:7.5px;
        font-weight:800;
        letter-spacing:.08em;
        text-transform:uppercase;
      }
      .bp-print-meta-item strong{
        display:block;
        margin-top:3px;
        color:#0a2233;
        font-size:10px;
        line-height:1.35;
      }
      .bp-print-status-note{
        margin-bottom:14px;
        padding:9px 11px;
        border:1px solid #c9dfee;
        border-radius:9px;
        background:#eef8fc;
        color:#28455c;
        font-size:9px;
        line-height:1.45;
      }
      .bp-print-table{
        width:100%;
        border-collapse:collapse;
        table-layout:fixed;
      }
      .bp-print-table th,
      .bp-print-table td{
        border:1px solid #c9dfee;
        padding:7px 8px;
        vertical-align:top;
      }
      .bp-print-table th{
        background:#edf7fb;
        color:#28455c;
        font-size:8px;
        font-weight:850;
        letter-spacing:.06em;
        text-transform:uppercase;
        text-align:left;
      }
      .bp-print-table th:last-child,
      .bp-print-table td:last-child{
        width:74px;
        text-align:center;
      }
      .bp-print-criterion{
        color:#0a2233;
        font-size:9.5px;
        font-weight:800;
      }
      .bp-print-description{
        margin-top:2px;
        color:#647887;
        font-size:7.8px;
        line-height:1.35;
      }
      .bp-print-score{
        color:#0b7fb0;
        font-size:11px;
        font-weight:850;
      }
      .bp-print-summary{
        display:grid;
        grid-template-columns:1fr auto auto;
        gap:10px;
        align-items:stretch;
        margin-top:12px;
      }
      .bp-print-comment,
      .bp-print-stat{
        border:1px solid #c9dfee;
        border-radius:9px;
        padding:10px 11px;
      }
      .bp-print-comment span,
      .bp-print-stat span{
        display:block;
        color:#6b7f8e;
        font-size:7.5px;
        font-weight:800;
        letter-spacing:.08em;
        text-transform:uppercase;
      }
      .bp-print-comment div{
        margin-top:5px;
        min-height:38px;
        color:#28455c;
        font-size:9px;
        line-height:1.45;
        white-space:pre-wrap;
      }
      .bp-print-stat{
        min-width:92px;
        text-align:right;
      }
      .bp-print-stat strong{
        display:block;
        margin-top:4px;
        color:#0b7fb0;
        font-size:17px;
      }
      .bp-print-footer{
        display:flex;
        justify-content:space-between;
        gap:16px;
        margin-top:18px;
        padding-top:10px;
        border-top:1px solid #d4e5ef;
        color:#718391;
        font-size:7.5px;
      }

      html[data-bp-theme="dark"] .bp-individual-dialog,
      html[data-bp-theme="amoled"] .bp-individual-dialog{
        background:var(--panel) !important;
        border-color:var(--line) !important;
      }
      html[data-bp-theme="dark"] .bp-individual-toolbar,
      html[data-bp-theme="amoled"] .bp-individual-toolbar{
        background:var(--bp-theme-surface-2) !important;
        border-color:var(--line) !important;
      }

      @media(max-width:620px){
        .bp-pending-row{
          grid-template-columns:minmax(0,1fr);
          gap:6px;
        }
        .bp-pending-state{
          flex-direction:row;
          align-items:center;
          justify-content:space-between;
        }
        .bp-pending-status{max-width:none}
        .bp-individual-modal{padding:8px}
        .bp-individual-dialog{
          width:100%;
          max-height:calc(100dvh - 16px);
          overflow:auto;
          border-radius:14px;
        }
        .bp-individual-toolbar{
          position:sticky;
          top:0;
          z-index:2;
          padding:10px;
        }
        .bp-individual-toolbar-copy span{display:none}
        .bp-individual-sheet{padding:18px 14px 22px}
        .bp-print-brand{align-items:flex-start}
        .bp-print-title{font-size:15px}
        .bp-print-meta{grid-template-columns:1fr 1fr;gap:7px}
        .bp-print-summary{grid-template-columns:1fr 1fr}
        .bp-print-comment{grid-column:1 / -1}
      }

      @media print{
        @page{size:A4 portrait;margin:11mm}
        html,body{
          background:#fff !important;
          color:#000 !important;
          overflow:visible !important;
        }
        body > *:not(.bp-individual-modal){display:none !important}
        .bp-individual-modal{
          position:static !important;
          display:block !important;
          inset:auto !important;
          overflow:visible !important;
          padding:0 !important;
          background:#fff !important;
          backdrop-filter:none !important;
          -webkit-backdrop-filter:none !important;
        }
        .bp-individual-dialog{
          width:100% !important;
          max-width:none !important;
          margin:0 !important;
          overflow:visible !important;
          border:0 !important;
          border-radius:0 !important;
          box-shadow:none !important;
        }
        .bp-individual-toolbar{display:none !important}
        .bp-individual-sheet{padding:0 !important}
        .bp-print-table tr{break-inside:avoid}
      }
    `;
    document.head.appendChild(style);
  }

  async function loadRoster(){
    const map = new Map();

    try{
      const { data, error } = await db.rpc("get_evaluation_roster");
      if(!error && Array.isArray(data)){
        data.forEach(row => {
          if(row?.id){
            map.set(row.id, {
              id:row.id,
              full_name:row.full_name || "Unknown",
              position:row.position || "",
              form_role:row.form_role || "",
              role:row.role || "employee",
              has_login:row.has_login !== false
            });
          }
        });
      }
    }catch(_){}

    if(!map.size){
      try{
        const { data, error } = await db
          .from("profiles")
          .select("id,full_name,position,form_role,role");
        if(!error && Array.isArray(data)){
          data.forEach(row => {
            if(row?.id){
              map.set(row.id, { ...row, has_login:true });
            }
          });
        }
      }catch(_){}
    }

    return map;
  }

  async function loadData(){
    const [activeResult, archivedResult, exemptionResult, roster] = await Promise.all([
      db
        .from("evaluations")
        .select("id,employee_id,evaluator_id,scores,comments,average,updated_at,created_at,form_role,round,locked")
        .eq("archived", false)
        .eq("locked", true)
        .order("updated_at", { ascending:false }),

      db
        .from("evaluations")
        .select("employee_id,archived_at")
        .eq("archived", true)
        .not("archived_at", "is", null),

      db
        .from("evaluation_round_exemptions")
        .select("staff_id,restored_at")
        .is("restored_at", null),

      loadRoster()
    ]);

    if(activeResult.error) throw activeResult.error;

    rosterById = roster;
    activeExemptions = new Set(
      exemptionResult.error
        ? []
        : (exemptionResult.data || []).map(row => row.staff_id).filter(Boolean)
    );

    currentRows = (activeResult.data || []).filter(isCompleteSubmission);

    if(archivedResult.error){
      archivedRoundCount = list.querySelectorAll(".his-date-group .his-row:not(.his-exempted-row)").length;
    }else{
      const keys = new Set(
        (archivedResult.data || [])
          .filter(row => row.employee_id && row.archived_at)
          .map(row => row.employee_id + "|" + row.archived_at)
      );
      archivedRoundCount = keys.size;
    }
  }

  function buildPendingHistory(){
    document.getElementById("bpPendingHistory")?.remove();

    historyCount.textContent = String(archivedRoundCount + currentRows.length);

    if(!currentRows.length) return;

    const empty = [...list.querySelectorAll(":scope > .his-empty")]
      .find(node => /nothing archived yet/i.test(node.textContent || ""));
    empty?.remove();

    const wrap = document.createElement("div");
    wrap.id = "bpPendingHistory";
    wrap.className = "bp-pending-history";

    const head = document.createElement("div");
    head.className = "bp-pending-history-head";
    head.innerHTML = `
      <span class="bp-pending-history-title">Current round submissions</span>
      <span class="bp-pending-history-badge">${currentRows.length}</span>
    `;
    wrap.appendChild(head);

    const byDate = new Map();
    currentRows.forEach(row => {
      const when = row.updated_at || row.created_at;
      const key = localDateKey(when);
      if(!byDate.has(key)) byDate.set(key, { when, rows:[] });
      byDate.get(key).rows.push(row);
    });

    [...byDate.values()]
      .sort((a,b) => new Date(b.when) - new Date(a.when))
      .forEach(groupData => {
        groupData.rows.sort((a,b) =>
          new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
        );

        const group = document.createElement("section");
        group.className = "bp-pending-date-group";

        const groupHead = document.createElement("div");
        groupHead.className = "bp-pending-date-head";
        groupHead.innerHTML = `
          <span class="bp-pending-date-label">${esc(dateLabel(groupData.when))}</span>
          <span class="bp-pending-date-count">${groupData.rows.length} submitted form${groupData.rows.length === 1 ? "" : "s"}</span>
        `;
        group.appendChild(groupHead);

        groupData.rows.forEach(row => {
          const employee = person(row.employee_id);
          const evaluator = person(row.evaluator_id);
          const state = submissionState(row);
          const stats = scoreStats(row);
          const submittedAt = row.updated_at || row.created_at;

          const item = document.createElement("div");
          item.className = "bp-pending-row";

          const open = document.createElement("button");
          open.type = "button";
          open.className = "bp-pending-open";
          open.innerHTML = `
            <div class="bp-pending-name">${esc(employee.full_name)}</div>
            <div class="bp-pending-meta">
              <span>Evaluator: ${esc(evaluator.full_name)}</span>
              <span>·</span>
              <span>${esc(timeLabel(submittedAt))}</span>
              <span>·</span>
              <span>${formDef(row.form_role)?.rows.length || 0}/${formDef(row.form_role)?.rows.length || 0} criteria</span>
            </div>
          `;
          open.title = "Open this submitted evaluation form";
          open.addEventListener("click", () => openSubmission(row));

          const stateEl = document.createElement("div");
          stateEl.className = "bp-pending-state";

          const status = document.createElement("span");
          status.className = "bp-pending-status" + (state.ready ? " ready" : "");
          status.textContent = state.ready
            ? "Ready to finalise"
            : `Awaiting ${state.missing.length}`;

          const avg = document.createElement("span");
          avg.className = "bp-pending-average";
          avg.textContent = stats.average.toFixed(2) + "/5";

          stateEl.append(status, avg);
          item.append(open, stateEl);
          group.appendChild(item);
        });

        wrap.appendChild(group);
      });

    list.insertBefore(wrap, list.firstChild);
  }

  function ensureModal(){
    if(modal?.isConnected) return modal;

    modal = document.createElement("div");
    modal.id = "bpIndividualSubmissionModal";
    modal.className = "bp-individual-modal";
    modal.hidden = true;
    modal.innerHTML = `
      <section class="bp-individual-dialog" role="dialog" aria-modal="true" aria-labelledby="bpIndividualSubmissionTitle">
        <div class="bp-individual-toolbar">
          <div class="bp-individual-toolbar-copy">
            <strong id="bpIndividualSubmissionTitle">Submitted evaluation</strong>
            <span>Individual current-round submission · read only</span>
          </div>
          <div class="bp-individual-actions">
            ${canPrint ? '<button type="button" class="bp-individual-action primary" data-bp-individual-print>Print form</button>' : ''}
            <button type="button" class="bp-individual-action" data-bp-individual-close>Close</button>
          </div>
        </div>
        <div class="bp-individual-sheet" data-bp-individual-sheet></div>
      </section>
    `;

    document.body.appendChild(modal);

    modal.querySelector("[data-bp-individual-close]")?.addEventListener("click", closeSubmission);
    modal.querySelector("[data-bp-individual-print]")?.addEventListener("click", () => window.print());
    modal.addEventListener("click", event => {
      if(event.target === modal) closeSubmission();
    });

    return modal;
  }

  function openSubmission(row){
    const host = ensureModal();
    const sheet = host.querySelector("[data-bp-individual-sheet]");
    const def = formDef(row.form_role);
    if(!def || !isCompleteSubmission(row)) return;

    const employee = person(row.employee_id);
    const evaluator = person(row.evaluator_id);
    const state = submissionState(row);
    const stats = scoreStats(row);
    const submittedAt = row.updated_at || row.created_at;
    const statusText = state.ready
      ? "All required evaluators have submitted · awaiting finalization"
      : `Submitted · awaiting ${state.missing.length} other evaluator${state.missing.length === 1 ? "" : "s"}`;

    const rowsHtml = def.rows.map(([name, description], index) => {
      const score = Number(row.scores?.[String(index)]);
      return `
        <tr>
          <td>
            <div class="bp-print-criterion">${esc(name)}</div>
            <div class="bp-print-description">${esc(description)}</div>
          </td>
          <td><span class="bp-print-score">${Number.isFinite(score) ? score : "—"}</span> / 5</td>
        </tr>
      `;
    }).join("");

    sheet.innerHTML = `
      <div class="bp-print-brand">
        <img src="Better Practice Consulting Inc.png" alt="Better Practice Consulting Inc.">
        <div>
          <div class="bp-print-kicker">Individual submitted evaluation</div>
          <div class="bp-print-title">${esc(def.title)}</div>
          <div class="bp-print-subtitle">Current evaluation round · not yet finalized</div>
        </div>
      </div>

      <div class="bp-print-meta">
        <div class="bp-print-meta-item"><span>Employee</span><strong>${esc(employee.full_name)}</strong></div>
        <div class="bp-print-meta-item"><span>Position</span><strong>${esc(employee.position || row.form_role || "—")}</strong></div>
        <div class="bp-print-meta-item"><span>Evaluator</span><strong>${esc(evaluator.full_name)}</strong></div>
        <div class="bp-print-meta-item"><span>Submission date</span><strong>${esc(dateTimeLabel(submittedAt))}</strong></div>
        <div class="bp-print-meta-item"><span>Evaluation form</span><strong>${esc(row.form_role || "—")}</strong></div>
        <div class="bp-print-meta-item"><span>Round</span><strong>${esc(row.round ?? "Current")}</strong></div>
      </div>

      <div class="bp-print-status-note">
        <strong>${esc(statusText)}.</strong>
        This individual submission is printable now, but it does not enter finalized rankings, Team Average, Overall Ranking, or finalized dashboard results until the full evaluation is finalized.
      </div>

      <table class="bp-print-table">
        <thead><tr><th>Criterion</th><th>Score</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>

      <div class="bp-print-summary">
        <div class="bp-print-comment">
          <span>Evaluator's overall comments</span>
          <div>${esc((row.comments || "").trim() || "No comment entered.")}</div>
        </div>
        <div class="bp-print-stat"><span>Total score</span><strong>${stats.total.toFixed(1)}</strong></div>
        <div class="bp-print-stat"><span>Average</span><strong>${stats.average.toFixed(2)}</strong></div>
      </div>

      <div class="bp-print-footer">
        <span>Better Practice Consulting Inc.</span>
        <span>Submitted ${esc(dateTimeLabel(submittedAt))}</span>
      </div>
    `;

    host.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeSubmission(){
    if(!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  async function refresh(){
    if(!canView) return;
    if(refreshing){
      refreshAgain = true;
      return;
    }

    refreshing = true;
    try{
      await loadData();
      buildPendingHistory();
    }catch(error){
      console.warn("Current-round History submissions could not load:", error);
    }finally{
      refreshing = false;
      if(refreshAgain){
        refreshAgain = false;
        queueRefresh(40);
      }
    }
  }

  function queueRefresh(delay=100){
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refresh, delay);
  }

  async function init(){
    injectStyles();

    const { data:{ session } } = await db.auth.getSession();
    if(!session) return;

    const { data:profile, error } = await db
      .from("profiles")
      .select("role,form_role")
      .eq("id", session.user.id)
      .maybeSingle();

    if(error || !profile) return;

    canPrint = profile.role === "manager" || profile.form_role === "Senior Staff";
    canView = canPrint || profile.form_role === "Junior Staff";
    if(!canView) return;

    await refresh();

    const observer = new MutationObserver(mutations => {
      const externalHistoryChange = mutations.some(mutation =>
        [...mutation.addedNodes, ...mutation.removedNodes].some(node => {
          if(node?.nodeType !== 1) return false;
          if(node.id === "bpPendingHistory" || node.closest?.("#bpPendingHistory")) return false;
          return node.matches?.(".his-date-group,.his-empty") ||
            node.querySelector?.(".his-date-group,.his-empty");
        })
      );

      if(externalHistoryChange) queueRefresh(120);
    });

    observer.observe(list, { childList:true, subtree:true });

    try{
      db.channel("individual-submission-history")
        .on(
          "postgres_changes",
          { event:"*", schema:"public", table:"evaluations" },
          payload => {
            const changed = payload.new || payload.old || {};
            if(
              payload.eventType === "DELETE" ||
              changed.locked === true ||
              changed.archived === true ||
              payload.old?.locked === true
            ){
              queueRefresh(80);
            }
          }
        )
        .on(
          "postgres_changes",
          { event:"*", schema:"public", table:"evaluation_round_exemptions" },
          () => queueRefresh(80)
        )
        .subscribe();
    }catch(error){
      console.warn("Current-round History realtime unavailable:", error);
    }

    document.getElementById("sumHistory")?.addEventListener("click", () => queueRefresh(40));
    window.addEventListener("focus", () => queueRefresh(40));
    window.addEventListener("round-exemptions-updated", () => queueRefresh(40));

    document.addEventListener("keydown", event => {
      if(event.key === "Escape" && modal && !modal.hidden) closeSubmission();
    });
  }

  void init();
})();

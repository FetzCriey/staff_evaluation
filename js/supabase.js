/* =========================================================
   SUPABASE — session guard, account panel, roster
   ========================================================= */
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://giosjwjhalhmwcuyzfos.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const gate = document.getElementById('gate');

// Safety net: if the Supabase library or the network fails, never leave the user
// staring at a permanently blank gate — give them a way back to the login page.
const stuck = setTimeout(() => {
  if(document.getElementById('gate')){
    gate.innerHTML = 'Could not reach the sign-in service. ' +
      '<a href="login.html" style="color:var(--lagoon-deep);font-weight:700">Go to login</a>';
  }
}, 8000);

function initials(name){
  const p = (name||'').trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0]||'') + (p.length>1 ? p[p.length-1][0] : '')).toUpperCase() || '—';
}

// ---- 1. require a session ----------------------------------------------
const { data:{ session } } = await supabase.auth.getSession();
if(!session){
  clearTimeout(stuck);
  window.location.replace('login.html');
} else {
  clearTimeout(stuck);
  // The gate stays up until the criteria form is in its real state — evaluator
  // mode applied, one column shown — so nothing flashes the pre-auth default
  // (six empty columns, no name) before settling.

  // ---- 2. who is signed in --------------------------------------------
  const uid = session.user.id;
  let me = null;
  try{
    const { data } = await supabase.from('profiles')
      .select('id, full_name, position, role, form_role').eq('id', uid).maybeSingle();
    me = data;
  }catch(_){}

  const name = me?.full_name || session.user.email || 'Signed in';
  document.getElementById('acctName').textContent = name;
  document.getElementById('acctInitials').textContent = initials(me?.full_name || session.user.email);
  document.getElementById('acctRole').textContent =
    [me?.position, me?.role==='manager' ? 'Manager access' : null].filter(Boolean).join(' · ') || session.user.email;

  // default the Manager / Evaluator field to whoever is signed in
  const mgr = document.getElementById('manager');
  window.__currentUserName = me?.full_name || session.user.email || '';
  if(mgr && !FORMS[role].senior){ mgr.readOnly = true; mgr.value = window.__currentUserName; }

  // ---- 3. roster from the database ------------------------------------
  try{
    const { data:rows, error } = await supabase.from('profiles')
      .select('full_name, position, role, form_role').order('full_name');
    if(!error && rows && rows.length > 1){
      window.setRoster(rows);
    }else if(rows && rows.length <= 1){
      console.info('Roster: only your own profile is readable (row-level security), keeping the built-in list.');
    }
  }catch(err){ console.info('Roster fetch failed, keeping the built-in list.', err); }

  // ---- 3b. manager-only staff panel -----------------------------------
  // Everything here goes through the manage-users Edge Function, which re-checks
  // that the caller is a manager before touching anything. The browser never
  // holds an admin key — hiding this panel is convenience, not the security.
  // Three tiers of access. Everyone scores their own column; what differs is
  // what else the sidebar exposes.
  //   full   — manager / Senior Staff: results, history, roster, export, lock, reset
  //   viewer — Junior Staff: results and history, read only
  //   basic  — Probationary: criteria view only
  const canAdmin = (me?.role === 'manager') || (me?.form_role === 'Senior Staff');
  const canView  = canAdmin || (me?.form_role === 'Junior Staff');

  // The sidebar panel itself is shown to anyone who can view results; the
  // roster sections inside it stay manager/senior only.
  if(canView){
    // Accordion wiring lives here, not in the manager block: a Junior sees the
    // Results and History sections, so they need the click handlers too.
    const SECTIONS = [['secResults','sumResults'], ['secHistory','sumHistory'],
                      ['secRoles','sumRoles'], ['secAdd','sumAdd']];
    SECTIONS.forEach(([secId, sumId]) => {
      const sec = document.getElementById(secId);
      const sum = document.getElementById(sumId);
      if(!sec || !sum) return;
      sum.addEventListener('click', () => {
        const opening = !sec.classList.contains('open');
        SECTIONS.forEach(([s2, b2]) => {
          document.getElementById(s2)?.classList.remove('open');
          document.getElementById(b2)?.setAttribute('aria-expanded','false');
        });
        if(opening){
          sec.classList.add('open');
          sum.setAttribute('aria-expanded','true');
        }
      });
    });

    document.getElementById('mgrPanel').classList.add('on');
    document.querySelector('#mgrPanel h3').textContent =
      canAdmin ? 'Staff administration' : 'Evaluations';
    if(!canAdmin){
      document.getElementById('secRoles').classList.add('hide');
      document.getElementById('secAdd').classList.add('hide');
    }
  }
  if(canAdmin){
    const isManager = me?.role === 'manager';
    const panel = document.getElementById('mgrPanel');
    const list  = document.getElementById('mgrList');
    const msg   = document.getElementById('mgrMsg');
    const FORM_ROLES = ['Probationary','Junior Staff','Senior Staff'];
    panel.classList.add('on');
    if(!isManager){
      // Senior staff administer employees only.
      const acc = document.getElementById('mgrAccess');
      const mgrOpt = acc.querySelector('option[value="manager"]');
      if(mgrOpt) mgrOpt.remove();
      const hint = panel.querySelector('.mgr-hint');
      if(hint) hint.textContent = 'Senior staff can add and remove employees. Manager accounts are managed by a manager.';
    }

    const say = (t, cls='') => { msg.textContent = t; msg.className = 'mgr-msg ' + cls; };

    async function admin(payload){
      const { data, error } = await supabase.functions.invoke('manage-users', { body: payload });
      if(error){
        let detail = error.message;
        try{ detail = (await error.context?.json())?.error || detail; }catch(_){}
        throw new Error(detail);
      }
      if(data?.error) throw new Error(data.error);
      return data;
    }

    async function reload(){
      try{
        const { users } = await admin({ action:'list' });
        renderList(users);
        window.setRoster(users);
      }catch(err){ say('Could not load staff: ' + err.message, 'err'); }
    }

    function renderList(rows){
      list.innerHTML = '';
      document.getElementById('rolesCount').textContent = rows.length;
      if(!rows.length){
        list.innerHTML = '<div class="mgr-empty">Nobody on the roster yet.</div>';
        return;
      }
      rows.forEach(r => {
        const row = document.createElement('div');
        row.className = 'mgr-row';

        const nm = document.createElement('div');
        nm.className = 'mgr-nm';
        nm.textContent = r.full_name;
        nm.title = (r.email || 'No sign-in account') + (r.role==='manager' ? ' · manager' : '');
        if(r.role === 'manager'){
          const t = document.createElement('span'); t.className='tag mg'; t.textContent='mgr'; nm.appendChild(t);
        }
        if(!r.has_login){
          const t = document.createElement('span'); t.className='tag no'; t.textContent='no login'; nm.appendChild(t);
        }

        const sel = document.createElement('select');
        sel.className = 'mgr-sel';
        FORM_ROLES.forEach(fr => {
          const o = document.createElement('option');
          o.value = fr; o.textContent = fr; o.selected = (r.form_role === fr);
          sel.appendChild(o);
        });
        sel.addEventListener('change', async () => {
          const prev = r.form_role;
          const next = sel.value;
          // Confirm first — the form role decides which criteria the person is
          // scored against, and Senior Staff also unlocks admin access.
          const extra = next === 'Senior Staff'
            ? ' Senior Staff can also manage other users and finalise evaluations.'
            : (prev === 'Senior Staff'
                ? ' They will lose the ability to manage users and finalise evaluations.'
                : '');
          const ok = await uiConfirm(
            'Change ' + r.full_name + "'s form role?",
            'From ' + (prev || 'none') + ' to ' + next + '.' + extra +
            ' Their next evaluation will use the ' + next + ' criteria.',
            { ok: 'Change role' });
          if(!ok){ sel.value = prev; return; }

          sel.disabled = true;
          say('Saving…');
          try{
            await admin({ action:'set_role', id:r.id, form_role:next });
            r.form_role = next;
            say('');
            reload();
            await uiAlert('Role updated', r.full_name + ' → ' + next + '.');
          }catch(err){
            sel.value = prev;
            say('');
            await uiAlert('Could not change the role', err.message);
          }
          sel.disabled = false;
        });

        const del = document.createElement('button');
        del.className = 'mgr-del';
        del.title = 'Remove ' + r.full_name;
        del.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
        const locked = (r.role === 'manager') && !isManager;
        sel.disabled = locked;
        del.disabled = (r.id === uid) || locked;
        if(locked){ del.title = 'Only a manager can change this account'; }
        del.addEventListener('click', async () => {
          if(!await uiConfirm('Remove ' + r.full_name + '?',
              'This deletes their sign-in account and roster entry. It cannot be undone.',
              { ok: 'Remove', danger: true })) return;
          del.disabled = true; say('Removing ' + r.full_name + '…');
          try{
            await admin({ action:'delete', id:r.id });
            say(r.full_name + ' removed.', 'ok');
            reload();
          }catch(err){ del.disabled = false; say(err.message, 'err'); }
        });

        const ctl = document.createElement('div');
        ctl.className = 'mgr-ctl';
        ctl.append(sel, del);
        row.append(nm, ctl);
        list.appendChild(row);
      });
    }

    document.getElementById('mgrAdd').addEventListener('click', async () => {
      const btn = document.getElementById('mgrAdd');
      const full_name = document.getElementById('mgrName').value.trim();
      const email     = document.getElementById('mgrEmail').value.trim();
      const password  = document.getElementById('mgrPass').value;
      const form_role = document.getElementById('mgrRole').value;
      const role      = document.getElementById('mgrAccess').value;

      if(!full_name){ uiAlert('Name needed', 'Enter the new person\'s full name.'); return; }
      if(!email.includes('@')){ uiAlert('Email needed', 'Enter a valid email address for sign-in.'); return; }
      if(password.length < 8){ uiAlert('Password too short', 'Use at least 8 characters for the temporary password.'); return; }

      const ok = await uiConfirm('Create ' + full_name + '?',
        full_name + ' will be able to sign in with ' + email + ' as ' +
        (role === 'manager' ? 'a manager' : 'an employee') + '.',
        { ok: 'Create user' });
      if(!ok) return;

      btn.disabled = true; say('Creating account…');
      try{
        await admin({ action:'create', full_name, email, password, form_role, role });
        document.getElementById('mgrName').value = '';
        document.getElementById('mgrEmail').value = '';
        document.getElementById('mgrPass').value = '';
        say('');
        reload();
        await uiAlert('User created', full_name + ' can now sign in with ' + email + '.');
      }catch(err){
        say('');
        await uiAlert('Could not create user', err.message);
      }
      btn.disabled = false;
    });

    reload();
  }

  // ---- 3c. evaluation mode ---------------------------------------------
  // Staff score one colleague at a time and save their own column.
  // Managers and Senior Staff see every submitted column and export the result.
  const isReviewer = canView;      // may open other people's results
  const isAdmin    = canAdmin;     // may also export, lock, reset and archive
  const api = window.evalApi;

  const el = id => document.getElementById(id);
  const show = (id, on) => el(id).classList.toggle('hide', !on);
  const stateEl = el('whoState');
  const setState = (text, cls='') => { stateEl.textContent = text; stateEl.className = 'pill-state ' + cls; };

  el('whoV').textContent = me?.full_name || session.user.email;

  // Everyone scores their colleagues, managers and seniors included. Reviewers
  // additionally open anyone's collected results from the sidebar.
  let mode = 'mine';                       // 'mine' | 'review'
  const reviewing = () => mode === 'review';

  function applyMode(){
    const mine = !reviewing();
    show('saveBtn',  mine);
    show('printBtn', !mine && isAdmin);
    show('pdfBtn',   !mine && isAdmin);
    show('exportBtn',!mine && isAdmin);
    show('lockBtn',  !mine && isAdmin);
    // corrections only on a live round — archived history stays frozen
    show('fixBtn',   !mine && isAdmin && !archiveCtx);
    show('resetBtn', mine || isAdmin);      // viewers get no destructive controls
    el('resetBtn').textContent = mine ? 'Clear scores'
      : (archiveCtx ? 'Delete history' : 'Reset a submission');
    show('backBar',  !mine);
    show('progWrap', !mine && !!target);
    el('whoK').textContent = mine ? 'Evaluating as' : 'Results for';
    // In review the bar names the employee; when scoring it names you.
    el('whoV').textContent = mine
      ? (me?.full_name || session.user.email)
      : (api.employeeName() || '—');
    el('empName').readOnly = !mine;        // in review the sidebar picks the person
    // No stepper anywhere: scoring your own shows one column, and reviewing
    // shows one column per person who actually submitted.
  }

  // name -> id, so we know who is being evaluated
  let idByName = new Map();
  let nameById = new Map();
  async function loadIds(){
    const { data } = await supabase.from('profiles').select('id, full_name');
    (data ?? []).forEach(p => { idByName.set(p.full_name.toLowerCase(), p.id); nameById.set(p.id, p.full_name); });
  }
  await loadIds();

  let target = null;      // employee being evaluated
  let targetName = '';    // the name shown in the field for that employee
  let reviewRows = [];        // rows behind the reviewer's columns, in column order
  let fixDirty = false;       // reviewer has edited scores that aren't saved yet
  let viewingArchive = null;  // archived_at of the record on screen (null = live view)
  let archiveCtx = null;      // { pid, name, when } for that archived record
  let myRow = null;       // this evaluator's saved row for that employee
  let anyLocked = false;
  let dirty = false;      // edits made since the last save
  let lastWarn = 0;       // throttles the finish-first warning

  applyMode();
  // One column from the outset — the grid otherwise shows the default six
  // until the first employee change lands.
  api.setColumns([ me?.full_name || 'You' ]);

  // The page now matches what the person is actually meant to see —
  // reveal it and drop the loading screen.
  document.getElementById('wrap').classList.remove('hide');
  gate.remove();

  function targetId(){ return idByName.get(api.employeeName().toLowerCase()) || null; }

  function filledCount(){ return Object.keys(api.getColumnScores(0)).length; }

  // Staff must finish and submit one colleague before starting another.
  function blockedFromLeaving(){
    if(reviewing() || !target || anyLocked) return null;
    const filled = filledCount(), total = api.criteriaCount();
    if(filled === 0) return null;                  // nothing started yet
    if(filled < total)
      return 'Finish scoring ' + targetName + ' first — ' + filled + ' of ' + total + ' criteria done.';
    // A complete live-saved draft is still not a final submission.
    return 'Submit your scores for ' + targetName + ' before moving on.';
  }

  async function onEmployeeChange(){
    const id = targetId();
    if(id === target) return;
    const stop = blockedFromLeaving();
    if(stop){
      el('empName').value = targetName;   // put the previous name back
      const now = Date.now();
      if(now - lastWarn > 4000){ lastWarn = now; uiAlert('Not finished yet', stop); }
      else setState(stop, 'dirty');
      return;
    }
    target = id;
    targetName = api.employeeName();
    dirty = false;
    if(reviewing()) el('whoV').textContent = targetName || '—';
    api.clearScores();
    api.setComments('');
    myRow = null; anyLocked = false;
    if(!id){
      api.clearColumns();
      el('progWrap').classList.add('hide');
      setState('No employee selected');
      return;
    }
    if(id === uid && !reviewing()){
      setState('You cannot evaluate yourself', 'locked');
      api.setReadOnly(true);
      return;
    }
    reviewing() ? await loadAll(id) : await loadMine(id);
  }

  // ----- staff: their own single column -----
  async function loadMine(id){
    api.clearColumns();
    api.setColumns([ me?.full_name || 'You' ]);
    const { data, error } = await supabase.from('evaluations')
      .select('id, scores, comments, locked')
      .eq('employee_id', id).eq('evaluator_id', uid).eq('archived', false).maybeSingle();
    if(error){ setState('Could not load your evaluation', 'locked'); return; }
    myRow = data || null;
    if(myRow){
      api.setColumnScores(0, myRow.scores || {});
      api.setComments(myRow.comments || '');
      anyLocked = !!myRow.locked;
      api.setReadOnly(anyLocked);
      dirty = false;
      setState(anyLocked ? 'Submitted — locked until this round is archived'
                         : 'Draft saved — you can still edit',
               anyLocked ? 'locked' : 'saved');
    }else{
      api.setReadOnly(false);
      dirty = false;
      setState('Not submitted yet');
    }
    el('saveBtn').disabled = anyLocked;
  }

  // ----- reviewer: every submitted column -----
  async function loadAll(id){
    const { data, error } = await supabase.from('evaluations')
      .select('id, evaluator_id, scores, comments, locked, updated_at')
      .eq('employee_id', id).eq('archived', false);
    if(error){ setState('Could not load evaluations', 'locked'); return; }
    const rows = data ?? [];
    paintProgress(id, rows);
    if(!rows.length){
      api.clearColumns();
      api.setColumns(['No submissions yet']);
      setState('Nobody has evaluated this person', '');
      el('lockBtn').disabled = true;
      reviewRows = []; fixDirty = false;
      el('fixBtn').disabled = true;
      return;
    }
    rows.sort((a,b) => (nameById.get(a.evaluator_id)||'').localeCompare(nameById.get(b.evaluator_id)||''));
    api.setColumns(rows.map(r => nameById.get(r.evaluator_id) || 'Unknown'));
    rows.forEach((r,i) => api.setColumnScores(i, r.scores || {}));
    const notes = rows.map(r => {
      const t = (r.comments||'').trim();
      return t ? (nameById.get(r.evaluator_id)||'Evaluator') + ': ' + t : '';
    }).filter(Boolean).join('\n');
    api.setComments(notes);
    anyLocked = rows.every(r => r.locked);
    el('lockBtn').disabled = false;
    el('lockBtn').textContent = anyLocked ? 'Unlock evaluations' : 'Lock evaluations';
    // column order must match reviewRows so a correction lands on the right row
    reviewRows = rows.map(r => ({ id: r.id, evaluator_id: r.evaluator_id }));
    fixDirty = false;
    el('fixBtn').disabled = true;
    // admins may correct an evaluator's mistake in place; comments stay locked
    api.setReadOnly(!isAdmin, true);
    const submittedCount = rows.filter(r => r.locked).length;
    setState(submittedCount + ' of ' + (idByName.size - 1) + ' submitted' + (anyLocked ? ' · locked' : ''),
             anyLocked ? 'locked' : 'saved');
  }

  // ----- live progress: every score moves the bar, no page refresh -----
  // Each evaluator can have an incomplete draft row. The bar is based on how
  // many criteria are currently scored across all expected evaluators.
  function paintProgress(employeeId, rows){
    if(!reviewing()) return;
    el('progWrap').classList.remove('hide');

    const expected = [...nameById.entries()].filter(([pid]) => pid !== employeeId);
    const totalEvaluators = expected.length;
    const totalCriteria = api.criteriaCount();
    const rowByEvaluator = new Map(rows.map(r => [r.evaluator_id, r]));

    let scoredCells = 0;
    let submitted = 0;

    expected.forEach(([pid]) => {
      const row = rowByEvaluator.get(pid);
      if(!row) return;

      const scores = row.scores || {};
      scoredCells += Math.min(Object.keys(scores).length, totalCriteria);

      if(row.locked) submitted++;
    });

    const totalCells = totalEvaluators * totalCriteria;
    const percent = totalCells ? (scoredCells / totalCells) * 100 : 0;

    el('progNum').textContent =
      Math.round(percent) + '% · ' + submitted + '/' + totalEvaluators + ' submitted';
    el('progFill').style.width = percent + '%';
    el('progBar').classList.toggle(
      'done',
      totalEvaluators > 0 && submitted === totalEvaluators
    );

    const list = el('progList');
    list.innerHTML = '';

    expected
      .sort((a,b) => a[1].localeCompare(b[1]))
      .forEach(([pid, name]) => {
        const row = rowByEvaluator.get(pid);
        const count = row ? Object.keys(row.scores || {}).length : 0;
        const isSubmitted = !!row?.locked;

        const c = document.createElement('span');
        c.className = 'prog-chip' + (isSubmitted ? ' ok' : '');
        c.innerHTML = '<span class="dot"></span>' + esc(name);

        if(isSubmitted){
          c.title = name + ' has submitted';
        }else if(count > 0){
          c.title = name + ' is evaluating · ' + count + ' of ' + totalCriteria + ' scored';
        }else{
          c.title = name + ' has not started yet';
        }

        list.appendChild(c);
      });
  }

  // ----- automatic draft saving -----
  // Wait briefly after the last score change before writing the draft. This
  // keeps the progress live without sending a database request for every keypress.
  let liveSaveTimer = null;
  let liveSaveRunning = false;
  let liveSaveAgain = false;

  async function saveLiveDraft(){
    if(reviewing() || anyLocked) return;

    const id = targetId();
    if(!id || id === uid) return;

    if(liveSaveRunning){
      liveSaveAgain = true;
      return;
    }

    liveSaveRunning = true;

    try{
      const scores = api.getColumnScores(0);
      const payload = {
        employee_id: id,
        evaluator_id: uid,
        scores,
        average: api.columnAverage(0),
        comments: api.comments(),
        form_role: api.formRole(),
        locked: false,
        updated_at: new Date().toISOString()
      };

      const { data: existing, error: findError } = await supabase.from('evaluations')
        .select('id')
        .eq('evaluator_id', uid)
        .eq('employee_id', id)
        .eq('archived', false)
        .maybeSingle();

      if(findError) throw findError;

      const { error } = existing
        ? await supabase.from('evaluations').update(payload).eq('id', existing.id)
        : await supabase.from('evaluations').insert(payload);

      if(error) throw error;

      myRow = existing ? { ...(myRow || {}), id: existing.id, ...payload } : { ...payload };
      dirty = false;

      const filled = Object.keys(scores).length;
      const total = api.criteriaCount();
      setState('Live saved · ' + filled + ' of ' + total + ' scored', 'saved');

    }catch(err){
      console.error('Live save failed:', err);
      setState('Could not live-save · use Submit to retry', 'dirty');
    }finally{
      liveSaveRunning = false;

      if(liveSaveAgain){
        liveSaveAgain = false;
        saveLiveDraft();
      }
    }
  }

  function queueLiveSave(){
    clearTimeout(liveSaveTimer);
    liveSaveTimer = setTimeout(saveLiveDraft, 500);
  }

  // ----- saving -----
  el('saveBtn').addEventListener('click', async () => {
    const id = targetId();
    if(!id){ uiAlert('No employee chosen', 'Pick the colleague you are evaluating first.'); return; }
    if(id === uid){ uiAlert('Not allowed', 'You cannot evaluate yourself.'); return; }
    // A complete column is a final submission: it locks, and only reopens when
    // a reviewer archives the round (or resets this submission). An incomplete
    // one saves as an editable draft.
    const complete = api.columnComplete(0);
    if(complete && !await uiConfirm('Submit your evaluation of ' + targetName + '?',
        'Your scores are final once submitted — you will not be able to change them. ' +
        'A reviewer can reopen them if something is wrong.', { ok: 'Submit' })) return;
    const btn = el('saveBtn');
    btn.disabled = true; el('status').textContent = 'Saving…';
    const payload = {
      employee_id: id,
      evaluator_id: uid,
      scores: api.getColumnScores(0),
      average: api.average(),
      comments: api.comments(),
      form_role: api.formRole(),
      locked: complete,
      updated_at: new Date().toISOString()
    };
    // No plain upsert here: the uniqueness rule is a *partial* index
    // (one active row per pair, but unlimited archived ones — see the
    // archiving feature), and Postgres can't match ON CONFLICT to a partial
    // index without repeating its WHERE clause, which supabase-js doesn't
    // expose. So: find the active row for this pair, update it if it exists,
    // insert if it doesn't.
    const { data: existing, error: findErr } = await supabase.from('evaluations')
      .select('id').eq('evaluator_id', uid).eq('employee_id', id)
      .eq('archived', false).maybeSingle();
    const { error } = findErr ? { message: findErr.message }
      : existing
        ? await supabase.from('evaluations').update(payload).eq('id', existing.id)
        : await supabase.from('evaluations').insert(payload);
    btn.disabled = false;
    if(error){
      el('status').textContent = '';
      setState('Save failed', 'locked');
      uiAlert('Could not save', error.message);
      return;
    }
    el('status').textContent = 'Saved.';
    setTimeout(() => { if(el('status').textContent === 'Saved.') el('status').textContent = ''; }, 2500);
    dirty = false;
    if(complete){
      anyLocked = true;
      api.setReadOnly(true);
      el('saveBtn').disabled = true;
      setState('Submitted — locked', 'locked');
      await goToNextColleague();
    }else{
      setState('Draft saved (incomplete)', 'saved');
    }
    if(window.__refreshResults) window.__refreshResults();
  });

  // ----- move on to the next colleague -----
  // After a complete submission, open the next person this evaluator has not
  // scored yet, in roster order. Nobody left means the round is finished.
  async function goToNextColleague(){
    const { data } = await supabase.from('evaluations')
      .select('employee_id').eq('evaluator_id', uid).eq('archived', false);
    const done = new Set((data ?? []).map(r => r.employee_id));
    const queue = [...nameById.entries()]
      .filter(([pid]) => pid !== uid && !done.has(pid))
      .sort((a,b) => a[1].localeCompare(b[1]));

    if(!queue.length){
      api.clearScores(); api.setComments('');
      api.setEmployee('');
      target = null; targetName = ''; dirty = false;
      setState('All colleagues evaluated', 'saved');
      await uiAlert('All done', 'You have evaluated everyone. Thank you.');
      return;
    }
    const [nextId, nextName] = queue[0];
    await uiAlert('Saved', 'Next up: ' + nextName + '.');
    api.setEmployee(nextName);
    target = null;                 // force a fresh load for the new person
    await onEmployeeChange();
    document.querySelector('.score-in')?.focus();
  }

  // ----- reviewer corrections -----
  // Each column belongs to a different evaluator, so this writes one row per
  // column rather than a single payload.
  el('fixBtn').addEventListener('click', async () => {
    if(!reviewing() || archiveCtx || !isAdmin || !reviewRows.length) return;
    const who = api.employeeName();
    if(!await uiConfirm('Save corrections?',
        'The edited scores replace what those evaluators submitted for ' + who + '. ' +
        'Their own comments are left untouched.', { ok: 'Save corrections' })) return;
    const btn = el('fixBtn');
    btn.disabled = true; el('status').textContent = 'Saving…';
    const failed = [];
    for(let i = 0; i < reviewRows.length; i++){
      const r = reviewRows[i];
      const { data, error } = await supabase.from('evaluations').update({
        scores: api.getColumnScores(i),
        average: api.columnAverage(i),
        updated_at: new Date().toISOString()
      }).eq('id', r.id).select('id');
      // an RLS block returns no error and no rows — treat that as a failure
      if(error || !data || !data.length){
        failed.push(nameById.get(r.evaluator_id) || 'Unknown');
      }
    }
    el('status').textContent = '';
    if(failed.length){
      uiAlert('Some corrections did not save',
        'These columns were rejected by the database: ' + failed.join(', ') + '.');
    }
    fixDirty = false;
    await loadAll(target);
    if(window.__refreshResults) window.__refreshResults();
    if(!failed.length) uiAlert('Corrections saved', who + "'s scores have been updated.");
  });

  // ----- Supabase Realtime: refresh review progress automatically -----
  // This listens for inserts, updates, and deletes in public.evaluations.
  // Realtime must also be enabled for this table in Supabase.
  const evaluationRealtime = supabase
    .channel('live-evaluation-progress-' + uid)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'evaluations'
      },
      async payload => {
        if(!reviewing() || !target || viewingArchive) return;

        const changedEmployee =
          payload.new?.employee_id ||
          payload.old?.employee_id;

        if(changedEmployee && changedEmployee !== target) return;

        // If an admin is currently typing a correction, do not replace their
        // unsaved grid. Update only the progress bar in that case.
        if(fixDirty){
          const { data, error } = await supabase.from('evaluations')
            .select('evaluator_id, scores, locked')
            .eq('employee_id', target)
            .eq('archived', false);

          if(!error) paintProgress(target, data ?? []);
          return;
        }

        await loadAll(target);

        if(typeof window.__refreshResults === 'function'){
          window.__refreshResults();
        }
      }
    )
    .subscribe((status, err) => {
      if(status === 'CHANNEL_ERROR' || status === 'TIMED_OUT'){
        console.error('Realtime connection:', status, err);
      }
    });

  // ----- locking -----
  el('lockBtn').addEventListener('click', async () => {
    const id = targetId();
    if(!id) return;
    const next = !anyLocked;
    if(!await uiConfirm(next ? 'Lock these evaluations?' : 'Unlock these evaluations?',
        next ? 'Evaluators will not be able to change their scores until you unlock them.'
             : 'Evaluators will be able to change their scores again.',
        { ok: next ? 'Lock' : 'Unlock' })) return;
    const btn = el('lockBtn'); btn.disabled = true;
    const { error } = await supabase.from('evaluations')
      .update({ locked: next }).eq('employee_id', id).eq('archived', false);
    btn.disabled = false;
    if(error){ uiAlert('Could not change the lock', error.message); return; }
    await loadAll(id);
  });

  // mark unsaved edits
  {
    api.onScoreChange(() => {
      if(reviewing()){
        // an admin correcting someone else's column
        if(isAdmin && !archiveCtx && reviewRows.length){
          fixDirty = true;
          el('fixBtn').disabled = false;
          setState('Unsaved corrections', 'dirty');
        }
        return;
      }
      if(anyLocked || !target) return;
      dirty = true;
      const filled = filledCount(), total = api.criteriaCount();
      setState(
        filled < total
          ? ('Saving · ' + filled + ' of ' + total + ' scored')
          : 'Saving changes',
        'dirty'
      );
      queueLiveSave();
    });
  }

  window.addEventListener('beforeunload', e => {
    if(dirty && !reviewing()){ e.preventDefault(); e.returnValue = ''; }
  });

  el('empName').addEventListener('input', () => {
    if(!reviewing() && document.querySelectorAll('th.evh, #rows .crow').length > api.criteriaCount())
      api.setColumns([ me?.full_name || 'You' ]);
  });

  window.__isRosterName = name => idByName.has((name||'').trim().toLowerCase());
  el('empName').addEventListener('blur', () => {
    const inp = el('empName');
    const v = inp.value.trim();
    if(v && !window.__isRosterName(v)){
      inp.classList.add('bad');
      uiAlert('Not on the roster', '"' + v + '" doesn\'t match anyone on the staff list. Pick a name from the suggestions.');
      inp.value = targetName || '';
      inp.classList.remove('bad');
    }
  });
  el('empName').addEventListener('change', onEmployeeChange);
  el('empName').addEventListener('blur', onEmployeeChange);
  // The autocomplete sets the value without firing 'change', so poll — but
  // silently: never while the field has focus, and only on an exact match.
  // (An alert() here fires repeatedly and blocks every other click.)
  setInterval(() => {
    if(document.activeElement === el('empName')) return;
    const typed = api.employeeName().toLowerCase();
    if(typed && !idByName.has(typed)) return;
    onEmployeeChange();
  }, 900);

  // ---- 3d. sidebar results (reviewers only) ----------------------------
  if(isReviewer){
    el('secResults').classList.remove('hide');

    async function loadResults(){
      const { data, error } = await supabase.from('evaluations')
        .select('employee_id, evaluator_id, locked').eq('archived', false);
      if(error){ el('resList').innerHTML = '<div class="res-empty">Could not load results.</div>'; return; }
      const rows = data ?? [];
      const byEmployee = new Map();
      rows.forEach(r => {
        if(!byEmployee.has(r.employee_id)) byEmployee.set(r.employee_id, new Set());
        byEmployee.get(r.employee_id).add(r.evaluator_id);
      });

      const people = [...nameById.entries()].sort((a,b) => a[1].localeCompare(b[1]));
      const list = el('resList');
      list.innerHTML = '';
      let complete = 0;

      people.forEach(([pid, name]) => {
        const total = people.length - 1;               // everyone but themselves
        const n = (byEmployee.get(pid) || new Set()).size;
        const full = total > 0 && n >= total;
        if(full) complete++;

        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'res-row' + (full ? ' full' : '') + (pid === target && reviewing() ? ' on' : '');
        b.innerHTML = `<div class="res-top"><span class="res-nm">${esc(name)}</span>` +
                      `<span class="res-ct">${n}/${total}</span></div>` +
                      `<div class="res-bar"><span style="width:${total ? (n/total*100) : 0}%"></span></div>`;
        b.title = full ? 'Everyone has scored ' + name : (total - n) + ' still to score ' + name;
        b.addEventListener('click', () => openResults(pid, name));
        list.appendChild(b);
      });

      if(!people.length) list.innerHTML = '<div class="res-empty">No staff on the roster.</div>';
      el('resDone').textContent = complete + '/' + people.length;
    }

    // open one person's collected scores in the main form
    async function openResults(pid, name){
      const stop = blockedFromLeaving();
      if(stop){ uiAlert('Not finished yet', stop); return; }
      mode = 'review';
      if(window.__clearArchiveView) window.__clearArchiveView();
      api.setEmployee(name);
      applyMode();
      target = null;                 // force a reload for this person
      await onEmployeeChange();
      loadResults();
      openDrawer(false);
    }

    el('backBtn').addEventListener('click', async () => {
      mode = 'mine';
      applyMode();
      api.clearColumns();
      api.setEmployee('');
      target = null; targetName = ''; dirty = false;
      api.clearScores(); api.setComments(''); api.setReadOnly(false);
      setState('No employee selected');
    });

    el('sumResults').addEventListener('click', () => {
      if(el('secResults').classList.contains('open')) loadResults();
    });
    window.__refreshResults = loadResults;
    loadResults();
  }

  // ---- 3e. archiving + history (reviewers only) ------------------------
  // Printing or exporting a completed round finalises it: the rows are frozen
  // and moved to History, which clears the way for the next round.
  if(isReviewer){
    el('secHistory').classList.remove('hide');

    async function archiveRound(){
      const id = target;
      if(!id || viewingArchive) return;
      const name = api.employeeName();
      if(!await uiConfirm('Finalise this evaluation?',
          name + "'s evaluation moves to History and can no longer be edited. " +
          'A new evaluation round opens for ' + name + '.', { ok: 'Finalise' })) return;
      const stamp = new Date().toISOString();
      const { error } = await supabase.from('evaluations')
        .update({ archived: true, archived_at: stamp, archived_by: uid, locked: true })
        .eq('employee_id', id).eq('archived', false);
      if(error){ uiAlert('Could not archive', error.message); return; }
      await uiAlert('Archived', name + "'s evaluation is in History. A new round is now open.");
      await loadHistory();
      if(window.__refreshResults) window.__refreshResults();
      target = null;
      await onEmployeeChange();
    }

    // Only admins finalise a round; viewers never see these buttons anyway.
    if(isAdmin){
      ['printBtn','pdfBtn','exportBtn'].forEach(bid => {
        el(bid).addEventListener('click', () => {
          if(!reviewing() || viewingArchive) return;
          setTimeout(archiveRound, 1200);    // let the document render first
        });
      });
    }

    async function loadHistory(){
      const { data, error } = await supabase.from('evaluations')
        .select('employee_id, evaluator_id, scores, comments, average, archived_at, form_role')
        .eq('archived', true).order('archived_at', { ascending: false });
      const list = el('hisList');
      if(error){ list.innerHTML = '<div class="his-empty">Could not load history.</div>'; return; }
      const rows = data ?? [];
      // group by employee + the moment it was archived
      const groups = new Map();
      rows.forEach(r => {
        const key = r.employee_id + '|' + r.archived_at;
        if(!groups.has(key)) groups.set(key, []);
        groups.get(key).push(r);
      });
      list.innerHTML = '';
      el('hisCount').textContent = groups.size;
      if(!groups.size){ list.innerHTML = '<div class="his-empty">Nothing archived yet.</div>'; return; }
      [...groups.entries()].forEach(([key, rs]) => {
        const [pid, when] = key.split('|');
        const name = nameById.get(pid) || 'Unknown';
        const avg = rs.length
          ? Math.round(rs.reduce((a,r) => a + (Number(r.average)||0), 0) / rs.length * 10) / 10
          : 0;
        const d = new Date(when);
        const row = document.createElement('div');
        row.className = 'his-row';
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'his-main';
        b.innerHTML = `<div class="his-nm">${esc(name)}</div>` +
          `<div class="his-meta"><span>${d.toLocaleDateString()}</span>` +
          `<span class="dot">·</span>` +
          `<span>${rs.length} evaluator${rs.length===1?'':'s'}</span></div>`;
        b.addEventListener('click', () => openArchive(pid, name, when, rs, row));
        row.appendChild(b);
        // average sits on the same centre line as the delete icon
        const avgEl = document.createElement('div');
        avgEl.className = 'his-avg';
        avgEl.title = 'Average score';
        avgEl.textContent = avg;
        row.appendChild(avgEl);
        // only admins may remove a finalised round
        if(isAdmin){
          const del = document.createElement('button');
          del.type = 'button'; del.className = 'his-del';
          del.title = 'Delete this history record';
          del.setAttribute('aria-label', 'Delete ' + name + "'s archived evaluation");
          del.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" ' +
            'stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5"/></svg>';
          del.addEventListener('click', e => {
            e.stopPropagation();
            deleteArchiveRecord({ pid, name, when });
          });
          row.appendChild(del);
        }
        list.appendChild(row);
      });
    }

    // Removing a history record wipes that whole finalised round for good.
    async function deleteArchiveRecord(ctx){
      if(!isAdmin || !ctx) return;
      if(!await uiConfirm('Delete this history record?',
          ctx.name + "'s archived evaluation from " + new Date(ctx.when).toLocaleString() +
          ' will be permanently removed. This cannot be undone.',
          { ok: 'Delete history', danger: true })) return;
      const { data: gone, error } = await supabase.from('evaluations')
        .delete().eq('employee_id', ctx.pid).eq('archived', true).eq('archived_at', ctx.when)
        .select('id');
      if(error){ uiAlert('Could not delete', error.message); return; }
      // RLS removes rows silently when a policy blocks them — nothing back means nothing went
      if(!gone || !gone.length){
        uiAlert('Nothing was deleted',
          'The database refused to remove that record. Your account may not have permission to ' +
          'delete archived evaluations.');
        return;
      }
      const wasOpen = viewingArchive === ctx.when && target === ctx.pid;
      await loadHistory();
      if(wasOpen) el('backBtn').click();
      await uiAlert('Deleted', ctx.name + "'s history record has been removed.");
    }
    window.__deleteArchive = deleteArchiveRecord;

    function openArchive(pid, name, when, rs, rowEl){
      const stop = blockedFromLeaving();
      if(stop){ uiAlert('Not finished yet', stop); return; }
      mode = 'review';
      viewingArchive = when;
      archiveCtx = { pid, name, when };
      api.setEmployee(name);
      applyMode();
      target = pid; targetName = name;
      rs.sort((a,b) => (nameById.get(a.evaluator_id)||'').localeCompare(nameById.get(b.evaluator_id)||''));
      api.clearScores();
      api.setColumns(rs.map(r => nameById.get(r.evaluator_id) || 'Unknown'));
      rs.forEach((r,i) => api.setColumnScores(i, r.scores || {}));
      api.setComments(rs.map(r => {
        const t = (r.comments||'').trim();
        return t ? (nameById.get(r.evaluator_id)||'Evaluator') + ': ' + t : '';
      }).filter(Boolean).join('\n'));
      api.setReadOnly(true);
      reviewRows = []; fixDirty = false;
      show('fixBtn', false);
      el('archNote').classList.remove('hide');
      el('archText').textContent = 'Archived ' + new Date(when).toLocaleString() +
        ' — read only. Print and export still work.';
      show('progWrap', false);
      show('lockBtn', false);
      setState('Archived record', 'locked');
      [...el('hisList').children].forEach(c => c.classList.remove('on'));
      if(rowEl) rowEl.classList.add('on');
      openDrawer(false);
    }

    // leaving an archived record returns to the live view
    el('backBtn').addEventListener('click', () => {
      viewingArchive = null; archiveCtx = null;
      fixDirty = false;
      el('archNote').classList.add('hide');
      el('resetBtn').textContent = reviewing() ? 'Reset a submission' : 'Clear scores';
      [...el('hisList').children].forEach(c => c.classList.remove('on'));
    });
    window.__clearArchiveView = () => {
      viewingArchive = null; archiveCtx = null;
      el('archNote').classList.add('hide');
      el('resetBtn').textContent = reviewing() ? 'Reset a submission' : 'Clear scores';
      show('lockBtn', true);
    };

    el('sumHistory').addEventListener('click', () => {
      if(el('secHistory').classList.contains('open')) loadHistory();
    });
    loadHistory();
  }

  // ---- 3f. reset a wrong submission (admins only) ----------------------
  // Deleting an active row lets that evaluator score the person again from
  // scratch. Archived rounds are never touched.
  if(isAdmin){
    async function openResetDialog(){
      const id = target;
      if(!id){ uiAlert('No employee open', 'Choose someone from the sidebar first.'); return; }
      const { data, error } = await supabase.from('evaluations')
        .select('id, evaluator_id, average')
        .eq('employee_id', id).eq('archived', false);
      if(error){ uiAlert('Could not load submissions', error.message); return; }
      const rows = data ?? [];

      const scrim = document.createElement('div');
      scrim.className = 'rm-scrim';
      const who = api.employeeName();
      scrim.innerHTML =
        '<div class="rm-box">' +
          '<div class="rm-top"><div class="rm-ttl">Reset a submission</div>' +
          '<div class="rm-sub">Whose scores for ' + who + ' should be cleared? ' +
          'They can then evaluate ' + who + ' again.</div></div>' +
          '<div class="rm-body" id="rmBody"></div>' +
          '<div class="rm-foot">' +
            '<button type="button" id="rmClose">Close</button>' +
            '<button type="button" class="all" id="rmAll">Clear all</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(scrim);
      const close = () => { scrim.remove(); document.body.style.overflow = ''; };
      document.body.style.overflow = 'hidden';
      scrim.addEventListener('click', e => { if(e.target === scrim) close(); });
      scrim.querySelector('#rmClose').addEventListener('click', close);

      const body = scrim.querySelector('#rmBody');
      function paint(){
        body.innerHTML = '';
        if(!rows.length){ body.innerHTML = '<div class="rm-empty">No submissions to clear.</div>'; return; }
        rows.forEach(r => {
          const name = nameById.get(r.evaluator_id) || 'Unknown';
          const item = document.createElement('div');
          item.className = 'rm-item';
          item.innerHTML = '<span class="rm-nm">' + esc(name) + '</span>' +
            '<span class="rm-avg">avg ' + (r.average ?? 0) + '</span>';
          const x = document.createElement('button');
          x.className = 'rm-x'; x.type = 'button'; x.textContent = 'Clear';
          x.addEventListener('click', async () => {
            if(!await uiConfirm('Clear ' + name + "'s scores?",
                'This removes their scores for ' + who + '. They will be able to evaluate ' +
                who + ' again.', { ok: 'Clear scores', danger: true })) return;
            x.disabled = true; x.textContent = 'Clearing…';
            const { error } = await supabase.from('evaluations').delete().eq('id', r.id);
            if(error){ x.disabled = false; x.textContent = 'Clear';
              uiAlert('Could not clear', error.message); return; }
            rows.splice(rows.indexOf(r), 1);
            paint();
            await refreshAfterReset();
          });
          item.appendChild(x);
          body.appendChild(item);
        });
      }
      paint();

      scrim.querySelector('#rmAll').addEventListener('click', async () => {
        if(!rows.length){ close(); return; }
        if(!await uiConfirm('Clear all submissions?',
            'All ' + rows.length + ' submissions for ' + who + ' will be removed and everyone ' +
            'will need to evaluate ' + who + ' again. This cannot be undone.',
            { ok: 'Clear all', danger: true })) return;
        const { error } = await supabase.from('evaluations')
          .delete().eq('employee_id', target).eq('archived', false);
        if(error){ uiAlert('Could not clear', error.message); return; }
        close();
        await refreshAfterReset();
      });
    }

    async function refreshAfterReset(){
      if(window.__refreshResults) window.__refreshResults();
      const id = target; target = null;
      el('empName').value = nameById.get(id) || '';
      await onEmployeeChange();
    }

    // in review the Clear button picks a submission; when scoring it still
    // clears the form in front of you
    el('resetBtn').addEventListener('click', e => {
      if(!reviewing()) return;
      e.stopImmediatePropagation();
      e.preventDefault();
      // viewing a finalised round: the same button deletes that record instead
      if(archiveCtx && window.__deleteArchive){ window.__deleteArchive(archiveCtx); return; }
      openResetDialog();
    }, true);
  }

  // ---- 4. sign out ------------------------------------------------------
  document.getElementById('signOut').addEventListener('click', async () => {
    const b = document.getElementById('signOut');
    if(dirty && !await uiConfirm('Sign out with unsaved scores?',
        'Your unsaved scores will be lost.', { ok: 'Sign out', danger: true })) return;
    dirty = false;              // deliberate exit — skip the leave prompt
    b.disabled = true;
    const label = b.querySelector('span'); if(label) label.textContent = 'Signing out…';
    try{ await supabase.auth.signOut(); }
    catch(err){ console.warn('Sign out error', err); }
    window.location.replace('login.html');
  });

  supabase.auth.onAuthStateChange((event) => {
    if(event === 'SIGNED_OUT') window.location.replace('login.html');
  });
}

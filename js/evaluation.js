const LOGO_JPG_B64="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";
const LOGO_B64="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";
document.getElementById('logoImg').src="data:image/png;base64,"+LOGO_B64;
const SCALE_MAX = 5;
const SCALE_MIN = 1;
const FORMS = {
  "Probationary":{title:"BETTER PRACTICE PROBATIONARY EMPLOYEE PERFORMANCE EVALUATION FORM",position:"Probationary",rows:[["Attendance & Punctuality","Reports to work on time and follows schedule consistently."],["Willingness to Learn","Shows initiative in learning processes, systems, and assigned tasks."],["Quality of Work","Accuracy, completeness, and attention to detail in assigned work."],["Productivity","Ability to complete assigned tasks within expected turnaround time."],["Communication Skills","Professional and clear communication with teammates and clients."],["Teamwork & Cooperation","Works well with the team and follows instructions properly."],["Accountability & Reliability","Takes ownership of assigned responsibilities and follows through on tasks."],["Adaptability","Ability to adjust to new tasks, corrections, workload changes, and feedback."],["Professionalism","Demonstrates proper attitude, respect, integrity, and work ethics."],["Overall Performance & Potential","Shows readiness for regularization and long-term growth within the company."]]},
  "Junior Staff":{title:"BETTER PRACTICE JUNIOR STAFF PERFORMANCE EVALUATION FORM",position:"Junior Staff",rows:[["Accuracy & Quality of Work","Accuracy in endorsements, onboarding, monitoring, encoding, and document handling."],["Productivity & Task Completion","Ability to complete assigned tasks, follow-ups, endorsements, and monitoring on time."],["Client Communication","Professionalism, responsiveness, and clarity in SMS, Viber, email, and client handling."],["Turnaround Time","Speed and efficiency in handling client concerns, onboarding, and endorsements."],["Monitoring & Follow-Up","Consistency in tracking pending requirements, onboarding status, and client updates."],["Team Coordination","Proper coordination with CRO, Compliance, Operations, Billing, and other teams."],["Accountability & Reliability","Ownership of tasks, attendance, punctuality, and ability to follow instructions properly."],["Adaptability & Initiative","Shows respect, integrity, proper work ethics, and professionalism in all interactions."],["Professionalism","Willingness to learn and improve skills."],["Position-Specific Performance","Performance based on assigned role responsibilities and workload."]]},
  "Senior Staff":{title:"BETTER PRACTICE SENIOR EVALUATION FORM",position:"Senior",senior:true,rows:[["Leadership & Team Guidance","Ability to guide, support, and motivate team members effectively."],["Team Productivity & Task Management","Proper delegation, monitoring, and completion of team tasks and deadlines."],["Decision-Making & Problem Solving","Ability to resolve issues, escalations, and operational concerns efficiently."],["Communication Skills","Clear, professional, and timely communication with team members and clients."],["Quality Control & Accuracy","Reviews endorsements, onboarding, monitoring, and outputs for completeness and accuracy."],["Workload Management","Ability to balance workloads fairly and support high-volume or urgent cases."],["Accountability & Reliability","Ownership of team performance, punctuality, follow-through, and consistency."],["Coaching & Staff Development","Provides training, guidance, and constructive feedback to junior staff."],["Professionalism","Demonstrates integrity, professionalism, and proper handling of sensitive situations."],["Team Performance Outcome","Overall team performance, turnaround time, coordination, and client satisfaction under the team leader's supervision."]]}
};

// Roster + the form each person is evaluated on.
const STAFF={
  "Mark Ian Buenzalida":"Probationary",
  "Rose Villano":"Probationary",
  "John Louis Marcos Dionisio":"Probationary",
  "Aiko Yasuda":"Senior Staff",
  "Marivie Marquez":"Junior Staff",
  "Camila Haduca":"Junior Staff",
  "Monique Eileen Irog-irog":"Junior Staff"
};
let EMPLOYEES=Object.keys(STAFF).sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}));
const nameKey=x=>String(x||'').toLowerCase().replace(/\s+/g,' ').trim();
let STAFF_BY_KEY={}; for(const n of EMPLOYEES) STAFF_BY_KEY[nameKey(n)]=STAFF[n];
// Replace the built-in roster with rows from Supabase. Each row: {full_name, form_role}.
// Anything without a usable form_role keeps its built-in mapping, then falls back to Probationary.
window.setRoster=function(rows){
  if(!Array.isArray(rows)||!rows.length) return false;
  const valid=Object.keys(FORMS);
  const next={};
  rows.forEach(r=>{
    const n=(r.full_name||'').trim(); if(!n) return;
    let f=(r.form_role||'').trim();
    if(!valid.includes(f)) f=STAFF_BY_KEY[nameKey(n)]||'Probationary';
    next[n]=f;
  });
  if(!Object.keys(next).length) return false;
  EMPLOYEES=Object.keys(next).sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}));
  STAFF_BY_KEY={}; EMPLOYEES.forEach(n=>STAFF_BY_KEY[nameKey(n)]=next[n]);
  if(!applyRoleFromName()) { buildHead(); buildBody(); compute(); }
  return true;
};
// Switch the form to match the named employee. Returns true if the role changed.
function applyRoleFromName(){
  const r=STAFF_BY_KEY[nameKey(document.getElementById('empName').value)];
  if(!r||r===role) return false;
  role=r; render(); return true;
}
let role="Probationary", evaluators=6;
const MIN_EV=1,MAX_EV=10;
let scores={};
let managerSaved={normal:"Aiko Yasuda", senior:"Client Relation Department"};

const round1=n=>Math.round(n*10)/10;
function ensureStore(){ if(!scores[role])scores[role]={}; FORMS[role].rows.forEach((_,i)=>{ if(!scores[role][i])scores[role][i]={}; }); }

const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
// Column labels: once an employee is named, Eval 1 becomes the manager/department
// and the remaining columns are filled with the other employees on the roster.
function evaluatorNames(){
  if(NAME_OVERRIDE){
    const out=NAME_OVERRIDE.slice(0,evaluators);
    while(out.length<evaluators) out.push('Eval '+(out.length+1));
    return out;
  }
  const emp=(document.getElementById('empName')?.value||'').trim();
  const mgr=(document.getElementById('manager')?.value||'').trim();
  const out=[];
  if(!emp){ for(let e=0;e<evaluators;e++) out.push('Eval '+(e+1)); return out; }
  const taken=new Set([nameKey(emp)]);
  // On the Senior form the first field is a Department, not a person, so it
  // never becomes a column header — every column comes from the roster instead.
  if(!FORMS[role].senior){ out.push(mgr||'Eval 1'); taken.add(nameKey(mgr)); }
  const pool=EMPLOYEES.filter(n=>!taken.has(nameKey(n)));
  const base=out.length;
  for(let e=base;e<evaluators;e++) out.push(pool[e-base]||('Eval '+(e+1)));
  return out;
}
let layout='grid', curEv=0;
const LAYOUTS=['grid','pinned','single','cards'];

function setLayout(l){
  if(!LAYOUTS.includes(l)) l='grid';
  layout=l;
  const show=(id,on)=>{const el=document.getElementById(id); if(el) el.hidden=!on;};
  show('gridWrap',   l==='grid'||l==='pinned');
  show('singleWrap', l==='single');
  show('evtabs',     l==='single');
  show('cards',      l==='cards');
  document.getElementById('panel').classList.toggle('pinned', l==='pinned');
  const now=document.getElementById('layNow');
  if(now) now.textContent=(VIEWS.find(v=>v.id===l)?.name||'')+' view';
  paintPicker(l);
  // Empty the layouts that are not on screen: they reuse the same element ids
  // (av-0, sc-0 ...), so leaving them in the DOM would shadow the live ones.
  const clear=id=>{const el=document.getElementById(id); if(el) el.innerHTML='';};
  if(l!=='grid'&&l!=='pinned'){ clear('headRow'); clear('body'); }
  if(l!=='single'){ clear('rows'); clear('evtabs'); }
  if(l!=='cards'){ clear('cards'); }
  buildHead(); buildBody(); compute();
}

function evScored(e){
  ensureStore();
  return FORMS[role].rows.filter((_,ci)=>scores[role][ci][e]!==undefined).length;
}

function buildHead(){
  if(layout==='single'){ buildTabs(); return; }
  if(layout==='cards') return;              // labels live inside each card
  const names=evaluatorNames();
  let h='<th class="crit">Criteria &amp; Description</th>';
  for(let e=0;e<evaluators;e++) h+=`<th class="evh" title="${esc(names[e])}">${esc(names[e])}</th>`;
  h+='<th class="tot">Score</th><th class="tot">Average</th>';
  document.getElementById('headRow').innerHTML=h;
}

function buildTabs(){
  if(curEv>evaluators-1) curEv=evaluators-1;
  if(curEv<0) curEv=0;
  const names=evaluatorNames(), c=document.getElementById('evtabs');
  c.innerHTML='';
  names.forEach((n,i)=>{
    const b=document.createElement('button');
    const done=evScored(i)===FORMS[role].rows.length;
    b.className='evtab'+(i===curEv?' active':'')+(done?' done':'');
    b.title=n+(done?' — complete':'');
    b.innerHTML='<span class="evdot"></span>'+esc(n);
    b.onclick=()=>{curEv=i;buildHead();buildBody();compute();};
    c.appendChild(b);
  });
  document.getElementById('evWho').textContent=names[curEv]||'';
  document.getElementById('evPrev').disabled=curEv===0;
  document.getElementById('evNext').disabled=curEv===evaluators-1;
  paintProgress();
}
function paintProgress(){
  const el=document.getElementById('evProg');
  if(el&&layout==='single') el.textContent=evScored(curEv)+' of '+FORMS[role].rows.length+' scored';
}
function refreshTabs(){
  if(layout!=='single') return;
  const c=document.getElementById('evtabs'); if(!c) return;
  [...c.children].forEach((b,i)=>b.classList.toggle('done',evScored(i)===FORMS[role].rows.length));
  paintProgress();
}

function wireInputs(host){
  host.querySelectorAll('.score-in').forEach(inp=>{
    inp.addEventListener('input',onScoreInput);
    inp.addEventListener('keydown',onScoreKey);
    inp.addEventListener('blur',onScoreBlur);
  });
}

// Read-only is a persistent state, not a one-off: every rebuild (layout
// switch, score reload) has to re-apply it or the grid silently unlocks.
let RO_SCORES=false, RO_COMMENTS=false;
function applyRO(){
  document.querySelectorAll('.score-in').forEach(i=>{ i.readOnly=RO_SCORES; });
  const c=document.getElementById('comment'); if(c) c.readOnly=RO_COMMENTS;
}
function buildBody(){
  ensureStore();
  if(layout==='single')      { buildSingle(); applyRO(); return; }
  if(layout==='cards')       { buildCards();  applyRO(); return; }
  const tb=document.getElementById('body'); tb.innerHTML='';
  FORMS[role].rows.forEach(([name,desc],ci)=>{
    const tr=document.createElement('tr');
    let cells=`<td class="crit"><div class="crit-name">${ci+1}. ${name}</div><div class="crit-desc">${desc}</div></td>`;
    const names=evaluatorNames();
    for(let e=0;e<evaluators;e++){
      const v=scores[role][ci][e]??'';
      cells+=`<td data-label="${esc(names[e]||('Eval '+(e+1)))}"><input class="score-in" inputmode="decimal" data-c="${ci}" data-e="${e}" value="${v}"></td>`;
    }
    cells+=`<td class="calc" id="sc-${ci}" data-label="Score">0</td><td class="calc dim" id="av-${ci}" data-label="Average">0</td>`;
    tr.innerHTML=cells; tb.appendChild(tr);
  });
  wireInputs(tb);
  applyRO();
}

function buildSingle(){
  const host=document.getElementById('rows'); host.innerHTML='';
  FORMS[role].rows.forEach(([name,desc],ci)=>{
    const v=scores[role][ci][curEv]??'';
    const d=document.createElement('div'); d.className='crow';
    d.innerHTML=`<div class="cnum">${ci+1}</div>`+
      `<div class="ctext"><div class="crit-name">${name}</div><div class="crit-desc">${desc}</div></div>`+
      `<input class="score-in" inputmode="decimal" data-c="${ci}" data-e="${curEv}" value="${v}">`+
      `<div class="rowavg">avg<b id="av-${ci}">0</b><span id="sc-${ci}" hidden>0</span></div>`;
    host.appendChild(d);
  });
  wireInputs(host);
}

function buildCards(){
  const names=evaluatorNames();
  const host=document.getElementById('cards'); host.innerHTML='';
  FORMS[role].rows.forEach(([name,desc],ci)=>{
    let cells='';
    for(let e=0;e<evaluators;e++){
      const v=scores[role][ci][e]??'';
      cells+=`<label class="cell"><span class="nm" title="${esc(names[e])}">${esc(names[e])}</span>`+
        `<input class="score-in" inputmode="decimal" data-c="${ci}" data-e="${e}" value="${v}"></label>`;
    }
    const d=document.createElement('div'); d.className='card'; d.id='card-'+ci;
    d.innerHTML=`<div class="chead"><div class="cnum">${ci+1}</div>`+
      `<div class="ctext"><div class="crit-name">${name}</div><div class="crit-desc">${desc}</div></div>`+
      `<div class="cpill"><span id="av-${ci}">0</span> avg &middot; <span id="n-${ci}">0</span>/${evaluators}`+
      `<span id="sc-${ci}" hidden>0</span></div></div>`+
      `<div class="cgrid">${cells}</div>`;
    host.appendChild(d);
  });
  wireInputs(host);
  paintCards();
}
function paintCards(){
  if(layout!=='cards') return;
  ensureStore();
  FORMS[role].rows.forEach((_,ci)=>{
    let n=0; for(let e=0;e<evaluators;e++) if(scores[role][ci][e]!==undefined) n++;
    const nEl=document.getElementById('n-'+ci); if(nEl) nEl.textContent=n;
    const card=document.getElementById('card-'+ci); if(card) card.classList.toggle('filled',n===evaluators);
  });
}
function onScoreBlur(e){
  const inp=e.target;
  if(cellValid(inp)) return;          // valid or empty -> allow leaving
  // allow leaving to buttons/other controls (don't trap the user out of the grid)
  const to=e.relatedTarget;
  if(to && !to.classList.contains('score-in')) return;
  inp.classList.add('bad');
  const st=document.getElementById('status');
  st.textContent="Enter a value from 1 to 5 (decimals allowed) before moving on.";
  setTimeout(()=>{ if(st.textContent.startsWith("Enter a value")) st.textContent=""; },2500);
  // pull focus back to the invalid box
  setTimeout(()=>{ inp.focus(); inp.select(); },0);
}
function focusCell(ci,ev){
  const el=document.querySelector(`.score-in[data-c="${ci}"][data-e="${ev}"]`);
  if(el){ el.focus(); el.select(); }
  return !!el;
}
function cellValid(inp){
  const raw=inp.value.trim();
  if(raw==="") return true; // empty is allowed (just skipped)
  if(!/^\d+(\.\d{1,2})?$/.test(raw)) return false; // digits, optional 1-2 decimals
  const num=Number(raw);
  return !(isNaN(num)||num<SCALE_MIN||num>SCALE_MAX);
}
function onScoreKey(e){
  const inp=e.target, ci=+inp.dataset.c, ev=+inp.dataset.e;
  const lastRow=FORMS[role].rows.length-1, lastCol=evaluators-1;
  const navKeys=["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Enter","Tab"];
  // If trying to leave this box but the value is invalid, block it
  if(navKeys.includes(e.key) && !cellValid(inp)){
    e.preventDefault();
    inp.classList.add('bad');
    inp.focus(); inp.select();
    const st=document.getElementById('status');
    st.textContent="Enter a value from 1 to 5 (decimals allowed) before moving on.";
    setTimeout(()=>{ if(st.textContent.startsWith("Enter a value")) st.textContent=""; },2500);
    return;
  }
  let handled=true;
  switch(e.key){
    case "ArrowUp":   focusCell(ci>0?ci-1:lastRow, ev); break;
    case "ArrowDown":
    case "Enter":
      if(ci<lastRow) focusCell(ci+1, ev);
      else if(e.key==="Enter" && layout==='single' && curEv<evaluators-1) document.getElementById('evNext').click();
      else focusCell(0, ev);
      break;
    case "ArrowRight":
      // jump to next column only when cursor is at end of the text
      if(inp.selectionStart===inp.value.length){
        if(ev<lastCol) focusCell(ci, ev+1);
        else if(ci<lastRow) focusCell(ci+1, 0); // wrap to next row start
        else handled=false;
      } else handled=false;
      break;
    case "ArrowLeft":
      if(inp.selectionStart===0){
        if(ev>0) focusCell(ci, ev-1);
        else if(ci>0) focusCell(ci-1, lastCol); // wrap to prev row end
        else handled=false;
      } else handled=false;
      break;
    default: handled=false;
  }
  if(handled) e.preventDefault();
}
function onScoreInput(e){
  const inp=e.target, ci=+inp.dataset.c, ev=+inp.dataset.e, raw=inp.value.trim();
  if(raw===''){ delete scores[role][ci][ev]; inp.classList.remove('bad'); compute(); refreshTabs();
    if(window.__scoreHook) window.__scoreHook(); return; }
  if(raw==="."){ inp.classList.add('bad'); return; }
  const typing=/^\d+\.$/.test(raw);              // e.g. "4." while still typing
  const num=Number(raw);
  if(isNaN(num)||num<SCALE_MIN||num>SCALE_MAX||(!typing&&!/^\d+(\.\d{1,2})?$/.test(raw))){
    inp.classList.add('bad'); return;
  }
  inp.classList.remove('bad'); scores[role][ci][ev]=num; compute(); refreshTabs();
  if(window.__scoreHook) window.__scoreHook();
}
function interpret(avg){
  if(avg>=4.5)return"Outstanding"; if(avg>=3.5)return"Very Good";
  if(avg>=2.5)return"Satisfactory"; if(avg>=1.5)return"Needs Improvement";
  if(avg>0)return"Poor"; return"";
}
function compute(){
  let avgVals=[], scoreVals=[];
  FORMS[role].rows.forEach((_,ci)=>{
    const obj=scores[role][ci], vals=[];
    for(let e=0;e<evaluators;e++) if(obj[e]!==undefined) vals.push(obj[e]);
    const sum=round1(vals.reduce((a,b)=>a+b,0));
    const avg=vals.length?round1(sum/vals.length):0;
    const scEl=document.getElementById('sc-'+ci); if(scEl) scEl.textContent=sum;
    const avEl=document.getElementById('av-'+ci); if(avEl) avEl.textContent=avg;
    if(vals.length){ avgVals.push(avg); scoreVals.push(sum); }
  });
  const totalScore=round1(scoreVals.reduce((a,b)=>a+b,0));
  const avgScore=avgVals.length?round1(avgVals.reduce((a,b)=>a+b,0)/avgVals.length):0;
  document.getElementById('totalScore').textContent=totalScore;
  document.getElementById('totalAvg').textContent=avgScore;
  const word=interpret(avgScore);
  document.getElementById('interp').innerHTML=word?`Interpretation: <b>${word}</b>`:'';
  paintCards();
}
function currentData(){
  const scoreRows=[], avgRows=[];
  FORMS[role].rows.forEach((_,ci)=>{
    const obj=scores[role][ci], vals=[];
    for(let e=0;e<evaluators;e++) if(obj[e]!==undefined) vals.push(obj[e]);
    if(vals.length){
      scoreRows.push(round1(vals.reduce((a,b)=>a+b,0)));
      avgRows.push(round1(vals.reduce((a,b)=>a+b,0)/vals.length));
    }else{ scoreRows.push(null); avgRows.push(null); }
  });
  const filledScores=scoreRows.filter(v=>v!==null);
  const totalScore=round1(filledScores.reduce((a,b)=>a+b,0)); // sum of the criterion scores (cell values)
  const filledAvg=avgRows.filter(v=>v!==null);
  const avgScore=filledAvg.length?round1(filledAvg.reduce((a,b)=>a+b,0)/filledAvg.length):0; // mean rating 1–5
  // rows = the value placed in the form's Rating cell = the SCORE (sum of evaluators)
  const maxPossible=FORMS[role].rows.length*SCALE_MAX*evaluators;
  return {rows:scoreRows, scoreRows, avgRows, totalScore, avgScore, maxPossible};
}
function render(){
  setLayout(layout);
  document.getElementById('position').value=FORMS[role].position;
  const mField=document.getElementById('managerField');
  const mInput=document.getElementById('manager');
  if(FORMS[role].senior){
    // Department is a place, not a person — free text is correct here.
    mField.querySelector('label').textContent="Department";
    mInput.readOnly=false;
    if(managerSaved.senior===undefined) managerSaved.senior="CRO";
    mInput.value=managerSaved.senior;
  }else{
    // The evaluator is whoever is signed in — the database already enforces
    // this via evaluator_id, so the field must not be able to say otherwise.
    mField.querySelector('label').textContent="Evaluator";
    mInput.readOnly=true;
    mInput.value = window.__currentUserName || managerSaved.normal || '';
  }
  document.getElementById('evVal').textContent=evaluators;
  compute();
}

const drawer=document.getElementById('drawer'), scrim=document.getElementById('scrim');
function openDrawer(v){
  drawer.classList.toggle('open',v);
  scrim.hidden=false; scrim.classList.toggle('open',v);
  drawer.setAttribute('aria-hidden',String(!v));
  document.getElementById('burger').setAttribute('aria-expanded',String(v));
  document.body.style.overflow=v?'hidden':'';
  if(v) document.getElementById('layTrigger').focus();
  else document.getElementById('burger').focus();
}
document.getElementById('burger').onclick=()=>openDrawer(!drawer.classList.contains('open'));
document.getElementById('drawerClose').onclick=()=>openDrawer(false);
scrim.onclick=()=>openDrawer(false);
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&drawer.classList.contains('open')) openDrawer(false); });
// ---- criteria view picker (custom listbox) ----
const VIEWS=[
  {id:'grid',   name:'Full grid',      ds:'Every evaluator in one wide table',
   ico:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M15 4v16M3 10h18"/></svg>'},
  {id:'pinned', name:'Pinned criteria',ds:'Criteria column stays put while scores scroll',
   ico:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/><path d="M13 12h6M17 9l3 3-3 3" stroke-linecap="round"/></svg>'},
  {id:'single', name:'One at a time',  ds:'Score as one evaluator, then move on',
   ico:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="7" r="3"/><path d="M6 20v-1a6 6 0 0112 0v1"/></svg>'},
  {id:'cards',  name:'Criterion cards',ds:'One card per criterion, no scrolling',
   ico:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/></svg>'}];
const TICK='<svg class="tick" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>';
const layWrap=document.getElementById('layWrap'), layMenu=document.getElementById('layMenu'),
      layTrigger=document.getElementById('layTrigger');
let layCursor=0;

VIEWS.forEach((v,i)=>{
  const b=document.createElement('button');
  b.className='lay-opt'; b.type='button'; b.setAttribute('role','option'); b.dataset.lay=v.id;
  b.innerHTML=`<span class="ico">${v.ico}</span><span class="txt"><span class="nm">${v.name}</span>`+
              `<span class="ds">${v.ds}</span></span>${TICK}`;
  b.addEventListener('click',()=>{ setLayout(v.id); openPicker(false); openDrawer(false); });
  b.addEventListener('mousemove',()=>{ layCursor=i; paintCursor(); });
  layMenu.appendChild(b);
});

function paintPicker(l){
  const v=VIEWS.find(x=>x.id===l)||VIEWS[0];
  document.getElementById('layCur').textContent=v.name;
  document.getElementById('layIco').innerHTML=v.ico;
  [...layMenu.children].forEach(b=>b.setAttribute('aria-selected',String(b.dataset.lay===l)));
  layCursor=Math.max(0,VIEWS.findIndex(x=>x.id===l));
  paintCursor();
}
function paintCursor(){
  [...layMenu.children].forEach((b,i)=>b.classList.toggle('cursor',i===layCursor));
}
function openPicker(v){
  layWrap.classList.toggle('open',v);
  layTrigger.setAttribute('aria-expanded',String(v));
  if(v) paintCursor();
}
layTrigger.addEventListener('click',e=>{ e.stopPropagation(); openPicker(!layWrap.classList.contains('open')); });
document.addEventListener('click',e=>{ if(!layWrap.contains(e.target)) openPicker(false); });
layWrap.addEventListener('keydown',e=>{
  const open=layWrap.classList.contains('open');
  if(e.key==='Escape'&&open){ e.stopPropagation(); openPicker(false); layTrigger.focus(); return; }
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){
    e.preventDefault();
    if(!open){ openPicker(true); return; }
    layCursor=(layCursor+(e.key==='ArrowDown'?1:-1)+VIEWS.length)%VIEWS.length;
    paintCursor();
  }else if((e.key==='Enter'||e.key===' ')&&open){
    e.preventDefault(); layMenu.children[layCursor].click();
  }
});
const gotoEv=d=>{ curEv=Math.min(Math.max(curEv+d,0),evaluators-1);
  buildHead(); buildBody(); compute();
  const f=document.querySelector('#rows .score-in'); if(f){f.focus();f.select();} };
document.getElementById('evPrev').onclick=()=>gotoEv(-1);
document.getElementById('evNext').onclick=()=>gotoEv(1);
document.getElementById('evPlus').onclick=()=>{if(evaluators<MAX_EV){evaluators++;buildHead();buildBody();compute();}document.getElementById('evVal').textContent=evaluators;};
document.getElementById('evMinus').onclick=()=>{if(evaluators>MIN_EV){evaluators--;buildHead();buildBody();compute();}document.getElementById('evVal').textContent=evaluators;};
document.getElementById('resetBtn').onclick=async()=>{
  if(!await uiConfirm("Clear scores?",
      "Only the scores will be cleared. The employee name and comments will stay.",
      { ok: "Clear scores", danger: true })) return;

  scores[role]={};
  ensureStore();
  buildBody();
  compute();

  // Keep the selected employee and existing comments. The score hook lets the
  // database sync the empty score state in realtime.
  if(window.__scoreHook) window.__scoreHook();

  const st=document.getElementById('status');
  st.textContent="Scores cleared.";
  setTimeout(()=>{ if(st.textContent==="Scores cleared.") st.textContent=""; },3000);
};

function requireName(){
  const inp=document.getElementById('empName');
  let name=inp.value.trim();
  if(!name){
    inp.classList.add('bad');
    inp.focus();
    uiAlert("Employee name needed", "Enter the name of the person being evaluated first.");
    return false;
  }
  name=toProperCase(name);
  // Reject anything that isn't an exact roster match — no self-invented names.
  if(window.__isRosterName && !window.__isRosterName(name)){
    inp.classList.add('bad');
    inp.focus();
    uiAlert("Not on the roster", "\"" + name + "\" doesn't match anyone on the staff list. Pick a name from the suggestions.");
    return false;
  }
  inp.value=name;
  inp.classList.remove('bad');
  return true;
}
function requireValidScores(){
  const boxes=document.querySelectorAll('.score-in');
  for(const inp of boxes){
    if(!cellValid(inp)){
      inp.classList.add('bad');
      inp.focus(); inp.select();
      const st=document.getElementById('status');
      st.textContent="Fix the highlighted score (must be 1–5, decimals allowed).";
      setTimeout(()=>{ if(st.textContent.startsWith("Fix the highlighted")) st.textContent=""; },2500);
      return false;
    }
  }
  return true;
}
// ---------------------------------------------------------------
// Bridge used by the Supabase module below. Column names come from the
// roster by default; in reviewer mode they are the actual evaluators.
// ---------------------------------------------------------------
let NAME_OVERRIDE = null;
window.evalApi = {
  formRole: () => role,
  criteriaCount: () => FORMS[role].rows.length,

  // reviewer mode: one column per person who submitted
  setColumns(names){
    NAME_OVERRIDE = names.slice();
    evaluators = Math.max(1, names.length);
    document.getElementById('evVal').textContent = evaluators;
    curEv = 0;
    buildHead(); buildBody(); compute();
  },
  clearColumns(){ NAME_OVERRIDE = null; },

  // wipe every score for the current form
  clearScores(){ scores[role] = {}; ensureStore(); buildHead(); buildBody(); compute(); },

  // {criterionIndex: value} for one column
  setColumnScores(idx, obj){
    ensureStore();
    FORMS[role].rows.forEach((_, ci) => {
      const v = obj?.[ci] ?? obj?.[String(ci)];
      if (v === undefined || v === null) delete scores[role][ci][idx];
      else scores[role][ci][idx] = Number(v);
    });
    buildHead(); buildBody(); compute();
  },
  getColumnScores(idx){
    ensureStore();
    const out = {};
    FORMS[role].rows.forEach((_, ci) => {
      const v = scores[role][ci][idx];
      if (v !== undefined) out[ci] = v;
    });
    return out;
  },
  columnComplete(idx){
    ensureStore();
    return FORMS[role].rows.every((_, ci) => scores[role][ci][idx] !== undefined);
  },
  average(){ return Number(document.getElementById('totalAvg').textContent) || 0; },
  // the mean for ONE column — reviewers save each evaluator's row separately,
  // so the whole-grid average above is the wrong number for that
  columnAverage(idx){
    ensureStore();
    const vals=[];
    FORMS[role].rows.forEach((_, ci) => {
      const v = scores[role][ci][idx];
      if(v !== undefined && v !== null && v !== '') vals.push(Number(v));
    });
    return vals.length ? round1(vals.reduce((a,b)=>a+b,0)/vals.length) : 0;
  },
  comments(){ return document.getElementById('comment').value; },
  setComments(t){ document.getElementById('comment').value = t || ''; },
  employeeName(){ return document.getElementById('empName').value.trim(); },
  // Set the employee programmatically: applies the right criteria form and
  // leaves the autocomplete closed (dispatching 'input' would open it).
  setEmployee(name){
    const inp = document.getElementById('empName');
    inp.value = name || '';
    inp.classList.remove('bad');
    document.querySelectorAll('.ac-box').forEach(b => b.classList.remove('open'));
    if(!applyRoleFromName()){ buildHead(); buildBody(); compute(); }
  },
  onScoreChange(fn){ window.__scoreHook = fn; },
  // commentsOn defaults to the score setting; reviewers editing scores still
  // get a locked comment box, because in review it holds every evaluator's
  // notes merged into one blob and saving it back would corrupt them
  setReadOnly(on, commentsOn){
    RO_SCORES = !!on;
    RO_COMMENTS = commentsOn === undefined ? !!on : !!commentsOn;
    applyRO();
  }
};

// ---------------------------------------------------------------
// In-page replacements for window.confirm / window.alert, so every
// prompt matches the app rather than the browser chrome.
// ---------------------------------------------------------------
function uiDialog({ title, message = '', ok = 'OK', cancel = null, danger = false }){
  return new Promise(resolve => {
    const scrim = document.createElement('div');
    scrim.className = 'dlg-scrim';
    scrim.innerHTML =
      '<div class="dlg" role="dialog" aria-modal="true">' +
        '<div class="dlg-top"><div class="dlg-ttl"></div><div class="dlg-msg"></div></div>' +
        '<div class="dlg-foot"></div>' +
      '</div>';
    scrim.querySelector('.dlg-ttl').textContent = title;
    const msgEl = scrim.querySelector('.dlg-msg');
    msgEl.textContent = message;
    if(!message) msgEl.remove();

    const foot = scrim.querySelector('.dlg-foot');
    const done = v => {
      scrim.classList.remove('in');
      document.removeEventListener('keydown', onKey, true);
      setTimeout(() => { scrim.remove(); document.body.style.overflow = prevOverflow; }, 160);
      resolve(v);
    };
    if(cancel){
      const c = document.createElement('button');
      c.className = 'cancel'; c.type = 'button'; c.textContent = cancel;
      c.addEventListener('click', () => done(false));
      foot.appendChild(c);
    }
    const o = document.createElement('button');
    o.className = 'ok' + (danger ? ' danger' : ''); o.type = 'button'; o.textContent = ok;
    o.addEventListener('click', () => done(true));
    foot.appendChild(o);

    function onKey(e){
      if(e.key === 'Escape'){ e.stopPropagation(); done(!cancel ? true : false); }
      else if(e.key === 'Enter'){ e.stopPropagation(); done(true); }
    }
    document.addEventListener('keydown', onKey, true);
    scrim.addEventListener('click', e => { if(e.target === scrim && cancel) done(false); });

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.appendChild(scrim);
    requestAnimationFrame(() => { scrim.classList.add('in'); o.focus(); });
  });
}
window.uiAlert   = (title, message) => uiDialog({ title, message });
window.uiConfirm = (title, message, opts = {}) =>
  uiDialog({ title, message, ok: opts.ok || 'Continue', cancel: opts.cancel || 'Cancel', danger: !!opts.danger });

function canExport(){ return requireName() && requireValidScores(); }

document.getElementById('printBtn').onclick=()=>{ if(!canExport()) return; openPrint(); };

// Ctrl+P / Cmd+P prints the evaluation form, not the web page.
document.addEventListener('keydown',e=>{
  const key=(e.key||'').toLowerCase();
  if(key!=='p' || !(e.ctrlKey||e.metaKey) || e.altKey || e.shiftKey) return;
  e.preventDefault();                     // stop the browser's own print dialog
  if(document.getElementById('__printFrame')) return;   // already printing
  const el=document.activeElement;
  if(el && el.blur) el.blur();            // commit whatever cell is being edited
  if(!canExport()) return;                // same name/score checks as the button
  openPrint();
});

document.getElementById('pdfBtn').onclick=()=>{
  if(!canExport()) return;
  const btn=document.getElementById('pdfBtn'), st=document.getElementById('status');
  btn.disabled=true; st.textContent="Generating PDF…";
  try{ buildPDF(); st.textContent="PDF downloaded."; }
  catch(err){ console.error(err); st.textContent="Couldn't generate the PDF. Try again."; }
  finally{ btn.disabled=false; setTimeout(()=>st.textContent="",4000); }
};

document.getElementById('exportBtn').onclick=async()=>{
  if(!canExport()) return;
  const btn=document.getElementById('exportBtn'), st=document.getElementById('status');
  btn.disabled=true; st.textContent="Generating…";
  try{ buildDocx(); st.textContent="Word downloaded."; }
  catch(err){ console.error(err); st.textContent="Couldn't generate the file. Try again."; }
  finally{ btn.disabled=false; setTimeout(()=>st.textContent="",4000); }
};

// ---- Print preview: render the form as HTML in a new window and open print dialog ----
function formHTML(){
  const f=FORMS[role], data=currentData();
  const empName=document.getElementById('empName').value.trim();
  const manager=document.getElementById('manager').value.trim();
  const dateStr=document.getElementById('date').value;
  const comment=document.getElementById('comment').value.trim();
  const commentLines=comment ? comment.split(/\r?\n/).map(s=>s.trim()).filter(Boolean) : [];
  const cur=interpret(data.avgScore);
  const esc=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const bold=!f.senior;
  let metaHTML;
  if(f.senior){
    metaHTML=`<p><b>Manager Name:</b> ${esc(empName||"________________________")}</p>
      <p><b>Department:</b> ${esc(manager||"__________________________")}</p>
      <p><b>Date:</b> ${esc(dateStr||"_______________")}</p>`;
  }else{
    metaHTML=`<p class="b"><b>Employee Name: ${esc(empName||"________________________")}</b></p>
      <p class="b"><b>Position: ${esc(f.position)}</b></p>
      <p class="b"><b>Evaluator (Manager): ${esc(manager||"_______________________")}</b></p>
      <p class="b"><b>Date: ${esc(dateStr||"_______________")}</b></p>`;
  }
  let rowsHTML="";
  f.rows.forEach(([name,desc],i)=>{
    const r=data.rows[i];
    const no=bold?`<b>${i+1}</b>`:`${i+1}`;
    rowsHTML+=`<tr><td>${no}</td><td>${esc(name)}</td><td>${esc(desc)}</td><td class="rate"><b>${r!==null?r:""}</b></td></tr>`;
  });
  const bands=["4.5 – 5.0 = Outstanding","3.5 – 4.4 = Very Good","2.5 – 3.4 = Satisfactory","1.5 – 2.4 = Needs Improvement","1.0 – 1.4 = Poor"]
    .map(t=>{const on=cur&&t.indexOf(cur)>-1;return `<div${on?' class="hl"':(bold?' class="b"':'')}>${bold&&!on?'<b>'+t+'</b>':t}</div>`}).join("");
  const sign=!f.senior?`<p style="margin-top:14px"><b>Evaluator's Signature: _______________________</b></p>`:"";
  const dateEnd=!f.senior?`<p style="margin-top:2px"><b>Date: ${esc(dateStr||"_______________")}</b></p>`:"";
  const confStyle=f.senior?'font-style:italic;font-weight:normal':'font-weight:bold;font-style:italic';
  const scaleLine=bold?`<b>5 – Excellent | 4 – Very Good | 3 – Satisfactory | 2 – Needs Improvement | 1 – Poor</b>`:`5 – Excellent | 4 – Very Good | 3 – Satisfactory | 2 – Needs Improvement | 1 – Poor`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(f.title)}</title>
  <style>
    @page{size:8.5in 13in;margin:0.6in}
    *{box-sizing:border-box}
    body{font-family:Arial,Helvetica,sans-serif;color:#13202b;font-size:10pt;margin:0}
    .logo{display:block;margin:0 auto 8px;width:52px;height:52px}
    h1{color:#15ACE3;font-size:13pt;text-align:center;margin:0 0 4px}
    .conf{${confStyle};margin:0 0 12px}
    p{margin:2px 0}
    .scale{margin:10px 0 12px}
    table{border-collapse:collapse;width:100%;margin-bottom:12px;table-layout:fixed}
    th,td{border:1px solid #aab; padding:6px 7px;vertical-align:middle;font-size:10pt;text-align:center}
    th{background:#e2f4fc}
    th.rate,td.rate{white-space:nowrap}
    col.cNo{width:8%} col.cCrit{width:28%} col.cDesc{width:46%} col.cRate{width:18%}
    .hl{color:#0e7fab;font-weight:bold}
    ul.guide-list{margin:4px 0 12px 0;padding-left:20px}
    ul.guide-list li{margin:2px 0}
    .overall-comments{margin-top:2px}
    .comment-line{display:block;margin:0 0 4px 0;white-space:pre-wrap}
  </style></head><body>
    <img class="logo" src="data:image/png;base64,${LOGO_B64}" alt="logo">
    <h1>${esc(f.title)}</h1>
    <p class="conf">Confidential – For Internal Use Only</p>
    ${metaHTML}
    <div class="scale"><p><b>Rating Scale:</b></p><p>${scaleLine}</p></div>
    <table><colgroup><col class="cNo"><col class="cCrit"><col class="cDesc"><col class="cRate"></colgroup><thead><tr><th>No.</th><th>Criteria</th><th>Description</th><th class="rate">Rating (1–5)</th></tr></thead>
    <tbody>${rowsHTML}</tbody></table>
    <div class="guide">
      <p><b>Scoring Guide:</b></p>
      <ul class="guide-list">
        <li><b>Total Score: ${data.totalScore||0}</b></li>
        <li><b>Average Score: ${data.avgScore||0}</b></li>
      </ul>
      <p style="margin-top:8px"><b>Performance Interpretation:</b></p>
      ${bands}
      <p style="margin-top:10px"><b>Evaluator's Overall Comments:</b></p>
      <div class="overall-comments">${commentLines.length
        ? commentLines.map(line=>`<div class="comment-line">${esc(line)}</div>`).join("")
        : "&nbsp;"}</div>
      ${sign}
      ${dateEnd}
    </div>
  </body></html>`;
}
function openPrint(){
  // Remove any previous print frame so it only ever prints once
  const old=document.getElementById('__printFrame');
  if(old) old.remove();
  const frame=document.createElement('iframe');
  frame.id='__printFrame';
  frame.style.position='fixed';
  frame.style.right='0';
  frame.style.bottom='0';
  frame.style.width='0';
  frame.style.height='0';
  frame.style.border='0';
  frame.setAttribute('aria-hidden','true');
  document.body.appendChild(frame);
  let printed=false;
  const doPrint=()=>{
    if(printed) return; printed=true;
    try{
      const win=frame.contentWindow;
      win.focus();
      win.print();
    }catch(e){ console.error(e); document.getElementById('status').textContent="Couldn't open print. Try again."; }
    // clean up shortly after the dialog is dismissed
    setTimeout(()=>{ const f=document.getElementById('__printFrame'); if(f) f.remove(); }, 1500);
  };
  frame.onload=doPrint;
  const doc=frame.contentWindow.document;
  doc.open(); doc.write(formHTML()); doc.close();
  // fallback in case onload already fired before handler attached
  setTimeout(doPrint, 700);
}

// ---- Dependency-free .docx generation (Word XML zipped in-browser) ----
function xmlEsc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
const FONT="Calibri";
function run(text,{bold=false,italic=false,color=null,sz=22}={}){
  let rpr=`<w:rPr><w:rFonts w:ascii="${FONT}" w:hAnsi="${FONT}"/>`;
  if(bold)rpr+="<w:b/><w:bCs/>"; if(italic)rpr+="<w:i/><w:iCs/>";
  if(color)rpr+=`<w:color w:val="${color}"/>`;
  rpr+=`<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr>`;
  return `<w:r>${rpr}<w:t xml:space="preserve">${xmlEsc(text)}</w:t></w:r>`;
}
function para(runs,{align=null,after=160,before=0}={}){
  let ppr=`<w:pPr><w:spacing w:after="${after}"${before?` w:before="${before}"`:""} w:line="278" w:lineRule="auto"/>`;
  if(align)ppr+=`<w:jc w:val="${align}"/>`;
  ppr+="</w:pPr>";
  return `<w:p>${ppr}${runs.join("")}</w:p>`;
}
function bullet(runs,{after=160,before=0}={}){
  const ppr=`<w:pPr><w:spacing w:after="${after}"${before?` w:before="${before}"`:""} w:line="278" w:lineRule="auto"/><w:ind w:left="360" w:hanging="180"/></w:pPr>`;
  return `<w:p>${ppr}${run("\u2022  ",{bold:true})}${runs.join("")}</w:p>`;
}
function tcell(content,w,fill){
  const shd=fill?`<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>`:"";
  return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${shd}`+
    `<w:tcMar><w:top w:w="60" w:type="dxa"/><w:left w:w="100" w:type="dxa"/>`+
    `<w:bottom w:w="60" w:type="dxa"/><w:right w:w="100" w:type="dxa"/></w:tcMar>`+
    `<w:vAlign w:val="center"/></w:tcPr>${content}</w:tc>`;
}
function tcellPad(content,w,fill){
  const shd=fill?`<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>`:"";
  return `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${shd}`+
    `<w:tcMar><w:top w:w="60" w:type="dxa"/><w:left w:w="120" w:type="dxa"/>`+
    `<w:bottom w:w="60" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tcMar>`+
    `<w:vAlign w:val="center"/></w:tcPr>${content}</w:tc>`;
}
// in-cell paragraph: no space after, centered, 1.16 line spacing
function cpar(runs){ return `<w:p><w:pPr><w:spacing w:after="0" w:line="278" w:lineRule="auto"/><w:jc w:val="center"/></w:pPr>${runs.join("")}</w:p>`; }

function buildDocx(){
  const f=FORMS[role], data=currentData();
  const empName=document.getElementById('empName').value.trim();
  const manager=document.getElementById('manager').value.trim();
  const dateStr=document.getElementById('date').value;
  const comment=document.getElementById('comment').value.trim();
  const commentLines=comment ? comment.split(/\r?\n/).map(s=>s.trim()).filter(Boolean) : [];

  const COLS=[760,2900,3980,1660], TW=COLS.reduce((a,b)=>a+b,0);
  let tb=`<w:tbl><w:tblPr><w:tblW w:w="${TW}" w:type="dxa"/><w:tblBorders>`;
  ["top","left","bottom","right","insideH","insideV"].forEach(s=>{tb+=`<w:${s} w:val="single" w:sz="4" w:space="0" w:color="999999"/>`;});
  tb+=`</w:tblBorders><w:tblLayout w:type="fixed"/></w:tblPr><w:tblGrid>`;
  COLS.forEach(c=>tb+=`<w:gridCol w:w="${c}"/>`); tb+="</w:tblGrid>";
  tb+="<w:tr>"+
    tcellPad(cpar([run("No.",{bold:true})]),COLS[0],"EBF8FA")+
    tcellPad(cpar([run("Criteria",{bold:true})]),COLS[1],"EBF8FA")+
    tcellPad(cpar([run("Description",{bold:true})]),COLS[2],"EBF8FA")+
    tcellPad(cpar([run("Rating (1\u20135)",{bold:true})]),COLS[3],"EBF8FA")+
    "</w:tr>";
  f.rows.forEach(([name,desc],i)=>{
    const rating=data.rows[i];
    tb+="<w:tr>"+
      tcellPad(cpar([run(String(i+1),{bold:!f.senior})]),COLS[0])+
      tcellPad(cpar([run(name)]),COLS[1])+
      tcellPad(cpar([run(desc)]),COLS[2])+
      tcellPad(cpar([run(rating!==null?String(rating):"",{bold:true})]),COLS[3])+
      "</w:tr>";
  });
  tb+="</w:tbl>";

  const LOGO_EMU=46*9525; // 46px square
  const logoPara=`<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:after="40"/></w:pPr><w:r><w:drawing>`+
    `<wp:inline distT="0" distB="0" distL="0" distR="0">`+
    `<wp:extent cx="${LOGO_EMU}" cy="${LOGO_EMU}"/><wp:effectExtent l="0" t="0" r="0" b="0"/>`+
    `<wp:docPr id="1" name="Logo"/>`+
    `<wp:cNvGraphicFramePr><a:graphicFrameLocks xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" noChangeAspect="1"/></wp:cNvGraphicFramePr>`+
    `<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">`+
    `<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="1" name="Logo"/><pic:cNvPicPr/></pic:nvPicPr>`+
    `<pic:blipFill><a:blip r:embed="rId10"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>`+
    `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${LOGO_EMU}" cy="${LOGO_EMU}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>`+
    `</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
  let body=logoPara
  +para([run(f.title,{bold:true,sz:22,color:"15ACE3"})],{align:"center",after:20});
  body+=para([run("Confidential \u2013 For Internal Use Only",{bold:!f.senior,italic:true})],{after:160});
  if(f.senior){
    body+=para([run("Manager Name: ",{bold:true}),run(empName||"________________________")],{after:40});
    body+=para([run("Department: ",{bold:true}),run(manager||"__________________________")],{after:40});
    body+=para([run("Date: ",{bold:true}),run(dateStr||"_______________")],{after:140});
  }else{
    body+=para([run("Employee Name: "+(empName||"________________________"),{bold:true})],{after:40});
    body+=para([run("Position: "+f.position,{bold:true})],{after:40});
    body+=para([run("Evaluator (Manager): "+(manager||"_______________________"),{bold:true})],{after:40});
    body+=para([run("Date: "+(dateStr||"_______________"),{bold:true})],{after:140});
  }
  body+=para([run("Rating Scale:",{bold:true})],{after:20});
  body+=para([run("5 \u2013 Excellent | 4 \u2013 Very Good | 3 \u2013 Satisfactory | 2 \u2013 Needs Improvement | 1 \u2013 Poor",{bold:!f.senior})],{after:100});
  body+=tb;
  body+=para([run("Scoring Guide:",{bold:true})],{before:60,after:30});
  body+=bullet([run("Total Score: ",{bold:true}),run((data.totalScore||0)+"",{bold:true})],{after:30});
  body+=bullet([run("Average Score: ",{bold:true}),run(String(data.avgScore||0),{bold:true})],{after:100});
  body+=para([run("Performance Interpretation:",{bold:true})],{after:20});
  const cur=interpret(data.avgScore);
  ["4.5 \u2013 5.0 = Outstanding","3.5 \u2013 4.4 = Very Good","2.5 \u2013 3.4 = Satisfactory","1.5 \u2013 2.4 = Needs Improvement","1.0 \u2013 1.4 = Poor"].forEach(t=>{
    const isCur=cur&&t.indexOf(cur)>-1;
    body+=para([run(t,{bold:!f.senior||isCur,color:isCur?"0E7FAB":null})],{after:0});
  });
  body+=para([run("Evaluator's Overall Comments:",{bold:true})],{before:50,after:40});
  if(commentLines.length){
    commentLines.forEach((line,i)=>{
      body+=para([run(line)],{after:i===commentLines.length-1?120:30});
    });
  }else{
    body+=para([run("\u00a0")],{after:120});
  }
  if(!f.senior){
    body+=para([run("Evaluator's Signature: "+"_______________________",{bold:true})]);
    body+=para([run("Date: "+(dateStr||"_______________"),{bold:true})]);
  }

  const documentXml='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">'+
    '<w:body>'+body+
    '<w:sectPr><w:pgSz w:w="12240" w:h="18720" w:code="128"/>'+
    '<w:pgMar w:top="800" w:right="1080" w:bottom="650" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/>'+
    '</w:sectPr></w:body></w:document>';
  const contentTypes='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'+
    '<Default Extension="xml" ContentType="application/xml"/>'+
    '<Default Extension="png" ContentType="image/png"/>'+
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'+
    '</Types>';
  const relsXml='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>'+
    '</Relationships>';

  const docRelsXml='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'+
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+
    '<Relationship Id="rId10" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.png"/>'+
    '</Relationships>';

  const logoBytes=b64ToBytes(LOGO_B64);
  const blob=zipStore([
    {name:"[Content_Types].xml",data:contentTypes},
    {name:"_rels/.rels",data:relsXml},
    {name:"word/_rels/document.xml.rels",data:docRelsXml},
    {name:"word/media/logo.png",data:logoBytes},
    {name:"word/document.xml",data:documentXml}
  ]);
  const safe=(empName.replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"_"))||"Form";
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=`${safe}_Evaluation.docx`;
  document.body.appendChild(a); a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);
}

// ---- Minimal ZIP writer (stored, no compression) ----
function b64ToBytes(b64){
  const bin=atob(b64); const out=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i);
  return out;
}
const CRC_TABLE=(()=>{const t=new Uint32Array(256);for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c>>>0;}return t;})();
function crc32(bytes){let c=0xFFFFFFFF;for(let i=0;i<bytes.length;i++)c=CRC_TABLE[(c^bytes[i])&0xFF]^(c>>>8);return (c^0xFFFFFFFF)>>>0;}
function zipStore(files){
  const enc=new TextEncoder();
  const chunks=[], central=[]; let offset=0;
  const u16=v=>[v&0xFF,(v>>>8)&0xFF];
  const u32=v=>[v&0xFF,(v>>>8)&0xFF,(v>>>16)&0xFF,(v>>>24)&0xFF];
  files.forEach(f=>{
    const nameB=enc.encode(f.name);
    const dataB=(f.data instanceof Uint8Array)?f.data:enc.encode(f.data);
    const crc=crc32(dataB);
    const local=[].concat(u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),
      u32(crc),u32(dataB.length),u32(dataB.length),u16(nameB.length),u16(0));
    chunks.push(new Uint8Array(local),nameB,dataB);
    const localLen=local.length+nameB.length+dataB.length;
    const cen=[].concat(u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),
      u32(crc),u32(dataB.length),u32(dataB.length),u16(nameB.length),u16(0),u16(0),u16(0),u16(0),
      u32(0),u32(offset));
    central.push(new Uint8Array(cen),nameB);
    offset+=localLen;
  });
  let cenSize=0; central.forEach(c=>cenSize+=c.length);
  const end=[].concat(u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),
    u32(cenSize),u32(offset),u16(0));
  const parts=[...chunks,...central,new Uint8Array(end)];
  return new Blob(parts,{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"});
}

// ---- Dependency-free PDF generation (vector text + table + embedded logo) ----
const HELV={' ':278,'!':278,'"':355,'#':556,'$':556,'%':889,'&':667,"'":191,'(':333,')':333,'*':389,'+':584,',':278,'-':333,'.':278,'/':278,'0':556,'1':556,'2':556,'3':556,'4':556,'5':556,'6':556,'7':556,'8':556,'9':556,':':278,';':278,'<':584,'=':584,'>':584,'?':556,'@':1015,'A':667,'B':667,'C':722,'D':722,'E':667,'F':611,'G':778,'H':722,'I':278,'J':500,'K':667,'L':556,'M':833,'N':722,'O':778,'P':667,'Q':778,'R':722,'S':667,'T':611,'U':722,'V':667,'W':944,'X':667,'Y':667,'Z':611,'[':278,'\\':278,']':278,'^':469,'_':556,'`':333,'a':556,'b':556,'c':500,'d':556,'e':556,'f':278,'g':556,'h':556,'i':222,'j':222,'k':500,'l':222,'m':833,'n':556,'o':556,'p':556,'q':556,'r':333,'s':500,'t':278,'u':556,'v':500,'w':722,'x':500,'y':500,'z':500,'{':334,'|':260,'}':334,'~':584};
const HELVB={' ':278,'!':333,'"':474,'#':556,'$':556,'%':889,'&':722,"'":238,'(':333,')':333,'*':389,'+':584,',':278,'-':333,'.':278,'/':278,'0':556,'1':556,'2':556,'3':556,'4':556,'5':556,'6':556,'7':556,'8':556,'9':556,':':333,';':333,'<':584,'=':584,'>':584,'?':611,'@':975,'A':722,'B':722,'C':722,'D':722,'E':667,'F':611,'G':778,'H':722,'I':278,'J':556,'K':722,'L':611,'M':833,'N':722,'O':778,'P':667,'Q':778,'R':722,'S':667,'T':611,'U':722,'V':667,'W':944,'X':667,'Y':667,'Z':611,'[':333,'\\':278,']':333,'^':584,'_':556,'`':333,'a':556,'b':611,'c':556,'d':611,'e':556,'f':333,'g':611,'h':611,'i':278,'j':278,'k':556,'l':278,'m':889,'n':611,'o':611,'p':611,'q':611,'r':389,'s':556,'t':333,'u':611,'v':556,'w':778,'x':556,'y':556,'z':500,'{':389,'|':280,'}':389,'~':584};
function twF(s,size,bold){const T=bold?HELVB:HELV;let w=0;for(const ch of String(s))w+=(T[ch]||556);return w*size/1000;}
function wrapF(text,size,maxW,bold){const words=String(text).split(/\s+/);const lines=[];let cur='';for(const word of words){const test=cur?cur+' '+word:word;if(twF(test,size,bold)>maxW&&cur){lines.push(cur);cur=word;}else cur=test;}if(cur)lines.push(cur);return lines.length?lines:[''];}
function pdfEsc(s){return String(s).replace(/[\u2013\u2014]/g,"-").replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)').replace(/[^\x20-\x7E]/g,'');}

function buildPDF(){
  const f=FORMS[role], data=currentData();
  const empName=document.getElementById('empName').value.trim();
  const manager=document.getElementById('manager').value.trim();
  const dateStr=document.getElementById('date').value;
  const comment=document.getElementById('comment').value.trim();
  const commentLines=comment ? comment.split(/\r?\n/).map(s=>s.trim()).filter(Boolean) : [];
  const cur=interpret(data.avgScore);

  const W=612,H=936,M=54;
  const blue="0.082 0.675 0.890", black="0 0 0", deep="0.055 0.498 0.671";
  const ops=[];
  const T=(x,y,s,size,bold,color)=>ops.push(`BT /${bold?'FB':'F1'} ${size} Tf ${color||black} rg 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${pdfEsc(s)}) Tj ET`);
  const L=(x1,y1,x2,y2)=>ops.push(`0.6 0.78 0.86 RG 0.8 w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
  const RF=(x,y,w,h,c)=>ops.push(`${c} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
  // label+value helper with proper spacing
  const KV=(x,y,k,v)=>{ T(x,y,k,10,true); T(x+twF(k,10,true)+3,y,v,10,false); };
  // fully-bold "key value" (matches Prob/Junior where whole meta line is bold)
  const KVB=(x,y,k,v)=>{ T(x,y,k,10,true); T(x+twF(k,10,true)+3,y,v,10,true); };
  const BUL=(x,y,k,v)=>{ T(x,y,"\u2022",10,true); T(x+12,y,k,10,true); T(x+12+twF(k,10,true)+3,y,v,10,true); };

  let y=H-M;
  const LS=46;
  ops.push(`q ${LS} 0 0 ${LS} ${((W-LS)/2).toFixed(2)} ${(y-LS).toFixed(2)} cm /Im1 Do Q`);
  y-=LS+16;
  const title=f.title, ts=11;
  T((W-twF(title,ts,true))/2,y,title,ts,true,blue); y-=18;
  T(M,y,"Confidential - For Internal Use Only",10,true); y-=18;
  if(f.senior){
    KV(M,y,"Manager Name:",empName||"________________________"); y-=15;
    KV(M,y,"Department:",manager||"__________________________"); y-=15;
    KV(M,y,"Date:",dateStr||"_______________"); y-=15;
  }else{
    KVB(M,y,"Employee Name:",empName||"________________________"); y-=15;
    KVB(M,y,"Position:",f.position); y-=15;
    KVB(M,y,"Evaluator (Manager):",manager||"_______________________"); y-=15;
    KVB(M,y,"Date:",dateStr||"_______________"); y-=15;
  }
  y-=4;
  T(M,y,"Rating Scale:",10,true); y-=13;
  T(M,y,"5 - Excellent | 4 - Very Good | 3 - Satisfactory | 2 - Needs Improvement | 1 - Poor",10,!f.senior); y-=18;

  // centered-text helper
  const TC=(cx,cw,yy,s,size,bold,color)=>T(cx+cw/2-twF(s,size,bold)/2,yy,s,size,bold,color);
  const cols=[44,150,238,82], x0=M, tableW=cols.reduce((a,b)=>a+b,0);
  const colX=[x0]; for(let i=0;i<cols.length;i++) colX.push(colX[i]+cols[i]);
  const hh=22, tts=10;
  RF(x0,y-hh+5,tableW,hh,"0.886 0.957 0.988");
  TC(colX[0],cols[0],y-11,"No.",tts,true);
  TC(colX[1],cols[1],y-11,"Criteria",tts,true);
  TC(colX[2],cols[2],y-11,"Description",tts,true);
  TC(colX[3],cols[3],y-11,"Rating (1-5)",tts,true);
  const ytop=y+5; y-=hh;
  const pad=7,lh=12;
  f.rows.forEach(([name,desc],i)=>{
    const r=data.rows[i];
    const nameLines=wrapF(name,tts,cols[1]-2*5,false);
    const descLines=wrapF(desc,tts,cols[2]-2*5,false);
    const n=Math.max(nameLines.length,descLines.length,1);
    const rh=n*lh+2*pad;
    const noBold=!f.senior;
    TC(colX[0],cols[0], y-rh/2-tts/2+2, String(i+1), tts, noBold);
    const nameStart=y - (rh-(nameLines.length*lh))/2 - tts + 2;
    nameLines.forEach((ln,j)=>TC(colX[1],cols[1], nameStart-j*lh, ln, tts, false));
    const descStart=y - (rh-(descLines.length*lh))/2 - tts + 2;
    descLines.forEach((ln,j)=>TC(colX[2],cols[2], descStart-j*lh, ln, tts, false));
    const rate=r!==null?String(r):"";
    TC(colX[3],cols[3], y-rh/2-tts/2+2, rate, tts, true);
    y-=rh; L(x0,y,x0+tableW,y);
  });
  const ybot=y;
  colX.forEach(cx=>L(cx,ytop,cx,ybot));
  L(x0,ytop,x0+tableW,ytop); L(x0,ytop-hh,x0+tableW,ytop-hh);
  y-=16;
  T(M,y,"Scoring Guide:",10,true); y-=15;
  BUL(M,y,"Total Score:",(data.totalScore||0)+""); y-=14;
  BUL(M,y,"Average Score:",String(data.avgScore||0)); y-=18;
  T(M,y,"Performance Interpretation:",10,true); y-=13;
  ["4.5 - 5.0 = Outstanding","3.5 - 4.4 = Very Good","2.5 - 3.4 = Satisfactory","1.5 - 2.4 = Needs Improvement","1.0 - 1.4 = Poor"].forEach(t=>{
    const on=cur&&t.indexOf(cur)>-1;
    T(M,y,t,10,!f.senior||on,on?deep:black); y-=12;
  });
  y-=8;
  T(M,y,"Evaluator's Overall Comments:",10,true); y-=14;
  if(commentLines.length){
    commentLines.forEach((raw,idx)=>{
      wrapF(raw,10,tableW,false).forEach(ln=>{ T(M,y,ln,10,false); y-=13; });
      if(idx < commentLines.length-1) y-=2;
    });
  }else{
    T(M,y," ",10,false); y-=13;
  }
  if(!f.senior){
    y-=6;
    KVB(M,y,"Evaluator's Signature:","_______________________"); y-=13;
    KVB(M,y,"Date:",dateStr||"_______________"); y-=13;
  }

  // assemble PDF bytes
  const content=ops.join("\n");
  const enc=new TextEncoder();
  const jpg=b64ToBytes(LOGO_JPG_B64);
  const parts=[]; let pdfLen=0;
  const push=(buf)=>{ parts.push(buf); pdfLen+=buf.length; };
  const pushStr=(s)=>push(enc.encode(s));
  const offsets=[];
  pushStr("%PDF-1.4\n");
  const obj=(num,headStr,binBuf,tailStr)=>{
    offsets[num]=pdfLen;
    pushStr(`${num} 0 obj\n`);
    pushStr(headStr);
    if(binBuf) push(binBuf);
    if(tailStr) pushStr(tailStr);
    pushStr("\nendobj\n");
  };
  obj(1,"<< /Type /Catalog /Pages 2 0 R >>");
  obj(2,"<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  obj(3,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 5 0 R /FB 6 0 R >> /XObject << /Im1 7 0 R >> >> /Contents 4 0 R >>`);
  obj(4,`<< /Length ${enc.encode(content).length} >>\nstream\n${content}\nendstream`);
  obj(5,"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  obj(6,"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  obj(7,`<< /Type /XObject /Subtype /Image /Width 140 /Height 140 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpg.length} >>\nstream\n`,jpg,"\nendstream");
  const xrefStart=pdfLen;
  let xref=`xref\n0 8\n0000000000 65535 f \n`;
  for(let i=1;i<=7;i++) xref+=String(offsets[i]).padStart(10,'0')+" 00000 n \n";
  pushStr(xref);
  pushStr(`trailer\n<< /Size 8 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`);

  const blob=new Blob(parts,{type:"application/pdf"});
  const safe=(empName.replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"_"))||"Form";
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download=`${safe}_Evaluation.pdf`;
  document.body.appendChild(a); a.click();
  setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},1500);
}

function toProperCase(s){
  return s.toLowerCase()
    .replace(/\s+/g,' ').trim()
    .replace(/\b([a-z])/g, (m,c)=>c.toUpperCase())
    // keep common name particles lowercase (de, dela, van, etc.) unless first word
    .replace(/\b(De|Dela|Del|Della|Van|Von|Da|Di|La|Le)\b/g, (m,p,off)=> off===0? m : p.toLowerCase())
    // fix Mc/Mac and apostrophes/hyphens: O'brien -> O'Brien, mary-jane -> Mary-Jane
    .replace(/([A-Za-z])([''-])([a-z])/g,(m,a,sep,b)=>a+sep+b.toUpperCase());
}
const empNameEl=document.getElementById('empName');
empNameEl.addEventListener('input',e=>{ if(e.target.value.trim()) e.target.classList.remove('bad'); if(!applyRoleFromName()) buildHead(); });
empNameEl.addEventListener('blur',e=>{ const v=e.target.value.trim(); if(v) e.target.value=toProperCase(v); });
empNameEl.addEventListener('keydown',e=>{
  if(e.key==="Enter"){
    e.preventDefault();
    const v=e.target.value.trim();
    if(v) e.target.value=toProperCase(v);
    focusCell(0,0); // jump to the first score box
  }
});

// remember edits to the Manager/Department field per role type
document.getElementById('manager').addEventListener('input',e=>{
  // Read-only on every form except Senior (Department), so this only ever
  // fires for a genuine department edit.
  if(FORMS[role].senior){ managerSaved.senior=e.target.value; buildHead(); }
});

// ---- Employee name autocomplete (predictive suggestions) ----

const acNorm=s=>s.toLowerCase().replace(/[^a-z\s-]/g,"").trim();
function acSuggest(q){
  q=acNorm(q); if(!q) return [];
  return EMPLOYEES.map(name=>{
    const parts=acNorm(name).split(/[\s-]+/);
    const initials=parts.map(p=>p[0]).join("");
    let s=-1;
    if(parts[0].startsWith(q)) s=0;                 // "mark" -> Mark Ian
    else if(parts.some(p=>p.startsWith(q))) s=1;    // "ian"  -> Mark Ian
    else if(initials.startsWith(q)) s=2;            // "jl"   -> John Louis
    else if(acNorm(name).includes(q)) s=3;          // fallback substring
    return {name,s};
  }).filter(r=>r.s>=0).sort((a,b)=>a.s-b.s||a.name.localeCompare(b.name))
    .slice(0,5).map(r=>r.name);
}
(function initAutocomplete(){
  const inp=document.getElementById('empName');
  const wrap=inp.closest('.field');
  wrap.style.position='relative';

  const box=document.createElement('div');
  box.className='ac-box';
  wrap.appendChild(box);

  let items=[], idx=-1;
  const open=()=>box.classList.add('open');
  const close=()=>{ box.classList.remove('open'); idx=-1; };
  const isOpen=()=>box.classList.contains('open');

  function paint(){
    box.innerHTML='';
    items.forEach((n,i)=>{
      const d=document.createElement('div');
      d.className='ac-item'+(i===idx?' sel':'');
      d.textContent=n;
      d.addEventListener('mousedown',ev=>{ ev.preventDefault(); pick(n); });
      box.appendChild(d);
    });
    items.length?open():close();
  }
  function pick(name){ inp.value=name; inp.classList.remove('bad'); close(); inp.focus(); if(!applyRoleFromName()) buildHead(); }
  function move(step){
    if(!items.length) return;
    idx=(idx+step+items.length)%items.length;
    [...box.children].forEach((c,i)=>c.classList.toggle('sel',i===idx));
  }

  inp.addEventListener('input',()=>{ items=acSuggest(inp.value); idx=-1; paint(); });
  inp.addEventListener('focus',()=>{ if(inp.value.trim()){ items=acSuggest(inp.value); idx=-1; paint(); } });
  inp.addEventListener('blur',()=>setTimeout(close,120));

  // capture phase: runs BEFORE the Enter -> first-score-box handler above
  inp.addEventListener('keydown',e=>{
    if(!isOpen()) return;
    if(e.key==='ArrowDown'){ e.preventDefault(); e.stopPropagation(); move(1); }
    else if(e.key==='ArrowUp'){ e.preventDefault(); e.stopPropagation(); move(-1); }
    else if(e.key==='Escape'){ e.stopPropagation(); close(); }
    else if(e.key==='Enter'||e.key==='Tab'){
      if(idx>=0){ e.preventDefault(); e.stopPropagation(); pick(items[idx]); }
      else close();
    }
  },true);
})();

const d=new Date();
document.getElementById('date').value=d.toLocaleDateString(undefined,{year:'numeric',month:'long',day:'numeric'});
render();

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const SUPABASE_URL="https://giosjwjhalhmwcuyzfos.supabase.co", SUPABASE_KEY="sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_";
const db=createClient(SUPABASE_URL,SUPABASE_KEY), el=id=>document.getElementById(id); let timer=null;
const initials=(n='')=>{const p=n.trim().split(/\s+/).filter(Boolean);return((p[0]?.[0]||'')+(p.length>1?p[p.length-1][0]:'')).toUpperCase()||'—'};
const mean=v=>{const a=v.map(Number).filter(Number.isFinite);return a.length?a.reduce((x,y)=>x+y,0)/a.length:null};
const score=v=>Number.isFinite(v)?v.toFixed(2):'—';
const dt=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?null:d};
const short=v=>{const d=dt(v);return d?d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}):'—'};
const timed=v=>{const d=dt(v);return d?d.toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}):''};
function closeDrawer(){el('drawer')?.classList.remove('open');el('scrim')?.classList.remove('open');el('drawer')?.setAttribute('aria-hidden','true');el('burger')?.setAttribute('aria-expanded','false')}
let viewSwitching=false;
const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function applyViewState(mode){
  const dashboard=el('dashboardView');
  const form=el('formView');
  const onDashboard=mode==='dashboard';

  dashboard?.classList.toggle('hide',!onDashboard);
  form?.classList.toggle('hide',onDashboard);
  el('layoutChooser')?.classList.toggle('hide',onDashboard);
  el('drawerDashboard')?.classList.toggle('on',onDashboard);
  el('drawerEvaluation')?.classList.toggle('on',!onDashboard);

  if(el('pageTitle')) el('pageTitle').textContent=onDashboard?'Performance Dashboard':'Performance Evaluation';
  if(el('layNow')) el('layNow').textContent='';
  if(el('headerActionBtn')) el('headerActionBtn').textContent=onDashboard?'Start Evaluation':'Dashboard';
}

async function playViewSwitch(mode){
  const dashboard=el('dashboardView');
  const form=el('formView');
  const target=mode==='dashboard'?dashboard:form;
  const current=mode==='dashboard'?form:dashboard;

  if(!target || viewSwitching) return;

  // If already on the requested view, only synchronize UI state.
  if(!target.classList.contains('hide')){
    applyViewState(mode);
    if(mode==='dashboard') schedule(0);
    return;
  }

  viewSwitching=true;
  document.body.classList.add('dash-view-switching');

  const header=el('pageTitle')?.closest('header.top');
  const direction=mode==='form'?1:-1;

  try{
    if(!reduceMotion && current && !current.classList.contains('hide')){
      const leave=current.animate(
        [
          {opacity:1,transform:'translateY(0) scale(1)',filter:'blur(0)'},
          {opacity:0,transform:`translateY(${-10*direction}px) scale(.992)`,filter:'blur(2px)'}
        ],
        {
          duration:180,
          easing:'cubic-bezier(.4,0,1,1)',
          fill:'forwards'
        }
      );

      const headLeave=header?.animate(
        [
          {transform:'translateY(0)',filter:'brightness(1)',opacity:1},
          {transform:`translateY(${-3*direction}px)`,filter:'brightness(.96)',opacity:.9}
        ],
        {
          duration:150,
          easing:'ease-out',
          fill:'forwards'
        }
      );

      await Promise.allSettled([leave.finished,headLeave?.finished]);
      current.getAnimations().forEach(a=>a.cancel());
      header?.getAnimations().forEach(a=>a.cancel());
    }

    current?.classList.add('hide');
    applyViewState(mode);

    // Put the newly selected view at the top without a second scroll animation.
    window.scrollTo({top:0,left:0,behavior:'auto'});

    if(!reduceMotion){
      const enter=target.animate(
        [
          {opacity:0,transform:`translateY(${14*direction}px) scale(.988)`,filter:'blur(3px)'},
          {opacity:1,transform:'translateY(0) scale(1)',filter:'blur(0)'}
        ],
        {
          duration:330,
          easing:'cubic-bezier(.16,1,.3,1)',
          fill:'both'
        }
      );

      const headEnter=header?.animate(
        [
          {transform:`translateY(${4*direction}px) scale(.998)`,opacity:.9},
          {transform:'translateY(0) scale(1)',opacity:1}
        ],
        {
          duration:280,
          easing:'cubic-bezier(.16,1,.3,1)',
          fill:'both'
        }
      );

      await Promise.allSettled([enter.finished,headEnter?.finished]);
      target.getAnimations().forEach(a=>a.cancel());
      header?.getAnimations().forEach(a=>a.cancel());
    }

    if(mode==='dashboard') schedule(0);
  }finally{
    document.body.classList.remove('dash-view-switching');
    viewSwitching=false;
  }
}

function openDashboard(){return playViewSwitch('dashboard')}
function openForm(){return playViewSwitch('form')}

el('headerActionBtn')?.addEventListener('click',()=>{
  el('formView')?.classList.contains('hide')?openForm():openDashboard();
});
el('backToDashboard')?.addEventListener('click',openDashboard);
el('drawerDashboard')?.addEventListener('click',()=>{closeDrawer();openDashboard()});
el('drawerEvaluation')?.addEventListener('click',()=>{closeDrawer();openForm()});

/*
  When a reviewer opens a person directly from Evaluation Results or History
  while the dashboard is visible, Supabase loads that record into #formView.
  Switch to the form view first so the loaded record is immediately visible.
  Capture phase runs before the existing Results / History click handlers.
*/
el('resList')?.addEventListener('click', e => {
  if(!e.target.closest('.res-row')) return;
  if(!el('dashboardView')?.classList.contains('hide')) openForm();
}, true);

el('hisList')?.addEventListener('click', e => {
  if(!e.target.closest('.his-main')) return;
  if(!el('dashboardView')?.classList.contains('hide')) openForm();
}, true);

function rounds(rows){const g=new Map();rows.filter(r=>r.archived&&r.archived_at).forEach(r=>{const k=`${r.employee_id}|${r.archived_at}`;if(!g.has(k))g.set(k,[]);g.get(k).push(r)});return[...g.entries()].map(([k,rs])=>{const i=k.indexOf('|');return{employee_id:k.slice(0,i),archived_at:k.slice(i+1),average:mean(rs.map(r=>r.average))}}).filter(r=>Number.isFinite(r.average))}
function latest(rs){const m=new Map();rs.forEach(r=>{const p=m.get(r.employee_id);if(!p||new Date(r.archived_at)>new Date(p.archived_at))m.set(r.employee_id,r)});return[...m.values()]}
function overall(rs){const m=new Map();rs.forEach(r=>{if(!m.has(r.employee_id))m.set(r.employee_id,[]);m.get(r.employee_id).push(r.average)});return[...m.entries()].map(([employee_id,v])=>({employee_id,average:mean(v)})).filter(r=>Number.isFinite(r.average))}
function rank(id,rows,names){const h=el(id);if(!h)return;h.innerHTML='';if(!rows.length){h.innerHTML='<div class="dash-empty">No finalized evaluation results yet.</div>';return}rows.slice(0,7).forEach((r,i)=>{const n=names.get(r.employee_id)||'Unknown',d=document.createElement('div');d.className='dash-rank-row';d.innerHTML=`<span class="dash-rank-no">${i+1}</span><div class="dash-rank-person"><span class="dash-rank-avatar">${initials(n)}</span><span class="dash-rank-name"></span></div><div class="dash-rank-bar"><span style="width:${Math.max(0,Math.min(100,r.average/5*100))}%"></span></div><span class="dash-rank-score">${score(r.average)}</span>`;d.querySelector('.dash-rank-name').textContent=n;h.appendChild(d)})}
function chart(rs){const s=el('trendChart'),e=el('trendEmpty');if(!s||!e)return;s.innerHTML='';const m=new Map();rs.forEach(r=>{const d=dt(r.archived_at);if(!d)return;const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;if(!m.has(k))m.set(k,[]);m.get(k).push(r.average)});const p=[...m.entries()].sort((a,b)=>a[0].localeCompare(b[0])).slice(-6).map(([key,v])=>({key,value:mean(v)}));if(!p.length){e.classList.remove('hide');return}e.classList.add('hide');const W=700,H=250,L=38,R=18,T=26,B=38,x=i=>p.length===1?L+(W-L-R)/2:L+i*((W-L-R)/(p.length-1)),y=v=>T+(5-v)/4*(H-T-B);s.innerHTML='<defs><linearGradient id="dashChartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#15ACE3" stop-opacity=".26"/><stop offset="100%" stop-color="#15ACE3" stop-opacity=".02"/></linearGradient></defs>';[1,2,3,4,5].forEach(v=>{const yy=y(v);s.insertAdjacentHTML('beforeend',`<line class="dash-chart-grid" x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}"/><text class="dash-chart-text" x="8" y="${yy+3}">${v}</text>`)});const c=p.map((q,i)=>[x(i),y(q.value)]),line=c.map((q,i)=>`${i?'L':'M'} ${q[0]} ${q[1]}`).join(' '),area=`M ${c[0][0]} ${H-B} `+c.map(q=>`L ${q[0]} ${q[1]}`).join(' ')+` L ${c.at(-1)[0]} ${H-B} Z`;s.insertAdjacentHTML('beforeend',`<path class="dash-chart-area" d="${area}"/><path class="dash-chart-line" d="${line}"/>`);p.forEach((q,i)=>{const [xx,yy]=c[i],[yr,mo]=q.key.split('-'),lab=new Date(+yr,+mo-1,1).toLocaleDateString(undefined,{month:'short',year:'2-digit'});s.insertAdjacentHTML('beforeend',`<circle class="dash-chart-dot" cx="${xx}" cy="${yy}" r="5"/><text class="dash-chart-value" x="${xx}" y="${yy-11}" text-anchor="middle">${q.value.toFixed(2)}</text><text class="dash-chart-text" x="${xx}" y="${H-13}" text-anchor="middle">${lab}</text>`)})}
function activity(rows,names){
  const h=el('recentActivity');
  if(!h)return;
  h.innerHTML='';

  const CURRENT_CRITERIA_TOTAL=10;

  const countScores=s=>{
    if(!s || typeof s!=='object') return 0;
    return Object.values(s).filter(v=>v!==null&&v!==''&&Number.isFinite(Number(v))).length;
  };

  const items=rows
    .filter(r=>!r.archived)
    .map(r=>{
      const filled=countScores(r.scores);
      const total=CURRENT_CRITERIA_TOTAL;
      const pct=Math.max(0,Math.min(100,total?filled/total*100:0));
      const hasComment=!!String(r.comments||'').trim();
      return{
        ...r,
        filled,
        total,
        pct,
        hasComment,
        when:r.updated_at||r.created_at
      };
    })
    .filter(r=>r.when)
    .sort((a,b)=>new Date(b.when)-new Date(a.when))
    .slice(0,8);

  if(!items.length){
    h.innerHTML='<div class="dash-empty">No current evaluation activity yet.</div>';
    return;
  }

  items.forEach(r=>{
    const evaluator=names.get(r.evaluator_id)||'Unknown evaluator';
    const employee=names.get(r.employee_id)||'Unknown employee';
    const submitted=!!r.locked;
    const status=submitted?'Submitted':'Saved draft';

    const row=document.createElement('div');
    row.className='dash-live-eval-row';
    row.innerHTML=`
      <div class="dash-live-eval-head">
        <div class="dash-live-eval-people">
          <span class="dash-live-avatar">${initials(evaluator)}</span>
          <div class="dash-live-names">
            <b class="dash-live-evaluator"></b>
            <span>evaluating <strong class="dash-live-employee"></strong></span>
          </div>
        </div>
        <span class="dash-live-status ${submitted?'submitted':'draft'}">${status}</span>
      </div>

      <div class="dash-live-progress-line">
        <span>${r.filled} of ${r.total} scored</span>
        <strong>${Math.round(r.pct)}%</strong>
      </div>
      <div class="dash-live-progress">
        <span style="width:${r.pct}%"></span>
      </div>

      <div class="dash-live-meta">
        <span class="dash-live-comment ${r.hasComment?'has-comment':'no-comment'}">
          ${r.hasComment?'Commented':'No comment'}
        </span>
        <span>${timed(r.when)}</span>
      </div>`;

    row.querySelector('.dash-live-evaluator').textContent=evaluator;
    row.querySelector('.dash-live-employee').textContent=employee;
    h.appendChild(row);
  });
}
async function load(){const{data:{session}}=await db.auth.getSession();if(!session)return;const uid=session.user.id,[a,b,c]=await Promise.all([db.from('profiles').select('id,full_name,position,role,form_role').eq('id',uid).maybeSingle(),db.from('profiles').select('id,full_name,position,role,form_role').order('full_name'),db.from('evaluations').select('employee_id,evaluator_id,scores,average,comments,form_role,locked,archived,archived_at,created_at,updated_at')]);const me=a.data,people=b.data||[],rows=c.data||[],names=new Map(people.map(p=>[p.id,p.full_name||'Unknown'])),full=me?.role==='manager'||me?.form_role==='Senior Staff'||me?.form_role==='Junior Staff',my=me?.full_name||session.user.email||'Signed in';if(el('dashGreeting'))el('dashGreeting').textContent=`Welcome, ${my}`;if(el('dashDateChip'))el('dashDateChip').textContent=new Date().toLocaleDateString(undefined,{weekday:'short',month:'long',day:'numeric',year:'numeric'});const note=el('dashAccessNote');if(note){if(b.error||c.error){note.textContent='Some dashboard data could not be loaded with this account.';note.classList.remove('hide')}else if(!full){note.textContent='Team rankings are available to Junior Staff, Senior Staff, and Manager reviewers. You can still use the dashboard to open your evaluation form.';note.classList.remove('hide')}else note.classList.add('hide')}
if(full){const rs=rounds(rows),l=latest(rs).sort((x,y)=>y.average-x.average),o=overall(rs).sort((x,y)=>y.average-x.average),lt=l[0],ot=o[0];el('latestTopName').textContent=lt?names.get(lt.employee_id)||'Unknown':'—';el('latestTopScore').textContent=lt?score(lt.average):'—';el('latestTopMeta').textContent=lt?`Finalized ${short(lt.archived_at)}`:'No finalized evaluation yet';el('overallTopName').textContent=ot?names.get(ot.employee_id)||'Unknown':'—';el('overallTopScore').textContent=ot?score(ot.average):'—';el('teamAverage').textContent=score(mean(o.map(r=>r.average)));el('latestRankingDate').textContent=lt?short(lt.archived_at):'Latest';rank('latestRanking',l,names);rank('overallRanking',o,names);chart(rs);activity(rows,names)}else{el('latestTopName').textContent='Restricted';el('overallTopName').textContent='Restricted';['latestTopScore','overallTopScore','teamAverage'].forEach(id=>el(id).textContent='—');el('latestTopMeta').textContent='Reviewer access required';el('latestRanking').innerHTML='<div class="dash-empty">Reviewer access required for team rankings.</div>';el('overallRanking').innerHTML='<div class="dash-empty">Reviewer access required for team rankings.</div>';el('recentActivity').innerHTML='<div class="dash-empty">Reviewer access required for team activity.</div>';el('trendChart').innerHTML='';el('trendEmpty').classList.remove('hide')}
const expected=Math.max(people.length*(people.length-1),0),done=new Set(rows.filter(r=>!r.archived&&r.locked).map(r=>`${r.employee_id}|${r.evaluator_id}`)).size,pct=expected?Math.min(100,done/expected*100):0;el('completionText').textContent=`${done} / ${expected}`;el('completionPercent').textContent=`${Math.round(pct)}%`;el('completionBar').style.width=`${pct}%`}
function schedule(ms=120){
  clearTimeout(timer);
  timer=setTimeout(load,ms);
}

/*
  Reuse the authenticated Realtime listener already owned by js/supabase.js.

  supabase.js calls window.__refreshResults() for every INSERT / UPDATE / DELETE
  on public.evaluations. Wrapping that function lets the dashboard refresh from
  the same authenticated event instead of opening a second Realtime channel.
*/
let realtimeHooked=false;
function hookAuthenticatedRealtime(){
  const current=window.__refreshResults;
  if(typeof current!=='function') return false;

  // If supabase.js has already been wrapped by us, do not wrap it again.
  if(current.__dashboardRealtimeHook){
    realtimeHooked=true;
    return true;
  }

  const wrapped=function(...args){
    let result;
    try{
      result=current.apply(this,args);
    }finally{
      // Small debounce so autosave bursts collapse into a single dashboard read.
      schedule(80);
    }
    return result;
  };

  wrapped.__dashboardRealtimeHook=true;
  wrapped.__dashboardRealtimeOriginal=current;
  window.__refreshResults=wrapped;
  realtimeHooked=true;
  return true;
}

// supabase.js uses top-level await during session/profile setup, so dashboard.js
// may start before __refreshResults exists. Keep checking briefly until it does.
const realtimeHookTimer=setInterval(()=>{
  if(hookAuthenticatedRealtime()) clearInterval(realtimeHookTimer);
},100);

setTimeout(()=>{
  if(!realtimeHooked) hookAuthenticatedRealtime();
  clearInterval(realtimeHookTimer);
},8000);

// If the browser was backgrounded or temporarily offline, refresh immediately
// when the user returns so the dashboard never stays visually stale.
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible') schedule(0);
});
window.addEventListener('focus',()=>schedule(0));
window.addEventListener('online',()=>schedule(0));

const ready=setInterval(()=>{
  if(el('wrap')&&!el('wrap').classList.contains('hide')){
    clearInterval(ready);
    hookAuthenticatedRealtime();
    openDashboard();
    load();
  }
},80);

setTimeout(()=>{
  clearInterval(ready);
  if(el('wrap')&&!el('wrap').classList.contains('hide')){
    hookAuthenticatedRealtime();
    openDashboard();
    load();
  }
},5000);

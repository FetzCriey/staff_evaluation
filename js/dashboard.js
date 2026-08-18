import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://giosjwjhalhmwcuyzfos.supabase.co";
const SUPABASE_KEY = "sb_publishable_9guZ2oKWHmKyFx3WyvHYww_cTYlQsX_";
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

const $ = id => document.getElementById(id);
const dashboard = $('dashboardView');
const evaluation = $('evaluationView');
let refreshTimer = null;

function initials(name=''){
  const p = name.trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0]||'') + (p.length>1 ? p[p.length-1][0] : '')).toUpperCase() || '—';
}
function avg(nums){
  const a = nums.map(Number).filter(Number.isFinite);
  return a.length ? a.reduce((x,y)=>x+y,0)/a.length : null;
}
function scoreText(v){ return Number.isFinite(v) ? v.toFixed(2) : '—'; }
function safeDate(v){ const d = new Date(v); return Number.isNaN(d.getTime()) ? null : d; }
function fmtDate(v){ const d=safeDate(v); return d ? d.toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'}) : '—'; }
function fmtTime(v){ const d=safeDate(v); return d ? d.toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}) : ''; }

function showDashboard(){
  document.body.classList.add('dash-mode');
  document.body.classList.remove('evaluation-mode');
  dashboard.style.display='';
  evaluation.style.display='';
  window.scrollTo({top:0,behavior:'smooth'});
  scheduleRefresh(0);
}
function showEvaluation(){
  document.body.classList.add('evaluation-mode');
  document.body.classList.remove('dash-mode');
  window.scrollTo({top:0,behavior:'smooth'});
}

$('startEvaluationBtn')?.addEventListener('click', showEvaluation);
$('navEvaluationBtn')?.addEventListener('click', showEvaluation);
$('returnDashboardBtn')?.addEventListener('click', showDashboard);
$('navResultsBtn')?.addEventListener('click', () => { showEvaluation(); setTimeout(()=>{ $('burger')?.click(); $('sumResults')?.click(); },80); });
$('navHistoryBtn')?.addEventListener('click', () => { showEvaluation(); setTimeout(()=>{ $('burger')?.click(); $('sumHistory')?.click(); },80); });

function scheduleRefresh(ms=220){
  clearTimeout(refreshTimer);
  refreshTimer=setTimeout(loadDashboard,ms);
}

function buildFinalRounds(rows){
  const groups = new Map();
  rows.filter(r=>r.archived && r.archived_at).forEach(r=>{
    const key=`${r.employee_id}|${r.archived_at}`;
    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(r);
  });
  return [...groups.entries()].map(([key,rs])=>{
    const [employee_id, archived_at]=key.split('|');
    return { employee_id, archived_at, average:avg(rs.map(r=>r.average)), evaluatorCount:rs.length };
  }).filter(r=>Number.isFinite(r.average));
}

function latestRoundByEmployee(rounds){
  const map=new Map();
  rounds.forEach(r=>{
    const prev=map.get(r.employee_id);
    if(!prev || new Date(r.archived_at)>new Date(prev.archived_at)) map.set(r.employee_id,r);
  });
  return map;
}

function overallByEmployee(rounds){
  const buckets=new Map();
  rounds.forEach(r=>{
    if(!buckets.has(r.employee_id)) buckets.set(r.employee_id,[]);
    buckets.get(r.employee_id).push(r.average);
  });
  return [...buckets.entries()].map(([employee_id,vals])=>({employee_id,average:avg(vals),rounds:vals.length})).filter(r=>Number.isFinite(r.average));
}

function renderRanking(elId, data, names){
  const host=$(elId); host.innerHTML='';
  if(!data.length){ host.innerHTML='<div class="rank-empty">No finalized evaluation results yet.</div>'; return; }
  const maxScore=5;
  data.slice(0,8).forEach((r,i)=>{
    const name=names.get(r.employee_id)||'Unknown';
    const row=document.createElement('div'); row.className='rank-row';
    row.innerHTML=`<span class="rank-no">${i+1}</span><div class="rank-person"><span class="rank-avatar">${initials(name)}</span><span class="rank-name"></span></div><div class="rank-track"><span style="width:${Math.max(0,Math.min(100,(r.average/maxScore)*100))}%"></span></div><span class="rank-score">${scoreText(r.average)}</span>`;
    row.querySelector('.rank-name').textContent=name;
    host.appendChild(row);
  });
}

function renderTrend(rounds){
  const svg=$('trendChart'), empty=$('trendEmpty'); svg.innerHTML='';
  const buckets=new Map();
  rounds.forEach(r=>{
    const d=safeDate(r.archived_at); if(!d) return;
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    if(!buckets.has(key)) buckets.set(key,[]);
    buckets.get(key).push(r.average);
  });
  const points=[...buckets.entries()].sort((a,b)=>a[0].localeCompare(b[0])).slice(-6).map(([key,vals])=>({key,value:avg(vals)}));
  if(points.length<1){ empty.classList.remove('hide'); return; }
  empty.classList.add('hide');
  const W=720,H=260,L=42,R=20,T=24,B=42, innerW=W-L-R, innerH=H-T-B;
  const y=v=>T+(5-v)/4*innerH;
  const x=i=>points.length===1?L+innerW/2:L+i*(innerW/(points.length-1));
  svg.innerHTML='<defs><linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ab7ef" stop-opacity=".45"/><stop offset="1" stop-color="#6ab7ef" stop-opacity=".04"/></linearGradient></defs>';
  [1,2,3,4,5].forEach(v=>{
    const yy=y(v); svg.insertAdjacentHTML('beforeend',`<line class="trend-grid" x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}"/><text class="trend-label" x="8" y="${yy+3}">${v}</text>`);
  });
  const coords=points.map((p,i)=>[x(i),y(p.value)]);
  const line=coords.map((c,i)=>`${i?'L':'M'} ${c[0]} ${c[1]}`).join(' ');
  const area=`M ${coords[0][0]} ${H-B} `+coords.map(c=>`L ${c[0]} ${c[1]}`).join(' ')+` L ${coords.at(-1)[0]} ${H-B} Z`;
  svg.insertAdjacentHTML('beforeend',`<path class="trend-area" d="${area}"/><path class="trend-line" d="${line}"/>`);
  points.forEach((p,i)=>{
    const [xx,yy]=coords[i]; const [yr,mo]=p.key.split('-');
    const label=new Date(Number(yr),Number(mo)-1,1).toLocaleDateString(undefined,{month:'short',year:'2-digit'});
    svg.insertAdjacentHTML('beforeend',`<circle class="trend-dot" cx="${xx}" cy="${yy}" r="5"/><text class="trend-value" x="${xx}" y="${yy-11}" text-anchor="middle">${p.value.toFixed(2)}</text><text class="trend-label" x="${xx}" y="${H-15}" text-anchor="middle">${label}</text>`);
  });
}

function renderActivity(rows,names){
  const host=$('recentActivity'); host.innerHTML='';
  const archivedGroups=buildFinalRounds(rows).map(r=>({kind:'final',employee_id:r.employee_id,when:r.archived_at,score:r.average}));
  const submitted=rows.filter(r=>!r.archived && r.locked).map(r=>({kind:'submitted',employee_id:r.employee_id,when:r.updated_at||r.created_at}));
  const items=[...archivedGroups,...submitted].filter(x=>x.when).sort((a,b)=>new Date(b.when)-new Date(a.when)).slice(0,6);
  if(!items.length){ host.innerHTML='<div class="activity-empty">No recent evaluation activity yet.</div>'; return; }
  items.forEach(x=>{
    const name=names.get(x.employee_id)||'Unknown'; const row=document.createElement('div'); row.className='activity-row '+x.kind;
    row.innerHTML=`<span class="activity-dot">${x.kind==='final'?'✓':'↗'}</span><div class="activity-copy"><strong></strong><span>${x.kind==='final'?'Finalized evaluation':'Submitted peer evaluation'}</span></div><span class="activity-time">${fmtTime(x.when)}</span>`;
    row.querySelector('strong').textContent=x.kind==='final'?`${name} · ${scoreText(x.score)}`:name;
    host.appendChild(row);
  });
}

async function loadDashboard(){
  const {data:{session}}=await db.auth.getSession(); if(!session) return;
  const uid=session.user.id;
  const [{data:me},{data:profiles,error:pErr},{data:evaluations,error:eErr}]=await Promise.all([
    db.from('profiles').select('id,full_name,position,role,form_role').eq('id',uid).maybeSingle(),
    db.from('profiles').select('id,full_name,position,role,form_role').order('full_name'),
    db.from('evaluations').select('employee_id,evaluator_id,average,locked,archived,archived_at,created_at,updated_at,round')
  ]);

  const people=profiles||[]; const rows=evaluations||[]; const names=new Map(people.map(p=>[p.id,p.full_name||'Unknown']));
  const userName=me?.full_name||session.user.email||'Signed in';
  $('dashUserName').textContent=userName; $('dashUserInitials').textContent=initials(userName);
  $('dashUserRole').textContent=[me?.position,me?.form_role].filter(Boolean).join(' · ')||'Staff';
  $('dashWelcome').textContent=`Welcome back, ${userName}. Here is the latest team evaluation performance.`;
  $('dashDate').textContent=new Date().toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric',year:'numeric'});
  const logo=$('logoImg'); if(logo?.src) $('dashLogo').src=logo.src;

  const alert=$('dashAlert');
  if(pErr||eErr){ alert.textContent='Some dashboard information could not be loaded. Your account may have limited result access.'; alert.classList.remove('hide'); }
  else alert.classList.add('hide');

  const rounds=buildFinalRounds(rows); const latestMap=latestRoundByEmployee(rounds);
  const latest=[...latestMap.values()].sort((a,b)=>b.average-a.average);
  const overall=overallByEmployee(rounds).sort((a,b)=>b.average-a.average);

  const topLatest=latest[0], topOverall=overall[0];
  $('latestTopName').textContent=topLatest?names.get(topLatest.employee_id)||'Unknown':'—';
  $('latestTopScore').textContent=topLatest?scoreText(topLatest.average):'—';
  $('latestTopMeta').textContent=topLatest?`Finalized ${fmtDate(topLatest.archived_at)}`:'No finalized evaluation yet';
  $('overallTopName').textContent=topOverall?names.get(topOverall.employee_id)||'Unknown':'—';
  $('overallTopScore').textContent=topOverall?scoreText(topOverall.average):'—';
  $('teamAverage').textContent=scoreText(avg(overall.map(x=>x.average)));
  $('latestRankingDate').textContent=topLatest?fmtDate(topLatest.archived_at):'Latest';

  const expected=Math.max(people.length*(people.length-1),0);
  const submitted=new Set(rows.filter(r=>!r.archived&&r.locked).map(r=>`${r.employee_id}|${r.evaluator_id}`)).size;
  const pct=expected?Math.min(100,(submitted/expected)*100):0;
  $('completionText').textContent=`${submitted} / ${expected}`; $('completionPercent').textContent=`${Math.round(pct)}%`; $('completionBar').style.width=`${pct}%`;

  renderRanking('latestRanking',latest,names); renderRanking('overallRanking',overall,names); renderTrend(rounds); renderActivity(rows,names);
}

// Keep the dashboard fresh while it is open.
const channel=db.channel('dashboard-evaluations').on('postgres_changes',{event:'*',schema:'public',table:'evaluations'},()=>scheduleRefresh()).subscribe();
window.addEventListener('beforeunload',()=>{ try{ db.removeChannel(channel); }catch(_){} });

// Existing supabase.js removes the sign-in gate when the app is ready. Wait for
// that initialization, then paint the dashboard. This avoids flashing sample data.
const readyCheck=setInterval(()=>{
  const wrap=$('wrap');
  if(wrap && !wrap.classList.contains('hide')){ clearInterval(readyCheck); loadDashboard(); }
},80);
setTimeout(()=>{ clearInterval(readyCheck); loadDashboard(); },5000);

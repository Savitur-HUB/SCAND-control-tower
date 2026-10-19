/* V11 hybrid dispatcher workspace: read/write only Scand V10 Supabase when user authorizes. Excel Online is untouched. */
(function(){
'use strict';
const tab=document.getElementById('v11Tab');
if(!tab)return;
const prefKey='scand-v11-view';
let mode='table',dept='all',q='',attention=false;
try{mode=localStorage.getItem(prefKey)==='cards'?'cards':'table'}catch(e){}
const clean=v=>esc(String(v===undefined||v===null?'':v));
const display=v=>String(v||'').trim()||'Nav norādīts';
const owner=t=>t.excelOwner||({Export:'EXP',Import:'IMP','Cross-trade':'CROSS'}[t.department]||'?');
const route=t=>String(t.currentTo||'').trim();
const confirmed=t=>Boolean(t.currentFrom&&t.unloadAt&&t.status!=='Jāprecizē'&&!t.excelSource);
const hasNext=t=>Boolean(String(t.nextTo||'').trim());
const cab=t=>cabInfo(t);
function risk(t){
 if(issue(t))return {kind:'danger',label:'LAIKA KONFLIKTS',reason:'Jāpārbauda izkraušanas un nākamās iekraušanas laiki'};
 if(t.status==='Jāprecizē'||(!t.currentTo&&!t.nextTo))return {kind:'review',label:'JĀPRECIZĒ',reason:'Trūkst apstiprināta aktīvā plāna'};
 const c=cab(t);
 if(c.remaining===1||c.remaining===0)return {kind:'warning',label:'KABOTĀŽA · PĀRBAUDI',reason:'Jāpārbauda atlikums un pārvadājumu dokumenti'};
 if(t.homeDueAt){const when=Date.parse(t.homeDueAt);if(Number.isFinite(when)&&when-Date.now()<48*3600000)return {kind:'warning',label:'MĀJĀS · TUVOJAS',reason:'Atgriešanās termiņš drīz klāt'};}
 if(!hasNext(t))return {kind:'warning',label:'NAV NĀKAMĀ REISA',reason:'Jāatrod vai jāapstiprina nākamais reiss'};
 return {kind:'normal',label:'PLĀNS IEVADĪTS',reason:'Nav atrasta automātiska brīdinājuma; pārbaudi datu aktualitāti'};
}
const date=s=>s?fmt(s):'Nav norādīts';
function rows(){
 const v=state.trucks.filter(t=>(dept==='all'||owner(t)===dept));
 const list=v.filter(t=>!attention||risk(t).kind!=='normal').filter(t=>!q||[t.id,t.plate,t.driver,t.carrier,t.currentFrom,t.currentTo,t.nextTo,t.notes,t.excelCross,t.excelImport,t.excelExport].some(x=>String(x||'').toLocaleLowerCase('lv').includes(q)));
 return list.sort((a,b)=>({danger:0,review:1,warning:2,normal:3}[risk(a).kind]-({danger:0,review:1,warning:2,normal:3}[risk(b).kind]))||String(a.id).localeCompare(String(b.id),'lv',{numeric:true}));
}
const deptTag=t=>'<span class="v11-dept '+owner(t).toLowerCase()+'">'+clean(owner(t))+'</span>';
const badges=t=>{const c=cab(t),v=c.remaining;return '<span class="v11-cab">'+(v===null?'Kabotāža: ?':'Kabotāža: '+v+'/3')+'</span>'};
const safeRoute=t=>clean(route(t)||'Nav apstiprināta maršruta');
function dateFlag(t){const raw=t.homeDueAt;return raw?clean(date(raw)):'Nav datu'}
function row(t){
 const r=risk(t);
 return '<tr class="v11-r '+r.kind+'"><td><button class="v11-link" data-v11-profile="'+clean(t.id)+'">'+clean(t.id)+'</button><small>'+clean(t.driver||'Šoferis nav norādīts')+'</small></td>'+
 '<td>'+deptTag(t)+'</td><td class="v11-place"><div class="v11-caps">NO ATBILDĪGĀS NODAĻAS · '+clean(owner(t))+'</div><strong>'+safeRoute(t)+'</strong><small>'+clean(t.excelSource?'Vēsturiska Excel kopija, ne GPS':display(t.currentFrom))+'</small></td>'+
 '<td class="v11-place"><strong>'+clean(t.nextTo||'Vēl nav ievadīts')+'</strong><small>'+clean(date(t.nextLoadAt))+'</small></td>'+
 '<td><span class="v11-status '+r.kind+'">'+clean(r.label)+'</span><small>'+clean(r.reason)+'</small></td>'+
 '<td>'+badges(t)+'</td><td><span class="v11-date">'+dateFlag(t)+'</span></td>'+
 '<td><button class="v11-small" data-v11-open="'+clean(t.id)+'">Labot →</button></td></tr>';
}
function card(t){
 const r=risk(t);
 return '<article class="v11-card '+r.kind+'"><div class="v11-cardtop"><div><button class="v11-link" data-v11-profile="'+clean(t.id)+'">'+clean(t.id)+'</button><small>'+clean(t.driver||'Šoferis nav norādīts')+'</small></div>'+deptTag(t)+'</div>'+
 '<div class="v11-status '+r.kind+'">'+clean(r.label)+'</div>'+
 '<div class="v11-journey"><div class="v11-caps">01 · ATBILDĪGĀS NODAĻAS PLĀNS</div><strong>'+safeRoute(t)+'</strong><small>'+clean(t.excelSource?'Excel kopija · nav aktuāla GPS informācija':display(t.currentFrom))+'</small></div>'+
 '<div class="v11-journey next"><div class="v11-caps">02 · NĀKAMAIS REISS</div><strong>'+clean(t.nextTo||'Nav ievadīts')+'</strong><small>'+clean(date(t.nextLoadAt))+'</small></div>'+
 '<div class="v11-bottom"><span>'+badges(t)+'</span><span>⌂ '+dateFlag(t)+'</span></div><div class="v11-buttons"><button data-v11-profile="'+clean(t.id)+'">Pilns profils</button><button data-v11-open="'+clean(t.id)+'">Labot plānu →</button></div></article>';
}
function renderV11(){
 const all=state.trucks,filtered=rows();
 const review=all.filter(t=>risk(t).kind==='review'||risk(t).kind==='danger').length;
 const needs=all.filter(t=>!hasNext(t)).length;
 const homes=all.filter(t=>t.homeDueAt).length;
 const stats=document.getElementById('v11Stats');
 stats.innerHTML=[['Visas mašīnas',all.length,'truck'],['Jāpārbauda',review,'alert'],['Bez nākamā reisa',needs,'next'],['Mājās plāni',homes,'home']].map(([t,n,cls])=>'<div class="v11-metric '+cls+'"><small>'+t+'</small><strong>'+n+'</strong></div>').join('');
 document.getElementById('v11Rows').innerHTML=filtered.length?filtered.map(row).join(''):'<tr><td colspan="8" class="v11-empty">Šim filtram nav mašīnu.</td></tr>';
 document.getElementById('v11Cards').innerHTML=filtered.length?filtered.map(card).join(''):'<div class="v11-empty">Šim filtram nav mašīnu.</div>';
 document.getElementById('v11Count').textContent=filtered.length+' no '+all.length+' mašīnām';
 document.getElementById('v11TablePane').hidden=mode!=='table';
 document.getElementById('v11Cards').hidden=mode!=='cards';
 tab.querySelectorAll('[data-v11-mode]').forEach(b=>{b.classList.toggle('selected',b.dataset.v11Mode===mode);b.setAttribute('aria-pressed',String(b.dataset.v11Mode===mode))});
 tab.querySelectorAll('[data-v11-dept]').forEach(b=>{b.classList.toggle('selected',b.dataset.v11Dept===dept);b.setAttribute('aria-pressed',String(b.dataset.v11Dept===dept))});
 document.getElementById('v11Attention').setAttribute('aria-pressed',String(attention));
 document.getElementById('v11Attention').classList.toggle('selected',attention);
}
tab.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.v11Mode){mode=b.dataset.v11Mode;try{localStorage.setItem(prefKey,mode)}catch(e){}renderV11()}
 else if(b.dataset.v11Dept){dept=b.dataset.v11Dept;renderV11()}
 else if(b.dataset.v11Profile){const id=b.dataset.v11Profile;if(typeof openTruck==='function')openTruck(id)}
 else if(b.dataset.v11Open){openQuick(b.dataset.v11Open)}
 else if(b.id==='v11Attention'){attention=!attention;renderV11()}
});
document.getElementById('v11Search').addEventListener('input',e=>{q=e.target.value.trim().toLocaleLowerCase('lv');renderV11()});
headings.v11=['DISPEČERA DARBA GALDS','SCAND · V11','Dati no atbildīgās nodaļas · Excel praktiskums un V10 kartītes vienā skatā.'];
const oldRender=render;
render=function(){oldRender();renderV11()};
document.querySelectorAll('[data-tab="v11"]').forEach(b=>b.onclick=()=>switchTab('v11'));
renderV11();
if(location.hash==='#v11')switchTab('v11');
})();
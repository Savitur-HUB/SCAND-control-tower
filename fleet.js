/* V10.2 Fleet Board: no Excel Online requests, no geolocation, no fabricated mileage. */
'use strict';
(function(){
 const root=document.getElementById('fleetTab');
 if(!root)return;
 let fleetScope='all';
 function safe(v){return esc(v===undefined||v===null?'':v)}
 function formatDate(v){if(!v)return 'Nav norādīts';const d=new Date(v);return Number.isNaN(d.getTime())?String(v):d.toLocaleString('lv-LV',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}
 function isCompleted(trip){return ['Piegādāts','Izpildīts','Delivered','Completed'].includes(String(trip.status||''))}
 function loggedKm(trip){const v=String(trip.distanceKm===undefined?'':trip.distanceKm).trim();if(!/^\d+(?:\.\d{1,2})?$/.test(v))return null;const n=Number(v);return Number.isFinite(n)&&n>0&&n<=50000?n:null}
 function getTripsFor(id){return (state.trips||[]).filter(x=>x.truckId===id).slice().sort((a,b)=>String(b.unloadAt||b.loadAt||'').localeCompare(String(a.unloadAt||a.loadAt||'')))}
 function totalKm(id){const trips=getTripsFor(id).filter(isCompleted).map(loggedKm).filter(x=>x!==null);return trips.length?{distance:Math.round(trips.reduce((a,b)=>a+b,0)*100)/100,count:trips.length}:null}
 function homeClass(t){if(!t.homeDueAt)return '';const time=new Date(t.homeDueAt).getTime();if(Number.isNaN(time))return '';const diff=time-Date.now();return diff<0?'fleet-home-late':diff<3*86400000?'fleet-home-soon':'fleet-home-ok'}
 function homeDisplay(t){return t.homeDueAt?formatDate(t.homeDueAt):'Nav norādīts'}
 function cbSummary(t){const cab=cabInfo(t);return cab.remaining===null?'Nav pārbaudīts':cab.remaining+' / 3 · manuāli / pēc reisiem'}
 function fleetMetric(label,n){return '<div class="fleet-metric"><strong>'+safe(n)+'</strong><small>'+safe(label)+'</small></div>'}
 function truckRoute(t){const from=t.currentFrom||'—';return safe(from)+' → '+safe(t.currentTo||'Nav maršruta')}
 function fleetFilterList(){
   const q=String($('fleetSearch').value||'').trim().toLocaleLowerCase('lv');
   const dept=$('fleetDept').value;
   return state.trucks.filter(t=>{
    if(dept!=='all'&&t.department!==dept)return false;
    if(fleetScope==='needs'&&!!t.nextTo)return false;
    if(fleetScope==='home'&&!t.homeDueAt)return false;
    if(fleetScope==='unclear'&&t.status!=='Jāprecizē')return false;
    return !q||[t.id,t.plate,t.driver,t.carrier,t.department,t.currentFrom,t.currentTo,t.nextFrom,t.nextTo,t.homeTo,t.homePlanNote].some(v=>String(v||'').toLocaleLowerCase('lv').includes(q))
   }).sort((a,b)=>{
    const xa=a.homeDueAt?new Date(a.homeDueAt).getTime():Infinity,xb=b.homeDueAt?new Date(b.homeDueAt).getTime():Infinity;
    return xa-xb||String(a.id).localeCompare(String(b.id),'lv',{numeric:true})
   });
 }
 function tableRow(t){
  const km=totalKm(t.id);
  return '<tr>'+
   '<td><button class="truck-link" data-fleet-profile="'+safe(t.id)+'">'+safe(t.id)+'</button><span class="fleet-secondary">'+safe(t.driver||'Nav šofera')+'</span><span class="fleet-muted">'+safe(t.carrier||'')+'</span></td>'+
   '<td><span class="fleet-badge">'+safe(t.department||'Nav nodaļas')+'</span></td>'+
   '<td>'+truckRoute(t)+'<span class="fleet-secondary">Izkraušana: '+safe(formatDate(t.unloadAt))+'</span></td>'+
   '<td>'+safe(t.nextFrom||'—')+' → '+safe(t.nextTo||'Nav nākamā reisa')+'<span class="fleet-secondary">Iekraušana: '+safe(formatDate(t.nextLoadAt))+'</span></td>'+
   '<td><span class="fleet-badge">'+safe(t.status||'Jāprecizē')+'</span></td>'+
   '<td><button class="fleet-action" data-fleet-cab="'+safe(t.id)+'">'+safe(cbSummary(t))+' ↗</button></td>'+
   '<td><button class="fleet-action '+homeClass(t)+'" data-fleet-home="'+safe(t.id)+'">'+safe(homeDisplay(t))+' ✎</button><span class="fleet-secondary">'+safe(t.homeTo||'Galamērķis nav norādīts')+'</span></td>'+
   '<td>'+(km?'<strong>'+safe(km.distance.toLocaleString('lv-LV'))+' km</strong><span class="fleet-secondary">'+safe(km.count)+' pabeigti reisi ar km</span>':'<span class="fleet-muted">Nav datu</span>')+'</td>'+
   '<td><button class="fleet-action" data-fleet-profile="'+safe(t.id)+'">Vēsture ↗</button></td>'+
   '</tr>';
 }
 function mobileCard(t){
  const km=totalKm(t.id);
  return '<article class="fleet-card">'+
   '<div class="fleet-card-head"><button class="truck-link" data-fleet-profile="'+safe(t.id)+'">'+safe(t.id)+' ↗</button><span class="fleet-badge">'+safe(t.department)+'</span></div>'+
   '<div class="fleet-driver">'+safe(t.driver||'Nav norādīts šoferis')+' · '+safe(t.status||'Jāprecizē')+'</div>'+
   '<div class="fleet-details">'+
     '<div class="fleet-detail fleet-wide"><small>Kur brauc / pašreizējais maršruts</small><b>'+truckRoute(t)+'</b></div>'+
     '<div class="fleet-detail fleet-wide"><small>Nākamais reiss</small><b>'+safe(t.nextFrom||'—')+' → '+safe(t.nextTo||'Nav plānots')+'</b></div>'+
     '<div class="fleet-detail"><small>Kabotāža</small><b>'+safe(cbSummary(t))+'</b></div>'+
     '<div class="fleet-detail"><small>Uzskaitīti km</small><b>'+(km?safe(km.distance.toLocaleString('lv-LV'))+' km':'Nav datu')+'</b></div>'+
     '<div class="fleet-detail fleet-wide"><small>Mājās līdz</small><b class="'+homeClass(t)+'">'+safe(homeDisplay(t))+'</b><small>'+safe(t.homeTo||'Atgriešanās vieta nav norādīta')+'</small></div>'+
   '</div><div class="fleet-buttons">'+
   '<button class="fleet-action" data-fleet-profile="'+safe(t.id)+'">Reisu vēsture</button>'+
   '<button class="fleet-action" data-fleet-home="'+safe(t.id)+'">Plānot mājās</button>'+
   '<button class="fleet-action" data-fleet-cab="'+safe(t.id)+'">Kabotāža ↗</button>'+
   '<button class="fleet-action" data-fleet-edit="'+safe(t.id)+'">Labot mašīnu</button>'+
   '</div></article>';
 }
 function renderFleet(){
  const vehicles=fleetFilterList();
  const all=state.trucks;
  const homeCount=all.filter(x=>!!x.homeDueAt).length;
  const historyCount=all.filter(x=>totalKm(x.id)!==null).length;
  $('fleetSummary').innerHTML=fleetMetric('Mašīnas',all.length)+fleetMetric('Cross-trade',all.filter(t=>t.department==='Cross-trade').length)+fleetMetric('Export / Import',all.filter(t=>t.department==='Export').length+' / '+all.filter(t=>t.department==='Import').length)+fleetMetric('Mājās plāns / ar km',homeCount+' / '+historyCount);
  $('fleetCount').textContent=vehicles.length+' no '+all.length;
  $('fleetRows').innerHTML=vehicles.length?vehicles.map(tableRow).join(''):'<tr><td colspan="9" class="fleet-empty">Nav atrastu mašīnu.</td></tr>';
  $('fleetCards').innerHTML=vehicles.length?vehicles.map(mobileCard).join(''):'<div class="fleet-empty">Nav atrastu mašīnu. Pamēģini citu filtru.</div>';
  root.querySelectorAll('[data-fleet-filter]').forEach(b=>b.classList.toggle('active',b.dataset.fleetFilter===fleetScope));
 }
 function openProfile(id){
  const t=getTruck(id);if(!t)return toast('Mašīna nav atrasta',true);
  const trips=getTripsFor(id);
  const km=totalKm(id);
  const history=trips.length?trips.map(r=>'<div class="fleet-journey"><strong>'+safe(r.from||'?')+' → '+safe(r.to||'?')+'</strong><small>'+
     safe(r.id||'Reiss')+' · '+safe(r.department||'')+' · '+safe(r.status||'')+
     '<br>Iekraušana: '+safe(formatDate(r.loadAt))+' · Izkraušana: '+safe(formatDate(r.unloadAt))+
     '<br>Nobraukums: '+(loggedKm(r)===null?'Nav ievadīts':safe(loggedKm(r))+' km')+
     (r.ref?'<br>Ref: '+safe(r.ref):'')+
     '</small><button class="fleet-action" data-fleet-trip="'+safe(r.id)+'">Atvērt reisu ↗</button></div>').join(''):
    '<p class="fleet-form-note">Pagaidām nav neviena reģistrēta reisa. Excel brīvteksta maršruti nav uzskatīti par apstiprinātu reisu vēsturi.</p>';
  const changes=(state.logs||[]).filter(l=>l.id===t.id).slice(0,10);
  function info(label,v){return '<div><small>'+safe(label)+'</small><strong>'+safe(v||'Nav norādīts')+'</strong></div>'}
  const body='<div class="fleet-profile-grid">'+
   info('Nodaļa / statuss',(t.department||'')+' · '+(t.status||''))+
   info('Šoferis',t.driver)+info('Pārvadātājs',t.carrier)+
   info('Pašreizējais maršruts',(t.currentFrom||'—')+' → '+(t.currentTo||'Nav datu'))+
   info('Nākamais maršruts',(t.nextFrom||'—')+' → '+(t.nextTo||'Nav plānots'))+
   info('Kabotāža',cbSummary(t))+
   info('Jāatgriežas mājās līdz',homeDisplay(t))+
   info('Mājās / atgriešanās vieta',t.homeTo)+
   info('Pabeigto reisu uzskaitītie km',km?km.distance.toLocaleString('lv-LV')+' km · '+km.count+' reisi':'Nav datu')+
   info('Reisu žurnāla ieraksti',String(trips.length))+
   '</div>'+
   (t.homePlanNote?'<div class="fleet-journey"><b>Mājās piezīme</b><br>'+safe(t.homePlanNote)+'</div>':'')+
   (t.notes?'<div class="fleet-journey"><b>Esošā plāna piezīmes</b><br>'+safe(t.notes)+'</div>':'')+
   '<div class="fleet-profile-actions">'+
    '<button class="btn primary" id="fleetProfileNewTrip">＋ Pievienot reisu</button>'+
    '<button class="btn" id="fleetProfileHome">⌂ Mājās plāns</button>'+
    '<button class="btn" id="fleetProfileCab">Kabotāžas uzskaite</button>'+
    '<button class="btn" id="fleetProfileEdit">Labot mašīnu</button>'+
   '</div>'+
   '<h3 class="fleet-profile-h">Reisu vēsture · '+safe(trips.length)+' reisi</h3>'+history+
   '<h3 class="fleet-profile-h">Mašīnas izmaiņu žurnāls</h3>'+
   (changes.length?changes.map(l=>'<div class="fleet-journey">'+safe(l.kind)+' · '+safe(l.detail)+'<small>'+safe(formatDate(l.at))+' · '+safe(l.user)+'</small></div>').join(''):'<p class="fleet-form-note">Pagaidām nav individuālu izmaiņu žurnāla ierakstu.</p>');
  showDialog('Mašīna '+t.id+' · vēsture',body,'<button class="btn ghost" id="fleetClose">Aizvērt</button>',true);
  $('fleetClose').onclick=closeDialog;
  $('fleetProfileNewTrip').onclick=()=>newTrip(null,t.id);
  $('fleetProfileHome').onclick=()=>editHome(t.id);
  $('fleetProfileCab').onclick=()=>openCab(t.id);
  $('fleetProfileEdit').onclick=()=>openTruck(t.id);
  $('dlgBody').querySelectorAll('[data-fleet-trip]').forEach(b=>b.onclick=()=>newTrip(b.dataset.fleetTrip));
 }
 function editHome(id){
  const t=getTruck(id);if(!t)return;
  const body='<p class="fleet-form-note">Ievadi, kad mašīnai nepieciešams atgriezties mājās. Tā nav GPS prognoze. Šis plāns glabājas tikai mūsu V10 kopīgajā datubāzē, nevis SharePoint Excel.</p>'+
    '<form id="fleetHomeForm"><div class="formgrid">'+
    '<div class="fgroup"><label>Kur atgriezties (pilsēta / valsts)</label><input name="homeTo" autocomplete="off" placeholder="Piemēram, LV Rīga" value="'+safe(t.homeTo||'')+'"></div>'+
    '<div class="fgroup"><label>Jābūt mājās līdz</label><input name="homeDueAt" type="datetime-local" value="'+safe(dt(t.homeDueAt||''))+'"></div>'+
    '<div class="fgroup wide"><label>Piezīmes / iemesls</label><textarea name="homePlanNote" rows="3" placeholder="Piemēram, šoferim brīvdienas">'+safe(t.homePlanNote||'')+'</textarea></div>'+
    '</div></form>';
  showDialog('Mājās atgriešanās · '+t.id,body,'<button class="btn ghost" id="fleetHomeCancel">Atcelt</button><button class="btn primary" id="fleetHomeSave">Saglabāt plānu</button>',true);
  $('fleetHomeCancel').onclick=closeDialog;
  $('fleetHomeSave').onclick=()=>{
    const d=Object.fromEntries(new FormData($('fleetHomeForm')).entries());
    const before={homeTo:t.homeTo||'',homeDueAt:t.homeDueAt||'',homePlanNote:t.homePlanNote||''};
    const next={homeTo:String(d.homeTo||'').trim(),homeDueAt:String(d.homeDueAt||'').trim(),homePlanNote:String(d.homePlanNote||'').trim()};
    if(JSON.stringify(next)===JSON.stringify(before)){closeDialog();return}
    commit('Mājās plāns',id,'Atgriešanās plāns '+(next.homeDueAt||'noņemts'),()=>{
      const current=getTruck(id);
      Object.assign(current,next,{updatedBy:cloud.connected?cloud.email:prefs.user,updatedAt:new Date().toISOString()});
    });
    closeDialog();
  };
 }
 const priorRender=render;
 render=function(){priorRender();renderFleet()};
 const priorNewTrip=newTrip;
 newTrip=function(id=null,preselectTruck=''){
   priorNewTrip(id);
   const form=$('tripForm');if(!form)return;
   if(preselectTruck&&form.elements.truckId)form.elements.truckId.value=preselectTruck;
   if(!form.elements.distanceKm){
    const trip=id?state.trips.find(x=>x.id===id):null;
    const wrapper=document.createElement('div');wrapper.className='fgroup';
    wrapper.innerHTML='<label for="fleetTripKm">Faktiskais nobraukums (km) — manuāli</label><input id="fleetTripKm" name="distanceKm" type="number" min="0.1" max="50000" step="0.1" inputmode="decimal" placeholder="Nav datu" value="'+safe(trip?.distanceKm||'')+'"><small class="fleet-muted">Ievadi tikai zināmus kilometrus. Kopējā statistikā skaita tikai pabeigtus reisus.</small>';
    const grid=form.querySelector('.formgrid');if(grid)grid.appendChild(wrapper);
   }
   const save=$('saveTripBtn');
   if(save)save.addEventListener('click',e=>{
     const raw=String(form.elements.distanceKm?.value||'').trim();
     if(raw&&(Number(raw)<=0||Number(raw)>50000||!Number.isFinite(Number(raw)))){
       e.stopImmediatePropagation();e.preventDefault();
       $('formError').textContent='Km jābūt skaitlim no 0.1 līdz 50000 vai atstāj tukšu.';
     }
   },true);
 };
 headings.fleet=['AUTOPARKS','Autoparka pārskats','Visas mašīnas, nodaļas, mājas plāns, kabotāža un reisu vēsture.'];
 root.addEventListener('click',e=>{
   const b=e.target.closest('button');if(!b)return;
   if(b.dataset.fleetProfile){openProfile(b.dataset.fleetProfile);return}
   if(b.dataset.fleetHome){editHome(b.dataset.fleetHome);return}
   if(b.dataset.fleetCab){openCab(b.dataset.fleetCab);return}
   if(b.dataset.fleetEdit){openTruck(b.dataset.fleetEdit);return}
   if(b.dataset.fleetFilter){fleetScope=b.dataset.fleetFilter;renderFleet()}
 });
 $('fleetSearch').addEventListener('input',renderFleet);
 $('fleetDept').addEventListener('change',renderFleet);
 renderFleet();
 // Deep-link to the phone-friendly fleet board without interfering with normal V10 start-up.
 if(window.location.hash==='#fleet')switchTab('fleet');
})();
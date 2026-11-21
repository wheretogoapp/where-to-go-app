/* Where to Go traveler profile: user-owned journeys, favorites, visits and PWA guide.
   Google Places results are NOT archived. Google place IDs are saved for later rehydration.
   All guest information remains on this device. Cloud sync requires the RLS migration. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const root=$('wtg-traveler-profile'); if(!root)return;
const langs={es:'Español',en:'English',fr:'Français',pt:'Português',de:'Deutsch',it:'Italiano'};
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const now=()=>new Date().toISOString();
const stamp=s=>{try{return new Intl.DateTimeFormat(undefined,{year:'numeric',month:'short',day:'numeric'}).format(new Date(s))}catch{return ''}};
const empty=()=>({v:2,updatedAt:now(),name:'',city:'',theme:'dark',language:localStorage.getItem('wtg_ui_language')||'es',historyEnabled:false,explored:[],visited:[],trips:[]});
const defaults={user:null,client:null,tab:'home',cloud:'local',pending:null,installPrompt:null,lastOpen:'',lastOpenAt:0};
const active={...defaults};
const names=new Map();
let state=empty(),cloudTimer=null,cloudVersion=0;
const storageKey=()=> 'wtg_traveler_v2_'+(active.user?.id||'guest');
const read=()=>{
 try{const saved=JSON.parse(localStorage.getItem(storageKey())||'null');
  if(saved&&saved.v===2&&Array.isArray(saved.explored)&&Array.isArray(saved.visited)&&Array.isArray(saved.trips))return {...empty(),...saved};
 }catch{}return empty();
};
const cloudData=()=>({
 v:2,updatedAt:state.updatedAt,name:state.name,city:state.city,
 theme:state.theme,language:state.language,historyEnabled:state.historyEnabled,
 explored:state.explored.map(i=>({id:i.id,at:i.at,source:i.source||''})),
 visited:state.visited.map(i=>({id:i.id,at:i.at,source:i.source||''})),
 trips:state.trips.map(t=>({id:t.id,title:t.title,date:t.date||'',createdAt:t.createdAt,places:t.places||[]}))
});
const put=()=>{
 state.updatedAt=now();
 try{localStorage.setItem(storageKey(),JSON.stringify(cloudData()))}catch{active.cloud='storage-error'}
 render();
 clearTimeout(cloudTimer);
 if(active.client&&active.user)cloudTimer=setTimeout(()=>{void syncCloud()},650);
};
async function syncCloud(){
 if(!active.client||!active.user)return;
 const who=active.user.id;
 const data=cloudData();
 try{
  const result=await active.client.from('traveler_profiles').upsert({user_id:who,data,updated_at:now()},{onConflict:'user_id'});
  if(result.error)throw result.error;
  if(active.user?.id!==who)return;
  active.cloud='ok';renderStatus();
 }catch(e){
  if(active.user?.id!==who)return;
  active.cloud='local';
  renderStatus();
 }
}
async function fetchCloud(){
 if(!active.client||!active.user)return;
 const who=active.user.id, version=++cloudVersion;
 try{
  const result=await active.client.from('traveler_profiles').select('data,updated_at').eq('user_id',who).maybeSingle();
  if(result.error)throw result.error;
  if(active.user?.id!==who||cloudVersion!==version)return;
  const remote=result.data?.data;
  if(remote?.v===2 && (Date.parse(remote.updatedAt||0)>Date.parse(state.updatedAt||0))){
   state={...empty(),...remote};
   try{localStorage.setItem(storageKey(),JSON.stringify(cloudData()))}catch{}
   applyPreferences();render();
  }else if(!result.data){await syncCloud();return}
  active.cloud='ok';renderStatus();
 }catch(e){if(active.user?.id===who){active.cloud='local';renderStatus()}}
}
function setSession(user,client){
 const old=active.user?.id||'';
 const next=user?.id||'';
 active.user=user||null;active.client=client||null;
 if(old!==next){
  cloudVersion++;
  state=read();active.cloud=next?'connecting':'local';active.pending=null;
  applyPreferences();render();
 }
 if(next&&client)void fetchCloud();
 else renderStatus();
}
function preferredTheme(){return state.theme==='auto'?(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):state.theme}
function applyPreferences(){
 document.documentElement.dataset.wtgTheme=preferredTheme();
 document.querySelector('meta[name="theme-color"]')?.setAttribute('content',preferredTheme()==='light'?'#edf6ff':'#041b40');
}
function placeRef(p){
 if(!p||typeof p.id!=='string'||p.id.length>250)return null;
 names.set(p.id,String(p.name||'').slice(0,150));
 return {id:p.id,source:String(p.source||'').slice(0,40),at:now()};
}
function recordOpen(p){
 const item=placeRef(p);if(!item||!state.historyEnabled)return;
 if(active.lastOpen===item.id&&Date.now()-active.lastOpenAt<45000)return;
 active.lastOpen=item.id;active.lastOpenAt=Date.now();
 state.explored=[item,...state.explored.filter(x=>x.id!==item.id)].slice(0,120);
 put();
}
function markVisited(p){
 const item=placeRef(p);if(!item)return;
 state.visited=[item,...state.visited.filter(x=>x.id!==item.id)].slice(0,150);
 put();active.tab='visited';render();open();
}
function favoriteCount(){
 try{const x=JSON.parse(localStorage.getItem('wtg_favorites')||'[]');return Array.isArray(x)?x.length:0}catch{return 0}
}
function rowLabel(item){
 // An external provider's place name is resolved from the currently open session only.
 const known=names.get(item.id);
 if(known)return known;
 const text=item.source==='google'?'Lugar guardado de Google Maps':'Lugar guardado';
 return text+' · '+String(item.id).slice(0,24);
}
function placeList(items,kind){
 if(!items.length)return '<p class="wtg-profile-empty">Todavía no tienes lugares aquí. Descubre lugares y guárdalos cuando quieras.</p>';
 return '<div class="wtg-profile-entries">'+items.map(i=>'<article class="wtg-profile-entry"><div><strong>'+safe(rowLabel(i))+'</strong><small>'+safe(stamp(i.at))+'</small></div><button type="button" data-wtg-remove="'+kind+'" data-wtg-id="'+safe(i.id)+'" aria-label="Quitar lugar">✕</button></article>').join('')+'</div>';
}
function statusText(){
 if(!active.user)return 'Modo invitado · Los datos de este perfil permanecen en este dispositivo.';
 if(active.cloud==='ok')return 'Cuenta conectada · Tu perfil de viajes se sincroniza con Supabase.';
 if(active.cloud==='connecting')return 'Conectando el perfil de viajes con tu cuenta…';
 if(active.cloud==='storage-error')return 'No se pudo guardar en este dispositivo. Revisa el espacio disponible.';
 return 'Guardado en este dispositivo. La sincronización entre equipos necesita activar la tabla privada de perfil en Supabase.';
}
function renderStatus(){const e=$('wtg-profile-sync');if(e)e.textContent=statusText()}
function render(){
 if(root.hidden)return;
 const email=active.user?.email||'Invitado';
 const display=state.name||active.user?.user_metadata?.full_name||'Viajero';
 const initial=String(display).trim().charAt(0).toUpperCase()||'W';
 $('wtg-profile-avatar').textContent=initial;
 $('wtg-profile-name').textContent=display;
 $('wtg-profile-email').textContent=email;
 $('wtg-profile-fav-count').textContent=String(favoriteCount());
 $('wtg-profile-visit-count').textContent=String(state.visited.length);
 $('wtg-profile-trip-count').textContent=String(state.trips.length);
 $('wtg-profile-explore-count').textContent=String(state.explored.length);
 root.querySelectorAll('[data-profile-tab]').forEach(btn=>{
  const isActive=btn.dataset.profileTab===active.tab;
  btn.classList.toggle('selected',isActive);
  btn.setAttribute('aria-selected',String(isActive));
 });
 root.querySelectorAll('[data-profile-panel]').forEach(node=>{node.hidden=node.dataset.profilePanel!==active.tab});
 $('wtg-profile-visited').innerHTML=placeList(state.visited,'visited');
 $('wtg-profile-explored').innerHTML=placeList(state.explored,'explored');
 const trips=$('wtg-profile-trips');
 trips.innerHTML=state.trips.length?state.trips.map(t=>(
  '<article class="wtg-profile-trip"><div><strong>🧳 '+safe(t.title)+'</strong><small>'+safe(t.date?stamp(t.date):'Sin fecha')+' · '+(t.places||[]).length+' lugares</small></div>'+
  ((t.places||[]).length?'<div class="wtg-profile-trip-places">'+t.places.map(id=>'<span>'+safe(rowLabel({id,source:id.startsWith('google')?'google':''}))+' <button type="button" data-wtg-trip-remove-place="'+safe(t.id)+'" data-wtg-id="'+safe(id)+'" aria-label="Quitar del viaje">×</button></span>').join('')+'</div>':'')+
  '<div class="wtg-profile-trip-actions">'+(active.pending?'<button type="button" data-wtg-trip-add="'+safe(t.id)+'">+ Añadir lugar pendiente</button>':'')+
  '<button type="button" data-wtg-trip-remove="'+safe(t.id)+'">Eliminar viaje</button></div></article>'
 )).join(''):
  '<p class="wtg-profile-empty">Crea tu primer viaje para organizar los lugares que quieres conocer.</p>';
 $('wtg-profile-pending').textContent=active.pending?'Lugar listo para añadir: '+(names.get(active.pending)||'lugar guardado'):'';
 const c=$('wtg-profile-settings');
 if(c && c.dataset.loaded!=='yes'){
  $('wtg-profile-name-input').value=state.name;
  $('wtg-profile-city-input').value=state.city;
  $('wtg-profile-theme-input').value=state.theme;
  $('wtg-profile-language-input').value=state.language in langs?state.language:'es';
  $('wtg-profile-history-input').checked=!!state.historyEnabled;
  c.dataset.loaded='yes';
 }
 renderStatus();
}
function open(tab){
 if(typeof tab==='string')active.tab=tab;
 root.hidden=false;document.body.classList.add('wtg-profile-open');
 $('wtg-profile-settings').dataset.loaded='no';
 render();
 $('wtg-profile-close')?.focus({preventScroll:true});
}
function close(){root.hidden=true;document.body.classList.remove('wtg-profile-open')}
function assignToTrip(place,tripId){
 const trip=state.trips.find(t=>t.id===tripId);
 if(!trip||!place)return;
 trip.places=Array.from(new Set([...(trip.places||[]),place])).slice(0,100);
 active.pending=null;put();
}
function addToTrip(p){
 const item=placeRef(p);if(!item)return;
 active.pending=item.id;open('trips');
}
function saveSettings(){
 const name=$('wtg-profile-name-input').value.trim().slice(0,80);
 const city=$('wtg-profile-city-input').value.trim().slice(0,80);
 const theme=$('wtg-profile-theme-input').value;
 const language=$('wtg-profile-language-input').value;
 state.name=name;state.city=city;
 state.theme=['auto','light','dark'].includes(theme)?theme:'dark';
 state.language=language in langs?language:'es';
 state.historyEnabled=$('wtg-profile-history-input').checked;
 applyPreferences();
 try{window.WTG_I18N?.change?.(state.language)}catch{}
 $('wtg-profile-settings').dataset.loaded='no';
 put();
 if(active.client && active.user){
  void active.client.auth.updateUser({data:{full_name:name,home_city:city}}).then(({error})=>{
   if(error)tell('Los cambios se guardaron aquí, pero el nombre no se actualizó en la cuenta: '+error.message);
  });
 }
 tell('Preferencias guardadas.');
}
function tell(message){const e=$('wtg-profile-message');if(e)e.textContent=message}
function exportData(){
 const blob=new Blob([JSON.stringify(cloudData(),null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob);const a=document.createElement('a');
 a.href=url;a.download='where-to-go-mis-datos.json';a.click();
 setTimeout(()=>URL.revokeObjectURL(url),2000);
}
async function clearHistory(){
 if(!confirm('¿Borrar los lugares explorados y visitados de este perfil? Los favoritos y viajes se conservarán.'))return;
 state.visited=[];state.explored=[];put();tell('Historial de este perfil borrado.');
 if(active.client&&active.user){
  const r=await active.client.from('activity_events').delete().eq('user_id',active.user.id);
  if(r.error)tell('El historial del perfil se borró. Los eventos anteriores del servidor requieren habilitar la política de eliminación en Supabase.');
 }
}
let beforeInstall=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();beforeInstall=e;});
function installHelp(){
 const isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent);
 const standalone=window.matchMedia?.('(display-mode: standalone)')?.matches||navigator.standalone===true;
 if(standalone){tell('Where to Go ya se está ejecutando como una aplicación instalada.');return}
 if(beforeInstall){
  const prompt=beforeInstall;beforeInstall=null;
  void prompt.prompt();return;
 }
 tell(isIOS?'En Safari: toca Compartir (cuadrado con flecha) → Añadir a pantalla de inicio → Añadir. Activa “Abrir como app” si aparece.':
  'En Chrome o tu navegador: abre el menú ⋮ y elige “Instalar aplicación” o “Agregar a pantalla principal”.');
}
root.addEventListener('click',event=>{
 const btn=event.target.closest('button');if(!btn)return;
 if(btn.id==='wtg-profile-close'||btn.dataset.profileClose!==undefined){close();return}
 if(btn.dataset.profileTab){active.tab=btn.dataset.profileTab;$('wtg-profile-settings').dataset.loaded='no';render();return}
 if(btn.id==='wtg-profile-favorites'){close();document.querySelector('[data-view="favoritos"].mobile-tab')?.click();return}
 if(btn.id==='wtg-profile-add-trip'){
  const input=$('wtg-profile-new-trip'),title=input.value.trim().slice(0,80);
  if(!title){tell('Escribe el nombre del viaje.');input.focus();return}
  state.trips.unshift({id:'trip-'+Date.now().toString(36),title,date:$('wtg-profile-trip-date').value||'',places:active.pending?[active.pending]:[],createdAt:now()});
  state.trips=state.trips.slice(0,30);active.pending=null;input.value='';put();tell('Viaje guardado.');return;
 }
 if(btn.dataset.wtgTripAdd){assignToTrip(active.pending,btn.dataset.wtgTripAdd);tell('Lugar agregado al viaje.');return}
 if(btn.dataset.wtgTripRemove){
  if(!confirm('¿Eliminar este viaje?'))return;
  state.trips=state.trips.filter(t=>t.id!==btn.dataset.wtgTripRemove);put();return;
 }
 if(btn.dataset.wtgTripRemovePlace){
  const trip=state.trips.find(t=>t.id===btn.dataset.wtgTripRemovePlace);
  if(trip){trip.places=trip.places.filter(id=>id!==btn.dataset.wtgId);put()}return;
 }
 if(btn.dataset.wtgRemove){
  const key=btn.dataset.wtgRemove==='visited'?'visited':'explored';
  state[key]=state[key].filter(x=>x.id!==btn.dataset.wtgId);put();return;
 }
 if(btn.id==='wtg-profile-save'){saveSettings();return}
 if(btn.id==='wtg-profile-export'){exportData();return}
 if(btn.id==='wtg-profile-clear-history'){void clearHistory();return}
 if(btn.id==='wtg-profile-install'){installHelp();return}
 if(btn.id==='wtg-profile-signin'){close();window.WTG_auth?.showLogin?.();return}
 if(btn.id==='wtg-profile-logout'){close();void window.WTG_auth?.signOut?.();return}
});
document.querySelectorAll('[data-profile-open]').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();open()}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!root.hidden)close()});
window.matchMedia?.('(prefers-color-scheme: light)')?.addEventListener?.('change',()=>{if(state.theme==='auto')applyPreferences()});
window.WTG_PROFILE={open,close,setSession,markVisited,recordOpen,addToTrip,refresh:render,get snapshot(){return cloudData()}};
state=read();applyPreferences();
})();
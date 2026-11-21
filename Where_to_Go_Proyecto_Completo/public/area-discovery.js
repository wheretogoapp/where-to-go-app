/* Where to Go · A dónde ir
   Reusable geographic-area explorer for ANY verified Dominican location.
   Compass areas are search centers only, never invented neighborhood names.
   Queries happen on a user's tap, not as a nationwide paid Google crawl. */
(() => {
 'use strict';
 const sectors=[
  {id:'centro',label:'Centro',north:0,east:0,icon:'📍'},
  {id:'norte',label:'Norte',north:1,east:0,icon:'⬆️'},
  {id:'noreste',label:'Noreste',north:.707,east:.707,icon:'↗️'},
  {id:'este',label:'Este',north:0,east:1,icon:'➡️'},
  {id:'sureste',label:'Sureste',north:-.707,east:.707,icon:'↘️'},
  {id:'sur',label:'Sur',north:-1,east:0,icon:'⬇️'},
  {id:'suroeste',label:'Suroeste',north:-.707,east:-.707,icon:'↙️'},
  {id:'oeste',label:'Oeste',north:0,east:-1,icon:'⬅️'},
  {id:'noroeste',label:'Noroeste',north:.707,east:-.707,icon:'↖️'}
 ];
 let anchor=null,selected='centro';
 const $=id=>document.getElementById(id);
 const inDR=()=>!(window.WTG_ACTIVE_COUNTRY&&window.WTG_ACTIVE_COUNTRY!=='DO');
 const valid=()=>typeof state!=='undefined'&&inDR()&&
   state.mode!=='pending'&&state.mode!=='demo'&&
   Number.isFinite(state.lat)&&Number.isFinite(state.lon)&&
   !!String(state.city||'').trim();
 function reset(){
   if(!valid()){anchor=null;selected='centro';refresh();return;}
   anchor={lat:state.lat,lon:state.lon,radius:state.radius,
     mode:state.mode,city:state.city,province:state.province};
   selected='centro';
   refresh();
 }
 function refresh(){
   const section=$('wtg-area-discovery'),rail=$('wtg-area-options');
   if(!section||!rail)return;
   section.hidden=!valid();
   if(!valid())return;
   if(!anchor)anchor={lat:state.lat,lon:state.lon,radius:state.radius,
     mode:state.mode,city:state.city,province:state.province};
   const title=$('wtg-area-title'),note=$('wtg-area-status');
   const label=anchor.city==='Cerca de mí'?'tu ubicación':anchor.city;
   if(title)title.textContent='Explora más zonas de '+label;
   const active=sectors.find(x=>x.id===selected)||sectors[0];
   if(note)note.textContent=selected==='centro'
     ?'Elige una dirección para descubrir otros lugares cercanos.'
     :'Mostrando la zona '+active.label.toLowerCase()+' alrededor de '+label+'.';
   const signature=label+'|'+selected;
   if(rail.dataset.signature!==signature){
     rail.dataset.signature=signature;
     rail.innerHTML=sectors.map(x=>'<button type="button" data-area="'+x.id+
       '" aria-pressed="'+(x.id===selected?'true':'false')+'" class="'+
       (x.id===selected?'active':'')+'"><span aria-hidden="true">'+x.icon+'</span>'+
       '<strong>'+x.label+'</strong></button>').join('');
   }
 }
 function choose(id){
   const area=sectors.find(s=>s.id===id);
   if(!area||!valid())return;
   if(!anchor)reset();
   if(!anchor)return;
   const meters=Math.min(11000,Math.max(3500,anchor.radius*.65));
   const longitudeMeters=111195*Math.max(.3,Math.cos(anchor.lat*Math.PI/180));
   state.lat=anchor.lat+area.north*meters/111195;
   state.lon=anchor.lon+area.east*meters/longitudeMeters;
   state.radius=id==='centro'?anchor.radius:Math.min(8500,Math.max(4500,anchor.radius*.68));
   state.mode=id==='centro'?anchor.mode:'sector';
   state.city=anchor.city;state.province=anchor.province;
   state.category='todos';state.search='';state.exploreLimit=80;
   selected=id;
   refresh();
   if(typeof navigate==='function')navigate('inicio');
   if(typeof loadPlaces==='function')void loadPlaces();
 }
 document.addEventListener('click',event=>{
   const btn=event.target.closest?.('#wtg-area-options [data-area]');
   if(btn)choose(btn.dataset.area);
 });
 window.addEventListener('wtg-destination-changed',reset);
 // Geolocation may finish on a fresh login after we initialize.
 window.addEventListener('wtg-location-success',reset);
 window.WTG_AREA_DISCOVERY=Object.freeze({refresh,reset,choose,
   get area(){return selected;}});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',reset,{once:true});
 else reset();
})();
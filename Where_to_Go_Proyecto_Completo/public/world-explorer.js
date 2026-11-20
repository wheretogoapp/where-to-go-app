/* Global discovery selector. No fabricated listings or iconic photos. */
(function(){
'use strict';
const popular='AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');
function init(){
 const world=window.WTG_WORLD;if(!world)return;
 const button=document.getElementById('location-pill'),dialog=document.getElementById('wtg-world-dialog');
 const country=document.getElementById('wtg-world-country'),city=document.getElementById('wtg-world-city');
 const status=document.getElementById('wtg-world-status'),apply=document.getElementById('wtg-world-apply');
 const region=document.getElementById('wtg-world-region'),geoNote=document.getElementById('wtg-world-geography-note');
 const geo=window.WTG_GEOGRAPHY;
 let rdMunicipios=[];
 let selecting=false;
 if(!button||!dialog||!country||!city||!status||!apply)return;
 const lang=()=>document.documentElement.lang||navigator.language||'es';
 const names=()=>new Intl.DisplayNames([lang()],{type:'region'});
 const countries=popular.map(code=>({code,name:names().of(code)})).sort((a,b)=>a.name.localeCompare(b.name,lang()));
 const notice=document.getElementById('wtg-world-notice'),main=document.getElementById('main-content'),empty=document.getElementById('wtg-world-empty');
 function setPilotVisible(show){if(main)main.hidden=!show;if(empty)empty.hidden=show;if(notice)notice.hidden=show;}
 country.replaceChildren(...countries.map(({code,name})=>new Option(name,code)));
 country.value='DO';
 function entriesForCountry(code){
   const base=geo?.cities(code)||[];
   if(code!=='DO')return base;
   const indexed=new Set(base.map(p=>p.region+'\u0000'+p.city));
   const extra=rdMunicipios.filter(p=>p.provincia&&p.municipio&&!indexed.has(p.provincia+'\u0000'+p.municipio))
     .map(p=>({city:p.municipio,region:p.provincia,lat:null,lon:null,adm2_code:p.adm2_code}));
   return [...base,...extra];
 }
 function updateCities(){
   const list=entriesForCountry(country.value);
   const previousRegion=region.value,previousCity=city.value;
   const regions=[...new Set(list.map(p=>p.region).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
   region.replaceChildren(new Option('Todas las regiones',''),...regions.map(x=>new Option(x,x)));
   if(regions.includes(previousRegion))region.value=previousRegion;
   const filtered=list.filter(p=>!region.value||p.region===region.value)
      .sort((a,b)=>a.city.localeCompare(b.city,'es'));
   city.replaceChildren(new Option('Selecciona una ciudad o municipio',''),...filtered.map(p=>new Option(p.city,p.city)));
   if(filtered.some(p=>p.city===previousCity))city.value=previousCity;
   if(geoNote){
     geoNote.textContent=country.value==='DO'
       ? (rdMunicipios.length===158
         ? '32 demarcaciones y 158 municipios disponibles. Elige una provincia y una ciudad para explorar.'
         : '32 demarcaciones disponibles. Se está cargando el índice de los 158 municipios.')
       : list.length?list.length+' ciudades de referencia disponibles.':'Este país todavía no tiene regiones y ciudades precargadas.';
   }
 }
 async function loadDominicanMunicipalities(){
   try{
     const res=await fetch('/data/municipios-rd.json',{cache:'force-cache'});
     if(!res.ok)throw Error('Índice municipal no disponible');
     const rows=await res.json();
     if(!Array.isArray(rows)||rows.length!==158||!rows.every(p=>p.provincia&&p.municipio))throw Error('Índice municipal incompleto');
     rdMunicipios=rows;
     if(country.value==='DO')updateCities();
   }catch(error){console.warn('Where to Go: provincias disponibles; municipios no cargados',String(error))}
 }
 function normalize(value){return String(value||'').toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
 async function geoLocateMunicipality(place){
   if(Number.isFinite(place?.lat)&&Number.isFinite(place?.lon))return {lat:place.lat,lon:place.lon};
   if(!place?.city||!place.region)throw Error('Selecciona una ciudad o una provincia válida.');
   const query=place.city+', '+place.region+', República Dominicana';
   const url='https://nominatim.openstreetmap.org/search?format=json&limit=5&addressdetails=1&countrycodes=do&q='+encodeURIComponent(query);
   const res=await fetch(url,{headers:{'Accept-Language':'es'}});
   if(!res.ok)throw Error('No se pudo comprobar la ubicación del municipio.');
   const candidates=await res.json();
   const match=candidates.find(p=>normalize(p.display_name).includes(normalize(place.region)));
   const lat=Number(match?.lat),lon=Number(match?.lon);
   if(!match||!Number.isFinite(lat)||!Number.isFinite(lon)||lat<17||lat>21||lon< -73||lon> -67)
     throw Error('No pudimos verificar este municipio en su provincia. Prueba otra ciudad o utiliza GPS.');
   return {lat,lon};
 }
 function update(){
   updateCities();
   const code=country.value;
   const available=world.dataStatus({country:code})==='catalogue-available';
   status.textContent=available
    ?'República Dominicana: elige la provincia y luego la ciudad o municipio.'
    :entriesForCountry(code).length
      ?'Selecciona una ciudad para buscar lugares reales con Google Places.'
      :'Este país no tiene todavía un índice de ciudades verificadas. No se mostrarán ubicaciones inventadas.';
   apply.textContent=available?'Explorar destino en República Dominicana':'Explorar destino seleccionado';
 }
 button.addEventListener('click',event=>{event.preventDefault();event.stopImmediatePropagation();dialog.hidden=false;update();country.focus()},true);
 document.getElementById('wtg-world-close').addEventListener('click',()=>dialog.hidden=true);
 country.addEventListener('change',()=>{region.value='';city.value='';update()});
 region.addEventListener('change',updateCities);
 apply.addEventListener('click',async()=>{
   if(selecting)return;
   const code=country.value;
   const list=entriesForCountry(code);
   const selected=list.find(p=>p.city===city.value&&(!region.value||p.region===region.value));
   // Si solamente se eligió provincia, usar explícitamente su cabecera geográfica.
   const provincialHub=code==='DO'&&region.value&&!city.value
     ?(geo?.cities('DO')||[]).find(p=>p.region===region.value):null;
   const place=selected||provincialHub;
   if(!place){status.textContent='Selecciona una provincia y una ciudad para ver lugares cercanos.';return;}
   selecting=true;apply.disabled=true;status.textContent='Comprobando ubicación del destino…';
   try{
     const coords=code==='DO'?await geoLocateMunicipality(place):
       (Number.isFinite(place.lat)&&Number.isFinite(place.lon)?{lat:place.lat,lon:place.lon}:null);
     if(!coords){status.textContent='Esta ciudad todavía no tiene coordenadas comprobadas.';return;}
     const selection=world.location({country:code,region:place.region,city:place.city,lat:coords.lat,lon:coords.lon,language:lang(),source:'manual'});
     selection.countryName=names().of(selection.country);
     try{sessionStorage.setItem('wtg_world_selection',JSON.stringify(selection))}catch{}
     dialog.hidden=true;
     window.dispatchEvent(new CustomEvent('wtg-world-selected',{detail:selection}));
     const label=[selection.city,selection.region].filter(Boolean).join(', ');
     if(code==='DO'){
       window.WTG_ACTIVE_COUNTRY='DO';
       setPilotVisible(true);
       window.dispatchEvent(new CustomEvent('wtg-world-return-pilot',{detail:selection}));
     }else{
       const canQuery=!!window.WTG_GOOGLE_PLACES?.configured();
       setPilotVisible(canQuery);
       if(notice){notice.textContent=canQuery?'Explorando lugares de '+label+' con Google Places.':'Google Places no está configurado; no hay lugares disponibles en '+label+'.';notice.hidden=canQuery;}
       const selectedLabel=document.getElementById('wtg-world-selected');
       if(selectedLabel)selectedLabel.textContent=label;
     }
     const pillLabel=document.getElementById('location-label');
     if(pillLabel)pillLabel.textContent='📍 '+label;
   }catch(error){status.textContent=String(error?.message||'No se pudo seleccionar el destino.');}
   finally{selecting=false;apply.disabled=false;}
 });
 void loadDominicanMunicipalities();
 document.getElementById('wtg-world-change')?.addEventListener('click',()=>button.click());
 document.getElementById('wtg-world-gps')?.addEventListener('click',()=>{dialog.hidden=true;window.dispatchEvent(new Event('wtg-world-request-gps'))});
 try{
   const saved=JSON.parse(sessionStorage.getItem('wtg_world_selection')||'null');
   if(saved?.country && /^[A-Z]{2}$/.test(saved.country) && saved.country!=='DO'){
     saved.countryName=names().of(saved.country);
     country.value=saved.country;updateCities();region.value=saved.region||'';updateCities();city.value=saved.city||'';
     const label=[saved.countryName,saved.city].filter(Boolean).join(' · ');
     const pillLabel=document.getElementById('location-label');if(pillLabel)pillLabel.textContent='📍 '+label;
     setPilotVisible(!!saved.coordinates&&!!window.WTG_GOOGLE_PLACES?.configured());
     if(notice){notice.textContent='Destino seleccionado: '+label+'. '+(saved.coordinates?'Buscando lugares reales disponibles mediante Google Places.':'Selecciona una ciudad para empezar.');notice.hidden=false}
     const selected=document.getElementById('wtg-world-selected');if(selected)selected.textContent=label;
     window.dispatchEvent(new CustomEvent('wtg-world-selected',{detail:saved}));
   }
 }catch{}
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.hidden=true});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')dialog.hidden=true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

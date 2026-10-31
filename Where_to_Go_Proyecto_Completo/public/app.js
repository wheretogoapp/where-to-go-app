/* Where to Go · A dónde ir — Version 2 · datos verificables
   POIs from OpenStreetMap with exact OSM element IDs; no fabricated listings or photos.
   User-submitted businesses and favorites are stored on THIS DEVICE only.
   Payments, authentication and global publishing are NOT enabled in this build. */
'use strict';

const $ = (id) => document.getElementById(id);
const CATEGORIES = [
  {id:'restaurantes',name:'Restaurantes',emoji:'🍽️',color:'#fff0e8',photo:'food',text:'Buena comida'},
  {id:'bares',name:'Bares',emoji:'🍹',color:'#f8e9fc',photo:'night',text:'Buenos tragos'},
  {id:'playas',name:'Playas',emoji:'🏖️',color:'#e5f6fe',photo:'beach',text:'Sol y arena'},
  {id:'piscinas',name:'Piscinas',emoji:'🏊',color:'#e4f4fa',photo:'pool',text:'Date un chapuzón'},
  {id:'hoteles',name:'Hoteles',emoji:'🏨',color:'#fff1df',photo:'hotel',text:'Tu próximo descanso'},
  {id:'resorts',name:'Resorts',emoji:'🌴',color:'#e8f8ef',photo:'hotel',text:'Todo incluido'},
  {id:'villas',name:'Villas',emoji:'🏡',color:'#f0eafd',photo:'hotel',text:'Escapadas privadas'},
  {id:'discotecas',name:'Discotecas',emoji:'🪩',color:'#eeeaff',photo:'night',text:'Vida nocturna'},
  {id:'parques',name:'Parques',emoji:'🌳',color:'#eaf7e5',photo:'nature',text:'Aire libre'},
  {id:'entretenimiento',name:'Entretenimiento',emoji:'🎡',color:'#fff1ea',photo:'attraction',text:'Haz algo diferente'},
  {id:'cafes',name:'Cafeterías',emoji:'☕',color:'#f7efea',photo:'food',text:'Un buen café'},
  {id:'taxis',name:'Taxis y transporte',emoji:'🚘',color:'#f3e8d9',photo:'attraction',text:'Viaja seguro'},
  {id:'atracciones',name:'Atracciones',emoji:'📸',color:'#e7f1ff',photo:'attraction',text:'Lugares icónicos'}
];
const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map(x=>[x.id,x]));
// Selected quick-access places. Locality centers are browsing centers only, never place directions.
const CITIES = [
  {name:'Puerto Plata',region:'República Dominicana',country:'RD',lat:19.7934,lon:-70.6884,emoji:'🏝️'},
  {name:'Santo Domingo de Guzmán',region:'República Dominicana',country:'RD',lat:18.4861,lon:-69.9312,emoji:'🏛️'},
  {name:'Santiago de los Caballeros',region:'República Dominicana',country:'RD',lat:19.4517,lon:-70.6970,emoji:'🌇'},
  {name:'Sosúa',region:'República Dominicana',country:'RD',lat:19.7683,lon:-70.5199,emoji:'🏖️'},
  {name:'La Romana',region:'República Dominicana',country:'RD',lat:18.4273,lon:-68.9728,emoji:'🌴'}
];
const PROVINCES = ['Azua','Baoruco','Barahona','Dajabón','Distrito Nacional','Duarte','El Seibo','Elías Piña','Espaillat','Hato Mayor','Hermanas Mirabal','Independencia','La Altagracia','La Romana','La Vega','María Trinidad Sánchez','Monseñor Nouel','Monte Cristi','Monte Plata','Pedernales','Peravia','Puerto Plata','Samaná','San Cristóbal','San José de Ocoa','San Juan','San Pedro de Macorís','Sánchez Ramírez','Santiago','Santiago Rodríguez','Santo Domingo','Valverde'];
// Territorial catalog from ONE's published 158-municipality index. Bundled for reliable offline selector.
// 'local-*' codes are UI-only keys, never shown as official municipality identifiers.
// A hosted ONE index can refresh real administrative codes when its public endpoint is reachable.
const MUNICIPAL_SOURCE=[
 '/data/municipios-rd.json',
 'https://raw.githubusercontent.com/mnakagaw/ONE-TuMunicipioEnCifras-WEB/main/public/data/municipios_index.json',
 'https://cdn.jsdelivr.net/gh/mnakagaw/ONE-TuMunicipioEnCifras-WEB@main/public/data/municipios_index.json'
];
let municipalities=[];
const VERIFIED_OSM_IMAGES={'osm-way-254282388':{photo:'https://commons.wikimedia.org/wiki/Special:FilePath/Fortaleza_de_San_Felipe_DR_2.jpg?width=700',attribution:'CareAhLine · CC0 · Wikimedia Commons',source:'https://commons.wikimedia.org/wiki/File:Fortaleza_de_San_Felipe_DR_2.jpg'}};
const GOOGLE_BRAND='<a class="google-credit" href="https://maps.google.com" target="_blank" rel="noopener"><img src="https://www.gstatic.com/images/branding/product/1x/maps_48dp.png" width="16" height="16" alt="Google Maps" /> Google Maps</a>';
const state = {
  view:'inicio', lat:CITIES[0].lat, lon:CITIES[0].lon, city:'Puerto Plata', region:'República Dominicana',
  mode:'city', places:[], dataMode:'loading', dataError:'', category:'todos', radius:12000, search:'', googleEnabled:false,province:'Puerto Plata', placesProvider:'osm',
  favorites:loadJSON('wtg_favorites',[]), favoritePlaces:loadJSON('wtg_favorite_places',[]), businesses:loadJSON('wtg_businesses',[]),
  map:null, markers:[], loadingId:0, modal:null, toastTimeout:null
};
function loadJSON(key,def){try{const v=JSON.parse(localStorage.getItem(key));return Array.isArray(v)?v:def}catch{return def}}
function saveJSON(key,data){try{localStorage.setItem(key,JSON.stringify(data));return true}catch{toast('No se pudo guardar en este dispositivo.');return false}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function haversine(lat1,lon1,lat2,lon2){const r=Math.PI/180, a=Math.sin((lat2-lat1)*r/2)**2+Math.cos(lat1*r)*Math.cos(lat2*r)*Math.sin((lon2-lon1)*r/2)**2;return 6371000*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))}
function distance(m){return Number.isFinite(m)?m<1000?`${Math.round(m)} m`:`${(m/1000).toFixed(1).replace('.0','')} km`:'—'}
function catInfo(id){return CATEGORY_BY_ID[id]||CATEGORY_BY_ID.atracciones}
function normalizedPhone(s){return String(s||'').replace(/[^+\d]/g,'')}
function safeUrl(s){try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return''}}
function placePhotoMarkup(p, kind='card'){
  const src=safeUrl(p.photo||'');
  const classes=kind==='card'?'photo-illustration actual-photo':'photo-illustration actual-photo';
  // Only place-linked image tags, Wikidata P18, or photos from the exact Google place id.
  return src ? `<img class="${classes}" loading="lazy" src="${esc(src)}" alt="Fotografía asociada a ${esc(p.name)}" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'photo-empty',textContent:'📷 Foto no disponible'}))" />` : `<div class="photo-empty"><span>📷</span><span>Foto no disponible</span></div>`;
}
function photoFromTags(tags){
  const raw=String(tags.image||tags['image:0']||'');
  if(raw.startsWith('File:'))return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(raw.slice(5))}?width=700`;
  const url=safeUrl(raw);
  if(url && /^https:\/\/(commons\.wikimedia\.org|upload\.wikimedia\.org)\//.test(url))return url;
  const cc=String(tags.wikimedia_commons||'');
  if(cc.startsWith('File:'))return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(cc.slice(5).replaceAll('_',' '))}?width=700`;
  return '';
}
async function fillWikidataPhoto(p){
  if(p.photo||p.photoChecked||!/^Q[0-9]+$/.test(p.tags?.wikidata||''))return;
  p.photoChecked=true;
  try{
    const url=`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${p.tags.wikidata}&props=claims&format=json&origin=*`;
    const r=await fetch(url);if(!r.ok)return;
    const d=await r.json(), claim=d.entities?.[p.tags.wikidata]?.claims?.P18?.[0];
    const filename=claim?.mainsnak?.datavalue?.value;
    if(typeof filename==='string'&&filename)p.photo=`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=700`;
  }catch{/* No photo is better than a wrong photo. */}
}
async function enrichPhotoCards(){
  const arr=state.places.filter(p=>!p.photo&&!p.photoChecked&&p.tags?.wikidata).slice(0,12);
  await Promise.allSettled(arr.map(fillWikidataPhoto));
  // State may have changed while fetching.
  renderHome();renderExplore();if(state.modal==='place-modal'){/* Do not replace a user's currently open details. */}
}
function sortByDistance(arr){return arr.sort((a,b)=>a.distance-b.distance||a.name.localeCompare(b.name,'es'))}
function classify(tags){const a=tags.amenity, t=tags.tourism,l=tags.leisure,n=tags.natural,h=tags.historic;
  if(a==='taxi'||tags['taxi'] === 'yes'||tags['office']==='transport')return 'taxis';
  if(a==='restaurant'||a==='fast_food'||a==='food_court')return 'restaurantes';
  if(a==='cafe'||a==='ice_cream')return 'cafes';
  if(a==='bar'||a==='pub'||a==='biergarten')return 'bares';
  if(a==='nightclub')return 'discotecas';
  if(n==='beach'||l==='beach'||l==='beach_resort')return 'playas';
  if(l==='swimming_pool')return 'piscinas';
  if(t==='resort'||l==='resort')return 'resorts';
  if(t==='villa'||tags.building==='villa')return 'villas';
  if(t==='hotel'||t==='hostel'||t==='guest_house'||t==='motel'||t==='apartment')return 'hoteles';
  if(l==='park'||l==='garden'||l==='nature_reserve')return 'parques';
  if(a==='cinema'||a==='theatre'||l==='water_park'||l==='amusement_arcade'||t==='theme_park'||l==='theme_park')return 'entretenimiento';
  if(t==='attraction'||t==='viewpoint'||t==='museum'||h)return 'atracciones';
  return null;
}
function parseOSM(elements){const seen=new Set(),arr=[];
  for(const el of elements){const tags=el.tags||{},cat=classify(tags),name=tags['name:es']||tags.name;if(!cat||!name)continue;
    const lat=el.lat??el.center?.lat,lon=el.lon??el.center?.lon;if(!Number.isFinite(lat)||!Number.isFinite(lon))continue;
    const dist=haversine(state.lat,state.lon,lat,lon),placeKey=`${el.type}-${el.id}`;
    if(seen.has(placeKey))continue;seen.add(placeKey);
    const known=VERIFIED_OSM_IMAGES[`osm-${el.type}-${el.id}`];
    arr.push({id:`osm-${el.type}-${el.id}`,name,cat,lat,lon,distance:dist,source:'osm',photoAttribution:known?.attribution||'',photoSource:known?.source||'',website:tags.website||tags['contact:website']||'',phone:tags['contact:phone']||tags.phone||'',address:[tags['addr:street'],tags['addr:housenumber']].filter(Boolean).join(' ')||tags['addr:city']||'',description:tags.description||'',photo:known?.photo||photoFromTags(tags),tags});
  }
  return sortByDistance(arr);
}
function overpassQuery(lat,lon,radius){const around=`(around:${radius},${lat.toFixed(5)},${lon.toFixed(5)})`;
  return `[out:json][timeout:22];(nwr${around}["amenity"~"^(restaurant|fast_food|food_court|cafe|ice_cream|bar|pub|biergarten|nightclub|cinema|theatre|taxi)$"]["name"];nwr${around}["tourism"~"^(hotel|hostel|guest_house|motel|apartment|resort|villa|attraction|viewpoint|museum|theme_park)$"]["name"];nwr${around}["leisure"~"^(park|garden|nature_reserve|swimming_pool|water_park|beach_resort|beach|theme_park|resort)$"]["name"];nwr${around}["natural"="beach"]["name"];nwr${around}["historic"]["name"];);out center 750;`;
}
async function overpassFetch(query,endpoint){const ctrl=new AbortController(),t=setTimeout(()=>ctrl.abort(),17000);try{const body=new URLSearchParams({data:query});const res=await fetch(endpoint,{method:'POST',body,signal:ctrl.signal,headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'}});if(!res.ok)throw new Error(`Proveedor respondió ${res.status}`);const data=await res.json();if(!Array.isArray(data.elements))throw Error('Respuesta no válida');return data.elements;}finally{clearTimeout(t)}}
// Optional Google Places data. Enabled only after Netlify Functions + GOOGLE_MAPS_API_KEY are configured.
async function checkGoogleProvider(){
  try{const r=await fetch('/.netlify/functions/provider-status',{cache:'no-store'});if(!r.ok)return;
    const d=await r.json();if(d.googlePlacesEnabled){state.googleEnabled=true;state.placesProvider='google';loadPlaces(true)}
  }catch{/* Static Netlify Drop deployment continues with real OpenStreetMap data. */}
}
const GOOGLE_CATS={taxi_service:'taxis',taxi_stand:'taxis',chauffeur_service:'taxis',restaurant:'restaurantes',bar:'bares',pub:'bares',night_club:'discotecas',nightclub:'discotecas',cafe:'cafes',coffee_shop:'cafes',hotel:'hoteles',lodging:'hoteles',resort_hotel:'resorts',tourist_attraction:'atracciones',museum:'atracciones',park:'parques',national_park:'parques',amusement_park:'entretenimiento',movie_theater:'entretenimiento',swimming_pool:'piscinas',beach:'playas'};
function googleCategory(row,chosen){if(chosen!=='todos')return chosen;return GOOGLE_CATS[row.primaryType]||row.types?.map(x=>GOOGLE_CATS[x]).find(Boolean)||'atracciones'}
async function loadGooglePlaces(force=false){
  const id=++state.loadingId, lat=state.lat,lon=state.lon,radius=state.radius,category=state.category;
  state.dataMode='loading';state.dataError='';renderAll();
  const params=new URLSearchParams({lat:String(lat),lon:String(lon),radius:String(radius),category,city:`${state.city}, ${state.region}`});
  if(state.search)params.set('search',state.search);
  try{
    const r=await fetch('/.netlify/functions/google-search?'+params,{cache:'no-store'}),data=await r.json();
    if(id!==state.loadingId)return;
    if(!r.ok)throw Error(data.error||'Google Places no disponible');
    state.places=(data.places||[]).map(p=>({id:'google-'+p.id,googleId:p.id,name:p.name,cat:googleCategory(p,category),lat:p.lat,lon:p.lon,distance:haversine(lat,lon,p.lat,p.lon),address:p.address,source:'google',photo:p.photoName?`/.netlify/functions/google-photo?name=${encodeURIComponent(p.photoName)}`:'',photoAttributions:p.photoAttributions||[],website:'',phone:'',description:'Información de Google Maps. Los datos y fotografías pertenecen a la ficha de este lugar.',googleUri:p.mapsUri,googleDirections:p.directionsUri,detailsLoaded:false,tags:{}}));
    state.placesProvider='google';state.dataMode='live';renderAll();
  }catch(e){if(id!==state.loadingId)return;state.dataMode='error';state.dataError=e.message;state.places=[];renderAll();toast('Google Places: '+e.message)}
}
async function getGoogleDetails(p){
 if(p.detailsLoaded)return;
 p.detailsLoaded=true;
 try{const r=await fetch('/.netlify/functions/google-detail?id='+encodeURIComponent(p.googleId),{cache:'no-store'});if(!r.ok)return;
  const d=await r.json();p.phone=d.phone||'';p.website=d.website||'';p.googleUri=d.mapsUri||p.googleUri;p.googleDirections=d.directionsUri||p.googleDirections;
  if(!p.photo&&d.photoName){p.photo='/.netlify/functions/google-photo?name='+encodeURIComponent(d.photoName);p.photoAttributions=d.photoAttributions||[]}
 }catch{}
}
function googleAttribution(p){
 return p.source==='google'&&p.photoAttributions?.length?`<small class="photo-authors">Foto: ${p.photoAttributions.map(a=>a.uri?`<a href="${esc(safeUrl(a.uri))}" target="_blank" rel="noopener">${esc(a.displayName||'Autor')}</a>`:esc(a.displayName||'Autor')).join(', ')}</small>`:'';
}
async function loadPlaces(force=false){if(state.googleEnabled)return loadGooglePlaces(force);const id=++state.loadingId,lat=state.lat,lon=state.lon,radius=state.radius;
  state.dataMode='loading';state.dataError='';renderAll();
  const key=`wtg_osm_${lat.toFixed(3)}_${lon.toFixed(3)}_${radius}`;
  if(!force){try{const cached=JSON.parse(sessionStorage.getItem(key)||'null');if(cached&&Date.now()-cached.time<20*60*1000){state.places=parseOSM(cached.elements);state.placesProvider='osm';state.dataMode='live';renderAll();enrichPhotoCards();return}}catch{}}
  const query=overpassQuery(lat,lon,radius);let err='';
  for(const endpoint of ['https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter']){
    try{const elements=await overpassFetch(query,endpoint);if(id!==state.loadingId)return;
      state.places=parseOSM(elements);state.placesProvider='osm';state.dataMode='live';try{sessionStorage.setItem(key,JSON.stringify({time:Date.now(),elements}))}catch{}
      renderAll();enrichPhotoCards();return;
    }catch(e){err=String(e.message||e);if(id!==state.loadingId)return;}
  }
  if(id!==state.loadingId)return;
  state.dataMode='error';state.dataError=err;state.placesProvider='osm';state.places=[];
  renderAll();

}
function viewTitle(id){return {inicio:'Inicio',explorar:'Explorar lugares',mapa:'Mapa interactivo',favoritos:'Mis favoritos',promocionar:'Promocionar', 'mis-negocios':'Mis negocios',taxis:'Taxis y transporte'}[id]||'Inicio'}
function navigate(view){if(!$("view-"+view))view='inicio';state.view=view;document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id===`view-${view}`));document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===view));$('current-page-label').textContent=viewTitle(view);if(view==='taxis')renderTaxis();if(view==='explorar')renderExplore();if(view==='favoritos')renderFavorites();if(view==='mis-negocios')renderMyBusinesses();if(view==='mapa')setTimeout(renderMap,100);window.scrollTo({top:0,behavior:'instant'});try{history.replaceState(null,'',`#${view}`)}catch{}}
function renderCategories(){const counts={};state.places.forEach(p=>{counts[p.cat]=(counts[p.cat]||0)+1});$('home-categories').innerHTML=CATEGORIES.map(c=>`<button class="category-card" data-cat="${c.id}"><span class="category-emoji" style="--category-color:${c.color}">${c.emoji}</span><strong>${c.name}</strong><small>${state.googleEnabled?'Descubrir':state.dataMode==='live'?(counts[c.id]||0)+' lugares':c.text}</small></button>`).join('');
  $('filter-categories').innerHTML=[{id:'todos',name:'Todo',emoji:'✨'},...CATEGORIES].map(c=>`<button class="filter-chip ${state.category===c.id?'active':''}" data-filter="${c.id}">${c.emoji} ${c.name}</button>`).join('');
  $('business-category').innerHTML=CATEGORIES.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
}
function placeCard(p){const c=catInfo(p.cat),fav=state.favorites.includes(p.id);const provenance=p.source==='google'?GOOGLE_BRAND:'© OpenStreetMap';return `<article class="place-card"><div class="place-photo">${placePhotoMarkup(p)}<span class="card-tag">${c.emoji} ${esc(c.name)}</span><button class="fav-button ${fav?'active':''}" data-fav="${esc(p.id)}" aria-label="${fav?'Quitar de favoritos':'Agregar a favoritos'}">${fav?'♥':'♡'}</button>${p.photo?'<span class="card-image-caption">Foto vinculada al lugar</span>':''}</div><div class="place-body"><button class="place-title" data-place="${esc(p.id)}">${esc(p.name)}</button><div class="place-meta"><span>⌖</span><b>${esc(p.address||'Dirección no publicada')}</b></div><div class="place-footer"><span class="distance-badge">↗ ${distance(p.distance)}</span><button class="card-open" data-place="${esc(p.id)}">Ver detalles →</button></div><small class="source-credit">${provenance}</small>${googleAttribution(p)}${p.photoAttribution?`<small class="photo-authors"><a href="${esc(p.photoSource)}" target="_blank" rel="noopener">Foto: ${esc(p.photoAttribution)}</a></small>`:''}</div></article>`}
function emptyBlock(msg,action='Cambiar ubicación',target='location'){const categoryLabel=state.category==='todos'?'sitios de interés':(catInfo(state.category)?.name||'lugares');const mapsUrl='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(categoryLabel+' en '+state.city+', República Dominicana');return `<div class="empty-state"><span class="empty-emoji">🧭</span><h3>${msg}</h3><p>${state.dataMode==='error'?'No se pudo conectar con el catálogo en vivo. No mostraremos lugares inventados; intenta de nuevo.':'Prueba otra categoría, aumenta la distancia o selecciona otro municipio. Un lugar no verificado no aparece como si fuera real.'}</p><button data-empty="${target}">${action} →</button><a class="empty-external" href="${esc(mapsUrl)}" target="_blank" rel="noopener">Consultar lugares reales en Google Maps ↗</a></div>`}
function renderHome(){const teaser=document.querySelector('.taxi-teaser');if(teaser)teaser.hidden=!(state.province==='Puerto Plata'||state.city==='Puerto Plata'||state.city==='Sosúa');const list=$('home-list');$('home-count').textContent=state.dataMode==='loading'?'...':state.places.filter(p=>p.distance<=state.radius+100).length;const sorted=state.places.filter(p=>p.distance<=state.radius+100).slice(0,6);
  list.innerHTML=state.dataMode==='loading'?'<div class="loading-state"><span class="spinner"></span><div>Buscando lugares reales cerca de ti...</div></div>':sorted.length?sorted.map(placeCard).join(''):emptyBlock('Tu próxima aventura está por descubrirse');
  const alert=$('location-alert'),title=$('location-alert-title'),desc=$('location-alert-desc'),btn=$('alert-locate');
  if(state.dataMode==='error'){alert.style.background='#fff6e9';alert.style.borderColor='#f1e0c7';title.textContent='Catálogo temporalmente no disponible';desc.textContent='No se cargaron fichas de muestra ni coordenadas estimadas. Reintenta la consulta.';btn.innerHTML='Reintentar ↻';btn.dataset.action='retry';}
  else if(state.mode==='gps'){alert.style.background='#e9f7f4';alert.style.borderColor='#d8efea';title.textContent='Ubicación actual activada';desc.textContent=`Mostrando lugares cerca de tus coordenadas · ${state.places.length} encontrados`;btn.innerHTML='Cambiar zona →';btn.dataset.action='change';}
  else{alert.style.background='#e9f7f4';alert.style.borderColor='#d8efea';title.textContent=`Explorando ${state.city}`;desc.textContent='Activa tu ubicación para encontrar lugares realmente cercanos.';btn.innerHTML='Usar mi ubicación →';btn.dataset.action='locate';}
}
function matches(p){return (state.category==='todos'||p.cat===state.category)&&(!state.search||`${p.name} ${p.address} ${catInfo(p.cat).name}`.toLocaleLowerCase('es').includes(state.search.toLocaleLowerCase('es')))&&p.distance<=state.radius+100}
function renderExplore(){const arr=state.places.filter(matches);$('explore-count').textContent=state.dataMode==='loading'?'...':arr.length;
  $('explore-context').textContent=state.dataMode==='live'?`Datos en vivo · ${state.city} · hasta ${distance(state.radius)}`:state.dataMode==='error'?'Error consultando datos reales':`Buscando cerca de ${state.city}...`;
  $('explore-list').innerHTML=state.dataMode==='loading'?'<div class="loading-state"><span class="spinner"></span><div>Consultando lugares cercanos...</div></div>':arr.length?arr.map(placeCard).join(''):emptyBlock('No encontramos lugares con esos filtros', 'Ampliar búsqueda','radius');
  $('filter-categories').querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter===state.category));$('distance-select').value=String(state.radius);if($('search-input').value!==state.search)$('search-input').value=state.search;
}
function renderFavorites(){const arr=state.favoritePlaces.map(p=>({...p,distance:haversine(state.lat,state.lon,p.lat,p.lon)}));$('favorite-list').innerHTML=arr.length?arr.map(placeCard).join(''):`<div class="empty-state"><span class="empty-emoji">💚</span><h3>¡Aquí comienza tu lista!</h3><p>Cuando encuentres un lugar especial, toca el corazón para guardarlo. Los favoritos se guardan en este dispositivo.</p><button data-empty="explore">Explorar lugares →</button></div>`}
function toggleFavorite(id){const p=state.places.find(x=>x.id===id)||state.favoritePlaces.find(x=>x.id===id);if(!p)return;const has=state.favorites.includes(id);state.favorites=has?state.favorites.filter(x=>x!==id):[...state.favorites,id];state.favoritePlaces=has?state.favoritePlaces.filter(x=>x.id!==id):[...state.favoritePlaces,p];saveJSON('wtg_favorites',state.favorites);saveJSON('wtg_favorite_places',state.favoritePlaces);toast(has?'Eliminado de favoritos':'Guardado en tus favoritos ♥');renderAll();}
function renderAll(){renderCategories();renderHome();renderExplore();renderFavorites();if(state.view==='mapa')renderMap();renderTaxis();$('location-label').textContent=state.mode==='gps'&&state.city==='Cerca de mí'?'Cerca de mí':`${state.city}, ${state.region==='República Dominicana'?'RD':state.region}`}
function openPlace(id){const p=state.places.find(x=>x.id===id)||state.favoritePlaces.find(x=>x.id===id);if(!p)return;
  const c=catInfo(p.cat),fav=state.favorites.includes(id),website=safeUrl(p.website),phone=normalizedPhone(p.phone);
  const osmMap=`https://www.openstreetmap.org/?mlat=${encodeURIComponent(p.lat)}&mlon=${encodeURIComponent(p.lon)}#map=18/${p.lat}/${p.lon}`;
  // Google Maps will route by Google Place ID if available; otherwise by the exact OSM mapped point.
  const directions=p.googleDirections||`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(p.lat+','+p.lon)}&travelmode=driving`;
  const prov=p.source==='google'?GOOGLE_BRAND:'© OpenStreetMap contributors';
  $('place-modal-body').innerHTML=`<div class="detail-cover">${placePhotoMarkup(p,'detail')}${p.photo?'<span>Imagen vinculada a esta ficha</span>':''}</div><div class="detail-content"><span class="detail-cat">${c.emoji} ${esc(c.name)}</span><h2 id="place-modal-title">${esc(p.name)}</h2><p class="detail-location">⌖ ${esc(p.address||'Dirección no publicada')} · ${distance(p.distance)} desde el centro de búsqueda</p><p class="detail-description">${esc(p.description||'Esta ficha se obtuvo de un proveedor de lugares reales. Confirma datos importantes antes de visitar.')}</p><div class="detail-facts"><div>🗺️ Fuente: ${prov}</div><div>📍 Punto registrado: ${p.lat.toFixed(6)}, ${p.lon.toFixed(6)}</div>${googleAttribution(p)}<div>📞 ${phone?esc(p.phone):'Teléfono no disponible en la fuente'}</div>${p.tags?.opening_hours?`<div>🕒 Horario registrado: ${esc(p.tags.opening_hours)}</div>`:''}${p.source==='osm'?'<div>ℹ️ Las vías y áreas extensas pueden tener un punto geométrico central y no su entrada. Confirma el acceso en el mapa.</div>':''}</div><div class="detail-actions"><a class="primary" target="_blank" rel="noopener" href="${esc(directions)}">📍 Cómo llegar ↗</a><button data-fav="${esc(id)}">${fav?'♥ Quitar favorito':'♡ Guardar lugar'}</button>${website?`<a href="${esc(website)}" target="_blank" rel="noopener">🌐 Sitio web ↗</a>`:''}${phone?`<a href="tel:${esc(phone)}">📞 Llamar</a>`:''}${p.source==='google'?`<a target="_blank" rel="noopener" href="${esc(p.googleUri||directions)}">Ver ficha en Google Maps ↗</a>`:`<a class="full-line" target="_blank" rel="noopener" href="${esc(osmMap)}">Ver ficha en OpenStreetMap ↗</a>`}</div></div>`;
  openModal('place-modal');
  if(p.source==='google'&&!p.detailsLoaded){getGoogleDetails(p).then(()=>{if(state.modal==='place-modal'&&$('place-modal-title')?.textContent===p.name)openPlace(id)})}
  else if(!p.photo&&!p.photoChecked&&p.tags?.wikidata){fillWikidataPhoto(p).then(()=>{if(state.modal==='place-modal'&&$('place-modal-title')?.textContent===p.name)openPlace(id)})}
}
function openModal(id){closeModals();$(id).hidden=false;$('overlay').hidden=false;state.modal=id;document.body.style.overflow='hidden';const focused=$(id).querySelector('button:not([disabled])');focused?.focus({preventScroll:true})}
function closeModals(){for(const id of ['place-modal','location-modal','register-modal'])$(id).hidden=true;$('overlay').hidden=true;state.modal=null;document.body.style.overflow=''}
function openRegister(plan='destacado'){$('register-form').reset();$('business-city').value=state.mode==='gps'?'':state.city;$('business-plan').value=plan;openModal('register-modal')}
function renderCities(){
  $('city-options').innerHTML=CITIES.map(c=>`<button class="city-btn" data-city="${esc(c.name)}"><span>${c.emoji}</span><div>${esc(c.name)}<small>${esc(c.region)}</small></div></button>`).join('');
  $('province-select').innerHTML='<option value="">Selecciona provincia o Distrito Nacional</option>'+PROVINCES.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join('');
}
function selectCity(name){const c=CITIES.find(x=>x.name===name);if(!c)return;state.city=c.name;state.province=c.name==='Puerto Plata'||c.name==='Sosúa'?'Puerto Plata':c.name==='La Romana'?'La Romana':c.name==='Santiago de los Caballeros'?'Santiago':c.name==='Santo Domingo de Guzmán'?'Distrito Nacional':'';state.region=c.region;state.lat=c.lat;state.lon=c.lon;state.mode='city';state.category='todos';state.search='';closeModals();toast(`Explorando ${c.name} 🌎`);loadPlaces();}
function loadCachedMunicipalities(){try{const v=JSON.parse(localStorage.getItem('wtg_municipalities_v2')||'null');return Array.isArray(v)&&v.length===158?v:[]}catch{return[]}}
async function loadMunicipalities(){
  municipalities=loadCachedMunicipalities();if(municipalities.length){updateTaxiMunicipios();refreshMunicipalitySelect();return}
  for(const link of MUNICIPAL_SOURCE){
    try{const r=await fetch(link,{cache:'force-cache'});if(!r.ok)throw Error('Sin conexión');const list=await r.json();
      if(!Array.isArray(list)||list.length!==158||!list.every(x=>x.provincia&&x.municipio&&x.adm2_code))throw Error('Índice territorial incompleto');
      municipalities=list;updateTaxiMunicipios();
      try{localStorage.setItem('wtg_municipalities_v2',JSON.stringify(list))}catch{}
      refreshMunicipalitySelect();return;
    }catch{} 
  }
  $('municipal-status').textContent='No fue posible obtener los 158 municipios. Verifica la conexión y reintenta.';
  $('municipal-retry').hidden=false;
}
function refreshMunicipalitySelect(){
  const p=$('province-select').value,mun=$('municipality-select');
  const options=municipalities.filter(x=>x.provincia===p).sort((a,b)=>a.municipio.localeCompare(b.municipio,'es'));
  mun.disabled=!p||!options.length;
  mun.innerHTML='<option value="">'+(p?'Selecciona municipio':'Primero elige una provincia')+'</option>'+options.map(x=>`<option value="${esc(x.adm2_code)}">${esc(x.municipio)}</option>`).join('');
  $('municipal-status').textContent=municipalities.length===158?`31 provincias + Distrito Nacional · 158 municipios en el catálogo territorial. ${p?options.length+' en '+p+'.':''}`:'Cargando el índice oficial de municipios...';
  $('municipality-go').disabled=!mun.value;
}
async function selectMunicipality(){
  const selected=municipalities.find(x=>x.adm2_code===$('municipality-select').value);
  if(!selected)return toast('Selecciona una provincia y un municipio.');
  const btn=$('municipality-go');btn.disabled=true;btn.textContent='Buscando ubicación…';
  try{
    const search=`${selected.municipio}, ${selected.provincia}, República Dominicana`;
    const url=`https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=do&addressdetails=1&q=${encodeURIComponent(search)}`;
    let r=await fetch(url,{headers:{'Accept-Language':'es'}});
    if(!r.ok)throw Error('Servicio de geocodificación no disponible');
    let records=await r.json();
    if(!records.length){const fallback=`https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=do&q=${encodeURIComponent(selected.municipio+', República Dominicana')}`;r=await fetch(fallback);records=await r.json()}
    const match=records.find(x=>String(x.display_name||'').toLocaleLowerCase('es').includes(selected.provincia.toLocaleLowerCase('es')))||records[0];
    if(!match)throw Error('No hay coordenadas verificadas para este municipio. Prueba otro o usa GPS.');
    const lat=Number(match.lat),lon=Number(match.lon);
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<17||lat>21||lon< -73||lon> -67)throw Error('Coordenadas fuera de República Dominicana');
    state.lat=lat;state.lon=lon;state.city=selected.municipio;state.province=selected.provincia;state.region=selected.provincia+' · RD';state.mode='municipio';state.category='todos';state.search='';closeModals();toast(`Explorando ${selected.municipio}, ${selected.provincia}`);loadPlaces();
  }catch(e){toast(e.message||'No fue posible localizar el municipio.');$('municipal-status').textContent='No se cambió de ciudad: ubicación sin verificar.'}
  finally{btn.disabled=false;btn.textContent='Explorar este municipio →'}
}
// Resolve the city for the GPS coordinates. This is called ONLY after a real
// device-location permission has been granted (never for manually selected cities).
async function resolveCurrentCity(lat,lon){
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),7000);
  try{
    const url=`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lon)}&localityLanguage=es`;
    const res=await fetch(url,{signal:ctrl.signal});if(!res.ok)return;
    const data=await res.json();
    if(state.mode!=='gps'||state.lat!==lat||state.lon!==lon)return;
    const city=String(data.city||data.locality||data.principalSubdivision||'').trim();
    const country=String(data.countryName||'').trim();
    if(city){state.city=city;state.province=String(data.principalSubdivision||'').trim();state.region=state.province?(state.province+' · '+(data.countryCode||'RD')):country||'Ubicación actual';renderAll()}
  }catch{/* Live GPS searching still works without reverse geocoding. */}
  finally{clearTimeout(timer)}
}
function requestLocation(){if(!window.isSecureContext){toast('La ubicación requiere HTTPS. Abre la URL segura de Netlify, no un archivo local.');openModal('location-modal');return;}if(!('geolocation' in navigator)){toast('Este navegador no admite ubicación. Elige un municipio.');openModal('location-modal');return;}
  toast('Solicitando permiso para usar tu ubicación...');navigator.geolocation.getCurrentPosition(pos=>{
    state.lat=pos.coords.latitude;state.lon=pos.coords.longitude;state.mode='gps';state.city='Cerca de mí';state.province='';state.region='Ubicación actual';state.category='todos';state.search='';closeModals();toast('¡Ubicación detectada! Buscando lugares cercanos.');loadPlaces();resolveCurrentCity(state.lat,state.lon);
  },e=>{const msg=e.code===1?'Ubicación bloqueada. Abre el candado de la URL, permite ubicación y reintenta; o elige municipio.':e.code===2?'El dispositivo no pudo localizarte. Activa GPS/Wi-Fi o elige municipio.':'Tiempo de GPS agotado. Inténtalo de nuevo o selecciona un municipio.';toast(msg);if(!state.modal)openModal('location-modal');},{enableHighAccuracy:false,timeout:14000,maximumAge:120000});
}
function renderMap(){if(state.placesProvider==='google'){renderGoogleMapLinks();return;}$('map-help').textContent='Mapa: © OpenStreetMap contributors · Leaflet. Las coordenadas pueden representar el centro de un área.';const arr=state.places.filter(p=>p.source!=='google'&&(state.category==='todos'||p.cat===state.category));$('map-count').textContent=arr.length;$('map-places').innerHTML=arr.length?arr.slice(0,85).map(p=>`<div class="map-place" role="button" tabindex="0" data-map-place="${esc(p.id)}"><span class="map-emoji">${catInfo(p.cat).emoji}</span><div><strong>${esc(p.name)}</strong><small>${catInfo(p.cat).name} · ${distance(p.distance)}</small></div></div>`).join(''):'<div style="padding:20px;font-size:12px;color:#8aa1ac">Sin lugares cargados. Prueba ampliar la zona.</div>';
  const mapElement=$('world-map');if(typeof window.L==='undefined'){mapElement.innerHTML='<div class="map-fallback"><div><b>🗺️ Mapa no disponible</b>Se requiere conexión a internet para cargar el mapa. Puedes abrir los lugares desde las fichas.</div></div>';return;}
  if(!state.map){mapElement.innerHTML='';state.map=L.map('world-map',{zoomControl:true}).setView([state.lat,state.lon],13);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',maxZoom:19}).addTo(state.map)}
  state.markers.forEach(m=>m.remove());state.markers=[];
  const userMarker=L.circleMarker([state.lat,state.lon],{radius:10,weight:4,color:'#fff',fillColor:'#0a9090',fillOpacity:1}).addTo(state.map).bindPopup(state.mode==='gps'?'Tu ubicación actual':'Centro de búsqueda');state.markers.push(userMarker);
  for(const p of arr.slice(0,130)){const circle=L.circleMarker([p.lat,p.lon],{radius:7,color:'#fff',weight:2,fillColor:categoryColor(p.cat),fillOpacity:.95}).addTo(state.map);circle.bindPopup(`<b>${esc(p.name)}</b><br>${catInfo(p.cat).emoji} ${catInfo(p.cat).name}<br>${distance(p.distance)}`);circle.on('click',()=>{state.selectedMapPlace=p.id});state.markers.push(circle)}
  state.map.setView([state.lat,state.lon],state.radius>12000?11:state.radius>5500?12:13,{animate:false});setTimeout(()=>state.map.invalidateSize(),140);
}
function renderGoogleMapLinks(){
 if(state.map){state.map.remove();state.map=null;state.markers=[]}
 $('map-count').textContent=state.places.length;
 $('map-help').textContent='Google Places · Consulta y navegación mediante Google Maps oficial';
 $('world-map').innerHTML=`<div class="map-fallback google-map-note"><div><strong>🗺️ Vista de Google Maps</strong><p>Para mantener cada ficha asociada a su lugar real, abre el mapa oficial y las indicaciones de Google. Los puntos de Google Places no se dibujan sobre mapas de otros proveedores.</p><a class="btn btn-primary" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(state.city+', República Dominicana')}">Abrir Google Maps ↗</a></div></div>`;
 $('map-places').innerHTML=state.places.map(p=>`<a class="map-place" href="${esc(safeUrl(p.googleUri)||'https://maps.google.com')}" target="_blank" rel="noopener"><span class="map-emoji">${catInfo(p.cat).emoji}</span><div><strong>${esc(p.name)}</strong><small>${distance(p.distance)} · Google Maps ↗</small></div></a>`).join('');
}
function categoryColor(cat){return {restaurantes:'#e88d5b',bares:'#b26bcb',playas:'#2aaacf',piscinas:'#2c9bbc',hoteles:'#dfa05d',resorts:'#349f72',villas:'#8865b3',discotecas:'#9558cb',parques:'#43a16f',entretenimiento:'#ee9b4e',cafes:'#bf8060',atracciones:'#4b91c0'}[cat]||'#087e86'}
function renderMyBusinesses(){const arr=state.businesses;$('my-businesses').innerHTML=arr.length?arr.map((b,i)=>`<article class="business-card"><span class="status">BORRADOR · SOLO ESTE DISPOSITIVO</span><h3>${esc(b.name)}</h3><p>${catInfo(b.category).emoji} ${catInfo(b.category).name} · ${esc(b.city)} · Plan ${b.plan==='premium'?'Premium':'Destacado'} (no activado)</p><p>📍 ${esc(b.address)} · ☎ ${esc(b.phone)}</p>${b.description?`<p>${esc(b.description)}</p>`:''}<button data-remove-business="${i}">Eliminar ficha local</button></article>`).join(''):`<div class="empty-state" style="margin-bottom:20px"><span class="empty-emoji">🏪</span><h3>Todavía no tienes fichas</h3><p>Registra tu negocio para probar cómo sería el proceso. No se publicará ni cobrará.</p><button data-open-register="destacado">Registrar mi negocio →</button></div>`;}
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(state.toastTimeout);state.toastTimeout=setTimeout(()=>el.classList.remove('show'),4200)}

// TRANSPORTE — directorio con contacto verificado del propietario.
// No inventamos ubicación física de operadores sin sede pública confirmada.
const TAXI_OPERATORS=[{
 id:'clemente-transport-vip',name:'Clemente Transport VIP',province:'Puerto Plata',municipalities:'toda-la-provincia',
 description:'Traslados privados y turísticos, aeropuertos POP · STI · SDQ, hoteles, resorts y villas. Atención mediante reserva.',
 phone:'829-586-9111',whatsapp:'https://wa.me/18295869111?text='+encodeURIComponent('Hola, quiero reservar un traslado con Clemente Transport VIP. Vengo de Where to Go.'),
 site:'https://clementetransportvip.netlify.app/',type:'Transporte turístico y privado',featured:true
}];
function ensureTaxiSelectors(){
 const prov=$('taxi-province'),mun=$('taxi-municipality');if(!prov||!mun)return;
 if(prov.options.length<3){prov.innerHTML='<option value="">Todas las provincias</option>'+PROVINCES.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join('');}
 if(!prov.dataset.bound){
   prov.onchange=()=>{updateTaxiMunicipios();renderTaxis()};
   mun.onchange=renderTaxis;prov.dataset.bound='yes';
 }
 if(!prov.dataset.setInitial){prov.value=PROVINCES.includes(state.province)?state.province:'Puerto Plata';prov.dataset.setInitial='yes';updateTaxiMunicipios();}
}
function updateTaxiMunicipios(){
 const prov=$('taxi-province').value, mun=$('taxi-municipality');
 mun.innerHTML='<option value="">Todos los municipios</option>'+municipalities.filter(m=>m.provincia===prov).sort((a,b)=>a.municipio.localeCompare(b.municipio,'es')).map(m=>`<option value="${esc(m.municipio)}">${esc(m.municipio)}</option>`).join('');
 mun.disabled=!prov;
}
function renderTaxis(){
 if(!$('taxi-list'))return;
 ensureTaxiSelectors();const p=$('taxi-province').value, m=$('taxi-municipality').value;
 const results=TAXI_OPERATORS.filter(o=>(!p||o.province===p)&&(!m||o.municipalities==='toda-la-provincia'));
 $('taxi-count').textContent=results.length;
 $('taxi-list').innerHTML=results.length?results.map(o=>`<article class="taxi-feature"><div class="taxi-logo">CT<span>VIP</span></div><div class="taxi-info"><div class="taxi-label">★ OPERADOR DESTACADO · ${esc(o.province.toUpperCase())}</div><h3>${esc(o.name)}</h3><p>${esc(o.description)}</p><div class="taxi-facts"><span>✧ ${esc(o.type)}</span><span>⌖ Servicio en ${esc(o.province)} y traslados nacionales</span><span>☏ ${esc(o.phone)}</span></div><div class="taxi-buttons"><a href="${esc(o.whatsapp)}" target="_blank" rel="noopener" class="btn btn-primary">Reservar por WhatsApp ↗</a><a href="tel:+18295869111" class="outline-btn">Llamar</a><a href="${esc(o.site)}" target="_blank" rel="noopener" class="outline-btn">Sitio web ↗</a></div><div class="taxi-disclaimer">Perfil comercial confirmado por el propietario · No se publica una dirección física sin verificar.</div></div></article>`).join(''):`<div class="taxi-empty"><div class="taxi-empty-icon">🚘</div><h3>Sin operadores verificados en esta selección</h3><p>Estamos incorporando proveedores de transporte por municipio. No mostramos taxis inventados.</p><button class="btn btn-primary" data-view="promocionar">Registrar una empresa ↗</button></div>`;
}
function startup(){renderCities();loadMunicipalities();checkGoogleProvider();renderCategories();const d=new Date();$('today-label').textContent=new Intl.DateTimeFormat('es',{day:'numeric',month:'long',year:'numeric'}).format(d);const startView=location.hash.slice(1);navigate($('view-'+startView)?startView:'inicio');
  document.addEventListener('click',e=>{
    const v=e.target.closest('[data-view]');if(v){navigate(v.dataset.view);return}
    const c=e.target.closest('[data-cat]');if(c){if(c.dataset.cat==='taxis'){navigate('taxis');return}state.category=c.dataset.cat;state.search='';navigate('explorar');if(state.googleEnabled)loadPlaces();return}
    const f=e.target.closest('[data-filter]');if(f){if(f.dataset.filter==='taxis'){navigate('taxis');return}state.category=f.dataset.filter;if(state.googleEnabled)loadPlaces();else renderExplore();return}
    const fav=e.target.closest('[data-fav]');if(fav){toggleFavorite(fav.dataset.fav);if(state.modal==='place-modal')openPlace(fav.dataset.fav);return}
    const place=e.target.closest('[data-place]');if(place){openPlace(place.dataset.place);return}
    const city=e.target.closest('[data-city]');if(city){selectCity(city.dataset.city);return}
    const promo=e.target.closest('[data-open-register],.choose-plan');if(promo){openRegister(promo.dataset.plan||promo.dataset.openRegister);return}
    const rem=e.target.closest('[data-remove-business]');if(rem){if(confirm('¿Quieres eliminar esta ficha de prueba de este dispositivo?')){state.businesses.splice(Number(rem.dataset.removeBusiness),1);saveJSON('wtg_businesses',state.businesses);renderMyBusinesses();toast('Ficha eliminada.')}return}
    const mp=e.target.closest('[data-map-place]');if(mp){const p=state.places.find(x=>x.id===mp.dataset.mapPlace);if(p&&state.map){state.map.setView([p.lat,p.lon],15);state.markers.find(m=>m.getLatLng&&Math.abs(m.getLatLng().lat-p.lat)<.00001&&Math.abs(m.getLatLng().lng-p.lon)<.00001)?.openPopup()}return}
    const empty=e.target.closest('[data-empty]');if(empty){if(empty.dataset.empty==='radius'){$('distance-select').value='30000';state.radius=30000;loadPlaces()}else if(empty.dataset.empty==='explore')navigate('explorar');else openModal('location-modal');return}
    if(e.target.closest('[data-close]')){closeModals();return}
  });
  $('overlay').addEventListener('click',closeModals);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModals();if(e.key==='Enter'&&e.target.matches('[data-map-place]'))e.target.click()});
  $('location-pill').onclick=()=>openModal('location-modal');$('top-refresh').onclick=()=>{toast('Actualizando lugares...');loadPlaces(true)};$('top-business').onclick=()=>navigate('promocionar');$('side-promote').onclick=()=>navigate('promocionar');$('mobile-brand').onclick=()=>navigate('inicio');
  $('hero-explore').onclick=()=>navigate('explorar');$('home-see-all').onclick=()=>navigate('explorar');$('show-all-categories').onclick=()=>navigate('explorar');$('promo-banner-btn').onclick=()=>navigate('promocionar');
  $('alert-locate').onclick=()=>{if($('alert-locate').dataset.action==='retry'){loadPlaces(true)}else if($('alert-locate').dataset.action==='change'){openModal('location-modal')}else requestLocation()};
  $('use-live-location').onclick=requestLocation;$('province-select').onchange=refreshMunicipalitySelect;$('municipality-select').onchange=()=>{$('municipality-go').disabled=!$('municipality-select').value};$('municipality-go').onclick=selectMunicipality;$('municipal-retry').onclick=()=>{ $('municipal-retry').hidden=true;loadMunicipalities()};$('business-cta').onclick=()=>openRegister('destacado');$('home-see-taxis').onclick=()=>navigate('taxis');$('taxi-register').onclick=()=>{openRegister('destacado');$('business-category').value='taxis'};$('add-another-business').onclick=()=>openRegister('destacado');$('explore-map').onclick=()=>navigate('mapa');
  $('recenter-map').onclick=()=>{if(state.map)state.map.setView([state.lat,state.lon],13)};
  $('search-input').addEventListener('input',e=>{state.search=e.target.value.trim();renderExplore()});$('search-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&state.googleEnabled)loadPlaces()});$('clear-search').onclick=()=>{state.search='';$('search-input').value='';renderExplore()};
  $('distance-select').addEventListener('change',e=>{state.radius=Number(e.target.value);loadPlaces()});
  $('register-form').onsubmit=e=>{e.preventDefault();const get=id=>$(id).value.trim();const b={id:`draft-${Date.now()}`,name:get('business-name'),category:get('business-category'),city:get('business-city'),address:get('business-address'),phone:get('business-phone'),plan:get('business-plan'),description:get('business-description'),createdAt:new Date().toISOString()};
    if(!b.name||!b.city||!b.address||!b.phone){toast('Completa los campos obligatorios.');return}state.businesses.unshift(b);saveJSON('wtg_businesses',state.businesses);closeModals();navigate('mis-negocios');renderMyBusinesses();toast('Ficha guardada en este dispositivo. No se ha publicado ni cobrado.');};
  renderAll();loadPlaces();
  // Browser permissions: only auto-locate if prior permission has already been granted.
  // On first visit, users must click 'Usar mi ubicación' themselves.
  if(navigator.permissions&&window.isSecureContext){navigator.permissions.query({name:'geolocation'}).then(s=>{if(s.state==='granted')requestLocation()}).catch(()=>{})}
  if(!window.isSecureContext){toast('Para activar ubicación, entra mediante HTTPS en Netlify.');}
  if('serviceWorker' in navigator&&window.isSecureContext){window.addEventListener('load',()=>navigator.serviceWorker.register('/service-worker.js').catch(()=>{}))}
}
document.addEventListener('DOMContentLoaded',startup);

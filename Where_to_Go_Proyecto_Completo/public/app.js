/* Province-accurate editorial cover. No photo is substituted for a missing image. */
const WTG_HERO_DATA=window.WTG_PROVINCE_HEROES||{};
const WTG_HERO_SRC=window.WTG_HERO_DEFAULT||{};
let wtgProvincePreview='';
function canonicalProvince(raw){let v=String(raw||'').trim().toLocaleLowerCase('es').replace(/^(provincia de |provincia |province of )/,'').replace(/( province| provincia)$/,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  if(v==='santo domingo de guzman')return 'Distrito Nacional';
  const list=Object.keys(WTG_HERO_DATA);
  return list.find(x=>x.toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'')===v)||'';
}
function provinceFromCity(){
  const p=canonicalProvince(state.province);
  if(p)return p;
  const located=municipalities.find(m=>m.municipio.toLocaleLowerCase('es')===String(state.city||'').toLocaleLowerCase('es'));
  return located?located.provincia:(state.mode==='gps'?'':(['Sosúa','Cabarete'].includes(state.city)?'Puerto Plata':['Punta Cana','Bávaro','Verón–Punta Cana'].includes(state.city)?'La Altagracia':''));
}
function updateProvinceHero(forPreview=false){
  const province=forPreview ? wtgProvincePreview : provinceFromCity();
  const data=WTG_HERO_DATA[province];
  const hero=document.querySelector('.hero');if(!hero)return;
  const art=hero.querySelector('.hero-art');const title=hero.querySelector('h2');const subtitle=hero.querySelector('.hero-content p');const place=hero.querySelector('.hero-coordinate span');const credit=document.querySelector('.hero-credit');
  if(!data){
    art.style.backgroundImage='';title.innerHTML=(window.WTG_I18N?.t('Descubre lugares')||'Descubre lugares')+'<br><em>'+(window.WTG_I18N?.t('cerca de ti.')||'cerca de ti.')+'</em>';
    subtitle.textContent='Activa tu ubicación o elige un municipio para explorar tu entorno, sin resultados de zonas lejanas.';
    place.textContent='TU PRÓXIMA AVENTURA';credit.textContent='Elige una provincia para ver su fotografía identificada.';
    return;
  }
  art.style.backgroundImage=`url("${data.photo.replaceAll('"','%22')}")`;
  art.style.backgroundPosition='50% 50%';
  art.style.backgroundColor='#1c3945';
  title.textContent='';title.appendChild(document.createTextNode((window.WTG_I18N?.t('Descubre')||'Descubre') + ' ' + data.province + ': '));
  const em=document.createElement('em');em.textContent=(window.WTG_I18N?.t('tu próxima aventura.')||'tu próxima aventura.');title.append(em);
  subtitle.textContent=window.WTG_I18N?.lang==='es'?data.subtitle:((window.WTG_I18N?.t('Explora los lugares más interesantes de')||'Explora los lugares más interesantes de')+' '+data.province+'.');
  place.textContent=(data.province+' · '+data.landmark).toLocaleUpperCase('es');
  credit.replaceChildren(document.createTextNode('Foto: '+data.landmark+' · '+data.author+' · '+data.license+' · '));
  const link=document.createElement('a');link.href=data.source;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Licencia y archivo original en Wikimedia Commons';credit.append(link);
  const selector=document.getElementById('hero-province');if(selector && document.activeElement!==selector)selector.value=data.province;
  const note=document.getElementById('hero-preview-note');if(note)note.hidden=!forPreview;
}
function createProvinceControls(){
  const row=document.getElementById('province-explorer');if(!row)return;
  const sel=document.getElementById('hero-province');
  sel.replaceChildren(new Option('Elige una provincia…',''),...Object.keys(WTG_HERO_DATA).map(p=>new Option(p,p)));
  sel.value=provinceFromCity()||'Puerto Plata';
  sel.addEventListener('change',()=>{wtgProvincePreview=sel.value;updateProvinceHero(true);window.WTG_EXPERIENCE?.update?.()});
  document.getElementById('hero-choose-municipio').onclick=()=>{
    const p=sel.value;if(!p)return;
    openModal('location-modal');const provinceSelect=document.getElementById('province-select');provinceSelect.value=p;refreshMunicipalitySelect();
    document.getElementById('municipality-select').focus();
  };
  document.getElementById('province-select').addEventListener('change',e=>{
    if(WTG_HERO_DATA[e.target.value]){wtgProvincePreview=e.target.value;updateProvinceHero(true);window.WTG_EXPERIENCE?.update?.()}
  });
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-close]')||e.target.id==='overlay'){
      wtgProvincePreview='';updateProvinceHero();window.WTG_EXPERIENCE?.update?.();
    }
  });
}

/* Where to Go · A dónde ir — Version 4.3 · catálogo local rápido, sin Google Places
   POIs from OpenStreetMap with exact OSM element IDs; no fabricated listings or photos.
   User-submitted businesses and favorites are stored on THIS DEVICE only.
   Payments, authentication and global publishing are NOT enabled in this build. */
'use strict';

const $ = (id) => document.getElementById(id);
const CATEGORIES = [
  {id:'rios',name:'Ríos',emoji:'🏞️',color:'#eaf1f3',photo:'nature',text:'Explora cerca de ti'},
  {id:'balnearios',name:'Balnearios',emoji:'🌊',color:'#eaf1f3',photo:'nature',text:'Explora cerca de ti'},
  {id:'cascadas',name:'Cascadas',emoji:'💦',color:'#eaf1f3',photo:'nature',text:'Explora cerca de ti'},
  {id:'lagunas',name:'Lagunas',emoji:'🛶',color:'#eaf1f3',photo:'nature',text:'Explora cerca de ti'},
  {id:'senderismo',name:'Senderismo',emoji:'🥾',color:'#eaf1f3',photo:'nature',text:'Explora cerca de ti'},
  {id:'playas',name:'Playas',emoji:'🏖️',color:'#eaf1f3',photo:'beach',text:'Explora cerca de ti'},
  {id:'parques',name:'Parques',emoji:'🌳',color:'#eaf1f3',photo:'nature',text:'Explora cerca de ti'},
  {id:'atracciones',name:'Lugares turísticos',emoji:'📸',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'entretenimiento',name:'Entretenimiento',emoji:'🎡',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'infantil',name:'Diversión infantil',emoji:'🧸',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'piscinas',name:'Piscinas',emoji:'🏊',color:'#eaf1f3',photo:'pool',text:'Explora cerca de ti'},
  {id:'restaurantes',name:'Restaurantes',emoji:'🍽️',color:'#eaf1f3',photo:'food',text:'Explora cerca de ti'},
  {id:'bares',name:'Bares',emoji:'🍹',color:'#eaf1f3',photo:'night',text:'Explora cerca de ti'},
  {id:'discotecas',name:'Discotecas',emoji:'🪩',color:'#eaf1f3',photo:'night',text:'Explora cerca de ti'},
  {id:'cafes',name:'Cafeterías',emoji:'☕',color:'#eaf1f3',photo:'food',text:'Explora cerca de ti'},
  {id:'heladerias',name:'Heladerías',emoji:'🍦',color:'#eaf1f3',photo:'food',text:'Explora cerca de ti'},
  {id:'panaderias',name:'Panaderías',emoji:'🥖',color:'#eaf1f3',photo:'food',text:'Explora cerca de ti'},
  {id:'pescaderias',name:'Pescaderías',emoji:'🐟',color:'#eaf1f3',photo:'food',text:'Explora cerca de ti'},
  {id:'comidarapida',name:'Comida rápida',emoji:'🍔',color:'#eaf1f3',photo:'food',text:'Explora cerca de ti'},
  {id:'supermercados',name:'Supermercados',emoji:'🛒',color:'#eaf1f3',photo:'food',text:'Explora cerca de ti'},
  {id:'colmados',name:'Colmados',emoji:'🧺',color:'#eaf1f3',photo:'food',text:'Explora cerca de ti'},
  {id:'mercados',name:'Mercados',emoji:'🥬',color:'#eaf1f3',photo:'food',text:'Explora cerca de ti'},
  {id:'tiendas',name:'Tiendas y moda',emoji:'🛍️',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'ferreterias',name:'Ferreterías',emoji:'🛠️',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'electrodomesticos',name:'Electrodomésticos',emoji:'📺',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'tecnologia',name:'Tecnología',emoji:'📱',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'barberias',name:'Barberías',emoji:'💈',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'salones',name:'Salones de belleza',emoji:'💇',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'unas',name:'Centros de uñas',emoji:'💅',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'spas',name:'Spas y masajes',emoji:'🧖',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'gimnasios',name:'Gimnasios',emoji:'🏋️',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'hoteles',name:'Hoteles',emoji:'🏨',color:'#eaf1f3',photo:'hotel',text:'Explora cerca de ti'},
  {id:'resorts',name:'Resorts',emoji:'🌴',color:'#eaf1f3',photo:'hotel',text:'Explora cerca de ti'},
  {id:'villas',name:'Villas y alojamientos',emoji:'🏡',color:'#eaf1f3',photo:'hotel',text:'Explora cerca de ti'},
  {id:'taxis',name:'Taxis y transporte',emoji:'🚘',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'gasolineras',name:'Gasolineras',emoji:'⛽',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'talleres',name:'Talleres',emoji:'🔧',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'lavaderos',name:'Car washes',emoji:'🚿',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'farmacias',name:'Farmacias',emoji:'💊',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'hospitales',name:'Hospitales y clínicas',emoji:'🏥',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'odontologia',name:'Dentistas',emoji:'🦷',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'veterinarias',name:'Veterinarias',emoji:'🐾',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'mascotas',name:'Tiendas de mascotas',emoji:'🐕',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'bancos',name:'Bancos',emoji:'🏦',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'cajeros',name:'Cajeros automáticos',emoji:'🏧',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'lavanderias',name:'Lavanderías',emoji:'🧺',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'servicios',name:'Servicios profesionales',emoji:'🗂️',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'escuelas',name:'Escuelas',emoji:'🎓',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'iglesias',name:'Iglesias',emoji:'⛪',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'},
  {id:'deportes',name:'Deportes',emoji:'⚽',color:'#eaf1f3',photo:'attraction',text:'Explora cerca de ti'}
];
const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map(x=>[x.id,x]));
// Selected quick-access places. Locality centers are browsing centers only, never place directions.
const CITIES = [
  {name:'Puerto Plata',region:'República Dominicana',country:'RD',lat:19.7934,lon:-70.6884,emoji:'🏝️'},
  {name:'Santo Domingo de Guzmán',region:'República Dominicana',country:'RD',lat:18.4861,lon:-69.9312,emoji:'🏛️'},
  {name:'Santiago de los Caballeros',region:'República Dominicana',country:'RD',lat:19.4517,lon:-70.6970,emoji:'🌇'},
  {name:'Sosúa',region:'República Dominicana',country:'RD',lat:19.7683,lon:-70.5199,emoji:'🏖️'},
  {name:'Cabarete',region:'Distrito municipal de Sosúa · Puerto Plata',country:'RD',lat:19.7496,lon:-70.4139,emoji:'🏄'},
  {name:'La Romana',region:'República Dominicana',country:'RD',lat:18.4273,lon:-68.9728,emoji:'🌴'},
  {name:'Punta Cana',region:'Higüey · La Altagracia · centro de zona',country:'RD',lat:18.5586,lon:-68.3694,emoji:'🌴'},
  {name:'Bávaro',region:'Verón–Punta Cana · La Altagracia · centro de zona',country:'RD',lat:18.6862,lon:-68.4198,emoji:'🏖️'},
  {name:'Verón–Punta Cana',region:'Distrito municipal de Higüey · La Altagracia',country:'RD',lat:18.58182,lon:-68.40431,emoji:'☀️'}
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
  mode:'city', gpsAccuracy:null, places:[], catalog:[], remotePlaces:[], dataMode:'live', dataError:'', category:'todos', radius:2000, search:'', googleEnabled:false, googleIssue:'',province:'Puerto Plata', placesProvider:'osm',
  favorites:loadJSON('wtg_favorites',[]), favoritePlaces:loadJSON('wtg_favorite_places',[]), businesses:loadJSON('wtg_businesses',[]),
  map:null, markers:[], loadingId:0, modal:null, toastTimeout:null
};
function loadJSON(key,def){try{const v=JSON.parse(localStorage.getItem(key));return Array.isArray(v)?v:def}catch{return def}}
function saveJSON(key,data){try{localStorage.setItem(key,JSON.stringify(data));return true}catch{toast('No se pudo guardar en este dispositivo.');return false}}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function haversine(lat1,lon1,lat2,lon2){const r=Math.PI/180, a=Math.sin((lat2-lat1)*r/2)**2+Math.cos(lat1*r)*Math.cos(lat2*r)*Math.sin((lon2-lon1)*r/2)**2;return 6371000*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))}
function distance(m){return Number.isFinite(m)?m<1000?`${Math.round(m)} m`:`${(m/1000).toFixed(1).replace('.0','')} km`:'—'}
function catInfo(id){const c=CATEGORY_BY_ID[id]||CATEGORY_BY_ID.atracciones;return {...c,name:window.WTG_I18N?.category(c.id,c.name)||c.name}}
function normalizedPhone(s){return String(s||'').replace(/[^+\d]/g,'')}
function safeUrl(s){try{const u=new URL(s);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return''}}
// Remote images sometimes fail on mobile. Recover with a compact, honest visual.
document.addEventListener('error', event => {
  const el=event.target;
  if(!(el instanceof HTMLImageElement) || !el.classList.contains('actual-photo'))return;
  const parent=el.closest('.place-photo, .detail-cover');
  const icon=parent?.querySelector('.card-tag')?.textContent?.trim().slice(0,3)||'⌖';
  const fallback=document.createElement('div');fallback.className='photo-empty wtg-photo-placeholder';
  const sign=document.createElement('span');sign.className='wtg-photo-icon';sign.textContent=icon;
  const label=document.createElement('span');label.className='wtg-photo-label';label.textContent='FOTO NO DISPONIBLE';
  fallback.append(sign,label);el.replaceWith(fallback);
  parent?.closest('.place-card')?.classList.add('wtg-photo-load-failed');
},true);
function placePhotoMarkup(p, kind='card'){
  const src=safeUrl(p.photo||'');
  // No unrelated stock image or misleading 'real photo' label. An identified image,
  // or an intentional compact graphic with the category icon and a truthful caption.
  const icon = catInfo(p.cat).emoji;
  const placeholder=`<div class="photo-empty wtg-photo-placeholder" role="img" aria-label="Fotografía no verificada"><span class="wtg-photo-icon" aria-hidden="true">${icon}</span><span class="wtg-photo-label">FOTO PENDIENTE</span></div>`;
  return src ? `<img class="photo-illustration actual-photo" loading="lazy" decoding="async" src="${esc(src)}" alt="Fotografía vinculada a ${esc(p.name)}" referrerpolicy="no-referrer" />` : placeholder;
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
  return; // Batch enrichment verifies Commons licenses and attribution first.
  // State may have changed while fetching.
  renderHome();renderExplore();if(state.modal==='place-modal'){/* Do not replace a user's currently open details. */}
}

// Catálogo de aventura precargado: solamente entradas con punto geográfico documentado
// pasan a los resultados locales; el resto permanece en datos editoriales, NO cercanos.
async function loadLocalAdventureCatalog(){
  try{
    const r=await fetch('/data/aventuras.json',{cache:'force-cache'});
    if(!r.ok)throw Error('Catálogo local no accesible');
    const items=await r.json();
    state.catalog=(Array.isArray(items)?items:[])
      .filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon) && p.sourceUrl && ['Punto de destino enlazado por Turismo RD','Punto documentado en cartografía','Punto identificado por organismo público'].includes(p.accuracy))
      .map(p=>({
        id:p.id,name:p.name,cat:p.cat,lat:p.lat,lon:p.lon,province:p.province,
        municipality:p.municipality,address:[p.municipality,p.province].filter(Boolean).join(', '),
        description:p.description,source:p.sourceType?'editorial':'mitur',sourceUrl:p.sourceUrl,accuracy:p.accuracy,
        photo:p.photo||VERIFIED_OSM_IMAGES[p.id]?.photo||(p.id==='mitur-damajagua'?'https://commons.wikimedia.org/wiki/Special:FilePath/Damajagua_Waterfall.jpg?width=700':''),photoAttribution:p.photoAttribution||VERIFIED_OSM_IMAGES[p.id]?.attribution||(p.id==='mitur-damajagua'?'Funcheta · CC BY-SA 4.0 · Wikimedia Commons':''),photoSource:p.photoSource||VERIFIED_OSM_IMAGES[p.id]?.source||(p.id==='mitur-damajagua'?'https://commons.wikimedia.org/wiki/File:Damajagua_Waterfall.jpg':''),website:p.sourceUrl,phone:'',tags:{},relatedTags:p.tags||[],
        distance:0
      }));
  }catch(e){state.catalog=[];console.warn('Catálogo base sin cargar:',e.message)}
  return state.catalog;
}
function insideNearbyRadius(p){
  return Number.isFinite(p?.lat)&&Number.isFinite(p?.lon) &&
    haversine(state.lat,state.lon,p.lat,p.lon) <= state.radius;
}
function localNearby(){
  return state.catalog.filter(insideNearbyRadius).map(p=>({...p,distance:haversine(state.lat,state.lon,p.lat,p.lon)}));
}

// Anuncios revisados por propietario: solo se muestran en su provincia y su categoría.
// Nunca se venden ni activan mediante el formulario sin revisión humana.
let wtgSponsors=[];
async function loadApprovedSponsors(){
  try {const r=await fetch('/data/promociones.json',{cache:'no-cache'});if(!r.ok)return;
    const items=await r.json();wtgSponsors=(Array.isArray(items)?items:[]).filter(x=>x.approved===true&&x.active===true&&x.paymentVerified===true&&['destacado','premium'].includes(x.plan)&&!!x.paidUntil&&Date.parse(x.paidUntil+'T23:59:59Z')>=Date.now()&&CATEGORIES.some(c=>c.id===x.cat));}
  catch {wtgSponsors=[];}
}

async function loadApprovedFreeBusinesses(){
 try{
  const r=await fetch('/data/negocios-aprobados.json',{cache:'no-cache'});if(!r.ok)return;
  const list=await r.json();if(!Array.isArray(list))return;
  for(const b of list){
    if(b.approved!==true||b.registrationPaid!==true||!b.id||!b.name||!CATEGORIES.some(c=>c.id===b.cat)||!Number.isFinite(b.lat)||!Number.isFinite(b.lon)||!b.sourceUrl)continue;
    state.catalog.push({id:'business-'+b.id,name:b.name,cat:b.cat,lat:b.lat,lon:b.lon,
      address:b.address||'',phone:b.phone||'',website:b.website||'',photo:b.photoRightsConfirmed?b.photo||'':'',
      photoSource:b.photoRightsConfirmed?b.photoSource||'':'',photoAttribution:b.photoAttribution||'',
      province:b.province||'',municipality:b.municipality||'',source:'propietario',sourceUrl:b.sourceUrl,
      accuracy:b.accuracy||'Ubicación verificada al aprobar la ficha; confirma la entrada',description:b.description||'',tags:{}});
  }
 }catch(e){console.warn('Directorio de registros básicos pendiente:',e.message)}
}
function sponsorInScope(s){
  return s.province===provinceFromCity() && (state.category==='todos'||state.category===s.cat) &&
    Number.isFinite(s.lat)&&Number.isFinite(s.lon) && haversine(state.lat,state.lon,s.lat,s.lon)<=state.radius;
}
function sponsorNearby(){return wtgSponsors.filter(sponsorInScope).map(s=>({
 id:'sponsor-'+s.id,name:s.name,cat:s.cat,lat:s.lat,lon:s.lon,province:s.province,
 municipality:s.municipality||'',address:s.address||'',phone:s.phone||'',website:s.website||'',
 description:s.description||'',source:'patrocinado',sourceUrl:s.sourceUrl||'',sponsored:true,plan:s.plan,
 photo:s.photo||'',distance:haversine(state.lat,state.lon,s.lat,s.lon),accuracy:'Punto proporcionado y revisado por el anunciante',tags:{}
}));}
function promoSort(arr){const rank=p=>p.sponsored?(p.plan==='premium'?3:2):0;return arr.sort((a,b)=>rank(b)-rank(a)||a.distance-b.distance||a.name.localeCompare(b.name,'es'));}

function combineNearby(remote=[]){
  const output=new Map();
  for(const p of [...sponsorNearby(),...localNearby(),...remote]){
    if(!insideNearbyRadius(p))continue;
    const normalized={...p,distance:haversine(state.lat,state.lon,p.lat,p.lon)};
    if(!output.has(normalized.id))output.set(normalized.id,normalized);
  }
  return promoSort([...output.values()]);
}
function applyNearby(remote=[],message=''){
  state.remotePlaces=remote.filter(insideNearbyRadius);
  state.places=combineNearby(state.remotePlaces);
  state.dataMode='live';state.dataError=message;
  renderAll();
}
function placeMatchesCategory(p,cat){
  return cat==='todos' || p.cat===cat || (p.source==='mitur'&&p.relatedTags?.includes(cat));
}
// Tourist discovery excludes everyday services from the default Explore/Home feeds.
// Categories remain completely accessible when chosen explicitly, or by an exact text search.
const WTG_DISCOVERY_CATEGORIES = new Set(['rios','balnearios','cascadas','lagunas','senderismo','playas','parques','atracciones','entretenimiento','infantil','piscinas','restaurantes','bares','discotecas','hoteles','resorts','villas']);
const WTG_DISCOVERY_PRIORITY = {atracciones:9,cascadas:9,balnearios:9,rios:9,playas:9,parques:8,senderismo:8,lagunas:8,entretenimiento:7,infantil:7,piscinas:6,restaurantes:5,hoteles:5,resorts:5,villas:4,bares:3,discotecas:3};
function isTouristDiscovery(p){return WTG_DISCOVERY_CATEGORIES.has(p.cat) && p.nameKnown!==false && !!String(p.name||'').trim();}
function tourismSort(arr){return arr.sort((a,b)=>(Number(b.sponsored&&b.plan==='premium')-Number(a.sponsored&&a.plan==='premium')) || (a.distance-b.distance) || ((WTG_DISCOVERY_PRIORITY[b.cat]||0)-(WTG_DISCOVERY_PRIORITY[a.cat]||0)) || a.name.localeCompare(b.name,'es'));}
function discoveryMatches(p){return state.category!=='todos'||!!state.search||isTouristDiscovery(p);}
function sortByDistance(arr){return promoSort(arr)}
function classify(tags){
  const a=tags.amenity||'',t=tags.tourism||'',l=tags.leisure||'',n=tags.natural||'',s=tags.shop||'',o=tags.office||'',h=tags.healthcare||'',craft=tags.craft||'';
  if(n==='waterfall'||tags.waterway==='waterfall')return 'cascadas';
  if(l==='swimming_area')return 'balnearios';
  if(n==='beach'||l==='beach')return 'playas';
  if(n==='water'&&['lake','lagoon','reservoir'].includes(tags.water))return 'lagunas';
  if(tags.waterway==='river'&&tags.name)return 'rios';
  if(tags.route==='hiking')return 'senderismo';
  if(l==='swimming_pool')return 'piscinas';
  if(t==='resort'||l==='resort')return 'resorts';
  if(t==='villa'||t==='apartment'||tags.building==='villa')return 'villas';
  if(['hotel','hostel','guest_house','motel','chalet','camp_site'].includes(t))return 'hoteles';
  if(a==='taxi'||o==='transport'||tags['taxi']==='yes')return 'taxis';
  if(a==='fuel')return 'gasolineras';
  if(a==='bank')return 'bancos';
  if(a==='atm')return 'cajeros';
  if(a==='pharmacy'||s==='chemist')return 'farmacias';
  if(['hospital','clinic','doctors'].includes(a)||['hospital','clinic','doctor'].includes(h))return 'hospitales';
  if(a==='dentist'||h==='dentist')return 'odontologia';
  if(a==='veterinary'||h==='veterinary')return 'veterinarias';
  if(a==='school'||a==='kindergarten'||a==='college')return 'escuelas';
  if(a==='place_of_worship')return 'iglesias';
  if(['fast_food','food_court'].includes(a))return 'comidarapida';
  if(a==='restaurant')return 'restaurantes';
  if(a==='bar'||a==='pub'||a==='biergarten')return 'bares';
  if(a==='nightclub')return 'discotecas';
  if(a==='ice_cream'||s==='ice_cream')return 'heladerias';
  if(a==='cafe'||s==='coffee')return 'cafes';
  if(s==='bakery'||s==='pastry')return 'panaderias';
  if(s==='seafood'||s==='fishmonger')return 'pescaderias';
  if(s==='supermarket')return 'supermercados';
  if(['convenience','general','kiosk'].includes(s))return 'colmados';
  if(a==='marketplace'||s==='greengrocer')return 'mercados';
  if(s==='hardware'||s==='doityourself'||s==='building_materials')return 'ferreterias';
  if(s==='electronics'||s==='mobile_phone'||s==='computer')return 'tecnologia';
  if(s==='appliance'||s==='electrical')return 'electrodomesticos';
  if(s==='hairdresser'&&tags['hairdresser:gender']==='male'||s==='barber'||s==='barber_shop')return 'barberias';
  if(s==='hairdresser'||s==='beauty')return 'salones';
  if(s==='nails'||s==='nail_salon'||tags.beauty==='nails')return 'unas';
  if(s==='massage'||s==='spa'||l==='spa')return 'spas';
  if(l==='fitness_centre'||s==='sports'||a==='gym')return 'gimnasios';
  if(s==='pet'||s==='pet_grooming')return 'mascotas';
  if(s==='car_repair'||s==='car_parts'||craft==='carpenter'||craft==='mechanic')return 'talleres';
  if(s==='car_wash'||a==='car_wash')return 'lavaderos';
  if(s==='laundry'||s==='dry_cleaning')return 'lavanderias';
  if(['accountant','lawyer','insurance','estate_agent','travel_agent','consulting'].includes(o))return 'servicios';
  if(l==='park'||l==='garden'||l==='nature_reserve')return 'parques';
  if(l==='playground'||a==='childcare')return 'infantil';
  if(l==='sports_centre'||l==='stadium'||l==='pitch')return 'deportes';
  if(a==='cinema'||a==='theatre'||['water_park','amusement_arcade','theme_park'].includes(l))return 'entretenimiento';
  if(t==='attraction'||t==='viewpoint'||t==='museum'||tags.historic)return 'atracciones';
  if(s&&s!=='vacant'&&s!=='no')return 'tiendas';
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
function overpassQuery(lat,lon,radius,category='todos'){
  const around=`(around:${radius},${lat.toFixed(5)},${lon.toFixed(5)})`;
  const patterns={
    rios:[['tourism','attraction']],
    balnearios:[['leisure','swimming_area']],
    cascadas:[['natural','waterfall'],['waterway','waterfall']],
    lagunas:[['natural','water']],
    senderismo:[['route','hiking']],
    restaurantes:[['amenity','restaurant|fast_food|food_court']],
    bares:[['amenity','bar|pub|biergarten']],
    playas:[['natural','beach'],['leisure','beach|beach_resort']],
    piscinas:[['leisure','swimming_pool']],
    hoteles:[['tourism','hotel|hostel|guest_house|motel|apartment']],
    resorts:[['tourism','resort'],['leisure','resort|beach_resort']],
    villas:[['tourism','villa'],['building','villa']],
    discotecas:[['amenity','nightclub']],
    parques:[['leisure','park|garden|nature_reserve']],
    entretenimiento:[['amenity','cinema|theatre'],['leisure','water_park|amusement_arcade|theme_park'],['tourism','theme_park']],
    cafes:[['amenity','cafe|ice_cream']],
    taxis:[['amenity','taxi'],['office','transport']],
    atracciones:[['tourism','attraction|viewpoint|museum'],['historic','.+']]
  };
  const patternsForCategory=category==='todos'?Object.entries(patterns).filter(([k])=>!['rios','lagunas','senderismo'].includes(k)).flatMap(([,v])=>v):patterns[category]||[];
  const clauses=[...new Set(patternsForCategory.map(([key,regex])=>`nwr${around}["${key}"~"^(${regex})$"]["name"];`))];
  return `[out:json][timeout:24];(${clauses.join('')});out center 650;`;
}
async function overpassFetch(query,endpoint){const ctrl=new AbortController(),t=setTimeout(()=>ctrl.abort(),7000);try{const body=new URLSearchParams({data:query});const res=await fetch(endpoint,{method:'POST',body,signal:ctrl.signal,headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'}});if(!res.ok)throw new Error(`Proveedor respondió ${res.status}`);const data=await res.json();if(!Array.isArray(data.elements))throw Error('Respuesta no válida');return data.elements;}finally{clearTimeout(t)}}
// Optional Google Places data. Enabled only after Netlify Functions + GOOGLE_MAPS_API_KEY are configured.
async function checkGoogleProvider(){
  try{const r=await fetch('/.netlify/functions/provider-status',{cache:'no-store'});if(!r.ok)return;
    const d=await r.json();if(d.googlePlacesEnabled){state.googleEnabled=true;state.placesProvider='google';loadPlaces(true)}
  }catch{/* Static Netlify Drop deployment continues with real OpenStreetMap data. */}
}
const GOOGLE_CATS={taxi_service:'taxis',taxi_stand:'taxis',chauffeur_service:'taxis',restaurant:'restaurantes',bar:'bares',pub:'bares',night_club:'discotecas',nightclub:'discotecas',cafe:'cafes',coffee_shop:'cafes',hotel:'hoteles',lodging:'hoteles',resort_hotel:'resorts',tourist_attraction:'atracciones',museum:'atracciones',park:'parques',national_park:'parques',amusement_park:'entretenimiento',movie_theater:'entretenimiento',swimming_pool:'piscinas',beach:'playas'};
function googleCategory(row,chosen){if(chosen!=='todos')return chosen;return GOOGLE_CATS[row.primaryType]||row.types?.map(x=>GOOGLE_CATS[x]).find(Boolean)||'atracciones'}
async function loadGooglePlaces(force=false){
  const id=++state.loadingId,lat=state.lat,lon=state.lon,radius=state.radius,category=state.category;
  // Los resultados verificados del catálogo se ven INMEDIATAMENTE.
  applyNearby([], 'Comprobando fichas adicionales en Google Places…');
  const params=new URLSearchParams({lat:String(lat),lon:String(lon),radius:String(radius),category,city:`${state.city}, ${state.region}`});
  if(state.search)params.set('search',state.search);
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),6500);
  try{
    const r=await fetch('/.netlify/functions/google-search?'+params,{cache:'no-store',signal:ctrl.signal});
    const data=await r.json();if(id!==state.loadingId)return;
    if(!r.ok)throw Error(data.error||'Fuente externa no disponible');
    const places=(data.places||[]).filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)).map(p=>({
      id:'google-'+p.id,googleId:p.id,name:p.name,cat:googleCategory(p,category),
      lat:p.lat,lon:p.lon,distance:haversine(lat,lon,p.lat,p.lon),address:p.address,source:'google',
      photo:p.photoName?`/.netlify/functions/google-photo?name=${encodeURIComponent(p.photoName)}`:'',
      photoAttributions:p.photoAttributions||[],website:'',phone:'',
      description:'Información proporcionada por Google Maps.',googleUri:p.mapsUri,
      googleDirections:p.directionsUri,detailsLoaded:false,tags:{}
    }));
    state.placesProvider='google';applyNearby(places);
  }catch(e){
    if(id!==state.loadingId)return;
    state.googleEnabled=false;
    state.googleIssue='Google Places no está disponible: '+String(e.message||'permiso denegado').slice(0,160);
    state.placesProvider='osm';
    applyNearby([], 'Mostrando destinos locales; buscando otras fichas…');
    toast('Google no respondió. Se muestran primero los destinos cercanos verificados.');
    await loadPlaces(false);
  }finally{clearTimeout(timer)}
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
/* V4.3: offline-first grid data. No Google Places / live Overpass requests.
   Optional grid files are pre-generated once from OSM extracts (Geofabrik); the
   client downloads ONLY tiles intersecting the selected radius. */
let wtgManifestPromise=null;
const wtgGridCache=new Map();
const wtgFailedCells=new Set();
const WTG_CELL_DEGREES=0.2;
function wtgCell(lat,lon){return [Math.floor((lat+90)/WTG_CELL_DEGREES),Math.floor((lon+180)/WTG_CELL_DEGREES)]}
async function wtgManifest(force=false){
  if(force){wtgManifestPromise=null;wtgGridCache.clear();}
  if(!wtgManifestPromise){
    wtgManifestPromise=fetch('/data/places/manifest.json',{cache:'no-cache'}).then(async r=>r.ok?r.json():null).catch(()=>null);
  }
  return wtgManifestPromise;
}
function wtgCellsNearby(lat,lon,radius,manifest){
  const kmLat=radius/111000;
  const kmLon=radius/(111000*Math.max(.15,Math.cos(lat*Math.PI/180)));
  const [loA,loB]=wtgCell(lat-kmLat,lon-kmLon);
  const [hiA,hiB]=wtgCell(lat+kmLat,lon+kmLon);
  const available=new Set(manifest?.cells||[]), cells=[];
  for(let a=loA;a<=hiA;a++)for(let b=loB;b<=hiB;b++){
    const key=`${a}_${b}`;
    if(available.has(key))cells.push(key);
  }
  return cells;
}
async function wtgGrid(key){
  if(wtgGridCache.has(key))return wtgGridCache.get(key);
  const promise=(async()=>{
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6500);
    try{
      const r=await fetch(`/data/places/cell_${key}.json`,{signal:controller.signal,cache:'force-cache'});
      if(!r.ok)throw Error(`Celda ${key}: HTTP ${r.status}`);
      const entries=await r.json();
      if(!Array.isArray(entries))throw Error(`Celda ${key}: no es una lista`);
      return entries;
    }finally{clearTimeout(timer)}
  })();
  wtgGridCache.set(key,promise);
  try{return await promise}
  catch(err){
    // A missing/failed grid was previously cached as an empty array forever.
    // Never mistake a failed download for an area without places.
    wtgGridCache.delete(key);wtgFailedCells.add(key);
    console.warn('Where to Go: error cargando bloque local:',key,String(err));
    return [];
  }
}
function wtgImportedPlace(row){
  if(!Number.isFinite(row.lat)||!Number.isFinite(row.lon)||!row.id||!row.name||!CATEGORY_BY_ID[row.cat])return null;
  return {
    id:row.id,name:row.name,cat:row.cat,lat:row.lat,lon:row.lon,
    address:row.address||'',phone:row.phone||'',website:row.website||'',photo:row.photoSource&&safeUrl(row.image)?row.image:(VERIFIED_OSM_IMAGES[row.id]?.photo||''),photoSource:row.photoSource||(VERIFIED_OSM_IMAGES[row.id]?.source||''),photoAttribution:row.photoAttribution||(VERIFIED_OSM_IMAGES[row.id]?.attribution||''),
    tags:{wikidata:row.wikidata||'',opening_hours:row.opening_hours||''},nameKnown:row.nameKnown!==false,source:row.source==='overture'?'overture':'osm',accuracy:row.accuracy||'Punto registrado en el catálogo de origen',
    sourceUrl:row.sourceUrl||'https://www.openstreetmap.org/',
    description:row.description||'',distance:haversine(state.lat,state.lon,row.lat,row.lon)
  };
}
async function loadPlaces(force=false){
  const token=++state.loadingId;
  state.googleEnabled=false;state.googleIssue='';state.placesProvider='osm';
  // Render as soon as we have the curated local points. Never wait for an API.
  applyNearby([],'Catálogo guardado · lugares dentro del radio elegido');
  wtgFailedCells.clear();
  const manifest=await wtgManifest(force);
  if(token!==state.loadingId)return;
  if(!manifest||!Array.isArray(manifest.cells)||!manifest.cells.length){
    state.dataError='Importación pendiente: 0 negocios nacionales cargados. El administrador debe ejecutar GitHub → Actions → Cargar directorio real de RD.';
    renderAll();return;
  }
  const keys=wtgCellsNearby(state.lat,state.lon,state.radius,manifest);
  const responses=await Promise.all(keys.map(wtgGrid));
  if(token!==state.loadingId)return;
  const unique=new Map();
  for(const rows of responses)for(const item of rows){const p=wtgImportedPlace(item);if(p&&!unique.has(p.id))unique.set(p.id,p)}
  applyNearby([...unique.values()],`Catálogo local de ${manifest.sources?.length>1?'OSM y Overture Maps':'OpenStreetMap'} · actualizado ${manifest.updatedAt||'sin fecha'} · filtrado por distancia${wtgFailedCells.size?' · ⚠ '+wtgFailedCells.size+' bloques sin cargar; pulsa Actualizar':''}`);
}

function ensureProviderBanner(){
  return; // Sin avisos sobre Google; la V4.3 no depende de esa API.
  if($('provider-banner'))return;
  const box=document.createElement('div');
  box.id='provider-banner';
  box.hidden=true;
  box.setAttribute('role','status');
  box.setAttribute('aria-live','polite');
  box.style.cssText='display:flex;gap:14px;align-items:center;justify-content:space-between;margin:14px 22px;padding:14px;border:1px solid #e6c88c;border-radius:14px;background:#fff7e8;color:#584017;flex-wrap:wrap';
  box.innerHTML='<div style="flex:1;min-width:200px"><strong style="display:block;font-size:14px">Google Places no está disponible</strong><small id="provider-notice-desc" style="font-size:12px;line-height:1.5;display:block">Buscando lugares reales en OpenStreetMap.</small></div><button id="retry-google-provider" type="button" style="border:1px solid #caa75c;background:#fff;color:#584017;padding:10px 12px;border-radius:10px;font-weight:700;cursor:pointer">Reintentar Google ↻</button>';
  const main=$('main-content');
  if(main)main.parentNode.insertBefore(box,main);
}
function updateProviderNotice(){
  return; // La fuente local no genera mensajes de permisos de Google.
  const banner=$('provider-banner');if(!banner)return;
  banner.hidden=!state.googleIssue;
  if(state.googleIssue){
    $('provider-notice-desc').textContent='Google Places respondió con un error. Where to Go buscará datos reales en OpenStreetMap mientras resolvemos la configuración. La cobertura depende del proveedor.';
  }
}
function viewTitle(id){return {inicio:'Inicio',explorar:'Explorar lugares',mapa:'Mapa interactivo',favoritos:'Mis favoritos',promocionar:'Promocionar', 'mis-negocios':'Mis negocios',taxis:'Taxis y transporte'}[id]||'Inicio'}
function navigate(view){if(!$("view-"+view))view='inicio';state.view=view;document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id===`view-${view}`));document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===view));$('current-page-label').textContent=viewTitle(view);if(view==='taxis')renderTaxis();if(view==='explorar')renderExplore();if(view==='favoritos')renderFavorites();if(view==='mis-negocios')renderMyBusinesses();if(view==='mapa')setTimeout(renderMap,100);window.scrollTo({top:0,behavior:'instant'});try{history.replaceState(null,'',`#${view}`)}catch{}}
function renderCategories(){const counts={};state.places.forEach(p=>{counts[p.cat]=(counts[p.cat]||0)+1;if(p.relatedTags)for(const tag of p.relatedTags)counts[tag]=(counts[tag]||0)+1});
  const blocks=[
    ['🌿 Aventuras y naturaleza','rios balnearios cascadas lagunas senderismo playas parques atracciones entretenimiento infantil piscinas'],
    ['🍽️ Comida y bebida','restaurantes bares discotecas cafes heladerias panaderias pescaderias comidarapida'],
    ['🛍️ Compras y mercados','supermercados colmados mercados tiendas ferreterias electrodomesticos tecnologia'],
    ['💆 Belleza y bienestar','barberias salones unas spas gimnasios'],
    ['🏨 Alojamiento y transporte','hoteles resorts villas taxis gasolineras talleres lavaderos'],
    ['🩺 Salud y servicios','farmacias hospitales odontologia veterinarias mascotas bancos cajeros lavanderias servicios escuelas iglesias deportes']
  ];
  $('home-categories').innerHTML=blocks.map(([label,ids])=>`<section class="wtg-category-section"><h3>${label}</h3><div class="wtg-category-group">${ids.split(' ').map(id=>CATEGORIES.find(c=>c.id===id)).filter(Boolean).map(c=>`<button class="category-card" data-cat="${c.id}"><span class="category-emoji" style="--category-color:${c.color}">${c.emoji}</span><strong>${esc(catInfo(c.id).name)}</strong><small>${state.dataMode==='live'&&state.category==='todos'?(counts[c.id]||0)+' cercanos':'Explorar'}</small></button>`).join('')}</div></section>`).join('');
  $('filter-categories').innerHTML=[{id:'todos',name:'Todo',emoji:'✨'},...CATEGORIES].map(c=>`<button class="filter-chip ${state.category===c.id?'active':''}" data-filter="${c.id}">${c.emoji} ${esc(c.id==='todos'?(window.WTG_I18N?.t('Todo')||'Todo'):catInfo(c.id).name)}</button>`).join('');
  $('business-category').innerHTML=CATEGORIES.map(c=>`<option value="${c.id}">${esc(catInfo(c.id).name)}</option>`).join('');
}
function placeCard(p){const c=catInfo(p.cat),fav=state.favorites.includes(p.id);const provenance=p.source==='patrocinado'?'Publicidad · '+(p.plan==='premium'?'Premium':'Destacado')+' · Ficha verificada por el anunciante':p.source==='propietario'?'Ficha básica verificada · Datos del propietario':p.source==='google'?GOOGLE_BRAND:(p.source==='mitur'?'Guía oficial de Turismo RD':p.source==='editorial'?'Ficha turística con fuente':p.source==='overture'?'© Overture Maps':'© OpenStreetMap');return `<article class="place-card ${p.photo?'wtg-has-photo':'wtg-no-photo'}"><div class="place-photo">${placePhotoMarkup(p)}<span class="card-tag">${p.sponsored?'★ Anuncio · ':''}${c.emoji} ${esc(c.name)}</span><button class="fav-button ${fav?'active':''}" data-fav="${esc(p.id)}" aria-label="${fav?'Quitar de favoritos':'Agregar a favoritos'}">${fav?'♥':'♡'}</button>${p.photo?'<span class="card-image-caption">Foto vinculada al lugar</span>':''}</div><div class="place-body"><button class="place-title" data-place="${esc(p.id)}">${esc(p.name)}</button><div class="place-meta"><span>⌖</span><b>${esc(p.address||'Dirección no publicada')}</b></div><div class="place-footer"><span class="distance-badge">↗ ${distance(p.distance)}</span><button class="card-open" data-place="${esc(p.id)}">Ver detalles →</button></div><small class="source-credit">${provenance}</small>${googleAttribution(p)}${p.photoAttribution?`<small class="photo-authors"><a href="${esc(p.photoSource)}" target="_blank" rel="noopener">Foto: ${esc(p.photoAttribution)}</a></small>`:''}</div></article>`}
function emptyBlock(msg,action='Cambiar ubicación',target='location'){const categoryLabel=state.category==='todos'?'sitios de interés':(catInfo(state.category)?.name||'lugares');const mapsUrl='https://www.openstreetmap.org/#map=12/'+state.lat+'/'+state.lon;return `<div class="empty-state"><span class="empty-emoji">🧭</span><h3>${msg}</h3><p>${state.dataMode==='error'?'No se pudo conectar con el catálogo en vivo. No mostraremos lugares inventados; intenta de nuevo.':(String(state.dataError).includes('Importación pendiente')?'Todavía no se ha importado el directorio nacional. No es un problema del filtro: faltan datos por publicar.':'Prueba otra categoría, aumenta la distancia o selecciona otro municipio. No inventamos establecimientos.')}</p><button data-empty="${target}">${action} →</button><a class="empty-external" href="${esc(mapsUrl)}" target="_blank" rel="noopener">Explorar la zona en OpenStreetMap ↗</a><button type="button" class="photo-contribute" data-report-missing="yes">¿Conoces un lugar cercano que falta? Avísanos</button></div>`}
function renderProvincePremium(){
  const panel=document.getElementById('province-premium-list');if(!panel)return;
  const prov=provinceFromCity();
  const selected=wtgSponsors.filter(x=>x.province===prov&&x.plan==='premium'&&x.active&&x.approved&&x.paymentVerified)
    .sort((a,b)=>String(a.name).localeCompare(String(b.name),'es'));
  const container=document.getElementById('province-premium-container');if(container)container.hidden=!selected.length;
  // One sponsor visible at a time; all approved advertisers receive a turn.
  panel.innerHTML=selected.map((x,i)=>{const source=safeUrl(x.sourceUrl||x.website||'');const cat=catInfo(x.cat);
    return `<article class="wtg-provincial-premium" data-premium-slide="${i}" ${i?'hidden':''}><div class="premium-marker">PUBLICIDAD · PREMIUM · ${esc(prov)}</div><div><strong>${esc(x.name)}</strong><small>${esc(cat.name)} · ${esc(x.province)}</small></div>${source?`<a target="_blank" rel="noopener noreferrer" href="${esc(source)}">Ver negocio ↗</a>`:''}</article>`;
  }).join('');
}
function renderHome(){renderProvincePremium();const teaser=document.querySelector('.taxi-teaser');if(teaser)teaser.hidden=!(state.province==='Puerto Plata'||['Puerto Plata','Sosúa','Cabarete'].includes(state.city));const list=$('home-list');$('home-count').textContent=state.dataMode==='loading'?'...':state.places.filter(p=>p.distance<=state.radius+100&&isTouristDiscovery(p)).length;const sorted=tourismSort(state.places.filter(p=>p.distance<=state.radius+100&&isTouristDiscovery(p))).slice(0,6);
  list.innerHTML=state.dataMode==='loading'?'<div class="loading-state"><span class="spinner"></span><div>Preparando lugares cercanos…</div></div>':sorted.length?sorted.map(placeCard).join(''):emptyBlock('Tu próxima aventura está por descubrirse');
  const mainPromo=document.getElementById('province-anchor-sponsor');
  if(mainPromo){mainPromo.hidden=provinceFromCity()!=='Puerto Plata';}
  const alert=$('location-alert'),title=$('location-alert-title'),desc=$('location-alert-desc'),btn=$('alert-locate');
  if(state.dataMode==='error'){alert.style.background='#fff6e9';alert.style.borderColor='#f1e0c7';title.textContent='Catálogo temporalmente no disponible';desc.textContent='No se cargaron fichas de muestra ni coordenadas estimadas. Reintenta la consulta.';btn.innerHTML='Reintentar ↻';btn.dataset.action='retry';}
  else if(state.mode==='gps'){alert.style.background='#e9f7f4';alert.style.borderColor='#d8efea';title.textContent='Ubicación actual activada';desc.textContent=`${state.places.length} lugares · distancia en línea recta · precisión GPS aproximada ${Number.isFinite(state.gpsAccuracy)?'±'+distance(state.gpsAccuracy):'no informada'}. ${state.gpsAccuracy>1000?'La señal es imprecisa: activa GPS y Wi-Fi e inténtalo otra vez.':''}`;btn.innerHTML='Cambiar zona →';btn.dataset.action='change';}
  else{alert.style.background='#e9f7f4';alert.style.borderColor='#d8efea';title.textContent=`Explorando ${state.city}`;desc.textContent='Esto es una ciudad seleccionada, NO tu ubicación. Activa el GPS para ver solo lugares cerca de ti.';btn.innerHTML='Usar mi ubicación →';btn.dataset.action='locate';}
}
function matches(p){return placeMatchesCategory(p,state.category)&&(!state.search||`${p.name} ${p.address} ${catInfo(p.cat).name}`.toLocaleLowerCase('es').includes(state.search.toLocaleLowerCase('es')))&&p.distance<=state.radius+100}
function renderExplore(){const arr=state.category==='todos'&&!state.search ? tourismSort(state.places.filter(p=>matches(p)&&isTouristDiscovery(p))) : sortByDistance(state.places.filter(matches));$('explore-count').textContent=state.dataMode==='loading'?'...':arr.length;
  $('explore-context').textContent=`${state.dataError||'Catálogo local'} · ${state.city} · hasta ${distance(state.radius)}`;
  $('explore-list').innerHTML=state.dataMode==='loading'?'<div class="loading-state"><span class="spinner"></span><div>Consultando lugares cercanos...</div></div>':arr.length?arr.map(placeCard).join(''):emptyBlock('No encontramos lugares con esos filtros', 'Ampliar búsqueda','radius');
  $('filter-categories').querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b.dataset.filter===state.category));$('distance-select').value=String(state.radius);if($('search-input').value!==state.search)$('search-input').value=state.search;
}
function renderFavorites(){const arr=state.favoritePlaces.map(p=>({...p,distance:haversine(state.lat,state.lon,p.lat,p.lon)}));$('favorite-list').innerHTML=arr.length?arr.map(placeCard).join(''):`<div class="empty-state"><span class="empty-emoji">💚</span><h3>¡Aquí comienza tu lista!</h3><p>Cuando encuentres un lugar especial, toca el corazón para guardarlo. Los favoritos se guardan en este dispositivo.</p><button data-empty="explore">Explorar lugares →</button></div>`}
function toggleFavorite(id){const p=state.places.find(x=>x.id===id)||state.favoritePlaces.find(x=>x.id===id);if(!p)return;const has=state.favorites.includes(id);state.favorites=has?state.favorites.filter(x=>x!==id):[...state.favorites,id];state.favoritePlaces=has?state.favoritePlaces.filter(x=>x.id!==id):[...state.favoritePlaces,p];saveJSON('wtg_favorites',state.favorites);saveJSON('wtg_favorite_places',state.favoritePlaces);toast(has?'Eliminado de favoritos':'Guardado en tus favoritos ♥');renderAll();}
function renderAll(){if(!wtgProvincePreview)updateProvinceHero();updateProviderNotice();renderCategories();renderHome();renderExplore();renderFavorites();if(state.view==='mapa')renderMap();renderTaxis();$('location-label').textContent=state.mode==='gps'?`📍 ${state.city==='Cerca de mí'?'Mi GPS':state.city}`:`🧭 ${state.city} · selección manual`;window.WTG_EXPERIENCE?.update?.();}
function openPlace(id){window.WTG_auth?.recordView?.(id, state.places.find(p=>p.id===id)?.cat||"atracciones");const p=state.places.find(x=>x.id===id)||state.favoritePlaces.find(x=>x.id===id);if(!p)return;
  const c=catInfo(p.cat),fav=state.favorites.includes(id),website=safeUrl(p.website),phone=normalizedPhone(p.phone);
  const osmMap=`https://www.openstreetmap.org/?mlat=${encodeURIComponent(p.lat)}&mlon=${encodeURIComponent(p.lon)}#map=18/${p.lat}/${p.lon}`;
  // Google Maps will route by Google Place ID if available; otherwise by the exact OSM mapped point.
  const directions=p.googleDirections||`https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${encodeURIComponent(state.lat+','+state.lon)}%3B${encodeURIComponent(p.lat+','+p.lon)}`;
  const prov=p.sponsored?'Anunciante verificado · Publicidad':p.source==='propietario'?'Ficha revisada · Propietario':p.source==='google'?GOOGLE_BRAND:(p.source==='mitur'?'Ministerio de Turismo RD':p.source==='editorial'?'Cartografía documentada · consulta la fuente':p.source==='overture'?'© Overture Maps · Confirmar datos':'© OpenStreetMap contributors');
  $('place-modal-body').innerHTML=`<div class="detail-cover">${placePhotoMarkup(p,'detail')}${p.photo?'<span>Imagen vinculada a esta ficha</span>':''}</div><div class="detail-content"><span class="detail-cat">${c.emoji} ${esc(c.name)}</span><h2 id="place-modal-title">${esc(p.name)}</h2><p class="detail-location">⌖ ${esc(p.address||'Dirección no publicada')} · ${distance(p.distance)} en línea recta ${state.mode==='gps'?'desde tu GPS':'desde el centro de búsqueda'}</p><p class="detail-description">${esc(p.description||'Esta ficha se obtuvo de un proveedor de lugares reales. Confirma datos importantes antes de visitar.')}</p><div class="detail-facts"><div>🗺️ Fuente: ${prov}</div><div>📍 Punto registrado: ${p.lat.toFixed(6)}, ${p.lon.toFixed(6)}</div>${googleAttribution(p)}<div>📞 ${phone?esc(p.phone):'Teléfono no disponible en la fuente'}</div>${p.tags?.opening_hours?`<div>🕒 Horario registrado: ${esc(p.tags.opening_hours)}</div>`:''}${['osm','overture'].includes(p.source)?`<div>ℹ️ ${esc(p.accuracy||'Punto registrado en OpenStreetMap')}. Si es un área extensa, este punto puede NO ser su entrada. Comprueba la llegada antes de viajar.</div>`:p.source==='mitur'?'<div>ℹ️ Punto de destino vinculado por Turismo RD; la entrada exacta puede ser distinta. Confirma el acceso.</div>':''}</div><div class="detail-actions"><a class="primary" target="_blank" rel="noopener" href="${esc(directions)}">📍 Cómo llegar ↗</a><a target="_blank" rel="noopener" href="https://waze.com/ul?ll=${encodeURIComponent(p.lat+','+p.lon)}&navigate=yes">🚗 Waze ↗</a><button data-fav="${esc(id)}">${fav?'♥ Quitar favorito':'♡ Guardar lugar'}</button>${website?`<a href="${esc(website)}" target="_blank" rel="noopener">🌐 Sitio web ↗</a>`:''}${phone?`<a href="tel:${esc(phone)}">📞 Llamar</a>`:''}${!p.photo?`<button type="button" data-photo-place="${esc(p.id)}">📷 Aportar foto verificada</button>`:''}${p.source==='google'?`<a target="_blank" rel="noopener" href="${esc(p.googleUri||directions)}">Ver ficha en Google Maps ↗</a>`:`<a class="full-line" target="_blank" rel="noopener" href="${esc(p.source==='mitur'||p.source==='editorial'||p.source==='overture'||p.sponsored||p.source==='propietario'?(safeUrl(p.sourceUrl)||osmMap):osmMap)}">${p.sponsored?'Ver web del anunciante ↗':p.source==='propietario'?'Ver ubicación verificada ↗':p.source==='mitur'?'Ver fuente turística oficial ↗':p.source==='overture'?'Ver datos de Overture Maps ↗':'Ver ficha en OpenStreetMap ↗'}</a>`}</div></div>`;
  openModal('place-modal');
  if(p.source==='google'&&!p.detailsLoaded){getGoogleDetails(p).then(()=>{if(state.modal==='place-modal'&&$('place-modal-title')?.textContent===p.name)openPlace(id)})}
  // Photographs from the batch catalog are licensed and attributed before display.

}
function openModal(id){closeModals();$(id).hidden=false;$('overlay').hidden=false;state.modal=id;document.body.style.overflow='hidden';const focused=$(id).querySelector('button:not([disabled])');focused?.focus({preventScroll:true})}
function closeModals(){for(const id of ['place-modal','location-modal','register-modal','report-modal'])$(id).hidden=true;$('overlay').hidden=true;state.modal=null;document.body.style.overflow='';wtgProvincePreview='';updateProvinceHero();window.WTG_EXPERIENCE?.update?.();}
function openReport(placeId=''){
  const p=state.places.find(x=>x.id===placeId)||state.favoritePlaces.find(x=>x.id===placeId);
  const form=$('report-form');form.reset();
  $('report-province').value=provinceFromCity()||state.province||'';
  $('report-city').value=state.city||'';
  $('report-id').value=p?.id||'';
  $('report-name').value=p?.name||'';
  $('report-category').value=p?.cat||(state.category==='todos'?'':state.category);
  if(p){
    $('report-kind').value='foto';
    $('report-map').value=p.sourceUrl||`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=18/${p.lat}/${p.lon}`;
    $('report-caption').textContent='Comparte un enlace a una foto que sea tuya o que puedas autorizar. La revisaremos antes de publicarla.';
  }else{
    $('report-kind').value='lugar';
    $('report-caption').textContent='Incluye el nombre exacto y un enlace con el punto real en un mapa. No usaremos tu posición GPS como dirección del lugar.';
  }
  openModal('report-modal');
}
function openRegister(plan='basico'){$('register-form').reset();$('business-city').value=state.mode==='gps'?'':state.city;
  if($('business-province')){$('business-province').innerHTML='<option value="">Selecciona una provincia</option>'+PROVINCES.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join('');$('business-province').value=state.province||'';}$('business-plan').value=['basico','destacado','premium'].includes(plan)?plan:'basico';openModal('register-modal')}
function renderCities(){
  $('city-options').innerHTML=CITIES.map(c=>`<button class="city-btn" data-city="${esc(c.name)}"><span>${c.emoji}</span><div>${esc(c.name)}<small>${esc(c.region)}</small></div></button>`).join('');
  $('province-select').innerHTML='<option value="">Selecciona provincia o Distrito Nacional</option>'+PROVINCES.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join('');
}
function selectCity(name){const c=CITIES.find(x=>x.name===name);if(!c)return;state.city=c.name;state.province=['Puerto Plata','Sosúa','Cabarete'].includes(c.name)?'Puerto Plata':c.name==='La Romana'?'La Romana':['Punta Cana','Bávaro','Verón–Punta Cana'].includes(c.name)?'La Altagracia':c.name==='Santiago de los Caballeros'?'Santiago':c.name==='Santo Domingo de Guzmán'?'Distrito Nacional':'';state.region=c.region;state.lat=c.lat;state.lon=c.lon;state.mode='city';state.category='todos';state.search='';if($('taxi-province')){$('taxi-province').value=state.province;updateTaxiMunicipios();}closeModals();toast(`Explorando ${c.name} 🌎`);loadPlaces();}
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
  if(p==='Puerto Plata')mun.insertAdjacentHTML('beforeend','<option value="district-cabarete">Cabarete · distrito municipal de Sosúa</option>');
  if(p==='La Altagracia')mun.insertAdjacentHTML('beforeend','<option value="district-veron">Verón–Punta Cana · distrito municipal de Higüey</option><option value="zone-puntacana">Punta Cana · zona turística</option><option value="zone-bavaro">Bávaro · localidad turística</option>');
  $('municipal-status').textContent=municipalities.length===158?`31 provincias + Distrito Nacional · 158 municipios en el catálogo territorial. ${p?options.length+' en '+p+'.':''}`:'Cargando el índice oficial de municipios...';
  $('municipality-go').disabled=!mun.value;
}
async function selectMunicipality(){
  if($('province-select').value==='Puerto Plata' && $('municipality-select').value==='district-cabarete'){selectCity('Cabarete');return;}
  if($('province-select').value==='La Altagracia'){const special={'district-veron':'Verón–Punta Cana','zone-puntacana':'Punta Cana','zone-bavaro':'Bávaro'}[$('municipality-select').value];if(special){selectCity(special);return;}}
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
    const match=records.find(x=>String(x.display_name||'').toLocaleLowerCase('es').includes(selected.provincia.toLocaleLowerCase('es')));
    if(!match)throw Error('No se pudo comprobar la provincia del municipio en el mapa. Para evitar mostrar lugares de otro sitio, utiliza GPS o prueba más tarde.');
    const lat=Number(match.lat),lon=Number(match.lon);
    if(!Number.isFinite(lat)||!Number.isFinite(lon)||lat<17||lat>21||lon< -73||lon> -67)throw Error('Coordenadas fuera de República Dominicana');
    state.lat=lat;state.lon=lon;state.city=selected.municipio;state.province=selected.provincia;state.region=selected.provincia+' · RD';state.mode='municipio';state.category='todos';state.search='';if($('taxi-province')){$('taxi-province').value=state.province;updateTaxiMunicipios();}closeModals();toast(`Explorando ${selected.municipio}, ${selected.provincia}`);loadPlaces();
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
    if(city){state.city=city;state.province=canonicalProvince(data.principalSubdivision)||String(data.principalSubdivision||'').trim();state.region=state.province?(state.province+' · '+(data.countryCode||'RD')):country||'Ubicación actual';renderAll()}
  }catch{/* Live GPS searching still works without reverse geocoding. */}
  finally{clearTimeout(timer)}
}
// Many mobile browsers require a tap before requesting precise location.
function showFirstLocationChoice(){
  try{if(sessionStorage.getItem('wtg-location-choice-shown-v1'))return;
    sessionStorage.setItem('wtg-location-choice-shown-v1','1');}catch{}
  if(!state.modal)openModal('location-modal');
}
function requestLocation(){if(!window.isSecureContext){toast('La ubicación requiere HTTPS. Abre la URL segura de Netlify, no un archivo local.');openModal('location-modal');return;}if(!('geolocation' in navigator)){toast('Este navegador no admite ubicación. Elige un municipio.');openModal('location-modal');return;}
  toast('Solicitando permiso para usar tu ubicación...');navigator.geolocation.getCurrentPosition(pos=>{
    state.lat=pos.coords.latitude;state.lon=pos.coords.longitude;state.gpsAccuracy=Number.isFinite(pos.coords.accuracy)?pos.coords.accuracy:null;state.mode='gps';state.city='Cerca de mí';state.province='';state.region='Ubicación actual';state.category='todos';state.search='';closeModals();toast('¡Ubicación detectada! Buscando lugares cercanos.');loadPlaces();resolveCurrentCity(state.lat,state.lon);
  },e=>{const msg=e.code===1?'Ubicación bloqueada. Abre el candado de la URL, permite ubicación y reintenta; o elige municipio.':e.code===2?'El dispositivo no pudo localizarte. Activa GPS/Wi-Fi o elige municipio.':'Tiempo de GPS agotado. Inténtalo de nuevo o selecciona un municipio.';toast(msg);if(!state.modal)openModal('location-modal');},{enableHighAccuracy:true,timeout:20000,maximumAge:0});
}
function renderMap(){if(state.placesProvider==='google'){renderGoogleMapLinks();return;}$('map-help').textContent='Mapa: © OpenStreetMap contributors · Leaflet. Las coordenadas pueden representar el centro de un área.';const arr=sortByDistance(state.places.filter(p=>p.source!=='google'&&placeMatchesCategory(p,state.category)&&(state.category!=='todos'||isTouristDiscovery(p))&&p.distance<=state.radius));$('map-count').textContent=arr.length;$('map-places').innerHTML=arr.length?arr.slice(0,85).map(p=>`<div class="map-place" role="button" tabindex="0" data-map-place="${esc(p.id)}"><span class="map-emoji">${catInfo(p.cat).emoji}</span><div><strong>${esc(p.name)}</strong><small>${catInfo(p.cat).name} · ${distance(p.distance)}</small></div></div>`).join(''):'<div style="padding:20px;font-size:12px;color:#8aa1ac">Sin lugares cargados. Prueba ampliar la zona.</div>';
  const mapElement=$('world-map');if(typeof window.L==='undefined'){mapElement.innerHTML='<div class="map-fallback"><div><b>🗺️ Mapa no disponible</b>Se requiere conexión a internet para cargar el mapa. Puedes abrir los lugares desde las fichas.</div></div>';return;}
  if(!state.map){mapElement.innerHTML='';state.map=L.map('world-map',{zoomControl:true}).setView([state.lat,state.lon],13);L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',maxZoom:19}).addTo(state.map)}
  state.markers.forEach(m=>m.remove());state.markers=[];
  const userMarker=L.circleMarker([state.lat,state.lon],{radius:10,weight:4,color:'#fff',fillColor:'#0a9090',fillOpacity:1}).addTo(state.map).bindPopup(state.mode==='gps'?'Tu ubicación actual':'Centro de búsqueda');state.markers.push(userMarker);
  for(const p of arr.slice(0,130)){const circle=L.circleMarker([p.lat,p.lon],{radius:7,color:'#fff',weight:2,fillColor:categoryColor(p.cat),fillOpacity:.95}).addTo(state.map);circle.bindPopup(`<b>${esc(p.name)}</b><br>${catInfo(p.cat).emoji} ${catInfo(p.cat).name}<br>${distance(p.distance)}`);circle.on('click',()=>{state.selectedMapPlace=p.id});state.markers.push(circle)}
  state.map.setView([state.lat,state.lon],state.radius>12000?11:state.radius>5500?12:13,{animate:false});setTimeout(()=>state.map.invalidateSize(),140);
}
function renderGoogleMapLinks(){
 if(state.map){state.map.remove();state.map=null;state.markers=[]}
 $('map-count').textContent=state.places.filter(p=>p.distance<=state.radius&&placeMatchesCategory(p,state.category)).length;
 $('map-help').textContent='Google Places · Consulta y navegación mediante Google Maps oficial';
 $('world-map').innerHTML=`<div class="map-fallback google-map-note"><div><strong>🗺️ Vista de Google Maps</strong><p>Para mantener cada ficha asociada a su lugar real, abre el mapa oficial y las indicaciones de Google. Los puntos de Google Places no se dibujan sobre mapas de otros proveedores.</p><a class="btn btn-primary" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(state.city+', República Dominicana')}">Abrir Google Maps ↗</a></div></div>`;
 $('map-places').innerHTML=state.places.filter(p=>p.distance<=state.radius&&placeMatchesCategory(p,state.category)).map(p=>`<a class="map-place" href="${esc(p.source==='google'?safeUrl(p.googleUri):`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(p.lat+','+p.lon)}`)}" target="_blank" rel="noopener"><span class="map-emoji">${catInfo(p.cat).emoji}</span><div><strong>${esc(p.name)}</strong><small>${distance(p.distance)} · Ver ruta ↗</small></div></a>`).join('');
}
function categoryColor(cat){return {restaurantes:'#e88d5b',bares:'#b26bcb',playas:'#2aaacf',piscinas:'#2c9bbc',hoteles:'#dfa05d',resorts:'#349f72',villas:'#8865b3',discotecas:'#9558cb',parques:'#43a16f',entretenimiento:'#ee9b4e',cafes:'#bf8060',atracciones:'#4b91c0'}[cat]||'#087e86'}
function renderMyBusinesses(){const arr=state.businesses;$('my-businesses').innerHTML=arr.length?arr.map((b,i)=>`<article class="business-card"><span class="status">${esc(b.status||"BORRADOR LOCAL")}</span><h3>${esc(b.name)}</h3><p>${catInfo(b.category).emoji} ${catInfo(b.category).name} · ${esc(b.city)} · Plan ${b.plan==='premium'?'Premium':'Destacado'} (no activado)</p><p>📍 ${esc(b.address)} · ☎ ${esc(b.phone)}</p>${b.description?`<p>${esc(b.description)}</p>`:''}<button data-remove-business="${i}">Eliminar ficha local</button></article>`).join(''):`<div class="empty-state" style="margin-bottom:20px"><span class="empty-emoji">🏪</span><h3>Todavía no tienes fichas</h3><p>Solicita que tu negocio aparezca gratis en el directorio. Revisaremos los datos antes de publicarlo. Las promociones son opcionales.</p><button data-open-register="destacado">Registrar mi negocio →</button></div>`;}
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(state.toastTimeout);state.toastTimeout=setTimeout(()=>el.classList.remove('show'),4200)}

// TRANSPORTE — directorio con contacto verificado del propietario.
// No inventamos ubicación física de operadores sin sede pública confirmada.
const TAXI_OPERATORS=[{
 id:'clemente-transport-vip',name:'Clemente Transport VIP',province:'Puerto Plata',municipalities:'toda-la-provincia',
 description:'Traslados privados y turísticos, aeropuertos POP · STI · SDQ, hoteles, resorts y villas. Atención mediante reserva.',
 phone:'829-586-9111',whatsapp:'https://wa.me/18295869111?text='+encodeURIComponent('Hola, quiero reservar un traslado con Clemente Transport VIP. Vengo de Where to Go.'),
 site:'https://clementetransportvip.com/',type:'Transporte turístico y privado',featured:true
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
 $('taxi-list').innerHTML=results.length?results.map(o=>`<article class="taxi-feature"><div class="taxi-logo">CT<span>VIP</span></div><div class="taxi-info"><div class="taxi-label">★ OPERADOR DESTACADO · ${esc(o.province.toUpperCase())}</div><h3>${esc(o.name)}</h3><p>${esc(o.description)}</p><div class="taxi-facts"><span>✧ ${esc(o.type)}</span><span>⌖ Servicio en ${esc(o.province)} y traslados nacionales</span><span>☏ ${esc(o.phone)}</span></div><div class="taxi-buttons"><a href="${esc(o.whatsapp)}" target="_blank" rel="noopener" class="btn btn-primary">Reservar por WhatsApp ↗</a><a href="tel:${esc(normalizedPhone("+1"+o.phone))}" class="outline-btn">Llamar</a><a href="${esc(o.site)}" target="_blank" rel="noopener" class="outline-btn">Sitio web ↗</a></div><div class="taxi-disclaimer">Perfil comercial confirmado por el propietario · No se publica una dirección física sin verificar.</div></div></article>`).join(''):`<div class="taxi-empty"><div class="taxi-empty-icon">🚘</div><h3>Sin operadores verificados en esta selección</h3><p>Estamos incorporando proveedores de transporte por municipio. No mostramos taxis inventados.</p><button class="btn btn-primary" data-view="promocionar">Registrar una empresa ↗</button></div>`;
}

const wtgOriginalRenderTaxis=renderTaxis;
renderTaxis=function(){
 wtgOriginalRenderTaxis();
 const prov=$('taxi-province')?.value||state.province;
 const mun=$('taxi-municipality')?.value||'';
 if(prov!==state.province)return;
 const extra=state.places.filter(x=>x.cat==='taxis'&&x.source==='osm'&&(!mun||state.city===mun)).slice(0,70);
 if(!extra.length)return;
 const list=$('taxi-list');
 const wrap=document.createElement('div');wrap.className='wtg-taxi-free';
 wrap.innerHTML='<h3>Más transporte registrado cerca de ti</h3>'+extra.map(p=>`<article class="wtg-taxi-item"><div><strong>${esc(p.name)}</strong><small>🗺️ © OpenStreetMap · ${distance(p.distance)} · ${esc(p.address||'Dirección no publicada')}</small></div><a href="https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=18/${p.lat}/${p.lon}" target="_blank" rel="noopener">Ver en mapa ↗</a></article>`).join('');
 list.appendChild(wrap);
 $('taxi-count').textContent=Number($('taxi-count').textContent||0)+extra.length;
};
function startup(){createProvinceControls();ensureProviderBanner();renderCities();loadMunicipalities();renderCategories();const d=new Date();$('today-label').textContent=new Intl.DateTimeFormat('es',{day:'numeric',month:'long',year:'numeric'}).format(d);const startView=location.hash.slice(1);navigate($('view-'+startView)?startView:'inicio');
  document.addEventListener('click',e=>{
    const v=e.target.closest('[data-view]');if(v){navigate(v.dataset.view);return}
    const c=e.target.closest('[data-cat]');if(c){if(c.dataset.cat==='taxis'){navigate('taxis');return}state.category=c.dataset.cat;state.search='';navigate('explorar');loadPlaces();return}
    const f=e.target.closest('[data-filter]');if(f){if(f.dataset.filter==='taxis'){navigate('taxis');return}state.category=f.dataset.filter;loadPlaces();return}
    const photo=e.target.closest('[data-photo-place]');if(photo){openReport(photo.dataset.photoPlace);return}
    const missing=e.target.closest('[data-report-missing]');if(missing){openReport();return}
    const fav=e.target.closest('[data-fav]');if(fav){toggleFavorite(fav.dataset.fav);if(state.modal==='place-modal')openPlace(fav.dataset.fav);return}
    const place=e.target.closest('[data-place]');if(place){openPlace(place.dataset.place);return}
    const city=e.target.closest('[data-city]');if(city){selectCity(city.dataset.city);return}
    const promo=e.target.closest('[data-open-register],.choose-plan');if(promo){openRegister(promo.dataset.plan||promo.dataset.openRegister||'basico');return}
    const rem=e.target.closest('[data-remove-business]');if(rem){if(confirm('¿Quieres eliminar esta ficha de prueba de este dispositivo?')){state.businesses.splice(Number(rem.dataset.removeBusiness),1);saveJSON('wtg_businesses',state.businesses);renderMyBusinesses();toast('Ficha eliminada.')}return}
    const mp=e.target.closest('[data-map-place]');if(mp){const p=state.places.find(x=>x.id===mp.dataset.mapPlace);if(p&&state.map){state.map.setView([p.lat,p.lon],15);state.markers.find(m=>m.getLatLng&&Math.abs(m.getLatLng().lat-p.lat)<.00001&&Math.abs(m.getLatLng().lng-p.lon)<.00001)?.openPopup()}return}
    const empty=e.target.closest('[data-empty]');if(empty){if(empty.dataset.empty==='radius'){$('distance-select').value='30000';state.radius=30000;loadPlaces()}else if(empty.dataset.empty==='explore')navigate('explorar');else openModal('location-modal');return}
    if(e.target.closest('[data-close]')){closeModals();return}
  });
  $('overlay').addEventListener('click',closeModals);document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModals();if(e.key==='Enter'&&e.target.matches('[data-map-place]'))e.target.click()});
  $('location-pill').onclick=()=>openModal('location-modal');$('top-refresh').onclick=()=>{toast('Actualizando lugares...');loadPlaces(true)};$('top-business').onclick=()=>navigate('promocionar');$('side-promote').onclick=()=>navigate('promocionar');$('mobile-brand').onclick=()=>navigate('inicio');
  $('hero-explore').onclick=()=>navigate('explorar');$('home-see-all').onclick=()=>navigate('explorar');$('show-all-categories').onclick=()=>{const grid=$('home-categories');const expanded=grid.classList.toggle('wtg-v8-expanded');$('show-all-categories').textContent=expanded?'Ver menos categorías ↑':'Todas las categorías ↓';if(expanded)grid.scrollIntoView({block:'start',behavior:'smooth'});};$('promo-banner-btn').onclick=()=>navigate('promocionar');
  $('alert-locate').onclick=()=>{if($('alert-locate').dataset.action==='retry'){loadPlaces(true)}else if($('alert-locate').dataset.action==='change'){openModal('location-modal')}else requestLocation()};
  $('use-live-location').onclick=requestLocation;$('province-select').onchange=refreshMunicipalitySelect;$('municipality-select').onchange=()=>{$('municipality-go').disabled=!$('municipality-select').value};$('municipality-go').onclick=selectMunicipality;$('municipal-retry').onclick=()=>{ $('municipal-retry').hidden=true;loadMunicipalities()};$('business-cta').onclick=()=>openRegister('basico');$('home-see-taxis').onclick=()=>navigate('taxis');$('taxi-register').onclick=()=>{openRegister('basico');$('business-category').value='taxis'};$('add-another-business').onclick=()=>openRegister('basico');$('explore-map').onclick=()=>navigate('mapa');
  $('recenter-map').onclick=()=>{if(state.map)state.map.setView([state.lat,state.lon],13)};
  if($('retry-google-provider'))$('retry-google-provider').onclick=()=>toast('Esta versión funciona sin Google Places.');
  $('search-input').addEventListener('input',e=>{state.search=e.target.value.trim();renderExplore()});$('search-input').addEventListener('keydown',e=>{if(e.key==='Enter'&&state.googleEnabled)loadPlaces()});$('clear-search').onclick=()=>{state.search='';$('search-input').value='';renderExplore()};
  $('distance-select').addEventListener('change',e=>{state.radius=Number(e.target.value);loadPlaces()});
  $('report-form').onsubmit=async e=>{
    e.preventDefault();
    const val=id=>$(id).value.trim();
    const kind=val('report-kind'), name=val('report-name'), mapUrl=val('report-map'), imageUrl=val('report-image');
    const file=$('report-upload').files?.[0];
    if(file && (file.size>6*1024*1024 || !['image/jpeg','image/png','image/webp'].includes(file.type))){toast('La foto debe ser JPG, PNG o WebP de hasta 6 MB.');return}
    if(!name||!val('report-province')||!val('report-city')||!$('report-consent').checked){toast('Completa los campos y el permiso.');return}
    if(kind==='lugar'&&!safeUrl(mapUrl)){toast('Incluye un enlace de mapa para verificar dónde queda el lugar.');return}
    if(kind==='foto'&&!file&&!safeUrl(imageUrl)){toast('Adjunta la fotografía o un enlace autorizado.');return}
    const button=$('report-form').querySelector('[type="submit"]');button.disabled=true;
    try{
      const data=new URLSearchParams({
        'form-name':'wtg-sugerencias','bot-field':'',tipo:kind,nombre:name,
        referencia:val('report-id'),categoria:val('report-category'),provincia:val('report-province'),
        localidad:val('report-city'),mapa:mapUrl,foto:imageUrl,
        observaciones:val('report-notes'),contacto:val('report-contact'),
        permiso:'Declara autorización para compartir foto/datos',fecha:new Date().toISOString()
      });
      const body=file?new FormData():data;
      if(file){for(const [key,value] of data)body.append(key,value);body.append('fotoarchivo',file)}
      const r=await fetch('/__forms.html',file?{method:'POST',body}:{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:data});
      if(!r.ok)throw Error('HTTP '+r.status);
      closeModals();toast('Información recibida para revisión. No se publica automáticamente.');
    }catch{toast('No se pudo enviar. Revisa si Netlify Forms está activo.');}
    finally{button.disabled=false;}
  };
  $('report-category').innerHTML='<option value="">No lo sé</option>'+CATEGORIES.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
  $('register-form').onsubmit=async e=>{
    e.preventDefault();const get=id=>$(id).value.trim();
    const b={id:`draft-${Date.now()}`,name:get('business-name'),category:get('business-category'),
      province:get('business-province'),city:get('business-city'),address:get('business-address'),phone:get('business-phone'),
      mapUrl:get('business-map-url'),photoUrl:get('business-photo-url'),
      plan:get('business-plan'),description:get('business-description'),createdAt:new Date().toISOString()};
    if(!b.name||!b.province||!b.city||!b.address||!b.phone||!$('business-consent').checked){toast('Completa los campos obligatorios.');return;}
    const submitBtn=$('register-form').querySelector('[type="submit"]');
    if(submitBtn)submitBtn.disabled=true;
    try{
      const payload=new URLSearchParams({'form-name':'wtg-negocios','bot-field':'',
        nombre:b.name,categoria:b.category,provincia:b.province,ciudad:b.city,direccion:b.address,
        mapa:b.mapUrl,foto:b.photoUrl,telefono:b.phone,plan:b.plan,tarifa:b.plan==='basico'?'US$10 una vez':b.plan==='destacado'?'US$30 mensual':'US$50 mensual',descripcion:b.description,
        consentimiento:'Confirmo ser propietario o representante del negocio',fecha:b.createdAt});
      const res=await fetch('/__forms.html',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:payload.toString()});
      if(!res.ok)throw Error('HTTP '+res.status);
      state.businesses.unshift({...b,status:'Pendiente de revisión y pago'});saveJSON('wtg_businesses',state.businesses);
      closeModals();navigate('mis-negocios');renderMyBusinesses();
      toast('Solicitud recibida, no publicada. Revisaremos el negocio y te indicaremos cómo pagar; no se ha cobrado.');
    }catch(err){
      state.businesses.unshift({...b,status:'Borrador local · no enviado'});saveJSON('wtg_businesses',state.businesses);
      closeModals();navigate('mis-negocios');renderMyBusinesses();
      toast('No pudimos enviar tu solicitud. Se guardó solo en este dispositivo.');
    }finally{if(submitBtn)submitBtn.disabled=false;}
  };
  renderAll();loadLocalAdventureCatalog().then(()=>Promise.all([loadApprovedFreeBusinesses(),loadApprovedSponsors()])).then(()=>loadPlaces());
  // Browser permissions: only auto-locate if prior permission has already been granted.
  // On first visit, users must click 'Usar mi ubicación' themselves.
  if(navigator.permissions&&window.isSecureContext){navigator.permissions.query({name:'geolocation'}).then(s=>{if(s.state==='granted')requestLocation();else showFirstLocationChoice()}).catch(showFirstLocationChoice)}else showFirstLocationChoice();
  if(!window.isSecureContext){toast('Para activar ubicación, entra mediante HTTPS en Netlify.');}
  if('serviceWorker' in navigator&&window.isSecureContext){window.addEventListener('load',()=>navigator.serviceWorker.register('/service-worker.js').catch(()=>{}))}
}
document.addEventListener('DOMContentLoaded',startup);

window.addEventListener('wtg-language-changed',()=>{if(typeof renderAll==='function'&&document.getElementById('home-list'))renderAll();});

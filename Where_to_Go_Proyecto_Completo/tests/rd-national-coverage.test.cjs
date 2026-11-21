const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..','public');
const source=filename=>fs.readFileSync(path.join(root,filename),'utf8');
test('Los 158 municipios corresponden a las 32 demarcaciones del catálogo territorial',()=>{
 const municipalities=JSON.parse(source('data/municipios-rd.json'));
 const window={};vm.runInNewContext(source('province-heroes.js'),{window});
 const regions=Object.keys(window.WTG_PROVINCE_HEROES);
 assert.equal(regions.length,32);
 assert.equal(municipalities.length,158);
 assert.equal(new Set(municipalities.map(p=>p.adm2_code)).size,158);
 for(const m of municipalities){
   assert(regions.includes(m.provincia),'Provincia no registrada: '+m.provincia);
   assert(m.municipio&&m.adm2_code);
 }
});
test('La navegación usa el mismo inicio en todas las ciudades, no solo Las Terrenas',()=>{
 const app=source('app.js'),world=source('world-explorer.js');
 assert(!app.includes("if(c.name==='Las Terrenas')navigate('explorar')"));
 assert(app.includes("function selectCity(name)"));
 assert(app.includes("navigate('inicio');window.dispatchEvent(new CustomEvent('wtg-destination-changed'))"));
 assert(app.includes("state.province=country==='DO'?canonicalProvince(selection.region):''"));
 assert(app.includes("state.region=country==='DO'?(selection.region||'República Dominicana')"));
 assert(!world.includes("new CustomEvent('wtg-world-return-pilot'"),'No duplicar la carga de un municipio');
 const html=source('index.html');
 for(const id of ['wtg-area-discovery','wtg-area-options','wtg-area-status']){
   assert(html.includes('id="'+id+'"'));
 }
 assert(html.includes('src="/municipality-geocoder.js?v=1"'));
 assert(html.includes('src="/area-discovery.js?v=1"'));
});
test('Resolver reutiliza un centro verificado sin consultar un servicio ni confundir provincias',async()=>{
 const cache=new Map();
 const window={localStorage:{getItem:k=>cache.get(k)||null,setItem:(k,v)=>cache.set(k,v)},
   WTG_GEOGRAPHY:{cities:country=>country==='DO'?[
    {city:'Puerto Plata',region:'Puerto Plata',lat:19.7934,lon:-70.6884},
    {city:'Santo Domingo',region:'Distrito Nacional',lat:18.4861,lon:-69.9312},
    {city:'Santo Domingo Este',region:'Santo Domingo',lat:18.486,lon:-69.852},
    {city:'Santiago',region:'Santiago',lat:19.4517,lon:-70.697}
   ]:[]}};
 vm.runInNewContext(source('municipality-geocoder.js'),{window,console});
 const api=window.WTG_MUNICIPAL_GEOCODER;
 let p=await api.locate({city:'Santiago',province:'Santiago'});
 assert.equal(p.lat,19.4517);
 assert.equal((await api.locate({city:'Puerto Plata',province:'Puerto Plata'})).lon,-70.6884);
 assert.equal((await api.locate({city:'Santo Domingo',province:'Distrito Nacional'})).lon,-69.9312);
 assert.equal((await api.locate({city:'Santo Domingo Este',province:'Santo Domingo'})).lon,-69.852);
 assert(api.remember('La Altagracia','Higüey',18.615,-68.708));
 assert.equal((await api.locate({city:'Higüey',province:'La Altagracia'})).lat,18.615);
});
test('Zonas norte/sur/este/oeste se desplazan desde el municipio real sin alterar su nombre',()=>{
 const nodes={};
 for(const id of ['wtg-area-discovery','wtg-area-options','wtg-area-title','wtg-area-status'])
  nodes[id]={hidden:false,dataset:{},innerHTML:'',textContent:''};
 const events={};let requests=0;
 const fakeWindow={WTG_ACTIVE_COUNTRY:'DO',addEventListener:(name,fn)=>{events[name]=fn}};
 const fakeDocument={
  readyState:'loading',getElementById:id=>nodes[id],
  addEventListener:(name,fn)=>{events['document:'+name]=fn}
 };
 const state={mode:'municipio',city:'Puerto Plata',province:'Puerto Plata',
  lat:19.7934,lon:-70.6884,radius:12000,search:'',category:'todos',exploreLimit:80};
 const context={window:fakeWindow,document:fakeDocument,state,
  navigate:view=>assert.equal(view,'inicio'),
  loadPlaces:()=>{requests++;return Promise.resolve();},console};
 vm.runInNewContext(source('area-discovery.js'),context);
 const api=fakeWindow.WTG_AREA_DISCOVERY;api.reset();
 assert.equal(nodes['wtg-area-discovery'].hidden,false);
 api.choose('este');
 assert(state.lon>-70.6884,'Este debe mover el centro al este');
 assert.equal(state.city,'Puerto Plata');
 assert.equal(state.mode,'sector');
 api.choose('centro');
 assert.equal(state.lat,19.7934);
 assert.equal(state.lon,-70.6884);
 assert.equal(state.mode,'municipio');
 state.city='Santiago';state.province='Santiago';
 state.lat=19.4517;state.lon=-70.697;state.radius=12000;
 events['wtg-destination-changed']();
 api.choose('norte');
 assert(state.lat>19.4517);
 assert.equal(state.province,'Santiago');
 assert.equal(requests,3);
 fakeWindow.WTG_ACTIVE_COUNTRY='US';
 api.refresh();
 assert.equal(nodes['wtg-area-discovery'].hidden,true,'No fingir zonas dominicanas en otro país');
});

test('El catálogo visual prioriza fotografías auténticas en cualquier provincia sin ocultar definitivamente fichas sin foto',()=>{
 const app=source('app.js');
 const first=app.indexOf('function renderExplore(){'),last=app.indexOf('\nfunction renderFavorites(){',first);
 assert(first>=0&&last>first);
 const code=app.slice(first,last);
 const nodes=new Map();
 const $=id=>{
   if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',value:'',
     querySelectorAll:()=>[]});
   return nodes.get(id);
 };
 const places=[
   {id:'osm-1',name:'Negocio sin imagen',cat:'restaurantes',source:'osm',distance:200,photo:''},
   {id:'google-1',name:'Lugar con foto Google',cat:'atracciones',source:'google',distance:1300,photo:'https://example.com/exact-photo.jpg'},
   {id:'osm-2',name:'Playa con foto propia',cat:'playas',source:'osm',distance:600,photo:'https://example.com/real-place.jpg'},
   {id:'google-2',name:'Negocio Google sin foto',cat:'restaurantes',source:'google',distance:90,photo:''}
 ];
 const state={places,category:'todos',search:'',showUnpictured:false,exploreLimit:80,
   dataMode:'live',city:'Santiago de los Caballeros',radius:12000};
 const vmContext={state,$,window:{WTG_GOOGLE_PLACES:{configured:()=>false}},
   wtgPhotoBudget:0,wtgPhotoMatching:false,wtgGoogleStage:0,wtgGoogleBusy:false,
   candidatesForGooglePhoto:()=>[],matches:()=>true,hasCatalogPhoto:p=>!!p.photo,
   distance:n=>String(n),placeCard:p=>p.name+'|',emptyBlock:()=>'',console};
 vm.runInNewContext(code,vmContext);
 vm.runInNewContext('renderExplore()',vmContext);
 const firstView=$('explore-list').innerHTML;
 assert(firstView.includes('Lugar con foto Google'));
 assert(firstView.includes('Playa con foto propia'));
 assert(!firstView.includes('Negocio sin imagen'));
 assert(!firstView.includes('Negocio Google sin foto'));
 assert(firstView.indexOf('Lugar con foto Google')<firstView.indexOf('Playa con foto propia'));
 assert(firstView.includes('Ver también 2 lugares sin fotografía'));
 state.showUnpictured=true;
 vm.runInNewContext('renderExplore()',vmContext);
 assert($('explore-list').innerHTML.includes('Negocio sin imagen'));
 assert($('explore-list').innerHTML.includes('Negocio Google sin foto'));
 assert($('explore-list').innerHTML.includes('Mostrar solo lugares con fotos'));
 state.showUnpictured=false;
 places.forEach(p=>p.photo='');
 vm.runInNewContext('renderExplore()',vmContext);
 assert($('explore-list').innerHTML.includes('Negocio sin imagen'),'Si Google no tiene fotos, nunca presentar una ciudad como vacía');
});

test('La búsqueda fotográfica funciona por municipio o sector visitado, con límites de consultas pagadas',()=>{
 const app=source('app.js');
 assert(app.includes('async function enrichPhotographedDestinations(token)'));
 assert(app.includes("wtgNationalPhotoLookups.size>=24"));
 assert(app.includes("query:'lugares turísticos y atractivos para visitar en '+city+', '+province+', República Dominicana'"));
 assert(app.includes("haversine(state.lat,state.lon,p.lat,p.lon)<=state.radius+100"));
 assert(app.includes("void enrichPhotographedDestinations(token);"));
 assert(app.includes("navigate(c.name==='Las Terrenas'?'explorar':'inicio')"));
});

test('Las 32 portadas tienen fotografía real, fuente, autor y licencia',()=>{
 const window={};vm.runInNewContext(source('province-heroes.js'),{window});
 const heroes=window.WTG_PROVINCE_HEROES;
 assert.equal(Object.keys(heroes).length,32);
 for(const [province,hero] of Object.entries(heroes)){
   assert(hero.photo.startsWith('https://'),province+' sin portada publicada');
   assert(hero.source.startsWith('https://'),province+' sin fuente');
   assert(hero.author&&hero.license,province+' sin atribución y licencia');
 }
});

test('Las fotografías del atlas no se atribuyen a negocios y solo se usan cerca de su provincia',()=>{
 const atlas=source('photo-atlas.js');
 const home=source('experience.js');
 assert(atlas.includes('function scenesForLocation({lat,lon,province,radius=12000,max=6}'));
 assert(atlas.includes('photo.province===province'));
 assert(atlas.includes('distance(lat,lon,photo.lat,photo.lon)<=radiusM'));
 assert(atlas.includes('scenicTitle.test('));
 assert(atlas.includes("kind:'geotagged-scenery'"));
 assert(atlas.includes('window.WTG_PHOTO_ATLAS={refresh:refreshNearbyStrip,scenesForLocation}'));
 assert(home.includes("window.WTG_PHOTO_ATLAS?.scenesForLocation?.({"));
 assert(home.includes("[...iconic,...localReal,...scenic,...slides]"));
 assert(home.includes("window.addEventListener('wtg-photo-atlas-ready',update)"));
 assert(!source('app.js').includes('scenesForLocation({lat:p.lat'),'No asignar paisajes a fichas ajenas');
});

test('Si una foto Google falla, usa la siguiente imagen auténtica de ese mismo lugar',()=>{
 const app=source('app.js');
 const start=app.indexOf('function placeCoverUrl(');
 const end=app.indexOf('function isVisibleBusiness(',start);
 assert(start>=0&&end>start);
 const broken=new Set();
 const p={photo:'https://example.com/failed.jpg',photos:[
   {url:'https://example.com/second-real-photo.jpg',
     source:'https://maps.google.com/place/123',attribution:'Autor del lugar'}]};
 const ctx={wtgUnavailableImageUrls:broken,
   safeUrl:u=>/^https:\/\//.test(u||'')?u:'',
   placeGalleryPhotos:row=>row.photos||[],
   console};
 ctx.place=p;
 vm.runInNewContext(app.slice(start,end),ctx);
 assert.equal(vm.runInNewContext('placeCoverUrl(place)',ctx),
   'https://example.com/failed.jpg');
 broken.add('https://example.com/failed.jpg');
 assert.equal(vm.runInNewContext('placeCoverUrl(place)',ctx),
   'https://example.com/second-real-photo.jpg');
 broken.add('https://example.com/second-real-photo.jpg');
 assert.equal(vm.runInNewContext('placeCoverUrl(place)',ctx),'');
 assert(app.includes('coverPhoto=placeCoverUrl(p)'));
 assert(app.includes("const src=placeCoverUrl(p);"));
});

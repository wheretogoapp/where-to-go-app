const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..', 'public');
const adapter = fs.readFileSync(path.join(root, 'google-places-adapter.js'), 'utf8');

function configuredBrowser(googleKey = 'AIzaTestKeyForBrowserOnly1234567890') {
  const queries = [];
  const place = {
    id: 'ChIJtest1234567',
    displayName: 'Restaurante Ejemplo',
    formattedAddress: 'Puerto Plata, República Dominicana',
    location: {lat: () => 19.79, lng: () => -70.69},
    types: ['restaurant'],
    googleMapsURI: 'https://maps.google.com/?q=test',
    photos: [{
      getURI: ({maxWidth}) => {
        assert.equal(maxWidth, 720);
        return 'https://example.com/google-photo.jpg';
      },
      authorAttributions: [{displayName: 'Fotógrafo del lugar', uri: 'https://maps.google.com/author'}]
    }]
  };
  const window = {
    WTG_GOOGLE_MAPS_KEY: googleKey,
    google: {maps: {importLibrary: async name => {
      assert.equal(name, 'places');
      return {Place: {searchNearby: async options => {
        queries.push(options);
        return {places: [place]};
      }}};
    }}}
  };
  vm.runInNewContext(adapter, {window, console});
  return {api: window.WTG_GOOGLE_PLACES, queries};
}

test('Google devuelve fotografía y atribución del lugar exacto', async () => {
  const {api, queries} = configuredBrowser();
  assert.equal(api.configured(), true);
  const result = await api.nearby({lat: 19.7934, lon: -70.6884, radius: 12000, category: 'restaurantes'});
  assert.equal(result.status, 'ok');
  assert.equal(result.places.length, 1);
  assert.equal(result.places[0].photo, 'https://example.com/google-photo.jpg');
  assert.equal(result.places[0].photoAttributions[0].displayName, 'Fotógrafo del lugar');
  assert.equal(result.places[0].googlePlaceId, 'ChIJtest1234567');
  assert.equal(queries.length, 2);
  assert.equal(queries[0].includedPrimaryTypes[0], 'restaurant');
  assert.equal(queries[1].includedPrimaryTypes[0], 'fast_food_restaurant');
});

test('Exploración general consulta diez sectores comerciales de Google Places', async () => {
  const {api, queries} = configuredBrowser();
  const result = await api.nearby({lat: 19.7934, lon: -70.6884, category: 'todos'});
  assert.equal(queries.length, 10);
  assert.equal(result.places.length, 1);
  assert.ok(queries.every(x => x.maxResultCount <= 20));
});

test('Categorías de playa se consultan como lugares reales', async () => {
  const {api, queries} = configuredBrowser();
  const result = await api.nearby({lat: 19.7934, lon: -70.6884, category: 'playas'});
  assert.equal(result.status, 'ok');
  assert.equal(queries.length, 1);
  assert.equal(queries[0].includedPrimaryTypes[0], 'beach');
});

test('Sin clave la API no inicia consultas', async () => {
  const {api, queries} = configuredBrowser('');
  assert.equal(api.configured(), false);
  const result = await api.nearby({lat: 19.7934, lon: -70.6884});
  assert.equal(result.status, 'unconfigured');
  assert.equal(queries.length, 0);
});

test('La app integra Google Places con la búsqueda dominicana', () => {
  const code = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  assert.ok(code.includes('void enrichDominicanGooglePlaces(token,()=>state.remotePlaces)'));
  assert.ok(code.includes('applyNearby([], \'Directorio cartográfico no disponible'));
  assert.ok(code.includes('isVisibleBusiness(p)'));
  assert.ok(code.includes('photoAttributions:p.photoAttributions||[]'));
});


test('Nombres cercanos coinciden sin mezclar negocios distintos', () => {
  const {api}=configuredBrowser();
  assert.equal(api.sameEstablishment('Kabuki', 'Kabuki Sushi Bar'),true);
  assert.equal(api.sameEstablishment('El Kabuki', 'Kabuki Sushi Bar'),false);
  assert.equal(api.sameEstablishment('Kabuki', 'Kabuki Inn'),true);
  assert.equal(api.sameEstablishment('La Casa', 'Casa Phil'),false);
  assert(api.meters(19.79,-70.69,19.7901,-70.69)<20);
  assert(api.meters(19.79,-70.69,19.8,-70.69)>100);
});

test('Buscar foto puntual acepta solo el mismo nombre a menos de 160m', async () => {
  const calls=[];
  const fakePhotos = [{getURI:()=> 'https://example.com/correct-business.jpg',
    authorAttributions:[{displayName:'Dueño',uri:'https://maps.google.com/profile'}]}];
  const makePlace = (name,lat,lon) => ({id:name,displayName:name,location:{lat:()=>lat,lng:()=>lon},photos:fakePhotos,googleMapsURI:'https://maps.google.com/search'});
  const google = {maps:{importLibrary:async()=>({Place:{searchByText:async args=>{
    calls.push(args);
    return {places:[makePlace('Casa Phil',19.7934,-70.6884),makePlace('Kabuki Sushi Bar',19.7935,-70.6884),makePlace('Kabuki Inn',19.811,-70.6884)]};
  }}})}};
  const window={WTG_GOOGLE_MAPS_KEY:'AIzaTestKeyForBrowserOnly1234567890',google};
  vm.runInNewContext(adapter,{window,console});
  const match=await window.WTG_GOOGLE_PLACES.matchPhoto({name:'Kabuki',lat:19.7934,lon:-70.6884});
  assert.equal(match.status,'ok');
  assert.equal(match.name,'Kabuki Sushi Bar');
  assert.equal(match.photo,'https://example.com/correct-business.jpg');
  assert.equal(match.photoAttributions[0].displayName,'Dueño');
  assert.equal(calls.length,1,'Solo una llamada iniciada al solicitar foto');
  assert.equal(calls[0].maxResultCount,5);
});

test('Sin coincidencia exacta no se atribuye foto de negocio vecino', async () => {
  const google={maps:{importLibrary:async()=>({Place:{searchByText:async()=>({places:[
    {id:'wrong',displayName:'Casa Phil',location:{lat:()=>19.7934,lng:()=>-70.6884},photos:[{getURI:()=> 'https://example.com/wrong.jpg'}]}
  ]})}})}};
  const window={WTG_GOOGLE_MAPS_KEY:'AIzaTestKeyForBrowserOnly1234567890',google};
  vm.runInNewContext(adapter,{window,console});
  const result=await window.WTG_GOOGLE_PLACES.matchPhoto({name:'Kabuki',lat:19.7934,lon:-70.6884});
  assert.equal(result.status,'not-found');
});

test('Ficha local con foto Google exige atribución y búsqueda puntual manual', () => {
  const code=fs.readFileSync(path.join(root,'app.js'),'utf8');
  assert(code.includes('data-fetch-google-photo'));
  assert(code.includes('googlePhotoAttributions'));
  assert(code.includes('window.WTG_GOOGLE_PLACES.sameEstablishment'));
  assert(code.includes('window.WTG_GOOGLE_PLACES.meters'));
  assert(code.includes('Foto: <a href='));
});


test('Fotos progresivas de RD tienen límite de consultas y son efímeras',()=>{
  const code=fs.readFileSync(path.join(root,'app.js'),'utf8');
  assert(code.includes('wtgPhotoBudget=48'));
  assert(code.includes('void enrichVisiblePhotoCards(token,6)'));
  assert(code.includes('data-more-photo'));
  assert(code.includes('matchPhoto({name:p.name,lat:p.lat,lon:p.lon})'));
  assert(code.includes('void fetchVerifiedGooglePhoto(id)'));
  assert(code.includes('state.search?('));
});


test('Galerías de Google incluyen varias fotos del mismo negocio y créditos',async()=>{
 const {api}=configuredBrowser();
 const result=await api.nearby({lat:19.7934,lon:-70.6884,category:'restaurantes'});
 assert.equal(result.status,'ok');
 const place=result.places[0];
 assert.equal(place.photos.length,1);
 assert.equal(place.photos[0].source,'https://maps.google.com/?q=test');
 assert.equal(place.photos[0].provider,'google');
 assert.equal(place.photos[0].attribution,'Fotógrafo del lugar');
 assert.equal(place.photo,place.photos[0].url);
 const code=fs.readFileSync(path.join(root,'app.js'),'utf8');
 assert(code.includes('p.googlePhotos'));
 assert(code.includes('googlePhotos:p.photos||[]'));
 assert(code.includes("if(!url||!source||!attribution||seen.has(url))continue"));
});

test('Nombres con un pequeño error ortográfico se revisan con control geográfico',()=>{
 const {api}=configuredBrowser();
 assert.equal(api.sameEstablishment('Wing and Waffle','Wings and Waffle'),true);
 assert.equal(api.sameEstablishment('Mirian Billar','Miriam Billar'),true);
 assert.equal(api.sameEstablishment('Ocean Disco','Ocean Disco Cabarete'),true);
 assert.equal(api.sameEstablishment('Ocean Disco','Ocean Beach Resort'),false);
 assert.equal(api.sameEstablishment('El Negro','El Negocio'),false);
 assert(api.meters(19.79,-70.69,19.791,-70.69)>85);
});


test('Compras, belleza, farmacias y gimnasios son categorías consultables',async()=>{
  const {api,queries}=configuredBrowser();
  for(const [category,type] of [
    ['supermercados','supermarket'],['barberias','barber_shop'],
    ['salones','beauty_salon'],['farmacias','pharmacy'],
    ['unas','nail_salon'],['talleres','car_repair']]){
    const before=queries.length;
    const results=await api.nearby({lat:19.7934,lon:-70.6884,category});
    assert.equal(results.status,'ok',category);
    assert(queries.length>before,category);
    assert.equal(queries[before].includedPrimaryTypes[0],type,category);
  }
});
test('Descubrir más consulta un lote complementario de diez clases',async()=>{
  const {api,queries}=configuredBrowser();
  const result=await api.nearby({lat:19.7934,lon:-70.6884,category:'todos',batch:'extra'});
  assert.equal(result.status,'ok');
  assert.equal(queries.length,10);
  assert(queries.some(r=>r.includedPrimaryTypes[0]==='shopping_mall'));
  assert(queries.some(r=>r.includedPrimaryTypes[0]==='car_wash'));
  assert(queries.every(r=>r.maxResultCount<=20));
});
test('Búsqueda por nombre devuelve exclusivamente fichas con fotos reales',async()=>{
  const request=[];
  const place={
    id:'ChIJwing',displayName:'Wing and Waffle',types:['restaurant'],
    formattedAddress:'Puerto Plata, República Dominicana',
    location:{lat:()=>19.7934,lng:()=>-70.6884},
    googleMapsURI:'https://maps.google.com/?q=wing-waffle',
    photos:[{getURI:()=> 'https://example.com/wing-waffle.jpg',
      authorAttributions:[{displayName:'Autor verificado',uri:'https://maps.google.com/author'}]}]
  };
  const Place={searchByText:async args=>{
    request.push(args);
    return {places:[place,{...place,id:'sin-foto',photos:[]}]};
  }};
  const window={
    WTG_GOOGLE_MAPS_KEY:'AIzaTestKeyForBrowserOnly1234567890',
    google:{maps:{importLibrary:async()=>({Place})}}
  };
  vm.runInNewContext(adapter,{window,console});
  const res=await window.WTG_GOOGLE_PLACES.searchText({query:'Wing and Waffle',lat:19.7934,lon:-70.6884});
  assert.equal(res.status,'ok');
  assert.equal(res.places.length,1);
  assert.equal(res.places[0].name,'Wing and Waffle');
  assert.equal(res.places[0].photo,'https://example.com/wing-waffle.jpg');
  assert.equal(request.length,1);
});
test('Portada destaca fotos; Explorar conserva fichas reales sin fotografía',()=>{
  const code=fs.readFileSync(path.join(root,'app.js'),'utf8');
  assert(code.includes('function hasCatalogPhoto('));
  assert(code.includes('function isVisibleBusiness('));
  assert(code.includes('renderLocalDiscovery()'));
  assert(code.includes('state.places.filter(p=>matches(p)&&'));
  assert(code.includes("p.nameKnown!==false&&String(p.name||'').trim()"));
  for(const id of ['supermercados','farmacias','barberias','salones','unas','tecnologia','gimnasios','bancos'])
    assert(code.includes("'"+id+"'"),id);
  assert(code.includes('data-google-more'));
  assert(code.includes('data-show-all-cats'));
  assert(code.includes('runGoogleBusinessSearch'));
});

test('Se pueden consultar varios sectores reales del mismo municipio sin repetir el centro',async()=>{
  const {api,queries}=configuredBrowser();
  const stages=api.scanStages();
  assert.equal(stages.length,13);
  assert(stages.some(s=>s.batch==='tourism'));
  assert(stages.some(s=>s.sector==='north'));
  assert(stages.some(s=>s.sector==='east'));
  const north=await api.nearby({lat:19.7934,lon:-70.6884,radius:12000,category:'todos',batch:'districts',sector:'north'});
  assert.equal(north.status,'ok');
  assert.equal(queries.length,10);
  assert(queries.every(x=>x.locationRestriction.center.lat>19.7934));
  assert(queries.every(x=>x.maxResultCount<=20));
  queries.length=0;
  const west=await api.nearby({lat:19.7934,lon:-70.6884,radius:12000,category:'todos',batch:'districts',sector:'west'});
  assert.equal(west.status,'ok');
  assert.equal(queries.length,10);
  assert(queries.every(x=>x.locationRestriction.center.lng<-70.6884));
});
test('Al ampliar, fusionar por Place ID y conservar negocios sin fotografía',()=>{
  const code=fs.readFileSync(path.join(root,'app.js'),'utf8');
  assert(code.includes('mergeGoogleListings('));
  assert(code.includes('window.WTG_GOOGLE_PLACES.scanStages()'));
  assert(code.includes('wtgGoogleStage++'));
  assert(code.includes('existingIds.has(google.id)'));
  assert(code.includes('if(google.photo&&safeUrl(google.photo))withPhoto++'));
  assert(code.includes("batch:'essentials'"));
  assert(code.includes('data-google-more'));
});

test('Ampliación manual recorre como máximo dos sectores por toque',()=>{
 const src=fs.readFileSync(path.join(root,'app.js'),'utf8');
 assert(src.includes('for(let part=0;part<2&&wtgGoogleStage<stages.length;part++)'));
 assert(src.includes("batch:stage.batch,sector:stage.sector"));
 assert(src.includes("Google: '+added+' negocios nuevos con foto"));
});
test('Búsqueda inicial también incorpora negocios cotidianos sin consumir la exploración de sectores',()=>{
 const {api}=configuredBrowser();
 const stages=api.scanStages();
 assert(stages[0].sector==='center');
 assert(stages[1].sector==='north');
 assert(stages[2].sector==='east');
 const src=fs.readFileSync(path.join(root,'app.js'),'utf8');
 assert(src.includes("batch:'essentials'"));
 assert(src.includes("if(state.category==='todos'&&result?.status!=='error')"));
});

test('Catálogo local caído no desactiva Google Places y no duplica negocios al llegar las celdas',()=>{
 const src=fs.readFileSync(path.join(root,'app.js'),'utf8');
 assert(src.includes("applyNearby([], 'Directorio cartográfico no disponible; consultando negocios reales en Google Maps…')"));
 assert(src.includes('window.WTG_GOOGLE_PLACES.sameEstablishment(p.name,google.name)'));
 assert(src.includes('wtgGoogleNearby=unmatched;'));
});
test('Cada sector usa una región de búsqueda menor que el radio completo',async()=>{
 const {api,queries}=configuredBrowser();
 await api.nearby({lat:19.7934,lon:-70.6884,radius:30000,category:'todos',batch:'districts',sector:'east'});
 assert(queries.length>0&&queries.every(q=>q.locationRestriction.radius<30000));
 const shifted=queries[0].locationRestriction.center.lng;
 assert(shifted>-70.6884);
});

test('Cobertura territorial: 32 demarcaciones, 158 municipios y nueve municipios de Puerto Plata',()=>{
  const entries=JSON.parse(fs.readFileSync(path.join(root,'data','municipios-rd.json'),'utf8'));
  assert.equal(entries.length,158);
  const provinces=new Set(entries.map(p=>p.provincia));
  assert.equal(provinces.size,32);
  assert.equal(new Set(entries.map(p=>p.provincia+'|'+p.municipio)).size,158);
  for(const name of ['Puerto Plata','Santiago','Distrito Nacional','La Altagracia','Samaná','La Romana'])
    assert(provinces.has(name),name);
  const pp=entries.filter(p=>p.provincia==='Puerto Plata').map(p=>p.municipio);
  assert.equal(pp.length,9);
  for(const name of ['Puerto Plata','Sosúa','Imbert','Altamira','Guananico','Luperón','Los Hidalgos','Villa Isabela','Villa Montellano'])
    assert(pp.includes(name),name);
  const selector=fs.readFileSync(path.join(root,'world-explorer.js'),'utf8');
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  assert(selector.includes("fetch('/data/municipios-rd.json'"));
  assert(selector.includes("country.value==='DO'"));
  assert(app.includes('district-cabarete'));
  assert(app.includes('zone-puntacana'));
  assert(app.includes('zone-bavaro'));
});

test('La portada ofrece categorías en movimiento y cuenta negocios reales',()=>{
  const src=fs.readFileSync(path.join(root,'app.js'),'utf8');
  assert(src.includes("shortcuts.innerHTML=CATEGORIES.filter(cat=>!['escuelas','iglesias'].includes(cat.id))"));
  assert(src.includes('startCategoryRotation(shortcuts)'));
  assert(src.includes('state.places.filter(p=>p&&p.nameKnown!==false'));
  assert(src.includes('const withPhoto=arr.filter(hasCatalogPhoto).length'));
});
test('Apertura móvil con logo, bienvenida, elección de ubicación y login',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const onboarding=fs.readFileSync(path.join(root,'onboarding.js'),'utf8');
  const main=fs.readFileSync(path.join(root,'app.js'),'utf8');
  for(const id of ['wtg-ob-splash','wtg-ob-welcome','wtg-ob-location','wtg-ob-start','wtg-ob-manual','wtg-ob-allow-gps'])
    assert(html.includes('id="'+id+'"'),id);
  assert(html.includes('src="/onboarding.js?v=2"'));
  assert(html.includes('src="/auth.js?v=13"'));
  assert(html.includes('window.WTG_ONBOARDING_ENABLED=true'));
  assert(onboarding.includes("new Event('wtg-world-request-gps')"));
  assert(onboarding.includes('wtg-world-selected'));
  assert(main.includes('if(window.WTG_ONBOARDING_ENABLED)'));
  assert(fs.statSync(path.join(root,'onboarding.css')).size>1000);
});

test('El carrusel retira fotos que fallan',()=>{
 const src=fs.readFileSync(path.join(root,'experience.js'),'utf8');
 assert(src.includes("s.items=s.items.filter(item=>item.id!==x.id)"));
});

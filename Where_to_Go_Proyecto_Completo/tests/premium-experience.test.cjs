const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..','public');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('El carrusel de destinos no queda oculto en iPhone por un tema antiguo',()=>{
 const html=read('index.html'),css=read('local-discovery.css');
 assert(html.indexOf('/navy-gold-mobile.css')<html.indexOf('/local-discovery.css'));
 assert(css.includes('#view-inicio .hero{'));
 assert(css.includes('display:block!important'));
 const app=read('app.js');
 assert(app.includes('startDestinationRotation(rail)'));
 const experience=read('experience.js');
 assert(experience.includes('brokenPhotos.add(signature)'));
});

test('Categorías naturales descubren negocios por texto con una consulta limitada',async()=>{
 const source=read('google-places-adapter.js'),queries=[];
 const place=(id,lat,lon)=>({
   id,displayName:id,location:{lat:()=>lat,lng:()=>lon},
   googleMapsURI:'https://maps.google.com/?q='+id,
   formattedAddress:'Puerto Plata, República Dominicana',types:['tourist_attraction'],photos:[]
 });
 const window={WTG_GOOGLE_MAPS_KEY:'AIzaTestKeyForBrowserOnly1234567890',
   google:{maps:{importLibrary:async name=>{
     assert.equal(name,'places');
     return {Place:{searchByText:async args=>{
       queries.push(args);
       return {places:[place('Cascada Puerto Plata',19.794,-70.688),place('Cascada remota',18.5,-68.7)]};
     }}};
   }}}};
 vm.runInNewContext(source,{window,console});
 const api=window.WTG_GOOGLE_PLACES;
 const result=await api.searchCategory({category:'cascadas',lat:19.7934,lon:-70.6884,radius:7500,city:'Puerto Plata'});
 assert.equal(result.status,'ok');
 assert.equal(result.places.length,1);
 assert.equal(result.places[0].name,'Cascada Puerto Plata');
 assert.equal(result.places[0].photo,'');
 assert.equal(queries.length,1);
 assert.equal(queries[0].maxResultCount,20);
 assert(queries[0].textQuery.includes('Puerto Plata'));
 const unsupported=await api.searchCategory({category:'no-existe',lat:19.7934,lon:-70.6884});
 assert.equal(unsupported.status,'unsupported');
 assert.equal(queries.length,1);
});

test('La pantalla de acceso y la ubicación son reales, no un diálogo falso',()=>{
 const html=read('index.html'),onboarding=read('onboarding.js'),auth=read('auth.js');
 for(const id of ['wtg-ob-splash','wtg-ob-manual','wtg-ob-allow-gps','auth-gate'])
   assert(html.includes('id="'+id+'"'));
 assert(onboarding.includes('setTimeout(requestNativeLocation,100)'));
 assert(onboarding.includes("new Event('wtg-world-request-gps')"));
 assert(onboarding.includes("WTG_auth?.showLogin?.()"));
 assert(auth.includes('signInWithOAuth'));
});

test('El paquete móvil prefiere archivos nuevos y conserva navegación fuera de línea',()=>{
 const sw=read('service-worker.js');
 assert(sw.includes("where-to-go-shell-v12-destination-discovery"));
 assert(sw.includes("cache:'no-store'"));
 assert(sw.includes("'/onboarding.js'"));
 assert(sw.includes("'/local-discovery.css'"));
});

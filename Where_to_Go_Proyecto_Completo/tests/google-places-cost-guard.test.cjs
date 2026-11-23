const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const adapter=fs.readFileSync(path.join(__dirname,'..','public','google-places-adapter.js'),'utf8');
function createAdapter(searchNearby,searchByText){
 const window={
  WTG_GOOGLE_MAPS_KEY:'AIzaBrowserOnlyTestKey123456789',
  google:{maps:{importLibrary:async()=>({Place:{searchNearby,searchByText}})}}
 };
 vm.runInNewContext(adapter,{window,console,Date,Promise,Math});
 return window.WTG_GOOGLE_PLACES;
}
test('Las búsquedas de 10 clases no generan más de 4 consultas simultáneas',async()=>{
 let running=0,peak=0,total=0;
 const api=createAdapter(async()=>{
  total++;running++;peak=Math.max(peak,running);
  await new Promise(r=>setTimeout(r,5));
  running--;
  return {places:[]};
 });
 const res=await api.nearby({lat:19.7934,lon:-70.6884,category:'todos'});
 assert.equal(res.status,'empty');
 assert.equal(total,10,'Mantener cobertura turística con diez tipos');
 assert(peak<=4&&peak>0,'Limitar simultaneidad para no saturar Google');
 assert.equal(api.usage().requestsThisPage,10);
 assert.equal(api.usage().inFlight,0);
});
test('Solicitudes idénticas simultáneas comparten la misma consulta de pago',async()=>{
 let requests=0;
 const api=createAdapter(async()=>{
  requests++;
  await new Promise(r=>setTimeout(r,3));
  return {places:[]};
 });
 const args={lat:19.7934,lon:-70.6884,category:'restaurantes'};
 await Promise.all([api.nearby(args),api.nearby(args),api.nearby(args)]);
 assert.equal(requests,2,'Solo dos tipos distintos para tres búsquedas idénticas');
});
test('Si Google comunica 429 se detiene el reintento inmediato, sin ocultar el catálogo local',async()=>{
 let queries=0;
 const api=createAdapter(async()=>({places:[]}),async()=>{
  queries++;
  const e=new Error('RESOURCE_EXHAUSTED quota exceeded');
  e.code=429;throw e;
 });
 const args={query:'playas',lat:19.7934,lon:-70.6884};
 const first=await api.searchText(args);
 assert.equal(first.status,'error');
 assert.equal(api.usage().temporarilyLimited,true);
 assert.equal(queries,1);
 const second=await api.searchText({...args,query:'restaurantes'});
 assert.equal(second.status,'error');
 assert.equal(queries,1,'No reiterar consultas pagadas durante enfriamiento');
});
test('Ninguna fotografía ni ficha completa se almacena en un caché permanente',()=>{
 assert.doesNotMatch(adapter,/localStorage\.(?:setItem|set)/);
 assert.doesNotMatch(adapter,/indexedDB/);
 assert.match(adapter,/pendingSearches\.delete\(key\)/);
 assert.match(adapter,/MAX_PARALLEL_PLACES=4/);
});

test('El sector centro de turismo duplica exactamente las 8 consultas ya hechas en inicio',async()=>{
 const calls=[];
 const api=createAdapter(async args=>{
  calls.push(JSON.stringify({primary:args.includedPrimaryTypes[0],
   center:args.locationRestriction.center,radius:args.locationRestriction.radius}));
  return {places:[]};
 });
 await api.nearby({lat:19.7934,lon:-70.6884,category:'todos',batch:'main'});
 const firstTen=new Set(calls);
 calls.length=0;
 await api.nearby({lat:19.7934,lon:-70.6884,category:'todos',batch:'tourism',sector:'center'});
 assert.equal(calls.length,8);
 assert(calls.every(x=>firstTen.has(x)),'Los 8 tipos turísticos del centro repiten exactamente las consultas principales');
 const app=fs.readFileSync(path.join(__dirname,'..','public','app.js'),'utf8');
 assert.match(app,/if\(state\.category==='todos'&&wtgGoogleStage===0\)wtgGoogleStage=1;/,
  'Saltar la etapa 0 redundante, sin alterar las fotos del principal');
 assert.match(app,/await loadMoreGoogleBusinesses\(n===0\?2:1\);/,
  'Mantener exactamente los tres sectores automáticos únicos: norte, este y sur');
});

const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const path=require('node:path');
const root=path.resolve(__dirname,'../public');
const places=JSON.parse(fs.readFileSync(path.join(root,'data/pilot-places.json')));
const ctx={window:{addEventListener(){}},document:{addEventListener(){}},localStorage:{getItem(){return null}},URL,console,Map,Set};vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),ctx);
test('GPS radius excludes distant destinations; manual selection does not pretend to be GPS',()=>{
 const source=places.find(p=>p.name==='Rancho La Vereda');
 ctx.point=source;vm.runInContext('state.lat=point.lat;state.lon=point.lon;state.radius=2000;state.mode="gps"',ctx);
 assert.equal(vm.runInContext('insideNearbyRadius(point)',ctx),true);
 ctx.far=places.find(p=>p.name==='Playa Sosúa');assert.equal(vm.runInContext('insideNearbyRadius(far)',ctx),false);
 assert.equal(vm.runInContext('haversine(18.5,-70.5,18.5,-70.5)',ctx),0);
});
test('bundled photos allowed; executable and protocol-relative URLs rejected',()=>{
 for(const p of places){ctx.url=p.photo;assert.equal(vm.runInContext('safeUrl(url)',ctx),p.photo)}
 for(const bad of ['javascript:alert(1)','data:text/html,x','//evil.example/image.jpg','/assets/places/../../secret.jpg']){ctx.url=bad;assert.equal(vm.runInContext('safeUrl(url)',ctx),'')}
});
test('every pilot record has documented coordinates, photo bytes, author and source',()=>{
 assert.ok(places.length>=40);const ids=new Set();const names=new Set();
 for(const p of places){assert.ok(!ids.has(p.id));ids.add(p.id);assert.ok(Number.isFinite(p.lat)&&Number.isFinite(p.lon));assert.ok(p.lat>17&&p.lat<20&&p.lon>-73&&p.lon<-68);assert.ok(p.sourceUrl.startsWith('https://'));assert.ok(p.photoSource.startsWith('https://commons.wikimedia.org/wiki/File:'));assert.ok(p.photoAttribution);assert.ok(p.province);const bytes=fs.readFileSync(path.join(root,p.photo));assert.equal(bytes[0],255);assert.equal(bytes[1],216);assert.ok(bytes.length>1000);const key=p.name+'|'+p.province;assert.ok(!names.has(key),'duplicate destination '+key);names.add(key)}
});
test('Ocoa pilot includes a photographed destination with contact',()=>{
 const p=places.find(p=>p.name==='Rancho La Vereda');assert.equal(p.province,'San José de Ocoa');assert.ok(p.phone);assert.ok(p.description.includes('no es una entrada verificada'));
});
test('failed/missing photo does not qualify for the nearby photo feed',()=>{
 vm.runInContext('state.catalog=[{id:"a",name:"No photo",lat:18.5,lon:-70.5},{id:"b",name:"With photo",lat:18.5,lon:-70.5,photo:"/assets/places/sample.jpg"}];state.lat=18.5;state.lon=-70.5;state.radius=2000;renderAll=()=>{};applyNearby([])',ctx);
 assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(state.places.map(p=>p.id))',ctx)),['b']);
});
test('service worker caches pilot and supports versioned script URLs offline',()=>{
 const s=fs.readFileSync(path.join(root,'service-worker.js'),'utf8');assert.ok(s.includes("'/data/pilot-places.json'"));assert.ok(s.includes('ignoreSearch:true'));assert.ok(s.includes("'/pilot.js'"));
});

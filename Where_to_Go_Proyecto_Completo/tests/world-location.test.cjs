const test=require('node:test');
const assert=require('node:assert/strict');
const world=require('../public/world-location.js');
test('Dominican Republic remains pilot, other countries are not falsely populated',()=>{
  assert.equal(world.dataStatus({country:'DO'}),'catalogue-available');
  assert.equal(world.dataStatus({country:'CO'}),'catalogue-not-yet-available');
  assert.equal(world.dataStatus({country:'US'}),'catalogue-not-yet-available');
  assert.equal(world.dataStatus({country:null}),'country-required');
});
test('coordinates are global and validated',()=>{
  assert.deepEqual(world.coordinates(40.7128,-74.006),{lat:40.7128,lon:-74.006});
  assert.equal(world.coordinates(91,0),null);
  assert.equal(world.coordinates('',0),null);
  assert.equal(world.distanceKm({lat:0,lon:0},{lat:0,lon:0}),0);
});
test('locale and location are independent from the RD pilot',()=>{
  const p=world.location({country:'jp',city:'Tokyo',lat:35.6762,lon:139.6503,language:'ja-JP',source:'manual'});
  assert.equal(p.country,'JP');
  assert.equal(p.language,'ja-JP');
  assert.equal(p.city,'Tokyo');
  assert.equal(world.dataStatus(p),'catalogue-not-yet-available');
});

const geo=require('../public/world-geography.js');
test('Selector geográfico de RD incluye 32 demarcaciones y ciudades de referencia',()=>{
  const towns=geo.cities('DO');
  assert.equal(new Set(towns.map(p=>p.region)).size,32);
  assert(towns.some(p=>p.region==='Puerto Plata'&&p.city==='Puerto Plata'));
  assert(towns.some(p=>p.region==='Puerto Plata'&&p.city==='Cabarete'));
  assert(towns.some(p=>p.region==='Samaná'&&p.city==='Las Terrenas'));
  assert(towns.every(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)));
});

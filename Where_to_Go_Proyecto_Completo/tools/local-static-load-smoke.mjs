// Controlled STATIC-asset smoke test. Never call Google Places, Supabase or public hosts.
// NOT a certification for 100k simultaneous users. Intended for the local CI preview.
import assert from 'node:assert/strict';
const origin=new URL(process.env.WTG_TEST_ORIGIN||'http://127.0.0.1:8765/');
assert(['127.0.0.1','localhost','[::1]'].includes(origin.hostname),'Only loopback hosts may be load-tested');
assert(origin.protocol==='http:','Local smoke test requires HTTP');
const total=Math.min(1000,Math.max(1,Number(process.env.WTG_TEST_REQUESTS)||320));
const concurrency=Math.min(40,Math.max(1,Number(process.env.WTG_TEST_CONCURRENCY)||20));
const files=['index.html','app.js','manifest.webmanifest','data/places/manifest.json','data/photo-atlas-rd.json'];
let cursor=0,failures=0,bytes=0;
const elapsed=[];
async function worker(){
 while(true){
  const i=cursor++;
  if(i>=total)return;
  const path=files[i%files.length];
  const start=performance.now();
  try{
   const controller=new AbortController();
   const timeout=setTimeout(()=>controller.abort(),15000);
   try{
    const response=await fetch(new URL(path,origin),{signal:controller.signal,cache:'no-store'});
    const data=await response.arrayBuffer();
    if(!response.ok||!data.byteLength)failures++;
    else bytes+=data.byteLength;
   }finally{clearTimeout(timeout)}
  }catch{failures++}
  elapsed.push(performance.now()-start);
 }
}
await Promise.all(Array.from({length:concurrency},()=>worker()));
elapsed.sort((a,b)=>a-b);
const percentile=p=>Math.round(elapsed[Math.min(elapsed.length-1,Math.floor((elapsed.length-1)*p))]);
console.log('LOCAL STATIC LOAD SMOKE:',JSON.stringify({total,concurrency,failures,
 megabytesReceived:Math.round(bytes/1e6*100)/100,p50ms:percentile(.5),p95ms:percentile(.95)}));
assert.equal(failures,0,'Static assets returned empty or failed during local concurrency smoke test');
console.log('LOCAL STATIC LOAD SMOKE OK (NOT production capacity certification)');

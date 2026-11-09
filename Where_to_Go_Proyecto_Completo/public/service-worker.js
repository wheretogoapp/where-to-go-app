/* Offline pilot: bundled public destinations/photos; no location or personal data cached. */
const CACHE='where-to-go-pilot-v9-1';
const ASSETS=['/','/index.html','/styles.css','/premium.css','/experience.css','/visual-v7.css','/world-v8.css','/world-v8.js','/assets/wtg-brand.svg','/experience.js','/app.js','/language.js','/manifest.webmanifest','/data/municipios-rd.json','/data/province-heroes.json','/province-heroes.js','/auth.js','/config.js','/data/aventuras.json','/data/pilot-places.json','/pilot.js','/pilot.css','/privacidad.html','/terminos.html','/assets/favicon.svg','/assets/icon-192.png','/assets/icon-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);await cache.addAll(ASSETS);
  const data=await cache.match('/data/pilot-places.json');const places=await data.json();
  // The shell remains installable if one optional photograph is unavailable.
  await Promise.allSettled([...new Set(places.map(p=>p.photo).filter(p=>/^\/assets\/places\//.test(p)))].map(path=>cache.add(path)));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('where-to-go-')&&key!==CACHE)await caches.delete(key);await self.clients.claim()})())});
self.addEventListener('fetch',event=>{
 const u=new URL(event.request.url);
 if(event.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/.netlify/functions/'))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  // Fingerprinted, bundled photos are immutable and fast, including after airplane mode.
  if(u.pathname.startsWith('/assets/places/')){const photo=await cache.match(u.pathname);if(photo)return photo;}
  try{return await fetch(event.request)}catch{
   const response=await cache.match(event.request,{ignoreSearch:true});
   if(response)return response;
   if(event.request.mode==='navigate')return await cache.match('/index.html');
   return new Response('Sin conexión',{status:503,statusText:'Offline'});
  }
 })());
});

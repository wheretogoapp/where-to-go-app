/* Offline pilot: bundled public destinations/photos; no location or personal data cached. */
const CACHE='where-to-go-shell-v13-puerto-plata-autoload';
const ASSETS=['/','/index.html','/styles.css','/premium.css','/experience.css','/visual-v7.css','/world-v8.css','/mobile-focus.css','/world-v8.js','/assets/wtg-brand.svg','/experience.js','/onboarding.js','/onboarding.css','/native-mobile.css','/ux-polish.css','/local-discovery.css','/category-motion.css','/google-places-adapter.js','/app.js','/language.js','/manifest.webmanifest','/data/place-gallery.json','/data/pilot-places.json','/data/municipios-rd.json','/data/province-heroes.json','/province-heroes.js','/auth.js','/config.js','/data/aventuras.json','/privacidad.html','/terminos.html','/assets/favicon.svg','/assets/icon-192.png','/assets/icon-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  // One optional resource must never prevent the whole PWA from installing.
  await cache.addAll(['/','/index.html','/styles.css','/app.js']);
  await Promise.allSettled(ASSETS.filter(asset=>!['/','/index.html','/styles.css','/app.js'].includes(asset)).map(asset=>cache.add(asset)));
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
  // A 503 is an HTTP response, not a network exception. Previously the PWA
  // returned that error without trying its already installed offline shell.
  // Cache downloaded local geographic tiles so nearby lists stay readable during outages.
  const isLocalData=/^\/data\/places\/(?:manifest|cell_[a-zA-Z0-9_]+)\.json$/.test(u.pathname);
  const offline=async()=>{
    const response=await cache.match(event.request,{ignoreSearch:true});
    if(response)return response;
    if(event.request.mode==='navigate')return await cache.match('/index.html')||new Response('Sin conexión',{status:503});
    return new Response('Sin conexión',{status:503,statusText:'Offline'});
  };
  try{
    // Fetch fresh HTML and app code after every deployment. Cached shell is
    // exclusively a fallback during network outages, not the primary source.
    const isCode=event.request.mode==='navigate'||/\.(?:js|css|html)$/.test(u.pathname);
    const response=await fetch(isCode?new Request(event.request,{cache:'no-store'}):event.request);
    if(response.ok){
      if(isLocalData){try{await cache.put(u.pathname,response.clone())}catch{/* Safari storage quota can vary */}}
      return response;
    }
    if(response.status>=500)return await offline();
    return response;
  }catch{return await offline()}
 })());
});

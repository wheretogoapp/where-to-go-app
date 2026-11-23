/* Offline pilot: bundled public destinations/photos; no location or personal data cached. */
const CACHE='where-to-go-shell-v18-six-priorities';
const ASSETS=['/','/where-to-go-app/index.html','/where-to-go-app/styles.css','/where-to-go-app/premium.css','/where-to-go-app/experience.css','/where-to-go-app/visual-v7.css','/where-to-go-app/world-v8.css','/where-to-go-app/mobile-focus.css','/where-to-go-app/world-v8.js','/where-to-go-app/assets/wtg-brand.svg','/where-to-go-app/assets/wtg-logo-hd.webp','/where-to-go-app/assets/wtg-icon-192.png','/where-to-go-app/assets/wtg-icon-512.png','/where-to-go-app/assets/wtg-icon-180.png','/where-to-go-app/experience.js','/where-to-go-app/tours.js','/where-to-go-app/tours.css','/where-to-go-app/commercial-submissions.js','/where-to-go-app/release-readiness.css','/where-to-go-app/header-drawer.js','/where-to-go-app/header-drawer.css','/where-to-go-app/five-tab-profile-hub.css','/where-to-go-app/mobile-ui-repair.css','/where-to-go-app/onboarding.js','/where-to-go-app/onboarding.css','/where-to-go-app/traveler-profile.js','/where-to-go-app/traveler-profile.css','/where-to-go-app/native-mobile.css','/where-to-go-app/ux-polish.css','/where-to-go-app/local-discovery.css','/where-to-go-app/category-motion.css','/where-to-go-app/google-places-adapter.js','/where-to-go-app/app.js','/where-to-go-app/language.js','/where-to-go-app/manifest.webmanifest','/where-to-go-app/data/place-gallery.json','/where-to-go-app/data/pilot-places.json','/where-to-go-app/data/municipios-rd.json','/where-to-go-app/data/province-heroes.json','/where-to-go-app/province-heroes.js','/where-to-go-app/auth.js','/where-to-go-app/config.js','/where-to-go-app/data/aventuras.json','/where-to-go-app/privacidad.html','/where-to-go-app/terminos.html','/where-to-go-app/assets/favicon.svg','/where-to-go-app/assets/icon-192.png','/where-to-go-app/assets/icon-512.png'];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  // One optional resource must never prevent the whole PWA from installing.
  await cache.addAll(['/','/where-to-go-app/index.html','/where-to-go-app/styles.css','/where-to-go-app/app.js']);
  await Promise.allSettled(ASSETS.filter(asset=>!['/','/where-to-go-app/index.html','/where-to-go-app/styles.css','/where-to-go-app/app.js'].includes(asset)).map(asset=>cache.add(asset)));
  const data=await cache.match('/where-to-go-app/data/pilot-places.json');const places=await data.json();
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
  if(u.pathname.startsWith('/where-to-go-app/assets/places/')){const photo=await cache.match(u.pathname);if(photo)return photo;}
  // A 503 is an HTTP response, not a network exception. Previously the PWA
  // returned that error without trying its already installed offline shell.
  // Cache downloaded local geographic tiles so nearby lists stay readable during outages.
  const isLocalData=/^\/data\/places\/(?:manifest|cell_[a-zA-Z0-9_]+)\.json$/.test(u.pathname);
  const offline=async()=>{
    const response=await cache.match(event.request,{ignoreSearch:true});
    if(response)return response;
    if(event.request.mode==='navigate')return await cache.match('/where-to-go-app/index.html')||new Response('Sin conexión',{status:503});
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

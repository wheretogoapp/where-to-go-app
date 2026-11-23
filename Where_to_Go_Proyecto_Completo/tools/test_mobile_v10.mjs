// Mobile Safari-like smoke test (Playwright Chromium emulation, NOT physical iPhone).
// Uses consented test GPS coordinates only; checks the current first-run UX.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const site=process.env.TEST_SITE||'http://127.0.0.1:8765/';
const executablePath=process.env.CHROME_BIN||undefined;
const browser=await chromium.launch({headless:true,...(executablePath?{executablePath}:{})});
const context=await browser.newContext({
  viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,
  geolocation:{latitude:19.311,longitude:-69.543,accuracy:40},
  permissions:['geolocation'],locale:'es-DO'
});
const page=await context.newPage();
// The test grants a simulated GPS permission and fixes the geocoder reply,
// so it validates the mobile UI without assuming external geocoder uptime.
await page.route('https://api.bigdatacloud.net/data/reverse-geocode-client**',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({countryCode:'DO',countryName:'República Dominicana',principalSubdivision:'Samaná',city:'Las Terrenas',locality:'Las Terrenas'})}));
// Never spend the owner's paid Google Places quota during repeated CI tests.
// The deployment workflow checks that the real restricted key is published.
await page.route('**/google-places-key.js*',route=>route.fulfill({status:200,contentType:'application/javascript',body:'window.WTG_GOOGLE_MAPS_KEY="";'}));
const errors=[];
page.on('pageerror',error=>errors.push(String(error)));
const isPublic=site.startsWith('https://wheretogoapp.github.io/');
try{
  await page.goto(site,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForSelector('#wtg-onboarding',{timeout:10000});
  assert((await page.locator('#wtg-ob-splash').count())===1,'No se publicó la entrada con logo');
  assert((await page.locator('.wtg-ob-fragment').count())===4,'El logo no se forma por fragmentos originales');
  assert((await page.locator('#wtg-ob-splash .wtg-ob-plane').count())===0,'El avioncito antiguo debe desaparecer');
  // Auto GPS: no press on any custom permission button. Chromium is pre-granted
  // and iOS on real devices will display its own system prompt when allowed.
  await page.waitForFunction(()=>typeof state!=='undefined'&&state.mode==='gps'&&document.getElementById('wtg-onboarding').hidden,null,{timeout:30000});
  assert(await page.locator('#auth-gate').isVisible(),'Tras detectar GPS debe mostrarse el acceso');
  await page.waitForFunction(()=>typeof window.WTG_auth==='object',null,{timeout:15000});
  // Real OAuth is never faked in tests. The existing explicit demo option
  // lets us inspect the app without inventing a signed-in account.
  if(!(await page.locator('#auth-gate').evaluate(el=>el.hidden))){
    await page.locator('#auth-demo').click({timeout:15000});
  }
  await page.waitForFunction(()=>state.dataMode==='live'&&state.places.length>=20,null,{timeout:75000});
  const first=await page.evaluate(()=>{
    const hero=document.querySelector('#view-inicio .hero');
    const rail=document.querySelector('#view-inicio .wtg-v8-category-shortcuts');
    const result=document.querySelector('#home-list .place-card');
    return {
      mode:state.mode,city:state.city,province:provinceFromCity(),
      places:state.places.length,withPhotos:state.places.filter(p=>!!p.photo).length,
      google:state.places.filter(p=>p.source==='google').length,
      homeCards:document.querySelectorAll('#home-list .place-card').length,
      heroTop:hero?.getBoundingClientRect().top,
      heroHeight:hero?.getBoundingClientRect().height,
      cardTop:result?.getBoundingClientRect().top,
      railCount:rail?.querySelectorAll('[data-cat]').length,
      railScrollable:!!rail&&rail.scrollWidth>rail.clientWidth,
      splashGone:document.getElementById('wtg-onboarding').hidden,
      authGone:document.getElementById('auth-gate').hidden
    };
  });
  assert.equal(first.mode,'gps','El GPS de prueba no se aplicó automáticamente');
  assert(first.places>=20,'El catálogo local no cargó ni veinte fichas reales');
  assert(first.splashGone&&first.authGone,'Una pantalla de entrada bloquea el uso de la app');
  assert(first.heroHeight>100,'La portada de destino está oculta');
  assert(!first.homeCards||first.heroTop<first.cardTop,'Los listados aparecen encima de la portada turística');
  assert(first.railCount>=40&&first.railScrollable,'No hay carrusel horizontal con todas las categorías');
  console.log('MOBILE FIRST-RUN + DESTINATION:',JSON.stringify(first));
  // Keep a separate home screenshot: Explore screenshots cannot prove that the
  // destination hero and its photo transitions are visible on a mobile screen.
  await page.screenshot({path:'/tmp/where-to-go-iphone-home.png',fullPage:false});

  const rail=page.locator('#view-inicio .wtg-v8-category-shortcuts');
  await page.waitForTimeout(3700);
  const motion=await rail.evaluate(el=>({position:el.scrollLeft,full:el.scrollWidth,viewport:el.clientWidth}));
  assert(motion.full>motion.viewport,'La barra de categorías no se puede desplazar');
  console.log('CATEGORY MOTION:',JSON.stringify(motion));

  // The directory must expose actual places even when an exact photo is missing.
  await page.evaluate(()=>navigate('explorar'));
  await page.waitForFunction(()=>document.querySelectorAll('#explore-list .place-card').length>0,null,{timeout:15000});
  const explorer=await page.evaluate(()=>({
    cards:document.querySelectorAll('#explore-list .place-card').length,
    withoutPhoto:document.querySelectorAll('#explore-list .place-card.wtg-no-photo').length,
    categoryChips:document.querySelectorAll('#filter-categories [data-filter]').length,
    externalSearchCTA:[...document.querySelectorAll('[data-google-more]')].some(el=>/explorar más con google maps/i.test(el.textContent)),
    internalText:document.querySelector('#google-search-submit')?.textContent
  }));
  assert(explorer.cards>0&&explorer.categoryChips>=40,'Explorar no muestra fichas o filtros');
  assert(!explorer.externalSearchCTA,'Sigue apareciendo el botón que manda a Google Maps');
  assert(!/Google Maps/i.test(explorer.internalText||''),'La búsqueda principal debe funcionar dentro de Where to Go');
  console.log('IN-APP EXPLORE:',JSON.stringify(explorer));

  const title=await page.locator('#explore-list .place-title').first().textContent();
  await page.locator('#explore-list .place-title').first().click({timeout:12000});
  await page.waitForSelector('#place-modal:not([hidden])',{timeout:8000});
  assert.equal((await page.locator('#place-modal-title').textContent()).trim(),title.trim(),'La ficha abierta no coincide con el lugar');
  assert(await page.locator('[data-internal-map]').isVisible(),'La ficha no ofrece su mapa interno');
  await page.locator('[data-internal-map]').click();
  await page.waitForFunction(()=>state.view==='mapa',null,{timeout:10000});
  assert(await page.locator('#world-map').count(),'La aplicación no contiene mapa');
  console.log('IN-APP PLACE DETAIL AND MAP: OK');

  // Every predefined Dominican city must receive the SAME home experience;
  // Las Terrenas is not a privileged route. All checks remain quota-free.
  const citiesToCheck=[
    ['Puerto Plata','Puerto Plata'],['Santiago de los Caballeros','Santiago'],
    ['Santo Domingo de Guzmán','Distrito Nacional'],['La Romana','La Romana'],
    ['Punta Cana','La Altagracia'],['Cabarete','Puerto Plata'],
    ['Bávaro','La Altagracia']
  ];
  for(const [city,expectedProvince] of citiesToCheck){
    const chosen=await page.evaluate(city=>{
      selectCity(city);
      const area=document.getElementById('wtg-area-discovery');
      return {city:state.city,province:provinceFromCity(),view:state.view,
        homeTitle:document.getElementById('wtg-local-title')?.textContent||'',
        areaTitle:document.getElementById('wtg-area-title')?.textContent||'',
        areaShown:!!area&&!area.hidden,
        radius:state.radius};
    },city);
    assert.equal(chosen.city,city);
    assert.equal(chosen.province,expectedProvince,'La ciudad muestra la provincia equivocada');
    assert.equal(chosen.view,'inicio','Todas las ciudades deben abrir portada turística');
    assert(chosen.homeTitle.includes(city),'No cambió el título de la portada');
    assert(chosen.areaShown&&chosen.areaTitle.includes(city),'Sin selector sectorial para '+city);
    assert.equal(chosen.radius,city==='Puerto Plata'?30000:12000,
      'Puerto Plata usa 30 km para ampliar cobertura; los demás municipios mantienen 12 km');
    console.log('SAME APP EXPERIENCE:',JSON.stringify(chosen));
  }
  // Exercise ALL provincial hubs, not just the showcase in Las Terrenas.
  // Stub the data fetch for this navigation-only check: never run 32 paid or
  // network-heavy location searches simply to verify cover accuracy.
  const nationwide=await page.evaluate(()=>{
    const load=window.loadPlaces;
    window.loadPlaces=async()=>{};
    const results=[];
    try{
      for(const province of Object.keys(window.WTG_PROVINCE_HEROES||{})){
        selectProvinceHub(province);
        renderAll();
        const hero=window.WTG_PROVINCE_HEROES[province];
        const cover=document.querySelector('#view-inicio .hero');
        const art=cover?.querySelector('.hero-art');
        results.push({
          province,matched:provinceFromCity()===province,
          mode:state.mode,view:state.view,
          city:state.city,source:hero?.source||'',
          license:hero?.license||'',photo:hero?.photo||'',
          coverHeight:Math.round(cover?.getBoundingClientRect().height||0),
          heroSlides:document.getElementById('wtg-hero-progress')?.textContent||'',
          backgroundSet:!!art?.dataset.wtgImage,
          range:state.radius
        });
      }
    }finally{window.loadPlaces=load;}
    return results;
  });
  assert.equal(nationwide.length,32,'No están disponibles las 32 portadas provinciales');
  for(const entry of nationwide){
    assert(entry.matched,entry.province+' muestra otra provincia');
    assert.equal(entry.view,'inicio',entry.province+' no abre la portada');
    assert.equal(entry.mode,'city',entry.province+' no seleccionó su centro provincial');
    assert.equal(entry.range,30000,entry.province+' tiene un radio distinto al provincial');
    assert(entry.coverHeight>100,entry.province+' tiene una portada móvil oculta');
    assert(/^https:\/\//.test(entry.photo)&&/^https:\/\//.test(entry.source)&&entry.license,
      entry.province+' no tiene foto identificada, fuente y licencia');
    assert(entry.backgroundSet,entry.province+' no preparó la foto de su portada');
  }
  console.log('32 PROVINCE HOME COVERS VERIFIED:',
    JSON.stringify(nationwide.map(({province,city,heroSlides})=>({province,city,heroSlides}))));

  // Check that sector cards actually change the local search center and
  // return to the selected municipality (no fabricated neighborhood names).
  await page.evaluate(()=>selectCity('Santiago de los Caballeros'));
  await page.locator('#wtg-area-options [data-area="este"]').click({timeout:10000});
  const east=await page.evaluate(()=>({
    mode:state.mode,lat:state.lat,lon:state.lon,city:state.city,
    area:window.WTG_AREA_DISCOVERY?.area
  }));
  assert.equal(east.mode,'sector');
  assert.equal(east.city,'Santiago de los Caballeros');
  assert(east.lon>-70.697,'Este debe desplazar la búsqueda al este');
  assert.equal(east.area,'este');
  await page.locator('#wtg-area-options [data-area="centro"]').click({timeout:10000});
  const center=await page.evaluate(()=>({
    mode:state.mode,lat:state.lat,lon:state.lon,
    area:window.WTG_AREA_DISCOVERY?.area
  }));
  assert.equal(center.mode,'city');
  assert(Math.abs(center.lon-(-70.697))<0.000001,'Volver al centro restaura las coordenadas originales');
  console.log('CITY SECTORS EAST/CENTER:',JSON.stringify({east,center}));

  const region=await page.evaluate(()=>{
    selectProvinceHub('Pedernales');
    return {city:state.city,province:provinceFromCity(),view:state.view,
      area:document.getElementById('wtg-area-title')?.textContent,
      radius:state.radius};
  });
  assert.equal(region.province,'Pedernales');
  assert.equal(region.view,'inicio');
  assert(region.area?.includes(region.city));
  assert.equal(region.radius,30000);
  console.log('PROVINCE HUB:',JSON.stringify(region));

  await page.evaluate(()=>selectCity('Las Terrenas'));
  await page.waitForFunction(()=>state.city==='Las Terrenas'&&provinceFromCity()==='Samaná'&&state.dataMode==='live',null,{timeout:75000});
  const destination=await page.evaluate(()=>({
    city:state.city,province:provinceFromCity(),
    cover:document.querySelector('.hero .hero-art')?.style.backgroundImage||'',
    homeTitle:document.getElementById('wtg-local-title')?.textContent||'',
    records:state.places.length
  }));
  assert.equal(destination.province,'Samaná');
  assert(!/Puerto.Plata|Puerto_Plata|Puerto%20Plata/i.test(destination.cover),'Samaná sigue mostrando Puerto Plata');
  assert(/Las Terrenas/i.test(destination.homeTitle),'La portada no cambió al destino seleccionado');
  console.log('LOCATION CHANGE:',JSON.stringify(destination));

  await page.evaluate(()=>window.WTG_auth?.showLogin());
  await page.waitForSelector('#auth-gate:not([hidden])',{timeout:10000});
  assert(await page.locator('[data-social="apple"]').isDisabled(),'Apple no debe ofrecerse sin proveedor configurado');
  assert(await page.locator('[data-social="facebook"]').isDisabled(),'Facebook no debe ofrecerse sin proveedor configurado');
  assert(!(await page.locator('[data-social="google"]').isDisabled()),'Google debe seguir disponible');
  assert(await page.locator('#auth-email-fold').evaluate(el=>el.hidden),'El formulario de correo aparece antes de elegirlo');
  await page.locator('#auth-email-reveal').click();
  assert(!(await page.locator('#auth-email-fold').evaluate(el=>el.hidden)),'El formulario de correo no se despliega');
  await page.locator('#auth-demo').click();

  // Mobile business pilot: a temporary failure must NOT wipe the photos or form.
  // Run as guest, so no application or image is uploaded to the owner's database.
  await page.evaluate(()=>openRegister('basico'));
  await page.locator('#business-name').fill('Negocio de prueba local');
  await page.locator('#business-category').selectOption({index:1});
  await page.locator('#business-province').selectOption('Samaná');
  await page.locator('#business-city').fill('Las Terrenas');
  await page.locator('#business-address').fill('Calle de prueba, sin registro real');
  await page.locator('#business-phone').fill('8090000000');
  await page.locator('#business-consent').check();
  await page.locator('#business-photos').setInputFiles({
    name:'prueba-local.png',mimeType:'image/png',
    buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8ZuKQAAAAASUVORK5CYII=','base64')
  });
  await page.waitForFunction(()=>document.querySelectorAll('#wtg-business-photo-preview img').length===1);
  assert(/1 foto/.test(await page.locator('#business-photos-count').textContent()),
    'El formulario no confirma la fotografía elegida');
  await page.locator('#register-form button[type="submit"]').click();
  await page.waitForFunction(()=>
    (document.getElementById('wtg-business-feedback')?.textContent||'').includes('No se envió'));
  const retry=await page.evaluate(()=>({
    stillOpen:!document.getElementById('register-modal').hidden,
    files:document.getElementById('business-photos').files.length,
    name:document.getElementById('business-name').value,
    feedback:document.getElementById('wtg-business-feedback').textContent
  }));
  assert(retry.stillOpen&&retry.files===1&&retry.name==='Negocio de prueba local',
    'Al fallar una solicitud, el formulario debe mantener datos y fotos para reintentar');
  await page.evaluate(()=>closeModals());
  console.log('BUSINESS PREVIEW & SAFE RETRY OK: files='+retry.files+', form retained');

  // Organizers can inspect selected tour photographs without uploading them.
  await page.evaluate(()=>navigate('tours'));
  await page.locator('#wtg-tours-apply').click();
  await page.locator('#wtg-tours-photos').setInputFiles({
    name:'tour-local.png',mimeType:'image/png',
    buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO8ZuKQAAAAASUVORK5CYII=','base64')
  });
  await page.waitForFunction(()=>document.querySelectorAll('#wtg-tour-photo-preview img').length===1);
  await page.locator('#wtg-tours-close').click();
  console.log('TOUR PRIVATE PHOTO PREVIEW OK');

  // Visual-first Explore remains default, but a seller can show the full local directory.
  await page.evaluate(()=>navigate('explorar'));
  const showDirectory=await page.locator('#wtg-explore-directory-toggle').isVisible();
  if(showDirectory){
    await page.locator('#wtg-explore-directory-toggle').click();
    assert(await page.evaluate(()=>state.exploreShowAll),'Ver todos debe abrir las fichas sin foto');
    await page.locator('#wtg-explore-directory-toggle').click();
    assert(!(await page.evaluate(()=>state.exploreShowAll)),'Debe poder volver a la selección fotográfica');
    console.log('OPTIONAL FULL DIRECTORY OK');
  }
  // The upper-left menu must expose every real Explore category (51 today),
  // including those intentionally omitted from default tourist discovery.
  await page.locator('#wtg-mobile-menu-trigger').click();
  assert(await page.locator('#wtg-drawer-categories').evaluate(el=>el.open),
    'El apartado de categorías debe aparecer desplegado al abrir el menú');
  const categoryAudit=await page.evaluate(()=>({
    expected:CATEGORIES.length,
    actual:document.querySelectorAll('#wtg-drawer-category-list [data-cat]:not([data-cat="todos"])').length,
    groups:document.querySelectorAll('#wtg-drawer-category-list .wtg-drawer-category-group').length,
    present:[...document.querySelectorAll('#wtg-drawer-category-list [data-cat]')].map(el=>el.dataset.cat)
  }));
  assert.equal(categoryAudit.actual,categoryAudit.expected,'Faltan categorías en el menú lateral');
  assert.equal(new Set(categoryAudit.present).size,categoryAudit.actual+1,'Hay categorías duplicadas');
  for(const id of ['playas','restaurantes','hoteles','taxis','escuelas','iglesias']){
    assert(categoryAudit.present.includes(id),'No aparece '+id+' en el menú');
  }
  await page.locator('#wtg-drawer-category-search').fill('rios');
  assert(await page.locator('#wtg-drawer-category-list [data-cat="rios"]').isVisible(),
    'El buscador no encuentra Ríos sin acento');
  await page.locator('#wtg-drawer-category-search').fill('playas');
  await page.locator('#wtg-drawer-category-list [data-cat="playas"]').click();
  const selected=await page.evaluate(()=>({
    category:state.category,view:state.view,drawerClosed:document.getElementById('wtg-main-drawer').hidden
  }));
  assert.deepEqual(selected,{category:'playas',view:'explorar',drawerClosed:true},
    'Una categoría del menú debe abrir Explorar con ese filtro');
  await page.locator('#wtg-mobile-menu-trigger').click();
  await page.locator('#wtg-drawer-category-search').fill('taxis');
  await page.locator('#wtg-drawer-category-list [data-cat="taxis"]').click();
  assert.equal(await page.evaluate(()=>state.view),'taxis',
    'Taxis debe abrir el directorio de transporte');
  await page.locator('#wtg-mobile-menu-trigger').click();
  await page.locator('#wtg-drawer-category-search').fill('');
  await page.locator('#wtg-drawer-category-list [data-cat="todos"]').click();
  assert.equal(await page.evaluate(()=>state.category),'todos');
  console.log('FULL MOBILE DRAWER CATEGORIES OK:',JSON.stringify(categoryAudit));
  // Synthetic identities only; this test must NEVER authenticate or modify a real account.
  const isolation=await page.evaluate(()=>{
    const account=window.WTG_auth;
    const original=Object.getOwnPropertyDescriptor(account,'user');
    let identity=null;
    Object.defineProperty(account,'user',{configurable:true,get:()=>identity});
    const notify=()=>window.dispatchEvent(new CustomEvent('wtg-auth-session',{detail:{userId:identity?.id||null}}));
    try{
      const place=state.places.find(p=>p&&typeof p.id==='string'&&p.id.length<250);
      if(!place)throw Error('Falta lugar para probar favoritos por cuenta');
      identity={id:'qa-isolated-a'};notify();
      if(state.favorites.length)throw Error('Cuenta A recibió favoritos de otra cuenta');
      toggleFavorite(place.id);
      const aFavorite=state.favorites.includes(place.id);
      state.businesses=[{name:'Negocio privado de A',cloudStored:false}];
      saveScoped('wtg_businesses',state.businesses);
      identity={id:'qa-isolated-b'};notify();
      const bPrivate=state.favorites.length===0&&state.businesses.length===0;
      identity={id:'qa-isolated-a'};notify();
      const aRestored=state.favorites.includes(place.id)&&state.businesses.some(b=>b.name==='Negocio privado de A');
      const keys={
        a:localStorage.getItem('wtg_favorites_user_qa-isolated-a'),
        b:localStorage.getItem('wtg_favorites_user_qa-isolated-b'),
        draftA:localStorage.getItem('wtg_businesses_user_qa-isolated-a')
      };
      return {aFavorite,bPrivate,aRestored,keysOk:!!keys.a&&!keys.b&&!!keys.draftA};
    }finally{
      Object.defineProperty(account,'user',original);
      notify();
    }
  });
  assert(Object.values(isolation).every(Boolean),'No se aislaron los favoritos y borradores de cuentas distintas');
  console.log('ACCOUNT ISOLATION OK:',JSON.stringify(isolation));
  // The staff portal is public HTML but its data is strictly private.
  // A guest must never see the review tables, even with a direct admin URL.
  const guestAdmin=await context.newPage();
  try{
    const adminUrl=new URL('admin.html',site).href;
    const response=await guestAdmin.goto(adminUrl,{waitUntil:'domcontentloaded',timeout:30000});
    assert.equal(response?.status(),200,'El portal privado debe responder sin exponer datos');
    await guestAdmin.waitForFunction(()=>{
      const s=document.getElementById('review-auth-status')?.textContent||'';
      return s&&!s.includes('Comprobando que tienes acceso');
    },null,{timeout:25000});
    const guard=await guestAdmin.evaluate(()=>({
      adminHidden:document.getElementById('review-app').hidden,
      loginVisible:!document.getElementById('review-auth').hidden,
      message:document.getElementById('review-auth-status').textContent
    }));
    assert(guard.adminHidden&&guard.loginVisible&&/inicia sesión|permisos|no disponible/i.test(guard.message),
      'El portal de administración expuso controles al invitado');
    console.log('PRIVATE ADMIN GUEST ACCESS DENIED OK');
  }finally{await guestAdmin.close()}
  if(isPublic)console.log('GOOGLE KEY: deployment workflow separately checks the public restricted key; CI blocks paid Places requests.');
  await page.screenshot({path:'/tmp/where-to-go-iphone-results.png',fullPage:false});
  console.log('MOBILE E2E OK:',JSON.stringify({first,explorer,destination,scriptErrors:errors.slice(0,4)}));
} catch(error){
  console.error('MOBILE E2E FAILURE:',String(error),JSON.stringify(errors.slice(0,8)));
  await page.screenshot({path:'/tmp/where-to-go-iphone-results.png',fullPage:false}).catch(()=>{});
  throw error;
} finally {
  await browser.close();
}

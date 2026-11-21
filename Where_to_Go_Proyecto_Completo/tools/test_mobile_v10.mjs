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
  assert(await page.locator('#auth-email-fold').evaluate(el=>el.hidden),'El formulario de correo aparece antes de elegirlo');
  await page.locator('#auth-email-reveal').click();
  assert(!(await page.locator('#auth-email-fold').evaluate(el=>el.hidden)),'El formulario de correo no se despliega');
  await page.locator('#auth-demo').click();
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

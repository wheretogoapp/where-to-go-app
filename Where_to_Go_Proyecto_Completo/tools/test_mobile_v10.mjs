// E2E smoke test for iPhone-size tourist experience.
// Uses a fixed TEST GPS location in Las Terrenas; never a real user's location.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import process from 'node:process';
import { chromium } from 'playwright';

const site=process.env.TEST_SITE||'http://127.0.0.1:8765/';
const chrome=process.env.CHROME_BIN||undefined;
const browser=await chromium.launch({headless:true, ...(chrome?{executablePath:chrome}:{})});
const context=await browser.newContext({
  viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,
  geolocation:{latitude:19.311,longitude:-69.543,accuracy:40},
  permissions:['geolocation'],locale:'es-DO'
});
const page=await context.newPage();
const errors=[];
page.on('pageerror',err=>errors.push(String(err)));
let outcome=null;
try {
  await page.goto(site,{waitUntil:'domcontentloaded',timeout:45000});
  await page.waitForFunction(()=>{
    return typeof state!=='undefined' && state.mode==='gps' && state.dataMode==='live' && state.places.length>100;
  },null,{timeout:75000});
  const initial=await page.evaluate(()=>({
    mode:state.mode,count:state.places.length,
    categories:Object.fromEntries(['restaurantes','bares','discotecas','playas','hoteles'].map(c=>[c,state.places.filter(p=>p.cat===c).length])),
    cardCount:document.querySelectorAll('#home-list .place-card').length,
    header:document.getElementById('location-label').textContent,
    photoAtlasShortcut:!!document.querySelector('[data-view="atlas"]'),
    unknownPhotoPlaces:state.places.filter(p=>!p.photo).length
  }));
  assert.equal(initial.mode,'gps','Auto GPS was not enabled');
  assert(initial.cardCount>=8,'Home cards are empty');
  const design=await page.evaluate(()=>{
    const search=document.getElementById('wtg-v8-search'),firstCard=document.querySelector('#home-list .place-card');
    const hero=document.querySelector('#view-inicio .hero');
    const tools=document.querySelector('#view-inicio .wtg-v8-home-tools');
    return {
      noPilot:!document.querySelector('.pilot-toolbar'),
      premiumStyle:!!document.querySelector('link[href*="mobile-focus.css"]'),
      searchTop:search?.getBoundingClientRect().top,
      firstCardTop:firstCard?.getBoundingClientRect().top,
      heroTop:hero?.getBoundingClientRect().top,
      heroVisible:!!hero&&getComputedStyle(hero).display!=='none'&&hero.getBoundingClientRect().height>20,
      searchBackground:search?getComputedStyle(search).backgroundColor:'',
      searchStylesheetReady:[...document.styleSheets].some(sheet=>sheet.href?.includes('mobile-focus.css')),
      leafletNotLoaded:!document.querySelector('script[src*="leaflet.js"]'),
      firstCardName:firstCard?.querySelector('.place-title')?.textContent,
      hasPhotosAtlas:!!document.querySelector('[data-view="atlas"]')
    };
  });
  assert(design.noPilot,'The obsolete "Piloto con lugares reales" toolbar is still visible');
  assert(design.premiumStyle,'Mobile premium layout stylesheet was not loaded');
  assert(design.leafletNotLoaded,'Leaflet map loads before someone opens the map');
  console.log('FIRST SCREEN LAYOUT MEASUREMENTS:',JSON.stringify(design));
  if(!(design.firstCardTop>design.searchTop&&design.heroTop>design.firstCardTop)){
    await page.screenshot({path:'/tmp/where-to-go-iphone-layout-debug.png',fullPage:true}).catch(()=>{});
  }
  assert(design.firstCardTop>design.searchTop&&(!design.heroVisible||design.heroTop>design.firstCardTop),
    'Search and nearby places must appear before any visible large cover');
  assert(design.searchStylesheetReady,
    'Premium stylesheet must load, not merely exist in HTML');
  assert(design.searchBackground==='rgb(255, 255, 255)',
    'Main search field should render on a clean premium white surface');
  console.log('MOBILE PREMIUM DESIGN:',JSON.stringify(design));
  const front=await page.evaluate(()=>{
    const home=document.querySelector('#view-inicio');
    const nodes=[...home.children].map(x=>x.id||x.className||x.tagName);
    const nearbyIndex=[...home.children].findIndex(x=>x.id==='home-list');
    const heroIndex=[...home.children].findIndex(x=>x.classList.contains('hero'));
    const first12=state.places.filter(p=>isTouristDiscovery(p)&&p.distance<=state.radius+100).sort((a,b)=>a.distance-b.distance).slice(0,12);
    const closestDistances=first12.map(p=>Math.round(p.distance));
    return {nearbyIndex,heroIndex,nodes:nodes.slice(0,9),closestDistances};
  });
  assert(front.nearbyIndex>=0&&front.nearbyIndex<front.heroIndex,
    'First screen should show nearby places before the scenic province hero');
  assert(front.closestDistances.length>=8,'Too few nearby businesses and tourist places');
  assert(front.closestDistances.every((d,i,a)=>!i||d>=a[i-1]),
    'Nearby establishments not sorted by distance');
  console.log('FIRST-SCREEN RESULTS:',JSON.stringify(front));
  assert(initial.count>100,'Geo-grid failed to load nearby places');
  assert(initial.categories.restaurantes>=20,'Restaurants missing');
  assert(initial.categories.bares>=5,'Bars missing');
  assert(initial.categories.discotecas>=2,'Night clubs missing');
  assert(initial.categories.playas>=5,'Beaches missing');
  assert(initial.unknownPhotoPlaces>30,'Photo-only filter still hides places');
  assert.equal(initial.photoAtlasShortcut,false,'Off-topic photo atlas still visible');
  await page.waitForFunction(()=>window.WTG_GALLERY_PHOTOS &&
    Object.keys(window.WTG_GALLERY_PHOTOS).length>=45,null,{timeout:20000});
  const destinationPhotos=await page.evaluate(()=>{
    const destinations=['wd-Q4208698','wd-Q6683320','wd-Q62620342'];
    return destinations.map(id=>{
      const p=state.catalog.find(x=>x.id===id);
      const images=p?placeGalleryPhotos(p):[];
      return {id,name:p?.name||'',count:images.length,
        sources:images.map(x=>x.source),hasSource:images.every(x=>x.source&&x.attribution)};
    });
  });
  assert(destinationPhotos.every(x=>x.count>=2&&x.hasSource),
    'Photos from Commons must appear in the actual destination card');
  console.log('REAL PHOTO GALLERIES:',JSON.stringify(destinationPhotos.map(x=>({name:x.name,count:x.count}))));

  const before=await page.locator('#home-list .place-title').first().textContent();
  console.log('INITIAL MOBILE:',JSON.stringify(initial));
  const photoButton=page.locator('#home-list .wtg-open-photo').first();
  console.log('PHOTO BUTTON ID:',await photoButton.getAttribute('data-place'));
  const diagnostic=await photoButton.evaluate(el=>{
    const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,top=document.elementFromPoint(cx,cy);
    return {rect:{x:cx,y:cy,w:r.width,h:r.height},atPoint:top?.outerHTML?.slice(0,160),
      authGateHidden:document.querySelector('#auth-gate')?.hidden,
      overlayHidden:document.querySelector('#overlay')?.hidden};
  });
  console.log('CLICK DIAGNOSTIC:',JSON.stringify(diagnostic));
  // The product intentionally has a login gate for new visitors. Simulate
  // an already signed-in user, so a real touch (not JS/programmatic click)
  // reaches the card instead of the unrelated sign-in overlay.
  await page.evaluate(()=>{
    const gate=document.querySelector('#auth-gate');
    if(gate){gate.hidden=true;gate.style.display='none';}
  });
  await photoButton.click({timeout:15000});
  await page.waitForTimeout(500);
  console.log('AFTER PHOTO CLICK:',JSON.stringify(await page.evaluate(()=>({
    modal:state.modal,
    hidden:document.getElementById('place-modal')?.hidden,
    title:document.getElementById('place-modal-title')?.textContent,
    body:document.getElementById('place-modal-body')?.textContent?.slice(0,160)
  }))),JSON.stringify(errors));
  await page.waitForFunction(()=>document.querySelector('#place-modal')&&!document.querySelector('#place-modal').hidden,null,{timeout:10000});
  assert.equal((await page.locator('#place-modal-title').textContent()).trim(),before.trim(),
    'Tapping a card photo did not open its correct place');
  await page.evaluate(()=>closeModals());
  await page.evaluate(()=>selectCity('Las Terrenas'));
  await page.waitForFunction(()=>state.mode==='city'&&state.dataMode==='live'&&state.places.length>100,null,{timeout:75000});
  const selected=await page.evaluate(()=>({
    city:state.city,province:provinceFromCity(),count:state.places.length,
    heroTitle:document.querySelector('.hero h2')?.textContent,
    heroSource:document.querySelector('.hero .hero-art')?.style.backgroundImage,
    homeCount:document.querySelector('#home-count')?.textContent,
    countCards:document.querySelectorAll('#home-list .place-card').length,
    hasTerraBar:state.places.some(p=>p.name==='Terra Bar'),
    hasGaia:state.places.some(p=>/gaia/i.test(p.name)&&p.cat==='discotecas')
  }));
  assert.equal(selected.city,'Las Terrenas');
  assert.equal(selected.province,'Samaná');
  assert(selected.hasTerraBar&&selected.hasGaia,'Known nightlife locations not loaded');
  assert(selected.heroSource?.includes('Saman')||selected.heroSource?.includes('View%20of%20Saman'), 'Wrong regional hero for Samaná');
  assert(!selected.heroSource?.includes('Puerto_Plata'), 'Puerto Plata image wrongly used in Samaná');
  assert.equal(selected.countCards,12,'Nearby cards should be before other catalog sections');
  assert(!selected.heroSource?.includes('Aerial%20view%20of%20Puerto')&&!selected.heroSource?.includes('Aerial_view_of_Puerto'),
    'Hero still uses Puerto Plata imagery in Samaná');
  assert(Number(selected.homeCount)>100,'Nearby count still shows zero');
  await page.screenshot({path:'/tmp/where-to-go-iphone-results.png',fullPage:false});
  outcome={initial,selected,pageErrors:errors};
  console.log('MOBILE E2E OK:',JSON.stringify(outcome));
  if(errors.length)console.warn('NONFATAL WEB ERRORS:',errors.slice(0,6));
} finally {
  await browser.close();
}

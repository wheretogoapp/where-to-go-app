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
  assert(initial.count>100,'Geo-grid failed to load nearby places');
  assert(initial.categories.restaurantes>=20,'Restaurants missing');
  assert(initial.categories.bares>=5,'Bars missing');
  assert(initial.categories.discotecas>=2,'Night clubs missing');
  assert(initial.categories.playas>=5,'Beaches missing');
  assert(initial.unknownPhotoPlaces>30,'Photo-only filter still hides places');
  assert.equal(initial.photoAtlasShortcut,false,'Off-topic photo atlas still visible');
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
  assert(Number(selected.homeCount)>100,'Nearby count still shows zero');
  await page.screenshot({path:'/tmp/where-to-go-iphone-results.png',fullPage:false});
  outcome={initial,selected,pageErrors:errors};
  console.log('MOBILE E2E OK:',JSON.stringify(outcome));
  if(errors.length)console.warn('NONFATAL WEB ERRORS:',errors.slice(0,6));
} finally {
  await browser.close();
}

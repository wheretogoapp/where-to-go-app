/* Where to Go — official mark assembly, native location permission and sign-in.
   No simulated OS permission prompt. Browsers may require a user gesture:
   a clear manual fallback appears if the native dialog is unavailable/denied. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const root=$('wtg-onboarding');if(!root)return;
 const splash=$('wtg-ob-splash'),locationStep=$('wtg-ob-location');
 const welcome=$('wtg-ob-welcome'),status=$('wtg-ob-status');
 const backdrop=$('wtg-ob-background'),description=$('wtg-ob-destination'),credit=$('wtg-ob-credit');
 const reduced=!!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
 let done=false,manual=false,launchEnded=false,result=null,permissionRequested=false;
 let currentCover='',currentSlide=0;
 const coverTimer={id:null};
 document.body.classList.add('wtg-onboarding-active');
 function photosForProvince(province){
   const d=window.WTG_PROVINCE_HEROES?.[province];
   if(!d||!/^https:\/\//.test(d.photo||''))return [];
   // Reuse the same fully attributed destination images as the home carousel.
   const gallery=window.WTG_EXPERIENCE?.slidesForProvince?.(province)||[];
   const distinct=new Map();
   for(const photo of [{title:d.landmark,image:d.photo,credit:d.author+' · '+d.license,source:d.source},...gallery]){
     if(/^https:\/\//.test(photo.image||''))distinct.set(photo.image,photo);
   }
   return [...distinct.values()];
 }
 function applyCover(province){
   const p=String(province||'').trim();
   if(!window.WTG_PROVINCE_HEROES?.[p]||p===currentCover)return;
   currentCover=p;currentSlide=0;
   const slides=photosForProvince(p);
   if(coverTimer.id)clearInterval(coverTimer.id);
   const display=()=>{
     if(!slides.length||done)return;
     const item=slides[currentSlide%slides.length];
     const img=new Image();
     img.onload=()=>{
       if(done||currentCover!==p)return;
       backdrop.style.backgroundImage='linear-gradient(180deg,#00112744,#06162add),url("'+img.src.replace(/"/g,'%22')+'")';
       description.textContent=p+' · República Dominicana';
       credit.replaceChildren();
       const a=document.createElement('a');a.href=/^https:\/\//.test(item.source||'')?item.source:'https://commons.wikimedia.org/';
       a.target='_blank';a.rel='noopener noreferrer';a.textContent='Foto: '+item.credit;credit.append(a);
     };
     img.onerror=()=>{if(slides.length>1){slides.splice(currentSlide%slides.length,1);currentSlide%=slides.length||1;}};
     img.src=item.image;
     currentSlide=(currentSlide+1)%slides.length;
   };
   display();
   if(slides.length>1&&!reduced)coverTimer.id=setInterval(display,4500);
 }
 function showFallback(reason){
   if(done)return;
   const code=reason?.code;
   status.textContent=code===1?'Ubicación rechazada. Puedes elegir país y ciudad manualmente.':
     reason?.reason==='country-unverified'?'No se pudo comprobar el país. Elige una ciudad para evitar resultados equivocados.':
     'El teléfono no mostró el permiso de ubicación. Puedes elegir tu ciudad o volver a intentar.';
   if(launchEnded){
     splash.hidden=true;welcome.hidden=true;locationStep.hidden=false;
     root.dataset.step='location';
   }
 }
 function finish(){
   if(done)return;
   done=true;root.hidden=true;
   document.body.classList.remove('wtg-onboarding-active');
   clearInterval(coverTimer.id);
   // Show real login unless a valid session is already active.
   if(!window.WTG_auth?.user&&!window.WTG_auth?.demo)window.WTG_auth?.showLogin?.();
   if(window.WTG_EXPERIENCE?.update)window.WTG_EXPERIENCE.update();
   window.dispatchEvent(new CustomEvent('wtg-onboarding-finished'));
 }
 function maybeFinish(){
   if(result==='success'&&launchEnded)finish();
   else if(result==='failure'&&launchEnded)showFallback(window.WTG_LAST_LOCATION_ERROR||null);
 }
 function requestNativeLocation(){
   if(permissionRequested||done)return;
   permissionRequested=true;
   status.textContent='Solicitando permiso de ubicación al teléfono…';
   // This asks iOS/Android/the browser to show THEIR permission sheet.
   // No custom modal can force it when a browser suppresses the prompt.
   window.dispatchEvent(new Event('wtg-world-request-gps'));
 }
 function chooseManually(){
   manual=true;root.hidden=true;
   const selector=$('location-pill'),dialog=$('wtg-world-dialog');
   if(selector&&dialog){
     selector.click();
     if(dialog.hidden){
       manual=false;root.hidden=false;showFallback();
     }
   }else{manual=false;root.hidden=false;showFallback()}
 }
 $('wtg-ob-allow-gps')?.addEventListener('click',()=>{
   permissionRequested=false;result=null;
   requestNativeLocation();
 });
 $('wtg-ob-manual')?.addEventListener('click',chooseManually);
 $('wtg-ob-demo')?.addEventListener('click',finish);
 // Legacy "Comenzar" is never a required step: location happens during launch.
 $('wtg-ob-start')?.addEventListener('click',()=>{
   splash.hidden=true;welcome.hidden=true;locationStep.hidden=false;requestNativeLocation();
 });
 window.addEventListener('wtg-location-success',event=>{
   result='success';
   const country=event.detail?.country;
   const province=event.detail?.province;
   if(country==='DO'&&province)applyCover(province);
   maybeFinish();
 });
 window.addEventListener('wtg-location-error',event=>{
   result='failure';window.WTG_LAST_LOCATION_ERROR=event.detail||{};
   maybeFinish();
 });
 window.addEventListener('wtg-world-selected',()=>{
   if(!manual||done)return;
   manual=false;finish();
 });
 $('wtg-world-close')?.addEventListener('click',()=>{
   if(!manual||done)return;
   manual=false;root.hidden=false;showFallback();
 });
 document.addEventListener('keydown',event=>{
   if(event.key==='Escape'&&manual&&!done){
     $('wtg-world-dialog').hidden=true;
     manual=false;root.hidden=false;showFallback();
   }
 });
 // If a real prior manual choice exists, show its accurate regional image
 // while GPS is still pending; never claim a guessed location as GPS.
 try{
   const saved=JSON.parse(localStorage.getItem('wtg_last_selected_location_v1')||'null');
   if(saved?.province)applyCover(saved.province);
 }catch{}
 splash.hidden=false;welcome.hidden=true;locationStep.hidden=true;root.dataset.step='splash';
 // Request iOS native location permission while the mark is assembling.
 setTimeout(requestNativeLocation,100);
 setTimeout(()=>{
   launchEnded=true;
   if(result==='success')finish();
   else if(result==='failure')showFallback(window.WTG_LAST_LOCATION_ERROR||{});
   else {
     // Permission dialog may still be open; show only the logo until resolved.
     splash.hidden=false;
   }
 },reduced?200:1750);
})();
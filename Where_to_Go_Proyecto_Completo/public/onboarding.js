/* Where to Go / A dónde ir — first-run mobile journey.
   Uses the existing official logo, approved province images, real GPS permission,
   world selector and the existing Supabase sign-in. No invented locations. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const root = $('wtg-onboarding');
  if (!root) return;
  const splash = $('wtg-ob-splash');
  const welcome = $('wtg-ob-welcome');
  const locationStep = $('wtg-ob-location');
  const description = $('wtg-ob-destination');
  const backdrop = $('wtg-ob-background');
  const credit = $('wtg-ob-credit');
  const status = $('wtg-ob-status');
  let completed = false;
  let waitingForSelection = false;
  const hasSeen = (()=>{try{return localStorage.getItem('wtg_onboarding_seen_v1')==='yes'}catch{return false}})();
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches || false;
  document.body.classList.add('wtg-onboarding-active');

  function cover(province){
    const d=window.WTG_PROVINCE_HEROES?.[province];
    if(!d||!/^https:\/\//.test(d.photo||''))return;
    backdrop.style.backgroundImage='linear-gradient(180deg,rgba(3,17,42,.16),rgba(3,17,42,.84)),url("'+d.photo.replace(/"/g,'%22')+'")';
    description.textContent=province==='Puerto Plata'?'Puerto Plata · República Dominicana':province+' · República Dominicana';
    credit.replaceChildren();
    const a=document.createElement('a');
    a.href=/^https:\/\//.test(d.source||'')?d.source:'https://commons.wikimedia.org/';
    a.textContent='Fotografía: '+(d.author||'Wikimedia Commons')+' · '+(d.license||'Ver licencia');
    a.target='_blank';a.rel='noopener noreferrer';
    credit.append(a);
  }
  function initialCover(){
    let province='Puerto Plata';
    try{
      const prior=JSON.parse(localStorage.getItem('wtg_last_selected_location_v1')||'null');
      if(typeof prior?.province==='string' && window.WTG_PROVINCE_HEROES?.[prior.province])province=prior.province;
    }catch{}
    cover(province);
  }
  function showStep(target){
    splash.hidden=target!=='splash';
    welcome.hidden=target!=='welcome';
    locationStep.hidden=target!=='location';
    root.dataset.step=target;
    const focus=target==='welcome'?$('wtg-ob-start'):target==='location'?$('wtg-ob-allow-gps'):null;
    focus?.focus({preventScroll:true});
  }
  function complete(){
    if(completed)return;
    completed=true;
    waitingForSelection=false;
    root.hidden=true;
    document.body.classList.remove('wtg-onboarding-active');
    try{localStorage.setItem('wtg_onboarding_seen_v1','yes')}catch{}
    window.WTG_EXPERIENCE?.update?.();
    window.dispatchEvent(new CustomEvent('wtg-onboarding-finished'));
  }
  function manualSelect(){
    waitingForSelection=true;
    root.hidden=true;
    const selector=$('location-pill');
    const world=$('wtg-world-dialog');
    if(selector&&world){
      selector.click();
      if(world.hidden){
        waitingForSelection=false;root.hidden=false;
        status.textContent='No fue posible abrir el selector. Intenta otra vez.';
      }
    }else{
      waitingForSelection=false;root.hidden=false;
      status.textContent='El selector de ubicación no está disponible.';
    }
  }
  function allowGPS(){
    if(!window.isSecureContext||!navigator.geolocation){
      status.textContent='La ubicación necesita HTTPS y un navegador compatible. Elige tu ciudad manualmente.';
      return;
    }
    const btn=$('wtg-ob-allow-gps');
    btn.disabled=true;
    status.textContent='Esperando tu permiso de ubicación…';
    window.dispatchEvent(new Event('wtg-world-request-gps'));
  }
  $('wtg-ob-start')?.addEventListener('click',()=>showStep('location'));
  $('wtg-ob-allow-gps')?.addEventListener('click',allowGPS);
  $('wtg-ob-manual')?.addEventListener('click',manualSelect);
  $('wtg-ob-demo')?.addEventListener('click',complete);
  window.addEventListener('wtg-location-success',()=>{
    if(completed)return;
    $('wtg-ob-allow-gps').disabled=false;
    try{
      const province=typeof provinceFromCity==='function'?provinceFromCity():null;
      if(province)cover(province);
    }catch{}
    complete();
  });
  window.addEventListener('wtg-location-error',()=>{
    if(completed)return;
    $('wtg-ob-allow-gps').disabled=false;
    if(typeof closeModals==='function')closeModals();
    root.hidden=false;showStep('location');
    status.textContent='No se pudo obtener la ubicación. Puedes elegir una ciudad sin dar permiso.';
  });
  window.addEventListener('wtg-world-selected',()=>{
    if(!waitingForSelection||completed)return;
    complete();
  });
  $('wtg-world-close')?.addEventListener('click',()=>{
    if(completed||!waitingForSelection)return;
    waitingForSelection=false;root.hidden=false;showStep('location');
  });
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&waitingForSelection&&!completed){
      $('wtg-world-dialog').hidden=true;
      waitingForSelection=false;root.hidden=false;showStep('location');
    }
  });

  initialCover();
  showStep('splash');
  // Returning users see only the brief logo intro; no repeat permission prompts.
  const resume=hasSeen || /(?:[?&]code=|access_token=)/.test(location.search+location.hash);
  setTimeout(()=>{if(resume)complete();else showStep('welcome')},reduced?200:resume?800:1600);
})();
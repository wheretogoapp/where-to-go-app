/* Where to Go V8. Interactive travel discovery, native to the existing catalog.
 * Uses actual documented destination images, never creates fictitious ratings or places. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const imageURL=value=>{if(/^\/assets\/places\/[a-z0-9-]+\.(jpg|webp|png)$/.test(value))return value;try{const u=new URL(String(value));return u.protocol==='https:' ? u.href : ''}catch{return''}};
  const currentRegion=()=>{
    try{return typeof wtgProvincePreview==='string' && wtgProvincePreview || provinceFromCity() || 'Puerto Plata';}
    catch{return 'Puerto Plata';}
  };
  let signature='', lastPlaces='';
  function regionItems(){
    const r=currentRegion();
    const candidates=(window.WTG_EXPERIENCE?.slidesForProvince?.(r)||[]).filter(x=>imageURL(x.image));
    // A province with one identified image is one card; no duplicate fake destinations.
    // Puerto Plata has several documented individual photos.
    return candidates.slice(0,8);
  }
  function renderDestinations(){
    const rail=$('wtg-v8-destination-rail');if(!rail)return;
    const r=currentRegion();const items=regionItems();
    const nextSig=r+'|'+items.map(x=>x.image).join('|');if(signature===nextSig)return;
    signature=nextSig;rail.replaceChildren();
    if(!items.length){rail.textContent='Todavía no hay fotografías identificadas para esta provincia.';return;}
    for(const item of items){
      const card=document.createElement('button');card.type='button';card.className='wtg-v8-destination';
      card.setAttribute('aria-label','Explorar '+item.title+' en '+r);
      const photo=document.createElement('img');photo.src=item.image;photo.loading='lazy';photo.decoding='async';photo.alt='Fotografía identificada: '+item.title;
      photo.addEventListener('error',()=>{photo.remove();card.classList.add('wtg-v8-visual-unavailable');card.title='La imagen no pudo cargarse desde su fuente';});
      const small=document.createElement('small');small.textContent='✦ '+r;
      const title=document.createElement('strong');title.textContent=item.title;
      const action=document.createElement('b');action.textContent='Descubrir esta zona  ↗';
      const credit=document.createElement('span');credit.className='wtg-v8-credit';credit.textContent='Foto: '+item.credit;
      card.title='Fotografía documentada. Fuente: '+(item.source||'no especificada');
      card.append(photo,small,title,action,credit);card.addEventListener('click',()=>{
        // A province cover is editorial, not a geolocated place result.
        // Do not silently reuse the previous region (e.g. Puerto Plata for Samaná).
        const provinceSelect=$('province-select');
        const current=typeof provinceFromCity==='function' ? provinceFromCity() : '';
        if(r!==current && provinceSelect && typeof openModal==='function'){
          openModal('location-modal');
          provinceSelect.value=r;
          if(typeof refreshMunicipalitySelect==='function')refreshMunicipalitySelect();
          $('municipality-select')?.focus();
          return;
        }
        if(typeof state!=='undefined'){
          state.search='';state.category='todos';
          if(typeof navigate==='function')navigate('explorar');
        }
      });
      rail.append(card);
    }
  }
  function setupSearch(){
    const form=$('wtg-v8-search'),field=$('wtg-v8-query');if(!form||!field)return;
    form.addEventListener('submit',e=>{
      e.preventDefault();const query=field.value.trim();
      try{state.category='todos';state.search=query;navigate('explorar');renderExplore();$('search-input')?.focus({preventScroll:true});}
      catch{document.querySelector('[data-view="explorar"]')?.click();if($('search-input')){$('search-input').value=query;$('search-input').dispatchEvent(new Event('input',{bubbles:true}));}}
    });
  }
  function refresh(){renderDestinations()}
  // Global app calls renderAll on load, category selection and location change. Avoid polling and duplicate nodes.
  if(typeof renderAll==='function'){
    const original=renderAll;
    renderAll=function(){const result=original.apply(this,arguments);refresh();return result};
  }
  document.addEventListener('DOMContentLoaded',()=>{setupSearch();refresh();});
  window.addEventListener('wtg-language-changed',refresh);
  // Keep status understated; no claiming that a photograph or location is verified by us without evidence.
})();

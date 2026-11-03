/* Where to Go V6 — slideshow orchestration without third-party tracking or fabricated photos.
   The image sources shown here are individually identified public Wikimedia Commons files.
   No carousel calls a paid places API; manual navigation always works even with reduced motion. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const motion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const reduced = !!motion?.matches;
  const L={
    es:{intro:'Descubre destinos extraordinarios, culturas y experiencias auténticas cerca de ti.',photo:'Fotografía',license:'Ver licencia y autor',original:'Fotografía original',missing:'Fotografía pendiente de verificar',address:'Lugar identificado en el mapa',discover:'Descubrir este lugar ↗'},
    en:{intro:'Discover remarkable places, cultures and authentic experiences near you.',photo:'Photo',license:'View license and creator',original:'Original photo',missing:'Verified photo pending',address:'Place identified on the map',discover:'Discover this place ↗'},
    fr:{intro:'Découvrez des lieux remarquables et des expériences authentiques près de vous.',photo:'Photo',license:'Voir licence et auteur',original:'Photo originale',missing:'Photo vérifiée indisponible',address:'Lieu identifié sur la carte',discover:'Découvrir ce lieu ↗'},
    pt:{intro:'Descubra lugares e experiências autênticas perto de você.',photo:'Foto',license:'Ver licença e autor',original:'Foto original',missing:'Foto verificada pendente',address:'Local identificado no mapa',discover:'Descobrir este lugar ↗'},
    de:{intro:'Entdecke besondere Orte und authentische Erlebnisse in deiner Nähe.',photo:'Foto',license:'Lizenz und Urheber ansehen',original:'Originalfoto',missing:'Verifiziertes Foto fehlt',address:'Ort auf der Karte gefunden',discover:'Diesen Ort entdecken ↗'},
    it:{intro:'Scopri luoghi straordinari ed esperienze autentiche vicino a te.',photo:'Foto',license:'Vedi licenza e autore',original:'Foto originale',missing:'Foto verificata in attesa',address:'Luogo individuato sulla mappa',discover:'Scopri questo luogo ↗'}
  };
  const translate=(k)=>(L[window.WTG_I18N?.lang]||L.es)[k];
  const commons = name => 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(name) + '?width=1400';
  const PP = [
    {title:'Puerto Plata desde el cielo', place:'Puerto Plata · Costa Norte', image:commons('Aerial view of Puerto Plata, June 2023.jpg'), source:'https://commons.wikimedia.org/wiki/File:Aerial_view_of_Puerto_Plata,_June_2023.jpg', credit:'Jusunx · CC BY-SA 4.0'},
    {title:'Fortaleza San Felipe', place:'Puerto Plata · Centro histórico', image:commons('Fortaleza de San Felipe DR 2.jpg'), source:'https://commons.wikimedia.org/wiki/File:Fortaleza_de_San_Felipe_DR_2.jpg', credit:'CareAhLine · CC0'},
    {title:'27 Charcos de Damajagua', place:'Imbert · Puerto Plata', image:commons('Damajagua Waterfall.jpg'), source:'https://commons.wikimedia.org/wiki/File:Damajagua_Waterfall.jpg', credit:'Funcheta · CC BY-SA 4.0'},
    {title:'Plaza Independencia', place:'Centro histórico · Puerto Plata', image:commons('Plaza Independencia de Puerto Plata.jpg'), source:'https://commons.wikimedia.org/wiki/File:Plaza_Independencia_de_Puerto_Plata.jpg', credit:'Ronny Medina · CC BY-SA 4.0'},
  ];
  const nationalNames=['Puerto Plata','Santiago','La Altagracia','La Romana','Samaná','Pedernales','Distrito Nacional','Barahona'];
  const stateSlider = {
    hero:{items:[], index:0, paused:reduced, signature:'', delay:7000},
    auth:{items:[], index:0, paused:reduced, signature:'', delay:7000},
    spotlight:{items:[], index:0, paused:reduced, signature:'', delay:8500},
    premium:{items:[], index:0, paused:reduced, signature:'', delay:9000}
  };
  let interval=null;
  const validUrl=s=>{try{let x=new URL(s);return x.protocol==='https:'?x.href:''}catch{return''}};
  function region(){
    try{return typeof wtgProvincePreview==='string'&&wtgProvincePreview||provinceFromCity()||''}
    catch{return ''}
  }
  function provSlides(name){
    const entries = window.WTG_PROVINCE_HEROES || {};
    const d = entries[name];
    const additional=(name==='Puerto Plata' ? PP : []);
    if(!d)return additional;
    const first={title:d.landmark,place:d.province+' · República Dominicana',image:d.photo,source:d.source,credit:d.author+' · '+d.license};
    return additional.length ? [...additional] : [first];
  }
  function slideSet(name){
    if(name && provSlides(name).length)return provSlides(name);
    const candidates=nationalNames.flatMap(n=>provSlides(n).slice(0,n==='Puerto Plata'?1:1));
    return candidates.length?candidates:PP;
  }
  function updateSet(key, items,signature){
    const s=stateSlider[key];
    if(s.signature!==signature){s.signature=signature;s.index=0;}
    s.items=items;
    if(s.index>=items.length)s.index=0;
  }
  function applyHero(){
    const s=stateSlider.hero,x=s.items[s.index]; if(!x)return;
    const art=document.querySelector('.hero .hero-art');
    const title=document.querySelector('.hero h2');
    const note=document.querySelector('.hero .hero-coordinate span');
    const credit=document.querySelector('.hero-credit');
    if(!art||!title)return;
    art.style.backgroundImage = validUrl(x.image)?`url("${x.image.replace(/"/g,'%22')}")`:'';
    art.style.backgroundPosition='center';
    title.replaceChildren(document.createTextNode(x.title));
    const subtitle=document.querySelector('.hero .hero-content p');
    if(subtitle)subtitle.textContent=x.place+' · '+translate('intro');
    if(note)note.textContent=x.place.toLocaleUpperCase('es');
    if(credit){credit.replaceChildren(document.createTextNode(translate('photo')+': '+x.credit+' · '));const a=document.createElement('a');a.href=validUrl(x.source)||'https://commons.wikimedia.org/';a.rel='noopener noreferrer';a.target='_blank';a.textContent=translate('license');credit.append(a)}
    if($('wtg-hero-progress'))$('wtg-hero-progress').textContent=(s.index+1)+' / '+s.items.length;
  }
  function applyAuth(){
    const s=stateSlider.auth,x=s.items[s.index]; if(!x)return;
    const gate=$('auth-gate');if(!gate)return;
    gate.style.setProperty('--wtg-auth-background',`url("${x.image.replace(/"/g,'%22')}")`);
    const title=$('wtg-auth-scenery-title');if(title)title.textContent=x.title;
    const place=$('wtg-auth-scenery-place');if(place)place.textContent=x.place;
    const credit=$('wtg-auth-credit');if(credit){credit.replaceChildren(document.createTextNode(x.credit+' · '));const link=document.createElement('a');link.target='_blank';link.rel='noopener noreferrer';link.href=validUrl(x.source)||'https://commons.wikimedia.org/';link.textContent=translate('original');credit.append(link)}
    if($('wtg-auth-count'))$('wtg-auth-count').textContent=(s.index+1)+' / '+s.items.length;
  }
  function applySpotlight(){
    const s=stateSlider.spotlight,x=s.items[s.index];const wrapper=$('wtg-discovery-spotlight'),body=$('wtg-spotlight-body');
    if(!wrapper||!body)return;
    wrapper.hidden=!x;
    if(!x){body.replaceChildren();return;}
    const photo = validUrl(x.photo||'');
    const figure=document.createElement('div');figure.className='wtg-spotlight-media';
    if(photo){const img=document.createElement('img');img.src=photo;img.loading='lazy';img.alt='Fotografía de '+x.name;img.referrerPolicy='no-referrer';img.addEventListener('error',()=>{img.remove();figure.classList.add('wtg-spotlight-no-photo');figure.textContent=translate('missing')});figure.append(img)}
    else{figure.classList.add('wtg-spotlight-no-photo');figure.textContent=translate('missing')}
    const copy=document.createElement('div');copy.className='wtg-spotlight-copy';
    const tag=document.createElement('small');tag.textContent='✦ '+(typeof catInfo==='function'?catInfo(x.cat).name:x.cat)+' · '+(x.distance<1000?Math.round(x.distance)+' m':(x.distance/1000).toFixed(1)+' km');
    const heading=document.createElement('h3');heading.textContent=x.name;
    const caption=document.createElement('p');caption.textContent=x.address||translate('address');
    const button=document.createElement('button');button.type='button';button.dataset.place=x.id;button.className='btn btn-light';button.textContent=translate('discover');
    const n=document.createElement('span');n.className='wtg-spotlight-count';n.textContent=(s.index+1)+' / '+s.items.length;
    copy.append(tag,heading,caption,button,n);body.replaceChildren(figure,copy);
  }
  function applyPremium(){
    const s=stateSlider.premium;
    const nodes=[...document.querySelectorAll('[data-premium-slide]')];
    nodes.forEach((node,i)=>node.hidden=i!==s.index);
    if($('wtg-premium-progress'))$('wtg-premium-progress').textContent=s.items.length?(s.index+1)+' / '+s.items.length:'';
    const controls=document.querySelector('.wtg-ad-controls');if(controls)controls.hidden=s.items.length<=1;
  }
  function display(key){({hero:applyHero,auth:applyAuth,spotlight:applySpotlight,premium:applyPremium})[key]();}
  function advance(key,step=1){const s=stateSlider[key];if(!s.items.length)return;s.index=(s.index+step+s.items.length)%s.items.length;display(key)}
  function changePause(key){let s=stateSlider[key];s.paused=!s.paused;updateButtons()}
  function updateButtons(){
    for(const [key,id] of [['hero','wtg-hero-pause'],['auth','wtg-auth-pause'],['spotlight','wtg-spotlight-pause'],['premium','wtg-premium-pause']]){
      const b=$(id);if(b){b.textContent=stateSlider[key].paused?'▶':'Ⅱ';b.setAttribute('aria-label',stateSlider[key].paused?'Reanudar carrusel':'Pausar carrusel')}
    }
  }
  function update(){
    const name=region();const slides=slideSet(name);
    updateSet('hero',slides,'hero:'+name);
    updateSet('auth',slides,'auth:'+name);
    const eligible=typeof state!=='undefined'?state.places.filter(p=>isTouristDiscovery(p)&&p.distance<=state.radius+100).slice().sort((a,b)=>Number(!!b.photo)-Number(!!a.photo)||a.distance-b.distance):[];
    updateSet('spotlight',eligible.slice(0,24),'spotlight:'+name+'|'+eligible.map(p=>p.id).join(','));
    const nodes=[...document.querySelectorAll('[data-premium-slide]')];
    updateSet('premium',nodes,'premium:'+name+'|'+nodes.map(n=>n.querySelector('strong')?.textContent||'').join(','));
    for(const key of ['hero','auth','spotlight','premium'])display(key);
    updateButtons();
  }
  function init(){
    for(const [key,prefix] of [['hero','wtg-hero'],['auth','wtg-auth'],['spotlight','wtg-spotlight'],['premium','wtg-premium']]){
      $(prefix+'-prev')?.addEventListener('click',()=>advance(key,-1));
      $(prefix+'-next')?.addEventListener('click',()=>advance(key,1));
      $(prefix+'-pause')?.addEventListener('click',()=>changePause(key));
    }
    update();
    if(interval)clearInterval(interval);
    // Respect reduced motion, visibility and each carousel's pause preference.
    const elapsed={hero:0,auth:0,spotlight:0,premium:0};
    interval=setInterval(()=>{
      if(document.hidden)return;
      for(const key of Object.keys(stateSlider)){
        const s=stateSlider[key];if(s.paused||s.items.length<2)continue;
        if(key==='auth'&&$('auth-gate')?.hidden)continue;
        if(key==='hero'&&!$('auth-gate')?.hidden)continue;
        elapsed[key]+=1000;
        if(elapsed[key]>=s.delay){elapsed[key]=0;advance(key,1)}
      }
    },1000);
  }
  window.WTG_EXPERIENCE={update,advance,slidesForProvince:slideSet};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

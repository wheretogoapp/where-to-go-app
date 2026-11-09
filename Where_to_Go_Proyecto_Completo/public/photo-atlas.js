/* Where to Go: Fotos reales geolocalizadas de RD.
 * Son fotografías del entorno en Commons; nunca atribuirlas a un negocio cercano. */
(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>"']/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
  const safe=u=>{try{const x=new URL(u);return x.protocol==='https:'?x.href:''}catch{return''}};
  const radians=Math.PI/180;
  const distance=(a,b,c,d)=>{
    const x=Math.sin((c-a)*radians/2)**2+Math.cos(a*radians)*Math.cos(c*radians)*Math.sin((d-b)*radians/2)**2;
    return 6371000*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
  };
  let images=[],province='',keyword='',limit=48,nearTerrenas=false,loaded=false,loading=null;
  const baseLat=19.311,baseLon=-69.543;
  function actualPhotos(){
    const filtered=images.filter(p=>(!province||p.province===province)&&(!keyword||(p.title+' '+p.area+' '+p.province).toLocaleLowerCase('es').includes(keyword.toLocaleLowerCase('es')))&&(!nearTerrenas||distance(baseLat,baseLon,p.lat,p.lon)<=12000));
    return nearTerrenas?filtered.sort((a,b)=>distance(baseLat,baseLon,a.lat,a.lon)-distance(baseLat,baseLon,b.lat,b.lon)):filtered;
  }
  function render(){
    const target=$('wtg-atlas-photos');if(!target)return;
    const list=actualPhotos();
    $('wtg-atlas-count').textContent=String(images.length);
    $('wtg-atlas-results').textContent=list.length+' fotos geolocalizadas'+(nearTerrenas?' cerca de Las Terrenas':'');
    $('wtg-atlas-near').setAttribute('aria-pressed',String(nearTerrenas));
    $('wtg-atlas-near').classList.toggle('active',nearTerrenas);
    $('wtg-atlas-province').value=province;
    $('wtg-atlas-more').hidden=list.length<=limit;
    if(!loaded){
      target.innerHTML='<p class="wtg-atlas-empty">Buscando fotografías verificadas por autor, licencia y coordenadas…</p>';return;
    }
    if(!list.length){
      target.innerHTML='<p class="wtg-atlas-empty">No hay fotografías geolocalizadas para este filtro todavía. Prueba otra provincia. Este resultado no significa que no existan lugares allí.</p>';return;
    }
    target.innerHTML=list.slice(0,limit).map(p=>{
      const image=safe(p.image),source=safe(p.source),lic=safe(p.licenseUrl);
      const map='https://www.openstreetmap.org/?mlat='+encodeURIComponent(p.lat)+'&mlon='+encodeURIComponent(p.lon)+'#map=16/'+p.lat+'/'+p.lon;
      return '<article class="wtg-atlas-card">'+
        '<a href="'+esc(map)+'" target="_blank" rel="noopener noreferrer" class="wtg-atlas-image" aria-label="Ver ubicación de la fotografía en el mapa">'+
        '<img loading="lazy" decoding="async" src="'+esc(image)+'" alt="Fotografía de '+esc(p.area)+', '+esc(p.province)+'. '+esc(p.title)+'" referrerpolicy="no-referrer">'+
        '<span>Ver ubicación en el mapa ↗</span></a>'+
        '<div class="wtg-atlas-info"><small>📍 '+esc(p.area)+' · '+esc(p.province)+'</small>'+
        '<strong>'+esc(p.title)+'</strong>'+
        '<p>Foto geolocalizada del entorno. No representa necesariamente un negocio.</p>'+
        '<p>© '+esc(p.credit)+' · '+esc(p.license)+'</p>'+
        '<div class="wtg-atlas-links"><a href="'+esc(source)+'" target="_blank" rel="noopener noreferrer">Imagen original ↗</a>'+
        '<a href="'+esc(lic||source)+'" target="_blank" rel="noopener noreferrer">Licencia ↗</a></div></div></article>';
    }).join('');
  }
  async function load(){
    if(loading)return loading;
    loading=(async()=>{
      try{
        const r=await fetch('/data/photo-atlas-rd.json',{cache:'no-cache'});
        if(!r.ok)throw new Error('Archivo aún no publicado');
        const data=await r.json();
        if(!Array.isArray(data.photos))throw new Error('Catálogo sin formato válido');
        images=data.photos.filter(p=>Number.isFinite(p.lat)&&Number.isFinite(p.lon)&&safe(p.image)&&safe(p.source)&&p.credit&&p.license&&p.area&&p.province);
        $('wtg-atlas-status').textContent='Imágenes: Wikimedia Commons · licencias acreditadas · puntos GPS de las fotos. No son fotografías verificadas de negocios.';
        const provinces=[...new Set(images.map(p=>p.province))].sort((a,b)=>a.localeCompare(b,'es'));
        $('wtg-atlas-province').innerHTML='<option value="">Todas las provincias</option>'+provinces.map(p=>'<option value="'+esc(p)+'">'+esc(p)+'</option>').join('');
      }catch(e){
        $('wtg-atlas-status').textContent='El atlas de fotografías está pendiente de publicación. El directorio nacional de lugares sigue funcionando por separado.';
      }finally{loaded=true;render()}
    })();
    return loading;
  }
  function setup(){
    const main=$('main-content');if(!main)return;
    const buttons=document.querySelector('.pilot-toolbar>div:last-child');
    if(buttons&&!buttons.querySelector('[data-view="atlas"]')){
      const btn=document.createElement('button');
      btn.type='button';btn.dataset.view='atlas';btn.textContent='📸 Fotos reales RD';
      buttons.prepend(btn);
    }
    const section=document.createElement('section');
    section.id='view-atlas';section.className='view wtg-atlas-view';
    section.setAttribute('aria-labelledby','wtg-atlas-title');
    section.innerHTML='<header class="wtg-atlas-hero"><span>WHERE TO GO · REPÚBLICA DOMINICANA</span><h1 id="wtg-atlas-title">Fotos reales de nuestro país.</h1>'+
      '<p><b id="wtg-atlas-count">0</b> fotografías libres geolocalizadas en República Dominicana, con fuente y licencia de uso. Aquí no se presentan imágenes del entorno como si fueran fotos de restaurantes o discotecas.</p></header>'+
      '<div class="wtg-atlas-controls"><button id="wtg-atlas-near" type="button" aria-pressed="false">🏖️ Cerca de Las Terrenas</button>'+
      '<select id="wtg-atlas-province" aria-label="Filtrar por provincia"><option value="">Todas las provincias</option></select>'+
      '<input id="wtg-atlas-search" type="search" placeholder="Buscar foto, playa o municipio" aria-label="Buscar fotos"></div>'+
      '<p id="wtg-atlas-status" class="wtg-atlas-status">Cargando colección…</p><h2 id="wtg-atlas-results" class="wtg-atlas-count"></h2>'+
      '<div id="wtg-atlas-photos" class="wtg-atlas-grid"></div><button id="wtg-atlas-more" class="wtg-atlas-more" type="button" hidden>Ver más fotografías ↓</button>';
    main.appendChild(section);
    $('wtg-atlas-near').onclick=()=>{nearTerrenas=!nearTerrenas;limit=48;render()};
    $('wtg-atlas-province').onchange=e=>{province=e.target.value;limit=48;render()};
    $('wtg-atlas-search').oninput=e=>{keyword=e.target.value.trim();limit=48;render()};
    $('wtg-atlas-more').onclick=()=>{limit+=48;render()};
    // If selecting Las Terrenas in the app, prefer the local atlas on first open.
    document.addEventListener('click',e=>{
      const btn=e.target.closest('[data-view="atlas"]');
      if(!btn)return;
      if(typeof state!=='undefined'&&state.city==='Las Terrenas'){nearTerrenas=true;province='';}
      render();void load();
    });
    void load();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();

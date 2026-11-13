/* Photo-backed destination pilot and private, on-device business presentation.
   No submission, payment or publishing occurs in the business preview. */
(() => {
  'use strict';
  const byId=id=>document.getElementById(id);
  const KEY='wtg_business_preview_v1';
  let selectedProvince='', selectedCategory='', searchText='', signature='', draft=null, photo='', photos=[], installPrompt=null;
  const photoPlaces=()=> (window.WTG_PILOT_PLACES||[]).filter(p=>p.photo&&p.photoSource&&p.photoAttribution);
  const province=p=>p.province||'Otros destinos';
  function goPlace(id){
    const p=photoPlaces().find(x=>x.id===id);if(!p)return;
    state.lat=p.lat;state.lon=p.lon;state.mode='city';state.city=p.municipality||p.name;
    state.province=p.province||'';state.radius=30000;state.category='todos';state.search='';
    wtgProvincePreview='';
    navigate('explorar');loadPlaces().then(()=>openPlace(id));
  }
  function render(){
    const all=photoPlaces(),list=byId('pilot-list');if(!list)return;
    const next=all.map(p=>p.id).join('|')+'|'+selectedProvince+'|'+selectedCategory+'|'+searchText;
    if(signature===next)return;signature=next;
    const provinces=[...new Set(all.map(province))].sort((a,b)=>a.localeCompare(b,'es'));
    byId('pilot-regions').innerHTML=['Todas',...provinces].map(v=>`<button class="filter-chip ${selectedProvince===v||(!selectedProvince&&v==='Todas')?'active':''}" data-pilot-region="${esc(v)}">${esc(v)}</button>`).join('');
    const norm=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('es');
    const places=all.filter(p=>(!selectedProvince||province(p)===selectedProvince)&&(!selectedCategory||p.cat===selectedCategory)&&(!searchText||norm(p.name+' '+province(p)).includes(norm(searchText))));
    byId('pilot-results').textContent=places.length+' resultados · '+provinces.length+' provincias con fichas disponibles';
    byId('pilot-total').textContent=String(all.length);
    list.innerHTML=places.length?places.map(p=>`<article class="pilot-card"><button data-pilot-place="${esc(p.id)}"><img loading="lazy" decoding="async" src="${esc(safeUrl(p.photo))}" alt="${esc(p.name)}"><span>${esc(province(p))}</span><h3>${esc(p.name)}</h3><p>${esc(catInfo(p.cat).name)} · Explorar destino ↗</p></button><small>Foto: ${esc(p.photoAttribution)} · <a target="_blank" rel="noopener" href="${esc(safeUrl(p.photoSource))}">Fuente</a>${p.photoLicense?` · <a target="_blank" rel="noopener" href="${esc(safeUrl(p.photoLicense))}">Licencia</a>`:''}</small></article>`).join(''):'<p class="pilot-empty">No hay fichas con foto que coincidan con esta búsqueda. Prueba otra categoría o provincia.</p>';
  }
  function showDraft(){
    const target=byId('business-demo-preview');
    if(!draft){target.innerHTML='<div class="pilot-empty">La ficha de tu negocio aparecerá aquí al completar el formulario.</div>';return;}
    const gallery=Array.isArray(draft.photos)&&draft.photos.length?draft.photos:[draft.photo];
    target.innerHTML=`<article class="pilot-business-card"><span class="pilot-draft-label">VISTA PREVIA · NO PUBLICADA</span><div class="pilot-demo-gallery"><img class="pilot-demo-main" src="${gallery[0]}" alt="Fotografía del negocio ${esc(draft.name)}"><div class="pilot-demo-thumbs">${gallery.map((u,i)=>`<button type="button" data-pilot-demo-photo="${i}" class="${i===0?'active':''}" aria-label="Ver foto ${i+1}" aria-pressed="${i===0}"><img src="${u}" alt=""></button>`).join('')}</div></div><div><small>${esc(catInfo(draft.cat).name)} · ${esc(draft.city)}</small><h3>${esc(draft.name)}</h3><p>${esc(draft.description)}</p><p>${esc(draft.address)}</p>${draft.phone?`<a class="btn btn-primary" href="tel:${esc(normalizedPhone(draft.phone))}">Llamar al negocio</a>`:''}${draft.map?` <a class="outline-btn" target="_blank" rel="noopener" href="${esc(safeUrl(draft.map))}">Cómo llegar ↗</a>`:''}<p class="pilot-local-note">Guardada solo en este navegador. No es un anuncio activo.</p></div></article>`;
    byId('pilot-export').disabled=false;byId('pilot-delete').disabled=false;
  }
  function validDraft(d){
    const validPhoto=u=>typeof u==='string'&&/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(u)&&u.length<900000;
    return !!(d&&typeof d.name==='string'&&CATEGORY_BY_ID[d.cat]&&validPhoto(d.photo)
      &&(!d.photos||(Array.isArray(d.photos)&&d.photos.length<=4&&d.photos.every(validPhoto))));
  }
  async function readPhoto(file){
    if(!file||!['image/jpeg','image/png','image/webp'].includes(file.type))throw Error('Selecciona una foto JPG, PNG o WebP.');
    if(file.size>15*1024*1024)throw Error('La foto debe pesar menos de 15 MB.');
    const url=URL.createObjectURL(file);
    try{
      const image=new Image();image.src=url;await image.decode();
      const scale=Math.min(1,900/Math.max(image.width,image.height));const canvas=document.createElement('canvas');
      canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);
      canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
      const result=canvas.toDataURL('image/jpeg',.68);
      if(result.length>450000)throw Error('Una foto sigue siendo muy pesada. Prueba una imagen más pequeña.');return result;
    }finally{URL.revokeObjectURL(url)}
  }
  function setup(){
    const main=byId('main-content');if(!main)return;
    const toolbar=document.createElement('div');toolbar.className='pilot-toolbar';
    toolbar.innerHTML='<div><b>Piloto con lugares reales</b><span>Explora y prepara tu visita a negocios</span></div><div><button data-view="piloto">Destinos con fotos</button><button data-view="negocioDemo">Mostrar a un negocio</button><button id="pilot-install">Instalar en mi celular</button></div>';
    main.prepend(toolbar);
    const browse=document.createElement('section');browse.id='view-piloto';browse.className='view pilot-view';
    browse.innerHTML='<header class="pilot-heading"><span>EXPLORA ANTES DE VIAJAR</span><h2>Destinos con fotos reales.</h2><p><b id="pilot-total">0</b> fichas con fotos incluidas en la app. Esta selección es nacional; no representa lugares cerca de tu GPS.</p><button class="btn btn-primary" id="pilot-gps">Ver cerca de mí</button></header><div class="pilot-search"><label>Buscar lugar o provincia<input id="pilot-search" type="search" placeholder="Playa, museo, Puerto Plata…"></label><label>Categoría<select id="pilot-category"><option value="">Todas las categorías</option></select></label></div><p id="pilot-results" role="status" aria-live="polite"></p><div id="pilot-regions" class="pilot-regions"></div><div id="pilot-list" class="pilot-grid"></div>';
    main.append(browse);
    byId('pilot-category').innerHTML+=CATEGORIES.map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('');
    byId('pilot-search').addEventListener('input',e=>{searchText=e.target.value.trim();render()});
    byId('pilot-category').addEventListener('change',e=>{selectedCategory=e.target.value;render()});
    const biz=document.createElement('section');biz.id='view-negocioDemo';biz.className='view pilot-view';
    biz.innerHTML=`<header class="pilot-heading"><span>PARA TUS VISITAS COMERCIALES</span><h2>Así puede verse tu negocio.</h2><p>Crea una ficha con una foto del establecimiento y muéstrasela a su propietario. Esta prueba es privada: no publica, no envía datos y no cobra.</p></header><div class="pilot-business-layout"><form id="pilot-business-form" class="pilot-form"><label>Nombre del negocio<input id="pilot-name" required maxlength="100"></label><label>Categoría<select id="pilot-cat">${CATEGORIES.filter(c=>!['escuelas','iglesias'].includes(c.id)).map(c=>`<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></label><label>Municipio / provincia<input id="pilot-city" required maxlength="100" placeholder="San José de Ocoa"></label><label>Dirección<input id="pilot-address" required maxlength="180"></label><label>Teléfono<input id="pilot-phone" type="tel" maxlength="25"></label><label>Enlace del mapa (opcional)<input id="pilot-map" type="url" placeholder="https://…"></label><label>Descripción<textarea id="pilot-description" required maxlength="400" rows="3"></textarea></label><label>Hasta 4 fotos reales del negocio<input id="pilot-photo" type="file" accept="image/jpeg,image/png,image/webp" multiple></label><label class="pilot-consent"><input type="checkbox" id="pilot-rights" required> Tengo permiso para usar esta foto y estos datos en la demostración.</label><p id="pilot-form-status" role="status"></p><button class="btn btn-primary" type="submit">Guardar y ver ficha</button></form><div><div id="business-demo-preview"></div><div class="pilot-actions"><button id="pilot-export" disabled>Descargar ficha y foto</button><button id="pilot-delete" disabled>Eliminar esta prueba</button></div><p class="pilot-local-note">La descarga incluye la foto y los datos en un archivo JSON para entregarlos al responsable del catálogo. Borrar los datos del navegador elimina esta copia.</p></div></div>`;
    main.append(biz);
    try{const old=JSON.parse(localStorage.getItem(KEY)||'null');if(validDraft(old)){draft=old;photo=old.photo;photos=Array.isArray(old.photos)?old.photos:[old.photo];for(const k of ['name','cat','city','address','phone','map','description'])byId('pilot-'+k).value=old[k]||'';}}catch{}
    showDraft();render();
    byId('pilot-gps').onclick=()=>{navigate('explorar');requestLocation()};
    browse.addEventListener('click',e=>{
      const region=e.target.closest('[data-pilot-region]');if(region){selectedProvince=region.dataset.pilotRegion==='Todas'?'':region.dataset.pilotRegion;render();}
      const place=e.target.closest('[data-pilot-place]');if(place)goPlace(place.dataset.pilotPlace);
    });
    byId('pilot-photo').addEventListener('change',async e=>{
      photo='';photos=[];
      const files=Array.from(e.target.files||[]);
      if(!files.length){byId('pilot-form-status').textContent='Añade una foto para crear la ficha.';return;}
      if(files.length>4){byId('pilot-form-status').textContent='Selecciona máximo cuatro fotografías.';return;}
      byId('pilot-form-status').textContent='Preparando '+files.length+' fotografías…';
      try{
        photos=await Promise.all(files.map(readPhoto));
        photo=photos[0];
        byId('pilot-form-status').textContent=photos.length+' fotos listas. Completa los datos y guarda la ficha.';
      }catch(err){photo='';photos=[];byId('pilot-form-status').textContent=err.message;}
    });
    byId('business-demo-preview').addEventListener('click',e=>{
      const b=e.target.closest('[data-pilot-demo-photo]');if(!b)return;
      const gallery=b.closest('.pilot-demo-gallery');
      const imgs=Array.isArray(draft?.photos)&&draft.photos.length?draft.photos:[draft?.photo];
      const index=Number(b.dataset.pilotDemoPhoto);
      if(!gallery||!imgs[index])return;
      gallery.querySelector('.pilot-demo-main').src=imgs[index];
      gallery.querySelectorAll('[data-pilot-demo-photo]').forEach(x=>{
        const active=Number(x.dataset.pilotDemoPhoto)===index;
        x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active));
      });
    });
    byId('pilot-business-form').addEventListener('submit',e=>{
      e.preventDefault();const status=byId('pilot-form-status');if(!photo){status.textContent='Añade una foto real para crear la ficha.';return;}
      const candidate={version:2,kind:'private-business-preview',savedAt:new Date().toISOString(),photo,photos};
      for(const k of ['name','cat','city','address','phone','map','description'])candidate[k]=byId('pilot-'+k).value.trim();
      if(!candidate.name||!candidate.city||!candidate.address||!candidate.description){status.textContent='Completa nombre, ubicación y descripción.';return;}
      if(candidate.map&&!/^https:\/\//.test(candidate.map)){status.textContent='El enlace del mapa debe comenzar con https://';return;}
      try{localStorage.setItem(KEY,JSON.stringify(candidate));draft=candidate;showDraft();status.textContent='Ficha guardada en este dispositivo.';byId('business-demo-preview').scrollIntoView({behavior:'smooth',block:'start'});}
      catch{status.textContent='No queda espacio en este navegador. No se pudo guardar la ficha.';}
    });
    byId('pilot-export').onclick=()=>{if(!draft)return;const blob=new Blob([JSON.stringify(draft,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='where-to-go-ficha-negocio.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
    byId('pilot-delete').onclick=()=>{if(!confirm('¿Eliminar la ficha de prueba de este dispositivo?'))return;localStorage.removeItem(KEY);draft=null;photo='';photos=[];byId('pilot-business-form').reset();byId('pilot-export').disabled=true;byId('pilot-delete').disabled=true;showDraft()};
    byId('pilot-install').onclick=async()=>{
      if(installPrompt){await installPrompt.prompt();installPrompt=null;return;}
      toast(/iPad|iPhone|iPod/.test(navigator.userAgent)?'En Safari: Compartir → Agregar a pantalla de inicio.':'En el menú del navegador: Instalar aplicación o Agregar a pantalla de inicio.');
    };
  }
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e});
  window.WTG_PILOT={refresh:render};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();

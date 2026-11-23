/* Where to Go — private, device-local previews for owner-submitted business photos.
   Never uploads or caches images; Supabase handles private storage only on submit. */
(()=>{
  'use strict';
  function init(){
    const form=document.getElementById('register-form');
    const input=document.getElementById('business-photos');
    const preview=document.getElementById('wtg-business-photo-preview');
    const count=document.getElementById('business-photos-count');
    if(!form||!input||!preview||!count)return;
    const defaultText=count.textContent;
    let objectUrls=[];
    function release(){
      for(const url of objectUrls)URL.revokeObjectURL(url);
      objectUrls=[];
      preview.replaceChildren();
    }
    function render(){
      release();
      const files=Array.from(input.files||[]);
      preview.hidden=!files.length;
      if(!files.length){count.textContent=defaultText;return;}
      const valid=files.length<=5&&files.every(file=>
        file.size>0&&file.size<=5*1024*1024&&
        ['image/jpeg','image/png','image/webp'].includes(file.type));
      count.textContent=valid
        ?files.length+' foto(s) seleccionada(s). Se enviarán de forma privada para revisión.'
        :'Revisa las fotos: selecciona de 1 a 5 archivos JPG, PNG o WebP, máximo 5 MB cada uno.';
      for(const [i,file] of files.slice(0,5).entries()){
        const card=document.createElement('div');
        card.className='wtg-business-photo-thumb';
        if(file.type.startsWith('image/')&&file.size>0&&file.size<=5*1024*1024){
          const img=document.createElement('img');
          const url=URL.createObjectURL(file);objectUrls.push(url);
          img.src=url;img.alt='Vista previa de foto '+(i+1);
          img.decoding='async';
          card.appendChild(img);
        }else{
          const placeholder=document.createElement('span');
          placeholder.textContent='Formato o tamaño no admitido';
          card.appendChild(placeholder);
        }
        const label=document.createElement('small');
        label.textContent='Foto '+(i+1);
        card.appendChild(label);
        preview.appendChild(card);
      }
    }
    input.addEventListener('change',render);
    form.addEventListener('reset',()=>setTimeout(render,0));
    window.addEventListener('pagehide',release,{once:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();

/* Where to Go — private, device-local previews for business and tour submissions.
   Photos never leave the device until a signed-in user submits the form. */
(()=>{
  'use strict';
  function bind({formId,inputId,previewId,countId,manageCounter}){
    const form=document.getElementById(formId);
    const input=document.getElementById(inputId);
    const preview=document.getElementById(previewId);
    const count=document.getElementById(countId);
    if(!form||!input||!preview||!count)return;
    const defaultText=count.textContent;
    let urls=[];
    function clear(){
      urls.forEach(url=>URL.revokeObjectURL(url));
      urls=[];
      preview.replaceChildren();
    }
    function render(){
      clear();
      const files=Array.from(input.files||[]);
      preview.hidden=!files.length;
      if(manageCounter){
        const valid=files.length<=5&&files.every(file=>
          file.size>0&&file.size<=5*1024*1024&&
          ['image/jpeg','image/png','image/webp'].includes(file.type));
        count.textContent=!files.length?defaultText:valid
          ?files.length+' foto(s) seleccionada(s). Se enviarán de forma privada para revisión.'
          :'Revisa las fotos: selecciona de 1 a 5 archivos JPG, PNG o WebP, máximo 5 MB cada uno.';
      }
      for(const [i,file] of files.slice(0,5).entries()){
        const card=document.createElement('div');
        card.className='wtg-business-photo-thumb';
        if(['image/jpeg','image/png','image/webp'].includes(file.type)&&file.size>0&&file.size<=5*1024*1024){
          const img=document.createElement('img');
          const url=URL.createObjectURL(file);
          urls.push(url);
          img.src=url;
          img.alt='Vista previa de foto '+(i+1);
          img.decoding='async';
          card.appendChild(img);
        }else{
          const text=document.createElement('span');
          text.textContent='Formato o tamaño no admitido';
          card.appendChild(text);
        }
        const label=document.createElement('small');
        label.textContent='Foto '+(i+1);
        card.appendChild(label);
        preview.appendChild(card);
      }
    }
    input.addEventListener('change',render);
    form.addEventListener('reset',()=>setTimeout(render,0));
    window.addEventListener('pagehide',clear,{once:true});
  }
  function init(){
    bind({formId:'register-form',inputId:'business-photos',
      previewId:'wtg-business-photo-preview',countId:'business-photos-count',manageCounter:true});
    bind({formId:'wtg-tours-form',inputId:'wtg-tours-photos',
      previewId:'wtg-tour-photo-preview',countId:'wtg-tours-photo-count',manageCounter:false});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();

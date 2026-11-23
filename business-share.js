/* Where to Go — shareable business pilot proposal.
   No payment or publication is performed by sharing this link. */
(()=>{
  'use strict';
  function init(){
    const button=document.getElementById('wtg-share-business');
    const status=document.getElementById('wtg-business-share-status');
    if(!button||!status)return;
    button.addEventListener('click',async()=>{
      const url=location.origin+location.pathname+'#promocionar';
      status.textContent='';
      if(navigator.share){
        try{
          await navigator.share({
            title:'Where to Go · Propuesta para negocios',
            text:'Conoce las opciones de registro y promoción de negocios en Where to Go. Las solicitudes se revisan antes de publicar.',
            url
          });
          return;
        }catch(error){
          if(error?.name==='AbortError')return;
        }
      }
      if(navigator.clipboard?.writeText){
        try{
          await navigator.clipboard.writeText(url);
          status.textContent='Enlace de la propuesta copiado. Puedes enviarlo por WhatsApp o correo.';
          return;
        }catch{}
      }
      status.textContent='Comparte este enlace: '+url;
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();

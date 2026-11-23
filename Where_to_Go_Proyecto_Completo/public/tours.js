/* Tours are applications, not published paid listings. Photos stay private in Supabase. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function setup(){
 const open=$('wtg-tours-apply'),modal=$('tours-modal'),close=$('wtg-tours-close'),
  form=$('wtg-tours-form'),feedback=$('wtg-tours-feedback'),photos=$('wtg-tours-photos'),
  counter=$('wtg-tours-photo-count'),history=$('wtg-tours-own-requests'),historyButton=$('wtg-tours-own-open');
 if(!open||!modal||!form)return;
 open.addEventListener('click',()=>{modal.hidden=false;modal.querySelector('input[name="tour_name"]')?.focus()});
 close?.addEventListener('click',()=>modal.hidden=true);
 modal.addEventListener('click',e=>{if(e.target===modal)modal.hidden=true});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)modal.hidden=true});
 function validPhotos(){
  const files=Array.from(photos.files||[]);
  if(files.length<1||files.length>5)return 'Selecciona entre 1 y 5 fotografías.';
  if(files.some(f=>f.size===0||f.size>5*1024*1024))return 'Cada foto debe pesar entre 1 byte y 5 MB.';
  if(files.some(f=>!['image/jpeg','image/png','image/webp'].includes(f.type)))return 'Solo se aceptan JPG, PNG o WebP.';
  return '';
 }
 photos?.addEventListener('change',()=>{
  const error=validPhotos();
  counter.textContent=error||photos.files.length+' fotografía(s) seleccionada(s), pendientes de revisión.';
 });
 form.addEventListener('submit',async e=>{
  e.preventDefault();
  const err=validPhotos();
  if(err){feedback.textContent=err;return}
  const button=form.querySelector('[type="submit"]');button.disabled=true;
  feedback.textContent='Guardando solicitud y fotografías privadas…';
  try{
   if(!window.WTG_SUBMISSIONS)throw Error('No hay servidor conectado.');
   const receipt=await window.WTG_SUBMISSIONS.submitTour(form);
   feedback.textContent='Solicitud recibida: '+receipt.id.slice(0,8)+'. Pendiente de revisión; no publicada ni cobrada.';
   form.reset();
   counter.textContent='Selecciona de 1 a 5 fotografías, máximo 5 MB por foto.';
  }catch(error){
   feedback.textContent='No se envió ni publicó la solicitud: '+String(error?.message||'Error').slice(0,180);
  }finally{button.disabled=false}
 });
 historyButton?.addEventListener('click',async()=>{
  if(!history)return;
  history.hidden=false;history.textContent='Consultando tus solicitudes…';
  try{
   const rows=await window.WTG_SUBMISSIONS.listTours();
   const statusName={pending:'Pendiente de revisión',reviewing:'En revisión',approved:'Aprobada',rejected:'Rechazada',cancelled:'Cancelada'};
   history.innerHTML=rows.length?rows.map(row=>'<article class="wtg-tour-request"><strong>'+
      escape(row.details?.tour_name||'Tour')+'</strong><small> · '+escape(statusName[row.status]||row.status)+
      ' · '+escape((row.created_at||'').slice(0,10))+
      '</small><p>Fotos privadas enviadas: '+Number(row.photoCount||0)+' · Código: '+escape(row.id.slice(0,8))+'</p></article>').join(''):
      '<p>Aún no tienes solicitudes de excursiones registradas.</p>';
  }catch(error){history.textContent='No se pudieron consultar solicitudes: '+String(error?.message||'Error').slice(0,180)}
 });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})();
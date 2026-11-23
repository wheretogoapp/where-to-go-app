/* Where to Go — commercial applications routed to private Supabase tables.
 * Requires the manually approved commercial-submissions-v1.sql migration.
 * Never claims approval or payment. No secret keys in the browser.
 */
(()=>{
'use strict';
const BUCKET='wtg-tour-applications';
function session(){
 const auth=window.WTG_auth;
 if(!auth?.user)throw Error('Inicia sesión con una cuenta confirmada para enviar tu solicitud.');
 if(!auth.database)throw Error('No se pudo conectar al servicio de registros. No se ha enviado nada.');
 return {db:auth.database,user:auth.user};
}
function databaseError(error){
 const raw=String(error?.message||error||'Error al enviar').slice(0,220);
 if(/relation.*does not exist|could not find the table|schema cache|42P01|PGRST205/i.test(raw))
  return Error('Falta activar la tabla de solicitudes en Supabase. La solicitud no fue enviada.');
 if(/permission denied|row.level.security|42501/i.test(raw))
  return Error('El servidor rechazó el permiso. Revisa las políticas RLS o tu sesión.');
 return Error('No se pudo enviar la solicitud: '+raw);
}
async function submitBusiness(details){
 const {db,user}=session();
 if(!details||!['basico','destacado','premium'].includes(details.plan)||!details.name||!details.phone||!details.province)
  throw Error('Completa los datos y el plan antes de solicitar el registro.');
 const {data,error}=await db.from('business_submissions').insert({
  user_id:user.id,plan:details.plan,details
 }).select('id,status,created_at').single();
 if(error)throw databaseError(error);
 if(!data?.id||data.status!=='pending')throw Error('No se obtuvo confirmación del registro; no se considera enviado.');
 return data;
}
async function listBusinesses(){
 const {db,user}=session();
 const {data,error}=await db.from('business_submissions')
  .select('id,plan,details,status,created_at')
  .eq('user_id',user.id).order('created_at',{ascending:false}).limit(50);
 if(error)throw databaseError(error);
 return (data||[]).map(row=>({
  ...row.details,id:row.id,plan:row.plan,
  status:({pending:'Pendiente de revisión',reviewing:'En revisión',approved:'Aprobada',rejected:'Rechazada',cancelled:'Cancelada'})[row.status]||row.status,
  cloudStored:true,createdAt:row.created_at
 }));
}
async function submitTour(form){
 const {db,user}=session(),fields=new FormData(form);
 if(String(fields.get('bot-field')||'').trim())throw Error('Solicitud no válida.');
 const files=[...form.querySelector('input[name="tour_photos"]')?.files||[]];
 if(files.length<1||files.length>5)throw Error('Selecciona entre 1 y 5 fotografías.');
 if(files.some(file=>file.size>5*1024*1024||file.size===0||
  !['image/jpeg','image/png','image/webp'].includes(file.type)))
  throw Error('Cada foto debe ser JPG, PNG o WebP de máximo 5 MB.');
 const details={};
 for(const [key,value] of fields.entries()){
  if(key==='tour_photos'||key==='form-name'||key==='bot-field')continue;
  if(typeof value!=='string')continue;
  details[key]=value.trim().slice(0,1600);
 }
 if(!details.tour_name||!details.organizer||!details.contact||!details.email||
    !details.country||!details.province||!details.city||!details.departure_place||
    !details.departure_date||!details.destinations||details.terms!=='on')
  throw Error('Completa los datos obligatorios y acepta las condiciones.');
 const uploaded=[];
 try{
  for(const [i,file] of files.entries()){
   const suffix=({'image/jpeg':'jpg','image/png':'png','image/webp':'webp'})[file.type];
   const random=typeof crypto?.randomUUID==='function'?crypto.randomUUID():Date.now()+'-'+i+'-'+Math.random().toString(36).slice(2);
   const path=user.id+'/'+random+'.'+suffix;
   const {error}=await db.storage.from(BUCKET).upload(path,file,{contentType:file.type,upsert:false,cacheControl:'3600'});
   if(error)throw databaseError(error);
   uploaded.push(path);
  }
  const {data,error}=await db.from('tour_submissions').insert({
   user_id:user.id,details,photo_paths:uploaded
  }).select('id,status,created_at').single();
  if(error)throw databaseError(error);
  if(!data?.id||data.status!=='pending')throw Error('No se confirmó la recepción de la excursión.');
  return data;
 }catch(e){
  // Clean up uploads from incomplete applications; never leave public photos.
  if(uploaded.length)try{await db.storage.from(BUCKET).remove(uploaded)}catch{}
  throw e;
 }
}
async function listTours(){
 const {db,user}=session();
 const {data,error}=await db.from('tour_submissions')
  .select('id,details,status,created_at')
  .eq('user_id',user.id).order('created_at',{ascending:false}).limit(50);
 if(error)throw databaseError(error);
 return data||[];
}
async function requestAccountDeletion(){
 const {db,user}=session();
 const {data:existing,error:readError}=await db.from('account_deletion_requests')
  .select('id,status').eq('user_id',user.id).eq('status','pending').limit(1);
 if(readError)throw databaseError(readError);
 if(existing?.length)return {alreadyPending:true,id:existing[0].id};
 const {data,error}=await db.from('account_deletion_requests')
  .insert({user_id:user.id}).select('id,status').single();
 if(error)throw databaseError(error);
 if(!data?.id)throw Error('No se confirmó la solicitud.');
 return {alreadyPending:false,id:data.id};
}
window.WTG_SUBMISSIONS=Object.freeze({submitBusiness,listBusinesses,submitTour,listTours,requestAccountDeletion});
})();

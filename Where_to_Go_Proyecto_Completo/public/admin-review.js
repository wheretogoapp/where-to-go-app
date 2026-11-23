/* Where to Go — private staff review. RLS is the access control, not the UI.
   No service-role key, no payment marker, no automatic publication. */
const $=id=>document.getElementById(id);
const auth=$('review-auth'),authStatus=$('review-auth-status');
const app=$('review-app'),status=$('review-status'),list=$('review-list');
const kinds=new Set(['business_submissions','tour_submissions','place_reports',
  'account_deletion_requests','wtg_review_audit']);
const reviewable=new Set(['business_submissions','tour_submissions','place_reports']);
const buckets={business_submissions:'wtg-business-applications',
  tour_submissions:'wtg-tour-applications',place_reports:'wtg-place-reports'};
const names={business_submissions:'Negocios',tour_submissions:'Excursiones',
 place_reports:'Reportes de lugares',account_deletion_requests:'Solicitudes de eliminación',
 wtg_review_audit:'Historial de revisión'};
const labels={pending:'Pendiente',reviewing:'En revisión',approved:'Aprobada para evaluación comercial',
 rejected:'Rechazada',cancelled:'Cancelada',accepted:'Aceptado',completed:'Completada'};
let db=null,current='business_submissions',entries=new Map(),loading=false,authorized=false;
function say(message){status.textContent=message||''}
function el(tag,cls,value){
 const n=document.createElement(tag);
 if(cls)n.className=cls;
 if(value!=null)n.textContent=String(value);
 return n;
}
function add(parent,tag,cls,value){const n=el(tag,cls,value);parent.append(n);return n}
function prettify(key){
 const hints={tour_name:'Tour',organizer:'Organizador',name:'Nombre',phone:'Teléfono',
 category:'Categoría',province:'Provincia',city:'Ciudad',country:'País',
 address:'Dirección',departure_place:'Salida desde',destinations:'Destinos',
 departure_date:'Fecha',description:'Descripción',contact:'Contacto',email:'Correo'};
 return hints[key]||key.replace(/_/g,' ');
}
function detailGrid(card,details){
 if(!details||typeof details!=='object')return;
 const grid=add(card,'div','details');
 for(const [key,value] of Object.entries(details).slice(0,24)){
  if(['bot-field','terms','form-name'].includes(key)||typeof value==='object')continue;
  const row=add(grid,'div','detail');
  add(row,'strong','',prettify(key));
  add(row,'span','',String(value||'—').slice(0,260));
 }
}
function action(buttonLabel,row,action){
 const b=el('button','secondary',buttonLabel);
 b.type='button';b.dataset.reviewId=row.id;b.dataset.reviewStatus=action;
 return b;
}
function rowCard(row,table){
 const card=el('article','card');
 const heading=String(row.details?.name||row.details?.tour_name||
  row.details?.nombre||names[table]||'Solicitud');
 add(card,'h2','',heading);
 add(card,'div','status','Estado: '+(labels[row.status]||row.status));
 add(card,'div','meta','Referencia '+String(row.id).slice(0,8)+' · '+new Date(row.created_at||Date.now()).toLocaleDateString('es-DO'));
 if(row.plan)add(card,'p','','Plan solicitado: '+row.plan+' (sin pago confirmado)');
 detailGrid(card,row.details);
 if(row.review_note)add(card,'p','notice','Nota de revisión: '+row.review_note);
 if(row.photo_paths?.length||row.photo_path){
  const items=Array.isArray(row.photo_paths)?row.photo_paths:[row.photo_path];
  add(card,'p','meta',items.length+' foto(s) privadas pendientes de revisión');
  const preview=add(card,'div','photos');preview.dataset.photosFor=row.id;
  const view=action('Ver fotos privadas',row,'photos');
  card.append(view);
 }
 if(reviewable.has(table)){
  const label=add(card,'label','meta','Observaciones de revisión (solo operador y solicitante)');
  const notes=add(label,'textarea','');
  notes.rows=2;notes.maxLength=1000;notes.dataset.noteFor=row.id;
  notes.value=row.review_note||'';
  notes.style.cssText='display:block;width:100%;min-height:78px;border-radius:10px;margin:6px 0 0;padding:10px;color:#122b43;background:#f3f8fc;font:inherit';
  const bar=add(card,'div','actions');
  bar.append(action('En revisión',row,'reviewing'));
  bar.append(action(table==='place_reports'?'Aceptar reporte':'Aprobar contenido',row,
    table==='place_reports'?'accepted':'approved'));
  bar.append(action('Rechazar',row,'rejected'));
  add(card,'small','meta','Aprobar aquí NO publica una ficha ni registra un cobro.');
 }else if(table==='account_deletion_requests'){
  add(card,'p','notice','Pendiente de trámite seguro. Esta pantalla no elimina cuentas ni datos por sí sola.');
 }
 return card;
}
async function fetchReviews(){
 if(!authorized||loading)return;
 loading=true;say('Cargando '+names[current].toLowerCase()+'…');list.replaceChildren();
 try{
  const fields=current==='wtg_review_audit'?'*':
    current==='business_submissions'||current==='tour_submissions'?
    'id,user_id,plan,details,status,photo_paths,created_at,reviewed_at,review_note':
    current==='place_reports'?
    'id,user_id,details,status,photo_path,created_at,reviewed_at,review_note':
    'id,user_id,status,created_at,completed_at';
  // Tours have no plan column.
  const columns=current==='tour_submissions'?fields.replace('plan,',''):fields;
  const sorted=current==='wtg_review_audit'?'changed_at':'created_at';
  const {data,error}=await db.from(current).select(columns).order(sorted,{ascending:false}).limit(100);
  if(error)throw error;
  entries=new Map((data||[]).map(row=>[row.id,row]));
  if(current==='wtg_review_audit'){
   for(const row of data||[]){
    const card=add(list,'article','card');
    add(card,'h2','',String(row.submission_type||'').replace('_submissions',''));
    add(card,'p','',String(row.previous_status||'—')+' → '+String(row.next_status||''));
    add(card,'small','meta',new Date(row.changed_at).toLocaleString('es-DO'));
   }
  }else{
   for(const row of data||[])list.append(rowCard(row,current));
  }
  say((data||[]).length+' registro(s) encontrados. Solo se muestran solicitudes autorizadas.');
  if(!(data||[]).length)add(list,'p','notice','Todavía no hay solicitudes en esta bandeja.');
 }catch(e){say('No se pudieron consultar las solicitudes. Revisa tu sesión y los permisos.');}
 finally{loading=false}
}
async function displayPhotos(row,table){
 const container=[...list.querySelectorAll('[data-photos-for]')].find(el=>el.dataset.photosFor===row.id);
 if(!container)return;
 container.replaceChildren();
 const paths=Array.isArray(row.photo_paths)?row.photo_paths:(row.photo_path?[row.photo_path]:[]);
 for(const p of paths.slice(0,5)){
  const {data,error}=await db.storage.from(buckets[table]).createSignedUrl(p,120);
  if(error||!data?.signedUrl){add(container,'small','meta','Foto no disponible');continue}
  const image=el('img');
  image.alt='Fotografía privada de solicitud '+String(row.id).slice(0,8);
  image.src=data.signedUrl;image.referrerPolicy='no-referrer';image.loading='lazy';
  container.append(image);
 }
}
async function review(row,table,next,button){
 if(!reviewable.has(table))return;
 const allowed=table==='place_reports'?['reviewing','accepted','rejected']:
   ['reviewing','approved','rejected'];
 if(!allowed.includes(next))return;
 const field=[...list.querySelectorAll('[data-note-for]')].find(el=>el.dataset.noteFor===row.id);
 const note=String(field?.value||'').trim().slice(0,1000);
 if(next==='rejected'&&note.length<8){say('Para rechazar una solicitud, escribe una explicación de al menos 8 caracteres.');field?.focus();return}
 const display=labels[next]||next;
 if(!confirm('¿Cambiar a "'+display+'"? Esto NO implica cobro ni publicación.'))return;
 button.disabled=true;say('Guardando decisión…');
 try{
  const changes={status:next,review_note:note};
  if(table!=='place_reports')changes.reviewed_at=new Date().toISOString();
  else changes.reviewed_at=new Date().toISOString();
  const {data,error}=await db.from(table).update(changes).eq('id',row.id).eq('status',row.status)
    .select('id,status').maybeSingle();
  if(error)throw error;
  if(!data?.id)throw Error('La solicitud cambió mientras la revisabas. Actualiza la bandeja.');
  await fetchReviews();
  say('Revisión guardada. No se ha publicado ni cobrado el anuncio.');
 }catch(e){say('No se guardó la revisión. '+String(e?.message||'Error').slice(0,170));}
 finally{button.disabled=false}
}
list.addEventListener('click',event=>{
 const button=event.target.closest('button[data-review-id]');
 if(!button||!authorized)return;
 const row=entries.get(button.dataset.reviewId);if(!row)return;
 if(button.dataset.reviewStatus==='photos'){void displayPhotos(row,current);return}
 void review(row,current,button.dataset.reviewStatus,button);
});
document.querySelectorAll('[data-review-kind]').forEach(button=>button.addEventListener('click',()=>{
 if(!kinds.has(button.dataset.reviewKind)||!authorized)return;
 current=button.dataset.reviewKind;
 document.querySelectorAll('[data-review-kind]').forEach(b=>b.setAttribute('aria-selected',String(b===button)));
 void fetchReviews();
}));
$('review-refresh').addEventListener('click',()=>void fetchReviews());
$('review-signout').addEventListener('click',async()=>{
 if(!db)return;
 await db.auth.signOut();
 authorized=false;app.hidden=true;auth.hidden=false;
 authStatus.textContent='La sesión administrativa se ha cerrado.';
});
async function init(){
 try{
  const settings=window.WTG_CONFIG;
  if(!settings?.supabaseUrl||!settings?.supabaseAnonKey)throw Error('No está disponible el inicio de sesión.');
  const {createClient}=await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  db=createClient(settings.supabaseUrl,settings.supabaseAnonKey,{
   auth:{detectSessionInUrl:true,persistSession:true,autoRefreshToken:true}
  });
  const {data:identity,error:identError}=await db.auth.getUser();
  if(identError||!identity?.user)throw Error('Inicia sesión en Where to Go con tu cuenta autorizada.');
  const user=identity.user;
  const {data:role,error}=await db.from('wtg_reviewers').select('role')
    .eq('user_id',user.id).maybeSingle();
  if(error||!role||!['owner','moderator'].includes(role.role))
   throw Error('Esta cuenta no tiene permisos de revisión.');
  authorized=true;auth.hidden=true;app.hidden=false;
  $('review-user').textContent='Acceso privado · '+(role.role==='owner'?'Propietario':'Moderador');
  await fetchReviews();
 }catch(e){authStatus.textContent=String(e.message||'Acceso no disponible').slice(0,200);}
}
void init();

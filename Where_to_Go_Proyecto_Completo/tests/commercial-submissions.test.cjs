const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const js=fs.readFileSync(path.join(root,'public','commercial-submissions.js'),'utf8');
const sql=fs.readFileSync(path.join(root,'supabase','commercial-submissions-v1.sql'),'utf8');
const userId='aaaaaaaa-1111-4222-8aaa-aaaaaaaaaaaa';
function harness(authenticated=true){
 const calls={insert:[],uploads:[],removed:[],queries:[]};
 class FormDataFake{
  constructor(form){this.value=new Map(form.fakeFields||[])}
  get(k){return this.value.get(k)}
  *entries(){yield* this.value.entries()}
 }
 const response={id:'bbbbbbbb-2222-4222-8bbb-bbbbbbbbbbbb',status:'pending',created_at:'2026-11-23'};
 const db={
  storage:{from(bucket){return {
   async upload(p,file,opts){calls.uploads.push({bucket,p,file,opts});return {error:null}},
   async remove(paths){calls.removed.push({bucket,paths});return {error:null}}
  }}},
  from(table){
   const q={
    insert(row){
     calls.insert.push({table,row});return q;
    },
    select(fields){calls.queries.push({table,fields});return q},
    eq(){return q},
    order(){return q},
    async limit(){return {data:[],error:null}},
    async single(){return {data:response,error:null}}
   };
   return q;
  }
 };
 const window={WTG_auth:{user:authenticated?{id:userId}:null,database:db}};
 vm.runInNewContext(js,{window,FormData:FormDataFake,crypto:{randomUUID:()=> 'cccccccc-3333-4333-8ccc-cccccccccccc'},
  Date,Error,Math,Object,String,Array,Promise});
 return {api:window.WTG_SUBMISSIONS,calls,window};
}
test('Solicitudes comerciales: RLS nunca permite publicar o pagar desde cliente',()=>{
 for(const table of ['business_submissions','tour_submissions','place_reports','account_deletion_requests'])
  assert.match(sql,new RegExp('alter table public\\.'+table+' enable row level security'));
 assert.match(sql,/status = 'pending'/);
 assert.match(sql,/revoke all on public\.business_submissions from anon/);
 assert.match(sql,/revoke all on public\.tour_submissions from anon/);
 assert.match(sql,/public = excluded\.public/);
 assert.match(sql,/auth\.uid/);
 assert.doesNotMatch(js,/service_role|paymentVerified\s*:/);
});
test('Sin cuenta jamás se registra un negocio',async()=>{
 const {api,calls}=harness(false);
 await assert.rejects(api.submitBusiness({name:'Restaurante',phone:'809',province:'Puerto Plata',plan:'basico'},[{size:1000,type:'image/jpeg'}]),/Inicia sesión/);
 assert.equal(calls.insert.length,0);
});
test('Negocio autenticado recibe UUID y estado pendiente desde servidor',async()=>{
 const {api,calls}=harness();
 const details={name:'Restaurante real',phone:'809-555',province:'Puerto Plata',plan:'premium'};
 const row=await api.submitBusiness(details,[{size:1000,type:'image/jpeg'}]);
 assert.equal(row.status,'pending');
 assert.equal(calls.insert.length,1);
 assert.equal(calls.insert[0].table,'business_submissions');
 assert.equal(calls.insert[0].row.user_id,userId);
 assert.equal(calls.insert[0].row.plan,'premium');
 assert.equal(calls.uploads[0].bucket,'wtg-business-applications');
 assert.equal(calls.insert[0].row.photo_paths.length,1);
});
test('Tour: fotos privadas bajo carpeta del propietario, máximo 5',async()=>{
 const {api,calls}=harness();
 const form={
  fakeFields:[['tour_name','Aventura'],['organizer','Organizador'],['contact','809'],['email','hola@example.org'],
              ['country','República Dominicana'],['province','Puerto Plata'],['city','Imbert'],
              ['departure_place','Parque central'],['departure_date','2026-12-21'],
              ['destinations','Cascadas'],['terms','on']],
  querySelector(){return {files:[{size:1200,type:'image/jpeg'}]}}
 };
 const res=await api.submitTour(form);
 assert.ok(res.id);
 assert.equal(calls.uploads.length,1);
 assert.equal(calls.uploads[0].bucket,'wtg-tour-applications');
 assert.ok(calls.uploads[0].p.startsWith(userId+'/'));
 assert.equal(calls.insert[0].table,'tour_submissions');
 assert.equal(calls.insert[0].row.photo_paths.length,1);
});
test('Reporte de foto se guarda en bucket privado de correcciones',async()=>{
 const {api,calls}=harness();
 await api.submitReport({nombre:'Playa',provincia:'Samaná',localidad:'Las Terrenas'},
                        {size:1450,type:'image/png'});
 assert.equal(calls.uploads[0].bucket,'wtg-place-reports');
 assert.equal(calls.insert[0].table,'place_reports');
});
test('Eliminar cuenta registra una solicitud sin borrar usuarios desde el navegador',async()=>{
 const {api,calls}=harness();
 const result=await api.requestAccountDeletion();
 assert.equal(result.alreadyPending,false);
 assert.equal(calls.insert[0].table,'account_deletion_requests');
 assert.doesNotMatch(js,/deleteUser\(/);
});

test('Nunca permitir TRUNCATE, UPDATE ni DELETE a usuarios autenticados en solicitudes comerciales',()=>{
 assert.match(sql,/revoke all privileges on table[\s\S]*?from public, anon, authenticated;/i,
  'La migración debe revocar permisos por defecto que RLS no protege, como TRUNCATE');
 assert.match(sql,/grant select, insert on table[\s\S]*?to authenticated;/i,
  'Los clientes deben disponer únicamente de SELECT e INSERT');
});

test('Negocios sin foto o con más de cinco fotos son rechazados antes de subir',async()=>{
 const {api,calls}=harness();
 const details={name:'Restaurante real',phone:'809',province:'Puerto Plata',plan:'basico'};
 await assert.rejects(api.submitBusiness(details,[]),/entre 1 y 5/);
 await assert.rejects(api.submitBusiness(details,Array(6).fill({size:1000,type:'image/jpeg'})),/entre 1 y 5/);
 await assert.rejects(api.submitBusiness(details,[{size:7*1024*1024,type:'image/jpeg'}]),/máximo 5 MB/);
 assert.equal(calls.uploads.length,0);
});

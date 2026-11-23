'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'..','public','traveler-profile.js'),'utf8');
function harness(){
 const saved=new Map();
 const nodes=new Map();
 const node=id=>{
  if(!nodes.has(id))nodes.set(id,{
   id,hidden:id==='wtg-traveler-profile',textContent:'',innerHTML:'',value:'',checked:false,
   classList:{add(){},remove(){},toggle(){}},dataset:{},focus(){},
   setAttribute(){},addEventListener(){},querySelectorAll(){return []}
  });
  return nodes.get(id);
 };
 const doc={
  getElementById:node,querySelector(){return null},querySelectorAll(){return []},
  documentElement:{dataset:{}},addEventListener(){},
  body:{classList:{add(){},remove(){}}}
 };
 const localStorage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)};
 const media={matches:false,addEventListener(){}};
 const window={addEventListener(){},matchMedia(){return media},WTG_I18N:{change(){}},WTG_auth:{setPersonalization:async()=>{}}};
 vm.runInNewContext(source,{
  window,document:doc,localStorage,matchMedia:()=>media,Date,JSON,console,
  navigator:{userAgent:'Android'},setTimeout:()=>0,clearTimeout(){},confirm:()=>true,
  Blob,URL:{createObjectURL:()=>'',revokeObjectURL(){}},Intl
 });
 const profile=(date,title)=>({
  v:2,updatedAt:date,name:'',city:'',theme:'dark',language:'es',
  historyEnabled:false,explored:[],visited:[],
  trips:[{id:'trip-1',title,date:'',createdAt:date,places:[]}]
 });
 function client(remote,{deferred}={}){
  const calls=[];
  return {
   calls,
   from(table){
    assert.equal(table,'traveler_profiles');
    return {
     select(){return {eq(){return {maybeSingle:()=>deferred||Promise.resolve({data:remote?{data:remote}:null,error:null})}}}},
     async upsert(row){calls.push(row);return {error:null}}
    }
   }
  };
 }
 return {profile:window.WTG_PROFILE,saved,client,makeProfile:profile};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('Si el teléfono tiene viajes más recientes, se suben a la nube antes de afirmar sincronización',async()=>{
 const h=harness();
 h.saved.set('wtg_traveler_v2_qa-a',JSON.stringify(h.makeProfile('2026-11-23T18:00:00Z','Viaje actualizado')));
 const cloud=h.client(h.makeProfile('2026-11-22T18:00:00Z','Viaje antiguo'));
 h.profile.setSession({id:'qa-a'},cloud);
 await tick();await tick();
 assert.equal(cloud.calls.length,1,'La versión local más nueva debe subirse');
 assert.equal(cloud.calls[0].data.trips[0].title,'Viaje actualizado');
 assert.equal(h.profile.snapshot.trips[0].title,'Viaje actualizado');
});
test('Si la nube tiene una versión más reciente, se recupera sin sobreescribirla',async()=>{
 const h=harness();
 h.saved.set('wtg_traveler_v2_qa-a',JSON.stringify(h.makeProfile('2026-11-22T18:00:00Z','Viaje antiguo')));
 const cloud=h.client(h.makeProfile('2026-11-23T18:00:00Z','Viaje actualizado'));
 h.profile.setSession({id:'qa-a'},cloud);
 await tick();await tick();
 assert.equal(cloud.calls.length,0,'No subir datos antiguos por encima de los recientes');
 assert.equal(h.profile.snapshot.trips[0].title,'Viaje actualizado');
});
test('Una consulta atrasada de otra cuenta no puede sustituir los viajes de la cuenta actual',async()=>{
 const h=harness();
 let release;
 const pending=new Promise(resolve=>{release=resolve});
 const a=h.client(null,{deferred:pending});
 const b=h.client(null);
 h.saved.set('wtg_traveler_v2_qa-b',JSON.stringify(h.makeProfile('2026-11-23T18:00:00Z','Viaje cuenta B')));
 h.profile.setSession({id:'qa-a'},a);
 h.profile.setSession({id:'qa-b'},b);
 await tick();
 release({data:{data:h.makeProfile('2026-11-24T18:00:00Z','Viaje cuenta A')},error:null});
 await tick();await tick();
 assert.equal(h.profile.snapshot.trips[0].title,'Viaje cuenta B');
 assert.equal(a.calls.length,0,'No escribir después de haber cambiado de cuenta');
});

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'..','public');
const source=file=>fs.readFileSync(path.join(root,file),'utf8');

function profileHarness(){
 const nodes=new Map();
 let clickHandler=null;
 const node=id=>{
  if(!nodes.has(id))nodes.set(id,{
   id,hidden:false,textContent:'',innerHTML:'',value:'',checked:false,dataset:{},
   focus(){},classList:{add(){},remove(){},toggle(){}},setAttribute(){},
   addEventListener(){},querySelectorAll:()=>[]
  });
  return nodes.get(id);
 };
 const overlay=node('wtg-traveler-profile');overlay.hidden=true;
 overlay.querySelectorAll=()=>[];
 overlay.addEventListener=(type,fn)=>{if(type==='click')clickHandler=fn};
 const saved=new Map();
 const localStorage={getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,String(v)),removeItem:k=>saved.delete(k)};
 const media={matches:false,addEventListener(){}};
 const window={
  addEventListener(){},matchMedia:()=>media,
  WTG_I18N:{change(){}},WTG_auth:{setPersonalization:async()=>{}}
 };
 const document={
  getElementById:node,addEventListener(){},documentElement:{dataset:{}},
  querySelector:()=>null,querySelectorAll:()=>[],
  body:{classList:{add(){},remove(){}}}
 };
 const context={window,document,localStorage,matchMedia:()=>media,Date,JSON,console,
  navigator:{userAgent:'iPhone'},setTimeout:()=>0,clearTimeout(){},confirm:()=>true,
  Blob,URL:{createObjectURL:()=>'',revokeObjectURL(){}},
  Intl};
 new vm.Script(source('traveler-profile.js')).runInNewContext(context);
 return {api:window.WTG_PROFILE,nodes,node,saved,click(button){
   clickHandler({target:{closest:()=>button}});
 }};
}
test('Se guarda un lugar marcado manualmente sin inventar una verificación GPS',()=>{
 const {api}=profileHarness();
 api.recordOpen({id:'google-123',name:'Lugar real',source:'google'});
 assert.equal(api.snapshot.explored.length,0,'Explorar sin consentimiento no crea historial');
 api.markVisited({id:'google-123',name:'Lugar real',source:'google'});
 assert.equal(api.snapshot.visited.length,1);
 assert.equal(api.snapshot.visited[0].id,'google-123');
 assert.equal(JSON.stringify(api.snapshot).includes('Lugar real'),false,'No almacenar ficha/nombre de Google');
});
test('Viajes y consentimiento funcionan en el perfil privado del dispositivo',()=>{
 const {api,node,click}=profileHarness();
 api.open('trips');
 node('wtg-profile-new-trip').value='Vacaciones en Samaná';
 click({id:'wtg-profile-add-trip',dataset:{}});
 assert.equal(api.snapshot.trips.length,1);
 api.addToTrip({id:'google-456',name:'Playa de Google',source:'google'});
 click({id:'',dataset:{wtgTripAdd:api.snapshot.trips[0].id}});
 assert.deepEqual(Array.from(api.snapshot.trips[0].places),['google-456']);
 api.open('settings');
 node('wtg-profile-theme-input').value='dark';
 node('wtg-profile-language-input').value='es';
 node('wtg-profile-history-input').checked=true;
 click({id:'wtg-profile-save',dataset:{}});
 api.recordOpen({id:'google-456',name:'Playa de Google',source:'google'});
 assert.equal(api.snapshot.explored.length,1);
});
test('Instalación iOS/Android y metadatos PWA usan iconos reales del logo aprobado',()=>{
 const manifest=JSON.parse(source('manifest.webmanifest'));
 const html=source('index.html'),css=source('traveler-profile.css');
 assert.equal(manifest.display,'standalone');
 assert.equal(manifest.id,'/');
 assert(html.includes('rel="apple-touch-icon" href="/assets/wtg-icon-180.png"'));
 assert(html.includes('id="wtg-traveler-profile"'));
 assert(html.includes('data-profile-open'));
 assert(/src="\/traveler-profile\.js\?v=\d+"/.test(html),'El perfil usa un JavaScript versionado para actualizar la caché del móvil');
 assert(html.includes('href="/traveler-profile.css?v=1"'));
 assert(css.includes('#wtg-traveler-profile[hidden]'));
 for(const n of [180,192,512])assert(fs.statSync(path.join(root,'assets','wtg-icon-'+n+'.png')).size>15000);
 const auth=source('auth.js'),app=source('app.js');
 assert(auth.includes('WTG_PROFILE?.setSession'));
 assert(auth.includes('syncFavorite('));
 assert(app.includes('data-wtg-visited'));
 assert(app.includes('data-wtg-trip'));
 assert(app.includes('WTG_PROFILE?.recordOpen'));
 const sql=fs.readFileSync(path.join(__dirname,'..','supabase','traveler-profile-v2.sql'),'utf8');
 assert(sql.includes('row level security'));
 assert(sql.includes('auth.uid()'));
});

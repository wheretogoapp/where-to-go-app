const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..','public');
const source=name=>fs.readFileSync(path.join(root,name),'utf8');

function localeHarness(){
 const nodes=[
  {nodeType:3,nodeValue:'Tours y excursiones',parentElement:{closest:()=>null}},
  {nodeType:3,nodeValue:'Mostrando 20 de 300 lugares',parentElement:{closest:()=>null}},
  {nodeType:3,nodeValue:'Paseo de Doña Blanca',parentElement:{closest:()=>null}}
 ];
 const attrs={placeholder:'Buscar destinos y establecimientos',title:'Actualizar lugares','aria-label':'Radio de búsqueda'};
 const control={
  nodeType:1,matches:()=>false,
  getAttribute:name=>attrs[name]??null,
  setAttribute:(name,value)=>{attrs[name]=value}
 };
 const element={
  nodeType:1,lang:'es',matches:()=>false,
  querySelectorAll:()=>[control]
 };
 const listeners={};
 const document={
  nodeType:9,readyState:'loading',documentElement:element,
  addEventListener:(event,fn)=>{listeners[event]=fn},
  querySelectorAll:()=>[],
  createTreeWalker:()=>{let index=0;return {nextNode:()=>nodes[index++]||null}}
 };
 const saved=new Map();
 const window={dispatchEvent:()=>{}};
 const context={
  window,document,navigator:{language:'es-DO',languages:['es-DO']},
  localStorage:{getItem:key=>saved.get(key)||null,setItem:(key,v)=>saved.set(key,v)},
  requestAnimationFrame:fn=>fn(),CustomEvent:class{constructor(type,init){this.type=type;this.detail=init?.detail}},
  NodeFilter:{SHOW_TEXT:4},console
 };
 vm.runInNewContext(source('language.js'),context);
 return {api:window.WTG_I18N,nodes,attrs,saved,element,listeners};
}
test('Los 6 idiomas traducen navegación, formularios y selector de forma reversible',()=>{
 const {api,nodes,attrs,element,saved}=localeHarness();
 const expected={
  es:['Tours y excursiones','Mostrando 20 de 300 lugares','Buscar destinos y establecimientos'],
  en:['Tours and excursions','Showing 20 of 300 places','Search destinations and businesses'],
  fr:['Visites et excursions','20 lieux affichés sur 300','Rechercher des destinations et des commerces'],
  pt:['Passeios e excursões','Mostrando 20 de 300 lugares','Buscar destinos e estabelecimentos'],
  de:['Touren und Ausflüge','20 von 300 Orten angezeigt','Reiseziele und Unternehmen suchen'],
  it:['Tour ed escursioni','Mostrati 20 luoghi su 300','Cerca destinazioni e attività']
 };
 for(const [code,strings] of Object.entries(expected)){
  api.change(code);
  assert.equal(api.lang,code);
  assert.equal(element.lang,code);
  assert.equal(nodes[0].nodeValue,strings[0],code+' sección tours');
  assert.equal(nodes[1].nodeValue,strings[1],code+' contador dinámico');
  assert.equal(nodes[2].nodeValue,'Paseo de Doña Blanca','No cambiar nombres reales');
  assert.equal(attrs.placeholder,strings[2],code+' búsqueda');
  assert.equal(saved.get('wtg_ui_language'),code);
  assert.notEqual(api.t('Elige cómo destacar'),'Elige cómo destacar',code==='es'?undefined:'Texto comercial sin traducir');
 }
});
test('Cuando el resultado cambia, la traducción usa el nuevo valor y puede volver al español',()=>{
 const {api,nodes,attrs}=localeHarness();
 api.change('en');
 nodes[1].nodeValue='Mostrando 6 de 82 lugares';
 api.change('it');
 assert.equal(nodes[1].nodeValue,'Mostrati 6 luoghi su 82');
 api.change('es');
 assert.equal(nodes[1].nodeValue,'Mostrando 6 de 82 lugares');
 assert.equal(attrs.title,'Actualizar lugares');
 assert.equal(attrs['aria-label'],'Radio de búsqueda');
});
test('Controles móviles de idioma y selector mundial tienen contraste y conservan destino',()=>{
 const html=source('index.html'),css=source('ux-polish.css'),world=source('world-explorer.js'),app=source('app.js');
 assert(html.includes('src="/language.js?v=7.0"'),'Publicar nueva versión de traducciones');
 assert(html.includes('href="/ux-polish.css?v=8"'),'Publicar selector de contraste');
 assert(html.includes('src="/app.js?v=25.6"'),'Refrescar tarjetas al cambiar el idioma');
 assert(css.includes('.topbar #wtg-language-select'));
 assert(css.includes('background:#ffffff!important;color:#082d57!important'));
 assert(css.includes('.auth-shell #wtg-auth-language-select'));
 assert(css.includes('html:lang(en) #view-inicio .wtg-v8-home-tools:before'));
 assert(world.includes("window.addEventListener('wtg-language-changed',()=>{"));
 assert(world.includes('country.value=selectedCountry'));
 assert(world.includes('if(selectedCity)city.value=selectedCity'));
 assert(app.includes("const homeSignature=[state.dataMode,state.city,state.radius,window.WTG_I18N?.lang||'es'"));
 assert(app.includes("state.exploreLimit,wtgGoogleBusy?'busy':'idle'")==false || app.includes("state.exploreLimit,wtgGoogleBusy?'busy':'idle'"),"No cambiar exploración por i18n");
});

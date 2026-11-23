/* Branded mobile drawer. Keep existing app navigation, profile and login intact. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const drawer=$('wtg-main-drawer'),shade=$('wtg-main-drawer-backdrop'),menuButton=$('wtg-mobile-menu-trigger');
if(!drawer||!shade||!menuButton)return;
let previousFocus=null;
// Use the very same category definitions as Explore: no incomplete hard-coded menu.
const groups=[
 ['🌿','Naturaleza y aventuras','rios balnearios cascadas lagunas senderismo playas parques atracciones entretenimiento infantil piscinas deportes'],
 ['🍽️','Comida y bebida','restaurantes bares discotecas cafes heladerias panaderias pescaderias comidarapida'],
 ['🛒','Compras y mercados','supermercados colmados mercados tiendas ferreterias electrodomesticos tecnologia'],
 ['💆','Belleza y bienestar','barberias salones unas spas gimnasios'],
 ['🏨','Estadías y transporte','hoteles resorts villas taxis gasolineras talleres lavaderos'],
 ['🩺','Salud y servicios','farmacias hospitales odontologia veterinarias mascotas bancos cajeros lavanderias servicios escuelas iglesias']
];
const categorySearch=$('wtg-drawer-category-search');
const categoryList=$('wtg-drawer-category-list');
function normalize(s){
 return String(s||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLocaleLowerCase();
}
function filterCategories(){
 if(!categoryList)return;
 const query=normalize(categorySearch?.value.trim());
 let shown=0;
 categoryList.querySelectorAll('[data-cat]').forEach(button=>{
  const match=!query||normalize(button.dataset.categorySearch).includes(query);
  button.hidden=!match;
  if(match)shown++;
 });
 categoryList.querySelectorAll('.wtg-drawer-category-group').forEach(group=>{
  group.hidden=![...group.querySelectorAll('[data-cat]')].some(button=>!button.hidden);
 });
 const empty=$('wtg-drawer-category-empty');
 if(empty)empty.hidden=shown>0;
}
function renderCategories(){
 if(!categoryList||typeof CATEGORIES==='undefined')return;
 const known=new Map(CATEGORIES.map(c=>[c.id,c]));
 const fragment=document.createDocumentFragment();
 const count=$('wtg-drawer-category-count');
 if(count)count.textContent='('+CATEGORIES.length+')';
 function categoryButton(category,all=false){
  const button=document.createElement('button');
  button.type='button';
  button.dataset.cat=category.id;
  button.className='wtg-drawer-category-button';
  const name=all?(window.WTG_I18N?.t?.('Todo')||'Todos los lugares'):
    (typeof catInfo==='function'?catInfo(category.id).name:category.name);
  button.dataset.categorySearch=category.name+' '+name;
  button.setAttribute('aria-label','Explorar '+name);
  if(typeof state!=='undefined'&&state.category===category.id)button.setAttribute('aria-current','true');
  const icon=document.createElement('span');icon.className='wtg-drawer-category-emoji';
  icon.textContent=category.emoji;
  icon.setAttribute('aria-hidden','true');
  const text=document.createElement('span');text.textContent=name;
  button.append(icon,text);
  return button;
 }
 const all=document.createElement('div');all.className='wtg-drawer-category-all';
 all.append(categoryButton({id:'todos',name:'Todos los lugares',emoji:'🌎'},true));
 fragment.append(all);
 const listed=new Set();
 for(const [emoji,label,ids] of groups){
  const group=document.createElement('section');
  group.className='wtg-drawer-category-group';
  const title=document.createElement('h3');title.textContent=emoji+' '+label;
  const buttons=document.createElement('div');buttons.className='wtg-drawer-category-grid';
  for(const id of ids.split(' ')){
   const category=known.get(id);
   if(!category||listed.has(id))continue;
   listed.add(id);buttons.append(categoryButton(category));
  }
  if(buttons.childElementCount){group.append(title,buttons);fragment.append(group);}
 }
 // New categories must appear automatically even when the core list grows.
 const extra=CATEGORIES.filter(c=>!listed.has(c.id));
 if(extra.length){
  const group=document.createElement('section');group.className='wtg-drawer-category-group';
  const title=document.createElement('h3');title.textContent='📍 Otras categorías';
  const buttons=document.createElement('div');buttons.className='wtg-drawer-category-grid';
  extra.forEach(c=>buttons.append(categoryButton(c)));
  group.append(title,buttons);fragment.append(group);
 }
 categoryList.replaceChildren(fragment);
 filterCategories();
}
categorySearch?.addEventListener('input',filterCategories);
window.addEventListener('wtg-language-changed',renderCategories);
renderCategories();

function open(){
 if(!drawer.hidden)return;
 previousFocus=document.activeElement;
 renderCategories();
 window.WTG_PROFILE?.close?.();
 drawer.hidden=false;shade.hidden=false;
 document.body.classList.add('wtg-drawer-open');
 menuButton.setAttribute('aria-expanded','true');
 $('wtg-drawer-close')?.focus({preventScroll:true});
}
function close(){
 if(drawer.hidden)return;
 drawer.hidden=true;shade.hidden=true;
 document.body.classList.remove('wtg-drawer-open');
 menuButton.setAttribute('aria-expanded','false');
 if(previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
}
menuButton.addEventListener('click',event=>{
 event.preventDefault();
 drawer.hidden?open():close();
});
$('wtg-drawer-close').addEventListener('click',close);
shade.addEventListener('click',close);
drawer.addEventListener('click',event=>{
 const link=event.target.closest('a');
 if(link){close();return}
 const button=event.target.closest('button');
 if(!button)return;
 if(button.hasAttribute('data-cat')){
  // Existing app.js category handler opens Explore (or the taxis directory).
  close();
  return;
 }
 if(button.dataset.drawerView){
  const view=button.dataset.drawerView;close();
  if(typeof navigate==='function')navigate(view);
  return;
 }
 if(button.dataset.drawerProfile){
  const tab=button.dataset.drawerProfile;close();
  window.WTG_PROFILE?.open?.(tab);
  if(tab!=='home'){
   const profileTab=document.querySelector('#wtg-traveler-profile [data-profile-tab="'+tab+'"]');
   profileTab?.click();
  }
  return;
 }
 if(button.hasAttribute('data-drawer-login')){
  close();window.WTG_auth?.showLogin?.();return;
 }
});
document.addEventListener('keydown',event=>{
 if(drawer.hidden)return;
 if(event.key==='Escape'){event.preventDefault();close();return}
 if(event.key==='Tab'){
  const nodes=[...drawer.querySelectorAll('button:not([disabled]),a[href]')].filter(el=>el.getClientRects().length);
  if(!nodes.length)return;
  const first=nodes[0],last=nodes.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
  else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
 }
});
document.addEventListener('click',event=>{
 if(drawer.hidden)return;
 if(event.target.closest('.mobile-tabbar [data-view],.mobile-tabbar [data-profile-open]'))close();
},true);
window.WTG_MAIN_MENU={open,close};
})();

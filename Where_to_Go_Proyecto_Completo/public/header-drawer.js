/* Branded mobile drawer. Keep existing app navigation, profile and login intact. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const drawer=$('wtg-main-drawer'),shade=$('wtg-main-drawer-backdrop'),menuButton=$('wtg-mobile-menu-trigger');
if(!drawer||!shade||!menuButton)return;
let previousFocus=null;
function open(){
 if(!drawer.hidden)return;
 previousFocus=document.activeElement;
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

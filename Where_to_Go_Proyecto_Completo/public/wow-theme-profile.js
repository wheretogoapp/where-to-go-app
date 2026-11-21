/* Isolated UI preference. Does not read or alter Google Places, GPS or Supabase. */
(()=>{'use strict';
const KEY='wtg-appearance-v1';
const valid=new Set(['system','light','dark']);
let chosen='system';
try{const stored=localStorage.getItem(KEY);if(valid.has(stored))chosen=stored}catch{}
const query=window.matchMedia?.('(prefers-color-scheme: dark)');
function resolved(){return chosen==='system'?(query?.matches?'dark':'light'):chosen}
function apply(){
 const mode=resolved();
 document.documentElement.dataset.wtgAppearance=mode;
 document.documentElement.dataset.wtgAppearancePreference=chosen;
 document.querySelectorAll('[data-wtg-theme]').forEach(button=>{
  const active=button.dataset.wtgTheme===chosen;
  button.setAttribute('aria-pressed',String(active));
  button.classList.toggle('is-active',active);
 });
 const color=document.querySelector('meta[name="theme-color"]');
 if(color)color.setAttribute('content',mode==='dark'?'#05162b':'#041b40');
}
function choose(next){
 if(!valid.has(next))return;
 chosen=next;
 try{localStorage.setItem(KEY,next)}catch{}
 apply();
}
document.addEventListener('click',e=>{
 const button=e.target.closest?.('[data-wtg-theme]');
 if(button)choose(button.dataset.wtgTheme);
});
if(query){
 if(query.addEventListener)query.addEventListener('change',()=>{if(chosen==='system')apply()});
 else if(query.addListener)query.addListener(()=>{if(chosen==='system')apply()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();

/* Global discovery selector. No fabricated listings or iconic photos. */
(function(){
'use strict';
const popular=['DO','US','CO','ES','MX','BR','AR','CL','PE','CA','FR','GB','IT','DE','PT','JP','KR','IN','AU','NZ','ZA','MA','EG','AE','TR','TH','MY','ID','PH','CR','PA','JM','CU','HT','PR'];
function init(){
 const world=window.WTG_WORLD;if(!world)return;
 const button=document.getElementById('wtg-world-open'),dialog=document.getElementById('wtg-world-dialog');
 const country=document.getElementById('wtg-world-country'),city=document.getElementById('wtg-world-city');
 const status=document.getElementById('wtg-world-status'),apply=document.getElementById('wtg-world-apply');
 if(!button||!dialog||!country||!city||!status||!apply)return;
 const lang=()=>document.documentElement.lang||navigator.language||'es';
 const names=()=>new Intl.DisplayNames([lang()],{type:'region'});
 const countries=popular.map(code=>({code,name:names().of(code)})).sort((a,b)=>a.name.localeCompare(b.name,lang()));
 country.replaceChildren(...countries.map(({code,name})=>new Option(name,code)));
 country.value='DO';
 function update(){
   const code=country.value;
   const available=world.dataStatus({country:code})==='catalogue-available';
   status.textContent=available
    ?'República Dominicana: catálogo piloto disponible. Selecciona una provincia o municipio en la aplicación.'
    :'Exploración internacional en preparación. Aún no hay fichas ni portadas fotográficas verificadas para este país; no mostraremos fotos de otra ciudad.';
   apply.textContent=available?'Explorar República Dominicana':'Guardar destino internacional';
 }
 button.addEventListener('click',()=>{dialog.hidden=false;update();country.focus()});
 document.getElementById('wtg-world-close').addEventListener('click',()=>dialog.hidden=true);
 country.addEventListener('change',update);
 apply.addEventListener('click',()=>{
   const selection=world.location({country:country.value,city:city.value,language:lang(),source:'manual'});
   try{sessionStorage.setItem('wtg_world_selection',JSON.stringify(selection))}catch{}
   dialog.hidden=true;
   if(selection.country==='DO'){
     document.getElementById('location-pill')?.click();
   }else{
     const label=names().of(selection.country)+(selection.city?' · '+selection.city:'');
     button.textContent='🌍 '+label;
     document.getElementById('wtg-world-notice').textContent='Destino seleccionado: '+label+'. Los resultados internacionales todavía no están conectados; los lugares mostrados en el piloto siguen siendo de República Dominicana.';
     document.getElementById('wtg-world-notice').hidden=false;
   }
 });
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.hidden=true});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')dialog.hidden=true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

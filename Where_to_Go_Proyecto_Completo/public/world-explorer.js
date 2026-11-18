/* Global discovery selector. No fabricated listings or iconic photos. */
(function(){
'use strict';
const popular='AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW'.split(' ');
function init(){
 const world=window.WTG_WORLD;if(!world)return;
 const button=document.getElementById('wtg-world-open'),dialog=document.getElementById('wtg-world-dialog');
 const country=document.getElementById('wtg-world-country'),city=document.getElementById('wtg-world-city');
 const status=document.getElementById('wtg-world-status'),apply=document.getElementById('wtg-world-apply');
 if(!button||!dialog||!country||!city||!status||!apply)return;
 const lang=()=>document.documentElement.lang||navigator.language||'es';
 const names=()=>new Intl.DisplayNames([lang()],{type:'region'});
 const countries=popular.map(code=>({code,name:names().of(code)})).sort((a,b)=>a.name.localeCompare(b.name,lang()));
 const notice=document.getElementById('wtg-world-notice'),main=document.getElementById('main-content'),empty=document.getElementById('wtg-world-empty');
 function setPilotVisible(show){if(main)main.hidden=!show;if(empty)empty.hidden=show;if(notice)notice.hidden=show;}
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
     setPilotVisible(true);button.textContent='🌍 Explorar el mundo';
     document.getElementById('location-pill')?.click();
   }else{
     const label=names().of(selection.country)+(selection.city?' · '+selection.city:'');
     button.textContent='🌍 '+label;
     setPilotVisible(false);
     if(notice){notice.textContent='Destino seleccionado: '+label+'. Catálogo internacional pendiente de conexión; no se mostrarán lugares de República Dominicana como si fueran locales.';notice.hidden=false;}
     const selected=document.getElementById('wtg-world-selected');if(selected)selected.textContent=label;
   }
 });
 document.getElementById('wtg-world-change')?.addEventListener('click',()=>button.click());
 dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.hidden=true});
 document.addEventListener('keydown',e=>{if(e.key==='Escape')dialog.hidden=true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

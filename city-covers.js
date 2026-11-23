/* City-cover registry: show only reviewed images of the selected city.
 * This module never guesses a photo from country or GPS.
 * Entries must contain source, author, license and exact city/country.
 */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.WTG_CITY_COVERS=api;
})(typeof window!=='undefined'?window:null,function(){
 const entries=new Map();
 const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
 const key=(country,city)=>String(country||'').toUpperCase()+'|'+norm(city);
 function register(photo){
   if(!photo||!(/^[A-Z]{2}$/.test(photo.country))||!photo.city||!photo.landmark||!photo.url||!photo.source||!photo.author||!photo.license)return false;
   for(const field of ['url','source']){try{if(new URL(photo[field]).protocol!=='https:')return false}catch{return false}}
   entries.set(key(photo.country,photo.city),Object.freeze({...photo}));return true;
 }
 function find(country,city){return entries.get(key(country,city))||null}
 return Object.freeze({register,find,count:()=>entries.size});
});

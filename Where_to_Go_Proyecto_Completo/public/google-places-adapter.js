/* Google Places (New) browser adapter. Public browser key only: restrict by website and API.
 * No secret key, no service-account credentials. Nothing is fetched until configured.
 */
(function(root){
'use strict';
const categories={
 restaurantes:['restaurant'],cafes:['cafe'],bares:['bar'],hoteles:['lodging'],
 atracciones:['tourist_attraction','museum'],parques:['park'],supermercados:['supermarket'],
 farmacias:['pharmacy'],bancos:['bank'],gasolineras:['gas_station'],
 entretenimiento:['amusement_park','movie_theater'],taxis:['taxi_stand']
};
let promise=null;
function configured(){return typeof root.WTG_GOOGLE_MAPS_KEY==='string'&&root.WTG_GOOGLE_MAPS_KEY.trim().length>15}
function load(){
 if(!configured())return Promise.resolve(false);
 if(root.google?.maps?.importLibrary)return Promise.resolve(true);
 if(promise)return promise;
 promise=new Promise(resolve=>{
  const script=document.createElement('script');
  script.src='https://maps.googleapis.com/maps/api/js?key='+encodeURIComponent(root.WTG_GOOGLE_MAPS_KEY)+'&v=weekly&loading=async';
  script.async=true;script.referrerPolicy='strict-origin-when-cross-origin';
  script.onload=()=>resolve(!!root.google?.maps?.importLibrary);
  script.onerror=()=>resolve(false);
  document.head.append(script);
 });
 return promise;
}
async function nearby({lat,lon,radius=12000,category='todos'}){
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw Error('Coordenadas inválidas');
 if(!await load())return {status:'unconfigured',places:[]};
 try{
  const {Place}=await root.google.maps.importLibrary('places');
  const types=categories[category]||['tourist_attraction','restaurant','cafe','lodging','museum','park'];
  const results=await Promise.allSettled(types.slice(0,4).map(async type=>{
   const response=await Place.searchNearby({fields:['id','displayName','location','formattedAddress','types','googleMapsURI','nationalPhoneNumber','rating','photos'],locationRestriction:{center:{lat,lng:lon},radius:Math.min(50000,Math.max(100,radius))},includedPrimaryTypes:[type],maxResultCount:20,rankPreference:'DISTANCE'});
   return response.places||[];
  }));
  const map=new Map();let failures=0;
  for(const result of results){
   if(result.status!=='fulfilled'){failures++;continue}
   for(const p of result.value){
    if(!p.id||!p.location||!p.displayName)continue;
    map.set(p.id,{id:'google:'+p.id,googlePlaceId:p.id,name:p.displayName,lat:p.location.lat(),lon:p.location.lng(),address:p.formattedAddress||'',phone:p.nationalPhoneNumber||'',mapUrl:p.googleMapsURI||'',types:p.types||[],rating:p.rating??null,source:'google'});
   }
  }
  return {status:map.size?'ok':failures===results.length?'error':'empty',places:[...map.values()],failures};
 }catch(error){return {status:'error',places:[],message:String(error?.message||'Places no disponible')}}
}
root.WTG_GOOGLE_PLACES=Object.freeze({configured,nearby});
})(window);

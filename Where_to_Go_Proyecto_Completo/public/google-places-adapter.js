/* Google Places (New) browser adapter. Public browser key only: restrict by website and API.
 * No secret key, no service-account credentials. Nothing is fetched until configured.
 */
(function(root){
'use strict';
const categories={
 restaurantes:['restaurant'],cafes:['cafe'],bares:['bar'],hoteles:['hotel'],
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
  // Consultas limitadas: no descargar catálogos masivos ni multiplicar llamadas pagadas.
  const types=category==='todos'?['tourist_attraction','restaurant','hotel']:(categories[category]||[]);
  if(!types.length)return {status:'unsupported',places:[]};
  const results=await Promise.allSettled(types.slice(0,3).map(async type=>{
   const response=await Place.searchNearby({fields:['id','displayName','location','formattedAddress','types','googleMapsURI','photos'],locationRestriction:{center:{lat,lng:lon},radius:Math.min(50000,Math.max(100,radius))},includedPrimaryTypes:[type],maxResultCount:20,rankPreference:'DISTANCE'});
   return response.places||[];
  }));
  const map=new Map();let failures=0;
  for(const result of results){
   if(result.status!=='fulfilled'){failures++;continue}
   for(const p of result.value){
    if(!p.id||!p.location||!p.displayName)continue;
    const firstPhoto=Array.isArray(p.photos)?p.photos[0]:null;
    let photo='';
    try{if(typeof firstPhoto?.getURI==='function')photo=firstPhoto.getURI({maxWidth:720})||'';}catch{}
    const photoAttributions=Array.isArray(firstPhoto?.authorAttributions)?firstPhoto.authorAttributions.map(a=>({displayName:a.displayName||'',uri:a.uri||''})).filter(a=>a.displayName):[];
    map.set(p.id,{
      id:'google:'+p.id,googlePlaceId:p.id,name:p.displayName,
      lat:p.location.lat(),lon:p.location.lng(),address:p.formattedAddress||'',
      mapUrl:p.googleMapsURI||'',types:p.types||[],photo,photoAttributions,source:'google'
    });
   }
  }
  return {status:map.size?'ok':failures===results.length?'error':'empty',places:[...map.values()],failures};
 }catch(error){return {status:'error',places:[],message:String(error?.message||'Places no disponible')}}
}
// Coincidencia conservadora para evitar fotos de negocios distintos.
// La búsqueda específica se ejecuta únicamente cuando el visitante la solicita.
function normalizedName(value){
 return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
}
function sameEstablishment(a,b){
 const left=normalizedName(a),right=normalizedName(b);
 if(!left||!right)return false;
 if(left===right)return true;
 const short=left.length<right.length?left:right;
 const long=left.length>=right.length?left:right;
 // "Kabuki" y "Kabuki Sushi": solo si el nombre abre con una palabra entera.
 // La distancia geográfica se comprueba adicionalmente por separado.
 return short.length>=5&&long.startsWith(short+' ')&&short.length/long.length>=0.33;
}
function meters(a,b,c,d){
 const x=(c-a)*111195, y=(d-b)*111195*Math.cos((a+c)*Math.PI/360);
 return Math.hypot(x,y);
}
async function matchPhoto({name,lat,lon}){
 if(!configured()||!name||!Number.isFinite(lat)||!Number.isFinite(lon))return {status:'unconfigured'};
 if(!await load())return {status:'unconfigured'};
 try{
  const {Place}=await root.google.maps.importLibrary('places');
  if(typeof Place.searchByText!=='function')return {status:'unavailable'};
  const result=await Place.searchByText({
   textQuery:String(name).slice(0,110),
   fields:['id','displayName','location','photos','googleMapsURI'],
   locationBias:{center:{lat,lng:lon},radius:500},
   maxResultCount:5
  });
  const found=(result.places||[]).filter(p=>p?.location&&sameEstablishment(name,p.displayName))
    .map(p=>({place:p,distance:meters(lat,lon,p.location.lat(),p.location.lng())}))
    .filter(row=>row.distance<=160).sort((a,b)=>a.distance-b.distance);
  for(const row of found){
   const p=row.place, photo=p.photos?.[0];
   if(typeof photo?.getURI!=='function')continue;
   let url='';
   try{url=photo.getURI({maxWidth:720})||'';}catch{}
   if(!/^https:\/\//.test(url))continue;
   const authors=Array.isArray(photo.authorAttributions)?photo.authorAttributions.map(a=>({displayName:a.displayName||'',uri:a.uri||''})).filter(a=>a.displayName):[];
   return {status:'ok',id:p.id,photo:url,photoAttributions:authors,mapUrl:p.googleMapsURI||'',name:p.displayName,distanceMeters:row.distance};
  }
  return {status:'not-found'};
 }catch(e){return {status:'error',message:String(e?.message||'No fue posible consultar Google Places').slice(0,160)}}
}
root.WTG_GOOGLE_PLACES=Object.freeze({configured,nearby,matchPhoto,sameEstablishment,meters});
})(window);

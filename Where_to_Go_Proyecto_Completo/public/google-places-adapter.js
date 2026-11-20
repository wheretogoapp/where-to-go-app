/* Google Places (New) browser adapter. Public browser key only: restrict by website and API.
 * No secret key, no service-account credentials. Nothing is fetched until configured.
 */
(function(root){
'use strict';
// Tipos vigentes de Google Places (New): un conjunto corto por categoría
// evita búsquedas ajenas y permite consultar cada municipio bajo demanda.
const categories={
 restaurantes:['restaurant','fast_food_restaurant'],cafes:['cafe','coffee_shop'],
 bares:['bar','pub'],discotecas:['night_club'],hoteles:['hotel','hostel'],
 resorts:['resort_hotel'],villas:['lodging','cottage'],playas:['beach'],
 piscinas:['swimming_pool'],rios:['river'],cascadas:['scenic_spot'],
 senderismo:['hiking_area'],balnearios:['swimming_pool'],
 atracciones:['tourist_attraction','museum','historical_landmark'],
 parques:['park'],entretenimiento:['amusement_park','movie_theater','bowling_alley'],
 infantil:['indoor_playground','amusement_center'],
 supermercados:['supermarket','grocery_store','hypermarket'],
 colmados:['convenience_store','grocery_store'],mercados:['market','farmers_market'],
 tiendas:['shopping_mall','clothing_store','department_store'],
 ferreterias:['hardware_store'],electrodomesticos:['electronics_store'],
 tecnologia:['cell_phone_store','electronics_store'],
 barberias:['barber_shop'],salones:['beauty_salon','hair_salon'],
 unas:['nail_salon'],spas:['spa','massage'],gimnasios:['gym'],
 heladerias:['ice_cream_shop'],panaderias:['bakery'],
 pescaderias:['seafood_restaurant','fish_store'],comidarapida:['fast_food_restaurant'],
 farmacias:['pharmacy'],hospitales:['hospital','medical_clinic'],
 odontologia:['dentist'],veterinarias:['veterinary_care'],
 mascotas:['pet_store'],bancos:['bank'],cajeros:['atm'],
 gasolineras:['gas_station'],talleres:['car_repair'],
 lavaderos:['car_wash'],lavanderias:['laundry'],taxis:['taxi_stand'],
 servicios:['lawyer','accounting'],deportes:['gym','sports_complex']
};
const ALL_GROUPS={
 main:['restaurant','hotel','supermarket','pharmacy','barber_shop','beauty_salon','bar','cafe','tourist_attraction','night_club'],
 extra:['hair_salon','grocery_store','shopping_mall','convenience_store','fast_food_restaurant','gas_station','car_wash','gym','beach','bank']
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
// No se almacenan las fotos de Google. Las URLs se construyen para la sesión activa
// y solo se descargan en el navegador cuando se muestran al visitante.
function photoSet(place,max=5){
 const source=place?.googleMapsURI||'';
 if(!Array.isArray(place?.photos)||!source)return [];
 const images=[];
 for(const item of place.photos.slice(0,max)){
  if(typeof item?.getURI!=='function')continue;
  let url='';
  try{url=item.getURI({maxWidth:720})||''}catch{}
  if(!/^https:\/\//.test(url))continue;
  const authors=Array.isArray(item.authorAttributions)?item.authorAttributions.map(a=>({displayName:a.displayName||'',uri:a.uri||''})).filter(a=>a.displayName):[];
  images.push({url,source,attribution:authors.map(x=>x.displayName).join(', ')||'Google Maps',
    authorAttributions:authors,provider:'google'});
 }
 return images;
}
async function nearby({lat,lon,radius=12000,category='todos',batch='main'}){
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)throw Error('Coordenadas inválidas');
 if(!await load())return {status:'unconfigured',places:[]};
 try{
  const {Place}=await root.google.maps.importLibrary('places');
  // Consultas limitadas: no descargar catálogos masivos ni multiplicar llamadas pagadas.
  const types=category==='todos'?(ALL_GROUPS[batch]||ALL_GROUPS.main):(categories[category]||[]);
  if(!types.length)return {status:'unsupported',places:[]};
  const results=await Promise.allSettled(types.slice(0,10).map(async type=>{
   const response=await Place.searchNearby({fields:['id','displayName','location','formattedAddress','types','googleMapsURI','photos'],locationRestriction:{center:{lat,lng:lon},radius:Math.min(50000,Math.max(100,radius))},includedPrimaryTypes:[type],maxResultCount:20,rankPreference:'DISTANCE'});
   return response.places||[];
  }));
  const map=new Map();let failures=0;
  for(const result of results){
   if(result.status!=='fulfilled'){failures++;continue}
   for(const p of result.value){
    if(!p.id||!p.location||!p.displayName)continue;
    const photoGallery=photoSet(p);
    map.set(p.id,{
      id:'google:'+p.id,googlePlaceId:p.id,name:p.displayName,
      lat:p.location.lat(),lon:p.location.lng(),address:p.formattedAddress||'',
      mapUrl:p.googleMapsURI||'',types:p.types||[],photo:photoGallery[0]?.url||'',
      photos:photoGallery,photoAttributions:photoGallery[0]?.authorAttributions||[],source:'google'
    });
   }
  }
  return {status:map.size?'ok':failures===results.length?'error':'empty',places:[...map.values()],failures,requestedTypes:types.length};
 }catch(error){return {status:'error',places:[],message:String(error?.message||'Places no disponible')}}
}
// Coincidencia conservadora para evitar fotos de negocios distintos.
// La búsqueda específica se ejecuta únicamente cuando el visitante la solicita.
// Búsqueda de un nombre indicado por el visitante. No rastrea ni predescarga.
async function searchText({query,lat,lon,radius=12000}){
 if(!configured()||!String(query||'').trim()||!Number.isFinite(lat)||!Number.isFinite(lon))
   return {status:'unconfigured',places:[]};
 if(!await load())return {status:'unconfigured',places:[]};
 try{
  const {Place}=await root.google.maps.importLibrary('places');
  const response=await Place.searchByText({
    textQuery:String(query).trim().slice(0,110),
    fields:['id','displayName','location','formattedAddress','types','googleMapsURI','photos'],
    locationBias:{center:{lat,lng:lon},radius:Math.min(50000,Math.max(2000,radius))},
    maxResultCount:20
  });
  const matches=[];
  for(const p of response.places||[]){
    if(!p.id||!p.location||!p.displayName)continue;
    const photos=photoSet(p);
    if(!photos.length)continue;
    matches.push({id:'google:'+p.id,googlePlaceId:p.id,name:p.displayName,
      lat:p.location.lat(),lon:p.location.lng(),address:p.formattedAddress||'',
      mapUrl:p.googleMapsURI||'',types:p.types||[],photo:photos[0].url,
      photos,photoAttributions:photos[0].authorAttributions||[],source:'google'});
  }
  return {status:matches.length?'ok':'empty',places:matches};
 }catch(error){return {status:'error',places:[],message:String(error?.message||'Text Search no disponible')}}
}
function normalizedName(value){
 return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
  .toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
}
function sameEstablishment(a,b){return matchQuality(a,b)<99;}
// Tolerancia pequeña para errores como Wing/Wings o Mirian/Miriam.
function oneEditAway(a,b){
 if(Math.min(a.length,b.length)<9||Math.abs(a.length-b.length)>1)return false;
 let i=0,j=0,edits=0;
 while(i<a.length&&j<b.length){
  if(a[i]===b[j]){i++;j++;continue}
  if(++edits>1)return false;
  if(a.length>b.length)i++;
  else if(b.length>a.length)j++;
  else{i++;j++}
 }
 return edits+(a.length-i)+(b.length-j)<=1;
}
function matchQuality(a,b){
 const left=normalizedName(a),right=normalizedName(b);
 if(!left||!right)return 99;
 if(left===right)return 0;
 const short=left.length<right.length?left:right,long=left.length>=right.length?left:right;
 if(short.length>=5&&long.startsWith(short+' ')&&short.length/long.length>=0.33)return 1;
 return oneEditAway(left,right)?2:99;
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
  const found=(result.places||[]).filter(p=>p?.location)
    .map(p=>({place:p,quality:matchQuality(name,p.displayName),
      distance:meters(lat,lon,p.location.lat(),p.location.lng())}))
    .filter(row=>row.quality<99&&row.distance<=(row.quality===2?85:160))
    .sort((a,b)=>a.quality-b.quality||a.distance-b.distance);
  // Dos resultados igualmente plausibles en la misma ubicación: no asignar
  // una foto por azar a la ficha equivocada.
  if(found.length>1&&found[0].quality===found[1].quality&&
     Math.abs(found[0].distance-found[1].distance)<30)return {status:'ambiguous'};
  for(const row of found){
   const p=row.place,photos=photoSet(p);
   if(!photos.length)continue;
   return {status:'ok',id:p.id,photo:photos[0].url,photos,
      photoAttributions:photos[0].authorAttributions,
      mapUrl:p.googleMapsURI||'',name:p.displayName,distanceMeters:row.distance};
  }
  return {status:'not-found'};
 }catch(e){return {status:'error',message:String(e?.message||'No fue posible consultar Google Places').slice(0,160)}}
}
root.WTG_GOOGLE_PLACES=Object.freeze({configured,nearby,searchText,matchPhoto,sameEstablishment,matchQuality,meters});
})(window);

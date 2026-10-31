const QUERIES={
 todos:'restaurantes, hoteles y atracciones turísticas',taxis:'taxis y transporte privado',
 restaurantes:'restaurantes',bares:'bares y pubs',playas:'playas',piscinas:'piscinas y clubes de piscina',
 hoteles:'hoteles',resorts:'resorts turísticos',villas:'villas turísticas y alojamientos',
 discotecas:'discotecas',parques:'parques públicos',entretenimiento:'entretenimiento',cafes:'cafeterías',atracciones:'atracciones turísticas museos y monumentos'
};
function response(code,obj){return {statusCode:code,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify(obj)}}
exports.handler=async event=>{
 if(event.httpMethod!=='GET')return response(405,{error:'Método no admitido'});
 const key=process.env.GOOGLE_MAPS_API_KEY;
 if(!key)return response(503,{error:'Google Places no configurado. Usa OpenStreetMap hasta activar la API.'});
 const q=event.queryStringParameters||{},lat=Number(q.lat),lon=Number(q.lon),radius=Number(q.radius);
 if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180||!(radius>=500&&radius<=30000))return response(400,{error:'Coordenadas o distancia incorrectas'});
 const category=QUERIES[q.category]?q.category:'todos';
 const loc=String(q.city||'República Dominicana').slice(0,70).replace(/[<>]/g,'');
 const textQuery=`${String(q.search||'').slice(0,70).trim()||QUERIES[category]} cerca de ${loc}`;
 try{
  const r=await fetch('https://places.googleapis.com/v1/places:searchText',{method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':key,'X-Goog-FieldMask':'places.id,places.displayName,places.location,places.formattedAddress,places.photos,places.googleMapsLinks,places.googleMapsUri,places.types,places.primaryType'},body:JSON.stringify({textQuery,languageCode:'es',regionCode:'DO',pageSize:20,locationBias:{circle:{center:{latitude:lat,longitude:lon},radius}}})});
  const data=await r.json();if(!r.ok)return response(502,{error:data.error?.message||'Google Places no respondió'});
  const places=(data.places||[]).filter(p=>p.id&&p.location&&p.displayName?.text).map(p=>({
   id:p.id,name:p.displayName.text,lat:p.location.latitude,lon:p.location.longitude,
   address:p.formattedAddress||'',types:p.types||[],primaryType:p.primaryType||'',
   photoName:p.photos?.[0]?.name||'',photoAttributions:p.photos?.[0]?.authorAttributions||[],
   mapsUri:p.googleMapsLinks?.placeUri||p.googleMapsUri||'',directionsUri:p.googleMapsLinks?.directionsUri||''
  }));
  return response(200,{places,source:'Google Places (New)',category});
 }catch(e){return response(502,{error:'No se pudo conectar con Places API. Revisa cuota y facturación.'})}
};

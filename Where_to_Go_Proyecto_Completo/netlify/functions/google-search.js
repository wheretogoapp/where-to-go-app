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
  const data=await r.json();
  if(!r.ok){
   // Share only public diagnostic categories; never expose the API key or Google response headers.
   const googleError=data && typeof data==='object' ? (data.error||{}) : {};
   const details=Array.isArray(googleError.details)?googleError.details:[];
   const info=details.find(d=>d && typeof d==='object' && String(d['@type']||'').endsWith('google.rpc.ErrorInfo'))||{};
   const reason=typeof info.reason==='string'?info.reason:'UNSPECIFIED';
   const googleStatus=typeof googleError.status==='string'?googleError.status:'UNKNOWN';
   const googleHttpStatus=r.status;
   const hints={
    BILLING_DISABLED:'Confirma que la facturación está vinculada y ACTIVA en el proyecto dueño de esta clave.',
    SERVICE_DISABLED:'Places API (New) debe estar habilitada en el proyecto dueño de esta clave.',
    API_KEY_SERVICE_BLOCKED:'La restricción de la clave está bloqueando Places API (New).',
    API_KEY_INVALID:'La clave de Netlify es inválida o no coincide con la de Google Cloud.',
    API_KEY_IP_ADDRESS_BLOCKED:'La restricción por IP bloquea a Netlify.',
    API_KEY_HTTP_REFERRER_BLOCKED:'La restricción por sitio web no es compatible con esta consulta del servidor.',
    USER_PROJECT_DENIED:'El proyecto no está autorizado para consumir este servicio.',
    CONSUMER_SUSPENDED:'Comprueba la situación del proyecto o de la cuenta de Google Cloud.',
    RESOURCE_QUOTA_EXCEEDED:'Consulta las cuotas y límites de Google Places.'
   };
   console.error('Where to Go | Google Places rechazó búsqueda',JSON.stringify({googleHttpStatus,googleStatus,reason}));
   return response(502,{
    error:'Google Places rechazó la consulta',
    googleHttpStatus,googleStatus,googleReason:reason,
    googleMessage:String(googleError.message||'').slice(0,240),
    recommendation:hints[reason]||'Revisar el estado de Google Cloud y la clave de API; consultar los logs si persiste.'
   });
  }
  const places=(data.places||[]).filter(p=>p.id&&p.location&&p.displayName?.text).map(p=>({
   id:p.id,name:p.displayName.text,lat:p.location.latitude,lon:p.location.longitude,
   address:p.formattedAddress||'',types:p.types||[],primaryType:p.primaryType||'',
   photoName:p.photos?.[0]?.name||'',photoAttributions:p.photos?.[0]?.authorAttributions||[],
   mapsUri:p.googleMapsLinks?.placeUri||p.googleMapsUri||'',directionsUri:p.googleMapsLinks?.directionsUri||''
  }));
  return response(200,{places,source:'Google Places (New)',category});
 }catch(e){return response(502,{error:'No se pudo conectar con Places API. Revisa cuota y facturación.'})}
};

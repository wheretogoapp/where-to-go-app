function json(code,obj){return {statusCode:code,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify(obj)}}
exports.handler=async event=>{
 const key=process.env.GOOGLE_MAPS_API_KEY,id=String(event.queryStringParameters?.id||'');
 if(!key)return json(503,{error:'API no configurada'});
 if(!/^[A-Za-z0-9_-]{10,260}$/.test(id))return json(400,{error:'Identificador inválido'});
 try{
  const r=await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=es`,{headers:{'X-Goog-Api-Key':key,'X-Goog-FieldMask':'id,nationalPhoneNumber,internationalPhoneNumber,websiteUri,googleMapsLinks,photos'}});
  const p=await r.json();if(!r.ok)return json(502,{error:p.error?.message||'No se pudo consultar el lugar'});
  return json(200,{id:p.id,phone:p.nationalPhoneNumber||p.internationalPhoneNumber||'',website:p.websiteUri||'',mapsUri:p.googleMapsLinks?.placeUri||'',directionsUri:p.googleMapsLinks?.directionsUri||'',photoName:p.photos?.[0]?.name||'',photoAttributions:p.photos?.[0]?.authorAttributions||[]});
 }catch{return json(502,{error:'Datos adicionales temporalmente no disponibles'})}
};

// Proxy a live image of the exact Google Place. No cache, no hardcoded/sample imagery.
exports.handler=async event=>{
 const key=process.env.GOOGLE_MAPS_API_KEY,name=String(event.queryStringParameters?.name||'');
 if(!key)return {statusCode:503,body:'Proveedor no configurado'};
 if(!/^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/.test(name))return {statusCode:400,body:'Nombre de imagen inválido'};
 try{
  const r=await fetch(`https://places.googleapis.com/v1/${name}/media?maxWidthPx=800&skipHttpRedirect=true`,{headers:{'X-Goog-Api-Key':key}});
  if(!r.ok)return {statusCode:502,body:'Imagen no disponible'};
  const data=await r.json();if(!data.photoUri||!/^https:\/\//.test(data.photoUri))return {statusCode:404,body:'Foto ausente'};
  // Redirect to the temporary photo URL obtained directly from Google. Do not cache or store it.
  return {statusCode:302,headers:{Location:data.photoUri,'Cache-Control':'no-store'},body:''};
 }catch{return {statusCode:502,body:'Error obteniendo foto'};}
};

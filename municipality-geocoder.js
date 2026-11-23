/* Where to Go — verified on-demand municipality coordinate resolver.
   Never assigns a different province's coordinates by approximate name.
   Bundled reference cities are immediate; other municipal centers are
   geocoded ONLY after selection and cached on device for subsequent visits.
   A public geocoder is NOT a bulk or production geodata API. */
(function(root,factory){
 const api=factory(root||{});
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.WTG_MUNICIPAL_GEOCODER=api;
})(typeof window!=='undefined'?window:null,function(root){
 'use strict';
 const KEY='wtg_verified_municipal_centers_v1',TTL=180*86400000;
 const norm=s=>String(s||'').toLocaleLowerCase('es').normalize('NFD')
   .replace(/[\u0300-\u036f]/g,'').replace(/^(provincia de |provincia |province of )/,'')
   .replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
 const valid=(lat,lon)=>Number.isFinite(lat)&&Number.isFinite(lon)&&lat>=17.4&&lat<=20.3&&lon>=-72.1&&lon<=-68.1;
 const read=()=>{try{return JSON.parse(root.localStorage?.getItem(KEY)||'{}')||{}}catch{return{}}};
 const save=(key,point)=>{
   try{const data=read();data[key]={...point,at:Date.now()};
     const ordered=Object.entries(data).sort((a,b)=>(b[1].at||0)-(a[1].at||0)).slice(0,220);
     root.localStorage?.setItem(KEY,JSON.stringify(Object.fromEntries(ordered)));
   }catch{}
 };
 const remember=(province,city,lat,lon)=>{
   if(!valid(lat,lon))return false;
   save(norm(province)+'|'+norm(city),{lat,lon,source:'verified-geocoder'});
   return true;
 };
 async function locate({city,province}){
  if(!city||!province)throw Error('Selecciona provincia y municipio.');
  const key=norm(province)+'|'+norm(city);
  const cached=read()[key];
  if(cached&&Date.now()-cached.at<TTL&&valid(cached.lat,cached.lon))return {lat:cached.lat,lon:cached.lon,source:cached.source||'cached'};
  const places=root.WTG_GEOGRAPHY?.cities?.('DO')||[];
  const known=places.find(p=>norm(p.city)===norm(city)&&norm(p.region)===norm(province)&&valid(p.lat,p.lon));
  if(known){save(key,{lat:known.lat,lon:known.lon,source:'reference'});return {lat:known.lat,lon:known.lon,source:'reference'};}
  // Nominatim usage: max two sequential requests per deliberate selection.
  const attempts=[city+', '+province+', República Dominicana',
    city+', Dominican Republic'];
  for(let attempt=0;attempt<attempts.length;attempt++){
    if(attempt)await new Promise(done=>setTimeout(done,1150));
    const abort=new AbortController();const timer=setTimeout(()=>abort.abort(),11000);
    try{
      const url='https://nominatim.openstreetmap.org/search?format=json&limit=7&addressdetails=1&countrycodes=do&q='+encodeURIComponent(attempts[attempt]);
      const response=await fetch(url,{signal:abort.signal,headers:{'Accept-Language':'es'}});
      if(!response.ok)throw Error('Servicio geográfico no disponible');
      const rows=await response.json();
      const match=(Array.isArray(rows)?rows:[]).find(row=>{
        const lat=Number(row.lat),lon=Number(row.lon);
        if(!valid(lat,lon))return false;
        const name=norm(row.display_name),address=row.address||{};
        const provinceMatch=[row.display_name,address.state,address.province,address.county,address.region]
          .some(part=>norm(part).includes(norm(province)));
        const cityMatch=[address.city,address.town,address.village,address.municipality,address.county,row.display_name]
          .some(part=>norm(part).includes(norm(city)));
        return provinceMatch&&cityMatch&&name.includes(norm('República Dominicana'))||provinceMatch&&cityMatch&&String(address.country_code||'do').toLowerCase()==='do';
      });
      if(match){
        const point={lat:Number(match.lat),lon:Number(match.lon),source:'nominatim'};
        save(key,point);
        return point;
      }
    }catch(error){
      if(attempt===attempts.length-1)throw Error('No fue posible ubicar este municipio con coordenadas verificadas. Prueba de nuevo o utiliza el GPS.');
    }finally{clearTimeout(timer);}
  }
  throw Error('No encontramos el centro exacto de este municipio en su provincia. No usaremos coordenadas de otro lugar.');
 }
 return Object.freeze({locate,remember});
});
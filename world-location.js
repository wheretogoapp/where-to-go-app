/* Where to Go: international location model (no API key required).
 * Country is explicit ISO 3166-1 alpha-2; coordinates never imply a country
 * unless a trusted geocoder resolves them. RD remains the verified pilot.
 */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.WTG_WORLD=api;
})(typeof window!=='undefined'?window:null,function(){
  const PILOT='DO';
  function countryCode(value){
    const code=String(value||'').trim().toUpperCase();
    return /^[A-Z]{2}$/.test(code)?code:null;
  }
  function coordinates(lat,lon){
    const a=Number(lat),b=Number(lon);
    if(lat===null||lon===null||lat===''||lon===''||!Number.isFinite(a)||!Number.isFinite(b)||Math.abs(a)>90||Math.abs(b)>180)return null;
    return {lat:a,lon:b};
  }
  function locale(value){
    const v=String(value||'es').replace(/_/g,'-');
    try{return Intl.getCanonicalLocales(v)[0]||'es'}catch{return 'es'}
  }
  function location(input={}){
    const point=coordinates(input.lat,input.lon);
    return {
      country:countryCode(input.country),
      region:String(input.region||'').trim().slice(0,120),
      city:String(input.city||'').trim().slice(0,120),
      coordinates:point,
      language:locale(input.language),
      source:['gps','manual','geocoder'].includes(input.source)?input.source:'manual'
    };
  }
  function dataStatus(place,availableCountries=[PILOT]){
    const code=countryCode(place&&place.country);
    if(!code)return 'country-required';
    return availableCountries.includes(code)?'catalogue-available':'catalogue-not-yet-available';
  }
  function distanceKm(a,b){
    if(!a||!b)return null;
    const p=coordinates(a.lat,a.lon),q=coordinates(b.lat,b.lon);
    if(!p||!q)return null;
    const rad=Math.PI/180,dlat=(q.lat-p.lat)*rad,dlon=(q.lon-p.lon)*rad;
    const h=Math.sin(dlat/2)**2+Math.cos(p.lat*rad)*Math.cos(q.lat*rad)*Math.sin(dlon/2)**2;
    return 6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(Math.max(0,1-h)));
  }
  return Object.freeze({PILOT,countryCode,coordinates,locale,location,dataStatus,distanceKm});
});

// Only signals availability. The API key is never delivered to browsers.
exports.handler = async () => ({statusCode:200,headers:{'Content-Type':'application/json','Cache-Control':'no-store'},body:JSON.stringify({googlePlacesEnabled:Boolean(process.env.GOOGLE_MAPS_API_KEY)})});

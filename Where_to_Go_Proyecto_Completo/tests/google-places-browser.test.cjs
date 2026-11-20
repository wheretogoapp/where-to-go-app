const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.join(__dirname, '..', 'public');
const adapter = fs.readFileSync(path.join(root, 'google-places-adapter.js'), 'utf8');

function configuredBrowser(googleKey = 'AIzaTestKeyForBrowserOnly1234567890') {
  const queries = [];
  const place = {
    id: 'ChIJtest1234567',
    displayName: 'Restaurante Ejemplo',
    formattedAddress: 'Puerto Plata, República Dominicana',
    location: {lat: () => 19.79, lng: () => -70.69},
    types: ['restaurant'],
    googleMapsURI: 'https://maps.google.com/?q=test',
    photos: [{
      getURI: ({maxWidth}) => {
        assert.equal(maxWidth, 720);
        return 'https://example.com/google-photo.jpg';
      },
      authorAttributions: [{displayName: 'Fotógrafo del lugar', uri: 'https://maps.google.com/author'}]
    }]
  };
  const window = {
    WTG_GOOGLE_MAPS_KEY: googleKey,
    google: {maps: {importLibrary: async name => {
      assert.equal(name, 'places');
      return {Place: {searchNearby: async options => {
        queries.push(options);
        return {places: [place]};
      }}};
    }}}
  };
  vm.runInNewContext(adapter, {window, console});
  return {api: window.WTG_GOOGLE_PLACES, queries};
}

test('Google devuelve fotografía y atribución del lugar exacto', async () => {
  const {api, queries} = configuredBrowser();
  assert.equal(api.configured(), true);
  const result = await api.nearby({lat: 19.7934, lon: -70.6884, radius: 12000, category: 'restaurantes'});
  assert.equal(result.status, 'ok');
  assert.equal(result.places.length, 1);
  assert.equal(result.places[0].photo, 'https://example.com/google-photo.jpg');
  assert.equal(result.places[0].photoAttributions[0].displayName, 'Fotógrafo del lugar');
  assert.equal(result.places[0].googlePlaceId, 'ChIJtest1234567');
  assert.equal(queries.length, 1);
  assert.equal(queries[0].includedPrimaryTypes[0], 'restaurant');
});

test('Exploración general amplía hasta seis grupos de lugares de Places', async () => {
  const {api, queries} = configuredBrowser();
  const result = await api.nearby({lat: 19.7934, lon: -70.6884, category: 'todos'});
  assert.equal(queries.length, 6);
  assert.equal(result.places.length, 1);
  assert.ok(queries.every(x => x.maxResultCount <= 20));
});

test('Categorías de playa se consultan como lugares reales', async () => {
  const {api, queries} = configuredBrowser();
  const result = await api.nearby({lat: 19.7934, lon: -70.6884, category: 'playas'});
  assert.equal(result.status, 'ok');
  assert.equal(queries.length, 1);
  assert.equal(queries[0].includedPrimaryTypes[0], 'beach');
});

test('Sin clave la API no inicia consultas', async () => {
  const {api, queries} = configuredBrowser('');
  assert.equal(api.configured(), false);
  const result = await api.nearby({lat: 19.7934, lon: -70.6884});
  assert.equal(result.status, 'unconfigured');
  assert.equal(queries.length, 0);
});

test('La app integra Google Places con la búsqueda dominicana', () => {
  const code = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
  assert.ok(code.includes('void enrichDominicanGooglePlaces(token,[...unique.values()])'));
  assert.ok(code.includes('const googleWithPhotos='));
  assert.ok(code.includes('photoAttributions:p.photoAttributions||[]'));
});


test('Nombres cercanos coinciden sin mezclar negocios distintos', () => {
  const {api}=configuredBrowser();
  assert.equal(api.sameEstablishment('Kabuki', 'Kabuki Sushi Bar'),true);
  assert.equal(api.sameEstablishment('El Kabuki', 'Kabuki Sushi Bar'),false);
  assert.equal(api.sameEstablishment('Kabuki', 'Kabuki Inn'),true);
  assert.equal(api.sameEstablishment('La Casa', 'Casa Phil'),false);
  assert(api.meters(19.79,-70.69,19.7901,-70.69)<20);
  assert(api.meters(19.79,-70.69,19.8,-70.69)>100);
});

test('Buscar foto puntual acepta solo el mismo nombre a menos de 160m', async () => {
  const calls=[];
  const fakePhotos = [{getURI:()=> 'https://example.com/correct-business.jpg',
    authorAttributions:[{displayName:'Dueño',uri:'https://maps.google.com/profile'}]}];
  const makePlace = (name,lat,lon) => ({id:name,displayName:name,location:{lat:()=>lat,lng:()=>lon},photos:fakePhotos,googleMapsURI:'https://maps.google.com/search'});
  const google = {maps:{importLibrary:async()=>({Place:{searchByText:async args=>{
    calls.push(args);
    return {places:[makePlace('Casa Phil',19.7934,-70.6884),makePlace('Kabuki Sushi Bar',19.7935,-70.6884),makePlace('Kabuki Inn',19.811,-70.6884)]};
  }}})}};
  const window={WTG_GOOGLE_MAPS_KEY:'AIzaTestKeyForBrowserOnly1234567890',google};
  vm.runInNewContext(adapter,{window,console});
  const match=await window.WTG_GOOGLE_PLACES.matchPhoto({name:'Kabuki',lat:19.7934,lon:-70.6884});
  assert.equal(match.status,'ok');
  assert.equal(match.name,'Kabuki Sushi Bar');
  assert.equal(match.photo,'https://example.com/correct-business.jpg');
  assert.equal(match.photoAttributions[0].displayName,'Dueño');
  assert.equal(calls.length,1,'Solo una llamada iniciada al solicitar foto');
  assert.equal(calls[0].maxResultCount,5);
});

test('Sin coincidencia exacta no se atribuye foto de negocio vecino', async () => {
  const google={maps:{importLibrary:async()=>({Place:{searchByText:async()=>({places:[
    {id:'wrong',displayName:'Casa Phil',location:{lat:()=>19.7934,lng:()=>-70.6884},photos:[{getURI:()=> 'https://example.com/wrong.jpg'}]}
  ]})}})}};
  const window={WTG_GOOGLE_MAPS_KEY:'AIzaTestKeyForBrowserOnly1234567890',google};
  vm.runInNewContext(adapter,{window,console});
  const result=await window.WTG_GOOGLE_PLACES.matchPhoto({name:'Kabuki',lat:19.7934,lon:-70.6884});
  assert.equal(result.status,'not-found');
});

test('Ficha local con foto Google exige atribución y búsqueda puntual manual', () => {
  const code=fs.readFileSync(path.join(root,'app.js'),'utf8');
  assert(code.includes('data-fetch-google-photo'));
  assert(code.includes('googlePhotoAttributions'));
  assert(code.includes('window.WTG_GOOGLE_PLACES.sameEstablishment'));
  assert(code.includes('window.WTG_GOOGLE_PLACES.meters'));
  assert(code.includes('Foto: <a href='));
});


test('Fotos progresivas de RD tienen límite de consultas y son efímeras',()=>{
  const code=fs.readFileSync(path.join(root,'app.js'),'utf8');
  assert(code.includes('wtgPhotoBudget=24'));
  assert(code.includes('void enrichVisiblePhotoCards(token,4)'));
  assert(code.includes('data-more-photo'));
  assert(code.includes('matchPhoto({name:p.name,lat:p.lat,lon:p.lon})'));
});

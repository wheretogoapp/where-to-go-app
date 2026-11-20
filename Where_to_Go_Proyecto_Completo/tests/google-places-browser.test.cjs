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

test('Exploración general limita a tres consultas de Places', async () => {
  const {api, queries} = configuredBrowser();
  const result = await api.nearby({lat: 19.7934, lon: -70.6884, category: 'todos'});
  assert.equal(queries.length, 3);
  assert.equal(result.places.length, 1);
  assert.ok(queries.every(x => x.maxResultCount <= 20));
});

test('Categorías sin equivalencia Google no generan solicitudes facturables', async () => {
  const {api, queries} = configuredBrowser();
  const result = await api.nearby({lat: 19.7934, lon: -70.6884, category: 'playas'});
  assert.equal(result.status, 'unsupported');
  assert.equal(queries.length, 0);
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

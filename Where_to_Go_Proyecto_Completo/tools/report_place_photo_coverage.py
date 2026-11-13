#!/usr/bin/env python3
"""Auditable place-specific photo count for Where to Go RD.

Counts unique licensed source files used by named place cards. Does NOT count
generic 500-photo geotagged atlas, regional backgrounds or user-submitted
unapproved images.
"""
import collections,datetime,json,pathlib,urllib.parse
ROOT=pathlib.Path(__file__).resolve().parents[1]
DATA=ROOT/'public'/'data'
MANIFEST=json.loads((DATA/'places'/'manifest.json').read_text(encoding='utf-8'))
PILOT=json.loads((DATA/'pilot-places.json').read_text(encoding='utf-8'))
GALLERIES=json.loads((DATA/'place-gallery.json').read_text(encoding='utf-8'))
def source_key(url):
    s=str(url or '')
    if not s.startswith('https://commons.wikimedia.org/wiki/File:'):return ''
    return urllib.parse.unquote(s.split('File:',1)[1]).replace('_',' ').strip().casefold()
sources=collections.defaultdict(set)
distinct_place_ids=set()
editorial={p['id']:p for p in PILOT}
catalogue={}
photogenic_osm_ids=set()
for file in sorted((DATA/'places').glob('cell_*.json')):
    for place in json.loads(file.read_text(encoding='utf-8')):
        catalogue[place['id']]={'name':place['name'],'cat':place['cat'],'lat':place['lat'],'lon':place['lon']}
        source=source_key(place.get('photoSource'))
        if source and place.get('photoAttribution'):
            sources[source].add(place['id'])
            photogenic_osm_ids.add(place['id'])
            distinct_place_ids.add(place['id'])
assert len(catalogue)==MANIFEST['recordCount'],(len(catalogue),MANIFEST['recordCount'])
assert len(photogenic_osm_ids)==MANIFEST['licensedPhotoCount'],(len(photogenic_osm_ids),MANIFEST['licensedPhotoCount'])
editorial_provinces=collections.Counter()
editorial_sources=0
for p in PILOT:
    source=source_key(p.get('photoSource'))
    if not source or not p.get('photoAttribution'):continue
    editorial_sources+=1
    editorial_provinces[p.get('province') or 'Sin provincia']+=1
    sources[source].add(p['id'])
    distinct_place_ids.add(p['id'])
gallery_sources=collections.Counter()
for pid,photos in GALLERIES.items():
    assert pid in editorial or pid in catalogue,pid
    if photos:distinct_place_ids.add(pid)
    for photo in photos:
        source=source_key(photo.get('source'))
        assert source,('Archivo sin fuente Commons',pid)
        assert photo.get('attribution') and photo.get('license'),pid
        sources[source].add(pid)
        gallery_sources[source]+=1
cross_duplicates=[{'source':k,'placeIds':sorted(ids)} for k,ids in sources.items() if len(ids)>1]
repeated_gallery=[k for k,n in gallery_sources.items() if n>1]
national_with_any={pid for pid in distinct_place_ids if pid in catalogue}
report={
  'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
  'cataloguePlaces':MANIFEST['recordCount'],
  'mainNationalVerifiedPhotos':len(photogenic_osm_ids),
  'editorialPhotoEntries':editorial_sources,
  'editorialRegionsWithPhotos':len(editorial_provinces),
  'editorialByProvince':dict(sorted(editorial_provinces.items())),
  'galleryPlaces':len(GALLERIES),
  'galleryPhotoEntries':sum(map(len,GALLERIES.values())),
  'galleryDistinctSourceFiles':len(gallery_sources),
  'uniquePlaceSpecificPhotoFilesAcrossApp':len(sources),
  'placeIdsWithAnyVerifiedPhoto':len(distinct_place_ids),
  'nationalCataloguePlaceIdsWithPhoto':len(national_with_any),
  'crossPlacePhotoReuse':cross_duplicates[:30],
  'repeatedPhotoFilesWithinGalleries':repeated_gallery[:30],
  'excludes':'Geotagged landscape atlas, provincial hero backgrounds and unapproved business submissions',
}
(DATA/'place-photo-coverage-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
provinces='; '.join(f'{p}: {n}' for p,n in sorted(editorial_provinces.items()))
content=f"""# Where to Go — Cobertura de fotos auténticas por lugar

**Actualizado:** {report['generatedAt']}

- Lugares registrados en el catálogo nacional: **{report['cataloguePlaces']:,}**
- Fotos principales acreditadas en el directorio nacional: **{report['mainNationalVerifiedPhotos']}**
- Destinos editoriales con fotos propias: **{report['editorialPhotoEntries']}**
- Fotos adicionales guardadas en galerías de lugares: **{report['galleryPhotoEntries']}**
- Lugares con galerías de varias imágenes: **{report['galleryPlaces']}**
- **Archivos fotográficos únicos acreditados y vinculados a lugares concretos (sin duplicados entre categorías): {report['uniquePlaceSpecificPhotoFilesAcrossApp']}**
- Fichas identificadas con al menos una foto acreditada: **{report['placeIdsWithAnyVerifiedPhoto']}**
- Fichas dentro del catálogo nacional con foto, incluida su galería: **{report['nationalCataloguePlaceIdsWithPhoto']}**
- Demarcaciones con fotos de destinos editoriales: **{report['editorialRegionsWithPhotos']}**
- Archivos compartidos entre varias fichas (posibles duplicados de una misma ubicación): **{len(cross_duplicates)}**

## Cobertura editorial por provincia

{provinces}

No se cuentan los 500 archivos de fotos geolocalizadas del entorno, portadas provinciales sin ficha concreta ni fotos de negocios sin derechos confirmados. Esta página es una auditoría interna, no aparece en el inicio turístico.
"""
(ROOT/'PHOTO_COVERAGE.md').write_text(content,encoding='utf-8')
print('FOTOS ÚNICAS DE LUGARES CONCRETOS:',report['uniquePlaceSpecificPhotoFilesAcrossApp'],flush=True)
print('FOTOS EN GALERÍAS:',report['galleryPhotoEntries'],'lugares con imágenes:',report['placeIdsWithAnyVerifiedPhoto'],flush=True)
print('DUPLICADOS A REVISAR:',len(cross_duplicates),flush=True)

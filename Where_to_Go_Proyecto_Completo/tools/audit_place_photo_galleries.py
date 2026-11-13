#!/usr/bin/env python3
"""Independent geographic/subject audit of Wikimedia place galleries.

A free image with a matching filename is NOT necessarily the location:
"Casa del Cordón" can be Burgos, "Casa de la Moneda" can be Potosí, etc.
Reject foreign places, paintings, wildlife and generic ambiguous subjects.
Only original curated sources are grandfathered in; every other accepted image
needs identifiable Dominican geographic context or a distinctive place name.
"""
import argparse,collections,datetime,json,re,unicodedata,urllib.parse
from pathlib import Path
FOREIGN=re.compile(r'\b(paris|madrid|burgos|potosi|atienza|calatayud|aragon|cartagena|murcia|fontibon|chitre|chile|colombia|panama|espana|spain|segovia|puerto rico|argentina|nicaragua|honduras|guatemala|barcelona|valencia|italia|peru|bolivia|brasil|gipuzkoa|mexico|costa rica|uruguay|germany|london)\b')
NOT_PLACE=re.compile(r'\b(ilustracion|dibujo|painting|oleo|reina|proclamacion|historia general|siglo xix|grabado|retrato|portada|pelicano|amazona ventralis|pinus occidentalis|bird|flora|fauna|independiente del valle|satelite|satellite|iss0|view of earth|bandera en la plaza|bandera en|fines del siglo|fontibon)\b')
LOCAL=re.compile(r'\b(santo domingo|ccsd|sd rd|dom santo|dominican republic|republica dominicana|dom rd|dominicano|dominicana|puerto plata|santiago de los caballeros|san pedro de macoris|la romana|higuey|samana|bani|constanza|jarabacoa|pedernales|san juan de la maguana|de la vega|peravia|sosua|cabarete|las terrenas|santiago rd|do museo)\b')
AMBIGUOUS=re.compile(r'\b(casa de la moneda|casa del cordon|museo de historia natural|catedral santa ana|catedral san juan bautista|plaza de espana|isabel la catolica|arco de triunfo|palacio consistorial|catedral la vega|catedral santiago apostol|catedral san pedro apostol|puerta de la misericordia|plaza de la bandera|monumento a los heroes)\b')
def norm(value):
    s=urllib.parse.unquote(str(value or ''))
    s=''.join(c for c in unicodedata.normalize('NFD',s.casefold()) if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+',' ',s).strip()
def accepted(pid,photo,places,trusted):
    source=photo.get('source') or ''
    if source in trusted:return True
    p=places.get(pid)
    if not p:return False
    name=norm(p.get('name'))
    title=norm(source.split('File:',1)[-1])
    if not name or not title or FOREIGN.search(title) or NOT_PLACE.search(title):return False
    if 'catedral la vega' in name and 'la vega vieja' in title:return False
    if 'isabel la catolica' in name and not re.search(r'\b(estatua|monumento|statue|santo domingo)\b',title):return False
    if 'valle nuevo' in name and '1895' in title:return False
    if LOCAL.search(title):return True
    if AMBIGUOUS.search(name):return False
    # Without a place-specific country/municipality in the filename, require a
    # strongly distinguishing name: >=2 substantive words, one visible in the
    # photo title (original matcher already checks all of them).
    salient=[t for t in name.split() if len(t)>=4]
    return len(name)>=9 and len(salient)>=2 and any(t in title for t in salient)
def audit(root):
    data=root/'data'
    gallery_path=data/'place-gallery.json'
    stats_path=data/'place-gallery-stats.json'
    photos=json.loads(gallery_path.read_text(encoding='utf-8'))
    curated=json.loads((data/'place-gallery-curated.json').read_text(encoding='utf-8'))
    curated_sources={x['source'] for photos in curated.values() for x in photos}
    places={p['id']:p for p in json.loads((data/'pilot-places.json').read_text(encoding='utf-8'))}
    # Newly approved geolocated OSM photo matches are also genuine catalogued
    # places. Do not delete them merely because they are not in the 116 pilot
    # entries: the geo matching importer verified name, coordinates and license.
    missing=set(photos)-set(places)
    if missing:
        for cellfile in sorted((data/'places').glob('cell_*.json')):
            for row in json.loads(cellfile.read_text(encoding='utf-8')):
                if row.get('id') in missing:
                    places[row['id']]=row
                    missing.discard(row['id'])
            if not missing:break
    kept={};rejected=[];cat=collections.Counter();province=collections.Counter()
    for pid,items in photos.items():
        passed=[]
        for photo in items:
            if accepted(pid,photo,places,curated_sources):
                passed.append(photo)
                if photo['source'] not in curated_sources:
                    p=places[pid]
                    cat[p.get('cat') or 'sin_categoria']+=1
                    province[p.get('province') or 'Sin provincia']+=1
            else:rejected.append((pid,photo.get('source','')))
        if passed:kept[pid]=passed
    assert all(len(x)<=18 for x in kept.values())
    total=sum(map(len,kept.values()))
    newly=total-len(curated_sources)
    assert newly==sum(cat.values()),(newly,sum(cat.values()))
    gallery_path.write_text(json.dumps(kept,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    stats=json.loads(stats_path.read_text(encoding='utf-8'))
    stats.update({'updatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
                  'galleryPlaceCount':len(kept),'galleryImageCount':total,
                  'newVerifiedGalleryPhotos':newly,'newPhotosByCategory':dict(sorted(cat.items())),
                  'newPhotosByProvince':dict(sorted(province.items())),
                  'imagesRejectedDuringPlaceAudit':len(rejected),
                  'geographicAudit':'Excluidas fotos de otros países, obras de arte, animales y nombres compartidos sin contexto geográfico verificable'})
    stats_path.write_text(json.dumps(stats,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('AUDITORÍA FOTOS:',newly,'adicionales aprobadas;',total,'en galería;',
          len(kept),'lugares;',len(rejected),'rechazadas')
    print('PROVINCIAS CON FOTOS VERIFICADAS:',dict(sorted(province.items())))
    return stats
if __name__=='__main__':
    ap=argparse.ArgumentParser()
    ap.add_argument('--public',default='Where_to_Go_Proyecto_Completo/public')
    args=ap.parse_args()
    audit(Path(args.public))

#!/usr/bin/env python3
"""Find additional REAL place photos through matching Wikidata labels AND coordinates.

Only accepts Commons P18 images for an exact-name Wikidata entity with coordinates
close to the mapped place; verifies free-license metadata before attaching.
Never guesses photo from a text search alone. Run AFTER enrich_photos.py.
"""
import argparse, collections, datetime, json, math, re, time, unicodedata, urllib.parse
from pathlib import Path
from enrich_photos import WIKIDATA, get_json, fetch_commons_metadata, valid_file

CATS={'atracciones','cascadas','playas','parques','hoteles','resorts','lagunas','rios','entretenimiento','balnearios'}
BAD_NAMES={'mirador','playa','parque','rio','río','hotel','cascada','iglesia','escuela','plaza','parque central','balneario'}
def norm(s):
    s=''.join(c for c in unicodedata.normalize('NFD',str(s).lower()) if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+',' ',s).strip()
def meters(a,b,c,d):
    p=math.pi/180;v=math.sin((c-a)*p/2)**2+math.cos(a*p)*math.cos(c*p)*math.sin((d-b)*p/2)**2
    return 6371000*2*math.atan2(math.sqrt(v),math.sqrt(max(0,1-v)))
def wikidata_entity(title,lat,lon):
    """Return Commons file only when the named Wikidata entity is geolocated here."""
    key=norm(title)
    if len(key)<7 or key in BAD_NAMES:return ''
    found=[]
    for lang in ('es','en'):
        q=urllib.parse.urlencode({'action':'wbsearchentities','search':title,'language':lang,'limit':6,'format':'json'})
        result=get_json(WIKIDATA+'?'+q)
        found.extend(x['id'] for x in (result.get('search') or []) if x.get('id') and norm(x.get('label'))==key)
        if found:break
    ids=list(dict.fromkeys(found))[:6]
    if not ids:return ''
    q=urllib.parse.urlencode({'action':'wbgetentities','ids':'|'.join(ids),'props':'claims|labels','languages':'es|en','format':'json'})
    data=get_json(WIKIDATA+'?'+q)
    for entity in (data.get('entities') or {}).values():
        claims=entity.get('claims') or {}
        coords=claims.get('P625') or []
        photos=claims.get('P18') or []
        if not coords or not photos:continue
        try:
            val=coords[0]['mainsnak']['datavalue']['value']
            lat2=float(val['latitude']);lon2=float(val['longitude'])
            img=photos[0]['mainsnak']['datavalue']['value']
            # 120m: same mapped attraction, not a nearby unrelated establishment.
            if meters(lat,lon,lat2,lon2)<=120 and valid_file(img):
                return img
        except (KeyError,TypeError,IndexError,ValueError):
            continue
    return ''
def run(out,max_queries):
    out=Path(out); manifest_path=out/'manifest.json'
    manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
    cells={p:json.loads(p.read_text(encoding='utf-8')) for p in sorted(out.glob('cell_*.json'))}
    rows=[r for cell in cells.values() for r in cell]
    if len(rows)!=manifest['recordCount']:raise RuntimeError('Conteo de catalogo inconsistente; cancelado')
    # Spread across geographic cells instead of using all the quota in a single city.
    grouped=collections.defaultdict(list)
    for p,cell in cells.items():
        for row in cell:
            name=str(row.get('name') or '')
            if (not row.get('photoSource') and row.get('nameKnown') is not False
                and row.get('cat') in CATS and len(norm(name))>=7 and norm(name) not in BAD_NAMES
                and row.get('id') and isinstance(row.get('lat'),(int,float))
                and isinstance(row.get('lon'),(int,float))):
                grouped[p].append(row)
    for cell in grouped.values():cell.sort(key=lambda x:(x['cat'] not in ('atracciones','cascadas','playas','parques'),x['name']))
    chosen=[]
    for depth in range(max((len(v) for v in grouped.values()),default=0)):
        for p in sorted(grouped):
            if depth<len(grouped[p]):chosen.append(grouped[p][depth])
            if len(chosen)>=max_queries:break
        if len(chosen)>=max_queries:break
    matches={};errors=0
    for row in chosen:
        try:
            filename=wikidata_entity(row['name'],row['lat'],row['lon'])
            if filename:matches[row['id']]=filename
        except Exception as exc:
            print('WIKIDATA WARNING',type(exc).__name__,str(exc)[:90]);errors+=1
            if errors>=5:break
        time.sleep(.16)
    metadata=fetch_commons_metadata(list(dict.fromkeys(matches.values())))
    updated=0
    for row in rows:
        filename=matches.get(row.get('id'),'')
        meta=metadata.get(filename.replace('_',' ').casefold())
        if meta and not row.get('photoSource'):
            row.update(meta);updated+=1
    if updated:
        for p,cell in cells.items():
            p.write_text(json.dumps(cell,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    verified=[r for r in rows if r.get('photoSource') and r.get('image')]
    manifest['licensedPhotoCount']=len(verified)
    manifest['photoCoverageByCategory']=dict(sorted(collections.Counter(r.get('cat') for r in verified).items()))
    manifest['geoPhotoEnrichment']={'runAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'candidatesQueried':len(chosen),'exactNameGeoMatches':len(matches),
        'newPhotosVerified':updated,'totalLicensedPhotos':len(verified),
        'rule':'Coincidencia de nombre exacto, distancia <=120 metros, P18 y licencia Commons confirmada'}
    manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print('FOTOS ADICIONALES CON GEOCOINCIDENCIA:',updated,'/ fotos verificadas totales:',len(verified))
if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--out',required=True)
    p.add_argument('--max-queries',type=int,default=120)
    a=p.parse_args()
    run(a.out,max(0,min(a.max_queries,500)))

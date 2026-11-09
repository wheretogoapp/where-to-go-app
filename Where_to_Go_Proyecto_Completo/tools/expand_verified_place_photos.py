#!/usr/bin/env python3
"""Expand authentic place-specific Commons galleries throughout Dominican Republic.

Only display a candidate when its *filename* clearly names the exact target
and Commons confirms free license and author. The 500 unassociated geophotos are
not used. Existing reviewed images are preserved. No business receives
geographically nearby photos of a different subject.
"""
import argparse
import collections
import datetime
import html
import json
import math
import re
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

API='https://commons.wikimedia.org/w/api.php'
AGENT='WhereToGoRDPlacePhotoMatcher/1.0 (contact: https://github.com/wheretogoapp/where-to-go-app)'
# Strong terms necessary to avoid matching generic words such as park, resort,
# hotel, Dominican Republic or Santo Domingo on an unrelated photograph.
GENERIC={'el','la','los','las','de','del','da','en','y','a','the','of','at','and','un',
         'una','san','santo','santa','republica','dominicana','dominican','republic',
         'playa','beach','rio','river','cascada','salto','parque','park','hotel','resort',
         'museo','museum','lago','laguna','iglesia','church','fortaleza','fort',
         'puerto','plata','santo','domingo','foto','view','vista','rd','dr'}
HIGH_RISK={'restaurantes','discotecas','bares','cafes','comidarapida','supermercados',
           'colmados','hoteles','resorts','villas','tiendas','salones','taxis',
           'gimnasios','lavaderos','hospitales'}
IMAGE_EXT=re.compile(r'\.(jpg|jpeg|png|webp)$',re.I)
BAD_PHOTO=re.compile(r'(^|[ _-])(satellite|iss0|iss_|earth from|nighttime lights|logo|signage|poster|flag|map of|coat of arms|portrait|painting|illustration|seal)([ _.-]|$)',re.I)
REQUESTS=0
RATE_LIMITS=0
def normalize(s):
    s=''.join(c for c in unicodedata.normalize('NFD',str(s or '').casefold()) if not unicodedata.combining(c))
    return re.sub(r'[^a-z0-9]+',' ',s).strip()
def clean(v):
    return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',str(v or '')))).strip()[:160]
def get_json(params):
    global REQUESTS, RATE_LIMITS
    url=API+'?'+urllib.parse.urlencode(params)
    req=urllib.request.Request(url,headers={'User-Agent':AGENT,'Accept':'application/json'})
    REQUESTS+=1
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req,timeout=24) as f:return json.load(f)
        except urllib.error.HTTPError as exc:
            if exc.code in (429,500,502,503,504):
                if exc.code==429:RATE_LIMITS+=1
                delay=min(45,3*(2**attempt))
                print('Commons HTTP',exc.code,'reposo',delay,'segundos',flush=True)
                time.sleep(delay)
                continue
            print('Commons HTTP',exc.code,'omitido',flush=True)
            return {}
        except (OSError,TimeoutError,ValueError) as exc:
            if attempt==3:
                print('Commons advertencia',type(exc).__name__,str(exc)[:75],flush=True)
                return {}
            time.sleep(2+attempt*2)
    return {}
def batch(seq,n):
    for i in range(0,len(seq),n):yield seq[i:i+n]
def commons_filename(url):
    if not url.startswith('https://commons.wikimedia.org/wiki/File:'):return ''
    return urllib.parse.unquote(url.split('/File:',1)[1].split('#',1)[0]).replace('_',' ')
def photo_licence(meta):
    val=clean((meta.get('LicenseShortName') or meta.get('UsageTerms') or {}).get('value',''))
    lic=val.lower().replace('-',' ')
    return bool(lic.startswith(('cc by','cc0','pd','public domain'))),val
def km(a,b,c,d):
    p=math.pi/180
    v=math.sin((c-a)*p/2)**2+math.cos(a*p)*math.cos(c*p)*math.sin((d-b)*p/2)**2
    return 12742*math.atan2(math.sqrt(v),math.sqrt(max(0,1-v)))
def geodist_placeholder_unavailable(coords,lat,lon):
    if not coords:return True
    try:return km(lat,lon,float(coords[0]['lat']),float(coords[0]['lon']))>1
    except (TypeError,ValueError,KeyError,IndexError):return True

def match_title(name,title,cat,lat,lon,coords,context):
    bare=title.removeprefix('File:').rsplit('.',1)[0]
    if BAD_PHOTO.search(bare):return False
    name_n=normalize(name)
    filename=normalize(bare)
    # Every meaningful landmark or business name token must be present.
    core=[x for x in name_n.split() if x not in GENERIC and len(x)>=3]
    if not core:return False
    # Require at least two meaningful words, or one rare distinctive word of
    # length >=8 (e.g. Damajagua) AND matching geolocation or locality.
    if not all(re.search(r'\b'+re.escape(tok)+r'\b',filename) for tok in set(core)):return False
    # Many beaches have one short distinctive word (Playa Macao, Playa Cosón).
    # Accept them ONLY if the photo title also carries Dominican locality
    # context, or an actual Commons GPS coordinate confirms the same place.
    single_short=len(set(core))==1 and len(core[0])<8
    local_photo=bool(re.search(r'\b(dominican|dominicana|dominicano|republica dominicana|dom|dr|rd|ccsd|santo domingo|puerto plata|santiago de los caballeros|samana|las terrenas|constanza|bani|sosua|cabarete|higuey|la romana|pedernales)\b',filename))
    if single_short:
        raw_place=[x for x in name_n.split() if x not in {'de','del','el','la','los','las','en','santo','san','santa'}]
        if len(raw_place)<2 or not all(t in file_tokens for t in raw_place):return False
        if not local_photo and geodist_placeholder_unavailable(coords,lat,lon):return False
    file_tokens=set(filename.split())
    locality=normalize(context)
    locality_tokens=[t for t in locality.split() if t not in GENERIC and len(t)>=5]
    in_locality=bool(locality_tokens and any(t in file_tokens for t in locality_tokens))
    geodist=999999
    if coords:
        try:geodist=km(lat,lon,float(coords[0]['lat']),float(coords[0]['lon']))
        except (TypeError,ValueError,KeyError,IndexError):pass
        if geodist>3:return False
    if cat in HIGH_RISK:
        # Business photo: exact name alone may belong to an identically named
        # establishment in another country. Enforce location corroboration.
        if geodist>.18 and not in_locality:return False
    elif len(set(core))==1 and geodist>1 and not in_locality:
        return False
    return True
def search_files(name,cat):
    # Search returns titles, NOT verified images. Verification occurs afterwards.
    params={'action':'query','list':'search','srsearch':'"'+name+'"',
            'srnamespace':6,'srlimit':40,'format':'json'}
    result=get_json(params)
    pages=(result.get('query') or {}).get('search') or []
    return [x['title'] for x in pages if IMAGE_EXT.search(x.get('title',''))][:30]
def image_metadata(titles):
    out={}
    for group in batch(list(dict.fromkeys(titles)),9):
        params={'action':'query','prop':'imageinfo|coordinates','colimit':9,
            'iiprop':'url|extmetadata','iiurlwidth':760,'titles':'|'.join(group),
            'format':'json','formatversion':'2'}
        d=get_json(params)
        pages=(d.get('query') or {}).get('pages') or []
        for page in pages:
            title=page.get('title','')
            info=(page.get('imageinfo') or [{}])[0]
            meta=info.get('extmetadata') or {}
            licensed,lic=photo_licence(meta)
            url=info.get('thumburl') or info.get('url') or ''
            if (not licensed or not IMAGE_EXT.search(title)
                or urllib.parse.urlparse(url).hostname not in ('upload.wikimedia.org','thumb.wikimedia.org')):
                continue
            artist=clean((meta.get('Artist') or meta.get('Credit') or {}).get('value','')) or 'Autor indicado en Wikimedia Commons'
            source='https://commons.wikimedia.org/wiki/'+urllib.parse.quote(title.replace(' ','_'),safe=':')
            lurl=html.unescape((meta.get('LicenseUrl') or {}).get('value','') or '')
            if not lurl.startswith('https://'):lurl=source
            out[title]={'url':url,'source':source,
                'attribution':f'{artist} · {lic} · Wikimedia Commons',
                'license':lurl,'coordinates':page.get('coordinates') or []}
        time.sleep(.15)
    return out
def load_places(root):
    pilot=json.loads((root/'data'/'pilot-places.json').read_text(encoding='utf-8'))
    manifest=json.loads((root/'data'/'places'/'manifest.json').read_text(encoding='utf-8'))
    national={}
    for file in sorted((root/'data'/'places').glob('cell_*.json')):
        for row in json.loads(file.read_text(encoding='utf-8')):
            if row.get('photoSource') and row.get('photoAttribution'):
                national[row['id']]=row
    # IDs in pilot refer to mapped destinations or explicitly curated Wikidata
    # entities, so no auto-matching based solely on nearby coordinates.
    places={}
    for row in pilot:
        if row.get('id') and row.get('photoSource') and row.get('photoAttribution'):
            places[row['id']]=row
    for pid,row in national.items():
        places.setdefault(pid,row)
    return places,manifest
def work(root,max_places,max_images):
    places,manifest=load_places(root)
    path=root/'data'/'place-gallery.json'
    existing=json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}
    existing={k:v for k,v in existing.items() if isinstance(v,list)}
    gallery={k:list(v) for k,v in existing.items()}
    before=set(x.get('source') for photos in existing.values() for x in photos)
    selected=sorted(places.values(),key=lambda p:(
        p.get('cat') not in ('playas','cascadas','atracciones','parques','rios','lagunas','resorts'),
        p.get('province') or '',p.get('name') or ''))
    fresh=0
    tested=0
    match_before_metadata=0
    bycat=collections.Counter()
    byprovince=collections.Counter()
    for p in selected[:max_places]:
        name=p.get('name') or ''
        pid=p['id']
        if not p.get('lat') or not p.get('lon') or len(normalize(name))<6:continue
        source=p.get('photoSource','')
        seed=commons_filename(source)
        titles=search_files(name,p.get('cat',''))
        tested+=1
        # Filename sibling matches are accepted ONLY after the very same
        # exact-name and location checks applied to all files.
        items=[t for t in titles if t not in ('File:'+seed,'File:'+seed.replace('_',' '))]
        goodnames=[t for t in items if match_title(name,t,p.get('cat',''),
            p['lat'],p['lon'],[],p.get('municipality') or p.get('province') or '')]
        # Do not hammer Commons extmetadata on hundreds of irrelevant images.
        goodnames=goodnames[:min(14,max_images)]
        match_before_metadata+=len(goodnames)
        if goodnames:
            metadata=image_metadata(goodnames)
            originals={source}
            originals.update(v.get('source') for v in gallery.get(pid,[]))
            for title in goodnames:
                info=metadata.get(title)
                if not info or info['source'] in originals:continue
                if not match_title(name,title,p.get('cat',''),p['lat'],p['lon'],
                       info.get('coordinates'),p.get('municipality') or p.get('province') or ''):
                    continue
                arr=gallery.setdefault(pid,[])
                if len(arr)>=9:break
                arr.append({k:info[k] for k in ('url','source','attribution','license')})
                originals.add(info['source'])
                fresh+=1;bycat[p.get('cat')]+=1
                byprovince[p.get('province') or 'Sin provincia']+=1
        if tested%10==0:
            print('VERIFICACIÓN',tested,'/',min(max_places,len(selected)),
                  'fotos nuevas',fresh,'respuestas API',REQUESTS,flush=True)
        time.sleep(.45)
    # Only update when we genuinely found additional licensed source files.
    added_sources=set(x.get('source') for photos in gallery.values() for x in photos)-before
    assert len(added_sources)==fresh,(len(added_sources),fresh)
    if fresh:
        path.write_text(json.dumps(gallery,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    stats={'updatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'placesInCatalogue':manifest['recordCount'],
        'placesWithNationalPhoto':manifest.get('licensedPhotoCount',0),
        'curatedPlacesWithKnownPhoto':len([p for p in places.values() if p.get('photoSource')]),
        'galleryPlaceCount':len(gallery),'galleryImageCount':sum(map(len,gallery.values())),
        'newVerifiedGalleryPhotos':fresh,'placesSearched':tested,
        'candidateTitlesMatched':match_before_metadata,'apiRequests':REQUESTS,
        'http429Count':RATE_LIMITS,'newPhotosByCategory':dict(sorted(bycat.items())),
        'newPhotosByProvince':dict(sorted(byprovince.items())),
        'description':'Fotos adicionales verificadas por título exacto del lugar y licencia libre Commons; negocios exigen confirmación de ubicación'}
    (root/'data'/'place-gallery-stats.json').write_text(json.dumps(stats,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('RESULTADO FOTOS NUEVAS DEL MISMO LUGAR:',fresh,
          'galerias:',len(gallery),'fotos totales:',stats['galleryImageCount'],
          'solicitudes',REQUESTS,flush=True)
    return stats
if __name__=='__main__':
    ap=argparse.ArgumentParser()
    ap.add_argument('--public',default='Where_to_Go_Proyecto_Completo/public')
    ap.add_argument('--max-places',type=int,default=165)
    ap.add_argument('--max-images',type=int,default=9)
    a=ap.parse_args()
    work(Path(a.public),a.max_places,a.max_images)

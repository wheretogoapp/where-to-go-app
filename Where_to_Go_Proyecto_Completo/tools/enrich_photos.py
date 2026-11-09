#!/usr/bin/env python3
"""Enrich OSM places only from explicitly linked Wikimedia / Wikidata photos.

Reads already-imported cell_*.json and updates only places whose OSM element
has a Wikidata ID, Wikimedia Commons File tag, or Commons image tag.
Does not perform fuzzy name matching, scrape third-party business websites,
or invent images/attribution. No credentials or paid APIs.
The Commons file metadata must identify an allowed free license.
"""
import argparse, collections, datetime, html, json, re, time, urllib.parse, urllib.request, urllib.error
from pathlib import Path

USER_AGENT='WhereToGoTourism/1.0 (open-data photo metadata; contact via repository github.com/wheretogoapp/where-to-go-app) Python-urllib'
WIKIDATA='https://www.wikidata.org/w/api.php'
COMMONS='https://commons.wikimedia.org/w/api.php'
REJECTED_PHOTO_IDS={'osm-node-1653013577','osm-node-1645591600','osm-node-1852199123','osm-way-677786667','osm-node-7243037034','osm-node-7353313837','osm-way-27582400'}
PRIORITY={'atracciones':0,'cascadas':1,'playas':2,'balnearios':3,'hoteles':4,'parques':5,'rios':6,'restaurantes':7,'bares':8,'supermercados':9}

RATE_LIMITED_HOSTS=set()
def get_json(url):
    host=urllib.parse.urlsplit(url).netloc
    if host in RATE_LIMITED_HOSTS:return {}
    request=urllib.request.Request(url,headers={'User-Agent':USER_AGENT,'Accept':'application/json'})
    for attempt in range(2):
        try:
            with urllib.request.urlopen(request,timeout=12) as response:
                return json.load(response)
        except urllib.error.HTTPError as exc:
            if exc.code==429:
                RATE_LIMITED_HOSTS.add(host)
                print('RATE LIMIT:',host,'rechazó nuevas consultas (429); detener peticiones de esta fuente')
                return {}
            if attempt==1:
                print('METADATA WARNING:',type(exc).__name__,str(exc)[:100]);return {}
            time.sleep(1.25)
        except Exception as exc:
            if attempt==1:
                print('METADATA WARNING:',type(exc).__name__,str(exc)[:100]);return {}
            time.sleep(1.25)
    return {}

def textify(raw):
    return re.sub(r'\s+',' ',html.unescape(re.sub(r'<[^>]+>',' ',str(raw or '')))).strip()[:140]

def metadata_value(meta, key):
    v=(meta.get(key) or {}).get('value','')
    return textify(v)

def commons_name(record):
    for key in ('wikimedia_commons','image'):
        raw=str(record.get(key) or '').strip()
        if raw.lower().startswith('file:'):return raw[5:].strip().replace('_',' ')
        if raw.lower().startswith('image:'):return raw[6:].strip().replace('_',' ')
        if raw.startswith('https://commons.wikimedia.org/wiki/Special:FilePath/'):
            return urllib.parse.unquote(raw.split('/Special:FilePath/',1)[1].split('?',1)[0]).replace('_',' ')
        if raw.startswith('https://commons.wikimedia.org/wiki/File:'):
            return urllib.parse.unquote(raw.split('/File:',1)[1].split('?',1)[0]).replace('_',' ')
    return ''

def valid_file(filename):
    return bool(filename and len(filename)<220 and not any(c in filename for c in '\r\n<>'))

def batch(seq, n):
    for i in range(0,len(seq),n):yield seq[i:i+n]

def fetch_wikidata_images(qids):
    found={}
    for group in batch(qids,25):
        params=urllib.parse.urlencode({'action':'wbgetentities','ids':'|'.join(group),'props':'claims','format':'json'})
        data=get_json(WIKIDATA+'?'+params)
        for qid,entity in (data.get('entities') or {}).items():
            try:
                claim=(entity.get('claims') or {}).get('P18') or []
                val=claim[0]['mainsnak']['datavalue']['value']
                if valid_file(val):found[qid]=val
            except (KeyError,TypeError,IndexError):pass
        time.sleep(.25)
    return found

def is_free_license(meta):
    lic=metadata_value(meta,'LicenseShortName') or metadata_value(meta,'UsageTerms')
    s=lic.lower()
    return bool(lic and (s.startswith('cc by') or s.startswith('cc0') or s.startswith('pd') or 'public domain' in s or s.startswith('gfdl'))),lic

def fetch_commons_metadata(filenames):
    results={}
    for group in batch(filenames,20):
        titles='|'.join('File:'+f for f in group)
        params=urllib.parse.urlencode({'action':'query','prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':'700','titles':titles,'format':'json','formatversion':'2'})
        data=get_json(COMMONS+'?'+params)
        for page in (data.get('query') or {}).get('pages',[]):
            info=(page.get('imageinfo') or [{}])[0]
            meta=info.get('extmetadata') or {}
            is_free,lic=is_free_license(meta)
            title=page.get('title','')
            if not is_free or not title.startswith('File:'):continue
            name=title[5:]
            uri=info.get('thumburl') or info.get('url') or ''
            if urllib.parse.urlparse(uri).hostname not in {'upload.wikimedia.org', 'thumb.wikimedia.org'} or not valid_file(name):continue
            # Commons' Artist is HTML; remove tags. Don't claim a specific photographer
            # when Commons does not provide one.
            artist=metadata_value(meta,'Artist') or metadata_value(meta,'Credit') or 'Wikimedia Commons'
            pageurl='https://commons.wikimedia.org/wiki/File:'+urllib.parse.quote(name.replace(' ','_'))
            results[name.replace('_',' ').casefold()]={'image':uri,'photoSource':pageurl,'photoAttribution':f'{artist} · {lic} · Wikimedia Commons'}
        time.sleep(.35)
    return results

def run(out, max_wikidata, max_photos):
    out=Path(out)
    manifest_path=out/'manifest.json'
    if not manifest_path.exists():raise SystemExit('No hay manifest.json: ejecuta primero import_osm_rd.py')
    manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
    if manifest.get('recordCount',0)<100:raise SystemExit('Catálogo vacío: no inventaremos fotografías')
    cell_paths=sorted(out.glob('cell_*.json'))
    contents={p:json.loads(p.read_text(encoding='utf-8')) for p in cell_paths}
    rows=[row for cell in contents.values() for row in cell]
    if sum(map(len,contents.values()))!=manifest['recordCount']:raise SystemExit('El conteo de celdas no coincide: cancelado')
    # Discover explicit source linkage. Prioritize nature and tourism, but spread
    # across geographic cells to avoid concentrating all photos in one city.
    candidates=[]
    for path,cell in contents.items():
        for row in cell:
            if commons_name(row) or re.fullmatch(r'Q\d+',str(row.get('wikidata') or '')):
                candidates.append((path,row))
    # Round-robin across geographic cells so one major city does not consume
    # the entire image quota before schools/landmarks elsewhere are reached.
    groups=collections.defaultdict(list)
    for path,row in candidates:groups[path].append(row)
    for rows_in_cell in groups.values():
        rows_in_cell.sort(key=lambda r:(0 if commons_name(r) else 1,PRIORITY.get(r.get('cat'),20),r['id']))
    chosen=[]
    max_len=max((len(v) for v in groups.values()),default=0)
    for depth in range(min(max_len,80)):
        for key in sorted(groups):
            if depth<len(groups[key]):chosen.append(groups[key][depth])
    qids=list(dict.fromkeys(str(r['wikidata']) for r in chosen if not commons_name(r) and re.fullmatch(r'Q\d+',str(r.get('wikidata') or ''))))[:max_wikidata]
    wikidata_images=fetch_wikidata_images(qids)
    file_for={}
    for row in chosen:
        name=commons_name(row)
        if not name:name=wikidata_images.get(row.get('wikidata',''),'')
        if valid_file(name):file_for[row['id']]=name
    distinct=list(dict.fromkeys(file_for.values()))[:max_photos]
    resolved=fetch_commons_metadata(distinct)
    updated=0
    for row in rows:
        if row.get('id') in REJECTED_PHOTO_IDS:continue
        name=file_for.get(row['id'])
        if not name:continue
        meta=resolved.get(name.replace('_',' ').casefold())
        if not meta:continue
        row.update(meta);updated+=1
    # Preserve direct OSM image tags in untouched rows, but don't claim that
    # unverified external links carry verified licensing or an artist credit.
    for p,cell in contents.items():
        p.write_text(json.dumps(cell,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
    manifest['licensedPhotoCount']=sum(bool(r.get('photoSource')) for r in rows)
    manifest['photoCoverageByCategory']=dict(sorted(collections.Counter(r.get('cat') for r in rows if r.get('photoSource')).items()))
    manifest['licensedPhotoEnrichment']={'runAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'linkedCandidates':len(candidates),'wikidataIDsQueried':len(qids),
        'commonsFilesChecked':len(distinct),'withVerifiedLicense':manifest['licensedPhotoCount'],
        'description':'Solo fotos vinculadas al lugar por OSM/Wikidata y con licencia libre verificable en Wikimedia Commons'}
    manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print('FOTOS:',updated,'fichas enriquecidas; total con licencia',manifest['licensedPhotoCount'],'de',len(rows),'lugares')
    if not updated:print('AVISO: Wikimedia no devolvió imágenes enlazadas válidas; no se han inventado fotografías.')

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--out',default='Where_to_Go_Proyecto_Completo/public/data/places')
    p.add_argument('--max-wikidata',type=int,default=600);p.add_argument('--max-photos',type=int,default=600)
    a=p.parse_args();run(a.out,a.max_wikidata,a.max_photos)

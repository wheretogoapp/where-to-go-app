#!/usr/bin/env python3
"""Discover MORE place-specific Wikimedia photographs across Dominican Republic.

Searches mapped OSM tourist landmarks WITHOUT photos. A candidate is accepted
ONLY when Commons provides a geotag close to the exact place, the file title
identifies that landmark, and the author/free license are present. Never reuse
generic surrounding scenery for restaurants or an unrelated business.
"""
import argparse, collections, datetime, html, json, math, pathlib, re, time
import urllib.parse, urllib.request, urllib.error, unicodedata
from photo_subject_filter import rejection_reason

API="https://commons.wikimedia.org/w/api.php"
AGENT="WhereToGoRDExactGeoGallery/1.0 (https://github.com/wheretogoapp/where-to-go-app)"
CATS={"atracciones":1,"playas":0,"cascadas":0,"parques":2,"lagunas":2,"entretenimiento":3,"iglesias":4,"rios":5,"resorts":2,"hoteles":3,"restaurantes":4,"bares":5}
BUSINESS_CATS={"resorts","hoteles","restaurantes","bares"}
STOP=set("el la los las de del y en al para por con un una san santa santo playa playas beach cascada salto parque natural nacional monumento rio rio museo lugar turistico church dominican republic republica dominicana dominicana dominicano plaza mirador rio".split())
SUSPICIOUS=re.compile(r"\b(arroyos?|canadas?|canal|residencial|apartamentos?|building|condominio|residence|urbanizacion|gasolinera|pizzeria|colegio|escuela|ferreteria|vivero)\b",re.I)
BAD_FILE=re.compile(r"(astronaut|earth from|iss0|satellite|space station|orbital|melanerpes|portumnus|crab|bird|pajaro|anolis|insect|frog|butterfly|maps? of|flag|coat of arms|portrait|cartoon|drawing|painting|illustra|sign|logo|poster|icon|stamp)",re.I)
def norm(s):
    s=urllib.parse.unquote(str(s or ""))
    return re.sub(r"[^a-z0-9]+"," ","".join(c for c in unicodedata.normalize("NFD",s.casefold()) if not unicodedata.combining(c))).strip()
def words(s):
    return [t for t in norm(s).split() if len(t)>=4 and t not in STOP]
def dist(a,b,c,d):
    p=math.pi/180
    h=math.sin((c-a)*p/2)**2+math.cos(a*p)*math.cos(c*p)*math.sin((d-b)*p/2)**2
    return 12742000*math.atan2(math.sqrt(h),math.sqrt(max(0,1-h)))
def clean(value):
    return re.sub(r"\s+"," ",html.unescape(re.sub(r"<[^>]+>"," ",str(value or "")))).strip()[:160]
def allowed(meta):
    name=clean((meta.get("LicenseShortName") or meta.get("UsageTerms") or {}).get("value",""))
    l=name.casefold().replace("-"," ")
    return bool(l.startswith(("cc by","cc0","pd","public domain"))),name
def commons_query(row,stats):
    params={"action":"query","generator":"search","gsrsearch":'"'+row["name"]+'"',
        "gsrnamespace":6,"gsrlimit":35,"prop":"coordinates|imageinfo|categories",
        "colimit":50,"cllimit":50,"iiprop":"url|extmetadata","iiurlwidth":720,
        "format":"json","formatversion":2}
    url=API+"?"+urllib.parse.urlencode(params)
    req=urllib.request.Request(url,headers={"User-Agent":AGENT,"Accept":"application/json"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req,timeout=30) as f:
                stats["queries"]+=1
                return json.load(f).get("query",{}).get("pages",[])
        except urllib.error.HTTPError as e:
            if e.code==429:
                stats["http429"]+=1
                # If Commons is rate-limiting, stop rather than hammer the host.
                print("Commons 429: deteniendo búsquedas para respetar límites",flush=True)
                return None
            if e.code not in (500,502,503,504):return []
            time.sleep(4*(attempt+1))
        except (TimeoutError,OSError,ValueError) as e:
            if attempt==2:print("Query failed:",type(e).__name__,flush=True)
            time.sleep(2*(attempt+1))
    return []

def commons_category_query(row,stats):
    """Search a Commons category with the EXACT mapped landmark name.
    Membership is independent evidence; still require camera GPS at the place.
    """
    if row.get("cat") in BUSINESS_CATS:return []
    params={"action":"query","generator":"categorymembers",
            "gcmtitle":"Category:"+row["name"],"gcmtype":"file","gcmlimit":35,
            "prop":"coordinates|imageinfo","colimit":50,
            "iiprop":"url|extmetadata","iiurlwidth":720,
            "format":"json","formatversion":2}
    req=urllib.request.Request(API+"?"+urllib.parse.urlencode(params),
            headers={"User-Agent":AGENT,"Accept":"application/json"})
    try:
        with urllib.request.urlopen(req,timeout=30) as response:
            stats["queries"]+=1
            stats["categoryQueries"]+=1
            return json.load(response).get("query",{}).get("pages",[])
    except urllib.error.HTTPError as exc:
        if exc.code==429:
            stats["http429"]+=1
            print("Commons category rate limited (429)",flush=True)
            return None
        return []
    except (OSError,TimeoutError,ValueError):
        return []

def same_place_category_photo(row,page):
    """Category title identifies the exact landmark AND camera GPS confirms it."""
    title=page.get("title","")
    if not title.startswith("File:") or not re.search(r"\.(jpe?g|png|webp)$",title,re.I):return False
    if BAD_FILE.search(title) or rejection_reason(title):return False
    coords=page.get("coordinates") or []
    if not coords:return False
    try:
        a=float(coords[0]["lat"]);b=float(coords[0]["lon"])
    except (TypeError,ValueError,KeyError):return False
    radius=350 if row["cat"] in ("playas","lagunas","parques","rios","cascadas") else 100
    return dist(row["lat"],row["lon"],a,b)<=radius

def select_candidates(public,already,visited,limit):
    cells=public/"data"/"places"
    groups=collections.defaultdict(list)
    inspected=0
    for file in sorted(cells.glob("cell_*.json")):
        arr=json.loads(file.read_text(encoding="utf-8"))
        for row in arr:
            inspected+=1
            if not row.get("id","").startswith("osm-"):continue
            if row.get("photoSource") or row["id"] in already or row["id"] in visited:continue
            if row.get("cat") not in CATS or row.get("nameKnown") is False:continue
            name=norm(row.get("name"))
            if len(name)<10 or SUSPICIOUS.search(name):continue
            tokens=words(name)
            if len(set(tokens))<2 and not (len(tokens)==1 and len(tokens[0])>=9):continue
            if not isinstance(row.get("lat"),(int,float)) or not isinstance(row.get("lon"),(int,float)):continue
            if not (17.5<row["lat"]<20.3 and -72.1<row["lon"]< -68.1):continue
            key=f'{round(row["lat"]*3)}:{round(row["lon"]*3)}'
            priority=(CATS[row["cat"]],0 if row.get("wikidata") else 1,len(name),name)
            groups[key].append((priority,row))
    for group in groups.values():group.sort(key=lambda a:a[0])
    selected=[]
    keys=sorted(groups)
    depth=0
    while len(selected)<limit and depth<300:
        found=False
        for key in keys:
            if depth<len(groups[key]):
                selected.append(groups[key][depth][1]);found=True
                if len(selected)>=limit:break
        if not found:break
        depth+=1
    return selected,inspected
def exact_match(row,page):
    title=page.get("title","")
    if not title.startswith("File:") or not re.search(r"\.(jpe?g|png|webp)$",title,re.I):return False
    if BAD_FILE.search(title) or rejection_reason(title):return False
    tokens=words(row["name"])
    file_tokens=set(norm(title).split())
    # All distinctive name terms must be in the image filename.
    if not tokens or not all(t in file_tokens for t in set(tokens)):return False
    geos=page.get("coordinates") or []
    # A business requires a camera GPS near its actual mapped location.
    # A matching name and Dominican category alone cannot identify a business.
    if row["cat"] in BUSINESS_CATS and not geos:return False
    if geos:
        try:
            latitude=float(geos[0]["lat"]);longitude=float(geos[0]["lon"])
        except (TypeError,ValueError,KeyError):return False
        radius=80 if row["cat"] in BUSINESS_CATS else (800 if row["cat"] in ("playas","lagunas","parques","rios") else 160)
        return dist(row["lat"],row["lon"],latitude,longitude)<=radius
    # Some Wikimedia Commons photographs have no camera coordinates. They
    # are accepted only when BOTH the exact distinctive place name appears in
    # the filename AND the Commons categories independently identify DR.
    # No generic-name or business photos are allowed without camera GPS.
    if len(set(tokens))<2:return False
    where=norm(" ".join(c.get("title","") for c in page.get("categories") or []))
    title_norm=norm(title)
    dominican=(("dominican republic" in where or "republica dominicana" in where)
              or ("dominican republic" in title_norm or "republica dominicana" in title_norm))
    if not dominican:return False
    if norm(row["name"]) in ("parque central","plaza independencia","parque independencia",
                             "monumento independencia","playa bonita","playa dorada"):return False
    return True
def photo(page):
    info=(page.get("imageinfo") or [{}])[0]
    meta=info.get("extmetadata") or {}
    free,lic=allowed(meta)
    if not free:return None
    url=info.get("thumburl") or info.get("url") or ""
    if urllib.parse.urlparse(url).hostname not in ("upload.wikimedia.org","thumb.wikimedia.org"):return None
    artist=clean((meta.get("Artist") or meta.get("Credit") or {}).get("value")) or "Wikimedia Commons"
    if not artist or not lic:return None
    source="https://commons.wikimedia.org/wiki/"+urllib.parse.quote(page["title"].replace(" ","_"),safe=":")
    license_url=html.unescape((meta.get("LicenseUrl") or {}).get("value","") or "")
    if not license_url.startswith("https://"):license_url=source
    return {"url":url,"source":source,"attribution":f"{artist} · {lic} · Wikimedia Commons","license":license_url}
def run(public,limit):
    public=pathlib.Path(public)
    gallery_path=public/"data"/"place-gallery.json"
    progress_path=public/"data"/"place-gallery-geo-progress.json"
    report_path=public/"data"/"place-gallery-geo-stats.json"
    gallery=json.loads(gallery_path.read_text(encoding="utf-8"))
    # Clean pre-existing repeats before running strict publication checks.
    # The old gallery contains a Fortaleza Ozama image assigned to two IDs;
    # that otherwise causes every new photo import to fail before publishing.
    deduplicated=0
    clean_gallery={}
    seen_sources=set()
    for pid,images in gallery.items():
        unique=[]
        for item in images:
            source=urllib.parse.unquote(str(item.get("source") or "")).casefold()
            if not source or source in seen_sources:
                deduplicated+=1
                continue
            seen_sources.add(source)
            unique.append(item)
        if unique:clean_gallery[pid]=unique
    gallery=clean_gallery
    progress=json.loads(progress_path.read_text(encoding="utf-8")) if progress_path.exists() else {"visited":[]}
    visited=set(progress.get("visited",[]))
    existing_sources={p["source"] for images in gallery.values() for p in images}
    candidates,inspected=select_candidates(public,set(gallery),visited,limit)
    stats={"matcher":"GPS <=160m/800m or exact distinctive name AND Wikimedia DR categories", "startedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),"catalogueRows":inspected,
           "candidates":len(candidates),"processed":0,"newPhotographs":0,
           "newPlacesWithGallery":0,"queries":0,"categoryQueries":0,"http429":0,
           "source":"Wikimedia Commons coordinates, exact subject-name match and CC license"}
    changes=[]
    for row in candidates:
        pages=commons_query(row,stats)
        if pages is None:break
        visited.add(row["id"])
        stats["processed"]+=1
        matches=[]
        for p in pages if isinstance(pages,list) else pages.values():
            if not exact_match(row,p):continue
            x=photo(p)
            if not x or x["source"] in existing_sources:continue
            matches.append(x)
        # If title-search fails, inspect an exact-named Commons category.
        # The candidate photo MUST have camera coordinates at this landmark.
        if not matches and row["cat"] not in BUSINESS_CATS:
            category_pages=commons_category_query(row,stats)
            if category_pages is None:break
            for p in category_pages if isinstance(category_pages,list) else category_pages.values():
                if not same_place_category_photo(row,p):continue
                x=photo(p)
                if not x or x["source"] in existing_sources:continue
                matches.append(x)
                if len(matches)>=3:break
        if matches:
            gallery[row["id"]]=matches[:7]
            existing_sources.update(x["source"] for x in matches[:7])
            stats["newPhotographs"]+=len(matches[:7])
            stats["newPlacesWithGallery"]+=1
            changes.append((row["name"],row["cat"],len(matches[:7])))
        if stats["processed"]%20==0:
            print("OSM GEO GALLERY",stats["processed"],"/",len(candidates),
                  "fotos:",stats["newPhotographs"],"lugares:",stats["newPlacesWithGallery"],flush=True)
        time.sleep(.4)
    stats["deduplicatedExistingPhotos"]=deduplicated
    if stats["newPhotographs"] or deduplicated:
        gallery_path.write_text(json.dumps(gallery,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    progress["visited"]=sorted(visited)
    progress["lastRunAt"]=datetime.datetime.now(datetime.timezone.utc).isoformat()
    progress_path.write_text(json.dumps(progress,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
    stats["finishedAt"]=progress["lastRunAt"];stats["newPlaces"]=changes
    stats["totalGalleryPhotos"]=sum(len(x) for x in gallery.values())
    stats["totalPlacesWithGallery"]=len(gallery)
    report_path.write_text(json.dumps(stats,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("GEO FOTOS DEL MISMO LUGAR:",stats["newPhotographs"],
          "EN",stats["newPlacesWithGallery"],"LUGARES; total",stats["totalGalleryPhotos"],flush=True)
    print("DESTINOS:",json.dumps(changes[:35],ensure_ascii=False),flush=True)
if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--public",default="Where_to_Go_Proyecto_Completo/public")
    parser.add_argument("--limit",type=int,default=160)
    args=parser.parse_args()
    run(args.public,min(600,max(1,args.limit)))

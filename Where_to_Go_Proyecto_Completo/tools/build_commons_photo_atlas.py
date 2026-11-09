#!/usr/bin/env python3
"""Create a country-wide atlas of REAL, geotagged, freely licensed Wikimedia photographs.

This is an image atlas, NOT a database of photos of hotels/restaurants.
Photos are attached to their recorded camera coordinates, with source and license;
never attach them to a business solely because it is nearby.
No Google scraping, credentials or paid APIs.
"""
import argparse, collections, datetime, html, json, re, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path

API="https://commons.wikimedia.org/w/api.php"
AGENT="WhereToGoRDPhotoAtlas/1.0 (open licensed geotagged photos; https://github.com/wheretogoapp/where-to-go-app)"
# Public geographic browsing anchors, not addresses of businesses.
# Places in different provinces are sampled in rotation for national coverage.
ANCHORS=[
 ("Las Terrenas","Samaná",19.311,-69.543),
 ("Puerto Plata","Puerto Plata",19.7934,-70.6884),
 ("Santo Domingo","Distrito Nacional",18.4861,-69.9312),
 ("Santiago","Santiago",19.4517,-70.6970),
 ("Punta Cana","La Altagracia",18.5586,-68.3694),
 ("Bávaro","La Altagracia",18.6862,-68.4198),
 ("La Romana","La Romana",18.4273,-68.9728),
 ("Samaná","Samaná",19.204,-69.337),
 ("Sosúa","Puerto Plata",19.7683,-70.5199),
 ("Cabarete","Puerto Plata",19.7496,-70.4139),
 ("Jarabacoa","La Vega",19.119,-70.639),
 ("Las Galeras","Samaná",19.292,-69.193),
 ("Boca Chica","Santo Domingo",18.450,-69.613),
 ("Bayahíbe","La Altagracia",18.369,-68.842),
 ("Monte Cristi","Monte Cristi",19.845,-71.647),
 ("Barahona","Barahona",18.211,-71.101),
 ("Baní","Peravia",18.279,-70.331),
 ("San Pedro de Macorís","San Pedro de Macorís",18.454,-69.307),
 ("San Cristóbal","San Cristóbal",18.417,-70.110),
 ("Constanza","La Vega",18.912,-70.745),
 ("La Vega","La Vega",19.224,-70.531),
 ("Bonao","Monseñor Nouel",18.943,-70.409),
 ("Moca","Espaillat",19.395,-70.523),
 ("San Francisco de Macorís","Duarte",19.301,-70.253),
 ("Nagua","María Trinidad Sánchez",19.383,-69.847),
 ("Río San Juan","María Trinidad Sánchez",19.646,-70.078),
 ("Miches","El Seibo",18.982,-69.047),
 ("Higüey","La Altagracia",18.615,-68.707),
 ("Macao","La Altagracia",18.769,-68.536),
 ("Punta Rucia","Puerto Plata",19.837,-71.213),
 ("El Limón","Samaná",19.271,-69.447),
 ("Playa Rincón","Samaná",19.291,-69.249),
 ("Playa Bonita","Samaná",19.317,-69.580),
 ("Playa Cosón","Samaná",19.298,-69.603),
 ("Playa Portillo","Samaná",19.338,-69.520),
 ("Altos de Chavón","La Romana",18.419,-68.890),
 ("Santo Domingo Este","Santo Domingo",18.486,-69.852),
 ("Santo Domingo Oeste","Santo Domingo",18.493,-70.019),
 ("Los Alcarrizos","Santo Domingo",18.515,-70.012),
 ("San Juan de la Maguana","San Juan",18.808,-71.227),
 ("Azua de Compostela","Azua",18.455,-70.730),
 ("San José de Ocoa","San José de Ocoa",18.548,-70.507),
 ("Pedernales","Pedernales",18.036,-71.743),
 ("Bahía de las Águilas","Pedernales",17.959,-71.659),
 ("Neyba","Baoruco",18.482,-71.417),
 ("Lago Enriquillo","Independencia",18.563,-71.696),
 ("Jimaní","Independencia",18.490,-71.851),
 ("Dajabón","Dajabón",19.547,-71.704),
 ("Mao","Valverde",19.552,-71.078),
 ("San Ignacio de Sabaneta","Santiago Rodríguez",19.476,-71.343),
 ("Cotuí","Sánchez Ramírez",19.052,-70.151),
 ("Monte Plata","Monte Plata",18.807,-69.784),
 ("Bayaguana","Monte Plata",18.756,-69.637),
 ("Hato Mayor del Rey","Hato Mayor",18.767,-69.257),
 ("Santa Cruz de El Seibo","El Seibo",18.771,-69.040),
 ("Salcedo","Hermanas Mirabal",19.378,-70.415),
 ("Comendador","Elías Piña",18.877,-71.702),
 ("Sánchez","Samaná",19.226,-69.613),
 ("Villa Altagracia","San Cristóbal",18.671,-70.172),
 ("Las Matas de Farfán","San Juan",18.872,-71.516),
 ("Paradise Barahona","Barahona",17.984,-71.164),
 ("Dunas de Baní","Peravia",18.212,-70.515),
]
def clean(value):
    return re.sub(r"\s+"," ",html.unescape(re.sub(r"<[^>]+>"," ",str(value or "")))).strip()[:160]
def value(meta,key):
    return clean((meta.get(key) or {}).get("value",""))
def is_open_license(metadata):
    l=value(metadata,"LicenseShortName") or value(metadata,"UsageTerms")
    t=l.lower().replace("-"," ")
    return bool(t.startswith(("cc by","cc0","pd","public domain"))),l
def fetch_json(params):
    url=API+"?"+urllib.parse.urlencode(params)
    for attempt in range(5):
        req=urllib.request.Request(url,headers={"User-Agent":AGENT,"Accept":"application/json"})
        try:
            with urllib.request.urlopen(req,timeout=35) as response:
                return json.load(response)
        except urllib.error.HTTPError as err:
            if err.code in (429,500,502,503,504):
                delay=min(60,5*(2**attempt))
                print("WIKIMEDIA",err.code,"reintentar tras",delay,"s",flush=True)
                time.sleep(delay)
                continue
            print("HTTP ERROR",err.code,flush=True)
            return {}
        except (TimeoutError, OSError, ValueError) as err:
            if attempt==4:
                print("REQUEST ERROR",type(err).__name__,str(err)[:120],flush=True)
                return {}
            time.sleep(min(30,3*(attempt+1)))
    return {}
def main(args):
    from shapely.geometry import Point,shape
    from shapely.prepared import prep
    geodata=json.loads(Path(args.countries).read_text(encoding="utf-8"))
    rd=None
    for feature in geodata["features"]:
        vals=[str(x).lower() for x in feature.get("properties",{}).values() if isinstance(x,(str,int))]
        if any(v in ("dom","do","dominican republic","república dominicana","republica dominicana") for v in vals):
            rd=prep(shape(feature["geometry"]));break
    if rd is None:raise SystemExit("Frontera RD no identificada: no publicar fotos")
    output=Path(args.output)
    old={}
    if output.exists():
        try:
            previous=json.loads(output.read_text(encoding="utf-8"))
            old={x["source"]:x for x in previous.get("photos",[]) if x.get("source")}
        except (ValueError,KeyError,TypeError):pass
    selected=dict(old)
    rejects=collections.Counter()
    searches=0
    anchors=list(ANCHORS)
    # Search adjacent geographic cells for broader nationwide coverage.
    for city,province,lat,lon in ANCHORS:
        for dlat,dlon in ((.095,0),(-.095,0),(0,.105),(0,-.105)):
            anchors.append((city,province,round(lat+dlat,5),round(lon+dlon,5)))
    # Explore geotagged file pages. The API does not establish a business identity.
    for city,province,lat,lon in anchors:
        # Even after 500 photos, visit the remaining provinces before publishing.
        continuation={}
        new_here=0
        for page_index in range(4):
            params={"action":"query","generator":"geosearch","ggscoord":f"{lat}|{lon}",
                "ggsradius":10000,"ggslimit":50,"ggsnamespace":6,
                "prop":"coordinates|imageinfo","colimit":50,"iiprop":"url|extmetadata",
                "iiurlwidth":700,"format":"json","formatversion":2}
            params.update(continuation)
            obj=fetch_json(params);searches+=1
            pages=(obj.get("query") or {}).get("pages") or []
            if isinstance(pages,dict):pages=list(pages.values())
            for page in pages:
                title=page.get("title","")
                if not title.startswith("File:") or not re.search(r"\.(?:jpe?g|png|webp)$",title,re.I):
                    rejects["filetype"]+=1;continue
                coords=page.get("coordinates") or []
                if not coords:rejects["missingGPS"]+=1;continue
                try:
                    clat=float(coords[0]["lat"]);clon=float(coords[0]["lon"])
                except (ValueError,TypeError,KeyError):
                    rejects["badGPS"]+=1;continue
                if not rd.covers(Point(clon,clat)):rejects["outsideRD"]+=1;continue
                info=(page.get("imageinfo") or [{}])[0]
                meta=info.get("extmetadata") or {}
                free,lic=is_open_license(meta)
                if not free:rejects["unlicensed"]+=1;continue
                url=info.get("thumburl") or info.get("url") or ""
                host=urllib.parse.urlparse(url).hostname
                if host not in ("upload.wikimedia.org","thumb.wikimedia.org"):
                    rejects["imageURL"]+=1;continue
                source="https://commons.wikimedia.org/wiki/"+urllib.parse.quote(title.replace(" ","_"),safe=":")
                if source in selected:continue
                artist=value(meta,"Artist") or value(meta,"Credit") or "Autor acreditado en Wikimedia Commons"
                license_url=html.unescape((meta.get("LicenseUrl") or {}).get("value","") or "")
                if not license_url.startswith("https://"):license_url=source
                selected[source]={"title":title[5:].rsplit(".",1)[0].replace("_"," ")[:130],
                    "image":url,"source":source,"credit":artist,"license":lic,
                    "licenseUrl":license_url,"lat":clat,"lon":clon,"area":city,
                    "province":province,"sourceType":"Wikimedia Commons · geolocalización de archivo"}
                new_here+=1
            # One batched Commons query per anchor, then move to another province.
            token=(obj.get("continue") or {}).get("ggscontinue")
            if not token or (args.target>0 and len(selected)>=args.target*2):break
            continuation={"ggscontinue":token,"continue":"-||"}
            time.sleep(.5)
        print(f"ATLAS {city} ({province}): +{new_here} fotos, total {len(selected)}",flush=True)
        if args.target>0 and len(selected)>=args.target*2:break
        time.sleep(.25)
    # Balance the final 500 across ALL provinces with geotagged licensed photos.
    # Keep a meaningful Las Terrenas sample for the on-site pilot.
    import math
    near=[]
    for pic in selected.values():
        if pic.get("province")!="Samaná":continue
        lat2,lon2=pic["lat"],pic["lon"]
        km=math.hypot((lat2-19.311)*111.1,(lon2+69.543)*105.0)
        if km<=12:near.append(pic)
    selected_sources=set()
    images=[]
    for pic in near[:40]:
        if pic["source"] not in selected_sources:
            images.append(pic);selected_sources.add(pic["source"])
    buckets=collections.defaultdict(list)
    for pic in selected.values():
        if pic["source"] not in selected_sources:
            buckets[pic["province"]].append(pic)
    for group in buckets.values():
        group.sort(key=lambda x:(x["title"].lower().startswith(("img","dsc","home","pict")),x["area"],x["title"]))
    provinces=sorted(buckets)
    while (args.target==0 or len(images)<args.target) and provinces:
        remaining=[]
        for province in provinces:
            group=buckets[province]
            if group:
                images.append(group.pop(0))
                if args.target>0 and len(images)>=args.target:break
            if group:remaining.append(province)
        provinces=remaining
    byprov=dict(sorted(collections.Counter(x["province"] for x in images).items()))
    result={"version":1,"updatedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "target":args.target,"count":len(images),"geotagged":True,
        "description":"Fotografías geolocalizadas, NO fotos verificadas de cada negocio",
        "source":"Wikimedia Commons (autores y licencias individuales)",
        "apiRequests":searches,"coverageByProvince":byprov,"rejected":dict(rejects),
        "photos":images}
    if not images:raise SystemExit("No se obtuvieron imágenes auténticas; se conserva el atlas anterior")
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(result,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
    print("RESULTADO REAL:",len(images),"fotos geolocalizadas;",len(byprov),"provincias;",searches,"consultas",flush=True)
    if args.target>0 and len(images)<args.target:print("META NO ALCANZADA: faltan",args.target-len(images),"fotos",flush=True)
if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--countries",required=True)
    ap.add_argument("--output",required=True)
    ap.add_argument("--target",type=int,default=500)
    a=ap.parse_args()
    if not 0<=a.target<=1000000:raise SystemExit("Objetivo fuera de rango")
    main(a)

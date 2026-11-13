#!/usr/bin/env python3
"""Promote atlas photos to exact OSM landmarks ONLY when title and GPS agree.
No nearby scenery becomes a restaurant/hotel photograph. No paid API required.
"""
import argparse
import collections
import datetime
import json
import math
from pathlib import Path
import re
import unicodedata
from urllib.parse import unquote

CATEGORIES = {"playas", "parques", "cascadas", "lagunas", "atracciones", "rios", "balnearios", "senderismo"}
NATURE = {"playas", "cascadas", "lagunas", "rios", "balnearios", "senderismo"}
GENERIC = {"la", "el", "los", "las", "del", "de", "en", "una", "un", "the", "and", "rd", "dr", "dominican", "republic", "republica", "dominicana"}
BAD = re.compile(r"\b(flag|map|logo|poster|illustration|painting|drawing|diagram|portrait|bandera|pintura|escudo)\b", re.I)

def norm(s):
    s = "".join(c for c in unicodedata.normalize("NFD", str(s or "").lower()) if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", " ", s).strip()

def distance(a,b,c,d):
    r=math.pi/180
    h=math.sin((c-a)*r/2)**2+math.cos(a*r)*math.cos(c*r)*math.sin((d-b)*r/2)**2
    return 12742000*math.atan2(math.sqrt(h),math.sqrt(max(0,1-h)))

def title_match(name, photo):
    target=norm(name)
    title=norm(photo.get("title",""))
    if not target or not title or BAD.search(title):return False
    # Do not misrepresent a golf course or a city panorama as a beach photo.
    if ("playa" in target or "beach" in target) and re.search(r"\b(golf|hole|course|campo de golf)\b",title):
        return False
    # Exact phrase, not just a shared locality or generic category keyword.
    if not re.search(r"\b"+re.escape(target)+r"\b",title):return False
    distinctive=[w for w in target.split() if w not in GENERIC and len(w)>=4]
    if not distinctive:return False
    if target in {"parque central", "plaza independencia", "playa bonita", "playa grande", "parque independencia"}:
        return False
    return len(target)>=9 and (len(distinctive)>=2 or len(distinctive[0])>=7)

def valid_photo(photo):
    source=photo.get("source","")
    url=photo.get("image","")
    return (source.startswith("https://commons.wikimedia.org/wiki/File:")
            and url.startswith(("https://upload.wikimedia.org/", "https://thumb.wikimedia.org/"))
            and bool(photo.get("credit")) and bool(photo.get("license"))
            and isinstance(photo.get("lat"),(int,float))
            and isinstance(photo.get("lon"),(int,float)))

def run(public):
    root=Path(public)/"data"
    directory=root/"places"
    manifest_path=directory/"manifest.json"
    atlas_path=root/"photo-atlas-rd.json"
    manifest=json.loads(manifest_path.read_text(encoding="utf-8"))
    atlas=json.loads(atlas_path.read_text(encoding="utf-8"))
    photos=[x for x in atlas.get("photos",[]) if valid_photo(x)]
    assert manifest.get("recordCount",0)>1000
    assert photos, "Atlas vacío: no modificar el directorio"
    # The atlas contains environment photos, not guaranteed place identity.
    # Promotion to a POI requires both an exact subject title and near GPS.
    cells={}
    rows=[]
    for path in sorted(directory.glob("cell_*.json")):
        items=json.loads(path.read_text(encoding="utf-8"))
        cells[path]=items
        rows.extend(items)
    assert len(rows)==manifest["recordCount"], "Conteo nacional inconsistente"
    # Revoke earlier false-positive atlas matches using exact photographed titles.
    unsafe_atlas={"overture-2cb12a9e-80c4-4546-9b40-0bca1fc56a1a":"playa dorada golf",
                  "overture-ff8a07f4-4857-4f06-8066-ebe42b3f2148":"punta cana republica dominicana"}
    revoked=set()
    for row in rows:
        expected=unsafe_atlas.get(row.get("id"))
        source=norm(unquote(row.get("photoSource") or ""))
        if expected and expected in source:
            for field in ("image","photoSource","photoAttribution","photoLicense"):
                row.pop(field,None)
            revoked.add(row["id"])
    existing_sources={unquote(str(r.get("photoSource",""))) for r in rows if r.get("photoSource")}
    gallery=json.loads((root/"place-gallery.json").read_text(encoding="utf-8"))
    existing_sources.update(unquote(photo.get("source","")) for items in gallery.values() for photo in items)
    proposed=[]
    for row in rows:
        if row.get("id")=="overture-ff8a07f4-4857-4f06-8066-ebe42b3f2148":continue  # Generic Punta Cana image is not a named beach
        if row.get("photoSource") or row.get("id") in gallery or row.get("cat") not in CATEGORIES or row.get("nameKnown") is False:continue
        a,b=row.get("lat"),row.get("lon")
        if not isinstance(a,(int,float)) or not isinstance(b,(int,float)):continue
        for photo in photos:
            if unquote(photo["source"]) in existing_sources or not title_match(row.get("name"),photo):continue
            d=distance(a,b,photo["lat"],photo["lon"])
            radius=350 if row["cat"] in NATURE else 90
            if d<=radius:
                proposed.append((d,row,photo))
    proposed.sort(key=lambda x:x[0])
    used_ids=set()
    used_sources=set(existing_sources)
    by_category=collections.Counter()
    matched=[]
    for d,row,photo in proposed:
        sid=unquote(photo["source"])
        if row["id"] in used_ids or sid in used_sources:continue
        row.update({"image":photo["image"],"photoSource":photo["source"],
            "photoAttribution":photo["credit"]+" · "+photo["license"]+" · Wikimedia Commons",
            "photoLicense":photo.get("licenseUrl") or photo["source"]})
        used_ids.add(row["id"])
        used_sources.add(sid)
        by_category[row["cat"]]+=1
        matched.append({"id":row["id"],"name":row["name"],"photo":photo["title"],"distanceMeters":round(d,1)})
    if matched or revoked:
        for path, items in cells.items():
            if any(row["id"] in used_ids or row["id"] in revoked for row in items):
                path.write_text(json.dumps(items,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
        verified=[r for r in rows if r.get("photoSource") and r.get("photoAttribution")]
        manifest["licensedPhotoCount"]=len(verified)
        manifest["photoCoverageByCategory"]=dict(sorted(collections.Counter(r["cat"] for r in verified).items()))
        manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    report={"updatedAt":datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "atlasPhotosChecked":len(photos),"cataloguePlaces":len(rows),
        "candidatesWithTitleAndGPS":len(proposed),"newPlaceCardsWithPhoto":len(matched),
        "byCategory":dict(sorted(by_category.items())),"accepted":matched,
        "rule":"Same exact name phrase in file title and camera GPS within 90m (built) or 350m (natural); non-business categories only"}
    (root/"atlas-exact-match-stats.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("FOTOS DEL ATLAS ASIGNADAS A LUGARES EXACTOS:",len(matched), "de",len(rows),"lugares")
    print("POR CATEGORÍA:",dict(by_category))
    for item in matched[:40]:print("ASIGNADA",item)
    return len(matched)

if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--public",default="Where_to_Go_Proyecto_Completo/public")
    args=ap.parse_args()
    run(args.public)

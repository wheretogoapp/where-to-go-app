#!/usr/bin/env python3
"""Offline smoke-test of exact Las Terrenas location filters and national atlas."""
import collections,json,math,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]/"public"/"data"
LOC=19.311,-69.543
RADIUS=12000
def distance(lat1,lon1,lat2,lon2):
    rad=math.pi/180
    a=math.sin((lat2-lat1)*rad/2)**2+math.cos(lat1*rad)*math.cos(lat2*rad)*math.sin((lon2-lon1)*rad/2)**2
    return 6371000*2*math.atan2(math.sqrt(a),math.sqrt(max(0,1-a)))
def load_key(key):
    p=ROOT/"places"/f"cell_{key}.json"
    assert p.exists(),f"Archivo geográfico faltante: {p}"
    return json.loads(p.read_text(encoding="utf-8"))
m=json.loads((ROOT/"places"/"manifest.json").read_text(encoding="utf-8"))
lat,lon=LOC
dlat=RADIUS/111000
dlon=RADIUS/(111000*math.cos(lat*math.pi/180))
a0=math.floor((lat-dlat+90)/.2);a1=math.floor((lat+dlat+90)/.2)
b0=math.floor((lon-dlon+180)/.2);b1=math.floor((lon+dlon+180)/.2)
fine=m.get("fineCellDegrees") or .04
fa0=math.floor((lat-dlat+90)/fine);fa1=math.floor((lat+dlat+90)/fine)
fb0=math.floor((lon-dlon+180)/fine);fb1=math.floor((lon+dlon+180)/fine)
keys=[];all_parent_keys=[];available=set(m["cells"])
for a in range(a0,a1+1):
    for b in range(b0,b1+1):
        parent=f"{a}_{b}"
        if parent not in available:continue
        parts=m.get("splitCells",{}).get(parent) or [parent]
        all_parent_keys.extend(parts)
        for key in parts:
            sub=key.split("_")
            if len(sub)==2:
                keys.append(key);continue
            ai=a*5+int(sub[2]);bi=b*5+int(sub[3])
            if fa0<=ai<=fa1 and fb0<=bi<=fb1:keys.append(key)
loaded=[x for key in keys for x in load_key(key)]
allrows=[x for key in all_parent_keys for x in load_key(key)]
near=lambda rows:[x for x in rows if distance(lat,lon,x["lat"],x["lon"])<=RADIUS]
found=near(loaded);expected=near(allrows)
ids={x["id"] for x in found}
missing=[x for x in expected if x["id"] not in ids]
assert not missing, f"El filtro omite {len(missing)} negocios o atractivos de Las Terrenas: {missing[:2]}"
stats=collections.Counter(x["cat"] for x in found)
assert len(ids)>=500,(len(ids),stats)
assert stats["restaurantes"]>=80, stats
assert stats["discotecas"]>=4, stats
assert stats["bares"]>=20, stats
assert stats["playas"]>=30, stats
assert stats["hoteles"]>=100, stats
names={x["name"].lower() for x in found}
for title in ("Terra Bar","High Level","Night Club Niza","Gaia"):
    assert title.lower() in names, f"Falta discoteca/bar cartografiado: {title}"
print("LAS TERRENAS: OK")
print("Celdas cargadas:",len(keys),"total lugares cercanos:",len(found))
print("Categorías de interés:",{x:stats[x] for x in ["restaurantes","discotecas","bares","hoteles","playas","cafes","resorts"]})
atlas=ROOT/"photo-atlas-rd.json"
if atlas.exists():
    data=json.loads(atlas.read_text(encoding="utf-8"))
    photos=data["photos"]
    assert len(photos)==data["count"]>=500
    assert len({x["source"] for x in photos})==len(photos)
    local=[x for x in photos if distance(lat,lon,x["lat"],x["lon"])<=RADIUS]
    assert len(local)>=20, f"No hay suficientes fotos geolocalizadas cerca de Las Terrenas ({len(local)})"
    print("ATLAS OK:",len(photos),"fotos reales y",len(local),"en un radio de 12 km de Las Terrenas")

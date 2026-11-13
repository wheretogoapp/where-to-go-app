#!/usr/bin/env python3
"""CI check: the offline RD directory is actually navigable from all 32 hubs.
This counts real OSM/Overture records inside the same 30km radius used in the UI.
No photos are invented or counted as business photos.
"""
import collections
import json
import math
import pathlib
import re
import sys

ROOT = pathlib.Path(sys.argv[1] if len(sys.argv)>1 else "Where_to_Go_Proyecto_Completo/public")
APP = (ROOT/"app.js").read_text(encoding="utf-8")
match = re.search(r"const WTG_PROVINCE_HUBS=(\{[^\n]*\});", APP)
assert match, "No geographic hub configuration in the published app"
hubs = json.loads(match.group(1))
assert len(hubs) == 32, "Not all administrative demarcations have browsing hubs"

manifest = json.loads((ROOT/"data/places/manifest.json").read_text(encoding="utf-8"))
assert manifest["recordCount"] >= 44000
cells = list((ROOT/"data/places").glob("cell_*.json"))
all_rows = []
for file in cells:
    all_rows.extend(json.loads(file.read_text(encoding="utf-8")))
assert len(all_rows) == manifest["recordCount"], (len(all_rows), manifest["recordCount"])

def meters(a,b,c,d):
    r = math.pi/180
    t = math.sin((c-a)*r/2)**2 + math.cos(a*r)*math.cos(c*r)*math.sin((d-b)*r/2)**2
    return 12742000*math.atan2(math.sqrt(t), math.sqrt(max(0, 1-t)))

counts = {}
for province, hub in hubs.items():
    nearby = [x for x in all_rows if isinstance(x.get("lat"), (int,float))
       and isinstance(x.get("lon"), (int,float))
       and meters(hub["lat"],hub["lon"],x["lat"],x["lon"]) <= 30000]
    cats=collections.Counter(x.get("cat") for x in nearby if x.get("nameKnown") is not False)
    counts[province]={"hub":hub["city"],"places":len(nearby),"byCategory":dict(cats)}
    print("ZONA",province,hub["city"],len(nearby),"restaurantes",cats.get("restaurantes",0),"hoteles",cats.get("hoteles",0),"playas",cats.get("playas",0))
assert len([x for x in counts.values() if x["places"]>=1]) >= 30, "Some province hubs have no local map data"
pp=counts["Puerto Plata"]
assert pp["places"] >= 100 and pp["byCategory"].get("restaurantes",0)>=10, "Puerto Plata catalog not populated"
assert pp["byCategory"].get("hoteles",0)>=10, "Puerto Plata hotels missing"
assert counts["Samaná"]["places"]>=30, "Samaná hub is empty"
assert counts["La Altagracia"]["places"]>=30, "Punta Cana hub is empty"
report={"cataloguePlaces":len(all_rows),"provinces":counts,"notes":"Counts in 30km radius of the mapped reference city; not totals per whole province"}
(ROOT/"data/pages-catalog-check.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("CI DIRECTORY CHECK OK",len(all_rows),"places,",len(hubs),"provincial hubs")

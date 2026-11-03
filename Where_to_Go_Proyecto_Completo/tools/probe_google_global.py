#!/usr/bin/env python3
"""Bounded, opt-in worldwide Google Places (New) probe for Where to Go.

Ten cities x one Text Search API call; max five returned places each.
NEVER bulk-enriches the catalog, uploads pictures, or persists Google Places content.
Place IDs and names are included only in an ephemeral test report.
Requires GOOGLE_MAPS_API_KEY in the Actions secret; never print the key.
"""
import json
import os
import pathlib
import time
import urllib.error
import urllib.request

SAMPLES = [
    ("República Dominicana", "Puerto Plata", 19.7934, -70.6884),
    ("Colombia", "Bogotá", 4.7110, -74.0721),
    ("México", "Ciudad de México", 19.4326, -99.1332),
    ("Estados Unidos", "Miami", 25.7617, -80.1918),
    ("Brasil", "São Paulo", -23.5505, -46.6333),
    ("España", "Madrid", 40.4168, -3.7038),
    ("Japón", "Tokio", 35.6762, 139.6503),
    ("China", "Hong Kong", 22.3193, 114.1694),
    ("Canadá", "Toronto", 43.6532, -79.3832),
    ("Argentina", "Buenos Aires", -34.6037, -58.3816),
]
URL = "https://places.googleapis.com/v1/places:searchText"
MASK = ("places.id,places.displayName,places.location,places.photos,"
        "places.internationalPhoneNumber,places.websiteUri,places.formattedAddress")
key = os.environ.get("GOOGLE_MAPS_API_KEY", "")
if not key:
    raise SystemExit("FALTA GOOGLE_MAPS_API_KEY: configura un secreto GitHub Actions; no se hizo ninguna consulta ni se gastó dinero.")

results = []
for country,city,lat,lon in SAMPLES:
    body = {"textQuery": f"restaurantes en {city}",
            "languageCode": "es", "pageSize": 5,
            "locationBias":{"circle":{"center":{"latitude":lat,"longitude":lon},"radius":5000}}}
    req = urllib.request.Request(URL, data=json.dumps(body).encode("utf-8"), method="POST",
        headers={"Content-Type":"application/json","X-Goog-Api-Key":key,"X-Goog-FieldMask":MASK})
    error = ""
    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            payload = json.load(response)
        places = payload.get("places") or []
    except urllib.error.HTTPError as exc:
        raw = exc.read(3000).decode("utf-8", "replace")
        try:
            e = json.loads(raw).get("error") or {}
            error = f"HTTP {exc.code}: {e.get('status','')} {e.get('message','')[:150]}"
        except (ValueError, AttributeError):
            error = f"HTTP {exc.code}"
        places = []
    except (OSError, ValueError) as exc:
        error = type(exc).__name__ + ": " + str(exc)[:120]
        places = []
    results.append({
        "country":country, "city":city, "returned":len(places),
        "withPhoto":sum(bool(p.get("photos")) for p in places),
        "withPhone":sum(bool(p.get("internationalPhoneNumber")) for p in places),
        "withWebsite":sum(bool(p.get("websiteUri")) for p in places),
        "withCoordinates":sum(bool(p.get("location")) for p in places),
        "error":error,
        "examples":[{"name":p.get("displayName",{}).get("text",""),"photo":bool(p.get("photos")),
                     "phone":bool(p.get("internationalPhoneNumber"))} for p in places[:5]]
    })
    time.sleep(.15)
successful=sum(not x["error"] for x in results)
total=sum(x["returned"] for x in results)
report={"provider":"Google Places API (New)","sampleQueries":len(SAMPLES),
        "successfulQueries":successful,"placesReturned":total,
        "placesWithPhotos":sum(x["withPhoto"] for x in results),
        "placesWithPhones":sum(x["withPhone"] for x in results),
        "placesWithCoordinates":sum(x["withCoordinates"] for x in results),
        "warning":"Muestra pequeña de restaurantes, no una garantía para todos los lugares ni países.",
        "results":results}
print("PAÍS | CIUDAD | LUGARES | FOTO | TELÉFONO | COORDENADAS | ERROR")
for x in results:
    print(f"{x['country']} | {x['city']} | {x['returned']} | {x['withPhoto']} | {x['withPhone']} | {x['withCoordinates']} | {x['error']}")
print("RESUMEN",json.dumps({k:v for k,v in report.items() if k!="results"},ensure_ascii=False))
pathlib.Path("google-global-probe-report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
if not successful:
    raise SystemExit("La API rechazó todas las consultas. No activar en producción. Revisar facturación/clave/API.")

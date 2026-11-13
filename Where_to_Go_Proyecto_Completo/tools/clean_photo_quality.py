#!/usr/bin/env python3
"""Safely remove unrelated photo SUBJECTS from the existing public app.

Does not invent or replace photographs. The atlas is NOT evidence of a photo
of a specific business. Writes a searchable, reproducible removal report.
"""
import argparse
import collections
import datetime
import json
from pathlib import Path
from urllib.parse import unquote

from build_commons_photo_atlas import ANCHORS
from photo_subject_filter import is_tourism_subject, rejection_reason

def jsonfile(path):
    return json.loads(path.read_text(encoding="utf-8"))
def write(path,obj):
    path.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
def file_title(source):
    return unquote(str(source or "").split("/File:",1)[-1]).replace("_"," ")

def run(public):
    public=Path(public)
    data=public/"data"
    atlas_path=data/"photo-atlas-rd.json"
    gallery_path=data/"place-gallery.json"
    stats_path=data/"place-gallery-stats.json"
    manifest_path=data/"places"/"manifest.json"
    municipalities=jsonfile(data/"municipios-rd.json")
    locality_names=[a[0] for a in ANCHORS]+[a[1] for a in ANCHORS]
    locality_names.extend(p["municipio"] for p in municipalities)
    # National atlas: title must depict a place. GPS alone is not enough.
    atlas=jsonfile(atlas_path)
    old_photos=atlas.get("photos",[])
    assert len(old_photos)>500,"Refusing to modify an unexpectedly small atlas"
    kept=[];atlas_removed=[];reasons=collections.Counter()
    for p in old_photos:
        reason=rejection_reason(p.get("title"))
        if not reason and not is_tourism_subject(p.get("title"),locality_names):
            reason="unidentified_non_tourism_subject"
        if reason:
            reasons[reason]+=1
            atlas_removed.append({"title":p.get("title"),"province":p.get("province"),"reason":reason})
        else:kept.append(p)
    # Local environmental atlas is separate from verified photo galleries.
    assert len(kept)>=400,"Quality filter would leave too few authentic destination photos"
    atlas["photos"]=kept
    atlas["count"]=len(kept)
    atlas["coverageByProvince"]=dict(sorted(collections.Counter(p["province"] for p in kept).items()))
    atlas["description"]="Selección turística de fotos con GPS y licencia; NO son fotos de negocios cercanos"
    atlas["qualityRule"]="Título del archivo identifica destino/localidad; excluye ISS/satélites, animales, insectos, gráficas y material no turístico"
    atlas["qualityCheckedAt"]=datetime.datetime.now(datetime.timezone.utc).isoformat()
    if len(kept)!=len(old_photos):
        write(atlas_path,atlas)
    # Exact-place galleries: preserve legitimate buildings and landmarks, but
    # drop satellite/wildlife irrespective of Wikimedia licence or curator.
    galleries=jsonfile(gallery_path)
    gallery_removed=[]
    revised={}
    for pid,items in galleries.items():
        accepted=[]
        for p in items:
            label=file_title(p.get("source") or p.get("url"))
            reason=rejection_reason(label)
            if reason:
                gallery_removed.append({"placeId":pid,"title":label,"reason":reason})
            else:accepted.append(p)
        if accepted:revised[pid]=accepted
    if gallery_removed:write(gallery_path,revised)
    # National main covers must obey the same rejection rule as galleries.
    cover_removed=[]
    for path in sorted((data/"places").glob("cell_*.json")):
        rows=jsonfile(path)
        changed=False
        for p in rows:
            source=p.get("photoSource","")
            if not source:continue
            reason=rejection_reason(file_title(source))
            if not reason:continue
            cover_removed.append({"placeId":p.get("id"),"title":file_title(source),"reason":reason})
            for key in ("image","photoSource","photoAttribution","photoLicense"):
                p.pop(key,None)
            changed=True
        if changed:write(path,rows)
    manifest=jsonfile(manifest_path)
    if cover_removed:
        manifest["licensedPhotoCount"]=max(0,int(manifest.get("licensedPhotoCount") or 0)-len(cover_removed))
        write(manifest_path,manifest)
    stats=jsonfile(stats_path)
    stats["galleryPlaceCount"]=len(revised)
    stats["galleryImageCount"]=sum(len(items) for items in revised.values())
    curated=jsonfile(data/"place-gallery-curated.json")
    curated_sources={p["source"] for items in curated.values() for p in items}
    stats["newVerifiedGalleryPhotos"]=sum(p.get("source") not in curated_sources for items in revised.values() for p in items)
    stats["removedOffTopicPhotoSubjects"]=len(gallery_removed)
    stats["qualityCheckedAt"]=atlas["qualityCheckedAt"]
    if gallery_removed:write(stats_path,stats)
    report={"date":atlas["qualityCheckedAt"],"originalAtlasPhotos":len(old_photos),
        "rejectedAtlasPhotos":len(atlas_removed),"acceptedTouristAtlasPhotos":len(kept),
        "rejectedAtlasByReason":dict(sorted(reasons.items())),
        "removedGalleryPhotos":len(gallery_removed),"removedMainCovers":len(cover_removed),
        "galleryPhotosRemaining":stats["galleryImageCount"],
        "rejectedAtlasExamples":atlas_removed[:100],
        "removedGalleryDetails":gallery_removed,"removedCoverDetails":cover_removed,
        "rule":"No ISS/satellites, insects, fauna, logos or non-tourist subjects; no replacing photos with surroundings"}
    write(data/"photo-quality-report.json",report)
    print("AUDITORÍA VISUAL:",len(old_photos),"fotos iniciales atlas",flush=True)
    print("RETIRADAS del atlas:",len(atlas_removed),"por motivo",dict(reasons),flush=True)
    print("FOTOS TURÍSTICAS DEL ATLAS:",len(kept),"provincias",len(atlas["coverageByProvince"]),flush=True)
    print("GALERÍAS: fotos retiradas",len(gallery_removed),"restantes",stats["galleryImageCount"],flush=True)
    print("PORTADAS de fichas retiradas:",len(cover_removed),flush=True)
    print("DETALLES GALERÍA:",gallery_removed[:20],flush=True)
    return report

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--public",default="Where_to_Go_Proyecto_Completo/public")
    args=parser.parse_args()
    run(args.public)

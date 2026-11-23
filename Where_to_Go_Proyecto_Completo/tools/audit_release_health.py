#!/usr/bin/env python3
"""Structural QA with no Google paid requests, no external traffic, no data changes.

Usage: python Where_to_Go_Proyecto_Completo/tools/audit_release_health.py
The photo figures refer ONLY to bundled, audited sources. Live Google Places is
a separate provider and its current availability is not implied by this report.
"""
from __future__ import annotations
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "public"
read = lambda name: (ROOT/name).read_text(encoding="utf-8")
data = lambda name: json.loads(read("data/"+name))
index = read("index.html")
manifest = data("places/manifest.json")
heroes = data("province-heroes.json")
coverage = data("place-photo-coverage-report.json")
style_urls = re.findall(r'<link[^>]*\brel="stylesheet"[^>]*\bhref="([^"]+)"', index)
script_urls = re.findall(r'<script[^>]*\bsrc="([^"]+)"', index)
def resource_size(url: str) -> int:
    if not url.startswith("/"):
        return 0
    path = ROOT / url.lstrip("/").split("?")[0]
    return path.stat().st_size if path.exists() else 0
styles = sum(resource_size(url) for url in style_urls)
scripts = sum(resource_size(url) for url in script_urls)
missing = [url for url in style_urls+script_urls if url.startswith("/") and resource_size(url)==0]
assert not missing, f"Missing critical assets: {missing}"
assert len(heroes) == 32, f"Expected 32 demarcation cover definitions; got {len(heroes)}"
assert all(row.get("photo") and row.get("source") and row.get("license") and row.get("author")
           for row in heroes.values()), "Cover photo provenance incomplete"
assert manifest["recordCount"] == coverage["cataloguePlaces"], "National catalogue and photo report out of sync"
assert len(manifest["cells"]) >= 100, "National data tile index unexpectedly small"
assert coverage["placeIdsWithAnyVerifiedPhoto"] >= 100, "Verified place photo index unexpectedly shrank"
assert len(re.findall(r'class="mobile-tab(?:\s|")',index.split('<nav class="mobile-tabbar"',1)[1].split('</nav>',1)[0])) == 5, "Five mobile tabs required"
assert "commercial-submissions.js" in index, "Business/tour backend adapter absent"
assert "wtg-recovery-dialog" in index, "Password recovery screen absent"
assert "tour-submissions" not in read("commercial-submissions.js") or "tour_submissions" in read("commercial-submissions.js")
# A budget, not an optimization claim. Compressed transfer sizes will differ.
assert styles < 300_000, f"CSS budget exceeded: {styles}"
assert scripts < 530_000, f"JS budget exceeded: {scripts}"
assert len(index.encode("utf-8")) < 75_000, "HTML budget exceeded"
report = {
 "catalogue": {"places": manifest["recordCount"], "tiles": len(manifest["cells"])},
 "editorial_photos": {"verified_place_ids": coverage["placeIdsWithAnyVerifiedPhoto"],
                     "gallery_photos": coverage["galleryPhotoEntries"],
                     "region_covers": len(heroes)},
 "bundle_source_bytes": {"html":len(index.encode("utf-8")), "css":styles, "js":scripts,
                         "css_files":len(style_urls), "js_files":len(script_urls)},
 "notes":["Bundled photo counts do not include dynamic Google Places responses.",
          "Bundle sizes are pre-compression source bytes; measure actual device/network separately.",
          "Successful source tests do not prove Supabase SQL migrations or OAuth are active."]
}
print(json.dumps(report,ensure_ascii=False,indent=2))

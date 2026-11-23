#!/usr/bin/env python3
"""Prepare an optional Cloudflare Pages staging build. NO deployment or Cloudflare costs.
Do not change the GitHub Pages preview while Cloudflare is unconnected.
"""
import argparse
import json
import os
import pathlib
import re
from build_pages_preview import build


def prepare(output):
    source = "Where_to_Go_Proyecto_Completo/public"
    build(source, output, "")
    target = pathlib.Path(output).resolve()

    # Only a browser-restricted public Maps key is allowed in the output.
    # Never place service-role, billing keys, or backend secrets in this directory.
    key = os.environ.get("GOOGLE_MAPS_BROWSER_KEY", "").strip()
    if key:
        if not re.fullmatch(r"AIza[A-Za-z0-9_-]{25,80}", key):
            raise ValueError("Invalid public Google Maps browser key format")
        (target / "google-places-key.js").write_text(
            "window.WTG_GOOGLE_MAPS_KEY=" + json.dumps(key) + ";\n",
            encoding="utf-8",
        )
        print("Google Places browser key provided; must restrict this key by domain and API.")
    else:
        (target / "google-places-key.js").write_text(
            'window.WTG_GOOGLE_MAPS_KEY="";\n', encoding="utf-8"
        )
        print("STAGING: no Maps key configured, so Google Places is disabled, without charges.")

    # Cloudflare Pages applies the file as response headers. Never cache account data:
    # all personalized data remains served directly by authenticated Supabase APIs.
    (target / "_headers").write_text(
        """/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: camera=(), microphone=(), payment=()
  X-Robots-Tag: noindex, nofollow

/index.html
  Cache-Control: no-cache

/admin.html
  Cache-Control: no-store

/google-places-key.js
  Cache-Control: no-store

/config.js
  Cache-Control: no-cache

/data/*
  Cache-Control: public, max-age=3600, must-revalidate

/assets/*
  Cache-Control: public, max-age=86400, must-revalidate
""",
        encoding="utf-8",
    )

    html = (target / "index.html").read_text(encoding="utf-8")
    app = (target / "app.js").read_text(encoding="utf-8")
    manifest = json.loads((target / "manifest.webmanifest").read_text(encoding="utf-8"))
    assert 'src="/google-places-adapter.js' in html
    assert 'src="/auth.js' in html
    assert 'fetch(\'/data/places/manifest.json\'' in app
    assert 'data-view="tours"' in html
    assert manifest["start_url"] == "/"
    assert manifest["scope"] == "/"
    assert (target / "admin.html").exists()
    assert (target / "_headers").exists()
    assert not (target / ".env").exists()
    count = sum(1 for p in target.rglob("*") if p.is_file())
    sizes = [p.stat().st_size for p in target.rglob("*") if p.is_file()]
    assert count < 20000, "Cloudflare Pages Free static file count exceeded"
    assert max(sizes) < 25 * 1024 * 1024, "Cloudflare Pages maximum static file size exceeded"
    print(f"CDN STAGING BUILD OK: {count} files, {sum(sizes)/1e6:.1f} MB, no API calls")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="dist")
    args = parser.parse_args()
    prepare(args.output)

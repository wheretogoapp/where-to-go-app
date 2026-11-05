#!/usr/bin/env python3
"""Protect previously verified Commons images across national catalogue regenerations.

Only restores images for the SAME stable place ID, never changes the imported
coordinates, category, phone number or business name.
"""
import argparse
import json
from collections import Counter
from pathlib import Path

FIELDS = ('image', 'photoSource', 'photoAttribution')

def save(out, snapshot):
    photos = {}
    for path in sorted(Path(out).glob('cell_*.json')):
        for row in json.loads(path.read_text(encoding='utf-8')):
            if not isinstance(row, dict):
                continue
            key, src, image, credit = (row.get(k) for k in ('id', 'photoSource', 'image', 'photoAttribution'))
            if (isinstance(key, str) and isinstance(src, str)
                    and src.startswith('https://commons.wikimedia.org/wiki/File:')
                    and isinstance(image, str) and (image.startswith('https://upload.wikimedia.org/') or image.startswith('https://commons.wikimedia.org/wiki/Special:FilePath/'))
                    and isinstance(credit, str) and credit.strip()):
                photos[key] = {field: row[field] for field in FIELDS}
    Path(snapshot).write_text(json.dumps(photos, ensure_ascii=False), encoding='utf-8')
    print('Fotografías verificadas guardadas:', len(photos))

def restore(out, snapshot):
    source = Path(snapshot)
    if not source.exists():
        raise SystemExit('Falta el respaldo de fotos; no se publicará el catálogo')
    photos = json.loads(source.read_text(encoding='utf-8'))
    allrows, restored = [], 0
    for path in sorted(Path(out).glob('cell_*.json')):
        cell = json.loads(path.read_text(encoding='utf-8'))
        changed = False
        for row in cell:
            if not isinstance(row, dict):
                continue
            allrows.append(row)
            old = photos.get(row.get('id'))
            if old and not row.get('photoSource'):
                row.update(old)
                restored += 1
                changed = True
        if changed:
            path.write_text(json.dumps(cell, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    manifest_path = Path(out) / 'manifest.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
    if manifest.get('recordCount') != len(allrows):
        raise SystemExit('El recuento de lugares no coincide; no se publicará')
    verified = [r for r in allrows if r.get('photoSource') and r.get('image')]
    manifest['licensedPhotoCount'] = len(verified)
    manifest['photoCoverageByCategory'] = dict(sorted(Counter(r.get('cat') for r in verified).items()))
    manifest['photoPreservedAcrossImports'] = restored
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    print('Fotos conservadas:', restored, '/ fotos verificadas:', len(verified))

def main():
    p = argparse.ArgumentParser()
    p.add_argument('mode', choices=('snapshot', 'restore'))
    p.add_argument('--out', required=True)
    p.add_argument('--snapshot', required=True)
    a = p.parse_args()
    (save if a.mode == 'snapshot' else restore)(a.out, a.snapshot)

if __name__ == '__main__':
    main()

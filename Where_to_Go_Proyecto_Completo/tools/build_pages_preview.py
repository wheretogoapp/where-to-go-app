#!/usr/bin/env python3
"""Build an optional static mobile preview for GitHub Pages.
Does not change the Netlify production files or publish private files.
"""
import argparse, json, pathlib, re, shutil
def build(source,destination,prefix):
    source=pathlib.Path(source).resolve()
    destination=pathlib.Path(destination).resolve()
    if destination.exists():shutil.rmtree(destination)
    shutil.copytree(source,destination,ignore=shutil.ignore_patterns('*.map'))
    # Static URLs in this app use the origin root. On project Pages, root is
    # /where-to-go-app/, so rewrite only same-site paths, never external URLs.
    static=re.compile(r"(?P<q>['\"])/(?P<path>(?:assets/|data/|[a-zA-Z0-9_-]+\.(?:js|css|html|webmanifest|png|svg|ico))[^'\"]*)")
    processed=0
    for file in destination.rglob("*"):
        if not file.is_file() or file.suffix not in ('.html','.css','.js','.webmanifest','.json'):continue
        content=file.read_text(encoding='utf-8')
        updated=static.sub(lambda m:m.group('q')+prefix+'/'+m.group('path'),content)
        # Dynamic JS template literals must also point inside the GitHub Pages
        # project directory. Without this, manifest loads but every cell tile
        # fetches /data/places/cell_... from domain root and returns 404.
        if file.suffix=='.js':
            updated=updated.replace('`/data/', '`'+prefix+'/data/').replace('`/assets/', '`'+prefix+'/assets/')
        if file.name=='manifest.webmanifest':
            data=json.loads(updated)
            data['start_url']=prefix+'/'
            data['scope']=prefix+'/'
            updated=json.dumps(data,ensure_ascii=False,indent=2)
        if file.name=='app.js':
            # No Netlify Forms backend and no SW at this GitHub project subpath.
            updated=updated.replace("navigator.serviceWorker.register('"+prefix+"/service-worker.js').catch(()=>{})","navigator.serviceWorker.getRegistrations().then(rs=>rs.filter(r=>r.scope.includes('"+prefix+"/')).forEach(r=>r.unregister())).catch(()=>{})")
        if file.name=='index.html':
            updated=updated.replace('</head>','<meta name="robots" content="noindex" /></head>')
        if updated!=content:
            file.write_text(updated,encoding='utf-8')
            processed+=1
    (destination/'.nojekyll').write_text('',encoding='utf-8')
    html=(destination/'index.html').read_text(encoding='utf-8')
    assert prefix+'/app.js' in html
    app=(destination/'app.js').read_text(encoding='utf-8')
    assert '`'+prefix+'/data/places/cell_${key}.json' in app, 'FATAL: las celdas siguen apuntando a /data en la raíz'
    assert "fetch('"+prefix+"/data/places/manifest.json'" in app, 'FATAL: manifest fuera de GitHub Pages'
    assert 'data-view="tours"' in html, 'Falta Tours en navegación móvil'
    assert (destination/'data'/'photo-atlas-rd.json').exists()
    atlas=json.loads((destination/'data'/'photo-atlas-rd.json').read_text(encoding='utf-8'))
    assert atlas['count']>=500
    print('PREVIEW GitHub Pages preparado:',processed,'archivos de referencias; fotos=',atlas['count'])
if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--source',default='Where_to_Go_Proyecto_Completo/public')
    p.add_argument('--output',default='/tmp/where-to-go-pages')
    p.add_argument('--prefix',default='/where-to-go-app')
    x=p.parse_args();build(x.source,x.output,x.prefix)

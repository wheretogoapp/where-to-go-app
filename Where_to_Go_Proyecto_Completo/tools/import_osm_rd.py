#!/usr/bin/env python3
"""Where to Go: verified-source, offline first Dominican directory from OSM.

Does not synthesize POIs or photos. Does not publish unverified user submissions.
Source: Geofabrik OpenStreetMap (ODbL), filtered to Dominican Republic border.
"""
import argparse, collections, datetime, json, math, re, unicodedata
from pathlib import Path
from shapely.geometry import Point, shape
from shapely.prepared import prep
import osmium

GRID=0.2
RD_BBOX=(17.15,20.20,-72.1,-68.0)

def clean(v, n=200):return str(v or '').strip()[:n]

def get_categories(tags):
    a=tags.get('amenity','');t=tags.get('tourism','');l=tags.get('leisure','');n=tags.get('natural','');s=tags.get('shop','');o=tags.get('office','');h=tags.get('healthcare','');c=tags.get('craft','')
    if n=='waterfall' or tags.get('waterway')=='waterfall':return 'cascadas'
    if l=='swimming_area':return 'balnearios'
    if n=='beach' or l=='beach':return 'playas'
    if n=='water' and tags.get('water') in ('lake','lagoon','reservoir'):return 'lagunas'
    if tags.get('waterway')=='river':return 'rios'
    if tags.get('route')=='hiking':return 'senderismo'
    if l=='swimming_pool':return 'piscinas'
    if t=='resort' or l=='resort':return 'resorts'
    if t in ('villa','apartment') or tags.get('building')=='villa':return 'villas'
    if t in ('hotel','hostel','guest_house','motel','chalet','camp_site'):return 'hoteles'
    if a=='taxi' or o=='transport' or tags.get('taxi')=='yes':return 'taxis'
    if a=='fuel':return 'gasolineras'
    if a=='bank':return 'bancos'
    if a=='atm':return 'cajeros'
    if a=='pharmacy' or s=='chemist':return 'farmacias'
    if a in ('hospital','clinic','doctors') or h in ('hospital','clinic','doctor'):return 'hospitales'
    if a=='dentist' or h=='dentist':return 'odontologia'
    if a=='veterinary' or h=='veterinary':return 'veterinarias'
    if a in ('school','kindergarten','college'):return 'escuelas'
    if a=='place_of_worship':return 'iglesias'
    if a in ('fast_food','food_court'):return 'comidarapida'
    if a=='restaurant':return 'restaurantes'
    if a in ('bar','pub','biergarten'):return 'bares'
    if a=='nightclub':return 'discotecas'
    if a=='ice_cream' or s=='ice_cream':return 'heladerias'
    if a=='cafe' or s=='coffee':return 'cafes'
    if s in ('bakery','pastry'):return 'panaderias'
    if s in ('fishmonger','seafood'):return 'pescaderias'
    if s=='supermarket':return 'supermercados'
    if s in ('convenience','general','kiosk'):return 'colmados'
    if a=='marketplace' or s=='greengrocer':return 'mercados'
    if s in ('hardware','doityourself','building_materials'):return 'ferreterias'
    if s in ('electronics','mobile_phone','computer'):return 'tecnologia'
    if s in ('appliance','electrical'):return 'electrodomesticos'
    if s in ('barber','barber_shop') or s=='hairdresser' and tags.get('hairdresser:gender')=='male':return 'barberias'
    if s in ('hairdresser','beauty'):return 'salones'
    if s in ('nails','nail_salon') or tags.get('beauty')=='nails':return 'unas'
    if s in ('massage','spa') or l=='spa':return 'spas'
    if l=='fitness_centre' or s=='sports' or a=='gym':return 'gimnasios'
    if s in ('pet','pet_grooming'):return 'mascotas'
    if s in ('car_repair','car_parts') or c in ('carpenter','mechanic'):return 'talleres'
    if s=='car_wash' or a=='car_wash':return 'lavaderos'
    if s in ('laundry','dry_cleaning'):return 'lavanderias'
    if o in ('accountant','lawyer','insurance','estate_agent','travel_agent','consulting'):return 'servicios'
    if l in ('park','garden','nature_reserve'):return 'parques'
    if l=='playground' or a=='childcare':return 'infantil'
    if l in ('sports_centre','stadium','pitch'):return 'deportes'
    if a in ('cinema','theatre') or l in ('water_park','amusement_arcade','theme_park'):return 'entretenimiento'
    if t in ('attraction','viewpoint','museum') or tags.get('historic'):return 'atracciones'
    if s and s not in ('vacant','no'):return 'tiendas'
    return None

def country_polygon(path):
    doc=json.loads(Path(path).read_text(encoding='utf-8'))
    features=doc.get('features',[])
    for row in features:
        props=row.get('properties',{})
        values=[str(v).casefold() for v in props.values() if isinstance(v,(str,int))]
        if any(v in ('dom','do','dominican republic','república dominicana','republica dominicana') for v in values):
            geom=shape(row['geometry'])
            if geom.is_empty:raise ValueError('Empty DOM geometry')
            return prep(geom)
    raise RuntimeError('El archivo de fronteras NO identifica República Dominicana. No se importará Haití por error.')

class Collector(osmium.SimpleHandler):
    def __init__(self,polygon):
        super().__init__()
        self.polygon=polygon
        self.cells=collections.defaultdict(list)
        self.category_counts=collections.Counter()
        self.ids=set();self.dedupe=set()
        self.rivers=0
    def add(self,obj,kind,lat,lon,accuracy):
        if not math.isfinite(lat) or not math.isfinite(lon):return
        s,n,w,e=RD_BBOX
        if not (s<=lat<=n and w<=lon<=e):return
        if not self.polygon.covers(Point(lon,lat)):return
        tags=dict(obj.tags)
        cat=get_categories(tags)
        name=clean(tags.get('name:es') or tags.get('name') or tags.get('brand'),130)
        if not cat or not name:return
        place_id=f'osm-{kind}-{obj.id}'
        if place_id in self.ids:return
        self.ids.add(place_id)
        # some OSM businesses are mapped as a node and an area; fold near-identical entries
        unique=(cat,unicodedata.normalize('NFKD',name).casefold(),round(lat,4),round(lon,4))
        if unique in self.dedupe:return
        self.dedupe.add(unique)
        cell=f'{math.floor((lat+90)/GRID)}_{math.floor((lon+180)/GRID)}'
        record={'id':place_id,'name':name,'cat':cat,'lat':round(lat,7),'lon':round(lon,7),
            'address':clean(' '.join(x for x in [tags.get('addr:street',''),tags.get('addr:housenumber','')] if x),145),
            'phone':clean(tags.get('contact:phone') or tags.get('phone'),60),
            'website':clean(tags.get('contact:website') or tags.get('website'),230),
            'image':clean(tags.get('image'),280),'wikimedia_commons':clean(tags.get('wikimedia_commons'),170),
            'wikidata':clean(tags.get('wikidata'),24),
            'accuracy':accuracy,'sourceUrl':f'https://www.openstreetmap.org/{kind}/{obj.id}'}
        self.cells[cell].append(record);self.category_counts[cat]+=1
    def node(self,obj):
        if obj.location.valid():self.add(obj,'node',obj.location.lat,obj.location.lon,'Punto cartográfico OSM; verifica el acceso')
    def way(self,obj):
        tags=dict(obj.tags)
        if not (tags.get('name') or tags.get('brand')) or not get_categories(tags):return
        coords=[(n.lat,n.lon) for n in obj.nodes if n.location.valid()]
        if len(coords)<2:return
        lat=sum(x for x,_ in coords)/len(coords)
        lon=sum(x for _,x in coords)/len(coords)
        self.add(obj,'way',lat,lon,'Centro cartográfico del área o tramo OSM; NO indica necesariamente la entrada')
    def relation(self,obj):
        # Relation geometry without polygon processing is not an exact point. Skip; don't invent coords.
        pass

def run(pbf,countries,out):
    polygon=country_polygon(countries)
    handler=Collector(polygon)
    handler.apply_file(str(pbf),locations=True,idx='flex_mem')
    out=Path(out);out.mkdir(parents=True,exist_ok=True)
    total=sum(map(len,handler.cells.values()))
    if total<100:
        raise RuntimeError(f'Importación insuficiente: {total} negocios. No sustituir catálogo con datos parciales.')
    for f in out.glob('cell_*.json'):f.unlink()
    for cell,entries in sorted(handler.cells.items()):
        entries.sort(key=lambda r:(r['cat'],r['name']))
        (out/f'cell_{cell}.json').write_text(json.dumps(entries,ensure_ascii=False,separators=(',',':')),'utf8')
    manifest={'version':5,'updatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
      'source':'© OpenStreetMap contributors · ODbL / Geofabrik','recordCount':total,
      'categories':dict(sorted(handler.category_counts.items())), 'cells':sorted(handler.cells),
      'license':'https://www.openstreetmap.org/copyright',
      'note':'Los puntos de áreas y ríos NO son entradas confirmadas. Teléfonos e imágenes son opcionales.'}
    (out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),'utf8')
    print('IMPORTACIÓN OK:',total,'lugares reales con ID OSM,',len(handler.cells),'celdas. Categorías:',handler.category_counts.most_common(15))
if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--pbf',required=True);p.add_argument('--countries',required=True);p.add_argument('--out',default='public/data/places')
    a=p.parse_args();run(a.pbf,a.countries,a.out)

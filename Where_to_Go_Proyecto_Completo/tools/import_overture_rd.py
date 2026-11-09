#!/usr/bin/env python3
"""Opt-in second source for Where to Go, with dedupe and DR border checks.

Requires a real Overture Maps GeoJSON/GeoJSONSeq PLACES export. No data is invented.
The October 2026 schema uses taxonomy / basic_category (NOT old categories).
Credits: Overture Maps / data providers under source-specific terms.
"""
import argparse,collections,datetime,json,math,re,unicodedata
from pathlib import Path
from shapely.geometry import Point,shape
from shapely.prepared import prep

GRID=.2
RD_BBOX=(17.1,20.25,-72.15,-68.0)

def normalized(v):
    s=unicodedata.normalize('NFD',str(v or '').lower())
    return re.sub(r'[^a-z0-9]+','', ''.join(c for c in s if not unicodedata.combining(c)))

def get_region(path):
    for f in json.loads(Path(path).read_text(encoding='utf8')).get('features',[]):
        vals=[str(v).casefold() for v in f.get('properties',{}).values() if isinstance(v,(str,int))]
        if any(s in ('dom','do','dominican republic','republica dominicana','república dominicana') for s in vals):
            return prep(shape(f['geometry']))
    raise RuntimeError('No se identificó la frontera RD. No publicaremos registros de Haití.')

def category(p):
    # Mapping broad enough for local business discovery, narrow enough to avoid fake classifications.
    tax=p.get('taxonomy') or {}
    hierarchy=tax.get('hierarchy') if isinstance(tax,dict) else []
    labels=[str(x).lower() for x in (hierarchy or [])]
    labels += [str(tax.get('primary') or '').lower()] if isinstance(tax,dict) else []
    labels += [str(p.get('basic_category') or '').lower()]
    s=' '.join(labels)
    rules=[
      ('cascadas',['waterfall']),('rios',['river','stream']),('balnearios',['swimming_hole']),('lagunas',['lagoon','lake']),
      ('playas',['beach']),('parques',['park','garden','nature_reserve']),('senderismo',['hiking','trailhead']),
      ('resorts',['resort']),('villas',['villa','vacation_rental']),('hoteles',['hotel','hostel','motel','lodging','guest_house']),
      ('restaurantes',['restaurant','eatery','diner','steakhouse','pizzeria','sushi','buffet']),
      ('bares',['bar','pub','cocktail','taproom']),('discotecas',['nightclub','dance_club']),('cafes',['cafe','coffee_shop','tea_house']),
      ('heladerias',['ice_cream','frozen_yogurt']),('panaderias',['bakery','pastry']),('pescaderias',['fishmonger','seafood_market']),
      ('comidarapida',['fast_food','food_truck','food_court']),('supermercados',['supermarket','grocery_store']),
      ('colmados',['convenience_store','corner_store']),('mercados',['marketplace','farmers_market']),
      ('ferreterias',['hardware_store','building_materials']),('electrodomesticos',['appliance_store']),('tecnologia',['electronics_store','computer_store','mobile_phone_store']),
      ('barberias',['barber_shop','barbershop']),('unas',['nail_salon']),('salones',['beauty_salon','hair_salon','hairdresser']),
      ('spas',['spa','massage']),('gimnasios',['gym','fitness_centre','fitness_center']),('tiendas',['clothing_store','retail_store','shoe_store','department_store','boutique']),
      ('taxis',['taxi_service','transportation_service','car_service']),('gasolineras',['gas_station','fuel_station']),
      ('talleres',['auto_repair','mechanic','car_repair']),('lavaderos',['car_wash']),('farmacias',['pharmacy','drugstore']),
      ('hospitales',['hospital','medical_clinic','healthcare_clinic']),('odontologia',['dentist','dental_clinic']),
      ('veterinarias',['veterinary','vet_clinic']),('mascotas',['pet_store']),('bancos',['bank']),('cajeros',['atm']),
      ('lavanderias',['laundry','dry_cleaning']),('servicios',['accountant','law_firm','real_estate_agency']),
      ('escuelas',['school','university','college']),('iglesias',['church','temple','place_of_worship']),
      ('piscinas',['swimming_pool']),('infantil',['playground','children_museum']),('deportes',['stadium','sports_centre']),
      ('entretenimiento',['cinema','theater','amusement_park','water_park']),('atracciones',['attraction','landmark','museum','historic_site','viewpoint'])]
    # Exact word/token boundary match protects "bar" from "barber_shop".
    toks=set(re.findall(r'[a-z0-9_]+',s))
    for dest,needles in rules:
        if any(x in toks for x in needles):return dest
    return None

def features(path):
    with open(path,encoding='utf-8') as f:
        header=f.read(240);f.seek(0)
        if header.lstrip().startswith('{"type": "FeatureCollection"') or '"FeatureCollection"' in header:
            for x in json.load(f).get('features',[]):yield x
        else:
            for line in f:
                line=line.strip().lstrip('\x1e')
                if line:yield json.loads(line)

def run(args):
    inside=get_region(args.countries)
    out=Path(args.out);mf=out/'manifest.json';m=json.loads(mf.read_text(encoding='utf8'))
    if not m.get('cells') or m.get('recordCount',0)<1:raise RuntimeError('Importar primero OpenStreetMap. No crear un catálogo vacío.')
    cache={};seen=set();by_index=collections.defaultdict(list)
    for parent in m['cells']:
      for key in (m.get('splitCells',{}).get(parent) or [parent]):
        file=out/f'cell_{key}.json';cache[key]=json.loads(file.read_text(encoding='utf8'))
        for x in cache[key]:
            if x.get('name') and x.get('nameKnown') is not False:
                k=(x['cat'],normalized(x['name']))
                by_index[k].append((x['lat'],x['lon'],x))
            seen.add(x['id'])
    count=0;dup=0;filtered=0;stats=collections.Counter()
    for f in features(args.input):
        props=f.get('properties') or {};geo=f.get('geometry') or {}
        coords=geo.get('coordinates') or []
        if geo.get('type')!='Point' or len(coords)<2:continue
        lon,lat=coords[:2]
        if not all(isinstance(x,(int,float)) and math.isfinite(x) for x in (lon,lat)):continue
        south,north,west,east=RD_BBOX
        if not(south<=lat<=north and west<=lon<=east and inside.covers(Point(lon,lat))):continue
        confidence=props.get('confidence')
        if confidence is not None and float(confidence)<args.min_confidence:filtered+=1;continue
        if props.get('operating_status') in ('permanently_closed','closed'):continue
        cat=category(props);names=props.get('names') or {};name=(names.get('primary') if isinstance(names,dict) else '') or ''
        if not cat or not name.strip() or not props.get('id'):continue
        name=name.strip()[:130];idx=(cat,normalized(name));pid='overture-'+str(props['id'])
        if pid in seen:continue
        # Strong duplicate: same name/category within ~105 meters. Preserve OSM record and enrich only missing contact fields.
        matched=None
        for olat,olon,row in by_index.get(idx,[]):
            if abs(olat-lat)>.0012 or abs(olon-lon)>.0012:continue
            dx=(olon-lon)*111000*math.cos(math.radians(lat));dy=(olat-lat)*111000
            if dx*dx+dy*dy<=105**2:matched=row;break
        phones=props.get('phones') or [];sites=props.get('websites') or [];addr=props.get('addresses') or []
        phone=str(phones[0])[:45] if phones else '';website=str(sites[0])[:300] if sites else ''
        if not website.startswith('https://'):website=''
        address=(addr[0].get('freeform') or addr[0].get('locality') or '') if addr and isinstance(addr[0],dict) else ''
        if matched:
            dup+=1
            if not matched.get('phone') and phone:matched['phone']=phone
            if not matched.get('website') and website:matched['website']=website
            continue
        row={'id':pid,'name':name,'nameKnown':True,'cat':cat,'lat':lat,'lon':lon,'address':str(address)[:180],'phone':phone,
             'website':website,'source':'overture','sourceUrl':'https://docs.overturemaps.org/guides/places/',
             'confidence':confidence,'accuracy':'Punto catalogado por Overture Maps; confirmar entrada',
             'image':'','photoSource':'','photoAttribution':''}
        parent=f'{int(math.floor((lat+90)/GRID))}_{int(math.floor((lon+180)/GRID))}'
        split=m.get('splitCells',{}).get(parent)
        if split:
            base_a,base_b=(int(x) for x in parent.split('_'))
            a=max(0,min(4,int(math.floor((lat+90)/(GRID/5))-base_a*5)))
            b=max(0,min(4,int(math.floor((lon+180)/(GRID/5))-base_b*5)))
            key=next((t for t in split if t.startswith(f'{parent}_{a}_{b}_')),None)
            if not key:
                key=f'{parent}_{a}_{b}_0'
                split.append(key)
        else:
            key=parent
        cache.setdefault(key,[]).append(row);by_index[idx].append((lat,lon,row));seen.add(pid);stats[cat]+=1;count+=1
    if count:
        # Repartition the merged catalogue so phones do not need to fetch a
        # multi-megabyte city tile just to display nearby restaurants and nightlife.
        grouped=collections.defaultdict(list)
        for rows in cache.values():
            for x in rows:
                key=f"{math.floor((x['lat']+90)/GRID)}_{math.floor((x['lon']+180)/GRID)}"
                grouped[key].append(x)
        old_count=sum(map(len,cache.values()))
        if sum(map(len,grouped.values()))!=old_count:raise RuntimeError('Pérdida de lugares al reagrupar')
        split_cells={}
        sizes=[]
        for f in out.glob('cell_*.json'):f.unlink()
        def save_tile(key,rows):
            content=json.dumps(rows,ensure_ascii=False,separators=(',',':'))
            data=content.encode('utf-8')
            if len(data)>220000:raise RuntimeError('Subzona supera 220 KB: '+key)
            (out/f'cell_{key}.json').write_bytes(data)
            sizes.append(len(data))
        for parent,rows in sorted(grouped.items()):
            rows.sort(key=lambda x:(x['cat'],x['name']))
            content=json.dumps(rows,ensure_ascii=False,separators=(',',':')).encode('utf-8')
            if len(content)<=220000:
                save_tile(parent,rows)
                continue
            pa,pb=(int(n) for n in parent.split('_'))
            fine=collections.defaultdict(list)
            for row in rows:
                a=max(0,min(4,math.floor((row['lat']+90)/(GRID/5))-pa*5))
                b=max(0,min(4,math.floor((row['lon']+180)/(GRID/5))-pb*5))
                fine[(a,b)].append(row)
            split_cells[parent]=[]
            for (a,b),group in sorted(fine.items()):
                partial=[];used=2;part=0
                for row in group:
                    length=len(json.dumps(row,ensure_ascii=False,separators=(',',':')).encode('utf-8'))+1
                    if partial and used+length>220000:
                        key=f'{parent}_{a}_{b}_{part}'
                        save_tile(key,partial);split_cells[parent].append(key)
                        partial=[];used=2;part+=1
                    partial.append(row);used+=length
                if partial:
                    key=f'{parent}_{a}_{b}_{part}'
                    save_tile(key,partial);split_cells[parent].append(key)
        m['version']=6
        m['cells']=sorted(grouped)
        m['splitCells']=split_cells
        m['fineCellDegrees']=GRID/5
        m['recordCount']=old_count
        m['updatedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat()
        m['sources']=['Geofabrik / OpenStreetMap','Overture Maps']
        by_cat=collections.Counter()
        for items in grouped.values():by_cat.update(x['cat'] for x in items)
        m['categories']=dict(sorted(by_cat.items()))
        m['overtureAdded']=count;m['overtureDuplicates']=dup
        m['overtureAddedByCategory']=dict(sorted(stats.items()))
        m['maxCellBytes']=max(sizes,default=0)
        mf.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print('Overture incorporados:',count,'duplicados:',dup,'filtrados baja confianza:',filtered,'total:',m['recordCount'])

if __name__=='__main__':
    ap=argparse.ArgumentParser()
    ap.add_argument('--input',required=True);ap.add_argument('--out',required=True);ap.add_argument('--countries',required=True)
    ap.add_argument('--min-confidence',type=float,default=.65)
    run(ap.parse_args())

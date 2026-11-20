/* Offline starter geography. City centers are navigation anchors, not business listings.
 * ISO country codes and named places; no invented photos or POIs.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.WTG_GEOGRAPHY=api;})(typeof window!=='undefined'?window:null,function(){
 const places={
 DO:[["Azua de Compostela","Azua",18.455,-70.73],["Neyba","Baoruco",18.482,-71.417],["Barahona","Barahona",18.211,-71.101],["Dajabón","Dajabón",19.547,-71.704],["Santo Domingo","Distrito Nacional",18.4861,-69.9312],["San Francisco de Macorís","Duarte",19.301,-70.253],["Santa Cruz de El Seibo","El Seibo",18.771,-69.04],["Comendador","Elías Piña",18.877,-71.702],["Moca","Espaillat",19.395,-70.523],["Hato Mayor del Rey","Hato Mayor",18.767,-69.257],["Salcedo","Hermanas Mirabal",19.378,-70.415],["Jimaní","Independencia",18.49,-71.851],["Punta Cana","La Altagracia",18.5586,-68.3694],["La Romana","La Romana",18.4273,-68.9728],["La Vega","La Vega",19.224,-70.531],["Nagua","María Trinidad Sánchez",19.383,-69.847],["Bonao","Monseñor Nouel",18.943,-70.409],["Monte Cristi","Monte Cristi",19.845,-71.647],["Monte Plata","Monte Plata",18.807,-69.784],["Pedernales","Pedernales",18.036,-71.743],["Baní","Peravia",18.279,-70.331],["Puerto Plata","Puerto Plata",19.7934,-70.6884],["Samaná","Samaná",19.204,-69.337],["San Cristóbal","San Cristóbal",18.417,-70.11],["San José de Ocoa","San José de Ocoa",18.548,-70.507],["San Juan de la Maguana","San Juan",18.808,-71.227],["San Pedro de Macorís","San Pedro de Macorís",18.454,-69.307],["Cotuí","Sánchez Ramírez",19.052,-70.151],["Santiago","Santiago",19.4517,-70.697],["San Ignacio de Sabaneta","Santiago Rodríguez",19.476,-71.343],["Santo Domingo Este","Santo Domingo",18.486,-69.852],["Mao","Valverde",19.552,-71.078],["Sosúa","Puerto Plata",19.7683,-70.5199],["Cabarete","Puerto Plata",19.7496,-70.4139],["Las Terrenas","Samaná",19.311,-69.543],["El Limón","Samaná",19.27,-69.447],["Punta Cana","La Altagracia",18.5586,-68.3694],["Bávaro","La Altagracia",18.6862,-68.4198],["Verón–Punta Cana","La Altagracia",18.58182,-68.40431],["Santiago de los Caballeros","Santiago",19.4517,-70.697],["Santo Domingo de Guzmán","Distrito Nacional",18.4861,-69.9312]],
 CU:[['La Habana','La Habana',23.1136,-82.3666],['Santiago de Cuba','Santiago de Cuba',20.0247,-75.8219],['Camagüey','Camagüey',21.3808,-77.9169],['Holguín','Holguín',20.8872,-76.2631],['Santa Clara','Villa Clara',22.4069,-79.9647],['Cienfuegos','Cienfuegos',22.1496,-80.4466],['Matanzas','Matanzas',23.0411,-81.5775],['Pinar del Río','Pinar del Río',22.4175,-83.6981],['Trinidad','Sancti Spíritus',21.8042,-79.9844],['Baracoa','Guantánamo',20.3471,-74.4958]],
 AL:[['Tirana','Tirana',41.3275,19.8187],['Durrës','Durrës',41.3231,19.4414],['Vlorë','Vlorë',40.4661,19.4914],['Shkodër','Shkodër',42.0683,19.5126],['Berat','Berat',40.7058,19.9522],['Korçë','Korçë',40.6186,20.7808],['Sarandë','Vlorë',39.8756,20.0053],['Gjirokastër','Gjirokastër',40.0758,20.1389]],
 US:[['New York','New York',40.7128,-74.006],['Los Angeles','California',34.0522,-118.2437],['Miami','Florida',25.7617,-80.1918],['Chicago','Illinois',41.8781,-87.6298],['San Francisco','California',37.7749,-122.4194],['Washington','District of Columbia',38.9072,-77.0369]],
 CO:[['Bogotá','Bogotá D.C.',4.711,-74.0721],['Medellín','Antioquia',6.2442,-75.5812],['Cartagena','Bolívar',10.391,-75.4794],['Cali','Valle del Cauca',3.4516,-76.532],['Barranquilla','Atlántico',10.9685,-74.7813]],
 ES:[['Madrid','Comunidad de Madrid',40.4168,-3.7038],['Barcelona','Cataluña',41.3874,2.1686],['Valencia','Comunidad Valenciana',39.4699,-0.3763],['Sevilla','Andalucía',37.3891,-5.9845],['Málaga','Andalucía',36.7213,-4.4214]],
 MX:[['Ciudad de México','Ciudad de México',19.4326,-99.1332],['Guadalajara','Jalisco',20.6597,-103.3496],['Monterrey','Nuevo León',25.6866,-100.3161],['Cancún','Quintana Roo',21.1619,-86.8515],['Mérida','Yucatán',20.9674,-89.5926]],
 BR:[['Rio de Janeiro','Rio de Janeiro',-22.9068,-43.1729],['São Paulo','São Paulo',-23.5505,-46.6333],['Salvador','Bahia',-12.9777,-38.5016],['Brasília','Distrito Federal',-15.7939,-47.8828]],
 FR:[['Paris','Île-de-France',48.8566,2.3522],['Lyon','Auvergne-Rhône-Alpes',45.764,4.8357],['Marseille','Provence-Alpes-Côte d’Azur',43.2965,5.3698],['Nice','Provence-Alpes-Côte d’Azur',43.7102,7.262]],
 GB:[['London','England',51.5072,-0.1276],['Edinburgh','Scotland',55.9533,-3.1883],['Manchester','England',53.4808,-2.2426],['Liverpool','England',53.4084,-2.9916]],
 IT:[['Roma','Lazio',41.9028,12.4964],['Milano','Lombardia',45.4642,9.19],['Firenze','Toscana',43.7696,11.2558],['Venezia','Veneto',45.4408,12.3155]],
 JP:[['Tokyo','Tokyo',35.6762,139.6503],['Kyoto','Kyoto',35.0116,135.7681],['Osaka','Osaka',34.6937,135.5023],['Hiroshima','Hiroshima',34.3853,132.4553]],
 CA:[['Toronto','Ontario',43.6532,-79.3832],['Vancouver','British Columbia',49.2827,-123.1207],['Montréal','Québec',45.5019,-73.5674]],
 AR:[['Buenos Aires','Ciudad Autónoma de Buenos Aires',-34.6037,-58.3816],['Córdoba','Córdoba',-31.4201,-64.1888],['Mendoza','Mendoza',-32.8895,-68.8458]],
 PE:[['Lima','Lima',-12.0464,-77.0428],['Cusco','Cusco',-13.5319,-71.9675],['Arequipa','Arequipa',-16.409,-71.5375]],
 CL:[['Santiago','Región Metropolitana',-33.4489,-70.6693],['Valparaíso','Valparaíso',-33.0472,-71.6127]],
 AU:[['Sydney','New South Wales',-33.8688,151.2093],['Melbourne','Victoria',-37.8136,144.9631]],
 ZA:[['Cape Town','Western Cape',-33.9249,18.4241],['Johannesburg','Gauteng',-26.2041,28.0473]],
 EG:[['Cairo','Cairo',30.0444,31.2357],['Alexandria','Alexandria',31.2001,29.9187]],
 AE:[['Dubai','Dubai',25.2048,55.2708],['Abu Dhabi','Abu Dhabi',24.4539,54.3773]],
 IN:[['Mumbai','Maharashtra',19.076,72.8777],['New Delhi','Delhi',28.6139,77.209],['Jaipur','Rajasthan',26.9124,75.7873]],
 TH:[['Bangkok','Bangkok',13.7563,100.5018],['Chiang Mai','Chiang Mai',18.7883,98.9853]],
 MA:[['Marrakech','Marrakech-Safi',31.6295,-7.9811],['Casablanca','Casablanca-Settat',33.5731,-7.5898]],
 TR:[['Istanbul','Istanbul',41.0082,28.9784],['Ankara','Ankara',39.9334,32.8597]],
 CR:[['San José','San José',9.9281,-84.0907],['Liberia','Guanacaste',10.635,-85.4377]],
 PA:[['Ciudad de Panamá','Panamá',8.9824,-79.5199],['David','Chiriquí',8.4273,-82.4308]],
 JM:[['Kingston','Surrey',17.9712,-76.7936],['Montego Bay','Saint James',18.4762,-77.8939]]
 };
 function cities(code){return (places[String(code||'').toUpperCase()]||[]).map(([city,region,lat,lon])=>({city,region,lat,lon}))}
 function regions(code){return [...new Set(cities(code).map(p=>p.region))].sort()}
 return Object.freeze({cities,regions,countryCount:()=>Object.keys(places).length});
});

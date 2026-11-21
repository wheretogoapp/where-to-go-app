# Where to Go — Auditoría estructural de las 32 demarcaciones de República Dominicana

**Fecha de revisión:** 2026-11-21

## Alcance y límites
Auditoría de archivos versionados del proyecto, sin consumir llamadas pagadas de Google Places ni modificar fichas de negocios. Se comprueban el índice cartográfico nacional, el directorio de municipios, las portadas provinciales y el atlas de escenas de Wikimedia Commons. **No es una medición de disponibilidad actual de Google Places, fotos de negocios, teléfonos, horarios o experiencias en el dispositivo.** La vista con resultados que el propietario probó satisfactoriamente debe preservarse.

## Cifras verificadas en el código
- **44,696 lugares** según `public/data/places/manifest.json` (fecha del índice: 2026-11-09T13:33:56.555617+00:00).
- **158 municipios** representados en **32 demarcaciones** (31 provincias y Distrito Nacional).
- **32 portadas** con foto y fuente declaradas (autor y licencia incluidos).
- **1,234 imágenes del entorno** en el atlas `photo-atlas-rd.json`. **No deben usarse como fotografías de negocios distintos.**
- **106 fichas de selección fotográfica piloto** (catálogo independiente del atlas).
- **0 imágenes del atlas sin alguno de estos campos obligatorios**: URL, fuente, autor/licencia o coordenadas. Esto solo verifica campos presentes, no la validez actual de cada URL.

## Cobertura de fotografías del atlas por demarcación

| Demarcación | Municipios indexados | Imágenes del atlas | Fichas piloto etiquetadas |
|---|---:|---:|---:|
| Azua | 10 | 0 | 0 |
| Baoruco | 5 | 0 | 0 |
| Barahona | 11 | 6 | 0 |
| Dajabón | 5 | 8 | 0 |
| Distrito Nacional | 1 | 91 | 43 |
| Duarte | 7 | 0 | 2 |
| El Seibo | 2 | 19 | 0 |
| Elías Piña | 6 | 0 | 0 |
| Espaillat | 5 | 4 | 0 |
| Hato Mayor | 3 | 2 | 1 |
| Hermanas Mirabal | 3 | 3 | 0 |
| Independencia | 6 | 1 | 2 |
| La Altagracia | 2 | 361 | 9 |
| La Romana | 3 | 99 | 2 |
| La Vega | 4 | 62 | 6 |
| María Trinidad Sánchez | 4 | 5 | 1 |
| Monseñor Nouel | 3 | 19 | 0 |
| Monte Cristi | 6 | 17 | 1 |
| Monte Plata | 5 | 33 | 0 |
| Pedernales | 2 | 1 | 2 |
| Peravia | 3 | 3 | 2 |
| Puerto Plata | 9 | 25 | 11 |
| Samaná | 3 | 204 | 9 |
| San Cristóbal | 8 | 4 | 1 |
| San José de Ocoa | 3 | 0 | 2 |
| San Juan | 6 | 1 | 2 |
| San Pedro de Macorís | 6 | 56 | 3 |
| Sánchez Ramírez | 4 | 2 | 0 |
| Santiago | 10 | 52 | 4 |
| Santiago Rodríguez | 3 | 0 | 0 |
| Santo Domingo | 7 | 150 | 3 |
| Valverde | 3 | 6 | 0 |

## Brechas observadas
**Sin imágenes en el atlas (6):** Azua, Baoruco, Duarte, Elías Piña, San José de Ocoa, Santiago Rodríguez.

**Con entre una y cuatro imágenes (9):** Espaillat, Hato Mayor, Hermanas Mirabal, Independencia, Pedernales, Peravia, San Cristóbal, San Juan, Sánchez Ramírez.

Estas cifras corresponden **solo al atlas complementario de paisajes**, no a todas las fichas en Google Maps. Que una provincia tenga cero imágenes aquí **no implica** que sus lugares o fotos de Google hayan desaparecido.

## Mejoras verificables y acciones sugeridas
1. **Proteger el catálogo y la búsqueda actual.** No reemplazar el listado, borrar negocios ni cambiar Google Places, sus credenciales o su cuota en la misma intervención.
2. **Aumentar atribución visual donde hay brechas.** Priorizar las 6 demarcaciones vacías y 9 con cobertura escasa usando fotos correctas, geolocalizadas y licenciadas, nunca imágenes de otra provincia.
3. **Auditoría funcional posterior en las 32 demarcaciones.** En dispositivos de prueba confirmar por localidad: conteo de fichas, conteo con foto, nombres, posición, galería por lugar, enlace para llegar, tiempo de respuesta y ausencia de fotos cruzadas. Esta parte **no se considera completada** solo con inspección de repositorio.
4. **Velocidad móvil.** Medir navegación, red y tiempo de carga real; el proyecto ya limita consultas pagadas y ahora evita reemplazar imágenes sin cambios.
5. **Regresión automática.** Mantener CI para índice territorial, 32 portadas acreditadas y tarjetas que no se remontan de forma innecesaria.

## Fuentes del repositorio
- `Where_to_Go_Proyecto_Completo/public/data/places/manifest.json`
- `Where_to_Go_Proyecto_Completo/public/data/municipios-rd.json`
- `Where_to_Go_Proyecto_Completo/public/province-heroes.js`
- `Where_to_Go_Proyecto_Completo/public/data/photo-atlas-rd.json`
- `Where_to_Go_Proyecto_Completo/public/data/pilot-places.json`
- `Where_to_Go_Proyecto_Completo/tests/rd-national-coverage.test.cjs`

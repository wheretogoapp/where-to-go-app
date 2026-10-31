# Where to Go V5 — Directorio RD · misma web premium

Este proyecto **conserva** la interfaz aprobada, 32 demarcaciones, 158 municipios, GPS, el mapa, favoritos, sesiones con Supabase (requiere configuración) y Clemente Transport VIP.

## Cambios V5

- 50 categorías de turismo, comidas, compras, belleza, salud, servicios y transporte, organizadas en seis grupos.
- Cabarete como distrito municipal de Sosúa, aparte de los 158 municipios.
- Patrocinio provincial: en la portada de Puerto Plata aparece Clemente Transport VIP; en las listas solo se muestran anuncios aprobados de la categoría pertinente y dentro del radio de búsqueda.
- Solicitud de registro de negocios mediante **Netlify Forms**; plan Básico US$10 pago único, previa aprobación (sin pagos automáticos). Cada negocio puede enviar nombre, categoría, provincia, localidad, dirección, contacto, enlaces de mapa y fotografía propia.
- Dos catálogos separados: POIs abiertos de OSM y negocios propietarios revisados (`public/data/negocios-aprobados.json`). Las solicitudes de Forms nunca se publican sin revisión.
- Importador nacional OSM activado desde GitHub Actions. **El ZIP no contiene todavía los POIs masivos**, se generan al ejecutar el flujo.
- Coordenadas OSM y Waze para rutas, fotos de Wikimedia/OSM solo si realmente están vinculadas a la ficha (sin sustituciones por fotos genéricas).

## Instalación, sin perder el Netlify actual

En el ZIP, `.github/workflows/actualizar-directorio-rd.yml` se sube a la **raíz** del repositorio `wheretogoapp/where-to-go-app`. `Where_to_Go_Proyecto_Completo` debe ocupar la misma carpeta de ese nombre que ya existe en tu repositorio, conservando sus archivos de datos.

Confirma el commit en la rama `main`. La acción `Where to Go - Cargar directorio real de RD` se ejecuta automáticamente al detectar el importador nuevo o el propio workflow.

Si en GitHub no se ejecuta: pestaña **Actions** > `Where to Go - Cargar directorio real de RD` > **Run workflow**. Si falla `git push` por permisos: Settings > Actions > General > Workflow permissions > Read and write, según permisos de tu cuenta.

Espera el commit automático `Directorio RD: lugares reales OSM clasificados`, y luego el estado **Published** del segundo despliegue de Netlify. Comprueba `https://reliable-daffodil-8673f5.netlify.app/data/places/manifest.json` y que `recordCount` sea mayor de cero. Si el flujo falla, no habrá un catálogo nacional importado; revisa los logs.

## Registro y planes de pago (verificados manualmente)

Activa una sola vez **Forms > Enable form detection** en Netlify antes de publicar esta versión. El formulario está descrito en `public/__forms.html`. Haz una solicitud real de prueba y comprueba que aparece en Netlify Forms. Los envíos **no** implican publicación ni pago.

Para **aprobar una ficha básica pagada** con coordenadas verificadas, agrega un objeto al arreglo `public/data/negocios-aprobados.json`. Ejemplo de estructura (NO es un negocio real):

```json
{"id":"slug-unico","name":"Negocio verificado","cat":"supermercados","province":"Puerto Plata","municipality":"Puerto Plata","lat":19.0,"lon":-70.0,"approved":true,"registrationPaid":true,"address":"Dirección revisada","phone":"","website":"","sourceUrl":"https://www.openstreetmap.org/node/...","photo":"","photoRightsConfirmed":false}
```

**Nunca copies el ejemplo como ficha real**: son valores estructurales de prueba. Solo publica coordenadas, número y fotografía comprobados por una fuente real o el propietario.

Para **aprobar una promoción** usa `public/data/promociones.json` y configura `active=true`, `approved=true`, categoría exacta (`cat`), provincia, coordenadas y enlace comprobados. Mientras no tenga coordenadas públicas, Clemente Transport VIP se muestra únicamente en el espacio editorial de Puerto Plata y en Transporte, sin pin de oficina inventado. Las opciones de US$30/US$50 son propuestas, no cobros activos.

## Usuarios

La pantalla de acceso existe, pero para iniciar sesión de verdad con Google/Apple/Facebook/correo debes activar Supabase y los proveedores. `public/config.js` tiene los valores públicos, **nunca uses una service_role en el navegador**. El historial personal requiere consentimiento explícito.

## Fuentes y licencias

© OpenStreetMap contributors · ODbL: https://www.openstreetmap.org/copyright
Geofabrik: https://download.geofabrik.de/central-america/haiti-and-domrep.html

La calidad de los puntos y la cobertura dependen de los datos OSM, y algunos way centroid NO son entradas de estacionamiento. No garantizamos todos los negocios ni fotografías de cada uno. Verificar antes de presentar fichas a empresas.


## Aviso V5.1

Leer `ESTADO_Y_PRECIOS.md`: Básico US$10 (pago único), Destacado US$30/mes y Premium US$50/mes. **No existe pasarela activada, no se efectúan cobros**. No se publican solicitudes sin aprobación y comprobación de pago.

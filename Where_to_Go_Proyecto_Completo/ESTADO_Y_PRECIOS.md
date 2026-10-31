# Where to Go · estado verificable y reglas comerciales

## Estado actual de los datos

Este ZIP **no incluye el catálogo nacional importado**. En `public/data/places/manifest.json` aún aparece `recordCount: 0`. Las categorías NO se llenarán hasta ejecutar y completar el workflow de GitHub Actions. No presentes la web como directorio nacional completo hasta comprobar el manifiesto publicado.

### Importación real

1. En la raíz del repositorio GitHub debe existir `.github/workflows/actualizar-directorio-rd.yml`, NO dentro de `Where_to_Go_Proyecto_Completo`.
2. Subir la carpeta `Where_to_Go_Proyecto_Completo` sin duplicarla y el archivo workflow a su ruta exacta. No necesitas subir `LEEME_PRIMERO.txt` al repositorio.
3. GitHub > Actions > "Where to Go - Cargar directorio real de RD" > "Run workflow" (rama main). Si no aparece, faltó el archivo `.github/workflows/actualizar-directorio-rd.yml` o Actions está deshabilitado.
4. El workflow descarga Geofabrik, importa datos OSM de República Dominicana y hace un commit. Debe terminar con ✅ verde; si hay ❌ rojo, abrir logs y no afirmar que está listo.
5. Después de Netlify Published, abrir `/data/places/manifest.json` en la web. `recordCount` debe ser mayor a 0; `categories` tiene conteos por categoría. Si no, **la importación todavía no está instalada**.

## Precios propuestos (no cobrables hasta activar pasarela)

- Básico: US$10 una sola vez, ficha dentro de la categoría y ubicación correcta; no tiene prioridad.
- Destacado: US$30/mes, ficha prioritaria solo en su provincia y categoría. Incluye registro, sin otros US$10.
- Premium: US$50/mes, portada de provincia + categoría. Incluye registro.
- Clemente Transport VIP: editorial fijo de empresa propia para Puerto Plata y primero en Transporte; sin inventar ubicación física.
- Registro vía Netlify Forms queda en *pendiente*; no hay cobro ni publicación automática. Solo se publican manualmente fichas verificadas y pagadas.
- Para una ficha básica: `approved:true`, `registrationPaid:true`, coordenadas y fuente comprobadas en `data/negocios-aprobados.json`.
- Para anuncios: `approved:true`, `active:true`, `paymentVerified:true`, `plan:"destacado"` o `"premium"`, `paidUntil:"YYYY-MM-DD"` futuro, coordenadas y fuente en `data/promociones.json`.

## Cobertura

Solo aparecen datos registrados en OSM, fichas comerciales aprobadas y destinos curados. No es exhaustivo. Si faltan bancos en un área, se necesita mejorar el catálogo / validar fuentes, no inventar resultados. Coordenadas de áreas no garantizan entrada. Fotos solo cuando están vinculadas y se tiene derecho a mostrarlas.

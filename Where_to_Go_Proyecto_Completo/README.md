# Where to Go — A dónde ir · V3 Premium República Dominicana

## Cambios en esta versión

- Rediseño premium oscuro/champán, portada con fotografía identificada de Puerto Plata y crédito visible.
- 31 provincias + Distrito Nacional, 158 municipios en selector territorial (datos offline incluidos).
- Sección **Taxis y transporte** con filtros por provincia y municipio. **Clemente Transport VIP** aparece primero para Puerto Plata y todos sus municipios con WhatsApp **829-586-9111**, teléfono y página web. No se inventa sede ni coordenada.
- Sección de resultados con enlace de respaldo a una búsqueda real en Google Maps si faltan datos.
- Radio inicial ampliado a 12 km, con opciones de 5, 12, 20 y 30 km.
- Lugares OSM/Overpass; la disponibilidad y completitud dependen del proveedor. Fotos vinculadas al lugar o “Foto no disponible”.
- Netlify Functions (fuera de `public`) para conectar Google Places (New): búsquedas, teléfono y foto por identidad del establecimiento, únicamente si configuras la clave.

## Cómo publicar la demo SIN clave Google

1. Descomprime la carpeta y sube **únicamente la carpeta `public/`** a Netlify Drop: https://app.netlify.com/drop
2. El despliegue estático muestra el directorio de transporte, GPS y municipios. La búsqueda pública gratuita OSM puede devolver 0 resultados o fallar por disponibilidad.
3. Desde una URL HTTPS abre la página, toca “Usar mi ubicación” y permite el permiso GPS (se abre desde clic del usuario, no se fuerza).
4. La geolocalización debe probarse en dispositivo real. También puedes seleccionar provincia/municipio manualmente.

**IMPORTANTE:** al subir solo `public/` desde Netlify Drop, no se despliegan las funciones del servidor. Para Google Places publica el proyecto completo mediante Git → Netlify, con funciones y la variable de entorno.

## Configurar Google Places API (New)

1. Abre https://console.cloud.google.com y crea proyecto **Where-to-Go-RD**.
2. En Facturación (Billing), asocia una cuenta con método de pago válido.
3. API y servicios → Biblioteca → habilita **Places API (New)**. No necesitas **Google Play Console** para las búsquedas web.
4. API y servicios → Credenciales → Crear credenciales → Clave de API; restringe la clave para Places API (New). **No la pegues en el código público.**
5. En Netlify, publica el repo Git vinculado a la carpeta del proyecto. Define la variable de entorno **GOOGLE_MAPS_API_KEY** con alcance para funciones, en producción, sin compartirla.
6. Vuelve a desplegar. Comprueba que `/.netlify/functions/provider-status` devuelva `googlePlacesEnabled: true`.
7. Configura **límites de cuota** para Text Search, Place Details y Place Photos y alarmas de costos en Google Cloud. Los avisos de presupuesto **no limitan automáticamente el gasto**.
8. Verifica las políticas de Places API, uso de Google logo, datos fotográficos, condiciones y privacidad: https://developers.google.com/maps/documentation/places/web-service/policies

## Costos (Google Maps Platform, octubre 2026; verificar precios antes de contratar)

- Places API Text Search Pro: **5,000 solicitudes/mes gratis**; luego **US$32 por 1,000 solicitudes** (primer escalón).
- Places API Place Details Enterprise, con teléfonos: **1,000/mes gratis**; luego **US$20 por 1,000**.
- Place Photos: **1,000/mes gratis**; luego **US$7 por 1,000**.
- Google no cobra por cada visitante sino por SKU y consultas; el total depende de qué datos se pidan y cuántas fotos se abran.
- Fuente oficial de precios: https://developers.google.com/maps/billing-and-pricing/pricing

## Estado comercial REAL

✅ Listo: interfaz, PWA, catálogo territorial, taxi destacado con contacto, filtros, código de integración opcional con Google, formulario local sin cobro.
⚠️ Requiere API + publicación Git: resultados consistentes de Google con fotos y teléfonos reales.
❌ Todavía no disponible: cuentas verificadas, dashboard multiempresa real, cobros recurrentes y activación automática de anuncios.

La app **no promete** que todos los negocios, contactos y fotos de la República Dominicana estén disponibles o auditados. No está lista para comercializar suscripciones automáticas. Puedes enseñar el prototipo como demostración y recoger interés, explicando que los pagos se habilitarán tras la fase piloto.

## Estructura de publicación

- `public/`: archivos que ve el visitante, aptos para demo Netlify Drop.
- `netlify/functions/`: consultas seguras en servidor para Google Places; no exponer en web pública.
- `netlify.toml`: publicación de `public/` y empaquetado de funciones.
- `PROPUESTA_COMERCIAL.md`: texto claro para presentar a negocios en el programa piloto.

*Subir la carpeta `public/` a Drop sirve para la demo de diseño y transporte; no activa la API de Google.*

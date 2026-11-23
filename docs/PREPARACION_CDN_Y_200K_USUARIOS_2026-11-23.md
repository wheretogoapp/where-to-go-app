# Where to Go: CDN, datos y escala de 200,000 usuarios — estado verificable
Fecha: 23 de noviembre de 2026. Objetivo: piloto dominicano primero; no lanzar comercialmente sin pruebas.
 
## Diagnóstico verificable
- El repositorio tiene una app estática (HTML/CSS/JS), un catálogo turístico público y datos privados en Supabase.
- La base de datos Supabase está operativa (consulta de lectura): ~12 MB; 1 usuario registrado. **No existe evidencia de carga masiva en producción.**
- El build de staging para Cloudflare Pages se verificó por GitHub Actions: **584 archivos, 42.3 MB de distribución total**. No significa que cada visita descargue 42.3 MB.
- El código de Google Places emite consultas desde el navegador; cada usuario puede causar múltiples solicitudes que se facturan a la cuenta. Existe protección limitada de ráfagas y reintentos; **eso no implica un límite global de gasto**.

## Preparación ejecutada
- `Where_to_Go_Proyecto_Completo/tools/build_cloudflare_preview.py` genera una versión para la raíz de un CDN, sin cambiar el GitHub Pages piloto.
- `.github/workflows/cdn-staging-readiness.yml` valida los recursos, seguridad básica del paquete, rutas y versión de prueba.
- El staging se genera con `noindex`; se configura `_headers` para que los recursos públicos se puedan cachear y archivos de configuración y administración no se almacenen como contenido cacheable. Supabase mantiene datos personalizados fuera de este cache público.
- La clave pública de Google Maps no se distribuye si no se configura expresamente `GOOGLE_MAPS_BROWSER_KEY`; no almacenar nunca claves de servicio o claves de pago en el frontend.
- **Todavía no se ha desplegado en Cloudflare ni probado una carga de 100,000 o 200,000 usuarios.**

## Activación eventual, sin comprar servicios a ciegas
1. Conectar el GitHub repo `wheretogoapp/where-to-go-app` en **Cloudflare Pages**, a través de una cuenta autorizada del propietario.
2. Build command, ejecutado desde raíz del repositorio:
   `python3 Where_to_Go_Proyecto_Completo/tools/build_cloudflare_preview.py --output dist`.
3. Build output directory: `dist`; root directory Git: `/`; usar Python 3.12.
4. Primero construir una URL de **staging**, sin campañas de publicidad y sin configurar cobro comercial.
5. Añadir, si procede, la variable pública `GOOGLE_MAPS_BROWSER_KEY` con una clave de navegador restringida por HTTP referrers al dominio de staging y a las APIs de Google Maps necesarias. La clave aparece en el código del navegador por diseño; **no usar credenciales secretas**. Confirmar límites de Google Cloud ANTES de habilitarla.
6. Añadir la URL nueva a Supabase Auth Redirect URLs y, si corresponde, a la configuración OAuth de Google. Revisar la continuidad del acceso sin compartir tokens.
7. Realizar pruebas de la app en teléfonos físicos, PWA, funcionalidades, protección de fotos, permisos y tráfico.
8. Asociar dominio final y activar SEO solo con autorización de lanzamiento; `noindex` es deliberado para staging.

## Prueba real de crecimiento: dos cargas separadas
**A. CDN/navegación (sin usar Google):** en staging, probar gradualmente 100, 500, 1,000, 5,000, 20,000 y más usuarios virtuales, con herramientas de carga y presupuesto aprobados. Medir fallos, latencias, entrega de recursos y ancho de banda. `tools/local-static-load-smoke.mjs` solo valida 20 solicitudes simultáneas *contra localhost*, no a usuarios simultáneos de la app.

**B. Supabase/cuentas y acciones:** usuarios de prueba aislados, carga progresiva de autenticación, perfiles, favoritos, subida privada y lectura de permisos. No ejecutar sobre clientes reales ni sin límite de gasto. Vigilar CPU, conexiones, tiempo de consulta, pooler y capacidad de Auth/Storage. Redimensionar plan según datos, no por intuición.

**C. Google Places (consumo pagado):** revisar facturación y SKU reales, presupuesto, cuotas por método, errores 429/403 y costes por sesión. En pruebas de carga grandes, **simular Google Places**; hacer muestras reales pequeñas y autorizadas aparte. Si se agota una cuota, mantener el catálogo permitido disponible y explicar el estado al usuario.

## Criterios de aceptación propuestos (no medidos todavía)
- No mezcla de datos entre usuarios y RLS validado.
- Contenido dominicano básico disponible si Google Places está temporalmente limitado.
- Medición de latencia p95 de Inicio, Explorar, fotos y sesión en 4G real.
- Al menos una prueba de 100,000 usuarios virtuales simultáneos **en la infraestructura definitiva o equivalente**, sin Google pagado ni usuarios reales.
- Revisar tasa de fallos y coste de hosting + Supabase + Maps antes de aumentar carga o publicidad.
- No prometer 200,000 simultáneos hasta pasar el umbral correspondiente y registrar pruebas y margen de seguridad.
- Definir copias de seguridad/restauración y un procedimiento de reversión ante fallo.

## Decisión
El proyecto **es técnicamente escalable**, pero la infraestructura actual de GitHub Pages no es una certificación de escalabilidad. Cloudflare Pages es una opción para distribuir archivos estáticos mundialmente; Supabase debe dimensionarse para datos privados; Google Places es un servicio separado y debe presupuestarse. La escalabilidad es un proceso de **medir y ampliar capacidad según demanda**. No es una cualidad garantizada por el nombre del proveedor.

Fuentes:
https://developers.cloudflare.com/pages/functions/pricing/
https://developers.cloudflare.com/pages/get-started/git-integration/
https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
https://supabase.com/docs/guides/deployment/going-into-prod
https://developers.google.com/maps/billing-and-pricing/manage-costs

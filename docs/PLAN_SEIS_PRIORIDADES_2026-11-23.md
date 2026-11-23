# Where to Go — Seis prioridades y criterios para lanzar
Revisión iniciada: 2026-11-23. **Este plan no certifica lanzamiento comercial.**

## Lo que se preserva
- Catálogo indexado RD de 44,696 lugares y selector de 32 demarcaciones/158 municipios.
- Google Places (New) y sus fotos **en vivo** con atributos/licencias: no copiar fichas masivas ni publicar imágenes fabricadas.
- Cinco pestañas inferiores, menú izquierdo y logo maestro.
- Tarifas publicadas: Básico US$10 una vez, Destacado US$30/mes, Premium US$50/mes; tours US$10/mes.
- Sólo se muestra publicidad pagada después de revisión y comprobación real del pago.

## Prioridad 1 — Negocios y tours: cerrar la recepción real
Entregable de código:
- \`supabase/commercial-submissions-v1.sql\` crea tablas \`business_submissions\`,
  \`tour_submissions\`, \`place_reports\`, \`account_deletion_requests\`.
- RLS: solicitantes sólo pueden enviar y leer SUS solicitudes. No pueden autoaprobarse,
  fijar «pagado», actualizar anuncios ni consultar fotos de otros usuarios.
- Storage: buckets PRIVADOS \`wtg-tour-applications\` (máximo 5 MB por imagen)
  y \`wtg-place-reports\` (máximo 6 MB) con carpetas por UID de usuario.
- \`commercial-submissions.js\` envía el formulario únicamente al recibir confirmación del servidor.
  Si faltan tablas/sesión, las fichas comerciales permanecen como borradores locales,
  claramente **NO ENVIADOS**.
- Tours: hasta cinco fotos propias verificables, solicitud y código de confirmación,
  historial propio en la vista Tours.
**Falta activación externa:** propietario ejecuta SQL y verifica autenticación. La revisión
administrativa, notificaciones, cargos, facturación, reembolsos y contratos aún requieren
un backend seguro/operador humano. No activar cobros hasta completarlo.

## Prioridad 2 — Perfil, contraseñas y eliminación de cuenta
- Tablas previas: \`supabase/schema.sql\`, \`supabase/traveler-profile-v2.sql\`;
  ejecutar y verificar RLS ANTES de usar sincronización.
- Recuperación: enlace de correo -> evento \`PASSWORD_RECOVERY\` -> formulario nueva
  contraseña -> \`auth.updateUser({password})\`. Exigir prueba real en dos navegadores.
- Solicitud autenticada de eliminación, pendiente de procesamiento por un administrador:
  **no equivale a cuenta eliminada**.
- En pruebas: usuario A no puede ver perfiles, viajes, pagos ni imágenes de usuario B.
- La eliminación efectiva de \`auth.users\` y del almacenamiento requiere acción segura de
  servidor, verificación de identidad y política de retención. Falta implementar.

## Prioridad 3 — Localización internacional
- Completar todas las claves visibles de menú, comercio, perfil, recuperación y tours.
- Los cinco idiomas además de español son EN/FR/PT/DE/IT.
- Prueba automatizada del menú con cada idioma y restauración al español.
- Mantener intactos nombres propios de negocios, destinos y autores de fotos.
- **Límite:** traducción de una etiqueta no valida todos los mensajes emitidos por terceros;
  revisar 100 % de flujos manualmente antes de afirmar «traducción completa».

## Prioridad 4 — Fotografías y fichas verificadas
- Revisar por localidad: nombre, teléfono, galería, fuente, país/provincia, mapa y
  vínculo para llegar.
- Mostrar títulos turísticos y fotos reales antes que peluquerías sin ocultar fichas
  legítimas en Explorar.
- Los números del atlas propio NO equivalen a fotos de Google en vivo.
- Reportes de fotos erróneas irán a Supabase con moderación; no publicar sin aprobación.
- Ampliar manualmente material de zonas sin fotos de atlas con fotos reales, autoría
  y licencia; nunca atribuir fotos genéricas a negocios.

## Prioridad 5 — Rendimiento y calidad móvil
- Ejecutar \`python Where_to_Go_Proyecto_Completo/tools/audit_release_health.py\`.
- Comprobar 360/390 px, enlaces, contrastes, scroll, menús, formularios con teclado,
  permisos GPS denegados, red lenta y respuestas vacías.
- El presupuesto de HTML/CSS/JS es de origen sin compresión: no sustituye
  Lighthouse ni mediciones de Safari iPhone/Chrome Android.
- Evitar cambiar el sistema de lugares o llamadas pagadas para optimizar UI.
- Reducir CSS redundante después de pruebas visuales, y observar si Search/Map
  retrasa la primera interacción en dispositivos de gama media.

## Prioridad 6 — Requisitos de lanzamiento
Bloqueos que requieren el propietario:
1. Validar la identidad legal del operador, dirección de contacto, correo de soporte,
   retención, procedimiento de eliminación y responsabilidades de tours/negocios.
2. Activar/deploy backend y RLS, probar correos OAuth (Google, Apple, Facebook si se incluyen)
   y no publicar «funcional» hasta comprobar cada proveedor.
3. Elegir dominio principal de producción, SSL, políticas, sitemap y privacidad;
   el GitHub Pages actual añade \`noindex\` y desactiva service worker.
4. Pruebas en dispositivos reales. PWA instalable no equivale a publicación nativa.
5. Android: generar .aab, firmarlo, Google Play Console, ficha y políticas.
   iOS: proyecto iOS, firma, Apple Developer, TestFlight, ficha y revisión App Store.
6. Monitoreo, copias de respaldo, control de costes de Google Places y soporte.

**No activar pagos recurrentes ni publicar promesas de disponibilidad/ventas
hasta tener aprobación, contratos, soporte y un proceso de reembolso.**

## Instrucciones de Supabase para el propietario
- Proyecto ya configurado en JS: https://supabase.com/dashboard/project/byrwnxpxfzharmydpbka
- Editor SQL: https://supabase.com/dashboard/project/byrwnxpxfzharmydpbka/sql/new
- Ejecutar, sólo si todavía no existen, en orden:
  1. \`Where_to_Go_Proyecto_Completo/supabase/schema.sql\`
  2. \`Where_to_Go_Proyecto_Completo/supabase/traveler-profile-v2.sql\`
  3. \`Where_to_Go_Proyecto_Completo/supabase/commercial-submissions-v1.sql\`
- Revisar RLS, Policies, Storage buckets y errores del SQL Editor.
- No compartir claves \`service_role\`, contraseñas ni tokens. La clave publishable no
  concede acceso a fichas ajenas si RLS está correctamente configurado.
- URL de prueba para Authentication > URL Configuration:
  \`https://wheretogoapp.github.io/where-to-go-app/\`
- La conexión del dashboard **no es comprobable solamente viendo el código GitHub**.

## Definición de terminado
- Se recibe una solicitud en Supabase con UUID y \`status=pending\`, sin cobro ni publicación.
- Se revisa como propietario desde otra sesión sin exponer solicitudes de otros usuarios.
- La recuperación de contraseña finaliza con el establecimiento de una contraseña nueva.
- Favoritos, planes y cuenta se sincronizan entre dos dispositivos sin filtraciones.
- Los seis idiomas cubren todas las pantallas y mensajes.
- Las 32 demarcaciones y sus portadas/atribuciones siguen correctas.
- Rendimiento, red lenta y GPS denegado pasan pruebas en iOS y Android físicos.
- Se pueden eliminar cuentas/datos y se publican condiciones legales verdaderas.
- Solo entonces lanzar servicios de pago y paquetes nativos.

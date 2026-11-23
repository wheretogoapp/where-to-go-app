# Where to Go — Protocolo de piloto comercial (23/11/2026)

## Objetivo
Presentar el **prototipo funcional** a negocios y organizadores de excursiones y recoger **solicitudes de interés** verificables. No equivale a un lanzamiento de cobros automáticos ni a prometer publicidad ya activada.

## Capacidades disponibles en el repositorio
- Pantallas móviles de turismo, categorías, mapa, provincias y fichas de lugares. La cobertura real de fotos no es total.
- Inicio de sesión con Google y correo. Google fue probado por el propietario en su dispositivo; Apple y Facebook no están certificados.
- Formulario empresarial con nombre, categoría, provincia, municipio, dirección, teléfono, plan y **1 a 5 fotografías directas** (JPG/PNG/WebP, máximo 5 MB cada una).
- Fotografías de negocios y tours enviadas a almacenes privados de Supabase con políticas de acceso por propietario.
- Confirmación del servidor con identificador y estado **pending**; panel Mis negocios y Mis solicitudes de tours.
- Vista previa local de fotos, mensajes de error que permiten reintentar sin perder el formulario, selección turística visual y opción de directorio completo.
- Enlace comercial para compartir: https://wheretogoapp.github.io/where-to-go-app/#promocionar

## Demostración comercial
1. Abre https://wheretogoapp.github.io/where-to-go-app/ y selecciona el municipio real del negocio.
2. Muestra una ficha auténtica y fotografía pertinente, si la hay, sin atribuirle a un negocio una foto ambiental.
3. Abre **Promocionar** y explica los planes visibles como propuesta comercial sujeta a condiciones definitivas.
4. Muestra **Compartir propuesta** para enviar el enlace. Si el visitante aún no tiene cuenta, puede explorar la demo.
5. El propietario o representante del negocio inicia sesión, rellena el formulario y selecciona fotografías propias/autorizadas desde su teléfono.
6. Tras confirmación del servidor, recibe la referencia de solicitud **pendiente de revisión**, sin pago ni publicación automática.

## Trabajo operativo antes de activar pagos
- El operador puede consultar solicitudes pendientes en el panel de Supabase, bajo `public.business_submissions` y `public.tour_submissions`. Las fotos están en buckets privados. No compartir contraseñas, secretos ni tokens.
- Verificar identidad del negocio, derechos sobre fotografías, teléfono, ubicación, categoría y contenido apropiado. Solicitudes rechazadas no deben aparecer públicamente.
- No marcar una solicitud como aprobada/pagada hasta contar con proceso administrativo de publicación, contrato, facturación, reembolso y verificación real del pago.
- No se deben cobrar suscripciones automáticas ni anunciar anuncios activos hasta integrar y probar el proveedor de pagos y el flujo de publicación.
- Los futuros anuncios aprobados deben identificarse claramente como publicidad.

## Lista corta de aceptación de la próxima fase
- Solicitud real enviada por una cuenta de prueba controlada, verificada en Supabase con fotos privadas; repetir con otra cuenta para asegurar aislamiento.
- Revisar y aprobar desde un panel de administrador autenticado, conservando auditoría del estado y permisos.
- Publicación de ficha aprobada en la provincia/categoría correctas, con fotografía autorizada; rechazo con explicación y sin publicar.
- Integración de pagos con confirmación **desde servidor/webhook**, no desde una captura o un parámetro del navegador.
- Pruebas de sesiones, favoritos, búsqueda Google Places real y fotos por lugar en dispositivos físicos.
- Documentos legales definitivos y contacto de soporte/privacidad verificado.

**Nota:** vender una propuesta o aceptar una solicitud no significa que la ficha esté activa, que el pago se haya recibido ni que los resultados futuros estén garantizados.

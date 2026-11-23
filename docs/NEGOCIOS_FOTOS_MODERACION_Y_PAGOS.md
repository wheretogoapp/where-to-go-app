# Where to Go — fotos y cobros comerciales

## Estado implementado
- Registro de negocios: 1–5 imágenes JPG/PNG/WebP (5 MB máximo cada una) desde galería/cámara; no se piden enlaces.
- Registro de tours: 1–5 imágenes desde el móvil, ya existente.
- Fotos subidas a buckets privados en Supabase por usuario; nadie puede publicarlas automáticamente.
- Cada solicitud conserva estado `pending` hasta que un moderador autorizado revise imágenes, titularidad y datos.
- No afirmar que existe moderación automática: **aún no hay servicio de detección de desnudez ni un panel de moderación completo**.
- No almacenar datos de tarjetas ni implementar un cobro en el navegador. La aprobación de fotos y la verificación de pago son procesos distintos.

## Moderación necesaria antes de producción
1. Análisis automático de todas las fotos, con servicio externo de moderación que clasifique desnudez, contenido sexual, violencia gráfica y contenido no apto.
2. Validación técnica del archivo en backend: MIME real, decodificación segura, tamaño, número de píxeles, antivirus/antimalware y retirada de metadatos EXIF/GPS.
3. Cuotas de subidas y rate limits por cuenta/IP; prevención de abuso y retención de fotos rechazadas.
4. Revisión humana de fotos marcadas y de reclamaciones; posibilidad de apelación.
5. Publicar sólo imágenes aprobadas y propiedad/autorización declarada. Mantener buckets de solicitudes privados y copiar una versión procesada a un bucket público separado tras aprobación.
6. Guardar `moderation_status`, `moderation_reason`, `moderated_by`, `moderated_at` en tablas administrativas, no editables por usuarios.

## Pagos — integración pendiente de afiliación comercial
- **No cobrar todavía:** no se han recibido credenciales de pasarela ni existe checkout verificado.
- Recomendación para RD: evaluar Portal/CyberSource, Azul, CardNET y un integrador como Timbro según afiliación, comisiones y soporte de Apple Pay/Google Pay.
- El checkout debe alojarse en la pasarela (Visa, Mastercard, Apple Pay, Google Pay), no almacenar PAN/CVV.
- El servidor crea la orden con precio del plan definido en backend y referencia de solicitud; no aceptar precios enviados por el cliente.
- El servidor verifica firma y evento de webhook, importe, moneda, idempotencia y estado `paid`; la página de retorno no prueba un pago.
- El anuncio sólo se activa si `moderation_status=approved` **y** `payment_status=paid`; si es mensual, definir renovación, cancelación, caducidad, reembolso y comprobante.
- Google Play Billing no es Google Pay. En apps nativas, comprobar reglas actuales de Apple App Store y Google Play para publicidad digital dentro de la app antes de habilitar pagos externos.
- Planes visibles actuales: $10, $30, $50. Definir moneda, duración, impuestos y beneficios antes de afiliarse.

## Referencias de proveedores
- https://portaldom.do/preguntas-frecuentes/
- https://timbro.do/como-empezar/
- https://dev.azul.com.do/

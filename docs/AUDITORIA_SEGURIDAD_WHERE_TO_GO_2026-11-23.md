# Auditoría de seguridad de Where to Go — 23 de noviembre de 2026

## Entorno comprobado
- Supabase: proyecto `byrwnxpxfzharmydpbka`, estado `ACTIVE_HEALTHY`.
- GitHub Pages: publicación confirmada en el commit `bda397148700d7a72f3715679480a2f7b604908b`, workflow 45204467050 exitoso.
- Auth: una cuenta de usuario registrada con dos identidades vinculadas, Google y correo. Esto demuestra conexión OAuth previa, **no** una prueba de inicio/cierre de sesión nueva en cada dispositivo.
- Base de datos: tablas `profiles`, `favorites`, `activity_events`, `traveler_profiles`,
  `business_submissions`, `tour_submissions`, `place_reports`, `account_deletion_requests`
  con RLS activado.
- Storage: `wtg-tour-applications` y `wtg-place-reports` privados, acceso según carpeta del UID.

## Vulnerabilidad detectada y corregida directamente en Supabase
**Severidad alta:** las cuatro tablas nuevas concedían a `authenticated` permisos
`UPDATE`, `DELETE` y `TRUNCATE`, pese a que el producto sólo necesita
`SELECT` e `INSERT`. PostgreSQL no aplica políticas RLS a `TRUNCATE`.
El 23-11-2026 se ejecutó exitosamente la migración
`security_revoke_default_grants_commercial_20261123` para revocar permisos
sobrantes. Una consulta posterior de permisos confirmó que `anon` no puede
leer/escribir/alterar estas tablas y que `authenticated` sólo dispone de
`SELECT` e `INSERT`, sin `TRUNCATE`.

Este archivo documenta el estado auditado. La fuente de migración en
`Where_to_Go_Proyecto_Completo/supabase/commercial-submissions-v1.sql` incluye
ahora los mismos `REVOKE/GRANT` para nuevos despliegues.

## Aviso de Supabase pendiente
El asesor de seguridad informa `auth_leaked_password_protection`:
la **protección de contraseñas filtradas está desactivada**. El operador debe
revisar [Supabase Auth Password Security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
y activarla si está disponible en su plan. No se han publicado contraseñas.

## Por validar antes de venta o lanzamiento
1. Google OAuth: iniciar/cerrar/volver a entrar en iPhone y Android, y comprobar
   que el enlace de retorno se limpia y no quedan tokens compartidos en URL.
2. Recuperación de contraseña: correo de recuperación, enlace, nueva contraseña
   y sesión recuperada sin filtración entre dispositivos.
3. RLS negativa real: dos usuarios A/B, verificar que no pueden leer
   solicitudes, favoritos, reportes, fotos y perfil del otro.
4. Registro comercial: pruebas reales de `submitBusiness`, `submitTour`,
   fotos privadas y solicitudes de eliminación; comprobar mensaje de recibo
   sólo cuando se obtiene el UUID del servidor.
5. Borrado de cuenta: actualmente se registra una solicitud; aún no ejecuta
   borrado integral de `auth.users`/Storage. Requiere backend protegido,
   verificación de identidad, políticas de retención y comunicación al usuario.
6. Moderación, límites de peticiones y tamaño total de archivos para evitar
   abuso y costes. Actualmente el límite de subida es por foto, no por
   usuario/mes.
7. Seguridad de producción web: cabeceras CSP, referrer, anti-XSS,
   restricciones de claves de Maps por dominio y API, dependencias de CDN
   con versiones fijadas, gestión de errores y respaldo.
8. Requisitos legales: titular del servicio, contacto real, protección
   de datos, pagos y devoluciones, antes de cobrar planes.
9. Medir rendimiento y accesibilidad en dispositivos físicos, además de QA
   emulado y datos sintéticos.

## Documentación
- [RLS y GRANTs de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Protección de contraseña](https://supabase.com/docs/guides/auth/password-security)
- [Panel de Supabase](https://supabase.com/dashboard/project/byrwnxpxfzharmydpbka)
- [GitHub Pages publicado](https://wheretogoapp.github.io/where-to-go-app/)

**No afirmar seguridad absoluta ni funcionalidad comercial completa basándose
únicamente en la auditoría de SQL y en pruebas automatizadas.**

# Where to Go — Criterios verificables para un piloto estable en República Dominicana
**Inicio de control:** 23 de noviembre de 2026  
**Meta interna de preparación:** 23 de diciembre de 2026  
**Lanzamiento oficial:** no programado; evaluar para 2027.

> Objetivo: demostrar un producto confiable, no prometer cero errores ni una cobertura internacional que todavía no ha sido validada. No aceptar pagos automáticos ni activar fichas comerciales basándose en pruebas simuladas.

## Confirmado hasta ahora

- [x] Web publicada en GitHub Pages, comprobador de versión exacta y pruebas móviles emuladas exitosas.
- [x] Acceso real con Google probado por el propietario; correo y contraseña disponibles.
- [x] Menú lateral con 50 categorías y búsqueda por texto, comprobado en prueba emulada.
- [x] Google Places produjo resultados con fotos en Puerto Plata, Santiago y Villa Montellano en una prueba real del 21/11/2026. Esto **no** prueba todos los municipios ni las versiones posteriores.
- [x] Catálogo local de República Dominicana: 44,696 entradas; cobertura de fotos acreditadas del catálogo local incompleta.
- [x] Formularios de negocios y excursiones con fotos privadas, vistas previas, borradores seguros y confirmación del servidor.
- [x] Separación de favoritos y borradores por cuenta y protección de sincronización contra respuestas atrasadas.
- [x] Base RLS de revisores, audit trail y página administrativa privada para revisar solicitudes. Aún requiere prueba E2E con el propietario real.
- [x] Validación móvil automática en cada despliegue y programación de prueba diaria **sin consumir la cuota de Google Places**.

## Bloque A — datos y autenticación (bloqueador de piloto comercial)
- [ ] Pruebas con **dos cuentas distintas** en dispositivos y navegadores físicos: favoritos, historial y viajes nunca se mezclan.
- [ ] Verificar que cambios locales más recientes se suben y que los cambios del servidor aparecen al abrir la cuenta desde otro dispositivo.
- [ ] Sesión Google: cerrar sesión, reabrir, revocar y recuperar contraseña; gestionar bloqueo de terceros/cookies y navegadores móviles.
- [ ] Verificar y revocar cualquier token compartido durante desarrollo, conservando cuentas de usuario.
- [ ] Configurar protección de contraseñas filtradas de Supabase si el plan lo permite; revisar MFA y políticas de recuperación.
- [ ] Apple y Facebook: registrar credenciales de desarrollador, redirecciones y pruebas reales de inicio/cierre de sesión.

## Bloque B — negocios, fotos y administración (bloqueador de cobros)
- [ ] El propietario realiza una solicitud de negocio **real de prueba** con 1–5 fotografías propias; confirmar fila, estado y bucket privado.
- [ ] Un segundo usuario no puede ver la solicitud ni descargar sus fotos; un revisor autorizado sí puede verlas.
- [ ] Probar aprobación, rechazo, notas y registro inmutable de auditoría; verificar que los cambios son visibles al solicitante.
- [ ] Repetir la cadena completa con una excursión.
- [ ] Definir y construir publicación automática **solo después de revisión humana y confirmación de pago por un servidor autorizado**.
- [ ] Moderación de imágenes por personal autorizado y reglas antiabuso (desnudos, contenido sexual, violencia gráfica, menores, suplantación, derechos).
- [ ] Contrato, comprobante, reembolso, renovaciones, vencimiento de anuncios, suspensión y soporte.
- [ ] Seleccionar una pasarela compatible con el titular y bancos dominicanos; **no aceptar Visa/Mastercard ni vender suscripción automatizada antes de confirmar el proveedor y hacer pruebas bancarias reales**.
- [ ] Completar proceso de eliminación de cuenta y datos con verificación de identidad y seguimiento administrativo.

## Bloque C — turismo y resultados que sí venden
- [ ] Probar en teléfono: Puerto Plata, Sosúa, Cabarete, Santiago, Samaná/Las Terrenas, Punta Cana/Bávaro, La Romana, Santo Domingo y destinos secundarios.
- [ ] Validar que Google Places entrega resultados y fotos **pertinentes** en vivo, sin guardar ni redistribuir indebidamente datos protegidos.
- [ ] Eliminar fotos equivocadas, satélites, animales e imágenes que no corresponden a la ficha; validar licencias.
- [ ] Auditar tiempos reales de carga con red móvil normal y lenta, errores de GPS, denegación de permiso, búsquedas repetidas y consumo de cuota.
- [ ] Hacer más directas las primeras tarjetas y categorías en Inicio, especialmente en pantalla pequeña.
- [ ] Confirmar traducciones completas y comprensibles de las pantallas principales, mensajes de error, precios y formularios.

## Bloque D — distribución y alcance internacional
- [ ] Dos teléfonos físicos (al menos un iPhone y un Android) con instalación, sesiones y navegación de varias horas.
- [ ] Aclarar PWA: GitHub Pages actualmente desactiva service worker, por tanto **no prometer funcionamiento offline**.
- [ ] Revisar política de privacidad, términos, datos del operador, soporte, retención y solicitudes de eliminación.
- [ ] Medir un piloto mundial controlado en ciudades de diferentes países antes de anunciar cobertura internacional.
- [ ] Compilar y probar aplicaciones Android e iOS solamente tras pasar criterios de cuentas, privacidad, rendimiento y datos.

## Señales de NO LANZAR o NO COBRAR
1. Una cuenta puede ver o modificar los datos privados de otra.
2. Hay fotografías privadas o no autorizadas publicadas sin aprobación.
3. Se pierde un formulario o una compra aparenta estar confirmada sin recibo del servidor.
4. Un anuncio aparece pagado o publicado sin aprobación y verificación comercial.
5. Los destinos muestran lugares de otra ciudad/país o fotos engañosas.
6. Faltan datos verificables del operador, soporte y condiciones comerciales.

## Evidencia exigida
Cada señal de avance requiere commit, resultados del flujo de CI, prueba pública de versión exacta y, para pagos, OAuth y datos sensibles, evidencia de una prueba física controlada. Las métricas de fotografías deben distinguir **fotos propias por ficha**, **fotos ambientales** y **Google Places en vivo**.

**Nota operativa:** este documento es un plan de aceptación, no un certificado de producción ni una promesa de entregar todo de manera automática. Las integraciones de Apple, Meta y pagos requieren credenciales y aprobaciones de esas plataformas.

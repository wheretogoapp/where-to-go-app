# Where to Go — Preparación móvil Android y iOS

Estado: planificación técnica inicial; NO representa una compilación ni una app publicada.

## Objetivo
Mantener una base de producto compartida para web, Android e iOS, con interfaz móvil de primera clase y catálogo dinámico de lugares.

## Estado comprobado en el repositorio
- public/index.html usa viewport-fit=cover y enlaza manifest.webmanifest.
- public/manifest.webmanifest tiene display=standalone e iconos 192/512.
- No se ha confirmado compilación .aab de Android, proyecto Xcode ni distribución TestFlight.
- El manifest usa rutas absolutas (/), que deben revisarse para publicación bajo el subdirectorio de GitHub Pages.
- No se encontró public/sw.js; no se debe anunciar soporte offline completo.
- La conexión Google Places requiere clave, facturación, permisos y pruebas reales; no prometer fotografías para todos los lugares.

## Fases y criterios de aceptación
1. **Experiencia móvil**: auditar navegación inferior, áreas seguras (notch/home indicator), teclado, permisos, carga, accesibilidad y legibilidad en iPhone/Android.
2. **Datos reales**: verificar búsqueda, lugares, imágenes correctamente atribuidas, fichas, mapa, navegación y estados de error en República Dominicana.
3. **PWA**: corregir rutas de manifest/iconos y probar instalación desde Safari y Chrome; probar comportamiento con red lenta. La PWA no equivale a publicación en tiendas.
4. **Empaquetado nativo**: evaluar Capacitor y crear proyectos Android/iOS con identificadores propios, iconos, splash, permisos y política de privacidad.
5. **Pruebas privadas**: instalar Android en equipo físico; distribuir iOS con TestFlight cuando se disponga de Apple Developer y compilación firmada.
6. **Lanzamiento**: generar Android App Bundle y build iOS, preparar fichas, capturas y revisiones de tiendas.
7. **Actualizaciones**: catálogo y contenido desde backend cuando exista; cambios nativos mediante nuevas versiones en tiendas. No depender de actualizaciones remotas para eludir revisiones.

## Pruebas con el propietario
- iPhone: navegación, permisos de ubicación, fotos, ficha, mapas, login, favoritos y errores.
- Android: mismas pruebas, además del botón atrás y diferencias de permisos.
- Medir tiempos reales de carga y documentar fallos con capturas.
- Nunca solicitar contraseñas ni credenciales de desarrollador por mensajes.

## Bloqueos actuales
- Google Places no activado/verificado en entorno de producción.
- No existe build nativo confirmado para ninguno de los dos sistemas.
- Faltan validación de contenido y pruebas de extremo a extremo.

## Principio
No presentar una web instalable como app nativa ni declarar lista una versión que no se ha compilado y probado.

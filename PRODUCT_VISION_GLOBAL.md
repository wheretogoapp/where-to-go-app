# WHERE TO GO — Principios de producto y expansión global

## Visión
Plataforma mundial de descubrimiento turístico. República Dominicana es el mercado piloto, no el alcance final.

## Reglas innegociables
1. **Autenticidad**: ninguna foto artificial, genérica o de otro negocio presentada como foto del lugar. Las fotos deben tener fuente y derechos de uso verificables. Una imagen geolocalizada cercana NO prueba que retrate un establecimiento.
2. **Sin sección «Fotos reales»**: las fotografías pertenecen a la experiencia de descubrir lugares, no a una galería separada. La autenticidad es un requisito universal.
3. **Sin techo global**: no fijar un máximo permanente de países, lugares o fotos. Límites por solicitud, lote, paginación y almacenamiento sí son necesarios para proteger rendimiento y costos.
4. **Móvil primero**: experiencia premium, nombres legibles, imágenes optimizadas, carga progresiva y navegación rápida.
5. **Identidad consistente**: marca Where to Go y logo oficial dorado con palmera y avión; no reemplazarlo con reinterpretaciones.
6. **Datos comprobables**: país, región, municipio, coordenadas, categoría, fuente, fecha de revisión y estado de verificación. No inventar horarios, contactos, reseñas ni disponibilidad.
7. **Experiencia internacional**: idioma del dispositivo, traducciones completas, países/ciudades y filtros geográficos sin lógica exclusiva de RD.
8. **Comercios**: fotos verificadas, ficha, contacto, mapa, servicios y opciones comerciales; distinguir información confirmada de aportes pendientes de revisión.

## Arquitectura objetivo
- **Catálogo de lugares**: ID estable, jerarquía país→región→localidad, coordenadas, categorías, atributos, procedencia y revisión.
- **Catálogo de medios**: ID, lugar asociado *solo si hay evidencia*, URL/CDN, dimensiones, licencia, autor, fuente, estado de validación, variantes optimizadas.
- **Ingesta incremental**: recolectores por proveedor/país, deduplicación, validación, revisión de calidad y publicación por lotes.
- **Distribución**: búsqueda geoespacial y por categoría, paginación/cursor, imágenes responsive con lazy loading y caché.
- **Escalabilidad**: almacenamiento de objetos/CDN y base de datos consultable; no cargar millones de registros o imágenes en un JSON único.
- **Privacidad**: geolocalización opcional y consentida.

## Criterios de aceptación para el piloto RD
- Cambiar de provincia actualiza portada, lugares y fotos correctos.
- No mostrar una imagen del entorno como si fuera una foto de un negocio.
- Si no hay foto verificada, usar una presentación neutral, sin inventar contenido.
- Catálogo visible desde categorías habituales, no desde una galería paralela.
- Medir lugares con al menos una foto verificada, fotos válidas, fallos de imagen, velocidad en móvil y cobertura por provincia.
- Verificar la URL publicada en móvil antes de declarar una tarea completada.

## Prioridad de ejecución
1. Integrar correctamente logo oficial.
2. Vincular fotos verificadas a cada lugar; auditar cobertura real y fuentes.
3. Corregir navegación provincia/municipio y portada geográfica.
4. Mejorar rendimiento y presentación móvil.
5. Escalar la ingesta por países sin romper la experiencia piloto.

**Nota:** este documento define requisitos. No certifica que todas estas capacidades estén implementadas.

## Tours y excursiones — requisitos aprobados
- Sección en navegación inferior móvil, vacía hasta tener anuncios verificados y pagados.
- US$10 mensuales por anuncio, con renovación y expiración controladas por servidor cuando se integre la pasarela de pagos.
- Solicitud con 1 a 5 fotos propias/autorizadas, punto y hora de salida, fecha, regreso, itinerario, destino, precio, cupos, inclusiones, exclusiones, política de cancelación, contacto y seguridad.
- Mostrar cada excursión solamente en su país y provincia/región correspondiente, con filtros geográficos del servidor, no solo de la interfaz.
- Revisión humana del organizador y fotos; no declarar una excursión segura sin verificación independiente.
- GitHub Pages es estático: para recibir fotos, almacenar anuncios, cobrar y publicar se necesita backend y almacenamiento seguro. No simular pagos o envíos exitosos.

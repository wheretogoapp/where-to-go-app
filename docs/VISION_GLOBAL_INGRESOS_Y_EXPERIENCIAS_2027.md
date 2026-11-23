# WHERE TO GO — Visión de producto global y monetización (23 noviembre 2026)

**Principio fundador:** Where to Go / A dónde ir no es un directorio pequeño. Debe evolucionar hacia una plataforma global de descubrimiento, experiencias turísticas, negocios y, si los usuarios demuestran interés, contenidos de viajeros. República Dominicana es el piloto de calidad; el alcance mundial es el objetivo. El lanzamiento oficial se evaluará para 2027.

**No vender capacidades no probadas:** 100,000–200,000 simultáneos requieren infraestructura CDN/DB dimensionada, protección de costos Google Places, pruebas de carga y contingencias. Ver `docs/PREPARACION_CDN_Y_200K_USUARIOS_2026-11-23.md`. Mantener la identidad y fotografías auténticas; nunca añadir fotos falsas o de otra provincia. No activar cobros/pagos sin contrato y procesador real.

## Qué valor entrega
- Viajeros: descubrir lugares cercanos, experiencias, restaurantes, playas, tours, alojamiento y servicios; favoritos, historial opcional, viajes guardados y orientación.
- Negocios: ficha legítima con fotografías subidas desde la app, contacto, ubicación verificada, administración de solicitudes y promoción opcional.
- Organizadores turísticos: subir tours con hasta cinco fotos auténticas, país/provincia y punto de salida; captar solicitudes y eventualmente reservas con fechas/cupos.
- Comunidades turísticas: compartir experiencias auténticas que ayuden a otros a elegir, sin convertirse obligatoriamente en otra red social.

## Vías de ingresos (complementarias; implementar por fases)
1. **Promociones de negocios:** ficha básica y planes destacados/premium. Las tarifas actuales del prototipo son propuestas, no ingresos activos. Establecer duración, etiquetado de anuncios, revisión, vencimiento, reglas de prioridad y métricas de contacto.
2. **Tours y excursiones:** opciones de publicación y visibilidad. Validar el interés comercial en el piloto antes de cobrar y decidir si se cobra mensualidad, comisión por reserva completada o combinación transparente. No cobrar dos veces inadvertidamente.
3. **Comisiones por reservas efectivas:** posterior al piloto, para tours, excursiones, transportes y alojamiento cuando haya acuerdo con proveedores, disponibilidad real, cancelaciones, rembolsos y pago verificado. Evitar afirmar que una reserva es confirmada si solo existe un formulario de contacto.
4. **Visibilidad patrocinada localizada:** campañas claras, diferenciadas de recomendaciones orgánicas, con presupuestos/fechas definidos y métricas básicas; nunca manipular rankings sin señalización.
5. **Herramientas profesionales opcionales:** panel de negocios con estadísticas agregadas, gestión de mensajes y ofertas cuando existan usuarios suficientes. No vender datos personales.
6. **Asociaciones comerciales y afiliados:** solo con acuerdos explícitos, transparencia de comisiones y proveedores confiables.

**Principio económico:** priorizar ingresos vinculados a valor verificable (contactos auténticos, solicitudes, reservas reales) antes de llenar la app de anuncios. Evitar promesas de ventas garantizadas. Primero validar oferta y demanda en Puerto Plata y varios destinos dominicanos; después replicar mundialmente.

## Cuatro etapas
### Etapa 1 — Piloto robusto RD, antes de enseñar a anunciantes
Categorías completas; búsqueda y Google Places optimizados; fotos reales; localización correcta; perfil seguro; teléfonos físicos; sistema administrativo, moderación, métricas y plan de contingencia. Sin cobros activos hasta pruebas reales.
### Etapa 2 — Producto comercial verificable
Paneles de empresas/organizadores, métricas de ficha, solicitudes, revisión, renovaciones y política comercial. Integrar pasarela cuando se verifique elegibilidad, costos y cumplimiento. Establecer conciliación, factura/comprobante, fallos, reembolsos, impuestos y atención.
### Etapa 3 — Marketplace de experiencias
Disponibilidad, cupos, fechas, reservas completas, cancelación y confirmación por operador. Medir conversión y satisfacción, reputación y quejas; después considerar comisiones y pagos al proveedor. Protección contra anuncios falsos.
### Etapa 4 — Expansión mundial y comunidad
País/ciudad universal, seis idiomas y mejora posterior, catálogos y portadas reales, escalabilidad internacional, contenido de visitantes y personalización respetuosa con privacidad. No anunciar presencia real en todos los países sin comprobarlo.

## Idea exploratoria: pestaña 'Experiencias' con videos de viajeros
**Estado: HIPÓTESIS, no función aprobada ni requisito del primer lanzamiento.** No crear un clon de TikTok ni desplazar el descubrimiento turístico.
- Piloto con clips cortos y voluntarios vinculados a la **ficha de un lugar real**, no un feed genérico de cualquier tema.
- Probar primero 30–60 clips con creadores o usuarios autorizados, **subida directamente desde la app**, consentimiento, privacidad, derecho de autor, opciones de reporte y moderación previa.
- Priorizar seguridad: prohibir material sexual, acoso, contenido peligroso, infracciones de derechos y uso no consentido de imagen de terceros; atención especial a menores.
- Arquitectura futura: servicio especializado para ingestión, transcodificación, miniaturas, video adaptativo, almacenamiento de objetos/CDN, límites de tamaño/duración, control de costos y supresión. **No almacenar videos en PostgreSQL ni en GitHub Pages.**
- Analizar costo por clip visto/subido, retención, reportes de abuso, visitas a fichas y reservas que se originan de un video.
- Si el video no mejora el descubrimiento o las conversiones, descartarlo o mantener solo clips de lugares verificados. Si funciona, evaluar una pestaña dedicada y perfiles de creadores.

## Separar pagos según naturaleza y plataforma
- Cobrar tours, transporte y alojamiento (servicios consumidos fuera de la app) es distinto de vender contenido o funciones digitales. Apple y Google Play tienen normas diferentes para cada caso: revisar antes de implementar pagos nativos y cobros de visibilidad digital.
- Fuentes oficiales (consultadas 23/11/2026):
  https://developer.apple.com/app-store/review/guidelines/
  https://support.google.com/googleplay/android-developer/answer/10281818
  https://support.google.com/googleplay/android-developer/answer/9858738
- Las modalidades exactas de cobro dependerán del país del comerciante, titular legal, entidad recaudadora, procesador y leyes locales. No confundir Google Pay, Google Play Billing y Google Cloud billing.

## Indicadores para saber si la idea genera valor
- Usuarios que encuentran un lugar y lo abren (no solo registros).
- Usuarios que guardan un destino, generan una ruta, llaman a un negocio o consultan un tour.
- Solicitudes de reserva con respuesta del proveedor y reservas efectivamente completadas.
- Ingresos netos por cliente, cancelaciones, devoluciones, costo por contacto y costo de Google Maps/almacenamiento por usuario activo.
- Retención de viajeros y retorno de anunciantes; reportes de contenido engañoso.
- En futuro piloto de video: si el clip genera más apertura de fichas, guardados o conversiones sin disparar costos ni problemas de moderación.

## Decisiones explícitas vigentes
- **Sí:** pensar global, preparar escalabilidad y costos antes del lanzamiento, monetizar de forma transparente, RD de piloto y ampliar mundialmente.
- **Sí, pero por fases:** tours, alojamientos, reservas, promociones, paneles de negocios.
- **Pendiente de validación:** publicación de videos de experiencias y sección social. No implementar ni comprometer costos hasta investigar prueba pequeña.
- **No:** anunciar lanzamiento oficial ahora, activar pagos sin pruebas, publicar negocios/fotos sin revisión, falsear fotos, imponer gastos nuevos sin autorización.

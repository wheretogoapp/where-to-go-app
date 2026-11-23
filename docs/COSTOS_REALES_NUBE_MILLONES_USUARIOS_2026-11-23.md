# WHERE TO GO — precios reales, escenarios y riesgo de viralidad
**Revisión de tarifas: 23 de noviembre de 2026.** USD mensuales salvo indicación. Los precios pueden variar y NO representan factura de la cuenta del propietario.

## 1. Tarifas verificadas en documentación oficial
- **Cloudflare Pages:** entrega de archivos estáticos gratuita y sin límite de solicitudes facturables en planes Free/Paid, siempre que NO invoquen Functions. No confundir con SLA o certificación de concurrencia. https://developers.cloudflare.com/pages/functions/pricing/
- **Cloudflare Workers:** plan Paid base USD 5/mes; 10 millones de requests/mes incluidos y USD 0.30/millón adicional, además de CPU. https://developers.cloudflare.com/workers/platform/pricing/
- **Supabase Pro:** USD 25/mes (100,000 usuarios activos mensuales incluidos, 250 GB egress, 8 GB de DB). Adicionales: USD 0.00325/MAU, egress USD 0.09/GB y DB USD 0.125/GB sobre inclusiones. Incluye USD 10/mes en créditos de cómputo. https://supabase.com/pricing ; https://supabase.com/docs/guides/platform/billing-on-supabase
- **Supabase compute:** Medium USD 60, Large USD 110, XL USD 210, 2XL USD 410, 4XL USD 960 al mes por instancia antes del crédito de USD 10. Son precios de capacidad, **no promesas de simultaneidad**. https://supabase.com/docs/guides/platform/compute-and-disk
- **Cloudflare R2 Standard:** USD 0.015/GB-mes de almacenamiento con 10 GB incluidos; sin cobro de salida, pero operaciones Class A/B sí tienen precios. Se requiere software de acceso privado para fotos de usuarios. https://developers.cloudflare.com/r2/pricing/
- **Google Places Nearby Search Pro:** primeras 5,000 llamadas/mes gratuitas; siguiente tramo hasta 100,000 es USD 32 por cada 1,000 llamadas; descuentos por volumen posteriores. No incluye otras SKU ni fotos. https://developers.google.com/maps/billing-and-pricing/pricing
- **Google Place Details Photos:** precio publicado USD 7/1,000 eventos con 1,000 gratuitos, sujeto al método y SKU. https://developers.google.com/maps/billing-and-pricing/pricing
- **Cloudflare Stream (video futuro):** almacenaje USD 5/1,000 minutos almacenados/mes (capacidad prepagada); entrega USD 1/1,000 minutos vistos, más impuestos y adicionales pertinentes. https://developers.cloudflare.com/stream/pricing/

## 2. Usuarios activos mensuales — precio parcial de autenticación Supabase
- 10k, 50k o 100k MAU: incluidos en Pro USD 25 (sujeto a más recursos si hay muchas peticiones).
- 200k MAU: USD 25 + (100k × 0.00325) = **USD 350** solo plan + exceso de MAU, antes de compute adicional, almacenamiento, Google, egress.
- 1m MAU: USD 25 + (900k × 0.00325) = **USD 2,950**, antes de compute adicional y demás servicios.

## 3. Hipótesis de Google Nearby Search Pro — tarifas escalonadas
Se supone que TODAS las llamadas son del SKU Nearby Search Pro (no Enterprise), sin gastos de fotos, mapas ni otros productos. NO representa cargos reales del proyecto.
| llamadas al mes | USD/mes aprox |
|---:|---:|
| 10,000 | 160 |
| 50,000 | 1,440 |
| 100,000 | 3,040 |
| 300,000 | 8,160 |
| 1,000,000 | 22,880 |
| 3,000,000 | 42,080 |
| 10,000,000 | 73,280 |

Una búsqueda de la app puede ejecutar varias llamadas API (varios tipos/sectores). Las fotografías pueden ser otro gasto, dependiendo de flujo y método. **Revisar los SKU reales en la consola antes de estimar gasto de usuarios.**

## 4. Dos ejemplos de composición, NO cotizaciones
**100k usuarios activos mensuales**, supuesto Supabase Pro + Medium: USD 25 + USD 60 compute − USD 10 créditos = USD 75. Cloudflare Workers (si se usa) USD 5; R2 100 GB ≈ USD 1.35 almacenaje; CDN estática USD 0. **Subtotal hipotético: USD 81.35/mes**, SIN Google, exceso de Supabase, volumen R2, correo, logs, backups, soporte, pasarela ni impuestos. Medium no equivale a certificado de 100k simultáneos.

**1m usuarios activos mensuales**, supuesto Supabase Pro + XL: USD 25 + (900k × 0.00325) + USD 210 compute − USD 10 créditos = USD 3,150. Workers USD 5; R2 1 TB (1,000 GB) ≈ USD 14.85 almacenaje; CDN estática USD 0. **Subtotal hipotético: USD 3,169.85/mes**, SIN Google/otras sobrecuotas ni certificado de concurrencia; XL podría necesitar más potencia, réplica y configuración. Con 1 millón de búsquedas Nearby Search Pro adicionales, el ejemplo Google sería **USD 22,880** adicionales; con 3 millones de búsquedas, **USD 42,080** adicionales.

## 5. Viralidad e ingeniería
- 1m instalaciones ≠ 1m MAU ≠ 1m usuarios simultáneos.
- 100k personas conectadas, cada una haciendo 1 solicitud dinámica por minuto, equivalen a aproximadamente 1,667 solicitudes por segundo. La base de datos NO debe manejar directamente cada navegación de la web.
- CDN estática, directorio seguro con caché permitida, RLS para datos personales, límites de escritura, agrupación y colas, autoescalado de las partes necesarias, observabilidad, failover, backup, protección DDoS y modo degradado si Google se agota.
- Cachear solo datos propios o permitidos por la licencia. **No almacenar indefinidamente imágenes o fichas de Google Places fuera de las condiciones de Maps Platform**.
- La configuración cloud/DB deberá dimensionarse con pruebas de tráfico sintético en staging, no cargando el sitio público ni la API pagada.
- El propietario deberá conectar y autorizar Cloudflare/Google Cloud para ver facturas y aplicar presupuestos; este documento no crea cargos ni modifica facturación.
- Un límite de gasto demasiado estricto puede cortar funciones. Preparar el modo lectura/local para mantener búsquedas esenciales cuando un proveedor falla.

## 6. Influencers / creadores (hipótesis opcional)
Priorizar vínculo entre creador, lugar y reserva real: perfil verificado, enlace compartible y código de referencia, métricas agregadas, comisiones solo por reserva confirmada, contenido patrocinado marcado. Videos en `Experiencias` más adelante, tras piloto de seguridad y utilidad; costo extra por minutos vistos y moderación. **No abrir un feed de video infinito sin presupuesto y prueba comercial.**

**No realizar ninguna suscripción ni gasto antes de verificar el costo final del proveedor, el modelo de facturación y la cuenta del propietario.**

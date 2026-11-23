# Where to Go — plan de capacidad y control de gastos (23 noviembre 2026)

**100,000 usuarios mensuales NO equivale a 100,000 simultáneos.** La carga masiva aún no está certificada; la meta del piloto es República Dominicana.

## Arquitectura actual
- GitHub Pages distribuye archivos estáticos y el catálogo dominicano de fichas.
- Google Places (New) se consulta desde los navegadores de visitantes: una persona puede generar varias consultas por sesión, aun cuando una sola consulta devuelva muchos lugares/fotos.
- Supabase controla cuentas, perfiles, favoritos, solicitudes y fotos privadas. Su cifra de usuarios activos mensuales no garantiza una cantidad equivalente de conexiones simultáneas.
- La app tiene protección de ráfaga y de llamadas idénticas y espera ante errores de cuota. Estos controles de navegador **no son un límite global de gastos**.

## Pasos obligatorios en Google Cloud antes de publicidad o crecimiento
1. **Facturación → Informes:** elegir el proyecto exacto, últimos 30 días, agrupar por SKU y día. Registrar costos reales de Places, Maps JS, fotografía y otros SKU utilizados.
2. **Facturación → Presupuestos y alertas:** configurar un monto mensual conservador y avisos al 25%, 50%, 75%, 90% y 100%. **Las alertas no detienen cobros.**
3. **Google Maps Platform → Cuotas:** limitar solicitudes por minuto y, donde el método/SKU lo permita, por día. Ajustar con datos reales; una cuota demasiado baja también provoca fallos de búsqueda.
4. **APIs y servicios → Credenciales:** restringir la clave web a dominios reales y APIs necesarias. Usar claves separadas para web, Android e iOS.
5. **Supervisión:** detectar 429, 403, 5xx, exceso de uso y cambios inusuales de facturación; conservar el catálogo local accesible si Google falla.
6. **No almacenar en catálogo permanente** fotos/fichas de Google ni hacer consultas masivas fuera de las condiciones permitidas.

## Hipótesis de capacidad, NO gastos medidos
100,000 visitantes generando 2, 10 o 30 llamadas cobrables cada uno implicarían, respectivamente, 200,000, 1,000,000 o 3,000,000 eventos. Los precios cambian según SKU y tipo de consulta; **400 resultados con foto no equivalen a 400 eventos de pago**.
Si una visita descarga 2 MB desde nuestro alojamiento (solo ejemplo), 100,000 visitas representan 200 GB transferidos.

## Infraestructura
GitHub Pages tiene un límite flexible de 100 GB de ancho de banda por mes y no es alojamiento autorizado para explotar una plataforma SaaS comercial. Migrar a CDN/hosting apropiado antes de comercializar masivamente, sin perder el dominio y diseños.
Dimensionar Supabase: autenticaciones/minuto, peticiones a DB, conexiones, almacenamiento, RLS, supresión de usuarios y archivos privados.

## Plan gradual de pruebas
- **Ya automatizado:** 320 solicitudes de archivos contra localhost con hasta 20 simultáneas, sin tocar Google ni Supabase; NO es prueba de 100k usuarios.
- **Siguiente:** 100, 500 y 1,000 usuarios virtuales en un entorno staging de pago o permitido, sin llamadas facturables externas.
- **Posteriormente:** 5,000, 20,000 y hasta 100,000, solo si la infraestructura, los contratos y el presupuesto aprobados admiten tales pruebas.
- Registrar latencias p50/p95, fallos, ancho de banda, tiempos de carga, consumo Google por visitante y recuperación ante errores 429/403/5xx.

## Condiciones de lanzamiento
- Confirmar presupuesto, cuotas, restricciones de claves y alertas en Google Cloud.
- Verificar CDN productivo y métricas de 95 percentil, carga móvil, autenticación y errores.
- Validar consultas reales en las provincias, fotos auténticas, perfiles, privacidad y permisos administrativos.
- Simular caída de Google: mostrar fichas de República Dominicana disponibles sin inventar fotos ni mostrar una ciudad equivocada.
- Documentar cuándo detener una campaña ante anomalías y cómo recuperar el servicio.
- No proclamar garantía de 100,000 simultáneos antes de alcanzar esa prueba en staging.

**No se ha accedido a la factura Google Cloud del propietario, ni se han impuesto cuotas en su proyecto mediante este documento.**

Documentación oficial:
https://developers.google.com/maps/billing-and-pricing/manage-costs
https://developers.google.com/maps/billing-and-pricing/pricing
https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
https://supabase.com/docs/guides/deployment/going-into-prod

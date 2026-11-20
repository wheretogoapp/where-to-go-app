# Activación de Google Maps + Places — Where to Go

## Antes de activar
1. En Google Cloud Console, selecciona el proyecto correcto y vincula una cuenta de facturación.
2. Activa **Maps JavaScript API** y **Places API (New)** en el mismo proyecto.
3. Crea una **clave de API para sitios web** (no OAuth ni clave de servidor).
4. Restringe la clave por **sitios web (HTTP referrers)**:
   - `https://wheretogoapp.github.io/*`
   - Si se usa dominio propio, añadir `https://TU-DOMINIO/*` tras verificarlo.
5. Restringe también la clave por API: **Maps JavaScript API** y **Places API (New)**. Si Google exige otra API específica para alguna funcionalidad, revisarla antes de añadirla.
6. Establece alertas de presupuesto y cuotas; los presupuestos de Cloud **no son límites duros**. Configura límites de cuota cuando sea posible.

## Conexión en la app
- Editar `public/google-places-key.js`: `window.WTG_GOOGLE_MAPS_KEY='CLAVE_PUBLICA_RESTRINGIDA';`
- No añadir contraseñas, service-role, claves de servidor ni información de facturación.
- La búsqueda mundial se activa solo si hay clave válida y una ciudad con coordenadas.
- Si no hay clave, la navegación internacional sigue funcionando y muestra un estado honesto.
- La API no proporciona por sí sola el directorio completo de municipios ni licencias para guardar todas las fotos permanentemente.

## Pruebas obligatorias
- En la esquina, seleccionar Cuba → La Habana y Albania → Tirana: no deben aparecer resultados de Puerto Plata.
- Confirmar que el mapa y las fichas usan coordenadas del destino, no las del país piloto.
- Verificar que una categoría cargue resultados reales, que los lugares tengan enlaces de Maps y que los errores de facturación/permisos no bloqueen toda la app.
- Probar sesión con Google, favoritos, idioma y navegación móvil antes de aprobar producción.
- Vigilar costos reales en Google Cloud durante las primeras consultas.

## Nota de privacidad y atribución
- Mostrar atribución de Google cuando corresponda y respetar las condiciones de Google Maps Platform.
- No almacenar fotos ni datos de Places de forma incompatible con sus políticas.
- La clave de navegador es visible para cualquiera: su protección depende de las restricciones, no de ocultarla.

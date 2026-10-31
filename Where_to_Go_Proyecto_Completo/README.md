# Where to Go · V4.2 Premium · República Dominicana

**Sobre la web premium elegida**: esta versión se construyó a partir del proyecto V4.1 (diseño premium V3), preservando secciones de explorar, mapa, favoritos, taxis, promociones, mis negocios y geolocalización.

## Contenido efectivamente incluido

- 31 provincias + Distrito Nacional = **32 demarcaciones**.
- **158 municipios** en `public/data/municipios-rd.json` (los municipios están listados; la localización de cada uno mediante Nominatim necesita conexión).
- **32 fotografías provinciales distintas**, vinculadas a archivos de Wikimedia Commons de lugares reales de cada demarcación, declaradas en `public/data/province-heroes.json`. Una foto por provincia, no una foto individual para cada uno de los 158 municipios.
- Cada portada muestra lugar representado y vínculo a fotografía, autor/licencia. Las imágenes se descargan desde Wikimedia únicamente cuando se necesita esa provincia (no se cargan las 32 a la vez); si la descarga falla no se sustituye por una foto de otra provincia.
- Selector de portada por provincia, más selección de municipio para **mover el centro de búsqueda**. Solo la vista previa cambia de portada; **los resultados cercanos no cambian hasta confirmar ubicación**.
- Pantalla inicial de acceso con Google, Facebook, Apple y correo/contraseña, con implementación real de Supabase Auth, pendiente de conectar. **Nunca se simula un inicio de sesión real**; sin credenciales hay un modo demostración explícito.
- Autenticación configurada: sesión persistente, perfil de usuario, favoritos que pueden sincronizarse; registro de vistas **solo con consentimiento expreso**.
- Se conserva la lógica de cercanía de V4.1, Google Places opcional, respaldo con OpenStreetMap, y ficha de Clemente Transport VIP de Puerto Plata. Los errores de permisos de Google Cloud no se resuelven por este cambio.

## Instalación en el proyecto de GitHub existente

1. **No crees un sitio nuevo ni elimines los archivos antiguos.** Haz copia de seguridad en GitHub.
2. Descomprime el ZIP. Dentro están las carpetas `public`, `netlify`, `supabase`, y `netlify.toml`.
3. En el repositorio `wheretogoapp/where-to-go-app`, abre la carpeta actual `Where_to_Go_Proyecto_Completo`. Sustituye los archivos por los de este ZIP **sin crear otra carpeta anidada**.
4. Conserva el directorio base de Netlify `Where_to_Go_Proyecto_Completo`, publicación `public`, funciones `netlify/functions`. Revisa que el despliegue esté `Published`.
5. Prueba Santiago → Monumento, Pedernales → Bahía de las Águilas, Monte Cristi → entorno de El Morro, y las 32 provincias desde el selector. La imagen tiene que aparecer en línea según la conexión con Wikimedia.
6. El login real **no funciona hasta que configures Supabase**; la demo permite probar todo sin cuenta.

## Activar registro real con Supabase (sin volver a usar Google Places)

1. Crea un proyecto Supabase en https://supabase.com/dashboard. Si piden plan, revisa tarifas y comienza por el plan gratuito si está disponible.
2. En **SQL Editor**, ejecuta `supabase/schema.sql`, que crea `profiles`, `favorites` y `activity_events` con seguridad RLS, entre otras tablas.
3. En **Project Settings / API**, copia **Project URL** y **anon/publishable key** (públicas) a `public/config.js`:

```js
window.WTG_CONFIG = {
  supabaseUrl: 'https://TU-PROYECTO.supabase.co',
  supabaseAnonKey: 'TU_CLAVE_PUBLICA_PUBLISHABLE_O_ANON',
  requireLogin: true,
  allowDemo: false // cambiar a true para conservar un acceso demostración
};
```

**No incluyas** `service_role`, contraseñas ni secretos de terceros en GitHub.

4. En Supabase → Authentication → URL Configuration: configura `Site URL` con el dominio HTTPS de tu Netlify y `Redirect URLs` con la dirección raíz que utilizarás (por ejemplo, `https://reliable-daffodil-8673f5.netlify.app/**`).
5. Correo/contraseña: habilita proveedor Email en Supabase. Si confirmación por correo está activada, el usuario tendrá que verificar su correo.
6. **Google:** Supabase → Authentication → Providers → Google; en Google Cloud crea las credenciales OAuth web correspondientes (no reutilices la clave de Google Places). El redirect de OAuth autorizado será `https://<PROJECT-REF>.supabase.co/auth/v1/callback`. Aplica la guía oficial Supabase.
7. **Facebook:** crear una aplicación en Meta for Developers; configurar Facebook Login y permisos de `email`. Configurar ID y secret de Facebook en Supabase y misma URL de callback.
8. **Apple:** cuenta/configuración en Apple Developer, crear App ID y Services ID, dominio/callback del login web y credenciales Apple en Supabase. Puede requerir membresía de Apple Developer (costos sujetos a Apple).
9. Publica y prueba en HTTPS con cuentas reales, proveedores autorizados y políticas completas. Si aún no habilitaste un proveedor, su botón debe mostrar el error del proveedor, no crear una cuenta falsa.

## Datos y privacidad

La app pide ubicación solo con permiso del navegador. El GPS se utiliza para encontrar lugares cercanos y no se registra automáticamente en `activity_events`. Las vistas se guardan **solo con opt-in**; desmarcar el consentimiento impide nuevos registros. Antes del lanzamiento comercial: implementar eliminación/exportación de datos, política de retención, soporte y una política de privacidad adaptada a la ley aplicable.

Las fotografías se sirven desde Wikimedia Commons, sujetas a sus licencias individuales; la ficha de cada fotografía está enlazada en la portada. Las fotografías de lugares cercanos no se sustituyen por otras genéricas.

## Limitaciones que no se deben ocultar

- 32 portadas de provincias + 158 municipios listados **no es** un catálogo verificado de todos los negocios y balnearios del país.
- Falta probar en Netlify y en dispositivos reales las fotografías remotas, GPS, login de proveedores y rendimiento en producción.
- Google Places todavía puede devolver `403 PERMISSION_DENIED` por cuenta/proyecto de facturación; esta entrega no modifica esas credenciales ni promete resolverlo.
- Los registros de promoción comercial siguen siendo fichas de prueba sin pago; falta backend y facturación.

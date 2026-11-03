# WHERE TO GO V6.0 — UNA SOLA ACTUALIZACIÓN, EL MISMO PROYECTO

**Esta entrega actualiza la web/PWA móvil ya existente. No crea una segunda web ni una aplicación nativa para App Store/Google Play.**

## Qué cambia

- Inicio de sesión: paisaje real de la zona elegida con carrusel, créditos, anterior/siguiente/pausa, diseño móvil y escritorio.
- Inicio: carrusel de destinos reales, con autoplay a 7 segundos, controles y licencia; en Puerto Plata hay fotografías vinculadas a **Puerto Plata aérea, Fortaleza San Felipe, 27 Charcos de Damajagua y Plaza Independencia**. Otras provincias conservan su portada de origen.
- Descubrimiento: sección de destinos turísticos cercanos que rota a 8,5 segundos, prioriza los lugares con foto vinculada; filtros de servicios siguen intactos.
- Publicidad: anuncio Premium rotativo a 9 segundos **solo en su provincia**, solamente cuando la ficha tiene aprobación, verificación de pago y vigencia. Los Destacados conservan posición en su categoría; no aparecen en portada. Clemente Transport VIP mantiene bloque editorial fijo en Puerto Plata.
- Clemente Transport VIP: web `https://clementetransportvip.com/`, teléfono `+1 829-586-9111`, WhatsApp `wa.me/18295869111`.
- Móviles: diseño revisado en anchos de 320, 375, 390, 430, 768 y 1366 px, tipografía fluida, botones táctiles, barra móvil, deslizamiento seguro.
- Fuentes: OpenStreetMap y herramienta **opcional** de Overture Maps que lee puntos reales, filtra la frontera de RD, descarta entradas de baja confianza, evita duplicados por nombre y distancia y conserva teléfonos y sitios web cuando existen.
- Fotos: cinco fichas turísticas precargadas con imagen auténtica y licencia/fuente atribuida, y proceso existente de enriquecimiento con Wikimedia/Wikidata. Una foto no disponible NO se sustituye con la foto de otro negocio.
- Seguridad inicial: cabeceras de seguridad en Netlify, controles de consentimiento, autenticación preparada con Supabase y políticas RLS en SQL, moderación de anuncios y formularios. No existe sistema inmune a ataques.
- PWA web: se puede agregar a la pantalla de inicio de iPhone/Android, no es APK/IPA todavía.

## IMPORTANTE: CONSERVAR LOS NEGOCIOS YA IMPORTADOS

**NO BORRES `Where_to_Go_Proyecto_Completo/public/data/places/`** en tu repositorio. Este ZIP excluye deliberadamente `data/places/manifest.json` y las celdas `cell_*.json` porque esos datos los generó GitHub Actions y no se pueden recuperar íntegros desde el ZIP original. Subir un manifest con `recordCount: 0` volvería a dejar las categorías vacías.

**No uses esta entrega como un nuevo sitio de Netlify Drop**, pues no contiene los datos nacionales ya importados. Actualiza el GitHub que YA está conectado a Netlify.

## Pasos para subirlo UNA SOLA VEZ

1. Conserva una copia de tu repositorio actual. En Windows, es más sencillo usar **GitHub Desktop**: `File → Clone repository → wheretogoapp/where-to-go-app`, si aún no está descargado.
2. **Descomprime el ZIP**. Dentro aparecerán `.github` y `Where_to_Go_Proyecto_Completo`. Copia esas carpetas a la **raíz del repositorio**, combinando/reemplazando archivos de mismo nombre. NO elimines ni reescribas la carpeta de datos importados `public/data/places/`.
3. En GitHub Desktop, revisa los archivos modificados y haz **Commit to main → Push origin**. La rama principal puede verse en español como `principal`; el identificador técnico es `main`. Si prefieres GitHub web, sube los archivos manteniendo las mismas rutas, incluida `.github/workflows`.
4. En Netlify revisa que el despliegue del **mismo sitio** termine en `Published`. En la PC recarga con `Ctrl+Shift+R`. En el celular abre la dirección publicada con HTTPS y prueba las portadas, los botones y la sección Transporte.
5. Comprueba `https://reliable-daffodil-8673f5.netlify.app/data/places/manifest.json`. El campo `recordCount` **debe seguir siendo mayor que cero** y no debe perder las celdas generadas. Si aparece 0, hay que restaurar el catálogo desde el último commit de importación.

## Importación opcional de Overture (después de actualizar, no automática)

En GitHub → Actions → **Where to Go - Cargar directorio real de RD** → `Run workflow`. Si deseas descargar la fuente adicional, activa `incluir_overture`. Primero se genera el catálogo OSM, luego se descarga Overture (puede tardar y consumir recursos de GitHub), se filtra RD y se fusionan los puntos tras eliminar duplicados. **Esta entrega NO contiene esos datos descargados.** La importación puede fallar por red, memoria o cambios en el proveedor: revisa la ejecución antes de anunciar nuevas cifras. Los proveedores tienen distintas condiciones de licencia, incluidas las de ODbL cuando reutilizamos OSM; mantenemos atribuciones.

## Inicio con Google, Apple, Facebook y correo

La interfaz está construida y `public/auth.js` permite usar Supabase cuando se configura. **NO está conectado a cuentas reales** en el ZIP: `public/config.js` contiene `supabaseUrl` y `supabaseAnonKey` vacíos. Se necesita crear/configurar un proyecto Supabase, ejecutar `supabase/schema.sql`, habilitar confirmación por email y añadir URL HTTPS en Redirect URLs. Para Google, Facebook y Apple hay que configurar cada proveedor en Supabase y sus consolas oficiales. No uses claves `service_role` en archivos públicos. Por ahora se permite *Explorar demostración*.

## Seguridad / anuncios

- No hay cobros automáticos, ni claves de procesadores de pago, ni un admin público; las solicitudes se revisan manualmente.
- Usa autenticación de dos factores en GitHub, Netlify y Supabase. Configura permisos por propietario, copias de seguridad y supervisión cuando habilitemos registro real.
- La V6.0 añade cabeceras `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, CSP limitada y HSTS. Esto **no** es una auditoría completa de seguridad.
- Para publicidad real en producción, completar revisión de negocios, comprobación de pagos, facturación y moderación.

## Qué sigue pendiente

El directorio nunca puede garantizar *todos* los negocios del mundo, y aún hay fichas sin fotos/teléfonos. La fuente Overture es un canal adicional opcional, no un catálogo importado dentro de este ZIP. El ingreso con cuentas sociales, los pagos y el sistema mundial por países requieren configuración y pruebas reales antes de venderlos como activos. Esta V6.0 mejora **la experiencia móvil, los paisajes, los carruseles y la base técnica**, conservando los lugares importados que ya tienes en GitHub.

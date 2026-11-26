# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Miembros de grupos cerrados (audiencia principal):** Personas en Argentina y Latam que comparten gastos (partidos, salidas, facultad, trabajo) y acceden desde enlaces privados de WhatsApp (`?token=`) principalmente desde el celular para copiar un alias o CBU/CVU en un toque, o proponer el suyo para aprobación.
- **Administradores y moderadores de grupo:** Quienes crean un grupo, comparten el enlace de lectura y usan su enlace/token de administración (`admin_token` / `adm_...`) para confirmar o descartar solicitudes pendientes.
- **Administrador central:** Quien gestiona la planilla completa desde el panel administrativo (`admin.html` web o sidebar de Google Sheets) mediante `adminKey`, incluyendo alta/edición de contactos, tokens, grupos e importación/exportación CSV.

## Product Purpose

Eliminar la fricción de pedir y reenviar datos bancarios en chats grupales. El producto permite consultar al instante alias y CBU/CVU de los integrantes de un grupo cerrado y copiarlos al portapapeles en un único gesto, manteniendo los datos sincronizados con una planilla de Google Sheets sin requerir cuentas de usuario ni contraseñas para los participantes.

## Positioning

Directorio de pagos entre pares 100 % sin servidor ni registro: usa Google Sheets + Google Apps Script como backend propio y tokens por enlace para aislar grupos privados sin exponer el resto del directorio, con copia instantánea en un toque y operación íntegra dentro de archivos estáticos alojados en GitHub Pages o Apps Script.

## Operating Context

- **Distribución por WhatsApp:** El punto de entrada principal es un enlace segmentado (`?token=...` o `?grupo=...`) abierto desde navegadores móviles.
- **Doble entorno de ejecución:** El frontend se sirve en GitHub Pages (`index.html`, `admin.html`) y puede empaquetarse o abrirse desde Google Apps Script (`HtmlService`), incluyendo el panel de administración dentro de la barra lateral de Google Sheets (`300px` de ancho).
- **Resiliencia ante conectividad variable:** Uso frecuente en movimiento con fallbacks locales y manejo de caché en `localStorage` cuando la red o la API de Apps Script demora o falla.

## Capabilities and Constraints

- **Arquitectura sin servidor obligatorio:** Persistencia exclusiva en Google Sheets (`Cuentas` y `Grupos`) y `ScriptProperties` vía `Code.js`; no existe base de datos externa ni login con contraseña para usuarios finales.
- **Aislamiento por token privado:** Un enlace con `?token=` resuelve un único grupo en servidor sin filtrar otros grupos ni permitir enumeración del directorio completo.
- **Flujo colaborativo moderado:** Los participantes pueden proponer altas o ediciones (generando `edit_token` local y estado `PENDIENTE`), que quedan sujetas a confirmación de un administrador o se publican directo si quien carga posee privilegio de admin.
- **Copia en 1 clic y datos bancarios locales:** Soporte para alias bancario y CBU/CVU de 22 dígitos (validación de longitud/dígito BCRA, detección de bancos/fintech argentinas y titular alternativo).
- **Compatibilidad de ancho mínimo:** Debe operar sin roturas desde `300px` (sidebar de Google Sheets) y móviles estrechos hasta pantallas de escritorio.
- **Invariante de URL en producción:** Las actualizaciones de Apps Script deben preservar el `deploymentId` activo y el acceso público anónimo verificado por `scripts/check-access.js`.

## Brand Commitments

- **Nombre:** `AliasDB` (`AliasDB // Directorio Bancario` y `AliasDB // Panel de Administración`).
- **Voz y tono:** Español rioplatense (voseo natural: *"Ingresá"*, *"Copiá"*, *"Sos Administrador"*), microcopy directo, claro y utilitario orientado a la acción inmediata.
- **Activos confirmados:** Logotipo e ícono propios (`logo.svg`, `favicon.svg`) e iconografía vectorial inline de Reicon sin dependencias externas pesadas.

## Evidence on Hand

- `index.html`: Aplicación pública SPA (directorio, buscador, filtros de grupo/entidad, recientes, creación de grupos, alta/edición de alias y moderación).
- `admin.html`: Panel de administración central (KPIs, directorio agrupado, gestión de grupos y tokens, Quick-Add, importación/exportación CSV y vínculo de planilla).
- `Code.js` y `appsscript.json`: Backend REST/RPC en Google Apps Script con `LockService`, seeding demo y hojas `'Cuentas'` / `'Grupos'`.
- `README.md` y `package.json`: Documentación de arquitectura, endpoints y scripts de prueba (`npm test`) y despliegue (`npm run deploy`, `npm run check:access`).
- `favicon.svg` y `logo.svg`: Activos gráficos de identidad del proyecto.
- `scripts/`: Suite de verificación (`test-admin.js`, `test-phase2.js`, `check-icons.js`, `test-multi-groups.js`, `test-pending-and-groups.js`, `test-new-features.js`, `check-access.js`).
- **Ausencias explícitas:** No existen testimonios reales, métricas de uso en producción ni páginas legales/404 dedicadas; futuros diseños no deben fabricarlos.

## Product Principles

1. **Un toque para cobrar o transferir:** La acción primaria es copiar el alias o CBU/CVU sin pasos intermedios ni fricción de autenticación.
2. **Privacidad por segmento, cero cuentas:** Compartir un grupo por enlace no debe exponer otros círculos ni exigir registro previo.
3. **Resiliencia en mobile y `300px`:** Cada flujo crítico debe funcionar con comodidad con el pulgar y dentro de la barra lateral de Google Sheets.
4. **Autoservicio con resguardo:** Cualquier miembro puede proponer o corregir su alias, pero la confirmación administrativa protege el directorio frente a errores o suplantaciones.
5. **Autonomía estática:** El frontend funciona como SPA autocontenida compatible con GitHub Pages y Apps Script sin depender de servidores propios ni toolchains complejos en runtime.

## Accessibility & Inclusion

- **Estándar requerido:** Cumplimiento **WCAG 2.1 Nivel AA** en todas las vistas públicas y administrativas (`index.html` y `admin.html`), incluyendo contraste mínimo de texto (`>= 4.5:1`) y componentes/focos (`>= 3:1`), operación íntegra por teclado, semántica nativa en formularios/modales/tablas, anuncios correctos para lectores de pantalla y respeto por `prefers-reduced-motion` y modos de alto contraste.

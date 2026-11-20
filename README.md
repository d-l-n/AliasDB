# AliasDB | WebApp de Pagos Rápidos (GitHub Pages + Apps Script API)

Aplicación web *mobile-first* desplegada en **GitHub Pages** con estilo **Neo-Brutalista** (Modo Claro y Modo Oscuro) y sincronización con **Google Apps Script & Google Sheets**, diseñada para gestionar y compartir de forma inmediata los alias bancarios y CBU/CVU de un grupo de contactos.

- **Frontend en Producción**: [https://d-l-n.github.io/AliasDB/](https://d-l-n.github.io/AliasDB/)
- **Panel de Administración**: [https://d-l-n.github.io/AliasDB/admin.html](https://d-l-n.github.io/AliasDB/admin.html)
- **Repositorio GitHub**: [https://github.com/d-l-n/AliasDB](https://github.com/d-l-n/AliasDB)
- **Backend API (Apps Script)**: `https://script.google.com/macros/s/AKfycbz7Pp_RisFpuIFiAycBSL4EJXpydQZRfToR7T-Wd7-Hoaio1n2A4KzUm4d8WAEKVtqeQg/exec`

Permite que cada contacto tenga **1 o más cuentas bancarias/billeteras virtuales**, con copiado en **1 solo clic** tanto tocando directamente el alias como pulsando el botón dedicado.

---

## 🚀 Características Principales

- **Diseño Neo-Brutalista Refinado**:
  - Bordes negros macizos de 2.5px y sombras rígidas sin difuminar (`box-shadow: 4px 4px 0px`).
  - Pulsación mecánica háptica y táctil (`active:translate(2px, 2px)`).
  - Soporte completo y nativo para **Modo Claro** y **Modo Oscuro** con toggle persistente en `localStorage` y prevención de FOUC (*Flash of Un-themed Content*).
- **Mobile First & Ergonomía de Pulgar**:
  - Áreas de toque mínimas de 44x44px.
  - Buscador predictivo en tiempo real que filtra por nombre de persona, grupo, banco o alias.
  - Barra de chips para filtrado rápido por entidad (Mercado Pago, Galicia, Santander, Brubank, Lemon, etc.).
- **Mecánica de Copiado en 1 Clic (Dual-Access)**:
  - **Tocar el chip del alias**: Copia la cadena al portapapeles y emite una animación de destello en color menta neón.
  - **Botón dedicado con icono de copiado Reicon**: Para usuarios habituados a botones explícitos de acción.
  - Compatible con CBU/CVU de 22 dígitos en bloque colapsable/expandible.
  - **Accesibilidad**: Región en vivo (`role="status"`, `aria-live="polite"`) con solución para anuncios repetidos en VoiceOver/TalkBack (`\u00A0`).
- **Iconografía Vectorial Pixel-Perfect**:
  - Reemplazo integral de emojis y glifos antiguos por iconos SVG de código abierto de [Reicon](https://reicon.dev/icons).
  - Embebidos de forma atómica y sin dependencias pesadas de red, asegurando renderizado inmediato (cero FOUC) tanto en GitHub Pages como dentro de Google Apps Script.
- **Múltiples Cuentas por Persona**:
  - Cada persona puede poseer N cuentas (ej. Mercado Pago, Galicia, Santander en USD, etc.).
  - Soporte para especificar titulares alternativos si una cuenta no está a nombre de la persona.
- **Backend Robusto en Google Sheets**:
  - Persistencia en hoja `'Cuentas'`.
  - Modo Container-Bound (hoja de cálculo vinculada) o Standalone (crea y vincula automáticamente la hoja `DB_Personas_Alias`).
  - Auto-poblado de datos demo (seed inicial) si la base de datos está vacía.
  - Métodos RPC atómicos con exclusión mutua (`LockService`).

---

## 📁 Estructura del Proyecto

```
AliasDB/
├── Code.js              # Controlador de Apps Script (doGet, RPCs, gestión de Google Sheets y Seeding)
├── index.html           # Interfaz SPA Mobile-First Neo-Brutalista (HTML, CSS y JS integrados)
├── appsscript.json      # Manifiesto de configuración de Google Apps Script (V8 Runtime)
├── scripts/
│   └── check-access.js  # Verificador automatizado de acceso anónimo público ("Cualquier usuario")
├── package.json         # Scripts de ciclo de vida seguros y automatización clasp/git
└── README.md            # Documentación técnica e instrucciones de despliegue
```

---

## 🛠️ Paso a Paso: Despliegue en Google Apps Script

### Opción 1: Vinculado a Google Sheets (Recomendado)

1. Abre [Google Sheets](https://sheets.new) y crea una hoja de cálculo nueva (por ejemplo, llamada `DB_Personas_Alias`).
2. En el menú superior, ve a **Extensiones** > **Apps Script**.
3. Reemplaza el contenido de `Código.gs` con el código de `Code.js`.
4. Haz clic en el botón `+` (Añadir archivo) > **HTML** y nómbralo exactamente `Index` (se creará `Index.html`).
5. Pega todo el contenido de `Index.html`.
6. En la barra lateral izquierda, ve a **Configuración del proyecto** (ícono de engranaje ⚙️) y marca la casilla **"Mostrar el archivo de manifiesto 'appsscript.json' en el editor"**.
7. Vuelve al editor (< >), abre `appsscript.json` y asegúrate de que tenga el contenido provisto en este repositorio.

### Opción 2: Standalone Script (Script Autónomo)

1. Ingresa a [script.google.com](https://script.google.com) y crea un nuevo proyecto.
2. Copia `Code.js`, `Index.html` y `appsscript.json`.
3. Al ejecutarse por primera vez, el backend detectará que no hay hoja vinculada, creará automáticamente un Google Sheet titulado `DB_Personas_Alias` en tu Google Drive y guardará su ID en las propiedades del script.

---

## 🌐 Publicación y Actualizaciones de la Aplicación Web (Web App)

> [!IMPORTANT]
> **Regla de Invariante de URL**: Jamás cree implementaciones adicionales (*"Nueva implementación"*). Para actualizar el backend sin cambiar la URL pública (`/exec`), edite siempre la implementación activa existente desde **Administrar implementaciones** o utilice los scripts automatizados de `package.json`.

### Actualización de Código en Producción

- **Vía Terminal (Recomendado y Seguro)**:
  ```bash
  npm run deploy
  ```
  Ejecuta secuencialmente:
  1. `npx @google/clasp push -f`: sincroniza el código a Apps Script sin invocar la API de deployment (evita el bug de Apps Script que revierte permisos a privado).
  2. `node scripts/check-access.js`: valida de forma autónoma mediante petición HTTP sin credenciales que el endpoint responda JSON públicamente con *"Cualquier usuario"*.
  3. `git push origin master`: publica las actualizaciones del frontend directamente en GitHub Pages.

- **Vía Consola Web de Apps Script (Si se requiere crear una nueva versión de producción en la misma implementación)**:
  1. En el editor de Apps Script, vaya a **Implementar** > **Administrar implementaciones**.
  2. Seleccione la implementación activa (`AKfycbz7Pp_...`) y pulse **Editar** (✏️).
  3. En **Versión**, seleccione **Nueva versión**.
  4. Confirme que **Quién tiene acceso** permanezca en **Cualquier usuario** (*Anyone*).
  5. Pulse **Guardar** (la URL `/exec` se mantiene 100% idéntica).

---

## 📊 Estructura de Datos en Google Sheets

La pestaña `'Cuentas'` utiliza las siguientes columnas formateadas como texto plano (`@`):

| Columna | Campo | Descripción |
| :--- | :--- | :--- |
| A | `id_persona` | Identificador único de la persona (ej: `persona_martin_gomez`) |
| B | `nombre_persona` | Nombre y apellido de la persona (ej: `Martín Gómez`) |
| C | `grupo` | Etiqueta o grupo opcional (ej: `Fútbol`, `Facultad`) |
| D | `id_cuenta` | Identificador único de la cuenta bancaria |
| E | `entidad_banco` | Banco o billetera (ej: `Mercado Pago`, `Banco Galicia`) |
| F | `tipo_cuenta` | Tipo de cuenta (`CVU`, `Caja de Ahorro $`, etc.) |
| G | `alias` | Alias bancario copiable (ej: `martin.mp.futbol`) |
| H | `cbu_cvu` | CBU o CVU numérico de 22 dígitos |
| I | `titular_diferente` | Nombre del titular si no coincide con la persona |

---

## 👥 Segmentación Multi-Grupo y Enlaces Privados

AliasDB permite segmentar y compartir vistas aisladas para diferentes círculos (por ejemplo: amigos de fútbol, facultad, compañeros de trabajo):

- **Vista General**: Acceso directo sin parámetros muestra todos los contactos con selector de chips interactivo por grupo.
- **Filtro Directo por Grupo**: Agregando `?grupo=Fútbol` a la URL, la vista pública se filtra automáticamente y muestra un badge neo-brutalista en el encabezado con el nombre del grupo activo.
- **Aislamiento mediante Token Privado**: Agregando `?token=futbol_7x9k` a la URL, el backend resuelve el grupo asociado a través del registro seguro en `ScriptProperties`. Esto permite compartir enlaces sin exponer el nombre interno del grupo ni permitir la enumeración de otros registros.

---

## 🔧 Panel de Administración (`admin.html`)

El panel de administración es una SPA estática independiente que interactúa con la API REST de Apps Script:

- **Autenticación `adminKey`**: Protegido por una clave de administración persistida en `localStorage` y validada server-side contra `ScriptProperties` (`ADMIN_KEY`).
- **Dashboard Estadístico**: Contadores en vivo de personas, cuentas bancarias, grupos y tokens activos.
- **Directorio Agrupado**: Visualización por grupos con acciones rápidas para renombrar en lote o generar enlaces de acceso directo.
- **Modal CRUD de Personas**: Alta y edición de contactos con cuentas dinámicas múltiples y eliminación atómica.
- **Quick-Add con Auto-Detección**: Caja de pegado rápido de texto libre que detecta CBU/CVU de 22 dígitos, resuelve la entidad bancaria según su prefijo numérico oficial de 3 dígitos (ej: 007 Galicia, 072 Santander, 143 Brubank) y clasifica fintechs por alias.
- **Gestor de Tokens**: Generación, listado y revocación de tokens seguros con botón de 1-clic para copiar la URL lista para compartir.
- **Importación y Exportación CSV**: Descarga de respaldos y subida en lote con parser compatible RFC 4180, dropzone y previsualización previa.

---

## 📡 Router REST API (`Code.js`)

| Acción | Método | Autenticación | Parámetros | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `getFriends` | `GET` | Pública | `grupo?`, `token?` | Retorna lista de personas filtrada por grupo o token (o completa). |
| `getGroups` | `GET` | Pública | Ninguno | Retorna lista ordenada de grupos existentes en la hoja. |
| `save` | `GET` / `POST` | `adminKey` | `payload` (JSON) | Crea o actualiza una persona con sus cuentas. |
| `deleteFriend` | `GET` / `POST` | `adminKey` | `id` | Elimina una persona y todas sus cuentas asociadas. |
| `deleteAccount` | `GET` / `POST` | `adminKey` | `id` | Elimina una cuenta bancaria puntual. |
| `getTokens` | `GET` | `adminKey` | Ninguno | Retorna mapa de tokens activos. |
| `generateToken` | `GET` | `adminKey` | `grupo` | Genera y registra un token para el grupo indicado. |
| `revokeToken` | `GET` | `adminKey` | `token` | Revoca y elimina un token activo. |
| `renameGroup` | `GET` | `adminKey` | `oldName`, `newName` | Renombra un grupo en todas las filas y tokens sincronizados. |
| `getSpreadsheetInfo` | `GET` | `adminKey` | Ninguno | Retorna ID, nombre y URL del Google Sheet vinculado. |


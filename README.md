# AliasDB | WebApp de Pagos Rápidos (GitHub Pages + Apps Script API)

Aplicación web *mobile-first* desplegada en **GitHub Pages** con estilo **Neo-Brutalista** (Modo Claro y Modo Oscuro) y sincronización con **Google Apps Script & Google Sheets**, diseñada para gestionar y compartir de forma inmediata los alias bancarios y CBU/CVU de un grupo de contactos.

- **Frontend en Producción**: [https://d-l-n.github.io/AliasDB/](https://d-l-n.github.io/AliasDB/)
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
  - Buscador predictivo en tiempo real que filtra por nombre de amigo, grupo, banco o alias.
  - Barra de chips para filtrado rápido por entidad (Mercado Pago, Galicia, Santander, Brubank, Lemon, etc.).
- **Mecánica de Copiado en 1 Clic (Dual-Access)**:
  - **Tocar el chip del alias**: Copia la cadena al portapapeles y emite una animación de destello en color menta neón.
  - **Botón dedicado con icono (📋)**: Para usuarios habituados a botones explícitos de acción.
  - Compatible con CBU/CVU de 22 dígitos en bloque colapsable/expandible.
  - **Accesibilidad**: Región en vivo (`role="status"`, `aria-live="polite"`) con solución para anuncios repetidos en VoiceOver/TalkBack (`\u00A0`).
- **Múltiples Cuentas por Amigo**:
  - Cada amigo puede poseer N cuentas (ej. Mercado Pago, Galicia, Santander en USD, etc.).
  - Soporte para especificar titulares alternativos si una cuenta no está a nombre del amigo.
- **Backend Robusto en Google Sheets**:
  - Persistencia en hoja `'Cuentas'`.
  - Modo Container-Bound (hoja de cálculo vinculada) o Standalone (crea y vincula automáticamente la hoja `DB_Amigos_Alias`).
  - Auto-poblado de datos demo (seed inicial) si la base de datos está vacía.
  - Métodos RPC atómicos con exclusión mutua (`LockService`).

---

## 📁 Estructura del Proyecto

```
AliasDB/
├── Code.js              # Controlador de Apps Script (doGet, RPCs, gestión de Google Sheets y Seeding)
├── index.html           # Interfaz SPA Mobile-First Neo-Brutalista (HTML, CSS y JS integrados)
├── appsscript.json      # Manifiesto de configuración de Google Apps Script (V8 Runtime)
└── README.md            # Documentación técnica e instrucciones de despliegue
```

---

## 🛠️ Paso a Paso: Despliegue en Google Apps Script

### Opción 1: Vinculado a Google Sheets (Recomendado)

1. Abre [Google Sheets](https://sheets.new) y crea una hoja de cálculo nueva (por ejemplo, llamada `DB_Amigos_Alias`).
2. En el menú superior, ve a **Extensiones** > **Apps Script**.
3. Reemplaza el contenido de `Código.gs` con el código de `Code.js`.
4. Haz clic en el botón `+` (Añadir archivo) > **HTML** y nómbralo exactamente `Index` (se creará `Index.html`).
5. Pega todo el contenido de `Index.html`.
6. En la barra lateral izquierda, ve a **Configuración del proyecto** (ícono de engranaje ⚙️) y marca la casilla **"Mostrar el archivo de manifiesto 'appsscript.json' en el editor"**.
7. Vuelve al editor (< >), abre `appsscript.json` y asegúrate de que tenga el contenido provisto en este repositorio.

### Opción 2: Standalone Script (Script Autónomo)

1. Ingresa a [script.google.com](https://script.google.com) y crea un nuevo proyecto.
2. Copia `Code.js`, `Index.html` y `appsscript.json`.
3. Al ejecutarse por primera vez, el backend detectará que no hay hoja vinculada, creará automáticamente un Google Sheet titulado `DB_Amigos_Alias` en tu Google Drive y guardará su ID en las propiedades del script.

---

## 🌐 Publicación y Actualizaciones de la Aplicación Web (Web App)

> [!IMPORTANT]
> **Regla de Invariante de URL**: Jamás cree implementaciones adicionales (*"Nueva implementación"*). Para actualizar el backend sin cambiar la URL pública (`/exec`), edite siempre la implementación activa existente desde **Administrar implementaciones** o utilice los scripts automatizados de `package.json`.

### Actualización de Código en Producción

- **Vía Terminal (Recomendado)**:
  ```bash
  npm run deploy:all
  ```
  Sincroniza el código a Apps Script, actualiza la misma implementación activa (`AKfycbz7Pp_...`) y publica en GitHub Pages.

- **Vía Consola Web de Apps Script**:
  1. En el editor, vaya a **Implementar** > **Administrar implementaciones**.
  2. Seleccione la implementación activa (`AKfycbz7Pp_...`) y pulse **Editar** (✏️).
  3. En **Versión**, seleccione **Nueva versión**.
  4. Confirme que **Quién tiene acceso** permanezca en **Cualquier usuario** (*Anyone*).
  5. Pulse **Guardar** (la URL `/exec` se mantiene 100% idéntica).

---

## 📊 Estructura de Datos en Google Sheets

La pestaña `'Cuentas'` utiliza las siguientes columnas formateadas como texto plano (`@`):

| Columna | Campo | Descripción |
| :--- | :--- | :--- |
| A | `id_amigo` | Identificador único del amigo (ej: `amigo_martin_gomez`) |
| B | `nombre_amigo` | Nombre y apellido del contacto (ej: `Martín Gómez`) |
| C | `grupo` | Etiqueta o grupo opcional (ej: `Fútbol`, `Facultad`) |
| D | `id_cuenta` | Identificador único de la cuenta bancaria |
| E | `entidad_banco` | Banco o billetera (ej: `Mercado Pago`, `Banco Galicia`) |
| F | `tipo_cuenta` | Tipo de cuenta (`CVU`, `Caja de Ahorro $`, etc.) |
| G | `alias` | Alias bancario copiable (ej: `martin.mp.futbol`) |
| H | `cbu_cvu` | CBU o CVU numérico de 22 dígitos |
| I | `titular_diferente` | Nombre del titular si no coincide con el amigo |

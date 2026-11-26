---
name: AliasDB
description: Sistema Neo-Brutalista utilitario de alto contraste para copiar alias bancarios y CBU/CVU en un toque.
colors:
  highlighter-yellow: "#FFE600"
  neon-mint: "#2DF8C5"
  electric-cyan: "#00F0FF"
  lilac-accent: "#B57BFF"
  coral-pink: "#FF5EAC"
  tangerine-accent: "#FF6B00"
  crimson-alert: "#FF3B30"
  cobalt-link: "#2563EB"
  chalk-paper: "#F7F5F0"
  pure-white: "#FFFFFF"
  warm-stone: "#EDE9DF"
  carbon-ink: "#0D0D11"
  slate-muted: "#4B4B58"
  obsidian-canvas: "#121214"
  graphite-surface: "#1E1E22"
  graphite-muted: "#28282E"
  graphite-elevated: "#24242A"
  ash-muted: "#A1A1AA"
typography:
  display:
    fontFamily: "'Space Grotesk', system-ui, -apple-system, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "'Space Grotesk', system-ui, -apple-system, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "'Space Grotesk', system-ui, -apple-system, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0em"
  body:
    fontFamily: "'Space Grotesk', system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0em"
  label:
    fontFamily: "'Space Grotesk', system-ui, -apple-system, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.05em"
  mono:
    fontFamily: "'JetBrains Mono', SFMono-Regular, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.01em"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  pill: "9999px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.highlighter-yellow}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.electric-cyan}"
    textColor: "{colors.carbon-ink}"
  button-mint:
    backgroundColor: "{colors.neon-mint}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-danger:
    backgroundColor: "{colors.crimson-alert}"
    textColor: "{colors.pure-white}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  filter-chip:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "38px"
  filter-chip-active:
    backgroundColor: "{colors.highlighter-yellow}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.pill}"
  friend-card:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.lg}"
    padding: "12px 14px"
  search-input:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.md}"
    padding: "0 44px"
    height: "50px"
  alias-chip:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.carbon-ink}"
    rounded: "{rounded.sm}"
    padding: "6px 8px"
---

# Design System: AliasDB

## Overview

**Creative North Star: "La Libreta del Grupo"**

AliasDB adopta la lógica de un tarjetero físico cercano con pestañas y etiquetas cromáticas por entidad bancaria: directo, cercano y táctil, con alto contraste y legibilidad inmediata desde el celular. Cada persona es una ficha autocontenida, cada cuenta es una ranura con su sello de banco y cada alias funciona como una tecla mecánica lista para copiarse en un solo toque.

El lenguaje Neo-Brutalista del sistema rechaza explícitamente la estética bancaria corporativa fría, el glassmorphism difuso, los gradientes decorativos en superficies de interfaz, las sombras blandas y los microtextos ornamentales. La jerarquía se construye con bordes macizos, bloques de color plano y desplazamiento mecánico tangible al interactuar.

**Key Characteristics:**
- Directo, cercano y táctil, optimizado para operación con el pulgar desde enlaces compartidos por WhatsApp.
- Alto contraste y legibilidad instantánea mediante superficies planas, bordes sólidos de 2px–3px y tipografía monoespaciada en datos bancarios.
- Etiquetas cromáticas por entidad financiera argentina que permiten identificar bancos y billeteras de un vistazo.
- Respuesta mecánica física: sombras rígidas sin difuminado (`4px 4px 0px` y `2px 2px 0px`) que colapsan al presionar.

## Colors

Paleta de alto contraste basada en papel cálido o lienzo nocturno con tinta maciza y acentos neón planos dedicados a acción, confirmación y entidades bancarias.

### Primary
- **Amarillo Resaltador** (#FFE600): Color de acción primaria en modo claro, filtro de banco activo, botón dedicado de copia de alias, pestañas seleccionadas y píldoras administrativas.
- **Menta Neón** (#2DF8C5): Acento de confirmación, feedback positivo al copiar al portapapeles (toast y pulso táctil), chips activos de grupo y CTA contextual para sumar alias.
- **Cian Eléctrico** (#00F0FF): Acento primario de interacción, hover y foco en modo oscuro; también identifica acciones secundarias destacadas (copiar enlace de grupo, Quick-Add y tokens).

### Secondary
- **Lila Acento** (#B57BFF): Identificación de portabilidad CSV y contadores de tokens activos en el panel de administración.
- **Rosa Coral** (#FF5EAC): Acción de descarte o rechazo en tarjetas pendientes de moderación.
- **Naranja Intenso** (#FF6B00): Indicador de estado sin conexión en la insignia de sincronización.
- **Rojo Alerta** (#FF3B30): Acciones destructivas, advertencias de cierre de sesión y ausencia de clave administrativa.
- **Azul Enlace** (#2563EB): Enlaces textuales y referencias externas en el panel de administración.

### Tertiary
- **Identidad por Entidad Bancaria**: Etiquetas dedicadas por banco/billetera en las fichas: Mercado Pago (`#00D1FF` / `#002B36`), Banco Galicia (`#FF7A00` / `#170700`), Santander (`#D31010` / `#FFFFFF`), Brubank (`#7328E0` / `#FFFFFF`), Lemon Cash (`#B8FF00` / `#0A1C00`), BBVA (`#004DB8` / `#FFFFFF`), Ualá (`#D81B60` / `#FFFFFF`), Naranja X (`#FF5500` / `#FFFFFF`) y genérico (`#E2E8F0` / `#0F172A` en claro; `#334155` / `#F8FAFC` en oscuro).

### Neutral
- **Papel Tiza** (#F7F5F0): Lienzo principal de página en modo claro, elegido para evitar el blanco clínico sin perder contraste frente a la tinta.
- **Blanco Puro** (#FFFFFF): Superficie de tarjetas principales, modales, inputs y chips en modo claro; actúa también como tinta, borde y sombra literal en modo oscuro.
- **Piedra Cálida** (#EDE9DF): Superficie secundaria en modo claro para bloques de cuenta internos, encabezados de modal y botones secundarios.
- **Tinta Carbón** (#0D0D11): Texto principal, bordes estructurales y sombras rígidas en modo claro; también texto oscuro sobre acentos neón en ambos temas.
- **Pizarra Atenuada** (#4B4B58): Metadatos, subtítulos, etiquetas de tipo de cuenta y ayudas de formulario en modo claro.
- **Lienzo Obsidiana** (#121214): Fondo principal de página en modo oscuro.
- **Grafito Base** (#1E1E22): Superficie de tarjetas, header y modales en modo oscuro.
- **Grafito Atenuado** (#28282E): Superficie secundaria para contenedores internos en modo oscuro.
- **Grafito Elevado** (#24242A): Superficie de foco activo e inputs destacados en modo oscuro.
- **Ceniza Atenuada** (#A1A1AA): Texto secundario y metadatos en modo oscuro.

**The Highlighted Ink Rule.** Amarillo Resaltador (#FFE600), Menta Neón (#2DF8C5) y Cian Eléctrico (#00F0FF) llevan siempre texto en Tinta Carbón (#0D0D11), tanto en modo claro como en modo oscuro, para sostener legibilidad inmediata.

**The Chromatic Tab Rule.** La paleta de bancos se reserva exclusivamente para las insignias de entidad y nunca tiñe fondos completos de tarjetas o pantallas.

## Typography

**Display Font:** `'Space Grotesk'`, con respaldo `system-ui, -apple-system, sans-serif` (intencional en el sistema para títulos, controles y estructura).
**Body Font:** `'Space Grotesk'`, con respaldo `system-ui, -apple-system, sans-serif`.
**Label/Mono Font:** `'JetBrains Mono'`, con respaldo `SFMono-Regular, Consolas, monospace`.

**Character:** Emparejamiento geométrico directo con tipografía monoespaciada de alta legibilidad para distinguir de forma inequívoca letras, puntos y secuencias numéricas de 22 dígitos en alias y CBU/CVU.

### Hierarchy
- **Display** (extra negrita `900`, `clamp(1rem, 4.2vw, 1.25rem)`, interlineado `1.1`, tracking `-0.02em`, mayúsculas): Título de marca `AliasDB` en el encabezado.
- **Headline** (extra negrita `900`, `1.1rem`–`1.25rem`, interlineado `1.1`–`1.2`, tracking `-0.01em`, mayúsculas): Títulos de modales, estados vacíos y encabezados de grupo en administración.
- **Title** (negrita `800`, `1.05rem`–`1.0625rem`, interlineado `1.2`): Nombres completos de las personas en cada ficha del directorio.
- **Body** (media `500` a `700`, `1rem`, interlineado `1.45`): Texto base del documento, descripciones y mensajes de confirmación.
- **Label** (negrita `800`–`900`, `0.75rem`–`0.8125rem`, tracking `0.04em`–`0.05em`, mayúsculas): Botones, chips de filtro, etiquetas de formulario y metadatos.
- **Mono Data** (negrita `800`, `0.8125rem`–`0.875rem`, interlineado `1.3`, tracking `-0.01em`): Alias bancarios copiables, CBU/CVU de 22 dígitos, contadores KPI y tokens.

**The Mono Data Rule.** Todo dato transferible o verificable carácter por carácter (alias, CBU/CVU, tokens, rutas CSV y contadores) se renderiza en `'JetBrains Mono'` con `overflow-wrap: anywhere`.

## Layout

Contenedor centrado con ancho máximo de `1200px` en la app pública (`1060px` en el panel de administración), padding lateral de `16px` en móvil (`8px` en barra lateral de `300px`) y `24px` desde `640px`. La grilla principal pasa de `1` columna en móvil a `2` columnas desde `580px` (`600px` en administración) y `repeat(auto-fill, minmax(440px, 1fr))` desde `1400px`, con separación constante de `12px` a `16px`.

Dentro de cada tarjeta de contacto (`container-type: inline-size`), la lista de cuentas responde al ancho propio de la ficha: pasa a `2` columnas cuando la tarjeta alcanza `420px` (`@container (min-width: 420px)`), haciendo que la última cuenta impar ocupe todo el ancho (`grid-column: 1 / -1`).

En escritorio (`>= 640px`), el encabezado de marca permanece estático y la barra de comandos (`#sticky-command-bar`) se fija en `top: 0` condensando su altura de `46px` a `44px` al hacer scroll. En móvil (`< 640px`), las acciones principales migran a un dock inferior flotante en forma de píldora (`#primary-actions-dock`) que colapsa a íconos al desplazarse hacia abajo y se oculta si aparece el teclado virtual (`--keyboard-inset-height`). El panel administrativo también soporta el ancho estrecho de la barra lateral de Google Sheets (`300px`).

## Elevation & Depth

La profundidad es estrictamente estructural y mecánica, sin desenfoque (`blur: 0`). Cada elevación marca si un elemento es contenedor de primer nivel, control accionable o superficie flotante sobre el resto de la página.

### Shadow Vocabulary
- **Card / Header Offset** (`box-shadow: 4px 4px 0px var(--shadow)`): Contenedores principales (encabezado, tarjetas de contacto, secciones de grupo y buscador principal).
- **Control / Chip Offset** (`box-shadow: 2px 2px 0px var(--shadow)`): Botones, chips de filtro, insignias de banco, tarjetas internas de formulario y dropdowns.
- **Hover Lift** (`transform: translate(-1px, -1px); box-shadow: 3px 3px 0px var(--shadow)` o `6px 6px 0px var(--shadow)`): Respuesta de elevación antes del clic en controles y fichas.
- **Tactile Press** (`transform: translate(2px, 2px); box-shadow: 0px 0px 0px var(--shadow)`): Hundimiento físico al presionar (`:active`), anulando el desplazamiento de sombra.
- **Overlay / Modal Offset** (`box-shadow: 8px 8px 0px var(--shadow)` y `6px 6px 0px var(--shadow)`): Diálogos modales y toasts flotantes sobre backdrop oscuro con `backdrop-filter: blur(2px)`.

**The Mechanical Press Rule.** Ningún elemento interactivo usa sombras difusas ni cambios solo de opacidad al presionarse; el clic se comunica colapsando físicamente la sombra rígida mediante `translate(2px, 2px)`.

## Shapes

Geometría rectangular con esquinas ligeramente suavizadas, bordes perimetrales continuos de `2px` (`--border-width`) o `3px` (`--border-thick`) y separadores internos discontinuos (`border-style: dashed`) que distinguen encabezados o secciones dentro de una misma ficha sin crear cajas cerradas innecesarias.

- **Esquinas Pequeñas** (`4px`): Chips de alias copiables, botones de copia, insignias bancarias, botones de cierre y tarjetas internas compactas.
- **Esquinas Medianas** (`8px`): Botones principales, cajas de búsqueda, campos de formulario, tarjetas de cuenta, avatares y toasts.
- **Esquinas Grandes** (`12px`): Contenedores estructurales mayores (encabezado de app, fichas de persona, paneles de sección y diálogos `<dialog>`).
- **Píldoras** (`9999px`): Chips de filtro por grupo/entidad, dock móvil flotante, píldoras de paso/estado y contadores.

## Components

### Buttons
- **Shape:** Rectángulo con esquinas medianas (`8px`), borde continuo (`2px`) y sombra rígida pequeña (`2px 2px 0px`).
- **Primary:** Fondo Amarillo Resaltador (`#FFE600`) con texto en Tinta Carbón (`#0D0D11`), tipografía en negrita `800` mayúscula y área mínima táctil de `44px` (`--touch-min`).
- **Hover / Focus:** Desplazamiento diagonal inverso (`-1px, -1px`) con incremento de sombra (`3px 3px 0px`); anillo `:focus-visible` de `3px` con desplazamiento `outline-offset: 3px`.
- **Secondary / Mint / Cyan / Danger:** Variantes con fondos Piedra Cálida (`#EDE9DF`), Menta Neón (`#2DF8C5`), Cian Eléctrico (`#00F0FF`) o Rojo Alerta (`#FF3B30`) preservando la misma mecánica táctil al presionar (`2px, 2px`).

### Chips
- **Style:** Píldoras (`9999px`) de `38px` de altura con borde de `2px`, sombra `2px 2px 0px` y texto en negrita mayúscula.
- **State:** Reposo en Blanco Puro / Grafito Base; hover/activo en Amarillo Resaltador (`#FFE600`) o Cian Eléctrico (`#00F0FF`) en oscuro para bancos, y Menta Neón (`#2DF8C5`) para filtros de grupo. El chip de creación (`+ Nuevo Grupo`) usa borde discontinuo sin relleno ni sombra en reposo.

### Cards / Containers
- **Corner Style:** Esquinas grandes (`12px`) en fichas principales y medianas (`8px`) en tarjetas de cuenta internas.
- **Background:** Blanco Puro (`#FFFFFF`) en claro y Grafito Base (`#1E1E22`) en oscuro; los bloques de cuenta internos usan superficie atenuada (`#EDE9DF` / `#28282E`).
- **Shadow Strategy:** Sombra estructural `4px 4px 0px` en tarjetas de persona y elevación ligera al pasar el cursor (`6px 6px 0px`).
- **Border:** Borde continuo `2px` en el perímetro y separador horizontal `2px dashed` bajo el encabezado de la persona.
- **Internal Padding:** `12px 14px` en fichas de directorio; `18px 20px` en tarjetas de área administrativa.

### Inputs / Fields
- **Style:** Fondo sólido (`#FFFFFF` / `#1E1E22`), borde continuo `2px`, esquinas medianas (`8px`, `4px` en admin) y sombra `2px 2px 0px` (`4px 4px 0px` en buscador principal).
- **Focus:** Elevación leve (`-1px, -1px`) con ampliación de sombra y cambio cromático de acento; debe mantener siempre anillo `:focus-visible` de contraste suficiente.
- **Validation / States:** Validación positiva de CBU de 22 dígitos mediante borde Menta Neón (`#2DF8C5`) y tinte traslúcido verde, más bloque de sugerencia en vivo en `JetBrains Mono`.

### Navigation
- **Desktop Command Bar & Mobile Dock:** En escritorio, barra sticky superior que agrupa buscador y acciones primarias; en móvil (`< 640px`), dock inferior fijo en píldora (`9999px`, borde `3px`) con colapso a íconos al scrollear y acceso directo a `Grupos`, `Buscar` y `Alias`.
- **Admin Tabs & Modal Tabs:** Pestañas tipo selector con estado activo resaltado en Amarillo Resaltador (`#FFE600`) o Cian Eléctrico (`#00F0FF`) y scroll horizontal oculto sin barra visible.

### Signature Component: 1-Click Copy Alias Chip
- Tarjeta interactiva dual dentro de cada cuenta: un chip principal en `JetBrains Mono` (`4px` de radio, fondo blanco/grafito, borde `2px`) acompañado de un botón dedicado de copia de `36px` en Amarillo Resaltador (`#FFE600`, o Cian Eléctrico en oscuro). Al activarse, ambos elementos ejecutan un pulso en Menta Neón (`#2DF8C5`) junto con la aparición del toast inferior y el anuncio accesible.

## Do's and Don'ts

### Do:
- **Do** mantener áreas táctiles cómodas (`44px` en acciones primarias y controles principales) y texto funcional legible (`>= 0.75rem`).
- **Do** usar sombras rígidas sin difuminar (`box-shadow: Xpx Ypx 0px`) y respuesta mecánica `translate(2px, 2px)` en elementos presionables.
- **Do** aplicar `JetBrains Mono` en todo alias, CBU/CVU, token y dato técnico copiable, con `overflow-wrap: anywhere` para evitar desborde horizontal desde `300px`.
- **Do** usar Tinta Carbón (`#0D0D11`) sobre fondos Amarillo Resaltador, Menta Neón y Cian Eléctrico en ambos temas.
- **Do** respetar la literalidad del modo oscuro existente (`#121214` / `#1E1E22` con bordes y sombras `#FFFFFF`) y sus reglas de contraste WCAG AA en texto y foco.

### Don't:
- **Don't** introducir sombras difusas (`blur > 0`), efectos glassmorphism sobre tarjetas o gradientes decorativos en el UI.
- **Don't** usar los colores de marca bancaria para rellenar tarjetas enteras ni agregar adornos o emojis en reemplazo de la iconografía Reicon inline.
- **Don't** depender de dependencias externas pesadas de CSS/JS ni romper la operación autocontenida en `index.html` y `admin.html`.
- **Don't** ocultar texto secundario sobre fondos de acento brillante sin forzar tinta oscura de contraste (`>= 4.5:1`).

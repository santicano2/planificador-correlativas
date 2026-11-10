---
name: Planificador de Correlativas
description: Señalética de red local para convertir un plan de estudios en un tablero de cursada.
colors:
  primary: "#0b57d0"
  primary-deep: "#073f9c"
  primary-soft: "#dbe7fb"
  signal: "#c5221f"
  signal-deep: "#9f1b18"
  signal-soft: "#fbe3e1"
  warning: "#a35b00"
  warning-soft: "#fbecd6"
  success: "#0f7b4f"
  success-soft: "#dcf1e6"
  canvas: "#f1f4f2"
  surface: "#ffffff"
  surface-2: "#e7ece9"
  surface-3: "#dce3df"
  ink: "#11181c"
  ink-soft: "#4d5a60"
  ink-faint: "#657278"
  line: "#cbd4cf"
  line-strong: "#a7b4ae"
  status-pending: "#7b878c"
  status-progress: "#a35b00"
  status-regularized: "#0b6e99"
  status-approved: "#0f7b4f"
  on-primary: "#ffffff"
  on-signal: "#ffffff"
  on-success: "#ffffff"
  on-status: "#ffffff"
typography:
  display:
    fontFamily: "Barlow Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 7vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.03em"
  display-lg:
    fontFamily: "Barlow Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "5.25rem"
    fontWeight: 600
    lineHeight: 0.88
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Barlow Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Barlow Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.05em"
  control:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1
  caption:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
  micro:
    fontFamily: "Barlow, ui-sans-serif, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.04em"
  nano:
    fontFamily: "Barlow Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "9px"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0.06em"
  data:
    fontFamily: "Barlow Condensed, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.01em"
    fontFeature: "tabular-nums"
rounded:
  none: "0px"
  xs: "1px"
  sm: "2px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  2xl: "32px"
  3xl: "48px"
  4xl: "64px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
    height: "40px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
    height: "40px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
    height: "40px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 10px"
    height: "36px"
    typography: "{typography.body}"
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0px"
  route-badge:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
    typography: "{typography.label}"
  service-alert:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px 16px"
    typography: "{typography.body}"
  graph-station:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "6px 12px"
    width: "176px"
    height: "80px"
---

# Design System: Planificador de Correlativas

## Overview

**Creative North Star: "Red local"**

La app se lee como la señalética de una red de transporte: las materias son estaciones, las correlativas son líneas y el tablero indica qué servicio está disponible. No hay decoración de campus ni metáforas académicas: hay información pública, jerarquía y recorridos. La identidad vive en la tensión entre Barlow Condensed para anuncios y Barlow para leer, en el cobalto de la línea principal y en la precisión de las reglas de 1px.

El sistema es deliberadamente plano y denso. Los paneles son rectángulos blancos sobre un ground frío, separados por bordes y franjas de superficie, nunca por sombras. El color aparece donde tiene trabajo: cobalto para la acción y la ruta, rojo para lo que bloquea, ámbar para lo que está en curso y verde para lo que ya está resuelto. El resultado debe sentirse como una herramienta de consulta rápida, no como una landing.

**Key Characteristics:**
- Señalética de transporte público traducida a interfaz de producto.
- Rectángulos duros, reglas de 1px y franjas de estado; sin sombras ni gradientes.
- Barlow Condensed para titulares, datos y badges; Barlow para cuerpo y controles.
- Cobalto como línea principal; rojo, ámbar y verde como señales semánticas.
- Densidad útil: cada vista responde una pregunta concreta del recorrido.

## Colors

La paleta es fría, funcional y de señalización: superficies neutras, un azul de línea y tres colores de servicio con significado fijo.

### Primary
- **Línea cobalto** (#0b57d0): acción primaria, tab activo, foco, selección y aristas de cursada regularizada. Es el color con más autoridad después del grafito.
- **Cobalto profundo** (#073f9c): hover de acciones primarias y énfasis de la misma línea.
- **Cobalto lavado** (#dbe7fb): fondo de selección suave, chips de contexto y estados relacionados.

### Secondary
- **Señal roja** (#c5221f): alertas, bloqueos, requisitos de final aprobado y acciones destructivas. No se usa como acento decorativo.
- **Rojo profundo** (#9f1b18): hover de acciones destructivas.
- **Rojo lavado** (#fbe3e1): fondo de avisos de error o bloqueo.

### Tertiary
- **Ámbar de servicio** (#a35b00): materias en curso y avisos que requieren atención sin ser errores.
- **Verde de aprobación** (#0f7b4f): materias aprobadas, disponibilidad y confirmaciones.
- **Azul de regularizada** (#0b6e99): materias regularizadas, distinto del cobalto de acción.
- **Superficies de estado**: `#fbecd6`, `#dcf1e6`, `#dceef7` y `#edf0f1` para los fondos correspondientes.

### Neutral
- **Ground frío** (#f1f4f2): fondo general de la app.
- **Superficie** (#ffffff): paneles, filas y controles.
- **Superficie 2** (#e7ece9): cabeceras de panel, fondos de tabs y hover de filas.
- **Superficie 3** (#dce3df): separadores tonales y fondos de menor jerarquía.
- **Grafito** (#11181c): texto principal y controles primarios.
- **Grafito suave** (#4d5a60): texto secundario, labels y metadatos.
- **Grafito tenue** (#657278): placeholders y texto de menor énfasis.
- **Línea** (#cbd4cf): bordes de paneles, filas y separadores.
- **Línea fuerte** (#a7b4ae): bordes de campos, controles secundarios y scrollbar.

### Named Rules
**The Line Connects Rule.** El cobalto no decora: marca una ruta, una selección o una acción. Si no conecta ni permite actuar, no va en cobalto.

**The Red Is a Signal Rule.** El rojo aparece solo cuando algo bloquea, falla o se elimina. Nunca se usa para “dar vida” a una sección.

**The Three Signals Rule.** Un estado siempre se comunica con color, texto y un tercer indicador (punto, candado o chispa). El color solo nunca alcanza.

## Dark Mode

**Theme switch:** two states, `light` and `dark`. The active theme is set with `data-theme` on `<html>`. The first visit follows `prefers-color-scheme`; after the first toggle, the choice is stored in `localStorage` under `planificador-correlativas:theme:v1`. The header symbol shows a moon in light mode and a sun in dark mode.

**Palette:** cold graphite surfaces with the same transit signals. Accent colors lighten for legibility on dark backgrounds, and `on-*` tokens keep text on colored fills readable.

```text
canvas              #0b0f12
surface             #11171a
surface-2           #182024
surface-3           #222c30
ink                 #e8efed
ink-soft            #a7b4b0
ink-faint           #85938f
line                #2b363a
line-strong         #465358
primary             #7fb0ff
primary-deep        #5f97f0
primary-soft        #16263c
signal              #ff7a75
signal-deep         #e05f5a
signal-soft         #2a1413
warning             #f0a44a
warning-soft        #2a1d0d
success             #4fd39a
success-soft        #0f2a20
status-pending      #9aa6aa
status-pending-soft #1a2226
status-progress     #f0a44a
status-progress-soft #2a1d0d
status-regularized  #5cc8f0
status-regularized-soft #102a35
status-approved     #4fd39a
status-approved-soft #0f2a20
on-primary          #08111f
on-signal           #1a0b0a
on-success          #06170f
on-status           #08111f
```

### Named Rules
**The On-Color Rule.** Text on a colored fill uses `on-primary`, `on-signal`, `on-success`, or `on-status`. Never hardcode white on a themed fill.

**The Signal Stays Rule.** Dark mode changes value, not meaning: cobalto still connects, red still blocks, amber still warns, and green still approves.

## Typography

**Display Font:** Barlow Condensed (con ui-sans-serif, system-ui, sans-serif)
**Body Font:** Barlow (con ui-sans-serif, system-ui, sans-serif)
**Label Font:** Barlow, en mayúsculas y con tracking abierto

**Character:** La pareja imita la señalética: titulares condensados, casi de cartel, y un cuerpo grotesco que se lee bien en tablas densas. La condensada no se usa para párrafos; la Barlow no se usa para titulares grandes.

### Hierarchy
- **Display** (600, `clamp(2.75rem, 7vw, 4.5rem)`, 0.9): titulares de home y de vista. Máximo seis rem; tracking `-0.03em`.
- **Display LG** (600, 5.25rem, 0.88): titular principal de la home en desktop.
- **Headline** (600, 1.5rem, 1.15): títulos de panel y de sección.
- **Title** (600, 1.125rem, 1.2): nombres de materia, subtítulos y filas destacadas.
- **Body** (400, 0.875rem, 1.5): texto de interfaz y párrafos; medida de 65–75 caracteres.
- **Label** (600, 0.6875rem, 0.05em, mayúsculas): labels de campo, encabezados de tabla y metadatos.
- **Control** (600, 0.8125rem, 1): botones, campos y controles compactos.
- **Caption** (400, 0.75rem, 1.5): texto auxiliar y descripciones breves.
- **Micro** (600, 10px, 0.04em): leyendas del grafo, contadores y metadatos mínimos.
- **Nano** (600, 9px, 0.06em, mayúsculas): cuatrimestre dentro de una estación del grafo.
- **Data** (600, 2.5rem, 0.9, tabular): cifras de avance y contadores. Siempre con `font-variant-numeric: tabular-nums`.

### Named Rules
**The Condensed Is for Announcements Rule.** Barlow Condensed se usa en titulares, cifras, badges y códigos. El texto corrido siempre va en Barlow.

**The No-Eyebrow Rule.** Ningún título necesita un kicker arriba. El titular carga solo con tamaño, peso y posición.

## Layout

El shell tiene un máximo de `80rem` y padding lateral de `1rem` en mobile y `1.5rem` desde `640px`. La home usa una grilla 7/5: relato a la izquierda, módulo de importación a la derecha; el diagrama de ruta vive dentro del módulo, no como fondo decorativo. El tablero es una columna densa: cabecera, tabs de andén, avance, respaldo, filtros y filas por año.

La escala de spacing va de `4px` a `64px`. Los grupos internos usan `8–12px`; la separación entre bloques, `16–24px`; las secciones, `32–48px`. El header mide `72px`. En desktop el grafo reserva `320px` para el detalle sticky; el mapa conserva columnas de `176px`, nodos de `176×80`, `20px` entre columnas y `12px` entre filas. En mobile el mapa va primero y el detalle aparece al seleccionar una materia.

Breakpoints observados: `sm` en `640px` y `lg` en `1024px`. La app no usa contenedores flotantes ni grillas decorativas.

## Elevation & Depth

El sistema es plano por defecto: no hay sombras. La profundidad se construye con bordes de 1px, cambios de superficie (`canvas`, `surface`, `surface-2`), franjas de cabecera y un borde superior de estado de 2–3px. La selección del grafo usa un outline de 2px con offset, no una sombra.

Los avisos de servicio usan un borde superior de 3px como señal de severidad. El panel de detalle del grafo se vuelve sticky en desktop; en mobile no flota, se desplaza con el contenido.

### Named Rules
**The Flat-By-Default Rule.** Si un bloque necesita una sombra para separarse, el problema es el borde o la superficie. No se agregan sombras decorativas.

**The Top-Edge Rule.** El color de estado va en el borde superior, nunca en un borde izquierdo o derecho de más de 1px.

## Shapes

La forma base es el rectángulo duro. Paneles, filas y nodos del grafo no tienen radio. Los controles (botones, campos, badges) usan `2px`; los tabs, `1px`. Los únicos círculos son el punto de estado, el thumb del scrollbar y la marca de la app. No hay pills para contenedores ni para acciones.

La iconografía es lineal, de trazo consistente, y se usa para reforzar una señal, no para rellenar tarjetas.

## Components

### Buttons
- **Shape:** rectángulo de `2px` de radio y `40px` de alto; variante compacta de `32px`.
- **Primary:** fondo cobalto, texto blanco, borde cobalto. Hover a cobalto profundo.
- **Secondary:** fondo blanco, texto grafito, borde `line-strong`; hover a borde grafito.
- **Ghost:** sin fondo ni borde; hover a `surface-2`.
- **Danger:** fondo rojo, texto blanco; se reserva para borrar o descartar.
- **Focus:** outline de `2px` cobalto con offset de `2px`.

### Fields
- **Style:** fondo blanco, borde de `1px` `line-strong`, radio de `2px`, padding `8px 10px`, texto de `13px`.
- **Focus:** borde cobalto y outline de `2px` con offset de `1px`.
- **Disabled:** opacidad `0.45` y cursor bloqueado.

### Panels / Containers
- **Corner Style:** sin radio.
- **Background:** blanco sobre `canvas`.
- **Border:** `1px` `line`.
- **Header:** `surface-2`, borde inferior de `1px`, padding `12px 16px`.
- **Internal Padding:** `12–20px` según densidad.

### Navigation
- **Platform tabs:** contenedor blanco con borde de `1px`, padding de `4px`; tab de `36px` de alto, texto de `12px` semibold. Activo en cobalto con texto blanco. En mobile hacen scroll horizontal si no entran.

### Route Badge
- **Style:** borde de `1px` del color actual, radio de `2px`, padding `2px 6px`, Barlow Condensed de `12px` semibold. Se usa para códigos, años y etiquetas de línea.

### Service Alert
- **Style:** fondo blanco o lavado, borde de `1px` `line`, borde superior de `3px` según severidad, padding `12px 16px`.
- **Variants:** cobalto para información, ámbar para advertencia, rojo para error, verde para confirmación.

### Graph Station (signature)
- **Shape:** `176×80`, sin radio, borde de `1px`, borde superior de `2px` con el color de estado.
- **Content:** código en route badge, nombre en Barlow Condensed de `13px`, cuatrimestre en label de `9px`, punto de estado y candado/chispa/calendario según disponibilidad.
- **States:** hover con borde cobalto; selección con outline de `2px`; relacionados con borde cobalto al 50%; no relacionados con opacidad `0.4`.

## Do's and Don'ts

### Do:
- **Do** usar Barlow Condensed para titulares, cifras, badges y nombres de materia; Barlow para cuerpo y controles.
- **Do** separar con bordes de `1px`, superficies y franjas; el sistema es plano.
- **Do** usar cobalto para la ruta y la acción, rojo para bloqueo, ámbar para cursada y verde para aprobación.
- **Do** acompañar cada estado con texto y un punto, candado o chispa.
- **Do** mantener el grafo en `176×80`, con `20px` entre columnas y `12px` entre filas.
- **Do** usar el borde superior para el estado de una estación o un aviso.
- **Do** usar `text-on-primary`, `text-on-signal`, `text-on-success` y `text-on-status` sobre fondos de color.

### Don't:
- **Don't** usar serif, crema, terracota, dorado, sombras de papel ni textura de fondo.
- **Don't** usar sombras, halos o gradientes para separar bloques.
- **Don't** usar `border-left` o `border-right` de color mayor a `1px` en cards, filas o avisos.
- **Don't** usar pills para contenedores, botones o tabs.
- **Don't** usar monospace como disfraz de “técnico”.
- **Don't** poner un kicker o eyebrow arriba de un heading.
- **Don't** convertir la página en una grilla de tarjetas iguales de icono, título y texto.
- **Don't** usar el rojo como color de énfasis o decoración.
- **Don't** usar blanco fijo sobre botones, tabs o estados que cambian con el tema.
- **Don't** usar negro puro como superficie del tema oscuro; el sistema usa grafito y off-white.

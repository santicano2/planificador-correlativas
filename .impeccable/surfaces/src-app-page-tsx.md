---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/components/import/import-plan-flow.tsx","src/components/dashboard/study-dashboard.tsx","src/components/dashboard/correlation-graph.tsx","src/app/globals.css"]
---

# Surface brief

## Scope and mode

Aplicación completa: home, importación, revisión/edición, tablero, cuatrimestre, grafo y respaldos. Modo **Operate**: la persona viene a resolver una tarea, así que la familiaridad y la densidad útil mandan. La identidad vive en tipografía, paleta, densidad y un movimiento firma; no en reemplazar controles conocidos.

## Audience, job, and action

Estudiantes universitarios que quieren saber qué materias pueden cursar y armar su próximo cuatrimestre. La acción central es importar el PDF, revisar lo detectado y usar el tablero para decidir. El éxito es entender disponibilidad, bloqueos y avance sin cruzar planillas.

## Proof and content

Se usan el plan real de ejemplo, las materias y correlativas reales, y los estados que el usuario carga. No hay testimonios, métricas ni clientes que inventar. La promesa de privacidad se demuestra con copia y comportamiento: PDF local, storage local, sin cuentas.

## Constraints

Conservar copy, funcionalidad, claves de storage, formato de respaldo, layout del grafo y accesibilidad. Sin backend ni dependencias nuevas. La revisión humana sigue siendo parte del flujo. La disponibilidad sigue siendo informativa.

## Direction contract

**THESIS:** El plan de estudios se lee como una red de transporte: cada materia es una estación, cada correlativa una línea, y el tablero muestra qué servicio está disponible. Rechaza la landing académica editorial con tarjetas flotantes, serif y textura de papel.

**OWN-WORLD:** Señalética de transporte público: ground frío `#F3F5F2`, superficie blanca, grafito `#11181C`, cobalto `#0B57D0`, rojo de alerta `#C5221F`, ámbar `#B06000` y verde `#0F7B4F`; Barlow y Barlow Condensed; reglas de 1px, radios de 2–4px, badges de línea, estaciones, tabs de andén y avisos de servicio. Sin crema, serif, terracota, mono decorativa ni sombras de papel.

**STORY:** El estudiante entiende que puede importar su PDF, revisar la red y decidir qué cursar. La app le muestra disponibilidad, bloqueos y avance como un mapa de servicio, no como una planilla.

**FIRST VIEWPORT:** Header de 72px con marca de cruce de líneas y acceso a “Mi plan”. Hero partido 7/5: a la izquierda, titular “Tu carrera, sin adivinar correlativas.” en Barlow Condensed, cuerpo breve, CTA primaria y tira de prueba local; a la derecha, panel de importación como módulo de validación, con diagrama de ruta PDF → Revisión → Tablero detrás, zona de drop y enlace al ejemplo. A 1440px ocupa unos 640px de alto. Sin hero centrado, gradientes ni animación decorativa.

**FORM:** Señalética y diagrama de transporte público; posición 1 de 1, fijada por el usuario; seed: none (unavailable).

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Signature interaction

En el grafo, seleccionar una materia enciende su recorrido directo y atenúa las líneas no relacionadas; el detalle funciona como tablero de estación. En cuatrimestre, seleccionar una materia la convierte en un servicio programado con su badge y sus advertencias.

## Unresolved decisions

Ninguna abierta. Se mantienen nombre, copy principal, comportamiento y privacidad. El trabajo termina en la rama `feat/redesign-mapa-transporte`, sin merge ni deploy.

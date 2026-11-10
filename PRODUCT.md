# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Estudiantes universitarios que necesitan entender qué materias pueden cursar y cómo avanzar en su carrera. Usan la app en su computadora o en el celular, normalmente cerca del momento de inscribirse o de revisar su avance, y no quieren cruzar a mano un PDF, una planilla y el estado de cada final.

## Product Purpose

El Planificador de Correlativas convierte el PDF de un plan de estudios en un tablero personal para planificar el cuatrimestre. Permite revisar las materias y correlativas detectadas, marcar el estado de cada materia, ver qué está disponible o bloqueado, elegir qué cursar y explorar la red de correlativas. El éxito es que el estudiante pueda decidir qué cursar sin planillas paralelas ni cálculos manuales.

## Positioning

La app combina tres cosas en un flujo local: importación del PDF real de la facultad, revisión humana de lo detectado y un tablero que traduce las correlativas en disponibilidad concreta. No requiere cuenta, no sube el PDF y no depende de un servidor para funcionar.

## Operating Context

El flujo principal es PDF → revisión → plan guardado → tablero. El plan vive en el almacenamiento local del navegador. La importación ocurre en el cliente con PDF.js. La revisión es parte normal del producto porque los formatos de plan varían y el parser puede equivocarse. El estudiante puede editar el plan, cambiar estados, armar una selección de cuatrimestre y exportar o restaurar un respaldo JSON.

## Capabilities and Constraints

- Importar un PDF con texto seleccionable de hasta 15 MB y 40 páginas.
- Extraer materias, años, cuatrimestres y correlativas en el navegador.
- Revisar y corregir el borrador antes de guardarlo.
- Persistir plan, progreso y selección de cuatrimestre en `localStorage`.
- Marcar materias como pendiente, cursando, regularizada o aprobada.
- Mostrar disponibilidad y requisitos faltantes.
- Armar un cuatrimestre con materias pendientes y advertir sobre correlativas sin cumplir.
- Explorar el grafo de correlativas por año y cambiar estados desde el detalle.
- Editar el plan guardado conservando el progreso de las materias que siguen existiendo.
- Exportar y restaurar un respaldo versionado.
- Sin backend, sin cuentas, sin sincronización entre dispositivos.
- PDFs escaneados sin OCR no se pueden procesar.
- La app no impide marcar estados aunque las correlativas no estén cumplidas: la disponibilidad es informativa porque pueden existir equivalencias o datos que el plan no refleja.

## Brand Commitments

- Nombre: Planificador de Correlativas.
- Voz en español rioplatense, directa y sin tecnicismos innecesarios.
- Promesa de privacidad: el PDF y los datos quedan en el dispositivo.
- Producto gratuito, sin cuentas ni servidores.

## Evidence on Hand

- `README.md` describe el flujo, las capacidades y la promesa de privacidad.
- `docs/DEVELOPMENT.md` documenta el modelo de datos, las decisiones técnicas y los límites conocidos.
- `Plan 2014 - Licenciatura en Sistemas.pdf` es un plan real de ejemplo.
- `public/examples/plan-2014-sistemas.pdf` es el ejemplo que ofrece la app.
- No hay testimonios, clientes, métricas de uso ni casos de estudio; no deben inventarse.

## Product Principles

- El estudiante decide; la app ordena la información y muestra las consecuencias.
- La revisión humana es parte del flujo, no un parche de errores.
- La privacidad se demuestra con el comportamiento: todo ocurre en el navegador.
- La disponibilidad es una guía, no una barrera.
- Cada vista debe responder una pregunta concreta del recorrido: qué tengo, qué puedo cursar, qué me falta y qué habilita cada materia.

## Accessibility & Inclusion

- La interfaz debe funcionar con teclado, foco visible y lectores de pantalla.
- El grafo usa botones HTML accesibles para las materias y SVG decorativo para las aristas.
- La app debe ser usable en mobile, con scroll horizontal intencional en el grafo.
- Los estados no deben depender solo del color.

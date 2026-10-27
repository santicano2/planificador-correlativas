# Planificador de Correlativas

Subí el PDF de tu plan de estudios. La app extrae las materias y sus correlativas, te deja corregir lo que haya quedado mal y arma un tablero para planificar el cuatrimestre.

Nació de una necesidad concreta: saber qué materias se pueden cursar sin tener que cruzar a mano una planilla, un PDF y el estado de cada final.

> **Demo:** [planificador-correlativas-woad.vercel.app](https://planificador-correlativas-woad.vercel.app/). La importación desde PDF, la revisión, el tablero, la edición, el respaldo y el grafo interactivo ya funcionan.

## Qué podés hacer

- **Subir el PDF** del plan de estudios de tu carrera.
- **Revisar y corregir** las materias, años, cuatrimestres y correlativas detectadas.
- **Marcar el estado** de cada materia: pendiente, cursando, regularizada o aprobada.
- **Ver qué materias están disponibles** y, si están bloqueadas, qué requisito falta.
- **Seguir el progreso** de la carrera con un resumen claro.
- **Explorar el grafo de correlativas** por año, con el detalle de requisitos y materias que habilita cada materia.
- **Editar el plan guardado** sin volver a importar el PDF.
- **Exportar y restaurar un respaldo** con el plan y tu progreso.

## Cómo funciona

1. **Subís el PDF.** El texto se procesa directamente en tu navegador.
2. **Revisás la información.** Si alguna materia o correlativa no se detectó bien, la corregís en el momento.
3. **Guardás el plan.** Queda en tu navegador, listo para marcar estados y seguir el cuatrimestre.
4. **Marcás tu avance.** El tablero te muestra qué podés cursar, qué está bloqueado y cuánto progresaste. La pestaña Grafo te deja explorar las correlativas materia por materia.
5. **Editás o respaldás.** Podés ajustar el plan guardado o descargar un JSON con tu progreso para restaurarlo después.

## Privacidad

El PDF no se sube a ningún servidor: la extracción se hace localmente en el navegador. El plan y el progreso de las materias se guardan en el almacenamiento local de tu dispositivo y no se envían a terceros. Los respaldos también se generan localmente y quedan en tu compu.

## Estado del proyecto

- [x] **Etapa 1:** lógica de disponibilidad, progreso y validación de correlativas.
- [x] **Etapa 2:** importación desde PDF, revisión y guardado local.
- [x] **Etapa 3:** tablero de materias, estados y progreso.
- [x] **Etapa 4:** edición posterior y exportación de respaldo.
- [x] **Etapa 5:** grafo interactivo de correlativas.
- [x] **Etapa 6:** deploy en Vercel y documentación final.

## Desarrollo

Si querés correr el proyecto o conocer las decisiones técnicas, mirá [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

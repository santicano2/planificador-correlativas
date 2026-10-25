# Planificador de Correlativas

Subí el PDF de tu plan de estudios. La app extrae las materias y sus correlativas, te deja corregir lo que haya quedado mal y arma un tablero para planificar el cuatrimestre.

Nació de una necesidad concreta: saber qué materias se pueden cursar sin tener que cruzar a mano una planilla, un PDF y el estado de cada final.

> **En desarrollo.** La importación desde PDF, la revisión, el guardado y el tablero de materias ya funcionan. La edición posterior y la exportación de respaldo llegan en la próxima etapa.

## Qué podés hacer

- **Subir el PDF** del plan de estudios de tu carrera.
- **Revisar y corregir** las materias, años, cuatrimestres y correlativas detectadas.
- **Marcar el estado** de cada materia: pendiente, cursando, regularizada o aprobada.
- **Ver qué materias están disponibles** y, si están bloqueadas, qué requisito falta.
- **Seguir el progreso** de la carrera con un resumen claro.

## Cómo funciona

1. **Subís el PDF.** El texto se procesa directamente en tu navegador.
2. **Revisás la información.** Si alguna materia o correlativa no se detectó bien, la corregís en el momento.
3. **Guardás el plan.** Queda en tu navegador, listo para marcar estados y seguir el cuatrimestre.
4. **Marcás tu avance.** El tablero te muestra qué podés cursar, qué está bloqueado y cuánto progresaste.

## Privacidad

El PDF no se sube a ningún servidor: la extracción se hace localmente en el navegador. El plan y el progreso de las materias se guardan en el almacenamiento local de tu dispositivo y no se envían a terceros.

## Estado del proyecto

- [x] **Etapa 1:** lógica de disponibilidad, progreso y validación de correlativas.
- [x] **Etapa 2:** importación desde PDF, revisión y guardado local.
- [x] **Etapa 3:** tablero de materias, estados y progreso.
- [ ] **Etapa 4:** edición posterior y exportación de respaldo.
- [ ] **Etapa 5:** grafo interactivo de correlativas.
- [ ] **Etapa 6:** pulido, deploy y documentación final.

## Desarrollo

Si querés correr el proyecto o conocer las decisiones técnicas, mirá [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

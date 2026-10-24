# Planificador de Correlativas

Subí el PDF de tu plan de estudios. La app extrae las materias y sus correlativas, te deja corregir lo que haya quedado mal y arma un tablero para planificar el cuatrimestre.

Nació de una necesidad concreta: saber qué materias se pueden cursar sin tener que cruzar a mano una planilla, un PDF y el estado de cada final.

> **En desarrollo.** La importación desde PDF, la revisión y el guardado local ya funcionan. El tablero de materias y progreso llega en la próxima etapa.

## Qué vas a poder hacer

- **Subir el PDF** del plan de estudios de tu carrera.
- **Revisar y corregir** las materias, años, cuatrimestres y correlativas detectadas.
- **Marcar el estado** de cada materia: pendiente, cursando, regularizada o aprobada.
- **Ver qué materias están disponibles** y, si están bloqueadas, qué requisito falta.
- **Seguir el progreso** de la carrera con un resumen claro.
- **Explorar el grafo de correlativas** para entender el camino completo.

## Cómo funciona

1. **Subís el PDF.** El texto se procesa directamente en tu navegador.
2. **Revisás la información.** Si alguna materia o correlativa no se detectó bien, la corregís en el momento.
3. **Guardás el plan.** Queda en tu navegador, listo para el tablero de materias y el seguimiento del cuatrimestre.

## Privacidad

El PDF no se sube a ningún servidor: la extracción se hace localmente en el navegador. El plan que armás se guarda en el almacenamiento local de tu dispositivo y no se envía a terceros.

## Estado del proyecto

- [x] **Etapa 1:** lógica de disponibilidad, progreso y validación de correlativas.
- [x] **Etapa 2:** importación desde PDF, revisión y guardado local.
- [ ] **Etapa 3:** tablero de materias, estados y progreso.
- [ ] **Etapa 4:** edición posterior y exportación de respaldo.
- [ ] **Etapa 5:** grafo interactivo de correlativas.
- [ ] **Etapa 6:** pulido, deploy y documentación final.

## Desarrollo

Si querés correr el proyecto o conocer las decisiones técnicas, mirá [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

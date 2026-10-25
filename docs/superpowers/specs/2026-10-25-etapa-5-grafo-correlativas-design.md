# Etapa 5: grafo interactivo de correlativas

## Objetivo

Agregar una vista de grafo dentro del tablero para explorar visualmente cómo se conectan las materias de un plan, manteniendo el progreso y la edición existentes.

## Alcance

- Selector **Tablero / Grafo** dentro de `StudyDashboard`. Tablero sigue siendo la vista inicial.
- La vista Grafo oculta resumen de progreso, respaldo, filtros y tabla; mantiene el encabezado y las acciones del plan.
- Mapa completo agrupado en columnas por año, con posiciones fijas.
- Sin zoom, arrastre de nodos, búsqueda ni filtros en esta etapa.
- Sin dependencias nuevas.

## Composición

- Desktop: mapa a la izquierda y panel de detalle sticky de 280 px a la derecha.
- Mobile: mapa con scroll horizontal y nodos compactos; el detalle seleccionado aparece arriba del mapa.
- Cada columna tiene header de año y contador de materias.
- Leyenda de estados y tipos de arista.
- Sin materias: estado vacío. Sin aristas: aviso, manteniendo los nodos visibles.

## Interacción

- Los nodos son botones accesibles. Clic, Enter o Espacio seleccionan una materia.
- Escape o clic en el fondo limpian la selección.
- Al seleccionar, se resaltan requisitos y desbloqueos directos y se atenúa el resto.
- El panel muestra materia, año/cuatrimestre, disponibilidad, control de estado, correlativas requeridas y materias que habilita.
- Cambiar el estado desde el panel usa el mismo flujo de persistencia del tablero.
- Las materias del panel se pueden seleccionar para navegar el grafo.

## Datos y layout

- `buildCorrelationGraph(plan, progress)` construye nodos y aristas.
- Cada nodo incluye materia, estado, disponibilidad, requisitos directos y dependientes directos.
- Cada arista va de correlativa a materia dependiente con `requiredStatus` `regularized` o `approved`.
- Si una materia exige ambas cosas de la misma correlativa, se conserva solo `approved`.
- Las referencias inexistentes se ignoran de forma defensiva.
- El layout agrupa por año, ordena por código/nombre y usa coordenadas deterministas.
- Aristas sólidas para regularizada y punteadas para aprobada; flecha hacia la materia dependiente.
- Las aristas dentro de la misma columna salen por arriba o abajo según la posición relativa.

## Accesibilidad

- Nodos con nombre, estado y disponibilidad en el texto accesible.
- Flechas decorativas con `aria-hidden`.
- Foco visible y navegación completa por teclado.
- El color no es el único indicador: se suman texto, candado/chispa y leyenda.
- El scroll horizontal tiene región etiquetada y ayuda visible en mobile.
- Se respeta `prefers-reduced-motion`.

## Pruebas

- Tests puros de construcción del grafo, deduplicación, dependientes y referencias inválidas.
- Tests de layout, límites y rutas entre años y dentro de una columna.
- Verificación manual en desktop/mobile, teclado, cambio de estado y plan sin correlativas.
- `npm run check` y `npm run build` al cierre.

## Fuera de alcance

- Persistencia nueva, cambios al respaldo o al formato del plan.
- Edición de correlativas desde el grafo.
- Exportar el grafo como imagen.
- Layouts alternativos o force-directed.

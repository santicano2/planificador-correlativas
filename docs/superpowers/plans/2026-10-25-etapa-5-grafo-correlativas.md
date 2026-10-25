# Etapa 5: grafo interactivo de correlativas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar una vista de grafo de correlativas dentro del tablero, agrupada por año y con un panel de detalle para explorar requisitos y desbloqueos.

**Architecture:** Un modelo puro construye nodos y aristas; un módulo de layout calcula posiciones y rutas SVG; componentes de dashboard renderizan nodos HTML accesibles sobre un SVG decorativo. La vista se integra con un selector Tablero / Grafo en `StudyDashboard`.

**Tech Stack:** Next.js 16, React 19, TypeScript estricto, Tailwind 4, Vitest 5. Sin dependencias nuevas.

---

### Task 1: Modelo del grafo

**Files:**
- Create: `src/lib/study-plan/graph.ts`
- Create: `src/lib/study-plan/graph.test.ts`
- Modify: `src/lib/study-plan/index.ts`

- [ ] **Step 1: Escribir los tests que fallan**

Crear `src/lib/study-plan/graph.test.ts` con casos para:

```ts
const plan = makePlan([
  makeSubject({ id: "intro", code: "1", name: "Intro", year: 1 }),
  makeSubject({
    id: "algorithms",
    code: "2",
    name: "Algoritmos",
    year: 2,
    requiresRegularized: ["intro"],
  }),
  makeSubject({
    id: "databases",
    code: "3",
    name: "Bases",
    year: 2,
    requiresApproved: ["intro"],
  }),
  makeSubject({
    id: "projects",
    code: "4",
    name: "Proyectos",
    year: 3,
    requiresRegularized: ["algorithms"],
    requiresApproved: ["algorithms"],
  }),
  makeSubject({
    id: "broken",
    code: "5",
    name: "Rota",
    year: 3,
    requiresRegularized: ["missing"],
  }),
]);
```

Verificar:

- Nodos ordenados por año y código.
- `intro` tiene dependientes `algorithms` y `databases`.
- `projects` recibe una sola arista desde `algorithms` con `requiredStatus: "approved"`.
- La referencia `missing` no genera arista.
- Estados y disponibilidad se resuelven con el progreso.
- `years` contiene `[1, 2, 3]`.

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/lib/study-plan/graph.test.ts`

Expected: FAIL porque `graph.ts` no existe.

- [ ] **Step 3: Implementar el modelo**

En `graph.ts`:

```ts
export interface CorrelationGraphNode {
  subject: Subject;
  status: SubjectStatus;
  availability: SubjectAvailability;
  prerequisiteIds: string[];
  dependentIds: string[];
}

export interface CorrelationGraphEdge {
  id: string;
  fromId: string;
  toId: string;
  requiredStatus: RequiredStatus;
}

export interface CorrelationGraph {
  nodes: CorrelationGraphNode[];
  nodesById: Map<string, CorrelationGraphNode>;
  edges: CorrelationGraphEdge[];
  years: number[];
}
```

Implementar `buildCorrelationGraph(plan, progress)`:

- Ordenar materias por año, código numérico y nombre.
- Resolver estado con `getEffectiveStatus` y disponibilidad con `getSubjectAvailability`.
- Unir `requiresRegularized` y `requiresApproved` en requisitos únicos.
- Ignorar ids inexistentes y auto-referencias.
- Crear una arista por par origen/destino, conservando `approved` si existen ambas exigencias.
- Completar `dependentIds` en el nodo origen.
- Exportar desde `index.ts`.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run src/lib/study-plan/graph.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/study-plan/graph.ts src/lib/study-plan/graph.test.ts src/lib/study-plan/index.ts
git commit -m "feat: build correlation graph model"
```

---

### Task 2: Layout y rutas de aristas

**Files:**
- Create: `src/lib/study-plan/graph-layout.ts`
- Create: `src/lib/study-plan/graph-layout.test.ts`
- Modify: `src/lib/study-plan/index.ts`

- [ ] **Step 1: Escribir los tests que fallan**

Crear `graph-layout.test.ts` con casos para:

- Columnas por año en orden ascendente.
- Nodos del mismo año apilados con separación vertical.
- `width`, `height` y `nodesById` consistentes.
- Grafo vacío devuelve dimensiones cero.
- `buildEdgePath` entre años empieza en el borde derecho y termina en el izquierdo.
- `buildEdgePath` en la misma columna empieza abajo y termina arriba cuando el destino está más abajo.

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run src/lib/study-plan/graph-layout.test.ts`

Expected: FAIL porque `graph-layout.ts` no existe.

- [ ] **Step 3: Implementar layout**

Constantes:

```ts
export const GRAPH_NODE_WIDTH = 176;
export const GRAPH_NODE_HEIGHT = 72;
export const GRAPH_COLUMN_GAP = 20;
export const GRAPH_ROW_GAP = 12;
export const GRAPH_PADDING = 16;
export const GRAPH_HEADER_HEIGHT = 48;
```

Tipos:

```ts
export interface GraphNodeLayout {
  node: CorrelationGraphNode;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GraphYearColumn {
  year: number;
  x: number;
  width: number;
  height: number;
  count: number;
}

export interface CorrelationGraphLayout {
  nodes: GraphNodeLayout[];
  nodesById: Map<string, GraphNodeLayout>;
  years: GraphYearColumn[];
  width: number;
  height: number;
}
```

Implementar `layoutCorrelationGraph(graph)` y `buildEdgePath(from, to)`.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run src/lib/study-plan/graph-layout.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/study-plan/graph-layout.ts src/lib/study-plan/graph-layout.test.ts src/lib/study-plan/index.ts
git commit -m "feat: lay out correlation graph by year"
```

---

### Task 3: Lienzo interactivo

**Files:**
- Create: `src/components/dashboard/correlation-graph.tsx`
- Modify: `src/components/icons.tsx`

- [ ] **Step 1: Leer la documentación de Next.js**

Leer la guía relevante de `node_modules/next/dist/docs/` sobre client components antes de escribir la UI.

- [ ] **Step 2: Implementar el lienzo**

`CorrelationGraph` recibe:

```ts
interface CorrelationGraphProps {
  graph: CorrelationGraph;
  layout: CorrelationGraphLayout;
  selectedId: string | null;
  onSelect: (subjectId: string) => void;
  onClear: () => void;
}
```

Incluir:

- Región scrollable etiquetada, con `tabIndex={0}` y Escape para limpiar.
- Columnas de año con header y contador.
- SVG absoluto con aristas y marcadores; `aria-hidden`.
- Nodos HTML como botones con `aria-pressed`, estado, disponibilidad y foco visible.
- Resaltado de selección, requisitos y dependientes; atenuación del resto.
- Leyenda de estados y tipos de arista.
- Ayuda de scroll horizontal en mobile.
- Aviso si no hay aristas; estado vacío si no hay materias.
- `GraphIcon` en `icons.tsx`.

- [ ] **Step 3: Verificar**

Run: `npm run check`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/correlation-graph.tsx src/components/icons.tsx
git commit -m "feat: render interactive correlation graph"
```

---

### Task 4: Panel de detalle y pestaña

**Files:**
- Create: `src/components/dashboard/graph-detail-panel.tsx`
- Create: `src/components/dashboard/correlation-graph-view.tsx`
- Modify: `src/components/dashboard/study-dashboard.tsx`

- [ ] **Step 1: Implementar el panel**

`GraphDetailPanel` recibe el nodo seleccionado, el grafo, el callback de estado, el callback de selección y el cierre. Debe mostrar:

- Código, nombre, año y cuatrimestre.
- Disponibilidad y requisitos faltantes.
- `StatusControl` con el estado actual.
- Lista de correlativas requeridas con tipo de exigencia y estado actual.
- Lista de materias que habilita, seleccionables.
- Estado vacío con instrucciones si no hay selección.

- [ ] **Step 2: Implementar la vista**

`CorrelationGraphView`:

- Construye grafo y layout con `useMemo`.
- Mantiene `selectedId`.
- Deriva nodo seleccionado y conjunto resaltado.
- Renderiza mapa y panel con orden responsive.
- Pasa el cambio de estado al callback existente.

- [ ] **Step 3: Integrar el selector**

En `StudyDashboard`:

- Agregar estado `view: "table" | "graph"` con Tablero por defecto.
- Agregar selector accesible **Tablero / Grafo**.
- Mantener encabezado, acciones y error de guardado en ambas vistas.
- Renderizar `CorrelationGraphView` cuando corresponda.

- [ ] **Step 4: Verificar**

Run: `npm run check`

Verificar manualmente:

- Selección y resaltado.
- Cambio de estado desde el panel y reflejo en la tabla.
- Teclado: Tab, Enter/Espacio, Escape.
- Desktop 1440 y mobile 390.
- Plan sin correlativas.
- Consola sin errores.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/graph-detail-panel.tsx src/components/dashboard/correlation-graph-view.tsx src/components/dashboard/study-dashboard.tsx
git commit -m "feat: add graph details and dashboard view"
```

---

### Task 5: Documentación y cierre

**Files:**
- Modify: `README.md`
- Modify: `docs/DEVELOPMENT.md`

- [ ] **Step 1: Actualizar documentación**

- Marcar Etapa 5 como completada.
- Agregar el grafo a la intro y a las funcionalidades.
- Documentar estructura, layout, tipos de arista, accesibilidad y límites.
- Mantener el aviso de Etapa 6 pendiente.

- [ ] **Step 2: Verificación final**

Run:

```bash
npm run check
npm run build
```

Expected: lint, typecheck y todos los tests pasan; build estático de Next.js completa.

- [ ] **Step 3: Revisar estado**

Run: `git status --short --branch`

Expected: árbol limpio después del commit.

- [ ] **Step 4: Commit**

```bash
git add README.md docs/DEVELOPMENT.md
git commit -m "docs: document correlation graph"
```

# Planificador de Correlativas

Herramienta para estudiantes universitarios que permite cargar el plan de estudios de una carrera, registrar el estado de cada materia y saber automáticamente cuáles se pueden cursar, cuáles están bloqueadas y cuánto progreso se lleva.

El problema que resuelve es concreto: las correlativas suelen consultarse en PDFs, planillas o el sistema de la facultad, y es fácil equivocarse al planificar el cuatrimestre. Este proyecto centraliza esa información y explica **qué requisito falta** cuando una materia está bloqueada.

> **Estado actual:** Etapa 1 completada (tipos, lógica pura y tests). Todavía no hay interfaz de usuario; la aplicación muestra una página mínima. La importación de planes, la edición y las vistas llegan en las próximas etapas.

## Stack

- [Next.js 16](https://nextjs.org/) con App Router
- TypeScript en modo estricto
- Tailwind CSS 4
- [Vitest 5](https://vitest.dev/) para tests unitarios
- `localStorage` como persistencia (sin backend en el MVP)

## Requisitos

- Node.js 24 LTS (probado con 24.12)
- npm

## Cómo correrlo

```bash
npm install
npm run dev
```

La aplicación queda disponible en [http://localhost:3000](http://localhost:3000).

Para probar la lógica de la Etapa 1:

```bash
npm test
```

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera el build de producción |
| `npm start` | Sirve el build de producción |
| `npm run lint` | Corre ESLint |
| `npm run typecheck` | Verifica los tipos con `tsc --noEmit` |
| `npm test` | Corre los tests una vez |
| `npm run test:watch` | Corre los tests en modo watch |
| `npm run check` | Ejecuta lint, typecheck y tests |

## Modelo de datos

Un plan de estudios se representa con este JSON:

```json
{
  "career": "Licenciatura en Sistemas",
  "university": "Universidad Nacional de Ejemplo",
  "planYear": 2024,
  "subjects": [
    {
      "id": "intro",
      "name": "Introducción a la Programación",
      "year": 1,
      "term": "1",
      "requiresRegularized": [],
      "requiresApproved": []
    },
    {
      "id": "algorithms",
      "name": "Algoritmos y Estructuras de Datos",
      "year": 2,
      "term": "1",
      "requiresRegularized": ["intro"],
      "requiresApproved": []
    },
    {
      "id": "databases",
      "name": "Bases de Datos",
      "year": 2,
      "term": "2",
      "requiresRegularized": ["algorithms"],
      "requiresApproved": ["intro"]
    }
  ]
}
```

- `id`: identificador único de la materia.
- `year`: año de la carrera al que pertenece.
- `term`: `"1"`, `"2"` o `"annual"` (opcional).
- `requiresRegularized`: ids que deben estar **cursados** (regulares) o aprobados.
- `requiresApproved`: ids que deben estar **aprobados con final**.

### Estados de una materia

| Estado | Significado |
| --- | --- |
| `pending` | Pendiente |
| `in_progress` | Cursando |
| `regularized` | Cursada aprobada, final pendiente |
| `approved` | Final aprobado o materia promocionada |

Una materia está **disponible** cuando todos sus requisitos se cumplen. Si no, está **bloqueada** y la lógica devuelve cada faltante con el estado requerido y el estado actual de la correlativa.

## Lógica implementada

Todo vive en `src/lib/study-plan/` y está desacoplado de React y del almacenamiento:

- `getSubjectAvailability(subject, progress)`: devuelve `available` o `blocked` junto con los requisitos faltantes.
- `getProgressSummary(plan, progress)`: calcula total, aprobadas, restantes, porcentaje y conteo por estado.
- `validateStudyPlan(plan)`: detecta correlativas inexistentes, ids duplicados y ciclos de dependencia.

La jerarquía de estados es `pending < in_progress < regularized < approved`. Una materia regularizada satisface requisitos de cursada; solo una aprobada satisface requisitos de final.

### Tests

Los tests cubren los casos centrales:

- Materias sin correlativas y con correlativas regularizadas o aprobadas.
- Bloqueos por cursada y por final, incluyendo múltiples faltantes.
- Progreso con planes vacíos, estados mixtos, redondeo e ids ajenos al plan.
- Correlativas inexistentes, ids duplicados, ciclos de uno, dos y tres nodos.

Actualmente son **23 tests** y se ejecutan con `npm test`.

## Estructura

```text
src/
  app/                     # App Router de Next.js
  lib/
    study-plan/
      types.ts             # Tipos del dominio
      status.ts            # Jerarquía y resolución de estados
      availability.ts      # Disponibilidad de materias
      progress.ts          # Resumen de progreso
      validation.ts        # Validación de planes
      index.ts             # API pública del módulo
```

Los tests están colocados junto a cada módulo (`*.test.ts`).

## Decisiones técnicas

- **Lógica pura y aislada:** las reglas de negocio no dependen de React, del navegador ni de `localStorage`. Eso las hace fáciles de testear y de reutilizar en la UI.
- **Uniones discriminadas:** la disponibilidad se modela como `available | blocked`, así TypeScript obliga a manejar los faltantes solo cuando existen.
- **Tipado estricto:** `strict` y `noUncheckedIndexedAccess` habilitados, sin `any`.
- **Sin sobreingeniería:** no hay backend, base de datos ni estado global en esta etapa. La persistencia será `localStorage`.
- **Validación en dos capas:** la estructura del JSON se validará con Zod (Etapa 2) y la integridad de las correlativas ya se valida con lógica propia.

## Roadmap

- [x] **Etapa 1:** tipos, disponibilidad, progreso, validación y tests.
- [ ] **Etapa 2:** importar el plan desde JSON con Zod y plan de ejemplo.
- [ ] **Etapa 3:** lista de materias por año, estados y barra de progreso.
- [ ] **Etapa 4:** edición manual del plan y exportación.
- [ ] **Etapa 5:** grafo interactivo de correlativas.
- [ ] **Etapa 6:** importación desde PDF con pantalla de revisión.
- [ ] CI con GitHub Actions y deploy en Vercel.
